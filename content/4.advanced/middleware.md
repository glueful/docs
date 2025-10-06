---
title: Middleware
description: Create and use custom middleware
---

Build custom middleware to handle cross-cutting concerns like authentication, logging, and request transformation.

## What is Middleware?

Middleware sits between the request and your controller, allowing you to:
- Authenticate requests
- Log requests/responses
- Transform data
- Add headers
- Rate limit
- Cache responses

## Creating Middleware

Implement the `RouteMiddleware` interface:

```php
namespace App\Middleware;

use Glueful\Routing\RouteMiddleware;
use Symfony\Component\HttpFoundation\Request;

class TimingMiddleware implements RouteMiddleware
{
    public function handle(Request $request, callable $next): mixed
    {
        $start = microtime(true);

        $response = $next($request);

        $duration = round((microtime(true) - $start) * 1000, 2);
        $response->headers->set('X-Response-Time', $duration . 'ms');

        return $response;
    }
}
```

## Applying Middleware

### Route-Level

```php
// Single middleware
$router->get('/profile', [ProfileController::class, 'show'])
    ->middleware('auth');

// Multiple middleware
$router->post('/posts', [PostController::class, 'store'])
    ->middleware(['auth', 'csrf']);
```

### Group Middleware

```php
$router->group(['middleware' => ['auth']], function($router) {
    $router->get('/dashboard', [DashboardController::class, 'index']);
    $router->get('/profile', [ProfileController::class, 'show']);
    $router->post('/posts', [PostController::class, 'store']);
});
```

### Global Middleware

Apply to all routes:

```php
$router->group(['middleware' => ['security_headers', 'request_logging']], function($router) {
    require __DIR__ . '/../routes/api.php';
});
```

## Common Middleware Examples

### Authentication

```php
class AuthMiddleware implements RouteMiddleware
{
    public function handle(Request $request, callable $next): mixed
    {
        $token = $request->header('Authorization');

        if (!$token || !$this->validateToken($token)) {
            return Response::unauthorized('Invalid token');
        }

        // Attach user to request
        $request->attributes->set('user', $this->getUserFromToken($token));

        return $next($request);
    }

    private function validateToken(string $token): bool
    {
        // Validate JWT token
        return true;
    }

    private function getUserFromToken(string $token): object
    {
        // Decode and return user
        return (object) ['id' => 123, 'name' => 'John'];
    }
}
```

### Logging

```php
class RequestLoggingMiddleware implements RouteMiddleware
{
    public function handle(Request $request, callable $next): mixed
    {
        logger()->info('Request started', [
            'method' => $request->getMethod(),
            'uri' => $request->getRequestUri(),
            'ip' => $request->getClientIp(),
        ]);

        $response = $next($request);

        logger()->info('Request completed', [
            'status' => $response->getStatusCode(),
        ]);

        return $response;
    }
}
```

### CORS

```php
class CorsMiddleware implements RouteMiddleware
{
    public function handle(Request $request, callable $next): mixed
    {
        // Handle preflight
        if ($request->getMethod() === 'OPTIONS') {
            return Response::noContent()
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }

        $response = $next($request);

        // Add CORS headers to response
        $response->headers->set('Access-Control-Allow-Origin', '*');

        return $response;
    }
}
```

### Rate Limiting

```php
class RateLimitMiddleware implements RouteMiddleware
{
    public function __construct(
        private int $maxAttempts = 60,
        private int $windowSeconds = 60
    ) {}

    public function handle(Request $request, callable $next, mixed ...$params): mixed
    {
        $key = 'rate_limit:' . $request->getClientIp();

        $attempts = Cache::get($key, 0);

        if ($attempts >= $this->maxAttempts) {
            // Prefer the built-in 'rate_limit' middleware for production-ready behavior.
            return Response::error('Too many requests', 429);
        }

        Cache::set($key, $attempts + 1, $this->windowSeconds);

        $response = $next($request);

        $response->headers->set('X-RateLimit-Limit', (string) $this->maxAttempts);
        $response->headers->set('X-RateLimit-Remaining', (string) ($this->maxAttempts - $attempts - 1));

        return $response;
    }
}
```

### JSON Response

```php
class JsonResponseMiddleware implements RouteMiddleware
{
    public function handle(Request $request, callable $next): mixed
    {
        $response = $next($request);

        // Ensure response is JSON
        if (!$response->headers->has('Content-Type')) {
            $response->headers->set('Content-Type', 'application/json');
        }

        return $response;
    }
}
```

## Middleware with Parameters

Accept parameters in middleware:

```php
class RoleMiddleware implements RouteMiddleware
{
    public function handle(Request $request, callable $next, mixed ...$params): mixed
    {
        $requiredRole = $params[0] ?? 'user';

        $user = $request->attributes->get('user');

        if (!$user || $user->role !== $requiredRole) {
            return Response::forbidden('Insufficient permissions');
        }

        return $next($request);
    }
}
```

Use with parameters:

```php
// Require admin role
$router->delete('/users/{id}', [UserController::class, 'destroy'])
    ->middleware('role:admin');

// Require moderator role
$router->put('/posts/{id}/publish', [PostController::class, 'publish'])
    ->middleware('role:moderator');
```

## Middleware Ordering

Order matters! Middleware executes in the order defined:

```php
// ✅ Good order
$router->group(['middleware' => [
    'cors',              // Handle CORS first
    'rate_limit',        // Rate limit early
    'auth',              // Then authenticate
    'role:admin',        // Check permissions
    'request_logging',   // Log after checks
]], function($router) {
    // Routes
});

// ❌ Bad order
$router->group(['middleware' => [
    'request_logging',   // Logs unauthorized requests
    'role:admin',        // Checks role before auth
    'auth',              // Authenticates too late
    'rate_limit',        // Rate limits after expensive work
]], function($router) {
    // Routes
});
```

## Conditional Middleware

Apply middleware conditionally:

```php
class MaintenanceModeMiddleware implements RouteMiddleware
{
    public function handle(Request $request, callable $next): mixed
    {
        if (config('app.maintenance_mode') && !$this->isWhitelisted($request)) {
            return Response::error('Service under maintenance', 503);
        }

        return $next($request);
    }

    private function isWhitelisted(Request $request): bool
    {
        $whitelistedIps = config('app.maintenance_whitelist', []);
        return in_array($request->getClientIp(), $whitelistedIps);
    }
}

## Built-in Middleware Aliases

Registered aliases you can use directly in routes/groups:
- `auth` — Authentication middleware
- `rate_limit` — Rate limiter (with params: `max,window[,type]`)
- `csrf` — CSRF protection
- `security_headers` — Security headers
- `allow_ip` — IP allowlist checks
- `admin` — Admin permission checks
- `request_logging` — Request/response logging
- `metrics` — Metrics collection
- `tracing` — Distributed tracing
- `lockdown` — Emergency lockdown
- `gate_permissions` — Gate-based permission checks
- `auth_to_request` — Attach auth context to request attributes

Note: Aliases are registered in providers (see CoreProvider) and may vary if customized. Use strings like `'rate_limit:60,60'` or mix with class instances.

## PSR-15 Middleware

Glueful includes a built‑in PSR‑15 bridge. You can attach any PSR‑15 middleware directly, and the router will auto‑wrap it when `http.psr15.enabled` and `http.psr15.auto_detect` are true (default).

```php
use Middlewares\Cors; // example third‑party PSR‑15 middleware

$psrMiddleware = new Cors();

$router->get('/data', [ApiController::class, 'index'])
    ->middleware([$psrMiddleware]); // router detects and wraps PSR‑15
```

Configuration (config/http.php):

```php
'psr15' => [
    'enabled' => env('PSR15_ENABLED', true),
    'auto_detect' => env('PSR15_AUTO_DETECT', true),
    // Optional factory provider for PSR‑17 factories; auto‑detected if omitted
    'factory_provider' => null,
    'throw_on_missing_bridge' => env('PSR15_STRICT', true),
],
```

How it works (for reference):
- Router auto-detects PSR‑15 middleware and wraps it via a resolver trait: src/Routing/Internal/Psr15MiddlewareResolverTrait.php
- The bridge that exposes Glueful middleware as PSR‑15 and performs conversions lives at: src/Http/Bridge/Psr15/MiddlewareAsPsr15.php
- Toggle behavior and factory provisioning in: config/http.php

## Further Reading

- Middleware Cookbook: RouteMiddleware interface, parameters, and advanced patterns — see /cookbook/middleware
```

## Terminating Middleware

Run code after response is sent:

```php
class MetricsMiddleware implements RouteMiddleware
{
    public function handle(Request $request, callable $next): mixed
    {
        $start = microtime(true);

        $response = $next($request);

        // This runs after response is sent to client
        register_shutdown_function(function() use ($request, $response, $start) {
            $duration = microtime(true) - $start;

            // Send metrics to external service
            $this->sendMetrics([
                'route' => $request->attributes->get('_route'),
                'method' => $request->getMethod(),
                'status' => $response->getStatusCode(),
                'duration' => $duration,
            ]);
        });

        return $response;
    }
}
```

## Testing Middleware

```php
class TimingMiddlewareTest extends TestCase
{
    public function test_adds_timing_header()
    {
        $middleware = new TimingMiddleware();

        $request = Request::create('/test', 'GET');

        $response = $middleware->handle($request, function($req) {
            return Response::success(['ok' => true]);
        });

        $this->assertTrue($response->headers->has('X-Response-Time'));
        $this->assertMatchesRegularExpression('/\d+\.\d+ms/', $response->headers->get('X-Response-Time'));
    }
}
```

## Best Practices

### Keep Middleware Focused

```php
// ✅ Good - single responsibility
class AuthMiddleware { /* auth only */ }
class LoggingMiddleware { /* logging only */ }

// ❌ Bad - too many responsibilities
class RequestMiddleware {
    public function handle($request, $next) {
        // Auth
        // Logging
        // Rate limiting
        // Validation
        // ...
    }
}
```

### Early Returns

```php
// ✅ Good - fail fast
public function handle($request, $next)
{
    if (!$this->isAuthenticated($request)) {
        return Response::unauthorized();
    }

    return $next($request);
}

// ❌ Bad - unnecessary nesting
public function handle($request, $next)
{
    if ($this->isAuthenticated($request)) {
        return $next($request);
    } else {
        return Response::unauthorized();
    }
}
```

### Use Dependency Injection

```php
class CacheMiddleware implements RouteMiddleware
{
    public function __construct(
        private CacheManager $cache,
        private int $ttl = 3600
    ) {}

    public function handle(Request $request, callable $next): mixed
    {
        $key = $this->getCacheKey($request);

        if ($cached = $this->cache->get($key)) {
            return Response::success($cached);
        }

        $response = $next($request);

        $this->cache->set($key, $response->getContent(), $this->ttl);

        return $response;
    }
}
```

## Next Steps

- [Testing](/advanced/testing) - Test your middleware
- [Configuration](/advanced/configuration) - Configure middleware
- [Performance](/advanced/performance) - Optimize middleware
