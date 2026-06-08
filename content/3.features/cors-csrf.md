---
title: CORS & CSRF
description: Secure cross-origin requests and prevent CSRF attacks
---

Configure cross-origin resource sharing (CORS) and protect against cross-site request forgery (CSRF).

## CORS vs CSRF

| Aspect | CORS | CSRF |
|--------|------|------|
| **Purpose** | Control which origins can access your API | Prevent unauthorized state changes |
| **Threat** | Unauthorized cross-origin access | Malicious sites making requests on behalf of users |
| **Mitigation** | Response headers | Synchronizer tokens |
| **Applies To** | Cross-origin requests | State-changing requests (POST/PUT/DELETE) |

## CORS Configuration

### Basic Setup

Create `config/cors.php` (read by the router):

```php
return [
    // Origins
    'allow_all_origins' => false,
    'allowed_origins' => [
        env('APP_URL', 'http://localhost:8000'),
        env('FRONTEND_URL', 'http://localhost:3000'),
    ],
    // Optional regex patterns (e.g., all subdomains)
    'allowed_origin_patterns' => [
        // '/^https:\/\/.*\.example\.com$/'
    ],

    // Headers
    'allow_headers' => [
        'Accept', 'Authorization', 'Content-Type', 'DNT', 'Origin', 'User-Agent', 'X-Requested-With'
    ],
    'expose_headers' => ['X-Total-Count', 'X-Page-Count'],

    // Credentials & caching
    'allow_credentials' => true,
    'max_age' => 86400,

    // Development convenience
    'development_allow_all' => env('APP_ENV') === 'development',
];
```

### Environment Settings

`.env`:

```env
# Development - allow all
CORS_ALLOWED_ORIGINS=*

# Production - specific origins
CORS_ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com
```

## Allowing Specific Origins

### Single Origin

```env
CORS_ALLOWED_ORIGINS=https://app.example.com
```

### Multiple Origins

```env
CORS_ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com,https://mobile.example.com
```

### Subdomains

```env
CORS_ALLOWED_ORIGINS=https://*.example.com
```

## CORS Headers

Response includes these headers:

```http
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

## Preflight Requests

Browsers send `OPTIONS` request before actual request:

```http
OPTIONS /api/users HTTP/1.1
Origin: https://app.example.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type, Authorization
```

Server responds (router returns 204 for preflight):

```http
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: POST
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

## How the Router Applies CORS

Glueful’s router centralizes CORS handling:

- Reads settings from `config/cors.php` via `config($context, 'cors')`.
- For `OPTIONS` preflight, returns `204 No Content` with CORS headers and an `Allow` header listing permitted methods.
- For normal requests, sets:
  - `Access-Control-Allow-Origin` to the request Origin if allowed (or `*` if `allow_all_origins` is true)
  - `Vary: Origin` to ensure correct caching behavior per origin
  - `Access-Control-Allow-Methods` based on route methods
  - `Access-Control-Allow-Headers` from `allow_headers`
  - `Access-Control-Expose-Headers` from `expose_headers`
  - `Access-Control-Allow-Credentials: true` only when `allow_credentials` is true and `allow_all_origins` is false

Tip: With credentials enabled, you cannot use `*` for `Access-Control-Allow-Origin`. List explicit origins or use an origin pattern.

## CSRF Protection

### How It Works

1. Server issues CSRF token
2. Client includes token in requests
3. Server validates token matches

### Configuration

`config/security.php`:

```php
'csrf' => [
    'enabled' => env('CSRF_PROTECTION_ENABLED', true),
    'tokenLifetime' => env('CSRF_TOKEN_LIFETIME', 7200),
    'useDoubleSubmit' => env('CSRF_DOUBLE_SUBMIT', false),
    'exemptRoutes' => [
        'auth/login',
        'auth/register',
        'webhooks/*',
        'csrf-token',
    ],
],
```

### Attaching CSRF Middleware

Use the `csrf` middleware on state‑changing routes. You can pass optional parameters for token lifetime (seconds) and double‑submit mode:

```php
// Basic CSRF protection
$router->post('/api/transfer', [TransferController::class, 'create'])
    ->middleware(['csrf']);

// Custom token lifetime (5 minutes)
$router->post('/api/sensitive', [SensitiveController::class, 'action'])
    ->middleware(['csrf:300']);

// Enable double-submit cookie (1 hour lifetime, double-submit on)
$router->post('/api/payment', [PaymentController::class, 'process'])
    ->middleware(['csrf:3600,true']);

// API-only configuration with stateless tokens and common exemptions
use Glueful\Routing\Middleware\CSRFMiddleware;
$csrf = CSRFMiddleware::forApi(['webhooks/*', 'public/*']);
// Register $csrf in your middleware stack or apply per-route
```

### Environment Settings

`.env`:

```env
CSRF_PROTECTION_ENABLED=true
CSRF_TOKEN_LIFETIME=3600
CSRF_DOUBLE_SUBMIT=true
```

## Getting CSRF Token

### Meta Tag

The middleware can render meta tags for templates:

```html
<!-- name=csrf-token contains the token -->
<meta name="csrf-token" content="...">
<meta name="csrf-header" content="X-CSRF-Token">
<meta name="csrf-field" content="_token">
```

### API Endpoint

```http
GET /csrf-token

200 OK
{
  "success": true,
  "message": "CSRF token retrieved successfully",
  "data": {
    "token": "abc123...",
    "header": "X-CSRF-Token",
    "field": "_token",
    "expires_at": 1712345678
  }
}
```

## Sending CSRF Token

### Header

```javascript
fetch('/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': token // also accepts X-XSRF-Token
  },
  body: JSON.stringify(data)
});
```

### Body Field

```javascript
const formData = new FormData();
formData.append('_token', token); // also accepts csrf_token
formData.append('title', 'My Post');

fetch('/api/posts', {
  method: 'POST',
  body: formData
});
```

## CSRF Validation

### Protected Methods

CSRF protection applies to:
- `POST`
- `PUT`
- `PATCH`
- `DELETE`

### Exempt Methods

No CSRF protection needed:
- `GET`
- `HEAD`
- `OPTIONS`

### Exempt Routes

```php
'exemptRoutes' => [
    '/auth/login',
    '/auth/register',
    '/webhooks/*',
    '/api/public/*',
],
```

## Common Scenarios

### SPA (Single Page App)

```env
# Allow your SPA origin
CORS_ALLOWED_ORIGINS=https://app.example.com

# Enable CSRF
CSRF_PROTECTION_ENABLED=true
```

```javascript
// Get CSRF token
const { token } = await fetch('/csrf-token').then(r => r.json());

// Include in requests
fetch('/api/posts', {
  method: 'POST',
  headers: {
    'X-CSRF-TOKEN': token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

### Mobile App

```env
# No CORS needed (not browser)
# No CSRF needed (token auth, not cookies)

# Use bearer token instead
Authorization: Bearer {token}
```

### Public API

```env
# Allow all origins for read-only
CORS_ALLOWED_ORIGINS=*

# Disable CSRF for public endpoints
# Add routes to exemptRoutes
```

### Third-Party Integrations

```env
# Whitelist specific partners
CORS_ALLOWED_ORIGINS=https://partner1.com,https://partner2.com

# Exempt webhook endpoints
'exemptRoutes' => [
    '/webhooks/stripe',
    '/webhooks/github',
],
```

## Credentials & Cookies

To send cookies cross-origin:

### Server Configuration

Credentialed requests cannot use a wildcard origin — list explicit origins in `config/cors.php` and enable `allow_credentials`:

```php
// config/cors.php
return [
    'allow_all_origins' => false,                       // never '*' with credentials
    'allowed_origins' => ['https://app.example.com'],   // explicit origins (array)
    'allow_credentials' => true,
];
```

### Client Request

```javascript
fetch('https://api.example.com/users', {
  credentials: 'include' // Send cookies
});
```

## Error Responses

### CORS Violation

Browser blocks request, shows console error:

```
Access to fetch at 'https://api.example.com/users' from origin 'https://other.com'
has been blocked by CORS policy
```

### CSRF Token Mismatch

AJAX requests get a JSON error with 419 status:

```json
{
  "error": "CSRF token validation failed. Please refresh and try again.",
  "error_code": "CSRF_TOKEN_MISMATCH"
}
```

## Testing

### Test CORS

```bash
# Should succeed
curl -H "Origin: https://app.example.com" \
  http://localhost:8000/api/users

# Should fail (origin not allowed)
curl -H "Origin: https://evil.com" \
  http://localhost:8000/api/users
```

### Test CSRF

```bash
# Should fail - no token
curl -X POST http://localhost:8000/api/posts \
  -d '{"title":"Test"}'

# Should succeed - with token
curl -X POST http://localhost:8000/api/posts \
  -H "X-CSRF-TOKEN: abc123..." \
  -d '{"title":"Test"}'
```

## Best Practices

### Explicit Origins in Production

```env
# ✅ Good - specific origins
CORS_ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com

# ❌ Bad - wildcard in production
CORS_ALLOWED_ORIGINS=*
```

### Enable CSRF Protection

```env
# ✅ Good - protection enabled
CSRF_PROTECTION_ENABLED=true

# ❌ Bad - disabled
CSRF_PROTECTION_ENABLED=false
```

### Rotate CSRF Tokens

```php
// ✅ Good - reasonable lifetime
CSRF_TOKEN_LIFETIME=3600 // 1 hour

// ❌ Bad - too long
CSRF_TOKEN_LIFETIME=86400 // 24 hours
```

### Minimal Exemptions

```php
// ✅ Good - only public endpoints
'exemptRoutes' => [
    '/webhooks/*',
],

// ❌ Bad - too many exemptions
'exemptRoutes' => [
    '/api/*', // Everything!
],
```

## Troubleshooting

**CORS errors in browser?**
- Check origin is in `CORS_ALLOWED_ORIGINS`
- Verify `OPTIONS` requests return 200
- Can't use `*` with credentials

**CSRF token mismatch?**
- Token may have expired
- Check token is sent in header or body
- Verify route is not exempt

**Preflight failing?**
- Check `allowed_methods` includes requested method
- Verify `allowed_headers` includes custom headers
- Ensure `OPTIONS` endpoint exists

## Security Checklist

- [ ] Set specific origins in production (not `*`)
- [ ] Enable CSRF protection
- [ ] Rotate CSRF tokens regularly
- [ ] Minimize exempt routes
- [ ] Test CORS with different origins
- [ ] Test CSRF on state-changing endpoints
- [ ] Use HTTPS in production
- [ ] Set `SameSite` cookie attribute

## Next Steps

- [Rate Limiting](/features/rate-limiting) - Additional protection
- [Authentication](/essentials/authentication) - Secure endpoints
- [Middleware](/advanced/middleware) - Custom security
