---
title: Events & Listeners
description: Decouple features with event-driven architecture
---

Build loosely coupled systems by emitting events and registering listeners to react.

## Quick Start

### 1. Define an Event

```php
namespace App\Events;

use Glueful\Events\Contracts\BaseEvent;

class UserRegisteredEvent extends BaseEvent
{
    public function __construct(
        public readonly string $userUuid,
        public readonly string $email
    ) {
        parent::__construct();
        $this->setMetadata('source', 'registration');
    }
}
```

### 2. Listen to Event

Register listeners at boot, typically in a service provider's `boot()`:

```php
use App\Events\UserRegisteredEvent;
use Glueful\Bootstrap\ApplicationContext;
use Glueful\Events\EventService;
use Glueful\Queue\QueueManager;

public function boot(ApplicationContext $context): void
{
    $events = app($context, EventService::class);

    $events->addListener(UserRegisteredEvent::class, function (UserRegisteredEvent $event) use ($context) {
        // Send the welcome email from a queued job
        app($context, QueueManager::class)
            ->push(SendWelcomeEmailJob::class, ['user_uuid' => $event->userUuid]);
    });
}
```

### 3. Dispatch Event

```php
use Glueful\Events\EventService;

app($context, EventService::class)->dispatch(new UserRegisteredEvent($user['uuid'], $user['email']));
```

## When to Use Events

**Use events when:**
- Multiple subsystems react to same action
- You want loose coupling
- Side effects are optional
- Fan-out to multiple handlers

**Use direct calls when:**
- Only one consumer exists
- Coupling is acceptable
- Action must be synchronous

## Basic Usage

### Dispatch Events

```php
use Glueful\Events\EventService;

$events = app($context, EventService::class);

// Dispatch with data
$events->dispatch(new OrderPlacedEvent($orderId, $total));

// Multiple listeners will execute
```

### Register Listeners

```php
$events = app($context, EventService::class);

// Closure listener
$events->addListener(OrderPlacedEvent::class, function($event) use ($context) {
    app($context, \Psr\Log\LoggerInterface::class)->info('Order placed', ['id' => $event->orderId]);
});

// Lazy listener via container service reference (id or id:method)
$events->addListener(OrderPlacedEvent::class, '@send_order_confirmation:handle');

// Priority: higher runs first (default 0); equal priorities run in registration order
$events->addListener(OrderPlacedEvent::class, $auditListener, priority: 100);
```

Registering the same listener twice for an event is de-duplicated. `$events->hasListeners(OrderPlacedEvent::class)` and `getListeners()` let you inspect what's registered.

### Listener Failures

`dispatch()` is fault-isolated: if a listener throws, the exception is logged (`error_log`) and the remaining listeners still run. The caller never sees the exception.

When a failure must surface (for example, a webhook handler that should be redelivered on error), use `dispatchOrFail()`. It rethrows the first listener's original exception and stops dispatching, so listeners after it don't run. A caller may retry the same event, so listeners on strictly-dispatched events must be idempotent.

```php
try {
    $events->dispatchOrFail(new PaymentCapturedEvent($paymentId));
} catch (\Throwable $e) {
    // mark for redelivery
}
```

## Event Subscribers

Group related listeners in a subscriber:

```php
namespace App\Listeners;

use Glueful\Events\EventSubscriberInterface;

class UserLifecycleSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            UserRegisteredEvent::class => 'onRegistered',
            UserUpdatedEvent::class => ['onUpdated', 10], // [method, priority]
            UserDeletedEvent::class => 'onDeleted',
        ];
    }

    public function onRegistered(UserRegisteredEvent $event): void
    {
        // Send welcome email
    }

    public function onUpdated(UserUpdatedEvent $event): void
    {
        // Clear cache
    }

    public function onDeleted(UserDeletedEvent $event): void
    {
        // Cleanup data
    }
}
```

Register the subscriber with the event service:

```php
app($context, EventService::class)->subscribe(UserLifecycleSubscriber::class);
```

How `subscribe()` builds the class depends on whether it's a container service:

- **Registered service** (listed in a provider's `services()`): each method is registered as a lazy `@Class:method` container reference, resolved the first time one of its events is dispatched.
- **Not registered**: `subscribe()` constructs the class right away, autowiring its constructor dependencies from the container, and registers the instance. If it can't be built (an unresolvable dependency, for example), `subscribe()` throws `InvalidArgumentException` and registers none of the class's listeners.

Either way the class can take constructor dependencies. Register it as a service when you want it built lazily, or shared with other code:

```php
public static function services(): array
{
    return [
        UserLifecycleSubscriber::class => ['class' => UserLifecycleSubscriber::class, 'autowire' => true],
    ];
}
```

::u-alert{color="info" variant="subtle" icon="i-lucide-info"}
**Since 1.91.** An unregistered class used to be wired as a lazy reference that failed at dispatch and was skipped silently, so its listeners never ran. Now it runs, and a listener class that can't be built fails at `subscribe()` (usually during boot) instead.
::

## Attribute Listeners

`#[AsListener]` (`Glueful\Events\Attributes\AsListener`) declares listeners on the class itself, without implementing `EventSubscriberInterface`. It is read by the same `subscribe()` call; there is no directory scanning, so every class must still be subscribed.

### On methods

Put the attribute on any **public** method; it is repeatable, so one method can handle several events:

```php
namespace App\Listeners;

use Glueful\Events\Attributes\AsListener;

final class OrderListeners
{
    #[AsListener(OrderPlacedEvent::class, priority: 10)]
    public function reserveStock(OrderPlacedEvent $event): void { /* ... */ }

    #[AsListener(OrderPlacedEvent::class)]
    #[AsListener(OrderUpdatedEvent::class)]
    public function refreshSearchIndex(object $event): void { /* ... */ }
}
```

### On the class

On the class, `method` names the handler; without it, `__invoke` is called:

```php
#[AsListener(UserRegisteredEvent::class)]                            // calls __invoke()
#[AsListener(UserDeletedEvent::class, method: 'onDeleted', priority: -10)]
final class UserAuditListener
{
    public function __invoke(UserRegisteredEvent $event): void { /* ... */ }

    public function onDeleted(UserDeletedEvent $event): void { /* ... */ }
}
```

### Registering

```php
// Optional: list the classes in services() to build them lazily on first dispatch

public function boot(ApplicationContext $context): void
{
    $events = app($context, EventService::class);
    $events->subscribe(OrderListeners::class);
    $events->subscribe(UserAuditListener::class);
}
```

| Argument | Meaning |
|----------|---------|
| `event` | Event class (listeners on a parent class or interface also receive subclasses) |
| `priority` | Higher runs first; default `0`, same ordering as `addListener()` |
| `method` | Class-level only: the public method to call (default `__invoke`) |

A class may combine `EventSubscriberInterface` and `#[AsListener]`; both sets are registered. `subscribe()` throws `InvalidArgumentException` when the class doesn't exist, has neither `getSubscribedEvents()` nor any `#[AsListener]`, a class-level attribute names a method that isn't public or doesn't exist, or an unregistered class can't be constructed.

::u-alert{color="info" variant="subtle" icon="i-lucide-info"}
**Since 1.91.** Before 1.91 the attribute existed but nothing read it, so annotated listeners never ran.
::

## Async Event Handling

Queue expensive listeners:

```php
$events = app($context, EventService::class);

$events->addListener(UserRegisteredEvent::class, function($event) use ($context) {
    // Listeners always run synchronously, inside dispatch()
    app($context, \Psr\Log\LoggerInterface::class)->info('User registered');
});

$events->addListener(UserRegisteredEvent::class, function($event) use ($context) {
    // Push expensive work to a queued job
    $queue = app($context, \Glueful\Queue\QueueManager::class);
    $queue->push(ProcessNewUserJob::class, ['user_uuid' => $event->userUuid]);
});
```

## Common Patterns

### User Registration

```php
// Event
class UserRegisteredEvent extends BaseEvent
{
    public function __construct(
        public readonly string $userUuid,
        public readonly string $email,
        public readonly string $name
    ) {
        parent::__construct();
    }
}

// Listeners
$events = app($context, EventService::class);

$events->addListener(UserRegisteredEvent::class, function($event) use ($context) {
    // Send welcome email
    $queue = app($context, \Glueful\Queue\QueueManager::class);
    $queue->push(SendWelcomeEmailJob::class, ['user_uuid' => $event->userUuid]);
});

$events->addListener(UserRegisteredEvent::class, function($event) use ($context) {
    // Create default preferences
    db($context)->table('user_preferences')->insert([
        'user_uuid' => $event->userUuid,
        'notifications' => true
    ]);
});

// Dispatch
$events->dispatch(new UserRegisteredEvent(
    $user['uuid'],
    $user['email'],
    $user['name']
));
```

### Order Processing

```php
class OrderPlacedEvent extends BaseEvent
{
    public function __construct(
        public readonly int $orderId,
        public readonly int $userId,
        public readonly float $total
    ) {
        parent::__construct();
    }
}

$events = app($context, EventService::class);

// Process payment
$events->addListener(OrderPlacedEvent::class, function($event) use ($context) {
    app($context, \Glueful\Queue\QueueManager::class)
        ->push(ProcessPaymentJob::class, ['order_id' => $event->orderId]);
});

// Send confirmation
$events->addListener(OrderPlacedEvent::class, function($event) use ($context) {
    app($context, \Glueful\Queue\QueueManager::class)
        ->push(SendOrderConfirmationJob::class, ['order_id' => $event->orderId]);
});

// Update inventory
$events->addListener(OrderPlacedEvent::class, function($event) use ($context) {
    app($context, \Glueful\Queue\QueueManager::class)
        ->push(UpdateInventoryJob::class, ['order_id' => $event->orderId]);
});
```

### Cache Invalidation

```php
class PostUpdatedEvent extends BaseEvent
{
    public function __construct(
        public readonly string $postUuid
    ) {
        parent::__construct();
    }
}

app($context, EventService::class)->addListener(PostUpdatedEvent::class, function($event) use ($context) {
    // Clear post cache
    $cache = app($context, \Glueful\Cache\CacheStore::class);
    $cache->delete('post:' . $event->postUuid);

    // Clear list caches
    $cache->deletePattern('posts:*');
});
```

## Built-in Framework Events

Glueful dispatches these events itself. They expose **getters**, not public properties (a few security/HTTP-auth events use public readonly properties, noted below).

| Event | Dispatched when | Useful accessors |
|-------|-----------------|------------------|
| `Glueful\Events\Auth\SessionCreatedEvent` | A login session is created | `getUserUuid()`, `getUsername()`, `getSessionData()` |
| `Glueful\Events\Auth\SessionDestroyedEvent` | A session is destroyed | `getUserUuid()`, `getReason()`, `isExpired()`, `isRevoked()` |
| `Glueful\Events\Auth\AuthenticationFailedEvent` | Username/password login fails | `getUsername()`, `getReason()`, `getClientIp()`, `isSuspicious()` |
| `Glueful\Events\Http\HttpAuthSuccessEvent` / `HttpAuthFailureEvent` | The `auth` middleware accepts / rejects a request | public `$request`; `$tokenMetadata` / `$reason` |
| `Glueful\Events\Http\ExceptionEvent` | The exception handler handles an exception | `getException()`, `getRequest()`, `getExceptionClass()` |
| `Glueful\Events\Database\QueryExecutedEvent` | A query runs, whether or not debug mode is on (built only when a listener exists) | `getSql()`, `getBindings()`, `getExecutionTime()` (seconds), `isSlow()`; `getMetadata('purpose')` carries the `withPurpose()` label |
| `Glueful\Events\Database\EntityCreatedEvent` / `EntityUpdatedEvent` / `EntityDeletedEvent` | `BaseRepository` writes (and API key changes) | `getTable()`, `getEntityId()`, `getEntity()`; `getChanges()` on updates |
| `Glueful\Events\Security\CSRFViolationEvent` | CSRF origin or token check fails | public `$reason`, `$request` |
| `Glueful\Events\Webhook\WebhookDeliveredEvent` / `WebhookFailedEvent` | An outbound webhook is delivered / fails | `getUrl()`, `getStatusCode()`, `getDurationMs()`; `getReason()` on failure |
| `Glueful\Events\Http\RequestEvent` | The HTTP kernel receives a request, before routing | `getRequest()`, `getMethod()`, `getUri()`, `getClientIp()` |
| `Glueful\Events\Http\ResponseEvent` | The final response is built (after CORS and security headers, error responses included) | `getRequest()`, `getResponse()`, `getStatusCode()`, `isServerError()` |
| `Glueful\Events\Cache\CacheHitEvent` / `CacheMissEvent` | The container cache store's `get()` / `remember()` hits / misses | `getKey()`; `getRetrievalTime()` (ms), `getValueSize()` on hits |
| `Glueful\Events\Auth\RateLimitExceededEvent` | The `rate_limit` middleware returns 429 | `getClientIp()`, `getLimit()`, `isSevereViolation()` |

```php
use Glueful\Events\Auth\AuthenticationFailedEvent;
use Glueful\Events\Auth\SessionCreatedEvent;
use Glueful\Events\Database\QueryExecutedEvent;
use Psr\Log\LoggerInterface;

$events = app($context, EventService::class);
$logger = app($context, LoggerInterface::class);

$events->addListener(SessionCreatedEvent::class, function (SessionCreatedEvent $event) use ($logger) {
    $logger->info('User logged in', ['user_uuid' => $event->getUserUuid()]);
});

$events->addListener(AuthenticationFailedEvent::class, function (AuthenticationFailedEvent $event) use ($logger) {
    $logger->warning('Login failed', [
        'username' => $event->getUsername(),
        'reason' => $event->getReason(),
    ]);
});

$events->addListener(QueryExecutedEvent::class, function (QueryExecutedEvent $event) use ($logger) {
    if ($event->isSlow(0.1)) { // seconds
        $logger->warning('Slow query', [
            'sql' => $event->getSql(),
            'seconds' => $event->getExecutionTime(),
        ]);
    }
});
```

The request, response and cache events are built and dispatched only when at least one listener is registered for them, so they cost a listener lookup when unobserved. A failing listener never breaks the request or the cache read (HTTP event failures are logged as a warning). They are dispatched since 1.91; earlier versions defined the classes but never fired them. See [Caching](/features/caching#cache-events) and [Rate Limiting](/features/rate-limiting#ratelimitexceededevent) for those events.

## Configuration

`config/events.php`:

```php
return [
    'enabled' => env('EVENTS_ENABLED', true),

    // On/off flags for core listeners, not a map of event classes to listeners
    'listeners' => [
        'cache_invalidation' => env('EVENTS_CACHE_INVALIDATION', true),
        'security_monitoring' => env('EVENTS_SECURITY_MONITORING', true),
        'performance_monitoring' => env('EVENTS_PERFORMANCE_MONITORING', true),
        'audit_logging' => env('EVENTS_AUDIT_LOGGING', true),
    ],

    'debug' => env('EVENTS_DEBUG', env('APP_DEBUG', false)),
    'performance' => [
        'enabled' => env('EVENTS_PERFORMANCE_TRACKING', true),
        'slow_threshold_ms' => env('EVENTS_SLOW_THRESHOLD', 100),
        'memory_threshold_mb' => env('EVENTS_MEMORY_THRESHOLD', 10),
    ],
    'extensions' => [
        'enabled' => env('EVENTS_EXTENSIONS_ENABLED', true),
        'auto_register' => env('EVENTS_EXTENSIONS_AUTO_REGISTER', true),
    ],
];
```

Only `enabled` and `listeners.audit_logging` are read. Together they decide whether the core `ActivityLoggingSubscriber` (auth/security activity logging) is subscribed at boot, and `enabled` (with `api.webhooks.enabled`) decides whether the webhook bridge for `#[Webhookable]` / `DispatchesWebhooks` events is registered (see [Webhooks](/features/webhooks#from-application-events)). `enabled = false` does **not** stop `dispatch()` or your own listeners. The other keys are currently unused. Register your own listeners in code with `addListener()` or `subscribe()`; there is no config-file listener map.

## Performance Tips

### Keep Listeners Fast

```php
$events = app($context, EventService::class);

// ✅ Good - quick logging
$events->addListener(OrderPlacedEvent::class, function($event) use ($context) {
    app($context, \Psr\Log\LoggerInterface::class)->info('Order placed', ['id' => $event->orderId]);
});

// ❌ Bad - slow API call
$events->addListener(OrderPlacedEvent::class, function($event) {
    // This blocks all other listeners!
    $this->externalApi->notify($event->orderId);
});

// ✅ Good - queue slow work
$events->addListener(OrderPlacedEvent::class, function($event) use ($context) {
    app($context, \Glueful\Queue\QueueManager::class)
        ->push(NotifyExternalApiJob::class, ['order_id' => $event->orderId]);
});
```

### Minimal Payloads

```php
// ✅ Good - small payload
class UserUpdatedEvent extends BaseEvent
{
    public function __construct(
        public readonly int $userId
    ) {
        parent::__construct();
    }
}

// ❌ Bad - large payload
class UserUpdatedEvent extends BaseEvent
{
    public function __construct(
        public readonly User $user, // Full object!
        public readonly array $oldData,
        public readonly array $newData
    ) {
        parent::__construct();
    }
}
```

## Stop Propagation

Prevent further listeners from executing:

```php
app($context, EventService::class)->addListener(OrderPlacedEvent::class, function($event) {
    if ($event->total > 10000) {
        // Manual review required
        $event->stopPropagation();
        return;
    }
});
```

## Testing Events

Register a listener, run the code under test, and assert on what it captured:

```php
use Glueful\Events\EventService;

public function testRegistrationDispatchesEvent(): void
{
    $captured = null;

    app($this->context, EventService::class)->addListener(
        UserRegisteredEvent::class,
        function (UserRegisteredEvent $event) use (&$captured) {
            $captured = $event;
        }
    );

    app($this->context, RegistrationService::class)->register('test@example.com', 'secret');

    $this->assertNotNull($captured);
    $this->assertSame('test@example.com', $captured->email);
}
```

Because `dispatch()` swallows listener exceptions, assertions inside a listener don't fail the test; capture the event and assert afterwards, as above.

## Best Practices

### Use Events for Side Effects

```php
// Main action
public function createPost(array $data): string
{
    $this->db->table('posts')->insert($data);

    // Dispatch event for side effects
    $this->events->dispatch(new PostCreatedEvent($data['uuid']));

    return $data['uuid'];
}

// Side effects as listeners
$events = app($context, EventService::class);

$events->addListener(PostCreatedEvent::class, function($event) use ($context) {
    app($context, \Glueful\Cache\CacheStore::class)->delete('posts:latest');
});

$events->addListener(PostCreatedEvent::class, function($event) use ($context) {
    app($context, \Glueful\Queue\QueueManager::class)
        ->push(NotifySubscribersJob::class, ['post_uuid' => $event->postUuid]);
});
```

### Domain Events

```php
// Good domain events
UserRegisteredEvent
OrderPlacedEvent
PaymentProcessedEvent
InvoiceGeneratedEvent

// Not events (these are commands)
RegisterUserEvent  // Use: RegisterUserCommand
PlaceOrderEvent    // Use: PlaceOrderCommand
```

## Troubleshooting

**Listeners not firing?**
- Verify the listener is registered before the event is dispatched (e.g. in a provider's `boot()`)
- Check the event class name matches (listeners on a parent class or interface also receive subclasses)
- Check the event is one core actually dispatches (see Built-in Framework Events)
- Subscribed a class (`subscribe()` / `#[AsListener]`) that isn't registered in the container? It's resolved on first dispatch, and the "Service not found" error is logged and skipped like any listener failure
- Look in the PHP error log: a listener that throws is logged and skipped

**Performance issues?**
- Profile slow listeners
- Queue expensive operations
- Reduce payload size

**Events firing multiple times?**
- Check for duplicate listener registrations
- Verify event is only dispatched once

## Next Steps

- [Queues & Jobs](/features/queues-jobs) - Queue async listeners
- [Notifications](/features/notifications) - Event-driven notifications
- [Caching](/features/caching) - Cache invalidation with events
