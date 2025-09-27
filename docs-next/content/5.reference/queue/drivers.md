---
title: Drivers
description: Configure and extend queue backends
---

# Queue Drivers

Queue drivers provide the transport and persistence layer for enqueued jobs. Glueful ships with several built-ins and offers an extension pattern for adding custom backends.

## Built‑in Drivers

| Driver | Use Case | Durability | Ordering | Concurrency | Notes |
| ------ | -------- | --------- | -------- | ----------- | ----- |
| `database` | Low/medium volume, simplicity | High (ACID) | FIFO per queue (approx) | Limited by DB locks | Best for small installs & local dev |
| `redis` | High throughput, latency sensitive | In‑memory w/ persistence (AOF/RDB) | FIFO per list | High | Supports delayed queues & fast pop/push |
| `sync` | Testing, synchronous execution | N/A (no persistence) | Immediate | Executes inline | Blocks caller; no retry semantics |
| `null` | Blackhole / disabling queues | None | None | None | Jobs are discarded silently |

## Configuration Overview

Configuration lives in `config/queue.php` under `connections`. Each connection entry minimally declares a `driver` plus driver‑specific keys.

### Database Driver Keys
```
'connections' => [
  'database' => [
    'driver' => 'database',
    'table' => 'queue_jobs',
    'queue' => 'default',
    'retry_after' => 90,
    'after_commit' => false,
    'failed_table' => 'queue_failed_jobs',
  ],
];
```
Key points:
- retry_after: Seconds a worker has to process a job before it can be retried.
- after_commit: Delay dispatch until surrounding DB transaction commits.
- failed_table: Separate table storing failed job metadata.

### Redis Driver Keys
```
'connections' => [
  'redis' => [
    'driver' => 'redis',
    'host' => env('REDIS_HOST', '127.0.0.1'),
    'port' => env('REDIS_PORT', 6379),
    'password' => env('REDIS_PASSWORD'),
    'database' => env('REDIS_DB', 0),
    'timeout' => env('REDIS_TIMEOUT', 5),
    'persistent' => env('REDIS_PERSISTENT', false),
    'prefix' => env('REDIS_QUEUE_PREFIX', 'glueful:queue:'),
    'queue' => env('REDIS_QUEUE', 'default'),
    'retry_after' => 90,
    'block_for' => null,
    'job_expiration' => 3600,
  ],
];
```
Highlights:
- prefix: Namespace keys for multi‑tenant or shared Redis clusters.
- job_expiration: TTL (seconds) for completed job metadata / reserved markers.
- block_for: Enable blocking pop to reduce busy looping (future optimization).

### Sync Driver
Minimal configuration; executes the job immediately inside the caller, bypassing persistence. Useful for:
- Unit tests
- Early bootstrap phases
- Fallback when queues disabled

### Null Driver
Swallows all jobs. Use only in explicit maintenance or testing scenarios where you want to assert dispatch calls without side effects.

## Choosing a Driver
Consider:
1. Throughput & latency needs
2. Operational footprint (do you already run Redis?)
3. Failure semantics (do you require transactional enqueue?)
4. Cost & complexity vs. scale

Rule of thumb:
- Start with `database` until you experience contention (queue table hotspots, slow dequeue).
- Move core workloads to `redis` when scaling beyond a few hundred jobs/minute or needing sub‑millisecond enqueue latency.
- Avoid premature optimization: instrumentation (monitoring.alert_rules) will signal when to scale.

## Multiple Connections
You can define multiple named connections and pick one per job dispatch or default to `queue.php:default`. Pattern:
```php
Queue::connection('redis')->dispatch(new GenerateReport($id));
```
This allows isolating critical workloads (e.g., high priority) into separate infrastructure.

## Failure Handling & Retry (Driver Impact)
- Database: relies on DB row visibility; stalled jobs become available after `retry_after`.
- Redis: uses reserved lists / timestamps for visibility; often lower requeue latency.
- Null/Sync: retry semantics effectively bypassed.

## Extending: Custom Driver Skeleton
Create a class in `src/Queue/Drivers/FooQueue.php`:
```php
namespace Glueful\Queue\Drivers;

use Glueful\Queue\Contracts\QueueDriver; // hypothetical interface

class FooQueue implements QueueDriver {
    public function push($job, array $options = []): string { /* ... */ }
    public function pop(?string $queue = null) { /* ... */ }
    public function later(int $delay, $job, array $options = []): string { /* ... */ }
    public function size(string $queue): int { /* ... */ }
    public function release($job, int $delay = 0): void { /* ... */ }
    public function fail($job, \Throwable $e): void { /* ... */ }
}
```
Register by adding connection config and (if needed) service provider bindings. The documentation generator auto‑discovers `*Queue.php` classes, listing status as `available` if class_exists succeeds.

### Determinism Note
Adding a new driver file updates the generated Drivers section automatically. Run:
```
composer docs:queues
```
Commit both the updated markdown and `storage/queues.json`.

## Observability Considerations
Drivers differ in metrics you can extract. Example metrics:
- queue size
- dequeue latency
- processing time distribution
- failure rate

Use alert rules tuned to the backend characteristics (Redis tends to have lower variance; DB may show lock spikes).

## Troubleshooting
| Symptom | Likely Cause | Resolution |
| ------- | ------------ | ---------- |
| Jobs stuck invisible (DB) | Long running transaction holding row locks | Enable after_commit; reduce transaction scope |
| Burst latency (Redis) | Single consumer, CPU saturated | Increase workers or enable auto scaling |
| Duplicate execution | Worker crash after reserve before ACK | Ensure idempotent jobs; tune retry_after / job_expiration |
| High failure_rate_above alerts | Logic exceptions or external dependency outages | Implement circuit breaker; add backoff strategy |

## Summary
Pick the simplest driver first. Observe, measure, then evolve the transport layer. Abstractions isolate most code from the driver choice—optimize operational characteristics only when metrics justify it.
