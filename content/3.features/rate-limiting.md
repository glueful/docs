---
title: Rate Limiting
description: Protect your API from abuse with per-route, tiered rate limits
---

Glueful's rate limiter (`Glueful\Api\RateLimiting`) limits requests per route, per user tier, and per key (IP, user, or endpoint). It supports three algorithms, multiple windows per route, cost-weighted endpoints, and emits both `X-RateLimit-*` and IETF `RateLimit-*` headers.

## Quick Start

Declare the limit on the route. Any route carrying a limit (from `->rateLimit()` or `#[RateLimit]`) gets the `rate_limit` middleware attached automatically, at the end of its middleware list.

```php
// 60 requests per minute, keyed by IP
$router->get('/search', [SearchController::class, 'index'])
    ->rateLimit(60);

// 5 requests per 15 minutes, keyed by the authenticated user
$router->post('/reports', [ReportController::class, 'store'])
    ->middleware(['auth'])
    ->rateLimit(attempts: 5, perMinutes: 15, by: 'user');
```

`rate_limit` and `enhanced_rate_limit` are aliases for the same middleware (`EnhancedRateLimiterMiddleware`). If the route already lists it under either name (or as `rate_limit:…`, or by class), it is not added a second time, so you can still place it explicitly when its position in the pipeline matters.

::u-alert{color="info" variant="subtle" icon="i-lucide-info"}
**Since 1.91.** Before 1.91, `->rateLimit()` and `#[RateLimit]` only stored the limit and you had to add `rate_limit` yourself. Routes that relied on the limit being unenforced will now return 429. Run `php glueful route:cache:clear` on deploy: older route caches also dropped rate limit config (the cache format is now v3 and stale files are invalidated on boot).
::

## Defining Limits

### Route builder

```php
public function rateLimit(
    int $attempts,
    int $perMinutes = 1,
    ?string $tier = null,          // apply only to this tier
    string $algorithm = 'sliding', // 'fixed' | 'sliding' | 'bucket'
    string $by = 'ip'              // 'ip' | 'user' | 'endpoint'
): Route
```

Call it more than once to stack windows:

```php
$router->get('/export', [ExportController::class, 'index'])
    ->middleware(['auth'])
    ->rateLimit(10, 1, by: 'user')     // 10 per minute
    ->rateLimit(100, 60, by: 'user');  // 100 per hour
```

### Attributes

On attribute-routed controllers, use `#[RateLimit]` (repeatable). On top of the builder's options it adds `perHours`, `perDays` and a custom `key` pattern:

```php
use Glueful\Api\RateLimiting\Attributes\RateLimit;
use Glueful\Routing\Attributes\{Get, Middleware};

#[Get('/search')]
#[Middleware(['auth'])]
#[RateLimit(attempts: 60, perMinutes: 1)]
#[RateLimit(attempts: 1000, perHours: 1)]
#[RateLimit(attempts: 10000, perDays: 1)]
public function search(): Response { /* ... */ }

// Tier-specific limits; attempts: 0 means unlimited
#[RateLimit(tier: 'free', attempts: 100, perDays: 1)]
#[RateLimit(tier: 'pro', attempts: 10000, perDays: 1)]
public function query(): Response { /* ... */ }

// Custom key: placeholders {ip}, {user}, {path}, {method}, {tier}
#[RateLimit(attempts: 3, perMinutes: 10, key: '{user}:{path}')]
public function resend(): Response { /* ... */ }
```

`#[RateLimit]` can also sit on the controller class. The class-level set applies to every route in the controller whose method declares no `#[RateLimit]` of its own; a method-level `#[RateLimit]` **replaces** the class-level set for that method (they are not merged):

```php
use Glueful\Api\RateLimiting\Attributes\RateLimit;
use Glueful\Routing\Attributes\{Controller, Get, Post};

#[Controller(prefix: '/reports')]
#[RateLimit(attempts: 120, perMinutes: 1, by: 'user')]
class ReportController
{
    #[Get('/')]
    public function index(): Response { /* 120/min from the class */ }

    #[Post('/')]
    #[RateLimit(attempts: 5, perMinutes: 15, by: 'user')]
    public function store(): Response { /* only 5 per 15 min */ }
}
```

Class-level `#[RateLimit]` is honoured since 1.91; earlier versions ignored it, so check those limits when upgrading.

### Cost-weighted endpoints

`#[RateLimitCost]` makes one request consume several units from every limit on the route (cost must be at least 1):

```php
use Glueful\Api\RateLimiting\Attributes\RateLimitCost;

#[RateLimitCost(cost: 10, reason: 'Complex aggregation query')]
public function analytics(): Response { /* ... */ }
```

For fluent routes, call `->setRateLimitCost(10)` on the route.

### String form

The middleware also accepts `rate_limit:attempts,windowSeconds[,by]`:

```php
$router->post('/login', [AuthController::class, 'login'])
    ->middleware('rate_limit:5,60');        // 5 per 60 seconds, keyed by IP

$router->post('/exports', [ExportController::class, 'store'])
    ->middleware(['auth', 'rate_limit:20,3600,user']); // 20 per hour, per user
```

The window is in seconds (default 60) and the algorithm comes from `api.rate_limiting.algorithm`. The optional third parameter takes the same values as `by:` (`ip`, `user`, `endpoint`); an unknown value falls back to `ip`. (Before 1.91 the third parameter was ignored and every string-form limit was keyed by IP.) If the route also has builder or attribute limits, those win and the string parameters are ignored.

## Which Limits Apply

For each request the middleware:

1. Skips limiting entirely if the client IP is in `bypass_ips`.
2. Resolves the request's **tier** (see [Tiers](#tiers)). If the tier's minute, hour and day limits are all `null` (`enterprise` by default), the request is unlimited, route-level limits included.
3. Uses the route's limits (builder/attribute, else string parameters). If there are none, it falls back to the tier's `requests_per_minute/hour/day` (sliding, by IP), then to `defaults.ip`.
4. Checks every applicable limit and answers with the most restrictive result. Limits whose `tier` doesn't match the request's tier are skipped.

### Key types (`by`)

| `by` | Counter key |
|------|-------------|
| `ip` (default) | Client IP |
| `user` | Authenticated user's `id`/`uuid`, falling back to IP when unauthenticated |
| `endpoint` | HTTP method + path + user (or IP) |

Keys also include the tier and window, and their parts are hashed before they reach the cache.

::u-alert{color="info" variant="subtle" icon="i-lucide-info"}
`by: 'user'` and tier resolution read the `user` request attribute set by `auth`. List `auth` **before** `rate_limit`, or every request is treated as `anonymous` and keyed by IP.
::

### Algorithms

| Name | Behaviour |
|------|-----------|
| `sliding` (default) | Sliding window, smooth distribution |
| `fixed` | Fixed window; simple, but allows bursts at window boundaries |
| `bucket` (or `token_bucket`) | Token bucket; allows bursts while holding the average rate |

Counters live in the default cache store (`cache.store`). Use a shared store such as Redis when you run more than one app server.

## Tiers

The default `TierResolver` reads the `user` request attribute:

- No user: `anonymous`
- A `tier`, `plan`, `subscription`, `subscription_tier` or `api_tier` field (or `getTier()`/`getPlan()`/`getSubscription()`/`getApiTier()` on an object) that names a configured tier. Names are normalized: `unlimited`/`admin` become `enterprise`; `professional`/`business`/`premium` become `pro`; `basic`/`starter` become `free`.
- Otherwise a `roles` array: `admin`/`enterprise` map to `enterprise`, `pro`/`professional`/`business`/`premium` to `pro`
- Otherwise: `free`

To resolve tiers your own way, implement `Glueful\Api\RateLimiting\Contracts\TierResolverInterface` (one method, `resolve(Request $request): string`) and bind it in a service provider:

```php
use App\RateLimiting\PlanTierResolver;
use Glueful\Api\RateLimiting\Contracts\TierResolverInterface;

public static function services(): array
{
    return [
        TierResolverInterface::class => ['class' => PlanTierResolver::class, 'autowire' => true],
    ];
}
```

## Configuration

Settings live in the `rate_limiting` block of `config/api.php`:

```php
'rate_limiting' => [
    'enabled' => env('API_RATE_LIMITING_ENABLED', true),
    'algorithm' => env('API_RATE_LIMIT_ALGORITHM', 'sliding'),
    'default_tier' => env('API_RATE_LIMIT_DEFAULT_TIER', 'anonymous'),

    'tiers' => [
        'anonymous'  => ['requests_per_minute' => 30,   'requests_per_hour' => 500,   'requests_per_day' => 5000],
        'free'       => ['requests_per_minute' => 60,   'requests_per_hour' => 1000,  'requests_per_day' => 10000],
        'pro'        => ['requests_per_minute' => 300,  'requests_per_hour' => 10000, 'requests_per_day' => 100000],
        'enterprise' => ['requests_per_minute' => null, 'requests_per_hour' => null,  'requests_per_day' => null],
    ],

    'defaults' => [
        'ip' => ['max_attempts' => 60, 'window_seconds' => 60],
    ],

    'headers' => [
        'enabled' => true,
        'include_legacy' => true, // X-RateLimit-*
        'include_ietf' => true,   // RateLimit-*
    ],

    'bypass_ips' => env('API_RATE_LIMIT_BYPASS_IPS', '127.0.0.1,::1'),
],
```

| Key | Meaning |
|-----|---------|
| `enabled` | `false` (`API_RATE_LIMITING_ENABLED=false`) turns the `rate_limit` middleware into a pass-through: no limits, no rate limit headers, no 429s |
| `algorithm` | Algorithm for limits that don't set one (the string form and `defaults.ip`) |
| `default_tier` | Tier whose limits are used when the resolved tier isn't configured |
| `tiers` | Per-tier fallback limits for routes that define none; `null` means unlimited |
| `defaults.ip` | Last-resort limit when neither the route nor the tier supplies one |
| `headers` | Which response headers to send |
| `bypass_ips` | Comma-separated string or array of exact IPs that skip limiting |

::u-alert{color="warning" variant="subtle" icon="i-lucide-triangle-alert"}
`bypass_ips` defaults to `127.0.0.1,::1`, so requests from localhost are never limited. Set `API_RATE_LIMIT_BYPASS_IPS=` (empty) to test limits locally. To stop limiting a single route, remove its `->rateLimit()` / `#[RateLimit]` (and any `rate_limit` entry); `enabled` switches limiting off everywhere.
::

::u-alert{color="info" variant="subtle" icon="i-lucide-info"}
**Since 1.91**, `API_RATE_LIMITING_ENABLED=false` really switches rate limiting off. Before, the key was never read and limits always applied. Check that no environment sets it to `false` by accident, production especially.
::

## Response Headers

Allowed requests with a finite limit get:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1704123456
RateLimit-Limit: 60
RateLimit-Remaining: 45
RateLimit-Reset: 1704123456
RateLimit-Policy: 60;w=38
```

`*-Reset` is a Unix timestamp. Turn either family off with `headers.include_legacy` / `headers.include_ietf`, or all success-response headers off with `headers.enabled`. Unlimited results send no rate limit headers.

## Rate Limit Exceeded

When a limit is exceeded the middleware returns `429 Too Many Requests` with the rate limit headers plus `Retry-After` (seconds). The body is a flat JSON object, not the standard error envelope:

```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests. Please try again later.",
  "retry_after": 17,
  "limit": 60,
  "tier": "anonymous"
}
```

### RateLimitExceededEvent

The `rate_limit` middleware dispatches `Glueful\Events\Auth\RateLimitExceededEvent` on every 429 (since 1.91). Its getters are `getClientIp()`, `getRule()`, `getCurrentCount()`, `getLimit()`, `getWindowSeconds()`, `getExcessCount()`, `getExcessPercentage()` and `isSevereViolation()`, and its metadata carries `source` (`rate_limit_middleware`), `method`, `path` (sanitized), `tier`, `retry_after` and `triggered_at`:

```php
use Glueful\Events\Auth\RateLimitExceededEvent;

final class AlertOnAbuse
{
    public function __invoke(RateLimitExceededEvent $event): void
    {
        if ($event->isSevereViolation()) {
            // notify, block the IP, ...
        }
    }
}
```

Register it with `addListener()`, or put `#[AsListener(RateLimitExceededEvent::class)]` on the class and `subscribe()` it (see [Events](/features/events#attribute-listeners)). A failing listener never turns the 429 into a 500.

## Client Handling

```javascript
async function makeRequest(url) {
  const response = await fetch(url);

  if (response.status === 429) {
    const body = await response.json().catch(() => null);
    const retryAfter = Number(response.headers.get('Retry-After')) || body?.retry_after || 30;
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    return makeRequest(url);
  }

  const remaining = Number(response.headers.get('RateLimit-Remaining'));
  if (remaining < 10) console.warn('Approaching rate limit');

  return response.json();
}
```

Browser clients on another origin can read these headers only if you expose them, e.g. `CORS_EXPOSE_HEADERS=RateLimit-Limit,RateLimit-Remaining,RateLimit-Reset,Retry-After` (see [CORS & CSRF](/features/cors-csrf)).

## Testing

```bash
# Localhost is bypassed by default; clear the bypass list first
API_RATE_LIMIT_BYPASS_IPS= php glueful serve

for i in {1..70}; do
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/search
done
# Prints 429 once the limit is reached

curl -I http://localhost:8000/search   # inspect the RateLimit-* headers
```

## Troubleshooting

**Limit never triggers**
- Is a limit declared on the route (`->rateLimit()`, `#[RateLimit]` on the method or class, or a `rate_limit:N,W` string)? A route with none falls back to the tier limits.
- Served from a stale route cache? Run `php glueful route:cache:clear`.
- Are you calling from a `bypass_ips` address (localhost by default)?
- Does the request resolve to an unlimited tier? A user with the `admin` role maps to `enterprise`.
- Behind a load balancer, configure trusted proxies so the real client IP is used.

**Per-user limits behave like per-IP**
- Put `auth` before `rate_limit` (the auto-attached middleware is appended after the route's own middleware), and set `by: 'user'` with the builder, the attribute, or `rate_limit:N,W,user`.

**Counters aren't shared across servers**
- Point the default cache store at Redis or another shared backend.

## Next Steps

- [CORS & CSRF](/features/cors-csrf) - Security protection
- [Caching](/features/caching) - Cache stores used for counters
- [Authentication](/essentials/authentication) - User-based limits
