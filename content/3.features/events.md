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
        public readonly int $userId,
        public readonly string $email
    ) {
        parent::__construct();
        $this->setMetadata('source', 'registration');
    }
}
```

### 2. Listen to Event

```php
use Glueful\Events\Event;
use App\Events\UserRegisteredEvent;

Event::listen(UserRegisteredEvent::class, function($event) {
    // Send welcome email (queue async)
    $queue = app($context, \Glueful\Queue\QueueManager::class);
    $queue->push(SendWelcomeEmailJob::class, ['user_id' => $event->userId]);

    // Track in analytics (pseudo)
    app($context, 'analytics')->track('user.registered', [
        'user_id' => $event->userId
    ]);
});
```

### 3. Dispatch Event

```php
use Glueful\Events\Event;

Event::dispatch(new UserRegisteredEvent($user->id, $user->email));
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
use Glueful\Events\Event;

// Dispatch with data
Event::dispatch(new OrderPlacedEvent($orderId, $total));

// Multiple listeners will execute
```

### Register Listeners

```php
// Closure listener
Event::listen(OrderPlacedEvent::class, function($event) {
    app($context, \Psr\Log\LoggerInterface::class)->info('Order placed', ['id' => $event->orderId]);
});

// Class listener (optionally via service container reference)
Event::listen(OrderPlacedEvent::class, SendOrderConfirmationListener::class);
// Or lazy via container: Event::listen(OrderPlacedEvent::class, '@send_order_confirmation:handle');
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
            UserUpdatedEvent::class => 'onUpdated',
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

## Async Event Handling

Queue expensive listeners:

```php
Event::listen(UserRegisteredEvent::class, function($event) {
    // This listener runs synchronously
    app($context, \Psr\Log\LoggerInterface::class)->info('User registered');
});

Event::listen(UserRegisteredEvent::class, function($event) {
    // Queue this expensive work
    $queue = app($context, \Glueful\Queue\QueueManager::class);
    $queue->push(ProcessNewUserJob::class, ['user_id' => $event->userId]);
});
```

## Common Patterns

### User Registration

```php
// Event
class UserRegisteredEvent extends BaseEvent
{
    public function __construct(
        public readonly int $userId,
        public readonly string $email,
        public readonly string $name
    ) {
        parent::__construct();
    }
}

// Listeners
Event::listen(UserRegisteredEvent::class, function($event) {
    // Send welcome email
    $queue = app($context, \Glueful\Queue\QueueManager::class);
    $queue->push(SendWelcomeEmailJob::class, ['user_id' => $event->userId]);
});

Event::listen(UserRegisteredEvent::class, function($event) {
    // Track analytics
    Analytics::track('user.registered', [
        'email' => $event->email
    ]);
});

Event::listen(UserRegisteredEvent::class, function($event) {
    // Create default preferences
    db($context)->table('user_preferences')->insert([
        'user_id' => $event->userId,
        'notifications' => true
    ]);
});

// Dispatch
Event::dispatch(new UserRegisteredEvent(
    $user->id,
    $user->email,
    $user->name
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

// Process payment
Event::listen(OrderPlacedEvent::class, function($event) {
    app($context, \Glueful\Queue\QueueManager::class)
        ->push(ProcessPaymentJob::class, ['order_id' => $event->orderId]);
});

// Send confirmation
Event::listen(OrderPlacedEvent::class, function($event) {
    app($context, \Glueful\Queue\QueueManager::class)
        ->push(SendOrderConfirmationJob::class, ['order_id' => $event->orderId]);
});

// Update inventory
Event::listen(OrderPlacedEvent::class, function($event) {
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

Event::listen(PostUpdatedEvent::class, function($event) {
    // Clear post cache
    $cache = \Glueful\Cache\CacheFactory::create();
    $cache->delete('post:' . $event->postUuid);

    // Clear list caches
    $cache->deletePattern('posts:*');
});
```

## Built-in Framework Events

Glueful emits these events automatically:

### HTTP Events

```php
// Request received
use Glueful\Events\Http\RequestEvent;

Event::listen(RequestEvent::class, function($event) {
    app($context, \Psr\Log\LoggerInterface::class)->info('Request', [
        'method' => $event->request->getMethod(),
        'path' => $event->request->getPathInfo()
    ]);
});

// Response sent
use Glueful\Events\Http\ResponseEvent;

Event::listen(ResponseEvent::class, function($event) {
    app($context, \Psr\Log\LoggerInterface::class)->info('Response', [
        'status' => $event->response->getStatusCode()
    ]);
});
```

### Auth Events

```php
// Login success
use Glueful\Events\Auth\SessionCreatedEvent;

Event::listen(SessionCreatedEvent::class, function($event) {
    app($context, \Psr\Log\LoggerInterface::class)->info('User logged in', ['user_id' => $event->userId]);
});

// Login failure
use Glueful\Events\Auth\AuthenticationFailedEvent;

Event::listen(AuthenticationFailedEvent::class, function($event) {
    app($context, \Psr\Log\LoggerInterface::class)->warning('Login failed', ['email' => $event->email]);
});
```

### Cache Events

```php
// Cache hit
use Glueful\Events\Cache\CacheHitEvent;

Event::listen(CacheHitEvent::class, function($event) {
    // Track cache hit ratio
});

// Cache miss
use Glueful\Events\Cache\CacheMissEvent;

Event::listen(CacheMissEvent::class, function($event) {
    // Track cache miss ratio
});
```

### Database Events

```php
// Query executed
use Glueful\Events\Database\QueryExecutedEvent;

Event::listen(QueryExecutedEvent::class, function($event) {
    if ($event->time > 100) { // 100ms
        app($context, \Psr\Log\LoggerInterface::class)->warning('Slow query', [
            'sql' => $event->sql,
            'time' => $event->time
        ]);
    }
});
```

## Configuration

`config/events.php`:

```php
return [
    'enabled' => env('EVENTS_ENABLED', true),

    'listeners' => [
        'cache_invalidation' => true,
        'security_monitoring' => true,
        'performance_monitoring' => true,
        'audit_logging' => true,
    ],

    'performance' => [
        'enabled' => true,
        'slow_threshold_ms' => 100,
        'memory_threshold_mb' => 10,
    ],
];
```

## Performance Tips

### Keep Listeners Fast

```php
// ✅ Good - quick logging
Event::listen(OrderPlacedEvent::class, function($event) {
    app($context, \Psr\Log\LoggerInterface::class)->info('Order placed', ['id' => $event->orderId]);
});

// ❌ Bad - slow API call
Event::listen(OrderPlacedEvent::class, function($event) {
    // This blocks all other listeners!
    $this->externalApi->notify($event->orderId);
});

// ✅ Good - queue slow work
Event::listen(OrderPlacedEvent::class, function($event) {
    Queue::push(new NotifyExternalApiJob($event->orderId));
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
Event::listen(OrderPlacedEvent::class, function($event) {
    if ($event->total > 10000) {
        // Manual review required
        $event->stopPropagation();
        return;
    }
});
```

## Testing Events

```php
use Glueful\Events\Event;

public function testUserRegistrationDispatchesEvent()
{
    $dispatched = false;

    Event::listen(UserRegisteredEvent::class, function($event) use (&$dispatched) {
        $dispatched = true;
        $this->assertEquals('test@example.com', $event->email);
    });

    // Register user
    $this->post('/auth/register', [
        'email' => 'test@example.com',
        'password' => 'secret'
    ]);

    $this->assertTrue($dispatched);
}
```

## Best Practices

### Use Events for Side Effects

```php
// Main action
public function createPost($data)
{
    $post = $this->getConnection()->table('posts')->insert($data);

    // Dispatch event for side effects
    Event::dispatch(new PostCreatedEvent($post->uuid));

    return $post;
}

// Side effects as listeners
Event::listen(PostCreatedEvent::class, function($event) {
    $cache = \Glueful\Cache\CacheFactory::create();
    $cache->delete('posts:latest');
});

Event::listen(PostCreatedEvent::class, function($event) {
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
- Verify listener is registered
- Check event class name matches
- Ensure events are enabled in config

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
