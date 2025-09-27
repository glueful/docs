# Cache Reference

Reference for cache stores, features, configuration strategy, and patterns for correct usage.

The caching subsystem provides layered, configurable key/value storage designed to optimize read performance, reduce database load, and enable selective invalidation. It favors correctness and observability over premature micro-optimizations while still allowing advanced patterns (tag-based invalidation, stampede protection, distributed replication) when enabled.

## Design Goals
1. Predictability: Deterministic key construction & TTL semantics—no hidden implicit expirations.
2. Composability: Simple primitives (`get`, `set`, `remember`, `tags`, `lock`) compose into higher-level abstractions in services.
3. Safety: Optional stampede protection and early recomputation windows reduce thundering herds under expiry pressure.
4. Progressive Enhancement: Start with a local persistent store (file) and graduate to Redis/Memcached or distributed clusters without code rewrites—only configuration changes.
5. Observability: Every cache interaction can emit metrics & structured logs (hit/miss ratios, fill latency, eviction reasons) to guide tuning.

## Core Concepts
| Concept | Summary | Notes |
|---------|---------|-------|
| Store | Backend implementation (file, redis, memcached, array) | Chosen per environment; swappable via config |
| Key | Canonical identifier for a value | Prefer namespacing: `domain:entity:id:field` |
| TTL | Time-to-live in seconds | Explicit; sentinel 0 = forever (when supported) |
| Tag | Logical grouping for bulk invalidation | Only for tag-capable stores (redis, memcached) |
| Stampede Protection | Early recompute window & locking | Mitigates cache stampedes on hot keys |
| Edge Cache | CDN layer hints/invalidation | Off by default; integrates with provider APIs |
| Distributed Strategy | Replication / sharding pattern | Controlled by strategy (consistent hashing) |
| Failover | Fallback when node unreachable | Retry and degrade gracefully |

## Key Construction Guidelines
Consistent keys maximize hit rate and reduce accidental collisions:
- Order components from most general → most specific.
- Avoid embedding variable text blobs—hash large payload discriminators (e.g., SHA1 of query).
- Include version tokens for schema or representation changes: `user:profile:v2:{uuid}`.
- Use lower-case snake or colon delimiters; stay consistent.

## Choosing a Store
| Situation | Recommended Store | Rationale |
|----------|------------------|-----------|
| Local dev, simplicity | file | Persistence across restarts; no external dependency |
| Ephemeral testing | array | Fast & isolated; resets per process |
| High read throughput, moderate scale | redis | Tagging, replication, richer ops |
| Large object count, low latency in multi-host | memcached | Proven memory efficiency; simple eviction policy |
| Multi-region edge hints | redis + edge | Redis for origin authority + CDN purge API |

## TTL Strategy
Set TTLs intentionally:
- Data reflecting rarely changing reference tables → long TTL (hours/days) + version token.
- Personalized or rapidly mutating data → short TTL (minutes) or event-driven invalidation.
- Avoid unbounded growth: never set infinite TTL for unbounded key sets (e.g., per-user session caches) without eviction plan.

## Stampede Protection (When Enabled)
If enabled, keys expiring enter an early recompute zone (threshold % of TTL). First recompute acquires a short lock, other contenders serve stale value briefly or wait (config: `retry_interval`, `max_wait_time`). Use for hot expensive computations only—avoid enabling globally if cost overhead isn't justified.

## Tag-Based Invalidation
Tags let you group related keys (e.g., all product detail permutations). Practices:
- Keep tag cardinality modest; avoid user-specific tags across millions of users.
- Tag sets should reflect domain aggregates (product, category) not entire tables.
- To invalidate: `cache()->tags(['product:123'])->flush()`—scopes deletion without scanning global namespace.

## Failure & Degradation Behavior
- Transient network issues: operations may fallback or bubble exceptions based on configuration; wrap multi-key reads with circuit breakers when critical.
- Node loss in distributed mode: requests rehashed (consistent hashing) reducing key loss window; warm-up fills newly mapped slots.
- Serialization issues: validate complex payloads & keep them versioned; prefer arrays & scalars; avoid storing closures/resources.

## Observability
Emit and monitor:
| Metric | Description |
|--------|-------------|
| cache.hit_total | Count of successful lookups |
| cache.miss_total | Count of misses (leading to recompute) |
| cache.fill_duration_ms | Latency of set/remember fills |
| cache.evictions_total | Count evicted (store dependent) |
| cache.stampede.prevented_total | Times stampede lock prevented duplicate recompute |

Log structured fields: `store`, `operation`, `key`, `ttl`, `hit`, `tags_count`, `duration_ms`, `outcome` (hit|miss|fill|error).

## Performance Practices
- Batch operations where backend supports (MGET pipelining in Redis) to reduce round trips.
- Compress large serialized payloads only if size reduction > 40% to offset CPU cost.
- Avoid cache nesting (a cached value containing large sets of other cache keys) unless invalidation complexity is documented.
- Measure before optimizing—premature sharding introduces coordination overhead.

## Security & Safety
- Do not cache sensitive secrets unencrypted; prefer ephemeral key stores.
- Separate namespaces for public vs internal data (prefix keys) to avoid accidental exposure if edge integrated.
- Apply size limits—reject storing payloads beyond configured maximum to prevent memory pressure.

## Anti-Patterns
- Using cache as primary source of truth (risk of silent divergence).
- Overly granular keys causing explosion in cardinality and memory footprint.
- Blanket flushing entire store on small domain changes (use tags or targeted invalidation).
- Storing unbounded growing lists without eviction strategy.
- Ignoring serialization compatibility during deployment (deploy both versions with versioned keys until traffic drains old ones).

## Migration Strategy (Scaling Up)
1. Start with file store (or array in tests).
2. Introduce Redis; run dual-write (optional) while validating hit ratios.
3. Enable tagging for targeted invalidations.
4. Add stampede protection for top N expensive keys.
5. Evaluate distributed or sharded strategy only when single-node resource utilization > target thresholds (CPU > 60%, memory > 70%, latency P95 > goal).

The section below is auto-generated.

<!-- cache:reference:start -->
### Meta
- Default Store: `file`
- Stores: `4`
- Supports Tags: `yes`
- Distributed Enabled: `no`
- Edge Enabled: `no`

### Capabilities Matrix
| Store | Driver | Persistent | Supports Tags | Distributed Eligible | In-Memory |
| ----- | ------ | ---------- | ------------- | -------------------- | --------- |
| array | array | no | no | no | yes |
| file | file | yes | no | no | no |
| memcached | memcached | yes | yes | yes | yes |
| redis | redis | yes | yes | yes | yes |

### Stores
| Name | Driver |
| ---- | ------ |
| array | array |
| file | file |
| memcached | memcached |
| redis | redis |

### Features
- Tags: enabled (store: `redis`)
- Stampede Protection: disabled
- Edge: disabled
- Distributed: disabled

### Appendix
<details><summary>Raw Store Configurations</summary>

**array**
```json
{
    "driver": "array"
}
```

**file**
```json
{
    "driver": "file",
    "path": "<project>/storage/cache/"
}
```

**memcached**
```json
{
    "driver": "memcached",
    "host": "127.0.0.1",
    "persistent_id": null,
    "port": 11211,
    "sasl": {
        "password": null,
        "username": null
    },
    "weight": 100
}
```

**redis**
```json
{
    "database": 0,
    "driver": "redis",
    "host": "127.0.0.1",
    "password": null,
    "port": 6379,
    "read_timeout": 2.5,
    "retry_interval": 100,
    "timeout": 2.5
}
```

</details>

<details><summary>Raw Feature Configuration</summary>

**tags**
```json
{
    "enabled": true,
    "store": "redis"
}
```

**stampedeProtection**
```json
{
    "early_expiration": {
        "enabled": false,
        "threshold": 0.8
    },
    "enabled": false,
    "lock_ttl": 60,
    "max_wait_time": 30,
    "retry_interval": 100000
}
```

**edge**
```json
{
    "default_ttl": 3600,
    "enabled": false,
    "provider": "cloudflare",
    "rules": []
}
```

**distributed**
```json
{
    "enabled": false,
    "failover": {
        "enabled": true,
        "retry_after": 30,
        "timeout": 5
    },
    "nodes": [
        {
            "driver": "redis",
            "host": "127.0.0.1",
            "id": "cache-01",
            "password": null,
            "port": 6379,
            "weight": 1
        },
        {
            "driver": "redis",
            "host": "127.0.0.1",
            "id": "cache-02",
            "password": null,
            "port": 6380,
            "weight": 1
        }
    ],
    "replicas": 2,
    "strategy": "consistent-hashing"
}
```

</details>
<!-- cache:reference:end -->


## API Surface
| Method | Purpose | Notes |
|--------|---------|-------|
| get(key, default) | Retrieve value | Returns default (closure supported) if missing |
| set(key, value, ttl) | Store value with TTL | Overwrites existing; ttl seconds |
| has(key) | Check presence (not value truthiness) | Fast boolean check |
| delete(key) | Remove key | No-op if key absent |
| increment(key, delta) | Atomically add integer delta | Initializes at 0 if absent (store dependent) |
| decrement(key, delta) | Atomically subtract | Same semantics as increment |
| remember(key, ttl, closure) | Get or compute & store | Closure only invoked on miss |
| rememberForever(key, closure) | Get or compute & store without TTL | Use carefully; ensure invalidation path |
| tags(array) | Begin tagged cache scope | Chain further operations |
| flush() | Clear entire store (scope or global) | Dangerous; prefer tags |

### Tag Scope Pattern
```
cache()->tags(['product:'.$id, 'category:'.$categoryId])
    ->remember("product:detail:{$id}", 600, fn() => $repository->fetch($id));
```

## Examples
### Basic Remember
```
$user = cache()->remember("user:profile:{$uuid}", 300, fn() => $users->fetch($uuid));
```

### Prevent Stampede (Conditional)
```
if (config('cache.stampedeProtection.enabled')) {
    $stats = cache()->remember('report:stats:v2', 900, fn() => $reports->compute());
} else {
    $stats = cache()->remember('report:stats:v2', 900, fn() => $reports->compute());
}
```

### Versioned Key Rollout
```
$v = 3; // bump when representation changes
cache()->remember("product:detail:v{$v}:{$id}", 600, fn() => $svc->hydrate($id));
```

### Tag Invalidation After Update
```
$product = $repo->update($id, $data);
cache()->tags(['product:'.$id])->flush();
```

## Error Conditions
| Condition | Symptom | Handling |
|-----------|---------|----------|
| Store Unavailable | Connection refused / timeout | Fallback path or raise domain exception |
| Serialization Failure | Value cannot be encoded | Validate & refuse storage; log key & type |
| Tag Unsupported | Using tags on non-tag store | Throw informative exception |
| Increment Type Error | Non-numeric existing value | Reset or throw depending on policy |
| Oversized Payload | Exceeds configured limit | Reject & emit metric |

## Observability & Metrics
| Signal | Purpose | Example Label(s) |
|--------|---------|------------------|
| cache.hit_total | Success metric for retrieval | store, key_namespace |
| cache.miss_total | Detect ineffective caching | store, key_namespace |
| cache.fill_duration_ms | Cost of recomputations | store, key_namespace |
| cache.error_total | Backend errors/serialization | store, error_type |
| cache.evictions_total | Memory pressure indicator | store |

Tracing span attributes: `cache.store`, `cache.key`, `cache.hit`, `cache.ttl`.

## Performance Notes
| Concern | Mitigation |
|---------|------------|
| High miss rate | Audit key strategy & TTL; consider pre-warming |
| Long fill latency | Optimize underlying computation or parallelize sub-queries |
| Large payload churn | Compress or split into sub-keys with independent TTLs |
| Lock contention (stampede) | Increase early expiration threshold or widen TTL |
| Excessive network RTT | Batch multi-get or colocate cache with app nodes |

## Related
Database Query Caching, Scheduler (for warming jobs), CLI (`cache:*` commands), Locks (coordination), Observability (metrics/tracing), Extensions (custom store drivers).


