---
title: Scopes
description: Service lifetimes and scope boundaries
---

# Scopes

Available service lifetimes and when to use them.

Service lifetimes (scopes) define how long an instance lives and when a new one is created. Choosing the correct scope controls memory growth, performance, state isolation, and thread/ request safety. This page catalogs supported lifetimes, selection heuristics, and patterns for composing them with child containers.

## Lifetime Categories
| Lifetime | Also Called | Creation | Reuse | Typical Examples | Notes |
|----------|-------------|----------|-------|------------------|-------|
| Shared | Singleton | First resolution | Returned on every subsequent resolve | Logger, Config, Database Pool, Router | Default for most autowired services |
| Non-Shared | Transient / Prototype | Every resolution | Never | Builders, per-job accumulators | Higher CPU + allocation cost |
| Child Override | Scoped Override | Child container creation or first resolve | Within that child only | Test doubles, request-specific override | Falls back to parent for others |
| Lazy (Deferred Init) | Lazy Singleton | On first method use via proxy | Reused thereafter | Expensive rarely-used subsystem (Image processing) | Requires lazy wrapper definition |
| Value | Constant | At bootstrap | Immutable | Feature flags array, static maps | Should not mutate |

## Decision Matrix
| Question | If Yes | If No |
|----------|--------|-------|
| Holds mutable state across calls? | Non-shared (or isolate state) | Shared |
| Expensive to construct? | Shared (maybe lazy) | Non-shared OK |
| Accessed rarely? | Lazy (if expensive) | Regular shared |
| Must differ per test / request variant? | Child override | Base binding |
| Contains external connection/pool? | Shared | Never transient |

## Shared vs Non-Shared Nuance
Shared objects should be effectively stateless or internally thread/request safe. If you need counters or caches, prefer explicit concurrency-safe structures or metrics systems rather than hidden mutable fields that accumulate unbounded data.

Non-shared objects should be lightweight and deterministic. If you notice hot-path allocation churn (profiling shows frequent instantiation), reconsider promoting to shared with explicit `reset()` method for tests.

## Lazy Initialization Pattern
Use a factory returning a thin proxy that defers real object creation until a method other than trivial accessors is called. This mitigates cold start overhead when many services are resolved but only a subset used.
```php
'image.processor' => [
	'factory' => fn($c) => new Lazy(fn() => new ImageProcessor($c->get('logger'))),
	'shared' => true,
];
```

## Child Container Scoped Overrides
Create a temporary scope for a block of work:
```php
$child = container()->with([
	ClockInterface::class => new FrozenClock('2025-09-27T12:00:00Z'),
]);
// Code executed with deterministic clock
```
Avoid stacking many nested children in production paths—use sparingly for tests or narrow overrides (e.g., multi-tenant ephemeral context injection) to control memory.

## Anti-Patterns
| Pattern | Problem | Remediation |
|---------|---------|------------|
| Treating transient as a cache | Loses data each resolve | Use shared + internal cache or external store |
| Singleton with implicit mutable state (user context) | Cross-request leakage | Extract context into dedicated contextual service bound non-shared |
| Child container per web request when not needed | Memory / CPU overhead | Reserve for scenario-specific overrides |
| Large object graphs forced shared unnecessarily | High memory footprint | Split into smaller focused shared services |

## Observability per Scope
Metrics suggestions:
| Metric | Labels | Description |
|--------|--------|-------------|
| `container_resolve_scope_total` | scope (shared|non_shared|lazy) | Count of resolves by lifetime |
| `container_lazy_init_ms` | service | Time spent realizing lazily initialized singletons |
| `container_child_count` |  | Current active child containers |

Log anomalies: sudden spike in non-shared resolves may signal accidental repeated construction of a heavy service.

## Migration Strategies
| Scenario | Strategy |
|----------|----------|
| Promote transient to shared | Audit for hidden mutable state; add tests ensuring thread safety |
| Demote shared to transient | Identify state coupling, extract shared parts, keep ephemeral bits transient |
| Introduce lazy for expensive startup | Wrap in proxy; record first-use latency metric to validate benefit |

## Checklist Selecting Scope
1. Is object stateless / thread-safe? If yes → shared.
2. Does creation exceed acceptable latency? If yes & infrequent → lazy shared.
3. Does it capture per-request data? If yes → non-shared or contextual argument.
4. Will tests need a custom instance? Provide interface & allow child override.
5. Are there memory concerns? Measure; split large singletons if necessary.

---

<!-- container-scopes:reference:start -->
## Scopes & Lifetimes

- Shared (singleton) definitions: 134
- Non-shared (transient) definitions: 27
- Alias definitions behave as pass-through each resolution.

### Child Containers

Creating a child with overrides:

`$child = $container->with(["id" => new ValueDefinition("id", $object)]);`

Child container lookup order: child singletons > child defs > parent delegate chain.

<!-- container-scopes:reference:end -->
