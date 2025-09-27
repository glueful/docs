---
title: Jobs
description: Job structure, lifecycle, retries, backoff, batching, idempotency, and failure handling
---

# Jobs

Jobs encapsulate discrete units of work executed asynchronously by queue workers. This page covers authoring, dispatching, lifecycle events, retries, failure handling, batching, idempotency, performance, and testing strategies.

> See also: [Drivers](./drivers.md) • [Queues Reference](../queues/index.md)

## 1. Anatomy of a Job
A typical job class (convention: `App\Jobs\*`) exposes:

```php
class SendWelcomeEmail implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels; // example traits

    public function __construct(public int $userId) {}

    public int $tries = 3;          // Max attempts before failing
    public int $backoff = 60;       // Seconds (or method backoff())
    public int $timeout = 120;      // Hard process timeout
    public bool $deleteWhenMissingModels = true; // Skip retry if model gone

    public function handle(Mailer $mailer, UserRepository $users): void
    {
        $user = $users->find($this->userId);
        if (!$user) { return; }
        $mailer->to($user->email)->send(/* ... */);
    }

    public function failed(\Throwable $e): void
    {
        // Custom failure hook (fires after final attempt)
        audit('email.failed', [ 'user' => $this->userId, 'error' => $e->getMessage() ]);
    }
}
```

Key elements:
- Public scalar constructor args become serialized payload.
- Lifecycle hooks: `handle`, optional `failed`.
- Control attributes: attempts (`$tries`), `backoff`, `timeout` (maps to worker limits).

## 2. Dispatching
Basic dispatch:
```php
SendWelcomeEmail::dispatch($userId);
```
Alternate connection / queue:
```php
SendWelcomeEmail::dispatch($userId)
    ->onConnection('redis')
    ->onQueue('emails')
    ->delay(now()->addMinutes(5));
```
Synchronous (testing) execution via sync driver or forcing inline execution pattern.

## 3. Lifecycle
1. Dispatch: payload serialized & pushed to backend.
2. Reservation: worker atomically pops & marks job reserved.
3. Execution: framework resolves dependencies (container) & calls `handle`.
4. Success: job deleted / acknowledged.
5. Failure: exception thrown.
   - If attempts < max, released back with computed delay.
   - Else moved to failed store & `failed()` hook invoked.

Visibility / retry timing influenced by driver (`retry_after` for DB, reserved TTL for Redis).

## 4. Retry & Backoff Strategies
Configure either scalar `$backoff` (seconds) or a method:
```php
public function backoff(): array { return [60, 300, 900]; }
```
Supported patterns (recommendations):
- Linear: constant delay (quick transient recovery) 
- Exponential: base^attempt (avoid thundering herd) 
- Jitter: add randomness for large fan‑out

Use alert rules (e.g., `high_failure_rate`) to detect pathological retry storms—consider circuit breakers.

## 5. Idempotency
Jobs must tolerate duplicate delivery (worker crash after reserve). Strategies:
- Check & set idempotency keys in cache / DB.
- Upsert instead of insert.
- Use natural uniqueness (e.g., unique index constraints) + swallow duplicate errors.

If side effects are external (email, webhook), store a send log keyed by business identifier + action.

## 6. Serialization & Payload Size
Keep payloads small: store only identifiers, not large blobs. Retrieve heavy data inside `handle()`. Avoid closures and large nested objects that complicate serialization. For encrypted or sensitive fields, rely on forthcoming encryption hooks (see Security).

## 7. Batching
Batching groups related jobs for progress tracking & coordinated completion logic.
Pattern (illustrative):
```php
$batch = Queue::batch([
    new ImportChunk($chunk1),
    new ImportChunk($chunk2),
])->name('DailyImport')->dispatch();
```
Batch hooks: `then`, `catch`, `finally` (pseudo). Use batching for large import pipelines; avoid massive single batches (>10k) — segment to reduce failure blast radius.

## 8. Concurrency & Resource Limits
Worker pool constraints (see reference) enforce:
- Per-queue `max_workers`, `memory_limit`, `timeout`.
- Global `max_workers_global`.
Tune using metrics: start conservative (few workers) then scale using `auto_scaling` thresholds.

## 9. Performance Optimizations
| Concern | Technique |
| ------- | --------- |
| High enqueue latency | Switch to Redis driver; enable connection pooling |
| Slow job throughput | Increase workers; tune scaling thresholds |
| Large payload overhead | Use batching / chunk identifiers |
| Hot key contention (DB) | Shard queues or migrate to Redis |
| Frequent transient failures | Implement exponential backoff + jitter |

## 10. Failure Handling
Implement domain‑specific `failed()` to log or notify. Central alerting will surface spikes via `failure_rate_above`. Provide rich context: job id, connection, queue, attempt, root cause. Consider deduplicating noisy failures.

## 11. Security & Compliance
- Avoid embedding secrets in payloads (use vault references / IDs).
- For PII, store only IDs; fetch secure fields inside `handle`.
- Future: encryption settings (`security.encryption`). Plan for rotating keys — design payload versioning.

## 12. Testing Jobs
Unit style:
```php
$job = new SendWelcomeEmail($userId);
$job->handle($mailer, $users);
```
Integration (queue interaction):
```php
Queue::fake();
SendWelcomeEmail::dispatch($userId);
Queue::assertPushed(SendWelcomeEmail::class, 1);
```
Use sync driver in CI for deterministic runs unless exercising concurrency semantics.

## 13. Observability
Emit metrics/events inside `handle` only for business outcomes (avoid noise). Rely on built‑in monitoring for system metrics (queue size, processing time). Use structured logging: include job class, queue, attempt.

## 14. Versioning Jobs
When changing payload shape:
- Introduce new class name (e.g., `SendWelcomeEmailV2`) if breaking.
- Maintain backward compatibility with optional parameters & defaults if possible.
- Implement migration path (dispatch both old & new) until backlog drains.

## 15. Advanced Patterns
- Saga / orchestration: chain jobs, persist state machine progress.
- Fan‑out / map‑reduce: dispatch N partition jobs then a consolidation job after completion signals.
- Rate limiting: implement token bucket around dispatch (or central service) before queue push.

## 16. Checklist Before Deploying a New Job
- Idempotent side effects
- Proper backoff strategy chosen
- Payload minimal and serializable
- Alerts exist for critical failures
- Test coverage for success & failure path
- No secrets / PII in serialized data

## 17. Cross‑Links
- Driver capabilities: [Drivers](./drivers.md)
- System configuration & metrics: [Queues Reference](../queues/index.md)

## Summary
Design jobs as small, idempotent, observable units with explicit retry and failure strategies. Let monitoring signal scaling needs; optimize only after measuring.
