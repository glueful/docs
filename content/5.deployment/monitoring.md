---
title: Monitoring
description: Monitor your application in production
---

Track your application's health, performance, and errors in production.

## Quick Start

### Built-in Health Endpoints

Glueful provides production-ready health routes out of the box; no custom route is required.

- Liveness: `GET /healthz`
- Overall health: `GET /health`
- Readiness: `GET /ready` (IP allowlist via `HEALTH_IP_ALLOWLIST`)
- Detailed metrics: `GET /health/detailed` (requires auth + permissions)
- Queue health: `GET /health/queue` (pending jobs, worker activity, reserved jobs, issues)

Quick checks:

```bash
curl -fsS http://localhost/healthz
curl -fsS http://localhost/health | jq '.data.status'
curl -I http://localhost/ready
curl -fsS http://localhost/health/queue | jq '.'
```

### Liveness vs Readiness

- Liveness answers “is the process up?” → use `GET /healthz`
- Readiness answers “can this instance serve traffic now?” → use `GET /ready`
  - Restrict access via `HEALTH_IP_ALLOWLIST` in `.env`

### Kubernetes Probes

Add liveness and readiness probes to your Deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: glueful-app
spec:
  template:
    spec:
      containers:
      - name: app
        image: your-registry/glueful:latest
        ports:
        - containerPort: 80
        livenessProbe:
          httpGet:
            path: /healthz
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 15
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 3
```

## Key Metrics

### Application Metrics

Track these critical metrics:

```php
class MetricsMiddleware
{
    public function handle(Request $request, callable $next)
    {
        $start = microtime(true);
        $memoryStart = memory_get_usage();

        $response = $next($request);

        $duration = microtime(true) - $start;
        $memoryUsed = memory_get_usage() - $memoryStart;

        // Log metrics
        app($context, \Psr\Log\LoggerInterface::class)->info('Request completed', [
            'method' => $request->method(),
            'path' => $request->path(),
            'status' => $response->getStatusCode(),
            'duration' => round($duration * 1000, 2) . 'ms',
            'memory' => round($memoryUsed / 1024 / 1024, 2) . 'MB',
        ]);

        // Add headers
        $response->headers->set('X-Response-Time', round($duration * 1000, 2));
        $response->headers->set('X-Memory-Usage', round($memoryUsed / 1024 / 1024, 2));

        return $response;
    }
}
```

**Track:**
- Response time (p50, p95, p99)
- Error rate
- Request throughput
- Memory usage
- Database query time
- Cache hit rate
- Queue depth
- Worker health

### Database Metrics

```php
class DatabaseMetrics
{
    public static function track(): array
    {
        $start = microtime(true);

        // Run test query
        db($context)->table('users')->limit(1)->get();

        return [
            'response_time' => microtime(true) - $start,
            'connections' => db($context)->getConnectionCount(),
        ];
    }
}
```

### Queue Metrics

Glueful’s Redis queue driver uses a prefix (default: `glueful:queue:`) and these keys:
- List: `queue:{name}` (immediate jobs)
- Sorted sets: `queue:{name}:delayed`, `queue:{name}:reserved`

```php
class QueueMetrics
{
    public static function depth(string $queue = 'default'): int
    {
        $prefix = config($context, 'queue.connections.redis.prefix', 'glueful:queue:');
        $immediate = redis()->lLen("{$prefix}queue:{$queue}");
        $delayed = redis()->zCard("{$prefix}queue:{$queue}:delayed");
        $reserved = redis()->zCard("{$prefix}queue:{$queue}:reserved");
        return $immediate + $delayed + $reserved;
    }

    public static function failed(): int
    {
        return db($context)->table('queue_failed_jobs')->count();
    }
}
```

## Logging for Monitoring

### Structured Logging

```php
app($context, \Psr\Log\LoggerInterface::class)->info('Order processed', [
    'order_id' => $order->id,
    'user_id' => $order->user_id,
    'total' => $order->total,
    'duration' => $duration,
    'payment_method' => $order->payment_method,
]);

app($context, \Psr\Log\LoggerInterface::class)->error('Payment failed', [
    'order_id' => $order->id,
    'error' => $exception->getMessage(),
    'gateway_response' => $gatewayResponse,
]);
```

### Log Levels

```php
// DEBUG - Development debugging
app($context, \Psr\Log\LoggerInterface::class)->debug('Query executed', ['sql' => $sql, 'bindings' => $bindings]);

// INFO - Significant events
app($context, \Psr\Log\LoggerInterface::class)->info('User registered', ['user_id' => $user->id]);

// WARNING - Unusual but handled
app($context, \Psr\Log\LoggerInterface::class)->warning('Cache miss', ['key' => $cacheKey]);

// ERROR - Errors that need attention
app($context, \Psr\Log\LoggerInterface::class)->error('API call failed', ['service' => 'stripe', 'error' => $e]);

// CRITICAL - System failures
app($context, \Psr\Log\LoggerInterface::class)->critical('Database connection lost');
```

## Error Tracking

### Exception Handler

```php
class ExceptionHandler
{
    public function report(\Throwable $exception): void
    {
        // Log locally
        app($context, \Psr\Log\LoggerInterface::class)->error($exception->getMessage(), [
            'exception' => get_class($exception),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString(),
        ]);

        // Send to error tracking service (Sentry, Bugsnag, etc.)
        if (config($context, 'app.env') === 'production') {
            $this->reportToSentry($exception);
        }
    }

    private function reportToSentry(\Throwable $exception): void
    {
        // Sentry example
        \Sentry\captureException($exception);
    }
}
```

### Track Custom Events

```php
// Business metrics
app($context, \Psr\Log\LoggerInterface::class)->info('Subscription purchased', [
    'plan' => 'pro',
    'revenue' => 99.00,
    'user_id' => $user->id,
]);

// Performance issues
if ($duration > 5.0) {
    app($context, \Psr\Log\LoggerInterface::class)->warning('Slow query detected', [
        'query' => $sql,
        'duration' => $duration,
    ]);
}
```

## Alerting

### Custom Alerts

```php
class AlertService
{
    public function checkThresholds(): void
    {
        // High error rate
        $errorRate = $this->getErrorRate();
        if ($errorRate > 0.05) { // 5%
            $this->alert('High error rate: ' . ($errorRate * 100) . '%');
        }

        // Queue depth
        $queueDepth = QueueMetrics::depth();
        if ($queueDepth > 1000) {
            $this->alert("Queue depth high: {$queueDepth} jobs");
        }

        // Failed jobs
        $failed = QueueMetrics::failed();
        if ($failed > 100) {
            $this->alert("{$failed} failed jobs need attention");
        }

        // Slow database
        $dbMetrics = DatabaseMetrics::track();
        if ($dbMetrics['response_time'] > 1.0) {
            $this->alert('Database slow: ' . $dbMetrics['response_time'] . 's');
        }
    }

    private function alert(string $message): void
    {
        // Send to Slack, PagerDuty, etc.
        app($context, \Psr\Log\LoggerInterface::class)->critical($message);

        // Example: Slack webhook
        $this->sendToSlack($message);
    }

    private function sendToSlack(string $message): void
    {
        $webhook = config($context, 'monitoring.slack_webhook');

        $ch = curl_init($webhook);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'text' => "🚨 *Alert*: {$message}",
        ]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_exec($ch);
        curl_close($ch);
    }
}
```

### Schedule Health Checks

```php
// config/scheduler.php
[
    'name' => 'health-check',
    'schedule' => '*/5 * * * *', // Every 5 minutes
    'handler_class' => 'App\\Jobs\\HealthCheckJob',
]
```

## Performance Monitoring

### APM Integration

Integrate with Application Performance Monitoring tools:

```php
// Example: New Relic
if (extension_loaded('newrelic')) {
    newrelic_set_appname('Glueful API');
    newrelic_name_transaction('API/' . $request->path());
}

// Example: Datadog
class DatadogMiddleware
{
    public function handle(Request $request, callable $next)
    {
        $span = \DDTrace\start_span();
        $span->name = 'http.request';
        $span->resource = $request->method() . ' ' . $request->path();

        $response = $next($request);

        $span->meta['http.status_code'] = $response->getStatusCode();
        \DDTrace\close_span();

        return $response;
    }
}
```

Tip: You can also enable distributed tracing via `config/observability.php` using `.env` variables like `TRACING_ENABLED=true` and `TRACING_DRIVER=otel|datadog|newrelic`.

### Custom Metrics

```php
class Metrics
{
    public static function increment(string $metric, array $tags = []): void
    {
        // StatsD example
        $statsd = new \Domnikl\Statsd\Client(
            new \Domnikl\Statsd\Connection\UdpSocket('localhost', 8125)
        );

        $statsd->increment($metric, 1, 1.0, $tags);
    }

    public static function timing(string $metric, float $time, array $tags = []): void
    {
        $statsd = new \Domnikl\Statsd\Client(
            new \Domnikl\Statsd\Connection\UdpSocket('localhost', 8125)
        );

        $statsd->timing($metric, $time * 1000, 1.0, $tags);
    }
}

// Usage
Metrics::increment('api.requests', ['endpoint' => '/users']);
Metrics::timing('api.response_time', $duration, ['endpoint' => '/users']);
```

## Dashboards

### Metrics to Dashboard

Create dashboards for:

**System Health:**
- CPU usage
- Memory usage
- Disk usage
- Network I/O

**Application:**
- Request rate
- Error rate
- Response times (p50, p95, p99)
- Active users

**Database:**
- Query time
- Connection pool
- Slow queries

**Queue:**
- Queue depth
- Processing rate
- Failed jobs
- Average wait time

**Business:**
- Registrations
- Orders
- Revenue
- Active subscriptions

## Tools

### Open Source

- **Prometheus** - Metrics collection
- **Grafana** - Dashboards
- **ELK Stack** - Logging (Elasticsearch, Logstash, Kibana)
- **Jaeger** - Distributed tracing

### SaaS

- **Datadog** - Full monitoring
- **New Relic** - APM
- **Sentry** - Error tracking
- **Loggly** - Log management
- **PagerDuty** - Alerting

## Best Practices

### 1. Monitor What Matters

```php
// ✅ Good - business-critical metrics
Metrics::increment('orders.completed');
Metrics::increment('payments.failed');

// ❌ Bad - noisy metrics
Metrics::increment('function.called');
```

### 2. Set Meaningful Thresholds

```php
// ✅ Good - actionable alerts
if ($errorRate > 0.05) alert();  // 5% errors

// ❌ Bad - alert fatigue
if ($errorRate > 0) alert();  // Too sensitive
```

### 3. Include Context

```php
// ✅ Good - rich context
app($context, \Psr\Log\LoggerInterface::class)->error('Payment failed', [
    'order_id' => $order->id,
    'user_id' => $user->id,
    'amount' => $amount,
    'gateway' => 'stripe',
    'error_code' => $error->code,
]);

// ❌ Bad - minimal context
app($context, \Psr\Log\LoggerInterface::class)->error('Payment failed');
```

### 4. Use Sampling for High Volume

```php
// Sample 10% of requests
if (rand(1, 100) <= 10) {
    Metrics::timing('api.response_time', $duration);
}
```

## Troubleshooting

**High response times?**
- Check database query performance
- Review slow log
- Check cache hit rate

**High error rate?**
- Check error logs
- Review recent deployments
- Check external service status

**Queue backing up?**
- Scale workers
- Check for failed jobs
- Review job processing time

**Memory issues?**
- Check for memory leaks
- Review large data processing
- Optimize queries

## Next Steps

- [Logging](/deployment/logging) - Structured logging
- [Performance](/advanced/performance) - Optimization
- [Production Setup](/deployment/production) - Server config
- [Security](/deployment/security-hardening) - Security monitoring
