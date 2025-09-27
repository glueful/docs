---
title: Container (API)
description: Bindings, resolution, scopes
navigation:
  icon: i-lucide-box
---

# Container API Reference

API details for service bindings, resolution, scopes, and autowiring hints.

The container is the composition root: it manages service definitions (bindings), lifecycles (scopes), autowiring heuristics, contextual overrides, and delegation. This narrative explains binding types, resolution algorithm, scope semantics (shared vs non-shared), autowiring limits, and performance / observability guidance so you can design predictable, testable service graphs.

## Goals & Non-Goals
| Goal | Explanation |
|------|-------------|
| Deterministic Resolution | Same inputs => same instance graph (unless explicitly non-shared) |
| Minimal Reflection Cost | Cache parameter metadata & constructor graphs |
| Explicit Overrides | Contextual binding & child containers (`with()`) |
| Clear Lifecycles | Shared vs non-shared vs lazily proxied |
| Extension Friendly | Custom resolvers & delegate container integration |
| Non-Goal: Full AOP | Interception limited to basic hooks / wrappers, not full weave |

## Binding Types
| Type | Description | Typical Use |
|------|-------------|------------|
| value | Pre-built literal / config object | Immutable settings |
| factory | Closure executed per resolve | Stateful builders, non-shared resources |
| autowire | Class discovered & constructed via reflection | Majority of stateless services |
| alias | Alternative identifier referencing another binding | Backwards compatibility, interface alias |
| shared (flag) | Marks binding instance cached | Singletons, expensive resources |

### Shared vs Non-Shared
Shared (singleton) instances are created once and reused. Non-shared (prototype) instances are built on every resolution. Choose non-shared when internal mutable state would cause cross-request leakage (e.g., per-request accumulators). All autowire definitions default to shared unless flagged.

## Resolution Algorithm (Simplified)
1. Normalize identifier (FQCN or string alias).
2. Look up definition; if alias, recurse to target.
3. If shared & already instantiated: return cached instance.
4. Build instance:
   - If factory: invoke closure with container & (optional) parameters.
   - If value: return directly.
   - If autowire class: reflect constructor, resolve each parameter:
     - Scalar w/ default -> use default
     - Scalar w/out default -> attempt contextual parameter override else fail
     - Class type -> resolve recursively
5. Apply post-build hooks (if configured: tags, lifecycle callbacks).
6. Cache if shared.
7. Return instance.

Cycle detection maintains a stack of identifiers; re-entry on same stack path raises a circular dependency exception.

## Contextual & Child Containers
Use `with(['ClockInterface' => new FrozenClock(...)])` to derive a lightweight child container for a specific operation/test, overriding targeted services while delegating the rest. Child maintains its own instance cache for overridden IDs; shared instances from parent remain reused for non-overridden.

## Autowiring Hints & Strategies
| Strategy | Description | Notes |
|----------|-------------|-------|
| Type Hints | Use constructor type hints to drive resolution | Primary mechanism |
| PHP Attributes (future) | Annotate parameters for named bindings | Optional enhancement |
| Interface Aliasing | Bind interface -> concrete class via alias | Declared in providers |
| Purpose Tags | Tag services for grouped resolution (e.g., `console.commands`) | Tag collector returns array |

Avoid ambiguous multiple implementations—bind the preferred one or require manual factory.

## Lifecycle Hooks
Potential extension points:
| Hook | Trigger | Use Case |
|------|---------|---------|
| onResolving(id, closure) | Before instantiation | Parameter overrides, logging |
| onResolved(id, closure) | After creation | Post-construction wiring (init caches) |

Keep hooks idempotent; they may execute in tests multiple times with fresh containers.

## Performance Considerations
| Concern | Mitigation |
|---------|-----------|
| Repeated reflection | Cache constructor signature metadata |
| Large provider sets | Compile static definition map at build stage |
| Cold start spikes | Pre-warm core singletons (config, logger, DB pool) |
| Over-autowiring | Explicit factories for heavy objects (e.g., large graphs) |

Consider a (future) compiled container generator that transforms provider arrays into a pre-optimized PHP class eliminating runtime loops.

## Testing Patterns
| Scenario | Approach |
|----------|----------|
| Swap service implementation | Child container with override (`with([...])`) |
| Provide fakes/mocks | Bind test double as value/factory before code under test |
| Isolate side effects | Non-shared factory for stateful collaborator |

## Error Diagnostics
Common exceptions:
| Condition | Exception / Message | Action |
|----------|---------------------|--------|
| Missing binding | Not found | Define in provider or add autowire if class exists |
| Unresolvable scalar | Parameter w/out default | Provide factory or value binding |
| Circular dependency | Cycle detected A -> B -> A | Refactor to break cycle (event, interface) |

Enable resolution debug logging to trace instantiation graph when troubleshooting complex setups.

## Observability
Metrics: `container_resolve_duration_ms` (histogram by service), `container_resolve_fail_total`, `container_cache_hit_total` (shared reuse), `container_cycle_detect_total`.
Log slow resolutions (over threshold) with fields: `service`, `duration_ms`, `scope` (shared/non_shared), `strategy` (factory/autowire/value).
Tracing: span per resolution for services exceeding baseline or when debug flag active.

## Example Definitions (Conceptual)
```php
return [
  'ClockInterface' => [ 'factory' => fn() => new SystemClock(), 'shared' => true ],
  LoggerInterface::class => [ 'factory' => fn() => new StructuredLogger(config('logging')), 'shared' => true ],
  CacheInterface::class => [ 'autowire' => FilesystemCache::class, 'shared' => true ],
  'report.builder' => [ 'factory' => fn($c) => new ReportBuilder($c->get(CacheInterface::class)), 'shared' => false ],
];
```

## Selecting Binding Type
| Situation | Choose |
|-----------|-------|
| Stateless service, simple ctor | autowire |
| Needs custom assembly logic | factory |
| Shared config value | value |
| Interchangeable implementations | alias + autowire target |
| Per-operation scratch object | factory non-shared |

## Migration & Refactoring Tips
When replacing a concrete with an interface + multiple implementations:
1. Introduce interface.
2. Alias interface => old concrete.
3. Update consumers to depend on interface.
4. Introduce new implementation & feature flag selection logic (factory) if needed.
5. Remove alias once factory selects based on configuration.

## Anti-Patterns
| Anti-Pattern | Risk | Alternative |
|--------------|------|------------|
| Service locator usage inside deep domain objects | Hides dependencies | Inject via constructor |
| Overusing child containers per request | Memory churn | Limit to test or narrow override scope |
| Giant God service with 20 dependencies | Hard to test | Split by bounded context responsibility |
| Factories returning different types conditionally | Unpredictable graph | Use interface + separate bindings |

---

## Overview
High-level description of dependency injection responsibilities.

## Core Types
| Symbol | Kind | Summary | Notes |
|--------|------|---------|-------|

## API Surface
### Creation
Binding services, singletons, factories.
### Usage
Resolving instances, contextual bindings.
### Extension Points
Custom resolvers, lifecycle hooks.

## Configuration
| Key | Type | Default | Description |
|-----|------|---------|-------------|

## Examples
Binding vs singleton vs contextual example.

## Error Conditions
Resolution failures, circular dependency detection.

## Observability & Metrics
Resolution timing, cache hit/miss for compiled container.

## Performance Notes
Pre-compilation, avoiding runtime reflection loops.

## Related
Concepts: Service Container & Autowiring, Service Providers.

<!-- container:reference:start -->
## Overview

- Providers discovered: **14**
- Total definitions: **161**
- Delegate container supported: **yes** (runtime via with()/constructor)

### Definition Classification

| Type | Count |
|------|-------|
| factory | 41 |
| alias | 27 |
| value | 2 |
| autowire | 91 |
| unknown | 0 |
| shared | 134 |
| non_shared | 27 |

### Providers

| Provider Class | Definitions |
|----------------|-------------|
| Glueful\Container\Providers\ConsoleProvider | 54 |
| Glueful\Container\Providers\ControllerProvider | 6 |
| Glueful\Container\Providers\CoreProvider | 63 |
| Glueful\Container\Providers\ExtensionProvider | 5 |
| Glueful\Container\Providers\FileProvider | 2 |
| Glueful\Container\Providers\HttpPsr15Provider | 0 |
| Glueful\Container\Providers\ImageProvider | 4 |
| Glueful\Container\Providers\LazyProvider | 4 |
| Glueful\Container\Providers\LockProvider | 2 |
| Glueful\Container\Providers\RepositoryProvider | 10 |
| Glueful\Container\Providers\RequestProvider | 5 |
| Glueful\Container\Providers\SpaProvider | 2 |
| Glueful\Container\Providers\StorageProvider | 4 |
| Glueful\Container\Providers\VarDumperProvider | 0 |

### Provider Breakdown

| Provider | total | factory | autowire | value | alias | unknown | shared | non_shared |
|----------|-------|---------|----------|-------|-------|---------|--------|------------|
| Glueful\Container\Providers\ConsoleProvider | 54 | 0 | 54 | 0 | 0 | 0 | 54 | 0 |
| Glueful\Container\Providers\ControllerProvider | 6 | 0 | 6 | 0 | 0 | 0 | 6 | 0 |
| Glueful\Container\Providers\CoreProvider | 63 | 21 | 27 | 0 | 15 | 0 | 48 | 15 |
| Glueful\Container\Providers\ExtensionProvider | 5 | 1 | 2 | 0 | 2 | 0 | 3 | 2 |
| Glueful\Container\Providers\FileProvider | 2 | 1 | 0 | 0 | 1 | 0 | 1 | 1 |
| Glueful\Container\Providers\HttpPsr15Provider | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Glueful\Container\Providers\ImageProvider | 4 | 3 | 0 | 0 | 1 | 0 | 3 | 1 |
| Glueful\Container\Providers\LazyProvider | 4 | 1 | 0 | 2 | 1 | 0 | 3 | 1 |
| Glueful\Container\Providers\LockProvider | 2 | 1 | 0 | 0 | 1 | 0 | 1 | 1 |
| Glueful\Container\Providers\RepositoryProvider | 10 | 5 | 0 | 0 | 5 | 0 | 5 | 5 |
| Glueful\Container\Providers\RequestProvider | 5 | 3 | 2 | 0 | 0 | 0 | 5 | 0 |
| Glueful\Container\Providers\SpaProvider | 2 | 2 | 0 | 0 | 0 | 0 | 2 | 0 |
| Glueful\Container\Providers\StorageProvider | 4 | 3 | 0 | 0 | 1 | 0 | 3 | 1 |
| Glueful\Container\Providers\VarDumperProvider | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

### Tags

| Tag | Occurrences |
|-----|-------------|
| cache.pool | 1 |
| console.commands | 54 |
| http.request | 1 |
| lazy.background | 2 |

### Notes

- Counts are static (no runtime conditional logic executed beyond provider defs()).
- Circular dependency detection is handled at resolution time (throws ContainerException).
- Use `with([...])` to create a child container overriding or adding services.
- Tag collection reflects tags emitted while providers built their definition arrays.

<!-- container:reference:end -->
