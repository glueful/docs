---
title: Rate Limiting
description: Protect your API from abuse with rate limits
---

Prevent abuse and ensure fair usage by limiting how many requests clients can make.

## Quick Start

Apply rate limiting with middleware:

```php
// 60 requests per minute
$router->get('/search', [SearchController::class, 'index'])
    ->middleware('rate_limit:60,60');

// Protected endpoints
$router->group(['middleware' => ['rate_limit:120,60']], function ($router) {
    $router->get('/users', [UserController::class, 'index']);
    $router->get('/posts', [PostController::class, 'index']);
});
```

## Middleware Syntax

```php
rate_limit:max_attempts,window_seconds[,type]
```

Parameters:
- `max_attempts`: Maximum requests allowed
- `window_seconds`: Time window in seconds
- `type` (optional): One of `ip` (default), `user`, or `endpoint`

## Common Patterns

### Login Protection

```php
// 5 login attempts per minute
$router->post('/auth/login', [AuthController::class, 'login'])
    ->middleware('rate_limit:5,60,user');
```

### API Endpoints

```php
// General API - 120 req/min
$router->group(['middleware' => ['rate_limit:120,60']], function ($router) {
    $router->get('/products', [ProductController::class, 'index']);
    $router->get('/categories', [CategoryController::class, 'index']);
});
```

### Write Operations

```php
// Create operations - 20 req/min
$router->post('/posts', [PostController::class, 'store'])
    ->middleware('rate_limit:20,60');

// Payment endpoints - 10 req/5min
$router->post('/payments', [PaymentController::class, 'process'])
    ->middleware('rate_limit:10,300');
```

### Different Tiers

```php
// Free tier
$router->get('/api/free/search', [SearchController::class, 'free'])
    ->middleware('rate_limit:10,60');

// Paid tier
$router->get('/api/premium/search', [SearchController::class, 'premium'])
    ->middleware('rate_limit:100,60');
```

## Configuration

`config/security.php`:

```php
'rate_limiter' => [
    'enable_adaptive' => env('ENABLE_ADAPTIVE_RATE_LIMITING', true),
    'enable_distributed' => env('ENABLE_DISTRIBUTED_RATE_LIMITING', false),
    'enable_ml' => env('ENABLE_ML_RATE_LIMITING', false),

    'defaults' => [
        'ip' => [
            'max_attempts' => env('IP_RATE_LIMIT_MAX', 30),
            'window_seconds' => env('IP_RATE_LIMIT_WINDOW', 60),
        ],
        'user' => [
            'max_attempts' => env('USER_RATE_LIMIT_MAX', 500),
            'window_seconds' => env('USER_RATE_LIMIT_WINDOW', 3600),
        ],
        'endpoint' => [
            'max_attempts' => env('ENDPOINT_RATE_LIMIT_MAX', 15),
            'window_seconds' => env('ENDPOINT_RATE_LIMIT_WINDOW', 60),
        ],
    ],
];
```

## Environment Settings

`.env`:

```env
# Enable features
ENABLE_ADAPTIVE_RATE_LIMITING=true
ENABLE_DISTRIBUTED_RATE_LIMITING=true
ENABLE_ML_RATE_LIMITING=false

# IP-based limits
IP_RATE_LIMIT_MAX=30
IP_RATE_LIMIT_WINDOW=60

# User-based limits
USER_RATE_LIMIT_MAX=500
USER_RATE_LIMIT_WINDOW=3600

# Endpoint limits
ENDPOINT_RATE_LIMIT_MAX=15
ENDPOINT_RATE_LIMIT_WINDOW=60
```

Notes:
- Adaptive limiting profiles behavior to adjust thresholds dynamically.
- Distributed limiting coordinates counters across nodes for clustered deployments.
- ML limiting enables anomaly scoring and stricter rules in high‑risk patterns (optional, off by default).

## Response Headers

Rate limit information is returned in headers:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1704123456
```

Notes:
- Headers above are added to successful responses by the middleware.
- When adaptive limiting is enabled, `X-Adaptive-RateLimit: true` is included.
- When distributed limiting is enabled, `X-Distributed-RateLimit: true` is included.

## Rate Limit Exceeded

When limit is exceeded, a `429 Too Many Requests` response is returned:

```json
{
  "success": false,
  "message": "Too Many Requests",
  "error": {
    "code": 429,
    "retry_after": 17
  }
}
```
The `retry_after` value is provided in the JSON body. Rate-limit headers and `Retry-After` header are not included on 429 responses.

## Rate Limit Keys

By default, rate limits are applied per:
- **IP address** for unauthenticated requests (`type=ip`, default)
- **User ID** for authenticated requests (`type=user`, falls back to IP if unauthenticated)
- **Endpoint + IP** when specified (`type=endpoint`)

### Type Examples

```php
// Per IP
rate_limit:60,60,ip

// Per user (falls back to IP if not authenticated)
rate_limit:100,60,user

// Per endpoint + IP
rate_limit:30,60,endpoint
```

## Recommended Limits

### Authentication

```php
// Login attempts
POST /auth/login: 5 per minute

// Registration
POST /auth/register: 3 per minute

// Password reset
POST /auth/forgot-password: 3 per 5 minutes

// Email verification
POST /auth/verify: 10 per hour
```

### Read Operations

```php
// List endpoints
GET /users: 120 per minute
GET /posts: 120 per minute

// Search
GET /search: 60 per minute

// Detail views
GET /users/{id}: 180 per minute
```

### Write Operations

```php
// Create
POST /posts: 20 per minute
POST /comments: 30 per minute

// Update
PUT /posts/{id}: 30 per minute

// Delete
DELETE /posts/{id}: 10 per minute
```

### Critical Endpoints

```php
// Payments
POST /payments: 10 per 5 minutes

// Email sending
POST /contact: 5 per hour

// File uploads
POST /upload: 20 per hour
```

## Testing

### Check Rate Limits

```bash
# Make requests until rate limited
for i in {1..70}; do
  curl http://localhost:8000/api/users
done

# Should return 429 after limit
```

### Verify Headers

```bash
curl -I http://localhost:8000/api/users

# Check response headers:
# X-RateLimit-Limit: 60
# X-RateLimit-Remaining: 59
# X-RateLimit-Reset: 1704123456
```

## Best Practices

### Generous Limits

```php
// ✅ Good - allows normal usage
$router->get('/products', [ProductController::class, 'index'])
    ->middleware('rate_limit:120,60');

// ❌ Too restrictive - frustrates users
$router->get('/products', [ProductController::class, 'index'])
    ->middleware('rate_limit:5,60');
```

### Different Limits for Different Actions

```php
// ✅ Good - reads are generous, writes are restricted
$router->get('/posts', [PostController::class, 'index'])
    ->middleware('rate_limit:120,60');

$router->post('/posts', [PostController::class, 'store'])
    ->middleware('rate_limit:20,60');
```

### Critical Endpoints by Type

```php
// ✅ Good - per-user (fallback to IP) for login
$router->post('/auth/login', [AuthController::class, 'login'])
    ->middleware('rate_limit:5,60,user');

// Other endpoints don't affect login rate limit
```

## Client Handling

### Respect Retry-After

```javascript
async function makeRequest() {
  const response = await fetch('/api/users');

  if (response.status === 429) {
    const body = await response.json().catch(() => null);
    const retryAfter = body?.error?.details?.retry_after ?? body?.error?.retry_after ?? 30;
    console.log(`Rate limited. Retry in ${retryAfter} seconds`);

    await sleep(retryAfter * 1000);
    return makeRequest(); // Retry
  }

  return response.json();
}
```

### Check Remaining

```javascript
const response = await fetch('/api/users');
const remaining = response.headers.get('X-RateLimit-Remaining');

if (remaining < 10) {
  console.warn('Approaching rate limit');
}
```

## Troubleshooting

**Rate limit too low?**
- Increase `max_attempts` in middleware
- Extend `window_seconds` for longer period
- Use different type for different endpoints

**Rate limit not working?**
- Verify middleware is applied
- Check Redis/cache connection
- Enable distributed rate limiting

**Users hitting limits too quickly?**
- Review typical usage patterns
- Increase limits for authenticated users
- Add caching to reduce API calls

## Next Steps

- [CORS & CSRF](/features/cors-csrf) - Security protection
- [Caching](/features/caching) - Reduce API load
- [Authentication](/essentials/authentication) - User-based limits
