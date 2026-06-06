---
title: Performance
description: Optimize your Glueful application for production
---

Optimize your application for speed, efficiency, and scalability.

## Quick Wins

### Enable Caching

```php
// Cache expensive queries
$cache = app($context, \Glueful\Cache\CacheStore::class);
$users = $cache->remember('users:active', function() {
    return app($context, 'database')
        ->table('users')
        ->where('status', 'active')
        ->get();
}, 3600);
```

### Use Indexes

```php
// Add database indexes
$schema->table('posts', function($table) {
    $table->index('user_id');
    $table->index('status');
    $table->index(['status', 'created_at']);
});
```

### Queue Heavy Operations

```php
// Don't process inline
$queue = service($context, \Glueful\Queue\QueueManager::class);
$queue->push(\App\Jobs\ProcessImageJob::class, ['path' => $path]);
$queue->push(\App\Jobs\SendEmailJob::class, ['userId' => $userId]);
```

## Database Optimization

### Select Only Needed Columns

```php
// ✅ Good - specific columns
$users = app($context, 'database')->table('users')
    ->select(['id', 'name', 'email'])
    ->get();

// ❌ Bad - all columns
$users = app($context, 'database')->table('users')->get();
```

### Avoid N+1 Queries

```php
// ❌ Bad - N+1 query problem
$posts = app($context, 'database')->table('posts')->get();
foreach ($posts as $post) {
    $user = app($context, 'database')->table('users')->find($post->user_id); // Query per post!
}

// ✅ Good - join or eager load
$posts = app($context, 'database')->table('posts')
    ->join('users', 'posts.user_id', '=', 'users.id')
    ->select(['posts.*', 'users.name as author_name'])
    ->get();
```

### Use Batch Operations

```php
// ❌ Bad - individual inserts
foreach ($users as $user) {
    app($context, 'database')->table('users')->insert($user);
}

// ✅ Good - batch insert
app($context, 'database')->table('users')->insertMany($users);
```

### Add Database Indexes

```php
// Index frequently queried columns
$table->index('email');
$table->index('status');
$table->index('created_at');

// Composite indexes for multiple columns
$table->index(['user_id', 'status']);
$table->index(['status', 'created_at']);
```

## Caching Strategies

### Cache Database Queries

```php
public function getActiveUsers()
{
    $cache = \Glueful\Cache\CacheFactory::create();

    return $cache->remember('users:active', function() {
        return db($context)->table('users')
            ->where('status', 'active')
            ->get();
    }, 3600);
}
```

### Cache API Responses

```php
public function getWeather($city)
{
    $cache = \Glueful\Cache\CacheFactory::create();

    return $cache->remember("weather:{$city}", function() use ($city) {
        return $this->httpClient->get("api.weather.com?city={$city}");
    }, 1800);
}
```

### Cache Computed Values

```php
public function getStatistics()
{
    $cache = \Glueful\Cache\CacheFactory::create();

    return $cache->remember('stats:dashboard', function() {
        return [
            'users' => db($context)->table('users')->count(),
            'posts' => db($context)->table('posts')->count(),
            'revenue' => db($context)->table('orders')->sum('total'),
        ];
    }, 300);
}
```

### Cache Invalidation

```php
$cache = \Glueful\Cache\CacheFactory::create();

// Clear specific cache
$cache->delete('users:active');

// Clear pattern
$cache->deletePattern('users:*');

// Clear on update
public function update($id, $data)
{
    db($context)->table('users')->where('id', $id)->update($data);

    // Invalidate cache
    $cache = \Glueful\Cache\CacheFactory::create();
    $cache->delete('users:active');
    $cache->delete("user:{$id}");
}
```

## Query Optimization

### Use EXPLAIN

```sql
EXPLAIN SELECT * FROM posts WHERE status = 'published';
```

Check for:
- Full table scans
- Missing indexes
- Unnecessary joins

### Optimize Joins

```php
// ✅ Good - join on indexed columns
$posts = app($context, 'database')->table('posts')
    ->join('users', 'posts.user_id', '=', 'users.id')
    ->get();

// ❌ Bad - join on non-indexed columns
$posts = app($context, 'database')->table('posts')
    ->join('users', 'posts.author_name', '=', 'users.name')
    ->get();
```

### Use Pagination

```php
// ✅ Good - paginated
$posts = app($context, 'database')->table('posts')
    ->limit(20)
    ->offset(($page - 1) * 20)
    ->get();

// ❌ Bad - load everything
$posts = app($context, 'database')->table('posts')->get();
```

### Count Efficiently

```php
// ✅ Good - database count
$count = app($context, 'database')->table('users')->count();

// ❌ Bad - load all then count
$count = count(app($context, 'database')->table('users')->get());
```

## Response Optimization

### Compress Responses

Enable gzip compression:

```php
// In middleware
if (!headers_sent() && extension_loaded('zlib')) {
    ob_start('ob_gzhandler');
}
```

### Minimize Payload

```php
// ✅ Good - minimal data
return Response::success([
    'id' => $user->uuid,
    'name' => $user->name,
    'email' => $user->email,
]);

// ❌ Bad - unnecessary data
return Response::success($user); // All columns
```

### Use HTTP Caching

```php
$response = Response::success($data);
$response->headers->set('Cache-Control', 'public, max-age=3600');
$response->headers->set('ETag', md5(json_encode($data)));

return $response;
```

## Code Optimization

### Avoid Loops for Large Data

```php
// ❌ Bad - loop
$total = 0;
foreach ($orders as $order) {
    $total += $order->amount;
}

// ✅ Good - database aggregation
$total = app($context, 'database')->table('orders')->sum('amount');
```

### Use Lazy Loading

```php
// Only load when needed
public function getUser($id)
{
    static $user;

    if (!$user) {
        $user = app($context, 'database')->table('users')->find($id);
    }

    return $user;
}
```

### Reduce Function Calls

```php
// ❌ Bad - repeated calls
for ($i = 0; $i < count($array); $i++) {
    // count() called each iteration
}

// ✅ Good - cache result
$length = count($array);
for ($i = 0; $i < $length; $i++) {
    // count() called once
}
```

## Memory Optimization

### Process Large Datasets in Chunks

```php
// ❌ Bad - load all at once
$users = app($context, 'database')->table('users')->get();
foreach ($users as $user) {
    // Process...
}

// ✅ Good - process in batches with limit/offset
$batchSize = 1000;
for ($offset = 0; ; $offset += $batchSize) {
    $batch = app($context, 'database')->table('users')->limit($batchSize)->offset($offset)->get();
    if (count($batch) === 0) {
        break;
    }
    foreach ($batch as $user) {
        // Process...
    }
}
```

### Unset Large Variables

```php
$largeData = processHugeFile();

// Use data...

unset($largeData); // Free memory
```

### Stream Large Files

```php
// ✅ Good - stream
$handle = fopen('large-file.csv', 'r');
while (($line = fgets($handle)) !== false) {
    // Process line
}
fclose($handle);

// ❌ Bad - load entire file
$contents = file_get_contents('large-file.csv');
```

## Profiling

### Time Execution

```php
$start = microtime(true);

// Code to profile

$duration = microtime(true) - $start;
app($context, \Psr\Log\LoggerInterface::class)->info('Execution time: ' . $duration . 's');
```

### Profile Queries

```php
$start = microtime(true);

$users = db($context)->table('users')->get();

app($context, \Psr\Log\LoggerInterface::class)->info('Query time: ' . (microtime(true) - $start) . 's');
```

### Memory Usage

```php
$memoryBefore = memory_get_usage();

// Code to profile

$memoryAfter = memory_get_usage();
$memoryUsed = $memoryAfter - $memoryBefore;

app($context, \Psr\Log\LoggerInterface::class)->info('Memory used: ' . ($memoryUsed / 1024 / 1024) . ' MB');
```

## Monitoring

### Key Metrics

Track these metrics:
- Response time (p50, p95, p99)
- Database query time
- Cache hit ratio
- Memory usage
- CPU usage
- Error rate

### Logging

```php
app($context, \Psr\Log\LoggerInterface::class)->info('Request processed', [
    'duration' => $duration,
    'memory' => memory_get_peak_usage(true),
    'queries' => $queryCount,
]);
```

## Production Optimizations

### Enable OPcache

`php.ini`:

```ini
opcache.enable=1
opcache.memory_consumption=256
opcache.max_accelerated_files=20000
opcache.validate_timestamps=0
```

### Optimize Composer Autoloader

```bash
composer dump-autoload --optimize --classmap-authoritative
```

### Use PHP-FPM

Configure PHP-FPM for better performance:

```ini
pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
```

### Enable HTTP/2

Configure your web server to use HTTP/2 for better performance.

## Configuration Tuning

Fine‑tune performance via config files:

- Cache (config/cache.php)
  - Stampede protection: `cache.stampede_protection.enabled`, `lock_ttl`, `max_wait_time`, `retry_interval`
  - Early expiration refresh: `cache.stampede_protection.early_expiration.enabled`, `threshold`
  - Tags: `cache.enable_tags` (uses Redis by default), `tags_store`
  - Distributed cache: `cache.distributed.enabled`, `strategy`, `replicas`, `failover`
  - Driver/timeouts: Redis host/port/password/timeouts; file path via `CACHE_FILE_PATH`

- Database (config/database.php)
  - Connection pooling: `database.pooling.enabled`, `defaults.*`, per‑engine overrides (mysql/pgsql/sqlite)
  - Query logging: `database.logging.enabled`, `slow_threshold` (ms), log path
  - Query cache: `database.query_cache.enabled`, `default_ttl`, `store` (redis), `auto_invalidate`

- App (config/app.php)
  - Performance monitoring: `app.performance.memory.*` (alert thresholds, sampling)
  - Environment defaults: `app.debug`, `force_https`, etc. for prod vs dev

Tip: Prefer environment‑aware toggles using `env()` (e.g., stricter limits in production), and validate with load testing after changes.

## Load Testing

### Apache Bench

```bash
ab -n 1000 -c 10 http://localhost:8000/api/users
```

### wrk

```bash
wrk -t12 -c400 -d30s http://localhost:8000/api/users
```

### Analyze Results

Look for:
- Requests per second
- Response time distribution
- Error rate
- Throughput

## Scaling

### Horizontal Scaling

- Add more application servers
- Use load balancer
- Share session storage (Redis)
- Centralize file storage (S3)

### Vertical Scaling

- Increase server resources
- Optimize code first
- More cost-effective initially

### Database Scaling

- Read replicas for read-heavy workloads
- Connection pooling
- Query optimization
- Sharding for very large datasets

## Best Practices Checklist

- [ ] Database queries are indexed
- [ ] N+1 queries are eliminated
- [ ] Expensive operations are cached
- [ ] Heavy work is queued
- [ ] Responses are minimized
- [ ] OPcache is enabled
- [ ] Composer autoloader is optimized
- [ ] Logs are aggregated
- [ ] Monitoring is in place
- [ ] Load testing performed

## Next Steps

- [Testing](/advanced/testing) - Performance testing
- [Configuration](/advanced/configuration) - Production config
- [Deployment](/deployment/production) - Production deployment
