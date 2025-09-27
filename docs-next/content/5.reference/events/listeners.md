---
title: Listeners
description: Register and execute event listeners
---

# Listeners

This page describes how to register, structure, and operate event listeners / subscribers.

## Listener Types

| Type | Description | When to Use |
|------|-------------|-------------|
| Closure / Callable | Inline function or static callable | Very small one-off logic (tests, prototypes) |
| Class Listener | Invokable class or specific method | Reusable domain or integration logic |
| Subscriber (static map) | `getSubscribedEvents()` returns event => method map | Multiple related handlers grouped |
| Container-backed (@service) | Lazy resolution via service container | Expensive dependencies / DI usage |

## Registration APIs

Programmatic registration (during boot):

```php
use Glueful\Events\Event;

Event::listen(SessionCreatedEvent::class, function (SessionCreatedEvent $e) {
	// light side-effect
});

Event::listen(RateLimitExceededEvent::class, '@rate_limiter_listener'); // container service
Event::listen(QueryExecutedEvent::class, [QueryLogListener::class, 'handle'], 10); // priority 10
```

Subscribing a subscriber class:

```php
Event::subscribe(CacheInvalidationSubscriber::class);
```

Inside the subscriber static method:

```php
final class CacheInvalidationSubscriber
{
	public static function getSubscribedEvents(): array
	{
		return [
			CacheInvalidatedEvent::class => 'onInvalidated',
			CacheHitEvent::class => ['onHit', 5], // priority 5
		];
	}
}
```

## Priorities & Ordering

Higher numeric priority executes first (convention). Keep side-effect ordering explicit only when
strict dependencies exist—otherwise prefer independent listeners.

## Synchronous vs Deferred

| Mode | Pros | Cons | Decision Guidance |
|------|------|------|-------------------|
| Sync | Simpler, predictable ordering | Latency added to emitter path | Use for fast, in-memory work |
| Deferred / Queue | Shields emitter latency | Complexity, eventual consistency | Use for IO, retries, fan-out |

To defer, keep listener minimal and enqueue a job or emit a secondary internal job event consumed by a worker.

## Failure Handling

- Throwing stops that listener; decide whether upstream should know.
- For non-critical side-effects (analytics) swallow/log exceptions and continue.
- Implement retries via queue workers, not repeated synchronous dispatch.
- Consider a circuit breaker around flaky external integrations.

## Stopping Propagation

If `BaseEvent` supports stoppable semantics (propagation flag), a listener may mark it stopped to
prevent further listeners. Reserve for security / validation failure cases.

## Best Practices

- Keep each listener focused (Single Responsibility).
- Avoid shared mutable state; pass through identifiers not entire large aggregates.
- Add structured logging (event class, correlation/request ID, duration, success/failure).
- Guard against duplicate processing (idempotent writes, unique constraints, dedupe keys).
- Avoid heavy synchronous IO in hot request paths—hand off to async.

## Observability

Recommended metrics:

- Listener execution count (by event class & listener)
- Error count & rate
- P95/P99 execution duration
- Queue backlog / age for deferred listeners

## Testing Strategies

| Test Layer | Goal | Approach |
|------------|------|----------|
| Unit | Listener logic correctness | Invoke listener with fabricated event object |
| Integration | Wiring & side-effects | Dispatch real event and assert downstream state |
| Performance | Hot path latency budget | Benchmark high-frequency listeners in isolation |

Use a fake or spy listener provider to assert registration occurred if registration logic is dynamic.

## Example: Idempotent Notification Listener

```php
final class NotificationDeliveredListener
{
	public function __invoke(NotificationDelivered $event): void
	{
		// Idempotent guard
		if ($this->repo->alreadyProcessed($event->notificationId)) {
			return;
		}
		$this->repo->markProcessed($event->notificationId);
		$this->analytics->track('notification.delivered', [
			'id' => $event->notificationId,
			'channel' => $event->channel,
		]);
	}
}
```

## Checklist

- [ ] Listener logic < 50 lines / focused
- [ ] Avoid blocking IO (or delegated to async)
- [ ] Idempotency considered
- [ ] Structured logging + metrics
- [ ] Tests cover success + failure paths

---
See also: `emitter.md` (emitting events) and `index.md` (generated catalog of events & listeners).
