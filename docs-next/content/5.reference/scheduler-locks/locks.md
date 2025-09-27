---
title: Locks API
description: Acquire and manage distributed locks
---

# Locks API

Reference for acquiring, renewing, and releasing locks.

Distributed locks coordinate mutually exclusive work across multiple processes or nodes. This reference covers lock semantics, lease management (renewal), contention strategies, observability, and safe usage patterns so you avoid deadlocks, starvation, or accidental concurrent execution.

## Purpose & Scope
Use a distributed lock when exactly one worker must execute a critical section at a time (e.g. cache compaction, report generation, migration batches). Do NOT use locks for per-request data integrity already handled by the database (row / transactional locking), nor for unbounded user-facing latency paths unless absolutely required.

## Core Concepts
| Concept | Description | Notes |
|---------|-------------|-------|
| Key | Unique identifier of protected resource / action | Stable, namespaced, lower snake |
| Lease (TTL) | Expiration duration after which lock auto-frees | Prevents orphaned locks if holder dies |
| Store | Backend implementing atomic acquire/refresh/release | File, Redis, Database provided |
| Token | Opaque value returned on acquire proving ownership | Required for safe release / renewal |
| Renewal | Extending lease before TTL elapses | Needed for long-running jobs |
| Contention Policy | Behavior when lock not available | Fail fast, wait w/ backoff, queue |

## Lock Lifecycle
1. Acquire (atomic create-if-absent) -> returns (owned? token : null)
2. Hold (perform critical work)
3. Optionally renew (refresh TTL mid-lease for long tasks)
4. Release (delete key if token matches)
5. Expire (safety fallback if holder died)

## Acquisition Modes
| Mode | Behavior | Use Case |
|------|----------|----------|
| Try (non-blocking) | Attempt once, return immediately | Scheduled jobs; skip if busy |
| Timed Wait | Poll/backoff until acquired or timeout | Administrative tasks needing eventual run |
| Blocking Queue (future) | Central queue grants ownership | High contention coordination |

Example (timed wait w/ exponential backoff pseudo):
```php
$deadline = microtime(true) + 5; // wait up to 5s
$sleep = 0.05;
while (microtime(true) < $deadline) {
    $lock = lock()->acquire('lock:jobs:report_daily', ttl: 120);
    if ($lock->acquired()) { break; }
    usleep((int)($sleep * 1_000_000));
    $sleep = min($sleep * 2, 0.5); // cap backoff
}
if (!$lock || !$lock->acquired()) {
    return; // or throw / log skipped
}
```

## Lease & Renewal Strategy
Heuristics:
- Set TTL ~ (expected_duration * 3) for margin.
- Renew at 50–60% of elapsed TTL.
- If renewal fails (store unreachable) decide: continue optimistically OR abort early to avoid double-execution risk (choose per job criticality).

Renew pattern:
```php
$started = microtime(true);
$ttl = 180; // 3m
$lock = lock()->acquire('lock:data:aggregation', ttl: $ttl);
while ($lock->acquired() && work_remaining()) {
    do_unit_of_work();
    if ((microtime(true) - $started) > $ttl / 2) {
        if (!$lock->refresh($ttl)) { throw new RuntimeException('Lost lock'); }
        $started = microtime(true); // reset renewal window
    }
}
$lock->release();
```

## Key Design
Format: `lock:<domain>:<action>` or `lock:<domain>:<resource>:<action>`
Examples: `lock:jobs:cache_maintenance`, `lock:report:weekly_rollup`, `lock:migrations:2025_add_index`.
Avoid embedding user IDs or secrets—locks typically appear in logs.

## Contention Strategies
| Strategy | Pros | Cons |
|----------|------|------|
| Fail Fast | Low latency | Work may be skipped more often |
| Timed Backoff | Eventually acquires | Added latency, complexity |
| Shard Keys | Parallelize | Requires deterministic partitioning |
| Sub-Tasks (chunking) | Faster turnover | Coordination overhead |

## Failure Modes & Mitigations
| Failure | Symptom | Mitigation |
|---------|---------|------------|
| Orphaned lock (no release) | Work never re-runs until TTL | Keep TTL modest, monitor stale age |
| Clock skew | Early expiry or extended holds | Prefer monotonic timers for renewal cadence |
| Lost refresh | Another worker acquires early | Design idempotent tasks; verify exclusive section assumptions |
| Thundering retry | Many workers polling | Jitter backoff, centralize scheduling |

## Best Practices
- Keep critical section minimal; move non-exclusive steps outside lock.
- Validate still primary (if needed) before committing destructive operations.
- Prefer idempotent operations so occasional overlap (edge) is safe.
- Log both acquisition success and failures with reason (busy, error).

## Security & Hardening
- Sanitize dynamic segments before forming keys (whitelist expected tokens).
- Do not leak internal topology in keys (no hostnames unless required).
- Enforce maximum TTL to avoid indefinite exclusivity from misconfiguration.

## Observability
Metrics (emit per store):
| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `lock_acquire_duration_ms` | histogram | store, outcome | Time to acquire (or fail) |
| `lock_held_seconds` | histogram | store | Hold duration until release/expiry |
| `lock_contention_total` | counter | store, key | Failed acquire attempts |
| `lock_refresh_fail_total` | counter | store, key | Failed refreshes |

Logs: include `lock.key`, `event=acquire|release|refresh|fail`, `ttl`, `elapsed_ms`, `owner_id` (if concept exists).

Tracing: span around exclusive section with attributes `lock.key`, `lock.wait_ms`, `lock.refresh.count`.

## Extension Points
Custom store contract (indicative):
```php
interface LockStore {
    public function acquire(string $key, int $ttlSeconds): ?Lock; // null if exists
    public function refresh(Lock $lock, int $ttlSeconds): bool;   // extend lease
    public function release(Lock $lock): bool;                   // only if token matches
}
```

Driver selection guidelines:
- Redis: low latency, supports atomic LUA scripts (prefer for high churn locks).
- Database: acceptable for low frequency jobs; watch for table contention & cleanup expired rows.
- File: single-node or dev usage; not safe on distributed filesystems without advisory guarantees.

## Multi-Resource / Composite Locks
If needing atomic ownership over several related resources: order keys lexicographically, acquire sequentially; on failure release previously acquired keys (poor-man's two-phase). Prefer redesign over wide composite locks where possible.

## Helper Wrapper Example
```php
function with_lock(string $key, int $ttl, callable $fn): mixed {
    $lock = lock()->acquire($key, ttl: $ttl);
    if (!$lock->acquired()) {
        return null; // or throw
    }
    try { return $fn(); } finally { $lock->release(); }
}

with_lock('lock:jobs:sync_permissions', 120, function () {
    // exclusive sync
});
```

## When NOT To Use a Distributed Lock
- Short-lived DB row updates that can use `SELECT ... FOR UPDATE`.
- Purely CPU local calculations with no shared mutable external state.
- High-frequency per-request logic where collision cost is low (use optimistic concurrency instead).

---

<!-- scheduler-locks:locks:start -->
## Lock Stores

| Name | Driver | Class | Default | Key Prefix / Path | Extra |
|------|--------|-------|---------|-------------------|-------|
|file|file|Glueful\Lock\Store\FileLockStore|yes|framework/locks||
|redis|redis|Glueful\Lock\Store\RedisLockStore|no|glueful_lock_|ttl=300, connection=default|
|database|database|Glueful\Lock\Store\DatabaseLockStore|no||table=locks|

### Usage Pattern

Acquire a lock (auto-released on script end):

```php
$lock = lock()->acquire('resource-key', ttl: 30);
if ($lock->acquired()) {
    try {
        // critical section
    } finally {
        $lock->release();
    }
}
```

<!-- scheduler-locks:locks:end -->
