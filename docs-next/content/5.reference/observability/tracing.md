---
title: Tracing API
description: Spans, propagation, and sampling controls
---

# Tracing API

APIs for spans, context propagation, and sampling configuration.

## Status
Tracing interfaces are present (no-op implementation ships). Real exporters & propagation hooks are roadmap items. You can code against these interfaces now to minimize future diff when enabling a tracer backend.

## Span Lifecycle
```
Tracer::startSpan(name, attrs) -> SpanBuilder
  .setAttribute(k,v) ... (optional)
  .setParent(parentSpan?) (optional)
  .startSpan() -> Span
	  ... work ...
	  span.setAttribute(k,v)
	  span.end()
```
`TracingMiddleware` already wraps each HTTP request in a span named `http.request` with attributes: `http.method`, `http.route`, `user_agent`, `net.peer.ip`, plus `glueful.request_id` (if helper available) and `enduser.id` when a session user is present.

## Attribute Conventions (Initial Set)
| Key | Meaning | Source |
|-----|---------|--------|
| `http.method` | Request verb | Symfony Request |
| `http.route` | Route pattern or path | Router attributes |
| `http.status_code` | Response status | Response object |
| `net.peer.ip` | Client IP | Request -> getClientIp() |
| `user_agent` | User agent | Request header |
| `enduser.id` | Authenticated user UUID | Session |
| `glueful.request_id` | Request correlation | request_id() helper |

## Propagation Strategy (Planned)
When a concrete tracer is introduced:
* Inbound: Extract traceparent headers (W3C). If absent, start new root span.
* Outbound HTTP (future middleware): Inject current span context into headers for downstream services.
* Log Correlation: Inject `trace_id` + `span_id` into logging context (MDC) so log lines link back to traces.

## Sampling
Head-based sampling will gate span creation at `Tracer::startSpan`. Guidance:
| Traffic Level | Recommended Sample | Rationale |
|---------------|--------------------|-----------|
| < 50 RPS | 100% | Small volume, full fidelity |
| 50–500 RPS | 20% | Representative without excess cost |
| 500–5k RPS | 5–10% | Balance storage vs detail |
| > 5k RPS | 1–5% | Control cost; rely on metrics + sampled traces |

Tail-based sampling (retain only error/slow traces) is a future enhancement—design code assuming some traces may be missing in production.

## Manual Instrumentation Pattern
```php
// Inside a domain service
$builder = $tracer->startSpan('invoice.generate', ['invoice.count' => count($invoices)]);
$span = $builder->startSpan();
try {
	// ... work ...
	$span->setAttribute('invoice.total_amount', $total);
} finally {
	$span->end();
}
```

If the tracer is a no-op implementation, the overhead is near zero (method calls that do nothing). This allows safe early adoption.

## Correlating With Logs
Once a real tracer is bound:
1. Middleware starts request span.
2. Logger enrichment adds `trace_id` & `span_id` to log context (per request scope).
3. Searching logs for a trace_id reveals structured log timeline complementing the span tree.

## Error Handling
Capture error context via attributes before calling `end()`:
```php
try {
	// risky call
} catch (Throwable $e) {
	$span->setAttribute('error', true);
	$span->setAttribute('exception.class', $e::class);
	$span->setAttribute('exception.message', $e->getMessage());
	throw $e; // still propagate
} finally {
	$span->end();
}
```

## Extension Points
| Extension | Mechanism |
|-----------|-----------|
| Concrete tracer backend | Bind `TracerInterface` in a service provider |
| Automatic DB span creation | Wrap query executor & start child spans |
| Queue job spans | Middleware around job execution |
| Cache instrumentation | Decorator adding span around cache operations |

---

<!-- observability:tracing:start -->
| Symbol | Kind | Methods |
|--------|------|---------|
|TracerInterface|interface|1|
|SpanInterface|interface|2|
|SpanBuilderInterface|interface|3|
|NoopTracer|class|1|
|NoopSpan|class|2|
|NoopSpanBuilder|class|4|

#### TracerInterface
| Method | Visibility | Static | Params |
|--------|-----------|--------|--------|
|startSpan|public|no|$name:string<br>$attrs:array|

#### SpanInterface
| Method | Visibility | Static | Params |
|--------|-----------|--------|--------|
|setAttribute|public|no|$key:string<br>$value:mixed|
|end|public|no||

#### SpanBuilderInterface
| Method | Visibility | Static | Params |
|--------|-----------|--------|--------|
|setAttribute|public|no|$key:string<br>$value:mixed|
|setParent|public|no|$parent:?Glueful\Observability\Tracing\SpanInterface|
|startSpan|public|no||

#### NoopTracer
| Method | Visibility | Static | Params |
|--------|-----------|--------|--------|
|startSpan|public|no|$name:string<br>$attrs:array|

#### NoopSpan
| Method | Visibility | Static | Params |
|--------|-----------|--------|--------|
|setAttribute|public|no|$key:string<br>$value:mixed|
|end|public|no||

#### NoopSpanBuilder
| Method | Visibility | Static | Params |
|--------|-----------|--------|--------|
|__construct|public|no|$attrs:array|
|setAttribute|public|no|$key:string<br>$value:mixed|
|setParent|public|no|$parent:?Glueful\Observability\Tracing\SpanInterface|
|startSpan|public|no||

<!-- observability:tracing:end -->
