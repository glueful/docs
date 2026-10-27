---
title: Performance
description: Optimize your Glueful application for production
---

Optimize your application for speed, efficiency, and scalability. This is the canonical performance page: quick wins first, then the framework's query caching, analysis and profiling tools, response caching, and the configuration that tunes them.

::u-alert{color="neutral" variant="subtle" icon="i-lucide-gauge"}
Memory monitoring, streaming and chunked processing have their own guide: [Memory Management](/cookbook/memory-management).
::

Examples resolve services with `app($context, ...)` / `db($context)`; inside a closure, pass `$context` in with `use`, or inject the service in the constructor instead.

## Quick Wins

### Cache Expensive Work

```php
use Glueful\Cache\CacheStore;

$cache = app($context, CacheStore::class);

$posts = $cache->remember('posts:published', function () use ($context) {
    return db($context)->table('posts')
        ->where('status', 'published')
        ->get();
}, 3600);
```

### Use Indexes

```php
// In a migration
$schema->alterTable('posts', function ($table) {
    $table->index('author_uuid');
    $table->index('status');
    $table->index(['status', 'created_at']);
});
```

### Queue Heavy Operations

```php
use Glueful\Queue\QueueManager;

// Don't process inline
$queue = app($context, QueueManager::class);
$queue->push(\App\Jobs\ProcessImageJob::class, ['path' => $path]);
$queue->push(\App\Jobs\SendEmailJob::class, ['user_uuid' => $userUuid]);
```

## Database Optimization

### Select Only Needed Columns

```php
// Good - specific columns
$posts = db($context)->table('posts')
    ->select(['uuid', 'title', 'published_at'])
    ->get();

// Bad - all columns
$posts = db($context)->table('posts')->get();
```

### Avoid N+1 Queries

```php
// Bad - one query per post
$posts = db($context)->table('posts')->get();
foreach ($posts as $i => $post) {
    $posts[$i]['author'] = db($context)->table('authors')
        ->where('uuid', $post['author_uuid'])
        ->first();
}

// Good - one query with a join
$posts = db($context)->table('posts')
    ->join('authors', 'posts.author_uuid', '=', 'authors.uuid')
    ->select(['posts.*', 'authors.name AS author_name'])
    ->get();
```

With ORM models, eager load relations with `with()`. The ORM's lazy-loading detector flags N+1 access: set `DB_LAZY_LOADING_MODE` to `off`, `warn` (log `[GLUEFUL-N+1]` warnings), `strict` (throw `LazyLoadingViolationException`) or `auto` (the default: `warn` in development, `off` otherwise).

### Use Batch Operations

```php
// Bad - one INSERT per row
foreach ($rows as $row) {
    db($context)->table('events')->insert($row);
}

// Good - one batched INSERT (returns affected rows)
db($context)->table('events')->insertBatch($rows);

// Insert one row, or update the listed columns on a key conflict
db($context)->table('counters')->upsert(['key' => 'home', 'hits' => 1], ['hits']);
```

### Paginate

```php
// paginate() runs the page query plus a count query
$page = db($context)->table('posts')
    ->where('status', 'published')
    ->orderBy(['published_at' => 'DESC'])
    ->paginate(page: 1, perPage: 20);

// ['data' => [...], 'current_page' => 1, 'per_page' => 20, 'total' => ..., 'last_page' => ...,
//  'has_more' => true, 'from' => 1, 'to' => 20, 'execution_time_ms' => ...]
```

### Aggregate in the Database

The query builder has `count()` and `max()`. Use `selectRaw()` for other aggregates:

```php
// Good - database count
$count = db($context)->table('posts')->count();

// Bad - load everything, then count
$count = count(db($context)->table('posts')->get());

// Sums and averages
$row = db($context)->table('orders')
    ->selectRaw('SUM(total) AS revenue, AVG(total) AS average')
    ->where('status', 'paid')
    ->first();
```

### Process Large Tables in Batches

`ChunkedDatabaseProcessor` walks a table by primary key (keyset pagination, so late chunks stay as fast as early ones) and hands each chunk to your callback. Pass it the Glueful `Connection`:

```php
use Glueful\Performance\ChunkedDatabaseProcessor;

$processor = new ChunkedDatabaseProcessor(db($context), 1000);

// processTableInChunks(table, callback, idColumn = 'id', conditions = [], chunkSize = null)
$results = $processor->processTableInChunks('events', function (array $rows) {
    foreach ($rows as $row) {
        // Process...
    }
    return count($rows);
}, 'id', ['status' => 'pending']);
```

`processSelectQuery($sql, $callback, $params, $chunkSize)` does the same for an arbitrary SELECT. A `PDO` or `mysqli` handle is still accepted. **Since 1.91** the constructor is typed `Connection|PDO|mysqli` and table chunking with a `Connection` uses the query builder; before, it needed `getPDO()`. See [Memory Management](/cookbook/memory-management) for streaming and memory-aware processing.

## Query Caching

### Per-Query Caching

Call `cache()` on a query to serve repeated identical queries from the cache store. The key is a hash of the SQL and bindings; each cached result is tagged with its tables:

```php
// Default TTL (database.query_cache.default_ttl, 3600s)
$featured = db($context)->table('products')
    ->where('featured', true)
    ->cache()
    ->get();

// Custom TTL and extra invalidation tags
$recent = db($context)->table('articles')
    ->where('status', 'published')
    ->orderBy(['published_at' => 'DESC'])
    ->limit(5)
    ->cache(300, ['homepage'])
    ->get();
```

Writes don't invalidate cached reads automatically. Invalidate a table's cached queries after you change it:

```php
use Glueful\Database\QueryCacheService;

app($context, QueryCacheService::class)->invalidateTable('products');
```

Queries matching `database.query_cache.exclude_patterns`, or touching `exclude_tables`, are never cached. Invalidation is tag-based, so it needs a tag-capable store (`redis` or `file`; not `memcached`).

### Repository Method Caching

Mark repository methods with `#[CacheResult]` and call them through `QueryCacheService::cacheRepositoryMethod()`. Calling the method directly bypasses the cache:

```php
use Glueful\Database\Attributes\CacheResult;
use Glueful\Repository\BaseRepository;

class ProductRepository extends BaseRepository
{
    public function getTableName(): string
    {
        return 'products';
    }

    #[CacheResult(ttl: 7200, keyPrefix: 'products.featured', tags: ['products', 'catalog'])]
    public function featured(): array
    {
        return $this->db->table($this->table)->where('featured', true)->get();
    }
}

// In a service
$products = $this->queryCache->cacheRepositoryMethod($this->products, 'featured');
$byCategory = $this->queryCache->cacheRepositoryMethod($this->products, 'byCategory', [$category]);
```

| `#[CacheResult]` parameter | Default | Meaning |
|---|---|---|
| `ttl` | `3600` | Seconds to keep the result |
| `keyPrefix` | `''` | Key base; empty uses `Class::method` |
| `tags` | `[]` | Tags added to the entry for `invalidateTags()` |

### When to Cache Queries

Cache read-heavy, expensive and repeated queries. Avoid it for rapidly changing tables, one-off queries, non-deterministic SQL (`RAND()`, `NOW()`), and per-user sensitive data unless the key includes the user.

## Query Analysis and Profiling

### db:profile

Profile a query from the command line:

```bash
php glueful db:profile "SELECT * FROM posts WHERE status = ?" --params='["published"]'

# With execution plan and pattern analysis
php glueful db:profile "SELECT * FROM posts WHERE status = 'published'" --explain --patterns

# From a file, as JSON
php glueful db:profile --file=slow-query.sql --output=json

# Run it 50 times, or compare against another query file
php glueful db:profile --file=a.sql --benchmark=50
php glueful db:profile --file=a.sql --compare=b.sql
```

| Option | Purpose |
|---|---|
| `query` (argument) | SQL to profile |
| `--file`, `-f` | Read the SQL from a file |
| `--params`, `-p` | Bindings as a JSON array |
| `--explain`, `-e` | Include execution plan analysis |
| `--patterns` | Detect known anti-patterns and recommend fixes |
| `--output`, `-o` | `table`, `json` or `detailed` |
| `--benchmark`, `-b` | Run the query N times |
| `--compare`, `-c` | Compare with a query from another file |

### QueryAnalyzer

`analyzeQuery()` returns the execution plan, detected issues, suggestions and index recommendations:

```php
use Glueful\Database\QueryAnalyzer;

$analyzer = new QueryAnalyzer($context);
$report = $analyzer->analyzeQuery(
    'SELECT * FROM orders WHERE customer_uuid = ? ORDER BY created_at DESC',
    [$customerUuid]
);

$report['execution_plan'];          // normalized EXPLAIN output (MySQL, PostgreSQL, SQLite)
$report['potential_issues'];        // detected anti-patterns
$report['optimization_suggestions'];
$report['index_recommendations'];
```

### QueryOptimizer

The optimizer rewrites a SQL string and estimates the gain. It returns the result for you to inspect; it doesn't run anything:

```php
use Glueful\Database\QueryOptimizer;

$optimizer = (new QueryOptimizer())->setConnection(db($context));
$result = $optimizer->optimizeQuery($sql, $bindings);

$result['original_query'];
$result['optimized_query'];
$result['suggestions'];             // each: type, description, solution, ...
$result['estimated_improvement'];   // execution_time, resource_usage, confidence
```

Compare plans of the original and optimized SQL (for example with `db:profile --compare`) before adopting a rewrite.

::u-alert{color="warning" variant="subtle" icon="i-tabler-alert-triangle"}
#description
**Deprecated since 1.91: `QueryBuilder::optimize()`.** Chaining `->optimize()` onto a query never had any effect, and it is now a documented no-op that returns the builder. Remove the call; call `QueryOptimizer::optimizeQuery()` explicitly when you want an analysis.
::

### Execution Plans and Patterns

```php
use Glueful\Database\Tools\ExecutionPlanAnalyzer;
use Glueful\Database\Tools\QueryPatternRecognizer;

$plans = new ExecutionPlanAnalyzer(db($context), $context);
$plan = $plans->getExecutionPlan($sql, $bindings);
$analysis = $plans->analyzeExecutionPlan($plan);

$recognizer = new QueryPatternRecognizer();
$recognizer->addPattern(
    'leading_wildcard',
    '/LIKE\s+[\'"]%/i',
    'LIKE with a leading wildcard cannot use an index',
    'Use full-text search or an index-friendly prefix match'
);
$matches = $recognizer->recognizePatterns($sql);
// ['leading_wildcard' => ['description' => ..., 'recommendation' => ...]]
```

### QueryProfilerService

Wrap the execution of a query to record its duration, memory and backtrace. Thresholds and sampling come from `database.profiler.threshold` (ms, default 100) and `database.profiler.sampling_rate` (default 1.0):

```php
use Glueful\Database\Tools\QueryProfilerService;

$profiler = new QueryProfilerService(context: $context);

$rows = $profiler->profile($sql, $bindings, function () use ($context) {
    return db($context)->table('orders')->where('status', 'open')->get();
});

$slow = $profiler->getRecentProfiles(10, 100.0);  // last 10 at or above 100ms
$stats = $profiler->getStatistics();
```

### Query Logging

`config/database.php` → `logging` turns on query logging (`DB_LOGGING`, on outside production by default) with a slow-query threshold (`DB_SLOW_MS`, default 100ms).

Tag a query with `withPurpose('...')` (`db($context)->table('orders')->withPurpose('checkout.totals')->get()`) to carry a label into the query log and `Glueful\Events\Database\QueryExecutedEvent`. The event fires in any mode (not only debug) whenever a listener is registered, so it's the hook for shipping query timings to your own metrics.

### Development Query Monitor

In development (`APP_ENV=development`), the framework turns on `Glueful\Database\DevelopmentQueryMonitor` at boot (disable with `ENABLE_QUERY_MONITORING=false`). Every query the builder runs is fed to it, and at the end of the request it writes a `QUERY SUMMARY` line (total and average time, slow and duplicate query counts, peak memory) to the PHP error log, with details of any duplicated queries.

| Env | Default | Meaning |
|---|---|---|
| `SLOW_QUERY_THRESHOLD` | `0.5` | Seconds above which a query counts as slow |
| `N_PLUS_ONE_THRESHOLD` | `10` | Repetitions of the same query shape before it's flagged |

`DevelopmentQueryMonitor::getStats()` returns the current request's counters, for example to assert on query counts in a test. In production the monitor stays off whatever the env flag says.

### Pool Statistics

With connection pooling enabled, `Connection::getPoolManager()?->getStats()` / `getAggregateStats()` / `getHealthStatus()` report active and idle connections, acquisition timeouts and health-check failures per engine. See [Database: Connection Pooling](/essentials/database#connection-pooling) for the settings.

## Response Optimization

### HTTP Caching

`Glueful\Http\Response` has helpers for cache headers and ETags:

```php
use Glueful\Http\Response;

return Response::success($config)
    ->withCacheHeaders(3600, true)        // public, max-age=3600
    ->withETag(md5(json_encode($config)));

// Private, short-lived data
return Response::success($profile)->withCacheHeaders(300, false);
```

Add the `conditional_cache` middleware to answer `304 Not Modified` when the client's `If-None-Match` / `If-Modified-Since` matches. Its params are the strategy (`etag`, `last_modified`, `both`) and whether to generate a weak ETag from the body when none is set:

```php
$router->get('/catalog', [CatalogController::class, 'index'])
    ->middleware('conditional_cache:etag,1');
```

Pass `0` or omit the second param to turn generation off; any other value turns it on.

### Controller Response Caching

`BaseController` includes `ResponseCachingTrait`. `cacheResponse()` caches the callback's result under a key scoped to the controller, the query string, the user and the `Accept` / `Accept-Language` headers:

```php
public function index(): Response
{
    $products = $this->cacheResponse('products.index', function () {
        return $this->products->featured();
    }, 600);

    return Response::success($products);
}
```

Pass tags as the fourth argument (`cacheResponse('products.index', $fn, 600, ['products'])`) and evict with `$this->invalidateCache(['products'])`; with no tags, `invalidateCache()` clears the current user's `user:{uuid}` tag. Since 1.91 the tags are actually stored with the entry, so this invalidation works.

`cacheByPermission($key, $callback, $defaultTtl)` picks the TTL by user type (admins 5 minutes, anonymous 30 minutes, ...), and `withCacheHeaders($response, $options)`, `cachedResponse()`, `conditionalCache()`, `cacheFragment()` and `edgeCacheResponse()` cover the other cases. Cache by data, not by `Response` object.

### Minimize Payload

Return only the fields clients need, or let them choose with [field selection](/features/field-selection) (`?fields=`).

### Compression

Let the web server or proxy compress responses (gzip / brotli in nginx, Caddy, or your CDN) rather than PHP.

## Configuration Tuning

| Area | Keys |
|---|---|
| Cache (`config/cache.php`) | `ttl` (`CACHE_TTL`); `stampede_protection.enabled` (`CACHE_STAMPEDE_PROTECTION`, off by default), `lock_ttl`, `max_wait_time`, `retry_interval`, `early_expiration.enabled` / `threshold`. There is no tag switch: the `redis` and `file` stores support tags (`file` since 1.91), `memcached` does not. The old `cache.lock_ttl`, `enable_tags`, `distributed` and `tags_store` keys were removed because nothing read them |
| Query cache (`config/database.php`) | `query_cache.enabled` (`QUERY_CACHE_ENABLED`), `default_ttl` (`QUERY_CACHE_TTL`), `exclude_tables`, `exclude_patterns` |
| Database (`config/database.php`) | `pooling.enabled` (`DB_POOLING_ENABLED`) and `pooling.defaults.*` (`DB_POOL_MIN_CONNECTIONS`, `DB_POOL_MAX_CONNECTIONS`, `DB_POOL_IDLE_TIMEOUT`, ...); `retry.max_attempts`, `retry.backoff_base_ms`; `logging.*`; `profiler.*`; `orm.lazy_loading_mode` |
| Memory (`config/app.php`) | `performance.memory.monitoring.*` (`MEMORY_MONITORING_ENABLED`, `MEMORY_ALERT_THRESHOLD`, `MEMORY_CRITICAL_THRESHOLD`, `MEMORY_SAMPLE_RATE`), `limits.*`, `gc.*` |

Stampede protection applies to `Glueful\Helpers\CacheHelper::remember()`. Prefer environment-aware toggles via `env()`, and confirm changes with a load test.

## Profiling

### Time and Memory

```php
use Psr\Log\LoggerInterface;

$start = microtime(true);
$memoryBefore = memory_get_usage();

// Code to profile

app($context, LoggerInterface::class)->info('Profiled block', [
    'ms' => round((microtime(true) - $start) * 1000, 2),
    'memory_mb' => round((memory_get_usage() - $memoryBefore) / 1048576, 2),
    'peak_mb' => round(memory_get_peak_usage(true) / 1048576, 2),
]);
```

The boot profiler and the `tracing` / `metrics` middleware cover request-level timing; see [Memory Management](/cookbook/memory-management#tracing-and-metrics).

## Monitoring

Track response time (p50 / p95 / p99), database query time, cache hit ratio, memory, CPU and error rate. `php glueful system:memory` reports memory use; `php glueful cache:status` reports the cache store.

## Production Optimizations

### Enable OPcache

`php.ini`:

```ini
opcache.enable=1
opcache.memory_consumption=256
opcache.max_accelerated_files=20000
opcache.validate_timestamps=0
```

With `validate_timestamps=0`, reload PHP-FPM after every deploy or config change.

### Optimize the Autoloader and Caches

```bash
composer dump-autoload --optimize --classmap-authoritative

php glueful di:container:compile      # precompile the container
php glueful commands:cache            # cache the console command manifest
php glueful extensions:cache          # cache the enabled extension list
php glueful system:production         # production readiness checks
```

Routes are compiled to a route cache automatically (`ROUTE_CACHE`, on by default); inspect it with `route:cache:status` and clear it with `route:cache:clear`.

### Restart Workers on Deploy

```bash
php glueful queue:restart
```

Workers finish their current job and exit, so your supervisor starts them on the new code.

### Use PHP-FPM

```ini
pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
```

## Load Testing

```bash
# Apache Bench
ab -n 1000 -c 10 http://localhost:8000/api/v1/posts

# wrk
wrk -t12 -c400 -d30s http://localhost:8000/api/v1/posts
```

Look at requests per second, the response-time distribution, and the error rate.

## Scaling

- **Horizontally**: run more app servers behind a load balancer; share cache, locks and sessions through Redis, and storage through an object store (`glueful/storage-s3`, `-gcs`, `-azure`).
- **Database**: connection pooling, read-heavy caching, query optimization, read replicas.
- **Vertically**: add resources, after optimizing the code.

## Best Practices Checklist

- [ ] Queried columns are indexed
- [ ] N+1 queries are eliminated (`DB_LAZY_LOADING_MODE=warn` in development)
- [ ] Expensive reads are cached, and invalidated on write
- [ ] Heavy work is queued
- [ ] Responses are minimal and carry cache headers where safe
- [ ] OPcache is enabled; autoloader and container are compiled
- [ ] Workers restart on deploy
- [ ] Monitoring and load testing are in place

## Next Steps

- [Memory Management](/cookbook/memory-management) - memory monitoring, streaming, chunked processing
- [Caching](/features/caching) - cache stores, tags, stampede protection
- [Testing](/advanced/testing) - performance testing
