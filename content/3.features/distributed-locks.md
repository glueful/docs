---
title: Distributed Locks
description: Coordinate work safely across processes and nodes
---

Prevent duplicate or overlapping execution of critical sections across workers or nodes with distributed locks.

## Quick Start

### Execute with Automatic Lock

```php
use Glueful\Lock\LockManagerInterface;

$lockManager = app($context, LockManagerInterface::class);

// Execute once, safely across processes
$result = $lockManager->executeWithLock('import:daily-customers', function () {
    return (new CustomerImporter())->run();
}, 900); // 15 min TTL
```

### Wait for Lock (Blocking)

```php
try {
    $data = $lockManager->waitAndExecute('sync:warehouse', function () {
        return runSync();
    }, maxWait: 30.0, ttl: 600);
} catch (\Symfony\Component\Lock\Exception\LockConflictedException $e) {
    // Timed out waiting
    app($context, \Psr\Log\LoggerInterface::class)->warning('Warehouse sync busy, skipped');
}
```

### Manual Lock Control

```php
$lock = $lockManager->createLock('rebuild-search-index', ttl: 300);

if ($lock->acquire()) {
    try {
        rebuildIndex();
    } finally {
        $lock->release();
    }
} else {
    app($context, \Psr\Log\LoggerInterface::class)->info('Index rebuild already in progress');
}
```

## Use Cases

### Prevent Duplicate Job Execution

```php
// In scheduled job
$lockManager->executeWithLock('daily:aggregation', function () {
    AggregateJob::run();
}, 3600);
```

### Singleton API Operations

```php
public function rebuildAnalytics(): Response
{
    try {
        $this->lockManager->executeWithLock('analytics:rebuild', function () {
            $this->service->rebuild();
        }, 1800);

        return Response::success('Rebuild complete');
    } catch (\Symfony\Component\Lock\Exception\LockConflictedException) {
        return Response::error('Rebuild already in progress', 409);
    }
}
```

### Batch Processing with Partition Locks

```php
foreach (array_chunk($userIds, 500) as $chunk) {
    $key = 'recalc:users:' . md5(json_encode($chunk));

    $lockManager->executeWithLock($key, function () use ($chunk) {
        recalcUserStats($chunk);
    }, 300);
}
```

### Conditional Execution

```php
if ($lockManager->isLocked('cache:warm')) {
    app($context, \Psr\Log\LoggerInterface::class)->info('Cache warming already in progress');
    return;
}

$lockManager->executeWithLock('cache:warm', function () {
    warmCacheLayers();
}, 600);
```

## Configuration

`config/lock.php`:

```php
return [
    'default' => env('LOCK_DRIVER', 'file'),

    'stores' => [
        'file' => [
            'driver' => 'file',
            'path' => env('LOCK_FILE_PATH', 'framework/locks'),
            'prefix' => 'lock_',
            'extension' => '.lock',
        ],

        'redis' => [
            'driver' => 'redis',
            // Connection is resolved from the container; prefix/ttl are used by the store
            'connection' => env('LOCK_REDIS_CONNECTION', 'default'),
            'prefix' => env('LOCK_REDIS_PREFIX', 'glueful_lock_'),
            'ttl' => 300, // seconds
        ],

        'database' => [
            'driver' => 'database',
            'table' => env('LOCK_DB_TABLE', 'locks'),
            'id_col' => 'key_id',
            'token_col' => 'token',
            'expiration_col' => 'expiration',
        ],
    ],

    'prefix' => env('LOCK_PREFIX', 'glueful_lock_'),
    'ttl' => env('LOCK_TTL', 300),

    'retry' => [
        'times' => env('LOCK_RETRY_TIMES', 10),
        'delay' => env('LOCK_RETRY_DELAY', 100), // ms
        'max_wait' => env('LOCK_MAX_WAIT', 10),  // seconds
    ],
];
```

### Environment Variables

```env
LOCK_DRIVER=redis
LOCK_REDIS_CONNECTION=default
LOCK_REDIS_PREFIX=glueful_lock_
LOCK_PREFIX=glueful_lock_
LOCK_TTL=300
```

## Lock Stores

### File Store (Default)

**Pros:**
- No external dependencies
- Simple setup
- Good for development

**Cons:**
- Single server only (unless shared filesystem)
- Slower on network filesystems

**Use for:** Development, single-server deployments

### Redis Store

**Pros:**
- Fast and atomic
- Works across multiple servers
- Wide support

**Cons:**
- Requires Redis server

**Use for:** Production multi-server deployments

```env
LOCK_DRIVER=redis
LOCK_REDIS_CONNECTION=default
```

### Database Store

**Pros:**
- Uses existing database
- No additional infrastructure

**Cons:**
- Slower than Redis
- Potential table contention

**Use for:** Low-volume locks, minimal infrastructure

```env
LOCK_DRIVER=database
LOCK_DB_TABLE=locks
```

## Advanced Patterns

### Long-Running Operations

Refresh lock during long operations:

```php
$lock = $lockManager->createLock('large:import', ttl: 600);

if ($lock->acquire(true)) { // blocking acquire
    try {
        while (!done()) {
            processChunk();

            // Extend lock if running low
            if ($lock->getRemainingLifetime() < 120) {
                $lock->refresh(600);
            }
        }
    } finally {
        $lock->release();
    }
}
```

### Multiple Locks

Acquire multiple locks atomically:

```php
$lockA = $lockManager->createLock('resource:a', ttl: 300);
$lockB = $lockManager->createLock('resource:b', ttl: 300);

if ($lockA->acquire() && $lockB->acquire()) {
    try {
        // Work with both resources
    } finally {
        $lockB->release();
        $lockA->release();
    }
}
```

### Named Locks for Resources

```php
// Per-user locks
$lockManager->executeWithLock("user:{$userId}:avatar", function () {
    regenerateAvatar($userId);
});

// Per-resource locks
$lockManager->executeWithLock("report:{$reportId}:generate", function () {
    generateReport($reportId);
});
```

## Error Handling

```php
use Symfony\Component\Lock\Exception\LockConflictedException;

try {
    $lockManager->executeWithLock('inventory:sync', function () {
        syncInventory();
    }, 300);
} catch (LockConflictedException $e) {
    // Lock already held
    app($context, \Psr\Log\LoggerInterface::class)->info('Inventory sync skipped: already running');

    // Optionally queue for retry
    $queue = app($context, \Glueful\Queue\QueueManager::class);
    $queue->push(RetryInventorySyncJob::class, [], queue: null, connection: null);
} catch (\Throwable $e) {
    app($context, \Psr\Log\LoggerInterface::class)->error('Inventory sync failed', ['error' => $e->getMessage()]);
    throw $e;
}
```

## Blocking vs Non-Blocking

### Non-Blocking (Default)

Returns immediately if lock unavailable:

```php
$lock = $lockManager->createLock('resource');

if ($lock->acquire()) {
    // Got lock
} else {
    // Lock busy, skip or retry
}
```

### Blocking

Waits until lock is available:

```php
// Wait indefinitely
$lock->acquire(true);

// Wait with timeout using waitAndExecute
$lockManager->waitAndExecute('resource', function () {
    // ...
}, maxWait: 30.0);
```

## Monitoring

Track lock performance:

```php
$start = microtime(true);

$lockManager->executeWithLock('feed:refresh', function () {
    app($context, \Psr\Log\LoggerInterface::class)->info('Refreshing feed with exclusive lock');
    refreshFeed();
});

$duration = microtime(true) - $start;
app($context, \Psr\Log\LoggerInterface::class)->info('Lock held for ' . $duration . 's');
```

### Key Metrics

- Lock acquisition latency
- Conflict count per key
- Average lock hold duration
- Expired vs. explicit releases
- Wait time distribution

## Naming Conventions

Use descriptive, hierarchical lock names that include the relevant identifiers — this keeps keys collision-free and makes monitoring readable:

```php
// Good — scoped and specific
"queue:worker:{$queue}:{$workerId}"
"scheduler:job:{$jobName}"
"import:users:batch:{$batchId}"
"user:export:{$userId}:format:{$format}"
"report:generate:{$reportType}:date:{$date}"

// Avoid — generic names that collide
"lock"
"process"
"task"
```

## Best Practices

### 1. Keep Critical Sections Small

```php
// ✅ Good - minimal lock scope
$lockManager->executeWithLock('counter:increment', function () {
    incrementCounter();
}, 5);

// ❌ Bad - large lock scope
$lockManager->executeWithLock('process:all', function () {
    loadData();
    transformData();
    saveResults();
    sendNotifications();
}, 600);
```

### 2. Use Idempotent Operations

```php
$lockManager->executeWithLock('update:stats', function () {
    // Safe to run multiple times
    recalculateStats();
});
```

### 3. Set Realistic TTLs

```php
// Typical duration + buffer
$lockManager->executeWithLock('import', function () {
    importData(); // Usually takes 5 min
}, 600); // 10 min TTL
```

### 4. Name Locks Semantically

```php
// ✅ Good - descriptive names
$lockManager->executeWithLock('user:42:avatar:regenerate', ...);
$lockManager->executeWithLock('report:daily-sales:generate', ...);

// ❌ Bad - generic names
$lockManager->executeWithLock('task1', ...);
$lockManager->executeWithLock('process', ...);
```

### 5. Avoid Unbounded Waits

```php
// ✅ Good - bounded wait
$lockManager->waitAndExecute('task', $callback, maxWait: 30.0);

// ❌ Bad - indefinite wait
$lock->acquire(true); // Could wait forever
```

### 6. Partition for High Contention

```php
// Split by shard instead of single lock
$shard = $userId % 10;
$lockManager->executeWithLock("process:shard:{$shard}", function () {
    processUserData($userId);
});
```

## Troubleshooting

**Frequent lock conflicts?**
- Reduce work inside critical section
- Add partitioning/sharding
- Use finer-grained lock keys

**Locks not released after crashes?**
- Shorten TTL
- Enable auto-release
- Add monitoring for expired locks

**High Redis usage?**
- Reduce lock granularity
- Batch operations
- Review lock TTLs

**Locks not working across servers?**
- File store requires shared filesystem
- Switch to Redis or Database store

**Database lock table growing?**
- Add cleanup job for expired locks
- Reduce TTL durations
- Implement purge strategy

## Scheduler Integration

Locks are automatically used by the scheduler to prevent overlapping jobs:

```php
// Scheduler internally uses:
// executeWithLock('scheduler:job:{$jobName}', ...)

// Configured in config/scheduler.php
[
    'name' => 'daily-report',
    'schedule' => '0 2 * * *',
    'handler_class' => 'App\\Jobs\\DailyReportJob',
    // Automatically locked during execution
]
```

## Next Steps

- [Queues & Jobs](queues-jobs) - Background processing
- [Scheduling](scheduling) - Scheduled tasks
- [Caching](caching) - Cache with locks
- [Performance](../advanced/performance) - Monitoring locks
