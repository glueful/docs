---
title: HTTP (API)
description: Router, middleware, request/response APIs
navigation:
  icon: i-lucide-globe
---

# HTTP API Reference

API details for the routing system, middleware, and request/response helpers.

## Overview
The HTTP layer coordinates request dispatch: matching routes, executing ordered middleware, invoking controllers/services, and shaping responses (JSON, file downloads, streamed output). It keeps concerns separate so instrumentation, auth, validation, and caching can evolve independently.

### Architecture at a Glance
| Layer | Responsibility | Notes |
|-------|----------------|-------|
| Router | Pattern match + parameter extraction | Static route table (generated reference) |
| Middleware Pipeline | Cross-cutting concerns (auth, rate limit, metrics, tracing) | Ordered; short‑circuit on response |
| Controller / Handler | Business logic entry point | Receives enriched request context |
| Response Helpers | Build HTTP responses with caching / CORS | Thin convenience wrappers |

### Request Lifecycle
1. Raw HTTP request enters front controller (`public/index.php`).
2. Core bootstrap builds route collection & middleware list.
3. Router matches path & method -> route definition (with parameters).
4. Middleware stack executes in registration order (auth, rate limiting, validation, logging, tracing, etc.).
5. Controller (or invokable handler) runs with request attributes set by middleware.
6. Response object constructed (JSON, file, stream) and optionally decorated (cache headers, CORS, ETag).
7. Final response sent; logging / metrics middleware may emit timings.

### Routing Model
Supports static and dynamic segments (`/{resource}/{uuid}`) plus grouped middleware (rate limiting examples in generated list). Names can be assigned (not shown in current table) for URL generation convenience. Dynamic routes are matched in declared order; keep most specific patterns earlier to avoid ambiguity.

### Parameter Handling
Extracted path variables are injected into the handler signature (or fetched via request attributes). Normalize parameter names (e.g., `uuid`, `resource`) to keep controller signatures predictable. Validate and cast early (a validation middleware can assert format before controller logic).

### Middleware Pipeline
Common middleware types:
| Type | Purpose | Example |
|------|---------|---------|
| Authentication | Establish user identity | `AuthMiddleware` |
| Authorization / Permissions | Enforce roles/permissions | (Attributes + permission middleware) |
| Rate Limiting | Throttle abusive patterns | `RateLimiterMiddleware` |
| Validation | Request payload shape | `ValidationMiddleware` |
| Metrics / Tracing | Instrument latency & context | `MetricsMiddleware`, `TracingMiddleware` |
| Security Headers | Set CSP / HSTS / frame guards | `SecurityHeadersMiddleware` |
| Field Selection | Output shaping / sparse fieldsets | `FieldSelectionMiddleware` |

Ordering guidelines: Auth -> Rate Limit (if identity-based) -> Validation -> Business instrumentation -> Response enrichment. Keep expensive middleware (DB access) later to avoid unnecessary cost for early rejects.

### Request & Response Helpers
The reference pages enumerate methods like `withCors()`, `withCacheHeaders()`, and conditional helpers (`isNotModified`). Use them to centralize HTTP semantics rather than reimplement header logic. Chainable patterns keep controller code terse.

### Extension Points
| Need | Approach |
|------|----------|
| Custom matcher | Preprocess path before routing | Lightweight pre-router hook (future) |
| Additional middleware | Implement `handle(Request $req, callable $next)` | Register in HTTP config/middleware list |
| Custom response type | Extend base response or factory | Provide fluent API consistent with existing helpers |
| Route generation | Name routes & build helper | Introduce URL helper referencing route name |

### Performance & Hardening
| Concern | Practice |
|---------|----------|
| Middleware overhead | Keep pure functions / avoid per-request reflection |
| Route match speed | Keep table static & cache compiled patterns |
| Error leakage | Centralize exception to sanitized JSON mapping |
| CORS | Use `withCors()` instead of ad-hoc headers |
| Caching | Apply `withCacheHeaders()` for idempotent GETs |
| Observability | Place logging/tracing after cheap reject middleware for clarity |

---

## Core Types
| Symbol | Kind | Summary | Notes |
|--------|------|---------|-------|

<!-- http:reference:start -->
# HTTP Overview

- Route source: static
- Total routes: 26
- Middleware classes: 15
- Request methods sampled: 0

### Sample Routes

| Method | Path | Middleware | Handler |
|--------|------|------------|---------|
| GET | / |  | unknown (static parse) |
| GET | /cache |  | unknown (static parse) |
| GET | /csrf-token |  | unknown (static parse) |
| GET | /database |  | unknown (static parse) |
| GET | /detailed |  | unknown (static parse) |
| POST | /forgot-password |  | unknown (static parse) |
| GET | /healthz | rate_limit:60,60 | status:: |
| POST | /login |  | unknown (static parse) |
| POST | /logout |  | unknown (static parse) |
| GET | /middleware |  | unknown (static parse) |

<!-- http:reference:end -->

## API Surface
### Creation
Describe route registration / grouping.
### Usage
Describe handling requests, middleware pipeline, response helpers.
### Extension Points
List middleware contracts, router hooks.

## Configuration
| Key | Type | Default | Description |
|-----|------|---------|-------------|

## Examples
Short focused usage snippets.

## Error Conditions
Enumerate common exceptions / HTTP status mappings.

## Observability & Metrics
Mention request timing, logging fields.

## Performance Notes
Hot path considerations (middleware ordering, serialization costs).

## Related
Link to Concepts: Request Lifecycle, Controller Patterns, Performance Principles.
