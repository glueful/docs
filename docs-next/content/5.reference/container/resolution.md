---
title: Resolution
description: Resolve dependencies and configure autowiring
---

# Resolution

How resolution works and how to customize autowiring.

This page dives into the resolution lifecycle: how identifiers map to definitions, how constructor parameters are satisfied (autowiring), where you can intervene (contextual overrides, child containers, hooks), and tactics for diagnosing failures or performance regressions. Treat resolution as pure graph assembly: each node (service) is constructed exactly once if shared; otherwise built on demand.

## Resolution Pipeline (Detailed)
1. Input ID received (FQCN or symbolic alias).
2. Alias chain flattened (prevent cycles by tracking visited IDs).
3. Definition chosen (factory / value / autowire metadata).
4. Shared instance cache check (fast path) unless non-shared.
5. Build strategy selected:
	 - Factory: invoke closure with container.
	 - Value: return as-is.
	 - Autowire: reflect constructor (cached signature) and resolve params.
6. Post-build hooks fire (onResolved) for instrumentation or decoration.
7. Instance cached (if shared) and returned.

## Parameter Resolution Order
For each constructor parameter:
| Step | Attempt |
|------|---------|
| 1 | If type-hinted class/interface: resolve recursively |
| 2 | If scalar + contextual override present (child container or binding metadata) use it |
| 3 | If default value defined: use default |
| 4 | Fail with descriptive exception (unresolvable parameter) |

## Customizing Autowiring
| Technique | Use Case | Example |
|-----------|----------|---------|
| Child Container (`with([...])`) | Override a dependency for a code path/test | `container()->with([Clock::class => new FrozenClock(...)])` |
| Factory Binding | Complex assemble logic, conditional selection | Choose implementation based on config |
| Alias | Swap implementation globally | `LoggerInterface => MonologLogger` |
| Post-Build Hook | Add instrumentation or late property injection | Decorate caching layer |
| (Future) Attribute Metadata | Parameter-level explicit IDs | `#[Inject('report.builder')]` |

### Contextual Overrides
Child containers keep the parent as delegate. Only IDs you supply override; others fall through. Shared instances created in child remain local (do not mutate parent), ensuring isolation in tests.

## Performance Optimizations
| Concern | Mitigation |
|---------|-----------|
| Excessive reflection | Cache constructor parameter metadata (done automatically) |
| Hot path transient resolution | Mark as shared or hoist dependency to caller |
| Large object graph cold start | Pre-warm core services during bootstrap |
| Re-resolving expensive factories | Convert to shared + expose reset hook if needed |

## Debugging Failures
| Symptom | Diagnosis Steps | Typical Fix |
|--------|-----------------|-------------|
| Unresolvable scalar param | Inspect constructor, missing default | Provide factory or inject value binding |
| Circular dependency detected | Examine stack in exception | Introduce interface or event to break cycle |
| Wrong implementation returned | Alias misconfigured | Trace alias chain, adjust provider order |
| Performance slowdown | Measure resolve timings | Share heavy services or reduce nested resolution depth |

Enable debug mode (if supported) to log: service id, duration, cache hit/miss, param list.

## Decorating / Wrapping Services
Pattern: register base implementation under internal ID, then factory for public ID that resolves and wraps the base (e.g., adding metrics, tracing).
```php
BaseCacheInterface::class => ['autowire' => FileCache::class, 'shared' => true],
CacheInterface::class => [
	'factory' => fn($c) => new MetricsCacheDecorator($c->get(BaseCacheInterface::class), metrics()),
	'shared' => true,
],
```

## Resolution Safety Tips
- Keep constructors lean (no network calls); postpone heavy I/O to lazy methods.
- Prefer explicit dependencies over grabbing the container inside service code (avoid service locator anti-pattern).
- Avoid passing large configuration arrays; bind a typed configuration value object instead.

## Autowiring vs Manual Factories
Use autowiring for stable, simple graphs. Switch to a factory when:
1. You need branching logic.
2. You must compute runtime secrets or dynamic credentials.
3. Construction order must differ from natural dependency order.

## Observability
Expose metrics:
| Metric | Type | Labels | Meaning |
|--------|------|--------|---------|
| `container_resolve_ms` | histogram | id | Resolution latency |
| `container_resolve_fail_total` | counter | id, reason | Failures |
| `container_cache_hit_total` | counter |  | Shared reuse events |
| `container_cycle_detect_total` | counter |  | Circular detection triggers |

Trace spans only for slow resolutions (adaptive sampling) to keep noise low.

## Anti-Patterns
| Pattern | Risk | Better Approach |
|---------|------|----------------|
| Service retrieving container to look up half of its collaborators | Hidden graph | Constructor inject all collaborators |
| Deep conditional logic in factories | Hard to predict graph | Strategy object + simple factory |
| Non-shared heavy services | Rebuilding cost | Mark shared, supply reset method for tests |

## Checklist When Adding a New Service
1. Can it be autowired? If yes, start there.
2. Is lifecycle shared? If not, mark `'shared' => false` explicitly.
3. Any scalar params? Provide defaults or convert to typed config object.
4. Need interface? Add alias early even if only one implementation.
5. Add observability (purpose tag) if performance critical.

---

<!-- container-resolution:reference:start -->
## Resolution Mechanics

- Circular detection: active chain tracked; throws on re-entry.
- Delegate lookup: if id missing locally, delegate container (if set) is queried.
- Singleton caching: shared definitions cached after first resolve.
- Alias indirection: alias definitions always defer to target resolution (not cached).

### Shared vs Non-Shared Counts

| Shared | Non-Shared |
|--------|------------|
| 134 | 27 |

### Most Common Binding Kind

- Dominant kind: **autowire** (91)

<!-- container-resolution:reference:end -->
