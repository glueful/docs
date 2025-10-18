---
title: Built‑in Capabilities
description: Powerful built-in features for modern applications
---

Glueful ships production-ready features with sensible defaults. Many work out of the box in development; for production, configure drivers (cache, queues, storage) via config.

## Core Features

- **[Caching](/features/caching)** - Speed up your application with Redis, Memcached, or file-based caching
- **[Queues & Jobs](/features/queues-jobs)** - Process tasks in the background with reliable job queues
- **[Events & Listeners](/features/events)** - Build decoupled systems with event-driven architecture
- **[Notifications](/features/notifications)** - Send email, SMS, Slack, and push notifications
- **[File Uploads](/features/file-uploads)** - Handle file uploads with local and cloud storage
- **[Rate Limiting](/features/rate-limiting)** - Protect your API from abuse
- **[CORS & CSRF](/features/cors-csrf)** - Secure cross-origin requests
- **[Task Scheduling](/features/scheduling)** - Run tasks on a schedule with cron-like syntax
- **[Distributed Locks](/features/distributed-locks)** - Coordinate tasks across servers
- **[Async & Concurrency](/features/async)** - Fiber-based concurrency, helpers, and parallel HTTP client
- **[Field Selection](/features/field-selection)** - GraphQL-style field selection and projection for REST

## Quick Example

```php
use Glueful\Helpers\CacheHelper;
use Glueful\Queue\QueueManager;
use Glueful\Events\Event;

// Cache expensive operations
$cache = CacheHelper::createCacheInstance();
$users = CacheHelper::remember($cache, 'users:active', function() {
    return $this->getConnection()->table('users')
        ->where(['status' => 'active'])
        ->get();
}, 3600);

// Queue background jobs
$queue = app(QueueManager::class);
$queue->push(SendWelcomeEmail::class, [
    'user_uuid' => $user->uuid,
]);

// Dispatch events (PSR-14 compatible)
Event::dispatch(new UserRegistered($user));
```

## Production Ready

All features are:
- **Battle-tested** - Used in production applications
- **Well-documented** - Clear examples and patterns
- **Configurable** - Sensible defaults, easy to customize
- **Scalable** - Designed for high-traffic applications

## Next Steps

Start with the feature you need:
- New to background jobs? Start with [Queues & Jobs](/features/queues-jobs)
- Need to send emails? Check out [Notifications](/features/notifications)
- Want to speed things up? Try [Caching](/features/caching)
