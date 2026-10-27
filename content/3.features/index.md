---
title: Built‑in Capabilities
description: Powerful built-in features for modern applications
---

Glueful ships production-ready features with sensible defaults. Many work out of the box in development; for production, configure drivers (cache, queues, storage) via config.

## Core Features

- **[Caching](/features/caching)** - Speed up your application with file, Redis, Memcached, or in-memory stores
- **[Queues & Jobs](/features/queues-jobs)** - Process tasks in the background with reliable job queues
- **[Events & Listeners](/features/events)** - Build decoupled systems with PSR-14 events
- **[Notifications](/features/notifications)** - Send notifications through pluggable channels (email via the `email-notification` extension)
- **[File Uploads](/features/file-uploads)** - Handle uploads and blob storage with local or cloud disks
- **[Rate Limiting](/features/rate-limiting)** - Per-route, tiered limits with standard rate limit headers
- **[CORS & CSRF](/features/cors-csrf)** - Secure cross-origin requests and browser sessions
- **[Task Scheduling](/features/scheduling)** - Run tasks on a schedule with cron-like syntax
- **[Distributed Locks](/features/distributed-locks)** - Coordinate tasks across servers
- **[Field Selection](/features/field-selection)** - GraphQL-style field selection and projection for REST
- **[API Keys](/features/api-keys)** - Scoped, rotatable API keys (`ApiKeyService`, `#[RequireScope]`, `apikey:*` commands)
- **[Browser Sessions](/features/browser-sessions)** - Cookie session transport for first-party SPAs, paired with [CSRF protection](/features/cors-csrf)
- **[Webhooks](/features/webhooks)** - Signed outbound webhooks with subscriptions, delivery retries and a management API (`Glueful\Api\Webhooks`)

Also in core, without a dedicated page yet:

- **Encryption** - AES-256-GCM string, binary and file encryption with key rotation (`EncryptionService`, `encryption:*` commands)

See the [CLI reference](/cli-reference) for the related commands.

## Quick Example

```php
use Glueful\Events\EventService;
use Glueful\Helpers\CacheHelper;
use Glueful\Queue\QueueManager;

// Cache expensive operations (with stampede protection when enabled)
$cache = CacheHelper::createCacheInstance($context);
$users = CacheHelper::remember($cache, 'users:active', function () use ($context) {
    return db($context)->table('users')
        ->where('status', 'active')
        ->get();
}, 3600);

// Queue background jobs
$queue = app($context, QueueManager::class);
$queue->push(SendWelcomeEmail::class, [
    'user_uuid' => $user->uuid,
]);

// Dispatch events (PSR-14 compatible)
app($context, EventService::class)->dispatch(new UserRegistered($user));
```

## Defaults and Configuration

Each feature has defaults that work in development (file cache, database queue, local disk). For production, pick drivers and limits in the matching config file, such as `config/cache.php`, `config/queue.php`, `config/storage.php` or the `rate_limiting` block of `config/api.php`.

## Next Steps

Start with the feature you need:
- New to background jobs? Start with [Queues & Jobs](/features/queues-jobs)
- Need to send emails? Check out [Notifications](/features/notifications)
- Want to speed things up? Try [Caching](/features/caching)
