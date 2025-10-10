---
title: Caching
description: Speed up your application with Redis, Memcached, or file caching
---

Cache expensive database queries and computations to reduce latency and improve performance.

> Note: For production resilience, prefer `CacheHelper::createCacheInstance()` when you need graceful degradation — it returns `null` if the cache backend is unavailable so your code can continue (use `CacheHelper::safeExecute` or branch on `null`). Use `CacheFactory::create()` when you want a hard failure if the cache cannot be reached.

## Quick Start

```php
use Glueful\Cache\CacheFactory;

$cache = CacheFactory::create();

// Cache with automatic refresh on miss
$users = $cache->remember('users:active', function() {
    return $this->getConnection()->table('users')
        ->where(['status' => 'active'])
        ->get();
}, 600); // TTL in seconds
```

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

Configure in `config/cache.php`:

| Driver | Best For | Pros | Cons |
|--------|----------|------|------|
| **Redis** | Production, multi-server | Fast, rich features, pattern delete | External dependency |
| **Memcached** | High-traffic, simple caching | Low latency, horizontal scaling | Fewer features |
| **File** | Development, single server | No setup needed | Not ideal for production |

## Basic Operations

### Get & Set

```php
// Set cache
$cache->set('user:123', $userData, 600);

// Get cache
$user = $cache->get('user:123');

// Get with default
$user = $cache->get('user:123', $defaultValue);
```

### Remember Pattern

Best practice - automatic cache on miss:

```php
$product = $cache->remember('product:'.$sku, function() use ($sku) {
    return $this->getConnection()->table('products')
        ->where(['sku' => $sku])
        ->first();
}, 900);
```

## Read-Through Pattern

Populate cache automatically on miss:

```php
$profile = $cache->remember('profile:'.$id, function() use ($id) {
    // Only executed on cache miss
    return $this->getConnection()->table('users')
        ->where(['id' => $id])
        ->first();
}, 300);
```

## Write-Through Pattern

Update cache when data changes:

```php
// Update database
$this->getConnection()->table('users')
    ->where(['id' => $userId])
    ->update($data);

// Keep cache warm
$user = $this->getConnection()->table('users')->find($userId);
$cache->set('user:'.$userId, $user, 600);
```

## Tagging & Group Invalidation

Tag related cache items for bulk invalidation:

```php
// Cache with tags
$cache->set('user:123', $userData, 600);
$cache->addTags('user:123', ['user:123', 'role:admin']);

// Invalidate all user caches
$cache->invalidateTags(['user:123']);

// Invalidate all admin role caches
$cache->invalidateTags(['role:admin']);
```

## Pattern Deletion

Delete multiple keys at once (Redis/File only):

```php
// Delete all session keys
$cache->deletePattern('session:*');

// Delete all user caches
$cache->deletePattern('user:*');
```

## Common Patterns

### Cache User Data

```php
public function getUser($id)
{
    $cache = \Glueful\Cache\CacheFactory::create();
    return $cache->remember('user:'.$id, function() use ($id) {
        return $this->getConnection()->table('users')->find($id);
    }, 3600); // 1 hour
}
```

### Cache API Responses

```php
public function getWeather($city)
{
    $cache = \Glueful\Cache\CacheFactory::create();
    return $cache->remember('weather:'.$city, function() use ($city) {
        return $this->httpClient->get("api.weather.com?city={$city}");
    }, 1800); // 30 minutes
}
```

### Cache Computed Values

```php
public function getStats()
{
    $cache = \Glueful\Cache\CacheFactory::create();
    return $cache->remember('dashboard:stats', function() {
        return [
            'users' => $this->getConnection()->table('users')->count(),
            'posts' => $this->getConnection()->table('posts')->count(),
            'revenue' => $this->getConnection()->table('orders')->sum('total')
        ];
    }, 300); // 5 minutes
}
```

### Negative Cache

Cache known-missing items to prevent repeated DB lookups:

```php
$cache = \Glueful\Cache\CacheFactory::create();
$user = $cache->remember('user:'.$id, function() use ($id) {
    return $this->getConnection()->table('users')->find($id);
}, 60); // Short TTL for missing items

if (!$user) {
    // Cache the "not found" result
    $this->cache->set('user:'.$id, null, 60);
}
```

## Stampede Protection

Prevent multiple simultaneous cache misses:

```php
// Enable via config (cache.stampede_protection)
// Only one request recomputes on miss
$result = $cache->remember('expensive:data', function() {
    sleep(5); // Expensive operation
    return computeExpensiveData();
}, 600);
```

## Safe Operations

Handle cache failures gracefully:

```php
use Glueful\Helpers\CacheHelper;

// Returns null if cache unavailable
$cache = CacheHelper::createCacheInstance();

// Execute with fallback
$value = CacheHelper::safeExecute(
    $cache,
    fn($c) => $c->get('feature:flag'),
    $defaultValue = false
);
```

## Configuration

`config/cache.php` (keys shown reflect what the framework reads):

```php
return [
    'default' => env('CACHE_DRIVER', 'redis'),

    'stores' => [
        'redis' => [
            'driver' => 'redis',
            // The factory reads these keys or falls back to REDIS_* envs
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'port' => env('REDIS_PORT', 6379),
            'password' => env('REDIS_PASSWORD'),
            'database' => env('REDIS_DB', 0),
            'timeout' => env('REDIS_TIMEOUT', 2.5),
        ],
        'memcached' => [
            'driver' => 'memcached',
            // Single host/port used by factory; extend as needed
            'host' => env('MEMCACHED_HOST', '127.0.0.1'),
            'port' => env('MEMCACHED_PORT', 11211),
        ],
        // File driver is supported if default === 'file' or when fallback is enabled
        'file' => [
            'driver' => 'file',
            // Path is determined automatically; override via app.paths.storage_path
        ],
    ],

    // If true and default driver fails, factory may fall back to file cache
    'fallback_to_file' => false,

    'stampede_protection' => [
        'enabled' => false,
        'early_expiration' => [
            'enabled' => false,
            'threshold' => 0.8,
        ],
        'lock_ttl' => 60,
        'max_wait_time' => 30,
        'retry_interval' => 100000, // microseconds
    ],
];
```

## Best Practices

### Short TTLs

```php
// ✅ Good - fresh data, simple invalidation
$cache->remember('users', fn() => $users, 300); // 5 min

// ❌ Risky - stale data, complex invalidation
$cache->remember('users', fn() => $users, 86400); // 24 hours
```

### Clear on Update

```php
// Update data
$this->getConnection()->table('users')->where(['id' => $id])->update($data);

// Clear cache
$cache->delete('user:'.$id);
```

### Consistent Keys

```php
// ✅ Good - predictable, namespaced
$cache->remember('user:'.$id, ...);
$cache->remember('product:'.$sku, ...);

// ❌ Bad - hard to invalidate, no namespace
$cache->remember($id, ...);
```

## Monitoring

Track these metrics:
- Hit ratio (target: >60%)
- Miss rate
- Average TTL
- Cache size
- Eviction rate

Low hit ratio usually means:
- Keys changing too frequently
- TTL too short
- Over-personalization

## Troubleshooting

**Low hit ratio?**
- Check key naming consistency
- Verify `CACHE_PREFIX` in `.env`
- Ensure cache driver is running

**Frequent cache misses?**
- Enable stampede protection
- Increase TTL
- Pre-warm cache after deploys

**Memory issues?**
- Reduce value sizes
- Compress large values
- Use shorter TTLs

## Next Steps

- [Queues & Jobs](/features/queues-jobs) - Offload expensive work
- [Database](/essentials/database) - Optimize queries before caching
- [Performance](/advanced/performance) - Advanced optimization
