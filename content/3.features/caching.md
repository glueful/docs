---
title: Caching
description: Speed up your application with Redis, Memcached, or file caching
---

Cache expensive database queries and computations to reduce latency and improve performance.

## Quick Start

Inject the cache store (`Glueful\Cache\CacheStore`, container id `cache.store`) and use `remember()`:

```php
use Glueful\Cache\CacheStore;
use Glueful\Database\Connection;

final class UserStatsService
{
    public function __construct(
        private readonly CacheStore $cache,
        private readonly Connection $db,
    ) {}

    public function activeUsers(): array
    {
        return $this->cache->remember('users:active', function () {
            return $this->db->table('users')
                ->where('status', 'active')
                ->get();
        }, 600); // TTL in seconds
    }
}
```

Outside DI, resolve it with `app($context, CacheStore::class)`. The examples below assume `$cache` is a `CacheStore` and `$db` a `Connection` (or `db($context)`).

### Getting a store

| Option | When the backend is down |
|--------|--------------------------|
| Inject `CacheStore` / `app($context, 'cache.store')` | Throws on resolution. Returns an `EventDispatchingCacheStore` wrapping the driver (see [Cache events](#cache-events)) |
| `CacheFactory::create('', $context)` | Throws; `create('redis', $context)` forces a driver |
| `CacheHelper::createCacheInstance($context)` | Returns `null`; pair it with `CacheHelper::safeExecute()` or `CacheHelper::remember()`, which both accept `null` |

## When to Cache

**Use caching when:**
- Repeated reads of expensive computations
- Database queries degrade latency
- Data doesn't change every request

**Skip caching when:**
- Data changes every request
- Computation is already O(1)
- Data is user-specific or personalized

## Cache Drivers

Set `CACHE_DRIVER` (default `file`):

| Driver | Best For | Notes |
|--------|----------|-------|
| **file** (default) | Development, single server | Stored in `<app>/storage/cache/`, or `CACHE_FILE_PATH`. Tags via per-tag index files |
| **redis** | Production, multi-server | Tags, pattern delete, atomic `setNx` |
| **memcached** | High-traffic, simple caching | No tags; `deletePattern()` always returns `false` |
| **array** | Tests | In-process only |

## Basic Operations

```php
$cache->set('user:123', $userData, 600);    // TTL in seconds
$user = $cache->get('user:123');             // null on miss
$user = $cache->get('user:123', $default);   // default on miss
$cache->has('user:123');
$cache->delete('user:123');

$cache->increment('page:views');             // counters
$cache->setNx('lock:import', 1, 30);         // set only if absent
$cache->ttl('user:123');                     // seconds remaining
```

## Read-Through (`remember`)

`remember($key, $callback, $ttl)` returns the cached value, or runs the callback on a miss and stores the result:

```php
$product = $cache->remember('product:' . $sku, function () use ($db, $sku) {
    return $db->table('products')
        ->where('sku', $sku)
        ->first();
}, 900);
```

Don't rely on caching `null`: the Redis and Memcached drivers treat a stored `null` as a miss, so a callback that returns `null` runs on every request. To cache "not found", store a sentinel such as `['found' => false]` and check for it.

## Write-Through

Update the cache when data changes:

```php
$db->table('users')->where('uuid', $uuid)->update($data);

$user = $db->table('users')->where('uuid', $uuid)->first();
$cache->set('user:' . $uuid, $user, 600);
```

## Tagging & Group Invalidation

Tag related entries for bulk invalidation. Tags work on the Redis, file and array drivers; on Memcached, `addTags()`/`invalidateTags()` return `false`. Check `$cache->getCapabilities()['features']['tags']` if your code must run on any driver.

```php
$cache->set('user:123', $userData, 600);
$cache->addTags('user:123', ['user:123', 'role:admin']);

$cache->invalidateTags(['user:123']);   // every entry tagged user:123
$cache->invalidateTags(['role:admin']);
```

On the **file** driver (since 1.91) each tag keeps an index file of its keys under the cache directory, updated under an exclusive `flock` so concurrent requests don't drop each other's keys. `invalidateTags()` deletes the indexed keys and then the index; an index pointing at a key that has since expired or been deleted is harmless, and `clear()` removes the indexes too. As on Redis, tagging doesn't require the key to exist, and an overwritten key stays tagged until the tag is invalidated.

Controllers using `ResponseCachingTrait` store the tags passed to `cacheResponse()`, so `invalidateCache()` / `invalidateTags()` evict those cached responses.

## Pattern Deletion

```php
$cache->deletePattern('session:*');   // Redis, file and array drivers
```

Memcached can't enumerate keys, so `deletePattern()` returns `false` there.

## Stampede Protection

A driver's own `$cache->remember()` has **no** stampede protection: on a miss, every concurrent request runs the callback. Use `CacheHelper::remember()` instead:

```php
use Glueful\Helpers\CacheHelper;

$result = CacheHelper::remember(
    $cache,                       // CacheStore, or null (then the callback just runs)
    'expensive:data',
    fn () => computeExpensiveData(),
    600,
    true                          // force protection; null (default) follows config
);
```

With protection on, one request takes a lock (`setNx`) and computes the value. The others poll the cache every `retry_interval` microseconds for up to `max_wait_time` seconds, then compute without the lock if the value still isn't there.

To tune a single call, use the explicit helpers:

```php
// TTL, lock TTL, max wait (s), retry interval (µs)
CacheHelper::rememberWithStampedeProtection($cache, 'report:daily', $callback, 3600, 60, 30, 100000);

// Early refresh: once 80% of the TTL has elapsed, the request that wins the refresh
// lock recomputes (synchronously, inside that request) while others get the current value
CacheHelper::rememberWithEarlyExpiration($cache, 'app:config', $callback, 3600, 0.8, 60);
```

When the fifth argument is `null`, `CacheHelper::remember()` uses `cache.stampede_protection.enabled`, and switches to early expiration when `early_expiration.enabled` is also true.

## Safe Operations

Survive cache outages without failing the request:

```php
use Glueful\Helpers\CacheHelper;

$cache = CacheHelper::createCacheInstance($context); // null if unavailable

$flag = CacheHelper::safeExecute(
    $cache,
    fn ($c) => $c->get('feature:flag'),
    false // fallback when $cache is null or the operation throws
);

if (CacheHelper::isCacheHealthy($cache)) {
    // a set/get round trip succeeded
}
```

## Cache Events

The container's store fires `Glueful\Events\Cache\CacheMissEvent` and `CacheHitEvent` from `get()` and `remember()`, for every driver. Events are built only when a listener for either is registered, so an unobserved cache pays one listener lookup per read, and a failing listener never breaks the read.

```php
use Glueful\Events\Attributes\AsListener;
use Glueful\Events\Cache\{CacheHitEvent, CacheMissEvent};

final class CacheMetrics
{
    #[AsListener(CacheHitEvent::class)]
    public function onHit(CacheHitEvent $event): void
    {
        // $event->getKey(), $event->getRetrievalTime() (ms), $event->getValueSize()
    }

    #[AsListener(CacheMissEvent::class)]
    public function onMiss(CacheMissEvent $event): void
    {
        // $event->getKey()
    }
}
```

Call `EventService::subscribe(CacheMetrics::class)` (registering the class as a service is optional; an unregistered class is autowired) (see [Events](/features/events#attribute-listeners)). Other operations (`set()`, `has()`, `getMultiple()`, ...) don't fire events.

::u-alert{color="warning" variant="subtle" icon="i-lucide-triangle-alert"}
**Since 1.91**, `cache.store` / `CacheStore` resolves to the `EventDispatchingCacheStore` wrapper, so `instanceof RedisCacheDriver` (or any driver class) checks against it fail. Call `getInnerStore()` to reach the driver. Driver-only methods outside the `CacheStore` contract are forwarded, so calling them directly still works.
::

## Configuration

`config/cache.php`:

```php
return [
    'default' => env('CACHE_DRIVER', 'file'),   // file | redis | memcached | array
    'prefix' => env('CACHE_PREFIX', 'glueful:'),
    'fallback_to_file' => env('CACHE_FALLBACK', true),

    'stores' => [
        'redis' => [
            'driver' => 'redis',
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'port' => env('REDIS_PORT', 6379),
            'password' => env('REDIS_PASSWORD'),
            'database' => env('REDIS_DB', 0),
            'timeout' => env('REDIS_TIMEOUT', 2.5),
        ],
        'memcached' => [
            'driver' => 'memcached',
            'host' => env('MEMCACHED_HOST', '127.0.0.1'),
            'port' => env('MEMCACHED_PORT', 11211),
        ],
        'file' => [
            'driver' => 'file',
            'path' => env('CACHE_FILE_PATH'),    // unset: <app>/storage/cache/
        ],
        'array' => ['driver' => 'array'],
    ],

    'ttl' => env('CACHE_TTL', 3600),

    'stampede_protection' => [
        'enabled' => env('CACHE_STAMPEDE_PROTECTION', false),
        'lock_ttl' => env('CACHE_STAMPEDE_LOCK_TTL', 60),
        'max_wait_time' => env('CACHE_STAMPEDE_MAX_WAIT', 30),
        'retry_interval' => env('CACHE_STAMPEDE_RETRY_INTERVAL', 100000), // µs
        'early_expiration' => [
            'enabled' => env('CACHE_EARLY_EXPIRATION', false),
            'threshold' => env('CACHE_EARLY_EXPIRATION_THRESHOLD', 0.8),
        ],
    ],
];
```

What these keys do:

- `prefix` is applied by `CacheHelper::key()` and its key builders (`userKey()`, `sessionKey()`, ...), not by the drivers. Keys you pass to `$cache->get()`/`set()` are used as is.
- `fallback_to_file` only applies when `default` names a driver the factory doesn't know. A Redis or Memcached connection failure throws; use `CacheHelper::createCacheInstance()` to degrade gracefully.
- `ttl` is displayed by `cache:status` but isn't applied as a driver default.

1.91 removed `lock_ttl`, `enable_tags`, `tags_store` and `distributed` from `config/cache.php`: nothing read them. Delete them from a published copy of the file. Tags are always available on drivers that support them, stampede-lock TTL is `stampede_protection.lock_ttl`, distributed locks are configured in `config/lock.php` ([Distributed Locks](/features/distributed-locks)), and multi-node caching is covered in [Caching Recipes](/cookbook/caching).

## CLI Commands

```bash
php glueful cache:status                        # driver, prefix, statistics
php glueful cache:inspect                       # driver and PHP extension status
php glueful cache:get user:123
php glueful cache:set user:123 '{"name":"Ada"}' --json --ttl=600
php glueful cache:ttl user:123
php glueful cache:expire user:123 1h --human-time
php glueful cache:delete 'user:*' --pattern --force
php glueful cache:clear --force                 # or --tag=<tag> (repeatable)
php glueful cache:maintenance                   # run or queue maintenance tasks
```

## Best Practices

### Short TTLs

```php
// ✅ Good - fresh data, simple invalidation
$cache->remember('users', fn () => $users, 300); // 5 min

// ❌ Risky - stale data, complex invalidation
$cache->remember('users', fn () => $users, 86400); // 24 hours
```

### Clear on Update

```php
$db->table('users')->where('uuid', $uuid)->update($data);
$cache->delete('user:' . $uuid);
```

### Consistent Keys

```php
// ✅ Good - predictable, namespaced
$cache->remember('user:' . $uuid, ...);
$cache->remember('product:' . $sku, ...);

// ❌ Bad - hard to invalidate, no namespace
$cache->remember($uuid, ...);
```

## Monitoring

`$cache->getStats()` and `php glueful cache:status` report driver statistics (for Redis: memory, connections, commands processed, hit rate). Track:
- Hit ratio (target: >60%)
- Miss rate
- Cache size and eviction rate

A low hit ratio usually means keys change too often, TTLs are too short, or values are over-personalized.

## Troubleshooting

**Low hit ratio?**
- Check key naming consistency
- Check that callbacks don't return `null` (not cached on Redis/Memcached)
- Make sure the backend is reachable (`php glueful cache:status`)

**Load spikes when a hot key expires?**
- Use `CacheHelper::remember()` with stampede protection
- Increase the TTL or enable early expiration
- Pre-warm the cache after deploys

**File cache not writable?**
- The file store writes to `<app>/storage/cache/` (or `CACHE_FILE_PATH`); make sure the web server user can write there

## Next Steps

- [Caching Recipes](/cookbook/caching) - Distributed caching, tagging service, edge/CDN seam
- [Queues & Jobs](/features/queues-jobs) - Offload expensive work
- [Database](/essentials/database) - Optimize queries before caching
- [Performance](/advanced/performance) - Advanced optimization
