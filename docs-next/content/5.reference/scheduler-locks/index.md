---
title: Scheduler & Locks (API)
description: Scheduling recurring work and distributed locks
navigation:
  icon: i-lucide-calendar-clock
---

# Scheduler & Locks API Reference

Reference for cron-like scheduling and distributed locks primitives.

The scheduler coordinates recurring and deferred work while the lock subsystem ensures only one worker (across a cluster) performs a mutually exclusive task at a time. This section describes the execution model, cron grammar, lock semantics, error / retry policies, and extension points so you can safely introduce new periodic jobs without duplicating effort or creating race conditions.

## Architecture (Conceptual)
| Component | Responsibility | Notes |
|-----------|----------------|-------|
| Schedule Registry | Holds in‑memory canonical list of schedules (expression + job class + options) | Built at boot from code/config; should be immutable at runtime (future hot‑reload optional) |
| Tick Loop | Wakes each interval (e.g. 1s) to evaluate which jobs are due | Uses monotonic + wall clock (for drift detection) |
| Due Evaluator | Parses cron & compares next run timestamp | Supports per‑schedule timezone & optional jitter |
| Dispatcher | Enqueues job (queue) OR runs inline based on configuration | Respects `use_queue_for_all_jobs` flag |
| Lock Manager | Provides distributed mutual exclusion for jobs flagged as exclusive | Backed by Redis / DB / filesystem driver |
| Metrics & Logger | Emits execution timing, lock contention, failure counts | Integrate with observability pipeline |

## Scheduling Model
Schedules are defined declaratively (recommended) or programmatically. Each schedule consists of:
1. Cron expression (seconds optional) or fixed interval shortcut.
2. Job class (invokable or handle() method).
3. Options: timezone, jitter (ms or %), max runtime (timeout), lock key, queue, max concurrent, enabled flag.

### Cron Expression Support
Standard 5-field format: `minute hour day-of-month month day-of-week` (optionally a leading seconds field). Wildcards `*`, ranges `1-5`, lists `1,2,7`, steps `*/5` supported. Day-of-week: `0-6` (Sun=0) or names (`MON`).

Examples:
| Expression | Meaning |
|------------|---------|
| `*/2 * * * *` | Every 2 minutes |
| `0 */6 * * *` | Every 6 hours on the hour |
| `15 2 * * *` | 02:15 daily |
| `0 0 * * 1` | Weekly (Mondays at 00:00) |
| `0 0 1 * *` | First day of month (midnight) |

### Jitter
Add controlled randomness to reduce thundering herds. If `jitter=30s` a schedule due at 00:00 executes anywhere in `[00:00,00:00+30s]`. Apply jitter only to non user-visible maintenance tasks.

### Misfire Handling
If the scheduler was down past a schedule time, two strategies:
| Strategy | Behavior |
|----------|----------|
| Catch Up | Execute immediately (possibly multiple sequential runs) |
| Skip | Schedule shifts to next future time (default) |

## Job Lifecycle
1. Evaluate schedule: is (next_run <= now)?
2. (Optional) Acquire lock (exclusive jobs)
3. Dispatch / execute job (respect timeout)
4. Emit metrics + structured log (duration, success/failure, attempts)
5. Release / refresh lock (if lease based)
6. Compute next_run and persist in memory (or storage if persistent)

Failure path: record error, increment failure counter, evaluate retry policy (exponential backoff or fixed delay) then schedule a re-run or mark as dead-letter.

## Distributed Locks
Locks prevent simultaneous execution across workers.

Characteristics:
| Aspect | Detail |
|--------|--------|
| Scope | String key (e.g. `job:cache_maintenance`) |
| Type | Lease (TTL) — auto-expires to avoid permanent deadlock |
| Reentrancy | Default non-reentrant (same worker must refresh, not reacquire) |
| Refresh | Long-running jobs should refresh midpoint of TTL |
| Contention | Immediate fail (fast path) vs optional wait with backoff |

Recommended key format: `lock:<namespace>:<job>` where namespace groups similar concerns (`jobs`, `migrations`, `reports`).

### Helper Pattern
```php
$lock = $lockManager->acquire('lock:jobs:cache_maintenance', ttl: 120);
if (!$lock) { return; } // Another worker active
try {
  (new CacheMaintenanceJob())();
} finally {
  $lock->release();
}
```

## Concurrency Controls
Two layers:
1. Global: `max_concurrent_jobs` limits simultaneously executing scheduled tasks.
2. Per-job: `max_concurrent=1` enforced via lock or internal counter (even if queue based, a consumer check can guard).

## Idempotency & Safety
Design jobs to be restart-safe. Strategies:
- Use upsert / merge DB operations.
- Write to temp locations then atomic rename.
- Track last processed checkpoint (e.g. high-water mark) in a durable store.

## Retry & Backoff
Use exponential backoff with cap: 1m, 2m, 5m, 10m, 20m, 30m then give up or move to a failure topic/queue. Never infinite-loop a broken job; emit alert after threshold.

## Configuration Guidance
Draft keys (see table below after generation):
- `scheduler.settings.enabled`: Master switch (disable in ephemeral CLI containers).
- `scheduler.settings.default_timeout`: Hard kill guard; align with average job * 3x.
- `scheduler.settings.use_queue_for_all_jobs`: Set true in multi-node clusters to centralize execution & metrics.
- `locks.default_driver`: Choose highest availability + low latency (Redis > DB > Filesystem).

## Observability
Emit metrics:
| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `job_duration_seconds` | histogram | job, outcome | Execution latency |
| `job_lock_wait_ms` | histogram | job | Time waiting to obtain lock |
| `job_missed_total` | counter | job, reason | Missed schedule occurrences |
| `job_retries_total` | counter | job | Retry attempts |

Structured log fields: `job`, `scheduled_at`, `started_at`, `duration_ms`, `attempt`, `outcome`, `lock_acquired`.

Tracing: one span per job with attributes: `job.name`, `job.lock.wait_ms`, `job.retry.count`.

## Performance Practices
| Concern | Mitigation |
|---------|-----------|
| Many schedules | Pre-parse & cache cron objects at boot |
| Clock drift | Periodically compare monotonic vs wall clock, log if > threshold |
| Lock contention | Add jitter or split monolithic job into shards |
| Long critical sections | Narrow lock scope or chunk work |

## Extension Points
| Extension | Contract (Indicative) | Notes |
|-----------|-----------------------|-------|
| Custom Lock Driver | `acquire(key, ttl): Lock|null`, `release(lock)`, `refresh(lock, ttl)` | Must guarantee atomic acquire semantics |
| Schedule Decorator | Wrap evaluation to inject dynamic enable/disable logic | Feature flags or maintenance windows |
| Job Wrapper | Pre/post hooks around execution | Add correlation IDs, secret injection |

## Security & Hardening
- Treat job code as privileged: restrict secrets to the narrowest environment scope.
- Avoid embedding sensitive data in lock keys (they may appear in logs).
- Cap job runtime; abort stuck tasks to free locks.
- Validate any external resource addresses before use (e.g., backup destinations).

## Example: Declaring a Scheduled & Locked Job
```php
// Pseudocode registration (boot time)
$scheduler->add(
  expression: '0 * * * *', // hourly
  job: CacheMaintenanceJob::class,
  options: [
    'lock' => 'lock:jobs:cache_maintenance',
    'timeout' => 300,
    'jitter' => '30s',
    'queue' => 'scheduled',
    'max_concurrent' => 1,
  ]
);
```

## Failure Scenarios
| Scenario | Result | Mitigation |
|----------|--------|------------|
| Lock not acquired | Job skipped | Log at debug; metric increment |
| Job timeout | Force stop / mark failed | Tune timeout; split job |
| Repeated failures | Alert & backoff | Add circuit breaker |
| Scheduler outage | Missed runs | Decide skip vs catch-up strategy |

## Related Concepts
See: Queue Processing, Observability, Performance Principles.

<!-- scheduler-locks:index:start -->
### Summary

| Area | Count |
|------|-------|
| Schedules | 5 |
| Job Classes | 9 |
| Lock Implementations | 3 |

### Detected Job Classes
| Class |
|-------|
|Glueful\Queue\Jobs\CacheMaintenanceJob|
|Glueful\Queue\Jobs\DatabaseBackupJob|
|Glueful\Queue\Jobs\DatabaseJob|
|Glueful\Queue\Jobs\LogCleanupJob|
|Glueful\Queue\Jobs\NotificationRetryJob|
|Glueful\Queue\Jobs\QueueMaintenance|
|Glueful\Queue\Jobs\RedisJob|
|Glueful\Queue\Jobs\SendNotification|
|Glueful\Queue\Jobs\SessionCleanupJob|

### Configuration Keys (Planned)
| Key | Default | Description |
|-----|---------|-------------|
|scheduler.settings.enabled|1|Scheduler/lock configuration|
|scheduler.settings.max_concurrent_jobs|5|Scheduler/lock configuration|
|scheduler.settings.default_timeout|300|Scheduler/lock configuration|
|scheduler.settings.default_queue|scheduled|Scheduler/lock configuration|
|scheduler.settings.log_execution|1|Scheduler/lock configuration|
|scheduler.settings.notification_on_failure||Scheduler/lock configuration|
|scheduler.settings.queue_connection|default|Scheduler/lock configuration|
|scheduler.settings.use_queue_for_all_jobs|1|Scheduler/lock configuration|
|locks.default_driver|(n/a)|Scheduler/lock configuration|

<!-- scheduler-locks:index:end -->

## Overview
Scheduling philosophy & lock semantics.

## Core Types
| Symbol | Kind | Summary | Notes |
|--------|------|---------|-------|

## API Surface
### Creation
Defining scheduled tasks.
### Usage
Executing, monitoring schedules.
### Extension Points
Custom lock drivers, schedule decorators.

## Configuration
| Key | Type | Default | Description |
|-----|------|---------|-------------|

## Examples
Cron expression, locked task.

## Error Conditions
Lock acquisition failure, missed schedule.

## Observability & Metrics
Task runtime, lock contention metrics.

## Performance Notes
Lock scope minimization, schedule batching.

## Related
Concepts: Backpressure & Rate Limiting, Performance Principles.
