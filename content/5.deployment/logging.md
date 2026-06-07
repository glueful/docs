---
title: Logging
description: Operational logging — channels, levels, rotation, and debugging for deployed applications.
---

Operational logging for deployed applications: channels, levels, rotation, and debugging.

::u-alert{color="neutral" variant="subtle" icon="i-lucide-scroll-text"}
For the framework's logging internals — the framework-vs-application boundary, `LogManager`, database logging, query-performance logging, and deprecation handling — see the canonical [Logging guide](/cookbook/logging).
::

## Quick Start

### Basic Logging

```php
// Log messages at different levels
app($context, \Psr\Log\LoggerInterface::class)->debug('Debugging info', ['user_id' => 123]);
app($context, \Psr\Log\LoggerInterface::class)->info('User registered', ['email' => 'john@example.com']);
app($context, \Psr\Log\LoggerInterface::class)->warning('Cache miss', ['key' => 'users:active']);
app($context, \Psr\Log\LoggerInterface::class)->error('Payment failed', ['order_id' => 'abc123', 'error' => $e->getMessage()]);
app($context, \Psr\Log\LoggerInterface::class)->critical('Database connection lost');
```

### Structured Logging

Always include context:

```php
app($context, \Psr\Log\LoggerInterface::class)->info('Order created', [
    'order_id' => $order->id,
    'user_id' => $order->user_id,
    'total' => $order->total,
    'items_count' => count($order->items),
    'payment_method' => $order->payment_method,
]);
```

### Channel Logging

Log to a specific channel (e.g., `api`, `app`, `framework`):

```php
// If your app exposes the LogManager via helper
app($context, \Psr\Log\LoggerInterface::class)->channel('api')->info('API request', ['path' => $request->path()]);

// Or via the container/DI
use Glueful\Logging\LogManager;
/** @var LogManager $log */
$log = container($context)->get(LogManager::class);
$log->channel('framework')->warning('Slow request', ['duration_ms' => 1250]);
```

## Configuration

### Log Channels

`config/logging.php` (summary of defaults):

```php
return [
  'framework' => [
    'enabled' => env('FRAMEWORK_LOGGING_ENABLED', true),
    'level' => env('FRAMEWORK_LOG_LEVEL', 'info'),
    // feature toggles: log_exceptions, log_deprecations, etc.
  ],

  'application' => [
    'default_channel' => env('LOG_CHANNEL', 'app'),
    'level' => env('LOG_LEVEL', match (env('APP_ENV')) {
      'production' => 'error',
      'staging' => 'warning',
      default => 'debug'
    }),
    'log_to_file' => env('LOG_TO_FILE', true),
    'log_to_db' => env('LOG_TO_DB', true),
  ],

  'paths' => [
    'log_directory' => env('LOG_FILE_PATH', base_path('storage/logs') . '/'),
  ],

  'rotation' => [
    'days' => env('LOG_ROTATION_DAYS', 30),
    'strategy' => env('LOG_ROTATION_STRATEGY', 'daily'),
  ],

  'channels' => [
    'framework' => [ 'driver' => 'daily', 'path' => base_path('storage/logs') . '/framework.log' ],
    'app'       => [ 'driver' => 'daily', 'path' => base_path('storage/logs') . '/app.log' ],
    'api'       => [ 'driver' => 'daily', 'path' => base_path('storage/logs') . '/api.log' ],
    'error'     => [ 'driver' => 'daily', 'path' => base_path('storage/logs') . '/error.log', 'level' => 'error' ],
    'debug'     => [ 'driver' => 'daily', 'path' => base_path('storage/logs') . '/debug.log', 'level' => 'debug' ],
  ],
];
```

### Environment Variables

```.env
# Application logging
LOG_CHANNEL=app
LOG_LEVEL=info
LOG_TO_FILE=true
LOG_TO_DB=true

# Framework logging
FRAMEWORK_LOGGING_ENABLED=true
FRAMEWORK_LOG_LEVEL=info

# Files and rotation
LOG_FILE_PATH=/var/www/your-app/storage/logs/
LOG_ROTATION_DAYS=30
LOG_ROTATION_STRATEGY=daily
```

### File Locations

Default files under `storage/logs/`:
- `app.log` — application events
- `api.log` — API request/response details
- `framework.log` — framework lifecycle/errors
- `error.log` — errors-only channel
- `debug.log` — verbose debugging when enabled

## Log Levels

### When to Use Each Level

```php
// DEBUG - Development debugging only
app($context, \Psr\Log\LoggerInterface::class)->debug('SQL query executed', [
    'sql' => $sql,
    'bindings' => $bindings,
    'duration' => $duration,
]);

// INFO - Significant events
app($context, \Psr\Log\LoggerInterface::class)->info('User logged in', [
    'user_id' => $user->id,
    'ip' => $request->ip(),
]);

// WARNING - Unexpected but handled situations
app($context, \Psr\Log\LoggerInterface::class)->warning('API rate limit approaching', [
    'user_id' => $user->id,
    'requests' => $count,
    'limit' => $limit,
]);

// ERROR - Runtime errors that need attention
app($context, \Psr\Log\LoggerInterface::class)->error('External API failed', [
    'service' => 'stripe',
    'endpoint' => '/charges',
    'error' => $exception->getMessage(),
    'request_id' => $requestId,
]);

// CRITICAL - System failures requiring immediate action
app($context, \Psr\Log\LoggerInterface::class)->critical('Database connection failed', [
    'host' => config($context, 'database.host'),
    'error' => $exception->getMessage(),
]);
```

## Contextual Logging

The framework's standard log processor automatically attaches request context (request ID, method, path, and — once authenticated — the user) to every log line, so you don't need custom middleware for that. Add your own context per call via the second argument:

```php
app($context, \Psr\Log\LoggerInterface::class)->info('Processing job', [
    'job' => get_class($job),
    'queue' => $queue,
    'attempt' => $attempt,
    'max_attempts' => $maxAttempts,
]);
```

For the framework-vs-application logging boundary and how to attach context from listeners, see the canonical [Logging guide](/cookbook/logging).

## Log Rotation

### Configure Rotation

`/etc/logrotate.d/glueful`:

```
/var/www/app/storage/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        # Optionally reload PHP-FPM
        systemctl reload php8.3-fpm > /dev/null 2>&1 || true
    endscript
}
```

Tip: The `daily` driver rotates files automatically and keeps the last N days, controlled by the `days` option (see `config/logging.php` and `LOG_ROTATION_DAYS`). Use system `logrotate` in addition to (or instead of) application rotation if you centralize logs or need OS-level policies.

### Manual Rotation

```bash
# Force rotation
logrotate -f /etc/logrotate.d/glueful

# Test configuration
logrotate -d /etc/logrotate.d/glueful
```

## Debugging

### Enable Debug Mode

```.env
APP_DEBUG=true
LOG_LEVEL=debug
```

### Debug Specific Components

```php
if (config($context, 'app.debug')) {
    app($context, \Psr\Log\LoggerInterface::class)->debug('Cache operation', [
        'operation' => 'get',
        'key' => $key,
        'hit' => $hit,
        'ttl' => $ttl,
    ]);
}
```

### Conditional Logging

```php
// Log only in specific environments
if (in_array(config($context, 'app.env'), ['development', 'staging'])) {
    app($context, \Psr\Log\LoggerInterface::class)->debug('Development log', $data);
}

// Log only for specific users
if ($request->user()?->is_admin) {
    app($context, \Psr\Log\LoggerInterface::class)->info('Admin action', ['action' => $action]);
}
```

## Best Practices

### 1. Use Appropriate Log Levels

```php
// ✅ Good - correct levels
app($context, \Psr\Log\LoggerInterface::class)->info('User registered');  // Normal event
app($context, \Psr\Log\LoggerInterface::class)->error('Payment failed'); // Error condition

// ❌ Bad - wrong levels
app($context, \Psr\Log\LoggerInterface::class)->error('User registered');  // Not an error
app($context, \Psr\Log\LoggerInterface::class)->info('Database crashed');  // Too severe
```

### 2. Include Context

```php
// ✅ Good - rich context
app($context, \Psr\Log\LoggerInterface::class)->error('Order failed', [
    'order_id' => $order->id,
    'user_id' => $user->id,
    'error' => $e->getMessage(),
]);

// ❌ Bad - no context
app($context, \Psr\Log\LoggerInterface::class)->error('Order failed');
```

### 3. Be Consistent

```php
// ✅ Good - consistent format
app($context, \Psr\Log\LoggerInterface::class)->info('User action', ['action' => 'login', 'user_id' => 123]);
app($context, \Psr\Log\LoggerInterface::class)->info('User action', ['action' => 'logout', 'user_id' => 123]);

// ❌ Bad - inconsistent
app($context, \Psr\Log\LoggerInterface::class)->info('User logged in', ['user' => 123]);
app($context, \Psr\Log\LoggerInterface::class)->info('Logout: 123');
```

### 4. Avoid Excessive Logging

```php
// ✅ Good - meaningful logs
app($context, \Psr\Log\LoggerInterface::class)->info('Batch processed', ['count' => 1000]);

// ❌ Bad - noisy
foreach ($items as $item) {
    app($context, \Psr\Log\LoggerInterface::class)->info('Processing item', ['id' => $item->id]);
}
```

## Troubleshooting

**Logs not appearing?**
- Check `LOG_LEVEL` in `.env`
- Verify log file permissions
- Check disk space
- Review log path configuration

**Log files too large?**
- Enable log rotation
- Lower `LOG_LEVEL` in production
- Implement sampling for high-volume logs

**Performance impact?**
- Use async logging
- Reduce log verbosity
- Sample high-frequency logs

## Next Steps

- [Monitoring](/deployment/monitoring) - Application monitoring
- [Performance](/advanced/performance) - Optimize logging
- [Security](/deployment/security-hardening) - Secure logs
- [Production Setup](/deployment/production) - Production logging config
