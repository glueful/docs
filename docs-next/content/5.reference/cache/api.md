---
title: Cache API
description: Set, get, invalidate, and tag operations
---

# Cache API

Reference for common cache operations and tagging.

This page focuses on the day‑to‑day developer surface: how to read, write, compute, group, and invalidate cached values safely. For store selection, stampede protection, and advanced topology see the main Cache Reference page.

## Philosophy
Keep cache usage boring, explicit, and observable:
1. Explicit keys & TTLs – no magic inference.
2. Computation closures are side‑effect free where possible (pure functions improve predictability under retries).
3. Tag scopes model domain aggregates; avoid user‑level tags for high-cardinality domains.
4. Invalidation strategies are documented alongside write paths (treat as part of domain model).

## Quick Decision Table
| Need | Recommended API | Notes |
|------|-----------------|-------|
| Simple get | `get` | Returns null if missing |
| Get with fallback compute | `remember` | Closure invoked only on miss |
| Always recompute but cache result | `set` | When upstream value already available |
| Group items for bulk invalidation | `tags([...])` | Only on tag-capable stores |
| Increment counters | `increment` / `decrement` | Prefer for metrics-like tallies |
| Critical section (single writer) | `lock()->block()` | Release is automatic after callback |
| Permanent (versioned) artifact | `rememberForever` + versioned key | Ensure version bump on representation change |

## Key Versioning Pattern
When structure or semantics of a cached value change, bump a version token in the key rather than flushing entire caches:
```
$v = 2; // increment when payload shape changes
$profile = cache()->remember("user:profile:v{$v}:{$userId}", 900, fn() => $repo->hydrate($userId));
```
Old keys expire naturally; no global flush required.

## Tagging Primer
Tags let you relate multiple keys without embedding reverse indexes. Typical pattern after an update event:
```
$product = $products->update($id, $data);
cache()->tags(['product:'.$id])->flush(); // clears only product-scoped keys
```
You should tag consistently at write time; tagging only at read time has no effect.

## Locking Use Case
Use cache locks to serialize rebuilds of expensive aggregates:
```
cache()->lock('reports:daily', ttl:60)
	->block(5, function () use ($reports) {
		return $reports->recomputeDaily();
	});
```
If another process holds the lock beyond the 5s wait window, an exception (or null depending on implementation) allows a graceful fallback (serve stale data or skip recompute).

<!-- cache-api:reference:start -->

## Common Operations

| Operation | Example |
|-----------|---------|
| Get value (null if missing) | `cache()->get('key');` |
| Get with default | `cache()->get('key', fn() => compute());` |
| Set value with TTL seconds | `cache()->set('key', 'value', 300);` |
| Remember (compute + store) | `cache()->remember('k', 600, fn() => heavy());` |
| Delete item | `cache()->delete('key');` |
| Increment / Decrement | `cache()->increment('counter'); // decrement()` |
| Tag grouping (store must support tags) | `cache()->tags(['a','b'])->set('k','v');` |
| Flush tag group | `cache()->tags('group')->flush();` |
| Lock (critical section) | `cache()->lock('resource', ttl:10)->block(5, fn() => doThing());` |

## Notes

- Time-to-live (TTL) may be integer seconds or DateInterval depending on driver.
- Tag flushing only affects items written with those tags.
- Locks should always be released automatically when callback finishes.
- Distributed/edge modes may impose consistency trade-offs (see main cache reference).

<!-- cache-api:reference:end -->

## Advanced Patterns
### Conditional Caching
Skip caching trivial or low-cost computations:
```
$data = expensive();
if (count($data) > 0) {
	cache()->set('report:nonempty', $data, 300);
}
```

### Partial Aggregation
Cache sub-fragments individually, then compose:
```
$a = cache()->remember('frag:a', 120, fn() => partA());
$b = cache()->remember('frag:b', 120, fn() => partB());
return combine($a, $b);
```

### Soft Expiry (Manual)
Serve slightly stale data while triggering async refresh:
```
$payload = cache()->get('dashboard:v1');
if (!$payload || $payload['expires_at'] < time()) {
	dispatch(RefreshDashboardJob::class);
}
return $payload['data'] ?? minimalFallback();
```

## Error Handling Guidelines
| Scenario | Strategy |
|----------|----------|
| Backend timeout | Short-circuit & log; never block request path excessively |
| Serialization failure | Skip store, log key & type, fallback compute |
| Lock acquisition failure | Serve stale or indicate busy state |
| Tag flush on non-tag store | Throw early (development) / degrade with warning (production) |

## Metrics Cheat Sheet
Track ratios, not just absolutes:
| Derived Metric | Formula | Insight |
|----------------|---------|--------|
| Hit Ratio | hits / (hits + misses) | Overall cache effectiveness |
| Stampede Avoidance % | prevented / (prevented + recomputes) | Lock strategy effectiveness |
| Avg Fill Time | sum(fill_duration_ms)/fills | Cost to recompute values |

Alert on: sustained hit ratio drop, fill time spikes, error rate > threshold, eviction surges.

## Anti-Patterns (API Level)
- Using `rememberForever` without a version token.
- Catch-all global `flush()` as part of routine operations.
- Storing deeply nested large arrays when selective sub-key caching is possible.
- Overusing locks for lightweight computations (adds latency contention).

## Checklist
| Question | Yes/No |
|----------|--------|
| Key has version token (if long-lived)? |  |
| TTL chosen relative to data volatility? |  |
| Invalidation path documented (tags or targeted delete)? |  |
| Metrics in place (hit/miss, fill duration)? |  |
| Error fallbacks defined for backend outage? |  |

## Related
See `cache/index.md` for architecture, stores, topology, stampede protection, and distributed notes.

