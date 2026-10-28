---
title: Browser Sessions (Cookie Auth)
description: Authenticate browser clients with HttpOnly session cookies instead of tokens in JavaScript
---

Browser sessions are an opt-in cookie transport for first-party web apps. The browser keeps the access and refresh credentials in `HttpOnly` cookies that page scripts can't read, so an XSS bug can't steal them. API clients keep sending `Authorization: Bearer` exactly as before. Both transports reach the same `auth` middleware, the same providers and the same server-side sessions.

The transport is **off by default**. While it's disabled, the session routes aren't registered and nothing in the request path changes.

## How It Works

1. The browser calls `POST /auth/login` with `"auth_transport": "cookie"`. The login sets two cookies (through `SessionCookieIssuer`) and returns a session-bound CSRF token.
2. On later requests, the `session_cookie` middleware reads the access cookie and turns it into the `Authorization: Bearer` header that `auth` already understands.
3. When the access cookie expires, the browser calls `POST /auth/session/refresh`. The refresh cookie is only ever sent to that path, and the endpoint rotates both cookies.
4. `POST /auth/session/logout` revokes the server session and clears both cookies.

Tokens never appear in a response body on the cookie path.

## Enabling It

```env
SESSION_COOKIE_ENABLED=true
```

| Variable | Config key (`auth.session_cookie.*`) | Default |
|----------|-----------------------------|---------|
| `SESSION_COOKIE_ENABLED` | `enabled` | `false` |
| `SESSION_COOKIE_ACCESS_NAME` | `access_name` | `gf_session` |
| `SESSION_COOKIE_REFRESH_NAME` | `refresh_name` | `gf_refresh` |
| `SESSION_COOKIE_REFRESH_TTL` | `refresh_ttl` | `2592000` (30 days) |
| `SESSION_COOKIE_PATH` | `path` | `/` |
| `SESSION_COOKIE_REFRESH_PATH` | `refresh_path` | unset: `api_prefix() . '/auth/session'` |
| `SESSION_COOKIE_DOMAIN` | `domain` | unset: host-only cookie |
| `SESSION_COOKIE_SECURE` | `secure` | `true` |
| `SESSION_COOKIE_SAMESITE` | `same_site` | `lax` (`lax`, `strict`, `none`) |

Change the cookie names if several Glueful apps share a parent domain, so their cookies don't collide. `SameSite` values other than `lax`, `strict`, `none` or empty throw when a cookie is issued.

`SESSION_COOKIE_SECURE=true` means browsers only send the cookies over HTTPS. For plain-HTTP local development, set it to `false` in `.env` and nowhere else.

## The Cookies

`SessionCookieIssuer` is the only place cookie attributes are set:

| Cookie | Holds | Path | Lifetime |
|--------|-------|------|----------|
| `gf_session` | Access token | `/` | The session's `expires_in` |
| `gf_refresh` | Refresh token | `/api/v1/auth/session` (derived) | `refresh_ttl` |

Both cookies are `HttpOnly`, `Secure` (per config) and `SameSite=Lax` (per config), and host-only unless you set a domain. Because of its path, the browser attaches the refresh cookie only to the refresh and logout endpoints, never to ordinary API calls.

### Refresh cookie path (1.91)

The derived path follows your API prefix: `rtrim(api_prefix(), '/') . '/auth/session'`. With the default `API_USE_PREFIX=true`, `API_PREFIX=/api` and versioning in the path, that's `/api/v1/auth/session`. Issuing and clearing use the same path, so logout always removes the cookie that refresh set.

::u-alert{color="warning" variant="subtle" icon="i-lucide-triangle-alert"}
Before 1.91 the default was a bare `/auth/session`. The session routes live under the API prefix, so browsers never sent the refresh cookie to them. If you set `SESSION_COOKIE_REFRESH_PATH=/auth/session` to work around that, **remove the line** so the derived path applies. Set it only if your session routes really are served somewhere else.
::

## Accepting Cookies on Routes

Add `session_cookie` **before** `auth` on every route that should accept the cookie:

```php
$router->get('/account', [AccountController::class, 'show'])
    ->middleware(['session_cookie', 'auth']);

// Public pages that must survive a lapsed session: a bad or expired
// cookie degrades to anonymous instead of a 401.
$router->get('/feed', [FeedController::class, 'index'])
    ->middleware(['session_cookie:optional', 'auth:optional']);
```

The middleware decides which credential the request is using and records it in the `auth_transport` request attribute (`cookie` or `bearer`). It doesn't set identity attributes itself; `auth` populates `user` and `auth.user` right afterwards.

| Request carries | Result |
|-----------------|--------|
| Cookie only | Cookie becomes `Authorization: Bearer …`, `auth_transport=cookie` |
| Bearer header only | Untouched, `auth_transport=bearer` |
| Both, same identity | Bearer wins, `auth_transport=bearer` |
| Both, different identities | `401 Conflicting credentials.` |

The middleware never refreshes on its own: the refresh cookie isn't sent to ordinary routes, so it can't. Clients call the refresh endpoint explicitly.

## Issuing Cookies at Login

The built-in `POST /auth/login` serves both transports. Add `"auth_transport": "cookie"` to the body and, while `SESSION_COOKIE_ENABLED=true`, a successful password login sets the session cookies and returns **no tokens** in the body:

```http
POST /api/v1/auth/login
Content-Type: application/json

{"username": "ada@example.com", "password": "…", "auth_transport": "cookie"}
```

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "expires_in": 900,
    "session_uuid": "…",
    "user": { "…": "…" },
    "csrf_token": {
      "token": "…",
      "header": "X-CSRF-Token",
      "field": "_token",
      "expires_at": 1793113391
    }
  }
}
```

`access_token`, `refresh_token` and `token_type` are stripped from the body; they live only in the `HttpOnly` cookies. The `csrf_token` is bound to the new session, so the SPA can send it on its first cookie-authenticated write. The cookie-transport response doesn't fire the `LoginResponseBuilding`/`LoginResponseBuilt` events, so a listener can't put tokens back into it.

- Without the field, or with any other value, the login is the bearer path: tokens in the body, no cookies. Bearer login responses also include `session_uuid` and a session-bound `csrf_token`.
- While the transport is disabled, `"auth_transport": "cookie"` is ignored and the bearer path runs.
- Only username/password logins honour it. `token` and `api_key` provider logins are always shaped as before.
- A login that needs a second factor returns the `two_factor_required` challenge and sets no cookies: there is no session yet. Finish it at `POST /2fa/verify` with the `challenge_token`, the `code` and `"auth_transport": "cookie"` again; that response sets the cookies (`glueful/users` 2.5.1+).

::u-alert{color="info" variant="subtle" icon="i-lucide-info"}
**Since 1.91:** if you wrote your own cookie login controller only because the core login couldn't set cookies, you can switch the SPA to `POST /auth/login` with `"auth_transport": "cookie"` and remove it.
::

### Custom login flows

For a login the core endpoint doesn't cover, use the same building blocks it does: `LoginOrchestrator` (the credential check and two-factor gate) and `SessionCookieIssuer`. `issue()` accepts only an `AuthenticatedSession`, and a login still waiting for its second factor can't produce one, so setting cookies for an unfinished login can't be written at all:

```php
$outcome = $this->orchestrator->login(['username' => $username, 'password' => $password]);

if ($outcome->isAuthenticated()) {
    return $this->issuer->issue(
        new JsonResponse(['success' => true, 'user' => $outcome->session()->user]),
        $outcome->session(),
    );
}
```

Register such a controller in your provider's `services()`, route it without `auth`, and add the login rate limit (`rate_limit:5,60`).

## Refresh and Logout

Both endpoints are registered under the API prefix only when the transport is enabled:

| Endpoint | Does | Responses |
|----------|------|-----------|
| `POST /auth/session/refresh` | Rotates both cookies using the refresh cookie (never a body field). Rate limited to 30 per minute | `200`, `401 Session expired.` (and both cookies cleared when the refresh token is dead), `403` if the origin isn't accepted |
| `POST /auth/session/logout` | Revokes the server session and expires both cookies | `200`, `403` if the origin isn't accepted, `500 Logout incomplete.` if revocation failed |

If server-side revocation fails, logout still clears the cookies but returns `500`. A logout that leaves the server session alive isn't reported as a success. Bearer clients keep using `POST /auth/refresh-token` and `POST /auth/logout`.

### Origin check

These endpoints authenticate with nothing but a cookie, so they can't depend on a CSRF token. Instead they require proof of where the request came from (`SameOriginGuard`):

- If `Sec-Fetch-Site` is present, `same-origin` passes. `same-site` (a sibling subdomain) passes **only** when the request's `Origin` is an explicitly allowed CORS origin and credentials are enabled: an exact `CORS_ALLOWED_ORIGINS` entry or pattern match, `CORS_SUPPORTS_CREDENTIALS=true`, no wildcard. Any other value (`cross-site`, `none`) is rejected.
- Otherwise `Origin` must exactly equal the request's own scheme, host and port.
- A request with neither header is rejected.

Two deployments work:

- **Single origin (simplest).** Serve the SPA at `https://app.example.com` and proxy `https://app.example.com/api/*` to Glueful.
- **Split subdomains.** SPA on `https://app.example.com`, API on `https://api.example.com`. Allow the SPA's exact origin with credentials (see [CORS](#cors)); then refresh and logout accept its `same-site` requests. Without that, they return `403`.

A page on a different site (`cross-site`) is always refused.

## Using It from a SPA

```javascript
const api = (path, init = {}) =>
  fetch(`/api/v1${path}`, { credentials: 'include', ...init });

// Log in with the cookie transport; keep the session-bound CSRF token
const login = await api('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password, auth_transport: 'cookie' }),
});
let csrfToken = (await login.json()).data.csrf_token?.token;

// Reads: on 401, refresh once and retry
async function get(path) {
  let res = await api(path);
  if (res.status === 401) {
    const refreshed = await api('/auth/session/refresh', { method: 'POST' });
    if (!refreshed.ok) throw new Error('Session expired');
    res = await api(path);
  }
  return res;
}

// Writes: send the CSRF token, and don't replay them automatically
await api('/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
  body: JSON.stringify(post),
});

await api('/auth/session/logout', { method: 'POST' });
```

`credentials: 'include'` makes the browser send and store the cookies. A same-origin `fetch()` already does that with the default `same-origin` mode, but stating it is harmless and keeps working if you later split origins. Retry only **safe reads** after a refresh. Never replay an unsafe request on its own.

## CSRF

A cookie-authenticated write is exposed to CSRF, because the browser attaches the cookie to any request. A bearer request isn't: a cross-site page can't add an `Authorization` header. Attach `csrf` **after** `session_cookie` and `auth` on cookie-authenticated, state-changing routes:

```php
$router->post('/posts', [PostController::class, 'store'])
    ->middleware(['session_cookie', 'auth', 'csrf']);
```

- The token is bound to the session uuid. The cookie login returns one already bound to the new session (`data.csrf_token.token`), and it validates on the first authenticated write.
- To fetch a fresh token later, ask from an **authenticated** request (below). `GET /csrf-token` has no `auth` middleware, so its token binds to the anonymous fingerprint: it validates on anonymous requests, not on a session-authenticated write.
- The client sends it as `X-CSRF-Token` (or `X-XSRF-Token`). After each successful AJAX write, the middleware echoes the current token in the `X-CSRF-Token` response header.
- Cookie-authenticated writes always get the `Origin`/`Referer` check. `skip_for_bearer_auth` relaxes it only for a real bearer request with neither header, never for an `Authorization` header that `session_cookie` injected from the cookie. A cookie write with neither header gets `403 CSRF_ORIGIN_MISMATCH` (unless `allow_missing_origin` is on). It never skips token validation.
- `SameSite=Lax` is defence in depth, not the main control. It stops the browser sending the cookie on cross-site POSTs, but the session-bound token is what authorizes the write.

A small endpoint behind the cookie session hands the SPA its token:

```php
use Glueful\Controllers\BaseController;
use Glueful\Http\Response;
use Glueful\Routing\Middleware\CSRFMiddleware;
use Symfony\Component\HttpFoundation\Request;

final class SessionCsrfController extends BaseController
{
    public function show(Request $request): Response
    {
        // The instance that shares the `csrf` route middleware's token store
        $csrf = CSRFMiddleware::forContext($this->getContext());

        return Response::success($csrf->getTokenData($request)); // data.token, data.header, ...
    }
}

// routes
$router->get('/session/csrf', [SessionCsrfController::class, 'show'])
    ->middleware(['session_cookie', 'auth']);
```

See [CORS & CSRF](/features/cors-csrf) for the `security.csrf` settings, exempt routes and error codes.

## CORS

On the single-origin setup, the browser doesn't apply CORS at all. If the SPA calls the API from another origin, credentialed requests need:

```env
CORS_ALLOWED_ORIGINS=https://app.example.com   # the exact SPA origin, never *
CORS_SUPPORTS_CREDENTIALS=true
```

The framework never sends `Access-Control-Allow-Credentials: true` with a wildcard origin. It echoes the specific allowed origin with `Vary: Origin`. The same two settings let refresh and logout accept a sibling subdomain's `same-site` request (see [Origin check](#origin-check)). A cross-site origin is still refused by those endpoints.

## Troubleshooting

**`404` on `/auth/session/refresh`?** The transport is disabled (`SESSION_COOKIE_ENABLED` isn't `true`), or you're calling it without the API prefix.

**Refresh always returns `401 Session expired.`?** The browser isn't sending `gf_refresh`. Check that the cookie's path matches where the route is served, and remove any stale `SESSION_COOKIE_REFRESH_PATH`.

**Refresh or logout returns `403`?** The request isn't same-origin, and its origin isn't an allowed credentialed CORS origin. Serve the page and the API from one origin, or set `CORS_ALLOWED_ORIGINS` to the SPA's exact origin with `CORS_SUPPORTS_CREDENTIALS=true`.

**Cookie writes return `403 CSRF_ORIGIN_MISMATCH`?** The request carried no `Origin` or `Referer`, or one that isn't allowed. Browsers send `Origin` on `fetch()` writes; check proxies that strip it.

**Cookies never stored in local development?** `Secure` cookies need HTTPS. Use HTTPS locally or set `SESSION_COOKIE_SECURE=false` in your local `.env`.

**`401 Conflicting credentials.`?** The request sent a bearer token and a cookie for different users. Drop one of them.

## Next Steps

- [Authentication](/essentials/authentication) - Bearer login, refresh and logout
- [CORS & CSRF](/features/cors-csrf) - Origins, credentials and CSRF tokens
- [Identity](/essentials/identity) - What `auth.user` carries
