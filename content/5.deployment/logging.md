---
title: Logging
description: Configure and manage application logs
---

Implement effective logging strategies for debugging, monitoring, and auditing your application.

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

### Request Context

Add request context to all logs in a request:

```php
class LogContextMiddleware
{
    public function handle(Request $request, callable $next)
    {
        $context = [
            'request_id' => uniqid(),
            'user_id' => $request->user()?->id,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ];

        // Add context to all subsequent logs
        app($context, \Psr\Log\LoggerInterface::class)->withContext($context);

        return $next($request);
    }
}
```

### Application Context

```php
app($context, \Psr\Log\LoggerInterface::class)->info('Processing job', [
    'job' => get_class($job),
    'queue' => $queue,
    'attempt' => $attempt,
    'max_attempts' => $maxAttempts,
]);
```

## Logging Patterns

### API Requests

```php
class ApiLoggingMiddleware
{
    public function handle(Request $request, callable $next)
    {
        $start = microtime(true);

        app($context, \Psr\Log\LoggerInterface::class)->info('API request started', [
            'method' => $request->method(),
            'path' => $request->path(),
            'query' => $request->query(),
        ]);

        $response = $next($request);

        app($context, \Psr\Log\LoggerInterface::class)->info('API request completed', [
            'method' => $request->method(),
            'path' => $request->path(),
            'status' => $response->getStatusCode(),
            'duration' => round((microtime(true) - $start) * 1000, 2) . 'ms',
        ]);

        return $response;
    }
}
```

### Database Queries

```php
class QueryLogger
{
    public function log(string $sql, array $bindings, float $duration): void
    {
        if ($duration > 1.0) {
            app($context, \Psr\Log\LoggerInterface::class)->warning('Slow query detected', [
                'sql' => $sql,
                'bindings' => $bindings,
                'duration' => $duration . 's',
            ]);
        }

        if (config($context, 'app.debug')) {
            app($context, \Psr\Log\LoggerInterface::class)->debug('Query executed', [
                'sql' => $sql,
                'bindings' => $bindings,
                'duration' => $duration . 's',
            ]);
        }
    }
}
```

### Queue Jobs

```php
class ProcessOrderJob extends Job
{
    public function handle(): void
    {
        app($context, \Psr\Log\LoggerInterface::class)->info('Processing order', [
            'order_id' => $this->orderId,
            'job_id' => $this->job->id(),
        ]);

        try {
            $this->processOrder();

            app($context, \Psr\Log\LoggerInterface::class)->info('Order processed successfully', [
                'order_id' => $this->orderId,
            ]);
        } catch (\Exception $e) {
            app($context, \Psr\Log\LoggerInterface::class)->error('Order processing failed', [
                'order_id' => $this->orderId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }
}
```

### Authentication Events

```php
// Successful login
app($context, \Psr\Log\LoggerInterface::class)->info('User logged in', [
    'user_id' => $user->id,
    'email' => $user->email,
    'ip' => $request->ip(),
]);

// Failed login
app($context, \Psr\Log\LoggerInterface::class)->warning('Failed login attempt', [
    'email' => $request->input('email'),
    'ip' => $request->ip(),
    'reason' => 'invalid_credentials',
]);

// Account lockout
app($context, \Psr\Log\LoggerInterface::class)->critical('Account locked', [
    'user_id' => $user->id,
    'failed_attempts' => $attempts,
]);
```

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

## Centralized Logging

### Send to External Service

#### Logtail/Better Stack

```php
class LogtailLogger
{
    private string $sourceToken;

    public function log(string $level, string $message, array $context = []): void
    {
        $payload = [
            'dt' => date('c'),
            'level' => $level,
            'message' => $message,
            'context' => $context,
        ];

        $ch = curl_init('https://in.logtail.com');
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->sourceToken,
        ]);
        curl_exec($ch);
        curl_close($ch);
    }
}
```

#### ELK Stack (Elasticsearch)

```php
class ElasticsearchLogger
{
    public function log(string $level, string $message, array $context = []): void
    {
        $document = [
            'timestamp' => date('c'),
            'level' => $level,
            'message' => $message,
            'context' => $context,
            'app' => config($context, 'app.name'),
            'env' => config($context, 'app.env'),
        ];

        $client = new \Elasticsearch\Client([
            'hosts' => [config($context, 'logging.elasticsearch.host')],
        ]);

        $client->index([
            'index' => 'logs-' . date('Y.m.d'),
            'body' => $document,
        ]);
    }
}
```

## Sensitive Data

### Redact Sensitive Information

```php
class SecureLogger
{
    private array $redactKeys = [
        'password',
        'token',
        'secret',
        'api_key',
        'credit_card',
        'ssn',
    ];

    public function log(string $level, string $message, array $context = []): void
    {
        $context = $this->redactSensitiveData($context);
        app($context, \Psr\Log\LoggerInterface::class)->log($level, $message, $context);
    }

    private function redactSensitiveData(array $data): array
    {
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $data[$key] = $this->redactSensitiveData($value);
            } elseif ($this->isSensitiveKey($key)) {
                $data[$key] = '***REDACTED***';
            }
        }

        return $data;
    }

    private function isSensitiveKey(string $key): bool
    {
        foreach ($this->redactKeys as $redactKey) {
            if (stripos($key, $redactKey) !== false) {
                return true;
            }
        }

        return false;
    }
}
```

### Usage

```php
$secureLogger = new SecureLogger();

$secureLogger->log('info', 'User updated', [
    'user_id' => 123,
    'email' => 'john@example.com',
    'password' => 'secret123', // Will be redacted
    'api_key' => 'sk_test_123', // Will be redacted
]);
```

## Performance

### Async Logging

Queue log messages for async processing:

```php
class AsyncLogger
{
    public function log(string $level, string $message, array $context = []): void
    {
        Queue::push(new LogMessageJob($level, $message, $context));
    }
}

class LogMessageJob extends Job
{
    public function __construct(
        private string $level,
        private string $message,
        private array $context
    ) {}

    public function handle(): void
    {
        app($context, \Psr\Log\LoggerInterface::class)->log($this->level, $this->message, $this->context);
    }
}
```

### Buffered Logging

```php
class BufferedLogger
{
    private array $buffer = [];
    private int $flushThreshold = 100;

    public function log(string $level, string $message, array $context = []): void
    {
        $this->buffer[] = [$level, $message, $context];

        if (count($this->buffer) >= $this->flushThreshold) {
            $this->flush();
        }
    }

    public function flush(): void
    {
        foreach ($this->buffer as [$level, $message, $context]) {
            app($context, \Psr\Log\LoggerInterface::class)->log($level, $message, $context);
        }

        $this->buffer = [];
    }

    public function __destruct()
    {
        $this->flush();
    }
}
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
