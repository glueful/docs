---
title: Emitter
description: Publish domain and system events
---

# Emitter

This page explains when and how to emit framework & domain events. For a full catalog of concrete
events see the **Events Reference** table in `index.md`.

## When to Emit an Event

Emit an event when you need to:

- Decouple a side-effect (notifications, cache invalidation, analytics) from the initiating action
- Allow extensions to observe or augment lifecycle moments (webhook delivery, auth outcomes)
- Provide audit / observability signals without coupling call-sites to consumers

Avoid events for purely internal synchronous data flow where a direct method call preserves clarity.

## Creating an Event Class

1. Place the class under a meaningful namespace segment inside `src/Events/` (e.g. `Auth`, `Cache`).
2. Extend `BaseEvent` (preferred) or another existing abstract domain event base.
3. Keep it immutable: promote constructor parameters to readonly properties when possible.
4. Document payload with a docblock using `@summary`, optional `@category`, and any `@payload` lines.

Example docblock snippet:

```php
/**
 * Fired after a user session is established.
 * @summary Session Created Event
 * @category Auth
 * @payload sessionId:string="Stable internal session identifier" {required}
 */
final class SessionCreatedEvent extends BaseEvent {}
```

## Dispatching

Use the facade `Event::dispatch(new SomeEvent(...))` once the application bootstraps the event system.

```php
use Glueful\Events\Event;

// Inside service logic
Event::dispatch(new SessionCreatedEvent($sessionId));
```

The facade enforces bootstrapping via `Event::bootstrap($dispatcher, $provider, $container?)` during
early application startup. Attempting to dispatch before bootstrap throws a logic exception.

### Manual Bootstrapping (Testing / Minimal Context)

In tests you can supply a lightweight dispatcher & provider to capture events:

```php
Event::bootstrap($dispatcher, $listenerProvider, $container);
```

## Emission Patterns

| Pattern | Use Case | Notes |
|---------|----------|-------|
| Immediate Dispatch | Most domain side-effects | Default path; listeners run synchronously. |
| Deferred (queue) | Expensive IO (email, webhooks) | Wrap listener in queue consumer or schedule job. |
| Conditional / Guarded | Feature toggles | Emit only if feature enabled / environment flag. |
| Aggregated | High-frequency signals | Batch metrics into a single event or throttle dispatch. |

## Payload Design

- Prefer explicit scalar / value object properties over associative arrays.
- Use stable, future-proof names (avoid leaking transient implementation detail).
- Mark required fields in `@payload` with `{required}` or enumerate via `{required=field1,field2}`.
- Avoid mutable collections; if necessary, treat them as read-only when passed to listeners.

## Idempotency & Re-entrancy

Emitting the same event twice should usually be harmless. If not, either:
1. Encode a unique identifier (e.g. aggregate ID + version) and let listeners deduplicate.
2. Promote the underlying operation (e.g. persisting delivery attempt) to an idempotent store write.

## Error Handling Semantics

If a listener throws:
- The dispatcher will continue only if propagation is not halted and underlying implementation tolerates exceptions.
- Keep listener logic narrow; push risky external calls to async jobs when possible.
- Wrap known transient failures and rethrow domain-specific exceptions if you want centralized logging.

## Performance Considerations

- Avoid large object graphs on the event—pass identifiers so listeners can lazy-load.
- High-cardinality events (per DB row access) should be sampled or aggregated for metrics use cases.
- Measure listener latency (e.g. instrumentation around `Event::dispatch`). Consider emitting a follow-up
	performance telemetry event if dispatch time exceeds a threshold.

## Testing Event Emission

- Replace dispatcher/provider with fakes and assert captured events.
- For integration tests, assert side-effects (e.g. cache invalidated) rather than the raw event if that’s more stable.

Example test approach:

```php
// Arrange: bootstrap with test doubles
Event::bootstrap($testDispatcher, $testProvider, $container);

// Act
Event::dispatch(new RateLimitExceededEvent($key));

// Assert: inspect $testDispatcher->dispatchedEvents or provider spy
```

## Observability

- Emit metrics: count of dispatches, exception count, mean/percentile dispatch latency.
- Correlate events with request or trace IDs—include them in event constructors or propagated context.

## Versioning Strategy

- Additive payload fields: safe if listeners ignore unknown properties.
- Removals: deprecate first (mark in docblock), keep field inert for one release, then remove.
- Renames: introduce new field, continue populating both, update listeners, remove old after deprecation window.

## Checklist

- [ ] Event immutability
- [ ] Minimal payload surface
- [ ] Required fields documented
- [ ] Emission point contains no heavy IO
- [ ] Tests assert emission or side-effect
- [ ] Observability (metrics / tracing) in place for critical high-volume events

---
See also: `listeners.md` for consuming events, and `index.md` for the generated reference.
