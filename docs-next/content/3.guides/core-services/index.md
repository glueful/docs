---
title: Core Services
description: Caching, queues, events, notifications, uploads, scheduling, and locks
navigation:
  icon: i-lucide-layers
---
# Core Services

Glueful's core services power resilience, throughput, and operational visibility: caching, queues & jobs, events, notifications, storage & uploads, scheduling, and distributed locks. Use these guides when moving work off the request path, coordinating recurring tasks, or guarding critical sections.

## Core Topics

| Topic | What You Learn | When to Read |
|-------|----------------|--------------|
| [Caching Fundamentals](/guides/core-services/caching) | Read‑through / write‑through, stampede protection, tagging | Reducing repeated cost or latency |
| [Queues & Jobs](/guides/core-services/queues-and-jobs) | Dispatching, retries, workers, monitoring | Offloading slow or parallelizable work |
| [Events & Listeners](/guides/core-services/events-and-listeners) | Emitting domain events, listener design | Decoupling side effects from core logic |
| [Notifications (Extension)](/guides/core-services/notifications) | Channel abstraction, retry strategy | Multi-channel user / system messaging |
| [Storage & Uploads](/guides/core-services/uploads-and-storage) | Filesystems, streaming, image processing | Handling binary payloads efficiently |
| [Scheduling](/guides/core-services/scheduling) | Cron expressions, queued vs inline execution | Periodic maintenance and orchestrations |
| [Distributed Locks](/guides/core-services/distributed-locks) | Critical section control, idempotency tokens | Preventing race conditions / duplicates |
| [Observability Integration](/guides/core-services/observability) | Structured logs, correlation, metrics hooks | Tracing behavior & diagnosing latency |

> Tip: Start with queues, cache, and logging—then layer events and scheduling as growth introduces coordination and latency concerns.

## Quick Starts

### Cache (Basic Pattern)
```php
use Glueful\Cache\CacheFactory;

$cache = CacheFactory::create(); // Creates the configured default store
$user = $cache->remember('user:'.$id, function() use ($repo, $id) {
  return $repo->find($id);      // Fetched only on miss; result cached 600s
}, 600);
```

### Dispatching a Job
```php
use App\Jobs\SendWelcomeEmailJob;
use Glueful\Queue\QueueManager;

$queue = service(QueueManager::class); // or inject QueueManager
$queue->push(new SendWelcomeEmailJob($userId));
```

### Emitting an Event
```php
use Glueful\Events\Event;
use App\Events\UserRegisteredEvent;

Event::dispatch(new UserRegisteredEvent($userId));
```

### Acquiring a Lock
```php
use Glueful\Lock\LockManager;

$lockManager = service(LockManager::class); // or inject
$lock = $lockManager->createLock('rebuild-search-index', 300); // 300s TTL
if ($lock->acquire()) {
  try {
    $this->rebuild();
  } finally {
    $lock->release();
  }
}
```

### Scheduling (Excerpt from `config/schedule.php`)
```php
[
  'name' => 'database_backup',
  'schedule' => '0 2 * * *',
  'handler_class' => 'Glueful\\Queue\\Jobs\\DatabaseBackupJob',
  'queue' => 'critical',
  'retry_attempts' => 1,
]
```

## Configuration Snapshot

| Concern | Key Settings | Notes |
|---------|--------------|-------|
| Cache | `default`, `stores.*`, `stampede_protection.*`, `edge.*` | Early expiration + tagging support; distributed replication options |
| Queue | `connections.*`, `failed.*`, `workers.process.*`, `workers.auto_scaling.*`, `monitoring.alert_rules` | Multi-driver (sync, database, redis); built-in monitoring & scaling knobs |
| Scheduler | `jobs[]`, `settings.*`, `queue_mapping.*` | Jobs can enqueue onto distinct queues with retry + timeout |
| Locks | `stores.*`, `retry.*`, `ttl` | Drivers: file, redis, database; pluggable contention strategy |
| Observability | logging channels, metrics/tracing hooks | Centralize log format & correlation IDs |
| Notifications | (extension) channel config | Provide email/webhook patterns |

## Patterns & Best Practices

| Pattern | Applies To | Benefit |
|---------|-----------|---------|
| Idempotency Keys | Jobs, Scheduler, HTTP mutations | Prevent duplicate side effects |
| Backoff & Retry | Jobs, cache rebuild, lock acquisition | Smoother recovery from transient faults |
| Correlation IDs | Events, jobs, logs | Trace a request across async boundaries |
| Bulk / Batch | Queue batching, cache priming | Higher throughput, fewer round trips |
| Lock Scoping | Distributed locks | Reduce contention & improve fairness |

## Troubleshooting

| Symptom | Likely Cause | Where to Look |
|---------|--------------|---------------|
| Cache misses unexpectedly | Prefix / environment mismatch | `CACHE_PREFIX`, store selection |
| Jobs never run | Worker process not started or queue mismatch | Queue connection + worker logs |
| Scheduler job skipped | `enabled` false or cron expression invalid | `config/schedule.php` job entry |
| Lock acquisition starvation | Short TTL + high contention | Adjust `retry.delay` / use redis store |
| Event listener not firing | Listener registration missing | Event service provider / listener map |

## Next Steps

Start with caching or queues if you're addressing latency or throughput. Explore locks or scheduling once coordination needs emerge. Events & notifications help decouple side effects; observability threads through all of them.

---

**Summary:** Core services layer gives you the primitives to externalize latency, coordinate workloads, and instrument behavior—adopt incrementally based on actual bottlenecks.
