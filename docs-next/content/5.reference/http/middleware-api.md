---
title: Middleware API
description: Global and route-level middleware composition
---

# Middleware API

Reference for registering and composing middleware.

## Overview
Middleware are small, ordered units that transform or short‑circuit a request before it reaches a controller. Each implements a `handle(Request $request, callable $next, ...$params)` style contract (or equivalent) and must either return a Response or delegate to `$next($request)`.

### Categories
| Category | Examples | Responsibility |
|----------|----------|----------------|
| Security | `CSRFMiddleware`, `SecurityHeadersMiddleware`, `LockdownMiddleware` | Enforce platform security posture |
| AuthN / AuthZ | `AuthMiddleware`, `AdminPermissionMiddleware` | Establish identity & permissions |
| Rate / Abuse | `RateLimiterMiddleware`, `AllowIpMiddleware` | Traffic shaping & IP allow lists |
| Observability | `MetricsMiddleware`, `TracingMiddleware`, `RequestResponseLoggingMiddleware` | Emit timings, traces, structured logs |
| Presentation | `FieldSelectionMiddleware` | Shape outbound payload fields |
| Validation | `ValidationMiddleware` | Fail fast on malformed input |

### Ordering Guidelines
1. Global hard-deny (lockdown / maintenance).
2. Allow-list / IP filters.
3. Authentication.
4. Authorization (role/permission) if identity required for route.
5. Rate limiting (may depend on identity or IP).
6. Validation (only for routes expecting bodies).
7. Observability (metrics/tracing/logging) – placed after early rejects to avoid noise, or before if you need visibility into rejects.
8. Response shaping (field selection, compression – future).

### Authoring a Middleware
```php
final class ExampleMiddleware implements RouteMiddleware {
	public function handle(Request $request, callable $next): Response {
		// Pre logic (e.g. start timer)
		$response = $next($request);
		// Post logic (e.g. add header)
		return $response;
	}
}
```
Register in configuration (e.g. `config/http.php`) and optionally attach to route groups.

### Parameterized Middleware
Some routes show middleware like `rate_limit:60,60` meaning the rate limiter receives parameters (e.g. 60 requests / 60 seconds). Encode additional arguments comma-separated and parse inside the middleware factory.

### Error Handling & Short-Circuiting
Return a response directly to stop the pipeline (e.g. 401, 403, 429). Throw framework exceptions for consistent JSON formatting handled by global exception layer.

### Testing Tips
| Scenario | Technique |
|----------|-----------|
| Order correctness | Assert headers / side effects appear in expected sequence |
| Performance impact | Benchmark high RPS path with middleware toggled |
| Security headers | Snapshot response header set vs expected policy |

### Extensibility
Compose new middleware by wrapping existing ones (decorator style) to add metrics or tracing without modifying original logic. For cross-cut enrichment prefer a dedicated observability middleware rather than embedding logging into business-specific middleware.

---

<!-- http-middleware-api:reference:start -->
## Middleware Inventory

| Name | Class | File | Has handle/process |
|------|-------|------|--------------------|
| AdminPermissionMiddleware | Glueful\Routing\Middleware\AdminPermissionMiddleware | <project>/src/Routing/Middleware/AdminPermissionMiddleware.php | yes |
| AllowIpMiddleware | Glueful\Routing\Middleware\AllowIpMiddleware | <project>/src/Routing/Middleware/AllowIpMiddleware.php | yes |
| AuthMiddleware | Glueful\Routing\Middleware\AuthMiddleware | <project>/src/Routing/Middleware/AuthMiddleware.php | yes |
| CSRFMiddleware | Glueful\Routing\Middleware\CSRFMiddleware | <project>/src/Routing/Middleware/CSRFMiddleware.php | yes |
| FieldSelectionMiddleware | Glueful\Routing\Middleware\FieldSelectionMiddleware | <project>/src/Routing/Middleware/FieldSelectionMiddleware.php | yes |
| LockdownMiddleware | Glueful\Routing\Middleware\LockdownMiddleware | <project>/src/Routing/Middleware/LockdownMiddleware.php | yes |
| MetricsMiddleware | Glueful\Routing\Middleware\MetricsMiddleware | <project>/src/Routing/Middleware/MetricsMiddleware.php | yes |
| RateLimiterMiddleware | Glueful\Routing\Middleware\RateLimiterMiddleware | <project>/src/Routing/Middleware/RateLimiterMiddleware.php | yes |
| RequestResponseLoggingMiddleware | Glueful\Routing\Middleware\RequestResponseLoggingMiddleware | <project>/src/Routing/Middleware/RequestResponseLoggingMiddleware.php | yes |
| SecurityHeadersMiddleware | Glueful\Routing\Middleware\SecurityHeadersMiddleware | <project>/src/Routing/Middleware/SecurityHeadersMiddleware.php | yes |
| TracingMiddleware | Glueful\Routing\Middleware\TracingMiddleware | <project>/src/Routing/Middleware/TracingMiddleware.php | yes |
| ValidationMiddleware | Glueful\Routing\Middleware\ValidationMiddleware | <project>/src/Routing/Middleware/ValidationMiddleware.php | yes |
| for | Glueful\Routing\Middleware\for | <project>/src/Routing/Middleware/LockdownMiddleware.php | yes |
| implements | Glueful\Routing\Middleware\implements | <project>/src/Routing/Middleware/LockdownMiddleware.php | yes |
| name | Glueful\Routing\Middleware\name | <project>/src/Routing/Middleware/LockdownMiddleware.php | yes |

<!-- http-middleware-api:reference:end -->
