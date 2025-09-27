---
title: Router API
description: Route definitions, groups, parameters, and attributes
---

# Router API

Reference for route registration, grouping, and parameter handling.

## Overview
Routing maps HTTP method + path patterns to handlers (controllers or invokable classes). Patterns can include dynamic segments (e.g. `/{resource}/{uuid}`) which are extracted and validated upstream.

### Defining Routes
Typical definition (from route files where a `$router` instance is injected):
```php
/** @var Router $router */
$router->group(['prefix' => '/auth'], function (Router $router) {
	$router->post('/login', function (Request $request) use ($router) {
		return container()->get(AuthController::class)->login();
	})->middleware('rate_limit:5,60');
});

// Simple parameterized resource route
$router->get('/{resource}/{uuid}', function (Request $request) {
	$segments = explode('/', trim($request->getPathInfo(), '/'));
	$params = ['resource' => $segments[0], 'uuid' => $segments[1]];
	return container()->get(ResourceController::class)->getSingle($params, $request->query->all());
})->middleware(['auth','rate_limit:200,60']);
```

### Dynamic Segments & Constraints
| Segment | Expected Format | Validation Strategy |
|---------|-----------------|---------------------|
| `{uuid}` | v4 UUID | Validation middleware or inline regex |
| `{resource}` | plural snake identifier (database table / collection) | Whitelisted mapping (allowed resources) or repository check |

Normalize parameter names (use `uuid`, not `id` for mixed identifier types) to avoid confusion in controllers.

#### Resource Segment Resolution (`{resource}`)
The `{resource}` segment represents the *logical collection* (usually a database table) you want to perform CRUD operations on. Because it directly influences which persistence layer component is touched, treat it as untrusted input until validated.

Recommended resolution pipeline:
1. Extract raw segment (e.g. `users`, `audit_logs`).
2. Normalize (lowercase, snake) and look it up in an allow‑listed map: `['users' => UserRepository::class, 'audit_logs' => AuditLogRepository::class, ...]`.
3. Reject anything not explicitly mapped (return 404 to avoid leaking existence of internal tables).
4. Hand the resolved repository / service forward; do NOT let downstream layers re-interpret the raw string.

Security notes:
- Never concatenate `{resource}` directly into SQL identifiers; always route through prepared, pre-declared repository objects.
- Keep the allow list small and explicit; regeneration or caching of this list should happen at boot, not per request.
- Return 404 (not 400) for unknown resources to avoid revealing internal naming.
- If multi-tenant, enforce tenant scoping *after* resource validation but *before* record lookup.

Observability tip: add the canonical resource name (post-validation) to your tracing span / structured log (e.g. `resource=users`) for per-collection latency & error metrics.

### Route Grouping
Group shared middleware & prefixes:
```php
Router::group(['prefix' => '/admin', 'middleware' => ['auth','admin']], function() {
	Router::get('/stats', [AdminController::class, 'stats']);
});
```
Order matters—group middleware wraps inner definitions. Keep global middleware in config; use groups for domain-specific layering.

### Naming & URL Generation
Assign names for reverse generation and consistency in logs / metrics:
```php
Router::get('/healthz', HealthController::class)->name('health.liveness');
```
Future helpers can expose `route('health.liveness')` style generation; naming now reduces future diff.

### Middleware Attachment
Per-route middleware (e.g. `rate_limit:60,60`) augments global stack. Prefer group-level attachment when N routes share identical constraints to reduce duplication.

### Versioning Strategy (Forward Looking)
Use prefix groups (`/v1`) rather than embedding version segments ad hoc. Deprecate endpoints by routing them to a controller returning structured warning headers before removal.

### Error Handling
Unmatched routes -> 404. Validation or auth failures surfaced before handler body executes. Keep controller logic free of routing edge-case checks (delegated to middleware / validation).

### Performance Notes
| Concern | Practice |
|---------|----------|
| Large route tables | Preload & cache compiled patterns |
| Dynamic hotspot | Split into explicit routes where possible |
| Middleware duplication | Use groups to DRY | 
| Ambiguous patterns | Order specific before generic |

### Observability Hooks
Add tracing & metrics middleware early; route name / pattern should populate span or metric labels enabling latency breakdown per logical endpoint.

---

<!-- http-router:reference:start -->
## Route List

| Method | Path | Name | Middleware | Handler | Type | Summary |
|--------|--------|--------|--------|--------|--------|--------|
| GET | / |  |  | HealthController::__invoke | static | System Health Check |
| GET | /cache |  |  | HealthController::__invoke | static | Cache Health Check |
| GET | /csrf-token |  |  | unknown (static parse) | static | Get CSRF Token |
| GET | /database |  |  | HealthController::__invoke | static | Database Health Check |
| GET | /detailed |  |  | HealthController::__invoke | static | Detailed Health Metrics |
| POST | /forgot-password |  |  | AuthController::__invoke | static | Forgot Password |
| GET | /healthz |  | rate_limit:60,60 | unknown (static parse) | static | Liveness Check |
| POST | /login |  |  | AuthController::__invoke | static | User Login |
| POST | /logout |  |  | AuthController::__invoke | static | User Logout |
| GET | /middleware |  |  | HealthController::__invoke | static | Middleware Pipeline Health |
| GET | /ready |  | rate_limit:30,60,allow_ip | Glueful\Controllers\HealthController::__invoke | static | Readiness Check |
| POST | /refresh-permissions |  |  | AuthController::__invoke | static | Refresh User Permissions |
| POST | /refresh-token |  |  | AuthController::__invoke | static | Refresh Token |
| POST | /resend-otp |  |  | AuthController::__invoke | static | Resend OTP |
| POST | /reset-password |  |  | AuthController::__invoke | static | Reset Password |
| GET | /response-api |  |  | HealthController::__invoke | static | Response API Health |
| POST | /validate-token |  |  | AuthController::__invoke | static | Validate Token |
| POST | /verify-email |  |  | AuthController::__invoke | static | Verify Email |
| POST | /verify-otp |  |  | AuthController::__invoke | static | Verify OTP |
| GET | /{resource} |  |  | ResourceController::__invoke | dynamic | List Resources |
| POST | /{resource} |  |  | ResourceController::__invoke | dynamic | Create Resource |
| DELETE | /{resource}/bulk |  |  | ResourceController::__invoke | dynamic | Bulk Delete Resources |
| PUT | /{resource}/bulk |  |  | ResourceController::__invoke | dynamic | Bulk Update Resources |
| DELETE | /{resource}/{uuid} |  |  | ResourceController::__invoke | dynamic | Delete Resource |
| GET | /{resource}/{uuid} |  |  | ResourceController::__invoke | dynamic | Get Single Resource |
| PUT | /{resource}/{uuid} |  |  | ResourceController::__invoke | dynamic | Update Resource |

<!-- http-router:reference:end -->
