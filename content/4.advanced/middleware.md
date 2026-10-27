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

### App-Wide Middleware

There is no global middleware stack to register into. Every `.php` file in your app's `routes/` directory is loaded automatically (files starting with `_` are skipped), so to apply middleware to all of your routes, wrap them in a group inside the route file:

```php
// routes/api.php
$router->group(['middleware' => ['request_logging']], function ($router) {
    $router->get('/posts', [PostController::class, 'index']);
    $router->post('/posts', [PostController::class, 'store'])->middleware('auth');
});
```

Some behaviour already applies to every response without any middleware: CORS headers, the `CSP_HEADER` policy, and (since 1.87) the baseline `X-Content-Type-Options: nosniff` and `Referrer-Policy: strict-origin-when-cross-origin` headers where a response hasn't set them. Use `security_headers` on a route for framing protection and the rest of its profile.

## Middleware Ordering

Middleware runs in the order listed, group middleware before route middleware:

```php
// Good order
$router->group(['middleware' => [
    'rate_limit',        // Reject floods before doing real work
    'auth',              // Then authenticate
    'gate_permissions',  // Then authorize (#[RequiresPermission] / #[RequiresRole])
    'request_logging',   // Log what got through
]], function ($router) {
    // Routes
});

// Bad order
$router->group(['middleware' => [
    'request_logging',   // Logs unauthorized requests
    'gate_permissions',  // Authorizes before anyone is authenticated
    'auth',              // Authenticates too late
    'rate_limit',        // Rate limits after expensive work
]], function ($router) {
    // Routes
});
```

## Built-in Middleware Aliases

The framework registers these string aliases as container ids; use them by name in a route's `->middleware([...])` or a group's `middleware`. A name that isn't registered (`cors`, `role`, `roles`, `cache`, ...) is not middleware.

| Alias | Middleware | What it does |
| ----- | ---------- | ------------ |
| `auth` | `AuthMiddleware` | Authenticates the request (JWT / session / API key) and populates the user context; returns **401** if unauthenticated. |
| `rate_limit` / `enhanced_rate_limit` | `EnhancedRateLimiterMiddleware` | Enforces rate limits. Limits come from the route's `->rateLimit($attempts, $perMinutes, $tier, $algorithm, $by)` builder or `#[RateLimit]` attributes (method or controller class), and the router attaches this middleware automatically for them. Without them, `rate_limit:attempts,windowSeconds[,ip\|user\|endpoint]` string params apply. `API_RATE_LIMITING_ENABLED=false` (`api.rate_limiting.enabled`) passes every request through (honoured since 1.91). |
| `require_scope` | `RequireScopeMiddleware` | Enforces `#[RequireScope('write:posts')]`, gating the route by API-key scope or, for JWT requests, the token's `scopes` / `scope` claim. The attribute auto-attaches this middleware. |
| `gate_permissions` | `GateAttributeMiddleware` | Enforces `#[RequiresPermission]` / `#[RequiresRole]` on the handler through the authorization **Gate** (RBAC providers such as `glueful/aegis` back it). |
| `auth_to_request` | `AuthToRequestAttributesMiddleware` | Copies the authenticated identity and claims into request attributes for downstream permission checks. |
| `admin` | `AdminPermissionMiddleware` | Requires an admin-level permission. |
| `validate` | `ValidationMiddleware` | Runs `#[Validate]` attribute validation before the handler. |
| `field_selection` | `FieldSelectionMiddleware` | Applies field selection / expansion (`?fields=`, `?expand=`). Attached automatically to routes carrying `#[Fields]`. `api.field_selection.enabled = false` leaves responses unprojected (honoured since 1.91). |
| `filter` | `FilterMiddleware` | Parses `?filter[...]`, `?sort=` and `?search=` for list endpoints. |
| `csrf` | `CSRFMiddleware` | CSRF token protection for state-changing requests. Built from `config/security.php`'s `csrf` block (`enabled`, `tokenLifetime`, `useDoubleSubmit`, `exemptRoutes`; relative entries such as `auth/login` match under the API prefix); `csrf:lifetime,doubleSubmit,validateOrigin` route params override it per route. |
| `session_cookie` | `SessionCookieMiddleware` | Cookie session transport for browser clients. |
| `security_headers` | `SecurityHeadersMiddleware` | Adds the security header profile (framing, HSTS, ...) for that route. |
| `allow_ip` | `AllowIpMiddleware` | Restricts the route to an IP allowlist. |
| `lockdown` | `LockdownMiddleware` | Emergency / maintenance lockdown. |
| `conditional_cache` | `ConditionalCacheMiddleware` | Conditional (ETag / `304 Not Modified`) responses. |
| `metrics` | `MetricsMiddleware` | Records API metrics for the request. |
| `tracing` | `TracingMiddleware` | Emits request tracing spans through the configured tracer. Passes requests through unless `TRACING_ENABLED=true` (`observability.tracing.enabled`). |
| `request_logging` | `RequestResponseLoggingMiddleware` | Logs the request and response. Route params: `request_logging:mode,headers,bodies,level,slowMs` (mode `request\|response\|both`). |
| `api_version` | `VersionNegotiationMiddleware` | API version negotiation (applied by versioned route groups). |
| `exception` | `ExceptionMiddleware` | Renders exceptions through the exception handler. |

Most classes live under `Glueful\Routing\Middleware\*`; `gate_permissions` and `auth_to_request` are in `Glueful\Permissions\Middleware\*`, `validate` in `Glueful\Validation\Middleware\*`, `rate_limit` in `Glueful\Api\RateLimiting\Middleware\*`, and `filter` in `Glueful\Api\Filtering\Middleware\*`. Most aliases are registered in `CoreProvider`; enabled extensions can register their own. Each entry in `middleware([...])` is a string the router resolves from the container (a built-in alias, or an id or class name you registered in a provider; unregistered classes are not autowired on demand), optionally as `name:param1,param2` (params arrive as **strings**; the built-in middleware read `"300"`, `"true"`/`"false"`/`"1"`/`"0"`, and an unrecognised value keeps the configured default), or a closure `fn (Request $request, callable $next) => ...`. Middleware **instances** are not accepted; register the class (or a configured factory) in a provider and reference it by id. The router also appends middleware for you, once and only if the route doesn't already list it: `rate_limit` for a route rate limit, `field_selection` for `#[Fields]`, and `gate_permissions` for a handler carrying `#[RequiresPermission]` / `#[RequiresRole]`. Stacked `#[RequiresRole]` attributes mean *any one of* the roles; `#[RequiresPermission]` still requires all.

### Rate limits

Prefer the builder (or the attribute on attribute-routed controllers) over string params: it supports tiers and algorithms as well as the limit key. The builder attaches `rate_limit` itself.

```php
$router->post('/login', [AuthController::class, 'login'])
    ->rateLimit(attempts: 5, perMinutes: 1, by: 'ip');

// String form: 60 attempts per 60 seconds, keyed by the authenticated user
$router->get('/search', [SearchController::class, 'index'])
    ->middleware('rate_limit:60,60,user');
```

A class-level `#[RateLimit]` applies to every route in the controller; a method-level `#[RateLimit]` replaces it for that method. Rate limits, `#[Fields]` and `#[RequireScope]` survive the route cache (format v3 since 1.91), so run `php glueful route:cache:clear` when you deploy an upgrade.

## PSR-15 Middleware

Glueful includes a PSR-15 bridge. When the router resolves a middleware id from the container and the service is a PSR-15 `MiddlewareInterface`, it wraps it automatically, provided `http.psr15.enabled` and `http.psr15.auto_detect` are true (the defaults) and a PSR-7 bridge is installed (for example `nyholm/psr7` with `symfony/psr-http-message-bridge`).

Register the PSR-15 middleware as a service, then reference it by id like any other middleware:

```php
// App provider
public static function services(): array
{
    return [
        'psr15.request_id' => ['class' => \App\Http\Psr15\RequestIdMiddleware::class, 'autowire' => true],
    ];
}

// routes/api.php
$router->get('/data', [ApiController::class, 'index'])
    ->middleware('psr15.request_id');
```

String params are not passed to PSR-15 middleware; configure it in its service definition.

Configuration (`config/http.php`):

```php
'psr15' => [
    'enabled' => env('PSR15_ENABLED', true),
    'auto_detect' => env('PSR15_AUTO_DETECT', true),
    // Optional callable returning PSR-17 factories; Nyholm's Psr17Factory is auto-detected if omitted
    'factory_provider' => null,
    // Without a bridge: throw (true) or skip the middleware (false)
    'throw_on_missing_bridge' => env('PSR15_STRICT', true),
],
```

For reference: the router's wrapping lives in `src/Routing/Internal/Psr15MiddlewareResolverTrait.php`; the reverse adapter, exposing Glueful middleware as PSR-15, is `src/Http/Bridge/Psr15/MiddlewareAsPsr15.php`.

## Next Steps

- [Writing Middleware](/cookbook/middleware) - build custom middleware
- [Testing](/advanced/testing) - test your middleware
- [Configuration](/advanced/configuration) - configure middleware
