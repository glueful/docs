---
title: Middleware
description: The middleware pipeline — applying middleware, ordering, the built-in alias catalog, and the PSR-15 bridge.
---

The reference for Glueful's middleware pipeline: how to apply middleware, ordering, the built-in alias catalog, and PSR-15.

::u-alert{color="neutral" variant="subtle" icon="i-lucide-pencil-ruler"}
To **write your own** middleware — the `RouteMiddleware` interface, runtime parameters, conditional/terminating middleware, registering custom aliases, and testing — see [Writing Middleware](/cookbook/middleware).
::

## What is Middleware?

Middleware sits between the request and your controller, allowing you to:
- Authenticate requests
- Log requests/responses
- Transform data
- Add headers
- Rate limit
- Cache responses

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

## Built-in Middleware Aliases

The framework registers these string aliases (in `CoreProvider`); use them by name in a route's `->middleware([...])` or a group's `middleware`:

| Alias | Middleware | What it does |
| ----- | ---------- | ------------ |
| `auth` | `AuthMiddleware` | Authenticates the request (JWT / session / API key) and populates the user context; returns **401** if unauthenticated. |
| `rate_limit` | `EnhancedRateLimiterMiddleware` | Enforces rate limits. Attach the alias, but set the actual limits with the **`->rateLimit($max, $minutes)` builder** — the limiter reads the route's rate-limit config, *not* `rate_limit:max,window` string params. |
| `require_scope` | `RequireScopeMiddleware` | Enforces `#[RequireScope('write:posts')]` — gates the route by API-key scope. The attribute auto-attaches this middleware. |
| `gate_permissions` | `GateAttributeMiddleware` | Enforces `#[RequiresPermission]` / `#[RequiresRole]` on the handler through the authorization **Gate** (RBAC providers such as `glueful/aegis` back it). |
| `auth_to_request` | `AuthToRequestAttributesMiddleware` | Copies the authenticated identity + claims into request attributes so downstream permission checks can read them. |
| `admin` | `AdminPermissionMiddleware` | Requires an admin-level permission. |
| `validate` | `ValidationMiddleware` | Runs `#[Validate]` attribute validation before the handler. |
| `field_selection` | `FieldSelectionMiddleware` | Applies GraphQL-style field selection / expansion (`?fields=`, `?expand=`). |
| `csrf` | `CSRFMiddleware` | CSRF token protection for state-changing requests. |
| `security_headers` | `SecurityHeadersMiddleware` | Adds security response headers. |
| `allow_ip` | `AllowIpMiddleware` | Restricts the route to an IP allowlist. |
| `lockdown` | `LockdownMiddleware` | Emergency / maintenance lockdown. |
| `conditional_cache` | `ConditionalCacheMiddleware` | Conditional (ETag / `304 Not Modified`) response caching. |
| `metrics` | `MetricsMiddleware` | Records API metrics for the request. |
| `tracing` | `TracingMiddleware` | Emits request tracing / observability spans. |
| `request_logging` | `RequestResponseLoggingMiddleware` | Logs the request and response. |

The classes live under `Glueful\Routing\Middleware\*`, except `gate_permissions`/`auth_to_request` (`Glueful\Permissions\Middleware\*`), `validate` (`Glueful\Validation\Middleware\*`), and `rate_limit` (`Glueful\Api\RateLimiting\Middleware\*`). Aliases are registered in `CoreProvider`; enabled extensions can register their own. In a `middleware([...])` array you can mix bare names, `name:param` strings (for middleware that read runtime params), and class instances.

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

## Next Steps

- [Writing Middleware](/cookbook/middleware) - build custom middleware
- [Testing](/advanced/testing) - test your middleware
- [Configuration](/advanced/configuration) - configure middleware
