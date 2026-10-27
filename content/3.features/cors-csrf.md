---
title: CORS & CSRF
description: Secure cross-origin requests and prevent CSRF attacks
---

Configure cross-origin resource sharing (CORS) and protect against cross-site request forgery (CSRF).

## CORS vs CSRF

| Aspect | CORS | CSRF |
|--------|------|------|
| **Purpose** | Control which origins can read your API's responses | Prevent unauthorized state changes |
| **Threat** | Unauthorized cross-origin access | Malicious sites making requests on behalf of users |
| **Mitigation** | Response headers | Synchronizer tokens + Origin checks |
| **Applies To** | Cross-origin browser requests | State-changing requests (POST/PUT/PATCH/DELETE) |

## CORS Configuration

The framework ships `config/cors.php`, driven by environment variables. Override it with your own `config/cors.php` only if you need more than the env vars give you.

```php
// config/cors.php (framework defaults, simplified)
return [
    'allow_all_origins' => $allowedOriginsRaw === '*',          // CORS_ALLOWED_ORIGINS=*
    'allowed_origins' => [/* CORS_ALLOWED_ORIGINS, comma-separated */],
    'allowed_origin_patterns' => [/* CORS_ALLOWED_ORIGIN_PATTERNS, comma-separated regexes */],

    'allow_headers' => '*',                                    // CORS_ALLOWED_HEADERS (default '*')
    'expose_headers' => [/* CORS_EXPOSE_HEADERS */],

    'allow_credentials' => (bool) env('CORS_SUPPORTS_CREDENTIALS', false),
    'max_age' => (int) env('CORS_MAX_AGE', 86400),

    'development_allow_all' => env('APP_ENV') === 'development',
];
```

### Environment Settings

| Variable | Default | Notes |
|----------|---------|-------|
| `CORS_ALLOWED_ORIGINS` | `*` when `APP_ENV=development`, otherwise empty (no cross-origin access) | Exact origins, comma-separated, or `*` |
| `CORS_ALLOWED_ORIGIN_PATTERNS` | empty | PCRE patterns, comma-separated (so patterns can't contain commas) |
| `CORS_ALLOWED_HEADERS` | `*` | Request headers allowed in preflight |
| `CORS_EXPOSE_HEADERS` | empty | Response headers JavaScript may read |
| `CORS_SUPPORTS_CREDENTIALS` | `false` | Sends `Access-Control-Allow-Credentials: true` (never with `*`) |
| `CORS_MAX_AGE` | `86400` | Preflight cache lifetime in seconds |

```env
# Production - specific origins
CORS_ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com
CORS_EXPOSE_HEADERS=X-Total-Count,RateLimit-Remaining
```

### Subdomains

Wildcards inside `CORS_ALLOWED_ORIGINS` (e.g. `https://*.example.com`) are compared as literal strings and never match. Use a pattern instead:

```env
CORS_ALLOWED_ORIGIN_PATTERNS=/^https:\/\/[a-z0-9-]+\.example\.com$/
```

Patterns are PCRE regexes tested against the full `Origin` header, so anchor them (`^…$`); an unanchored `/example\.com/` also matches `https://example.com.attacker.net`. An invalid pattern never matches.

::u-alert{color="info" variant="subtle" icon="i-lucide-info"}
**Since 1.91**, origins allowed by `CORS_ALLOWED_ORIGIN_PATTERNS` (and every origin when `development_allow_all` is on) get CORS headers on actual responses, not only on preflight. Before 1.91 a pattern-only origin passed preflight and was then blocked by the browser. Check that your patterns are anchored before deploying.
::

## How CORS Is Applied

Two places emit CORS headers, and both use the same origin rule (`Glueful\Http\Cors::originMatches()`). An origin is allowed when it is non-empty and `development_allow_all` is on, or `allow_all_origins` is on, or it is listed exactly in `allowed_origins`, or it matches one of `allowed_origin_patterns`. With nothing configured, nothing matches.

**Preflight (router).** For an `OPTIONS` request to a path with registered routes (and no explicit `OPTIONS` route), the router returns `204 No Content` with:

- `Allow` and `Access-Control-Allow-Methods`: the methods registered for that path
- `Access-Control-Allow-Origin`: the request origin plus `Vary: Origin` if it's allowed (exact match, pattern, or `development_allow_all`); `*` when only `allow_all_origins` lets it through
- `Access-Control-Allow-Headers` from `allow_headers`, `Access-Control-Max-Age` from `max_age`, `Access-Control-Expose-Headers` from `expose_headers`
- `Access-Control-Allow-Credentials: true` when `allow_credentials` is on and `allow_all_origins` is off

**Every other response (application).** After dispatch, including error and exception responses, an allowed `Origin` (by the same rule, patterns included) gets `Access-Control-Allow-Origin: <origin>` (the specific origin, never `*`), `Vary: Origin`, `Access-Control-Expose-Headers`, and `Access-Control-Allow-Credentials` when credentials are enabled and origins aren't `*`. A response that already carries `Access-Control-Allow-Origin` is left alone.

```http
OPTIONS /api/v1/posts HTTP/1.1
Origin: https://app.example.com
Access-Control-Request-Method: POST

HTTP/1.1 204 No Content
Allow: GET, POST
Access-Control-Allow-Methods: GET, POST
Access-Control-Allow-Origin: https://app.example.com
Vary: Origin
Access-Control-Allow-Headers: *
Access-Control-Max-Age: 86400
```

## CSRF Protection

### How It Works

1. The client fetches a token (or receives one at login).
2. It sends the token on every state-changing request.
3. The `csrf` middleware checks the `Origin`/`Referer`, then compares the submitted token with the one stored for the caller's session.

Tokens are stored in the cache (falling back to the PHP session) and are bound to the caller's **session**: the authenticated session id (`sid`/`session_uuid`) when there is one, otherwise a request fingerprint for anonymous callers. A token issued before login is not valid after it; use the token returned by login.

### Attaching CSRF Middleware

CSRF is opt-in per route. Attach `csrf` to state-changing routes, **after** `auth`/`session_cookie` so the session is known:

```php
$router->post('/transfer', [TransferController::class, 'create'])
    ->middleware(['session_cookie', 'auth', 'csrf']);
```

Safe methods (`GET`, `HEAD`, `OPTIONS`) pass through and get a token created for the session. `POST`, `PUT`, `PATCH` and `DELETE` are checked.

### Per-route parameters

`csrf:tokenLifetime,useDoubleSubmit,validateOrigin` overrides the configured values for one route:

```php
$router->post('/checkout', [CheckoutController::class, 'store'])
    ->middleware(['session_cookie', 'auth', 'csrf:900,true']);    // 15-minute tokens, double-submit

$router->post('/kiosk/submit', [KioskController::class, 'store'])
    ->middleware(['session_cookie', 'auth', 'csrf:3600,false,false']); // no Origin/Referer check
```

Integers are read from `"900"`, booleans from `true`/`false`/`1`/`0` (also `yes`/`no`, `on`/`off`). An empty or unrecognised value keeps the configured default, so `csrf:,true` changes only double-submit.

::u-alert{color="info" variant="subtle" icon="i-lucide-info"}
**Since 1.91.** Before 1.91 these parameters were silently ignored and the middleware ran on its defaults. Review routes that pass them: the values you wrote now apply.
::

### Configuration

`config/security.php`:

```php
'csrf' => [
    'enabled' => env('CSRF_PROTECTION_ENABLED', true),
    'tokenLifetime' => env('CSRF_TOKEN_LIFETIME', 3600),
    'useDoubleSubmit' => env('CSRF_DOUBLE_SUBMIT', false),
    // Allow requests with neither Origin nor Referer (non-browser clients)
    'allow_missing_origin' => env('CSRF_ALLOW_MISSING_ORIGIN', false),
    // With no Origin/Referer, let real "Authorization: Bearer" requests pass the origin check
    // (never cookie-transport requests, whose header session_cookie injected)
    'skip_for_bearer_auth' => env('CSRF_SKIP_FOR_BEARER_AUTH', true),
    'exemptRoutes' => [
        'auth/login', 'auth/register', 'auth/forgot-password', 'auth/reset-password',
        'auth/verify-email', 'auth/verify-otp', 'webhooks/inbound/*', 'public/*', 'csrf-token',
    ],
],
```

The container builds the `csrf` middleware with `CSRFMiddleware::fromConfig()`, so every key in the block applies:

| Key | Effect |
|-----|--------|
| `enabled` | `false` makes `csrf` a pass-through (`CSRF_PROTECTION_ENABLED`). Also decides whether login responses include a `csrf_token` block |
| `tokenLifetime` | Token lifetime in seconds (`CSRF_TOKEN_LIFETIME`, default 3600) |
| `useDoubleSubmit` | Double-submit cookie mode (`CSRF_DOUBLE_SUBMIT`) |
| `exemptRoutes` | Paths that skip CSRF even when `csrf` is attached; `*` is a wildcard |
| `allow_missing_origin`, `skip_for_bearer_auth`, `rate_limit_fail_closed` | Origin/Referer and token-generation rate-limit behaviour |

A key you remove falls back to the middleware's built-in default (enabled, 7200-second tokens, no double-submit, no exemptions). Per-route `csrf:` parameters override `tokenLifetime` and `useDoubleSubmit` for that route.

::u-alert{color="warning" variant="subtle" icon="i-lucide-triangle-alert"}
**Since 1.91**, with the shipped config, tokens expire after **3600s** (previously 7200s) and the listed `exemptRoutes` skip CSRF. Review your app's `security.csrf` block before upgrading.
::

Exempt entries are written relative to the API prefix. A request path is compared as-is (leading `/` removed), relative to the API prefix (`api_prefix()`, e.g. `/api/v1`), and with the `BASE_URL` path and a leading `v{API_VERSION}` segment stripped. So `webhooks/inbound/*` matches `/webhooks/inbound/stripe` (an app route) and `/api/v1/webhooks/inbound/stripe`; full-path entries such as `api/v1/webhooks/inbound/*` keep working. The shipped entry deliberately does not cover the authenticated webhook management API at `/api/v1/webhooks/{subscriptions,deliveries}`. The simplest exemption remains not attaching `csrf` to the route.

::u-alert{color="warning" variant="subtle" icon="i-lucide-triangle-alert"}
**Since 1.91**, the shipped `exemptRoutes` (`auth/login`, `webhooks/inbound/*`, `public/*`, …) apply under `/api/v1`. Before, they only matched unprefixed paths. Check that no route you meant to protect matches an entry, for example a cookie-authenticated route under `public/`.
::

`skip_for_bearer_auth` relaxes only the Origin/Referer check, and only for a real bearer request. A cookie-transport request (`auth_transport=cookie`) never gets it, even though `session_cookie` has injected an `Authorization: Bearer` header: with neither `Origin` nor `Referer` it gets `403 CSRF_ORIGIN_MISMATCH` unless `allow_missing_origin` is on. A bearer request that carries `csrf` still needs a valid token, so don't attach `csrf` to bearer-only API routes.

## Getting a CSRF Token

### At login

The login response (bearer or `"auth_transport": "cookie"`) includes a token already bound to the new session, along with `session_uuid`. It validates on the first authenticated write:

```json
"csrf_token": {
  "token": "abc123...",
  "header": "X-CSRF-Token",
  "field": "_token",
  "expires_at": 1712345678
}
```

### Token endpoint

`GET /csrf-token` sits under the API prefix (e.g. `/api/v1/csrf-token`):

```http
GET /api/v1/csrf-token

200 OK
{
  "success": true,
  "message": "CSRF token retrieved successfully",
  "data": {
    "token": "abc123...",
    "header": "X-CSRF-Token",
    "header_alt": "X-XSRF-Token",
    "field": "_token",
    "field_alt": "csrf_token",
    "cookie": "...",
    "expires_at": 1712345678,
    "double_submit": false,
    "validate_origin": true
  }
}
```

The token is at `data.token`, and the `csrf` middleware accepts it: the endpoint issues it into the same token store. The endpoint has no `auth` middleware, so the token is bound to the anonymous fingerprint. Use it for anonymous writes; authenticated clients should use the token from login (or fetch one from a route behind `auth`; see [Browser Sessions](/features/browser-sessions#csrf)).

To issue tokens in your own code, use `CSRFMiddleware::forContext($context)`, which returns the instance sharing the `csrf` route middleware's token store. A bare `new CSRFMiddleware()` has no store, and its tokens never validate.

### Meta tags

For server-rendered pages, `CSRFMiddleware::getMetaTags($request)` returns:

```html
<meta name="csrf-token" content="...">
<meta name="csrf-header" content="X-CSRF-Token">
<meta name="csrf-field" content="_token">
```

## Sending the Token

The middleware looks, in order, at the `X-CSRF-Token` header, `X-XSRF-Token`, the `_token` / `csrf_token` form fields, the same keys in a JSON body, and finally a `_token` query parameter.

```javascript
fetch('/api/v1/posts', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify(data)
});
```

After a successful AJAX request, the current token is echoed back in the `X-CSRF-Token` response header.

## Common Scenarios

### SPA with cookie sessions

```env
CORS_ALLOWED_ORIGINS=https://app.example.com
CORS_SUPPORTS_CREDENTIALS=true
SESSION_COOKIE_ENABLED=true
```

Log in with `POST /auth/login`, `"auth_transport": "cookie"` and `credentials: 'include'`; the response sets the session cookies and carries no tokens. Keep the `csrf_token.token` from it and send it as `X-CSRF-Token` on writes to routes that carry `csrf`. Cookie sessions are refreshed and ended via `POST /auth/session/refresh` and `POST /auth/session/logout` (under the API prefix); those endpoints rely on an origin check rather than a CSRF token. With the SPA on a sibling subdomain, the exact `CORS_ALLOWED_ORIGINS` entry plus `CORS_SUPPORTS_CREDENTIALS=true` is what lets them accept its `same-site` requests. Set `FRONTEND_URL` to the SPA origin too, so the `csrf` Origin check accepts its writes. See [Browser Sessions](/features/browser-sessions) for the cookie flow, the refresh-cookie path and how it interacts with CSRF.

### Mobile app or server-to-server

No CORS (not a browser) and no CSRF (bearer tokens aren't sent automatically). Send `Authorization: Bearer {token}` and leave `csrf` off those routes.

### Public read API

```env
CORS_ALLOWED_ORIGINS=*
```

With `*`, credentials are never allowed.

### Webhooks from third parties

Don't attach `csrf` to webhook routes; verify the sender's signature instead.

## Error Responses

### CORS violation

The browser blocks the response and logs:

```
Access to fetch at 'https://api.example.com/users' from origin 'https://other.com'
has been blocked by CORS policy
```

### Origin mismatch

A disallowed `Origin`/`Referer` (or neither, without `allow_missing_origin` or a real bearer token; a cookie-transport request never counts as one) returns `403` with error code `CSRF_ORIGIN_MISMATCH`. Allowed origins are `BASE_URL`, `FRONTEND_URL`, and, outside production, `http://localhost`, `http://127.0.0.1`, `http://localhost:3000` and `http://localhost:8080`.

### Token mismatch

Requests with `Accept: application/json` or `X-Requested-With: XMLHttpRequest` get `419`:

```json
{
  "error": "CSRF token validation failed. Please refresh and try again.",
  "error_code": "CSRF_TOKEN_MISMATCH"
}
```

Other requests raise a `SecurityException` with status `419`. Both violations dispatch `Glueful\Events\Security\CSRFViolationEvent`.

## Testing

```bash
# CORS: allowed origin gets Access-Control-Allow-Origin back
curl -i -H "Origin: https://app.example.com" http://localhost:8000/api/v1/posts

# CORS: preflight
curl -i -X OPTIONS -H "Origin: https://app.example.com" \
  -H "Access-Control-Request-Method: POST" http://localhost:8000/api/v1/posts

# CSRF: fails without a token (419)
curl -i -X POST http://localhost:8000/api/v1/posts \
  -H "Origin: http://localhost:3000" -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" -d '{"title":"Test"}'

# CSRF: succeeds with the token from login
curl -i -X POST http://localhost:8000/api/v1/posts \
  -H "Origin: http://localhost:3000" -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" -H "X-CSRF-Token: $CSRF" -d '{"title":"Test"}'
```

## Best Practices

- List explicit origins in production; never `CORS_ALLOWED_ORIGINS=*` with credentials (the framework refuses to combine them anyway).
- Attach `csrf` to every cookie-authenticated, state-changing route, after `auth`.
- Keep `allow_missing_origin` off unless non-browser clients need cookie auth.
- Expose only the response headers clients need.

## Troubleshooting

**CORS errors in browser?**
- Is the origin listed exactly (scheme, host, port; no trailing slash) in `CORS_ALLOWED_ORIGINS`?
- Matching via `CORS_ALLOWED_ORIGIN_PATTERNS`? Check the regex against the exact origin (scheme, host, port) and keep it anchored.
- Credentials need `CORS_SUPPORTS_CREDENTIALS=true` and no `*`.

**CSRF token mismatch?**
- Is `csrf` after `auth`? Without the session, the token is looked up under the anonymous fingerprint.
- Did you fetch the token before logging in? Use the one from the login response.
- Tokens expire after `tokenLifetime` (3600 seconds in the shipped config), or the route's `csrf:` lifetime.
- Is the path in `exemptRoutes` but still checked? Entries are relative to the API prefix (`webhooks/inbound/*`, not `/webhooks/inbound/*`); see [Configuration](#configuration).

**Preflight failing?**
- Preflight only answers for paths with registered routes; check the path and API prefix.
- If you list `CORS_ALLOWED_HEADERS`, include every custom header you send.

## Security Checklist

- [ ] Set specific origins in production (not `*`)
- [ ] Attach `csrf` to cookie-authenticated write routes
- [ ] Use the login-issued CSRF token
- [ ] Test CORS with allowed and disallowed origins
- [ ] Test CSRF on state-changing endpoints
- [ ] Use HTTPS in production
- [ ] Keep `SESSION_COOKIE_SAMESITE` at `lax` or `strict`

## Next Steps

- [Rate Limiting](/features/rate-limiting) - Additional protection
- [Authentication](/essentials/authentication) - Secure endpoints
- [Browser Sessions](/features/browser-sessions) - Cookie auth for SPAs
- [Middleware](/advanced/middleware) - Custom security
