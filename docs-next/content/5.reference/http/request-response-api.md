---
title: Request & Response API
description: Request helpers, response builders, and error payloads
---

# Request & Response API

Reference for request parsing and response helpers.

## Overview
This page focuses on ergonomics around reading inbound data (query, JSON body, headers) and producing consistent outbound responses (JSON, file downloads, streamed bodies) with proper caching and CORS semantics.

### Request Parsing Patterns
| Need | Recommended Approach |
|------|----------------------|
| JSON payload | Decode once in early validation middleware; attach structured array to request attributes |
| Query filters | Normalize & whitelist keys; coerce types (int/bool) centrally |
| Path params | Use router extraction; validate UUID/slug format early |
| Headers (auth, tracing) | Read via middleware; enrich request attributes for downstream code |

### Common Validation Flow
1. Raw body read (stream safe) -> parsed JSON.
2. Validation middleware applies rule set (see Validation reference).
3. Sanitized payload stored (e.g. `$request->attributes->set('input', $clean)`).
4. Controller consumes sanitized structure only — never re-read raw input.

### Response Helper Capabilities
| Helper | Purpose |
|--------|---------|
| `withCors()` | Attach CORS headers (origins, methods, headers) |
| `withCacheHeaders()` | Apply cache-control (public/private, max-age) |
| `withETag()` / `withLastModified()` | Conditional GET optimization |
| `asDownload()` | Force file download with MIME + filename |
| `withJson()` (via `setJson`/`setData`) | Structured JSON body encoding |

### Conditional Requests
Use ETag or Last-Modified combined with `isNotModified()` to short-circuit and return 304 responses, reducing bandwidth and handler CPU.

### CORS Strategy
Restrict allowed origins to known domains in production. Avoid wildcard `*` when credentials (cookies, Authorization headers) are used. Centralize via `withCors()` rather than ad-hoc header strings.

### Error Mapping
| Scenario | Status | Payload Structure |
|----------|--------|-------------------|
| Validation failure | 422 | `{ "error": "validation_failed", "fields": {...} }` |
| Unauthorized | 401 | `{ "error": "unauthorized" }` |
| Forbidden | 403 | `{ "error": "forbidden" }` |
| Not Found | 404 | `{ "error": "not_found" }` |
| Rate Limited | 429 | `{ "error": "rate_limited", "retry_after": <seconds> }` |
| Server Error | 500 | `{ "error": "internal" }` |

Keep error payloads stable; clients depend on keys for branching logic.

### Caching Guidance
| Resource Type | Strategy |
|---------------|----------|
| Static metadata (rarely changes) | Long `max-age` + ETag; rely on revalidation |
| User-specific sensitive data | `private`, short TTL or no cache |
| Large exports | Encourage async generation + signed download URLs |
| Paginated collections | Moderate TTL (30–120s) + `Vary` on auth / query dims |

### Streaming / Large Responses
For large payload generation, flush chunks as they are produced (future enhancements). Ensure memory usage is bounded; avoid buffering entire export before sending.

### Security Considerations
| Aspect | Guidance |
|--------|----------|
| Header Injection | Normalize and whitelist headers you reflect |
| JSON Encoding | Use safe encoding options; avoid double-encoding |
| Sensitive Fields | Strip secrets before calling `setData()` |
| CORS | Least-permissive origins & headers in production |

---

<!-- http-request-response-api:reference:start -->
## Request Methods (Selected)

_None_

## Response Types

### Response

| Method | Params | Returns |
|--------|--------|---------|
| __clone | — | mixed |
| __toString | — | string |
| asDownload | $filename:string, $mimeType:string | self |
| expire | — | static |
| getAge | — | int |
| getCharset | — | string |
| getContent | — | string|false |
| getDate | — | DateTimeImmutable |
| getEncodingOptions | — | int |
| getEtag | — | string |
| getExpires | — | DateTimeImmutable |
| getLastModified | — | DateTimeImmutable |
| getMaxAge | — | int |
| getProtocolVersion | — | string |
| getStatusCode | — | int |
| getTtl | — | int |
| getVary | — | array |
| hasVary | — | bool |
| header | $key:string, $value:string | self |
| isCacheable | — | bool |
| isClientError | — | bool |
| isEmpty | — | bool |
| isForbidden | — | bool |
| isFresh | — | bool |
| isImmutable | — | bool |
| isInformational | — | bool |
| isInvalid | — | bool |
| isNotFound | — | bool |
| isNotModified | $request:Symfony\Component\HttpFoundation\Request | bool |
| isOk | — | bool |
| isRedirect | $location:string | bool |
| isRedirection | — | bool |
| isServerError | — | bool |
| isSuccessful | — | bool |
| isValidateable | — | bool |
| mustRevalidate | — | bool |
| prepare | $request:Symfony\Component\HttpFoundation\Request | static |
| send | $flush:bool | static |
| sendContent | — | static |
| sendHeaders | $statusCode:int | static |
| setCache | $options:array | static |
| setCallback | $callback:string | static |
| setCharset | $charset:string | static |
| setClientTtl | $seconds:int | static |
| setContent | $content:string | static |
| setContentSafe | $safe:bool | void |
| setData | $data:mixed | static |
| setDate | $date:DateTimeInterface | static |
| setEncodingOptions | $encodingOptions:int | static |
| setEtag | $etag:string, $weak:bool | static |
| setExpires | $date:DateTimeInterface | static |
| setImmutable | $immutable:bool | static |
| setJson | $json:string | static |
| setLastModified | $date:DateTimeInterface | static |
| setMaxAge | $value:int | static |
| setNotModified | — | static |
| setPrivate | — | static |
| setProtocolVersion | $version:string | static |
| setPublic | — | static |
| setSharedMaxAge | $value:int | static |
| setStaleIfError | $value:int | static |
| setStaleWhileRevalidate | $value:int | static |
| setStatusCode | $code:int, $text:string | static |
| setTtl | $seconds:int | static |
| setVary | $headers:array|string, $replace:bool | static |
| withCacheHeaders | $maxAge:int, $public:bool | self |
| withCors | $allowedOrigins:array, $allowedMethods:array, $allowedHeaders:array, $requestOrigin:string | self |
| withETag | $etag:string | self |

<!-- http-request-response-api:reference:end -->
