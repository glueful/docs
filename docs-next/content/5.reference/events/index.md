---
title: Events (API)
description: Emitter, listeners, and contracts
navigation:
  icon: i-lucide-broadcast
---

# Events API Reference

Reference for emitting events and handling them with listeners.

Events decouple producers (domains performing state changes) from side‑effect consumers (listeners that react). An emitter fires an immutable event object; the dispatcher fans it out synchronously (and optionally enqueues for async handling) to registered listeners / subscribers. This section documents emission flow, listener contracts, propagation control, error isolation, observability, and extension points so you can safely introduce new events without creating tight coupling or unpredictable latency spikes.

## Architecture
| Component | Responsibility | Notes |
|-----------|----------------|-------|
| Event Class | Immutable payload + semantic name | Extend a lightweight `BaseEvent` (timestamp, meta) |
| Dispatcher | Routes event instance to listeners/subscribers | Provides sync emit API & optional queue adapter |
| Listener | Handles a specific event synchronously | Keep fast; offload heavy work |
| Subscriber | Maps multiple events to methods (convention) | Useful for grouping related reactions |
| Queue Adapter (future/optional) | Persists event for async handling | Used for slow / retryable listeners |
| Propagation Flags | Allow listener to halt further delivery | Use sparingly—prefer idempotency |

## Emission Flow
1. Domain code creates event instance (`new EntityCreatedEvent($model)`)
2. Calls `events()->dispatch($event)` (or helper `event($event)`) 
3. Dispatcher resolves listeners list (direct + wildcard)
4. Executes each listener sequentially (default) capturing timings
5. (Optional) Queues designated async listeners for background execution
6. Collects & reports failures (does not abort remaining by default)

## Event Class Design
Guidelines:
- Keep payload minimal & explicit (avoid passing entire ORM model if only ID needed)
- Mark properties `readonly` (PHP 8.2+) or avoid mutators—treat events as immutable
- Include correlation metadata (request ID, user ID) injected at construction or via base class
- Avoid business logic inside event classes; they are data carriers

Example:
```php
final class EntityCreatedEvent extends BaseEvent {
  public function __construct(
    public readonly string $entityType,
    public readonly string $id,
    public readonly array $changes,
  ) { parent::__construct(); }
}
```

## Listener Patterns
| Pattern | Description | When to Use |
|---------|-------------|-------------|
| Inline Closure | Small, local reaction in bootstrapping | Quick prototyping |
| Dedicated Class | Single responsibility handling | Reusable, testable logic |
| Subscriber Class | Handles many related events | Aggregate cross-event state |
| Queued Listener | Defers heavy I/O | Expensive processing, retries |

Contract (indicative):
```php
interface Listener {
  public function handle(object $event): void; // type-check internally or via signature
}
```

### Ordering & Isolation
Listeners should be independent. If ordering matters you are leaking workflow logic—prefer a domain service orchestrating explicit steps then emitting a summary event. Failures in one listener SHOULD NOT prevent others; log & continue unless event is marked as stop‑on‑failure.

## Propagation Control
Some base events may expose `stopPropagation()` / `isPropagationStopped()`. Use only when continuing would cause duplicate side effects (rare). For metrics / audit events never stop propagation.

## Error Handling Strategy
| Failure Type | Default Handling | Recommendation |
|--------------|------------------|----------------|
| Listener throws | Log error, continue | Make listener idempotent, instrument retries externally if critical |
| Serialization (queued) failure | Log & DLQ (future) | Keep payload small & serializable |
| Missing listener class | Log warning | Validate configuration at boot |

Consider wrapping listener execution in a small try/catch harness that records: event class, listener class, exception type/message, duration.

## Versioning & Evolution
Prefer additive changes: add new event (e.g. `UserProfileUpdatedV2Event`) rather than mutating payload structure of existing one; deprecate old event after listeners migrate. Maintain both for a deprecation window.

## Testing Events
Unit test: dispatch event with a fake dispatcher capturing invoked listeners. Integration test: perform domain action and assert event(s) emitted (spy dispatcher) + listener side effects (e.g., record written). Avoid asserting timing or ordering.

## Observability
Metrics:
| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `events_dispatched_total` | counter | event | Count of emits |
| `event_listener_duration_ms` | histogram | event, listener | Listener latency |
| `event_listener_fail_total` | counter | event, listener | Failures (exceptions) |
| `event_queue_enqueued_total` | counter | event | Async handoffs |

Log each dispatch with: `event`, `listener`, `duration_ms`, `outcome`, `correlation_id`.

Tracing: create a span per event dispatch; nested spans per listener if needed for hotspots.

## Performance Considerations
- Avoid heavy synchronous listeners (DB N+1, remote calls). Queue them.
- Coalesce high-frequency structural events (e.g. multiple small updates) into periodic summary events if needed.
- Debounce event storms at the edge (e.g., collapse rapid successive `EntityUpdatedEvent` into one with merged change set).

## Security & Privacy
- Do not embed sensitive PII in event class names or log lines.
- Scrub / hash tokens before inclusion.
- Enforce allowlist if external plugins can register listeners to restricted events.

## Extension Points
| Extension | Purpose | Notes |
|-----------|---------|-------|
| Custom Dispatcher | Alternate fan-out strategy (parallel, coroutine) | Ensure deterministic error reporting |
| Async Adapter | Offload to queue / bus | Provide retry & DLQ semantics |
| Wildcard Listener | Observe a namespace (`Auth*`) | Use for metrics / auditing |
| Transactional Buffer | Emit only after DB commit | Avoid phantom events on rollback |

## Example Usage
```php
// Emitting
event(new EntityCreatedEvent('user', $id, $changes));

// Listener (class)
final class SendWelcomeEmailListener {
  public function handle(EntityCreatedEvent $event): void {
    if ($event->entityType !== 'user') return; // narrow scope
    // queue email job
  }
}
```

## Checklist for Adding a New Event
1. Clear semantic name.
2. Minimal immutable payload.
3. Correlation metadata present.
4. Listener(s) idempotent & fast or queued.
5. Metrics/trace labels considered.
6. Documented in changelog if public.

---

## Overview
Event-driven patterns & dispatch flow.

## Core Types
| Symbol | Kind | Summary | Notes |
|--------|------|---------|-------|

## API Surface
### Creation
Defining events.
### Usage
Emitting & listening.
### Extension Points
Custom dispatcher, async adapters.

## Configuration
| Key | Type | Default | Description |
|-----|------|---------|-------------|

## Examples
Basic event emission, queued listener.

## Error Conditions
Listener failures, propagation issues.

## Observability & Metrics
Event dispatch counts, listener latency.

## Performance Notes
Listener fan-out considerations.

## Related
Concepts: Observability Model.

<!-- GENERATED:events -->
<!-- GENERATED:EVENTS:START -->

# Events Reference

Summary:

- Total Events: 31
- Total Listeners/Subscribers: 1
- Categories: General

## Events

| Class | Category | Summary | Payload Fields | Source |
|-------|----------|---------|-----------------|--------|
| Glueful\Events\Auth\AuthenticationFailedEvent | General | Authentication Failed Event |  | `src/Events/Auth/AuthenticationFailedEvent.php` |
| Glueful\Events\Auth\RateLimitExceededEvent | General | Rate Limit Exceeded Event |  | `src/Events/Auth/RateLimitExceededEvent.php` |
| Glueful\Events\Auth\SessionCreatedEvent | General | Session Created Event |  | `src/Events/Auth/SessionCreatedEvent.php` |
| Glueful\Events\Auth\SessionDestroyedEvent | General | Session Destroyed Event |  | `src/Events/Auth/SessionDestroyedEvent.php` |
| Glueful\Events\Cache\CacheHitEvent | General | Cache Hit Event |  | `src/Events/Cache/CacheHitEvent.php` |
| Glueful\Events\Cache\CacheInvalidatedEvent | General | Cache Invalidated Event |  | `src/Events/Cache/CacheInvalidatedEvent.php` |
| Glueful\Events\Cache\CacheMissEvent | General | Cache Miss Event |  | `src/Events/Cache/CacheMissEvent.php` |
| Glueful\Events\Contracts\BaseEvent | General | BaseEvent with lightweight propagation control and framework metadata. |  | `src/Events/Contracts/BaseEvent.php` |
| Glueful\Events\Database\EntityCreatedEvent | General | Entity Created Event |  | `src/Events/Database/EntityCreatedEvent.php` |
| Glueful\Events\Database\EntityUpdatedEvent | General | Entity Updated Event |  | `src/Events/Database/EntityUpdatedEvent.php` |
| Glueful\Events\Database\QueryExecutedEvent | General | Query Executed Event |  | `src/Events/Database/QueryExecutedEvent.php` |
| Glueful\Events\Event | General |  |  | `src/Events/Event.php` |
| Glueful\Events\Http\ExceptionEvent | General | Exception Event |  | `src/Events/Http/ExceptionEvent.php` |
| Glueful\Events\Http\HttpAuthFailureEvent | General | Event emitted when HTTP-level authentication fails |  | `src/Events/Http/HttpAuthFailureEvent.php` |
| Glueful\Events\Http\HttpAuthSuccessEvent | General | Event emitted when HTTP-level authentication succeeds |  | `src/Events/Http/HttpAuthSuccessEvent.php` |
| Glueful\Events\Http\HttpClientFailureEvent | General | HTTP Client Failure Event |  | `src/Events/Http/HttpClientFailureEvent.php` |
| Glueful\Events\Http\RequestEvent | General | Request Event |  | `src/Events/Http/RequestEvent.php` |
| Glueful\Events\Http\ResponseEvent | General | Response Event |  | `src/Events/Http/ResponseEvent.php` |
| Glueful\Events\Security\AdminAccessEvent | General | Admin Access Event |  | `src/Events/Security/AdminAccessEvent.php` |
| Glueful\Events\Security\AdminSecurityViolationEvent | General | Admin Security Violation Event |  | `src/Events/Security/AdminSecurityViolationEvent.php` |
| Glueful\Events\Security\CSRFViolationEvent | General | CSRF Violation Event |  | `src/Events/Security/CSRFViolationEvent.php` |
| Glueful\Events\Webhook\WebhookDeliveredEvent | General | Webhook Delivered Event |  | `src/Events/Webhook/WebhookDeliveredEvent.php` |
| Glueful\Events\Webhook\WebhookFailedEvent | General | Webhook Failed Event |  | `src/Events/Webhook/WebhookFailedEvent.php` |
| Glueful\Notifications\Events\NotificationDelivered | General | NotificationDelivered |  | `src/Notifications/Events/NotificationDelivered.php` |
| Glueful\Notifications\Events\NotificationEvent | General | NotificationEvent |  | `src/Notifications/Events/NotificationEvent.php` |
| Glueful\Notifications\Events\NotificationFailed | General | NotificationFailed |  | `src/Notifications/Events/NotificationFailed.php` |
| Glueful\Notifications\Events\NotificationQueued | General | NotificationQueued |  | `src/Notifications/Events/NotificationQueued.php` |
| Glueful\Notifications\Events\NotificationRead | General | NotificationRead |  | `src/Notifications/Events/NotificationRead.php` |
| Glueful\Notifications\Events\NotificationRetry | General | NotificationRetry |  | `src/Notifications/Events/NotificationRetry.php` |
| Glueful\Notifications\Events\NotificationScheduled | General | NotificationScheduled |  | `src/Notifications/Events/NotificationScheduled.php` |
| Glueful\Notifications\Events\NotificationSent | General | NotificationSent |  | `src/Notifications/Events/NotificationSent.php` |

## Listeners & Subscribers

| Class | Handles | Summary | Source |
|-------|---------|---------|--------|
| Glueful\Events\Listeners\CacheInvalidationListener |  | Cache Invalidation Event Listener | `src/Events/Listeners/CacheInvalidationListener.php` |

<!-- GENERATED:EVENTS:END -->
<!-- END GENERATED:events -->
