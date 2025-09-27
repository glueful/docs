---
title: Metrics API
description: Counters, gauges, histograms, and exporters
---

# Metrics API

APIs for recording metrics and integrating with exporters.

## Status & Philosophy
Metrics support is intentionally minimal today: a placeholder service (`ApiMetricsService`) you can wrap or decorate. Design choices follow OpenTelemetry semantic conventions so adoption of an exporter later is configuration, not refactor.

## Planned Primitives
| Primitive | Purpose | Notes |
|----------|---------|-------|
| Counter | Monotonic increase (requests served) | Add only; reset on process restart |
| UpDownCounter | +/- adjustments (in-flight requests) | Derive gauges without polling |
| Gauge | Instantaneous measurement (queue depth) | Prefer observable callback style |
| Histogram | Distribution (latency, payload bytes) | Bucket strategy configurable (roadmap) |
| Summary (optional) | Quantiles (P95) | Prefer histogram + client quantiles when possible |

## Naming Conventions
Follow: `<domain>.<resource>.<metric>` with units as suffix when ambiguous.

| Example | Meaning | Unit |
|---------|--------|------|
| `api.request.count` | Total HTTP requests | requests |
| `api.request.duration_ms` | Request latency histogram | milliseconds |
| `db.query.duration_ms` | Query latency | milliseconds |
| `cache.hit.count` | Cache hits | operations |
| `cache.miss.count` | Cache misses | operations |
| `job.enqueue.count` | Jobs enqueued | jobs |
| `job.run.duration_ms` | Job execution time | milliseconds |

Avoid high-cardinality label values (user IDs, raw URLs). Instead normalize:
* Route → pattern (e.g., `/users/{id}`)
* User → role tier or an anonymous flag
* Query → type/classification (SELECT_one, UPDATE_bulk)

## Cardinality Pitfalls
| Anti-Pattern | Why Harmful | Safer Alternative |
|-------------|-------------|-------------------|
| Label `user_id=12345` | Explodes series cardinality | `user_type=authenticated` |
| Label `path=/users/123/avatar` | Unique per user | `route=/users/{id}/avatar` |
| Label `sql="SELECT * FROM ..."` | Near infinite | `query_class=select_by_pk` |
| Label `error_message` raw | Many variations | `error_class=ValidationError` |

## Export Strategy (Roadmap)
Pluggable exporters will be added (Prometheus pull endpoint, OTLP). Prepare now:
1. Centralize metric creation in one service/provider.
2. Define stable label dimensions early; changing later invalidates historical ratios.
3. Keep increments lightweight (no allocation heavy closures in hot paths).

## Example (Forward-Compatible Wrapper)
```php
// App\Support\Metrics.php
final class Metrics
{
	public static function requestStarted(string $route): void
	{
		app(ApiMetricsService::class)->increment('api.request.count', ['route' => $route]);
	}
}
```

Later you can swap `ApiMetricsService` with an OpenTelemetry bridge without touching call sites.

## When to Add a Metric vs Log
| Signal | Use Metric If | Use Log If |
|--------|---------------|-----------|
| Request latency | You need aggregates / percentiles | You need per-request forensic detail |
| Business event | You trend counts over time | You need full context payload |
| Error spike | You alert on rate threshold | You investigate specific error cases |

## Observability Interplay
Emit minimal metrics and enrich only slow-path logs with detailed context. Traces (once enabled) can fill the deep-dive gap; avoid duplicating rich trace attributes into every log line.

---

<!-- observability:metrics:start -->
| Symbol | Kind | Methods |
|--------|------|---------|
|ApiMetricsService|class|5|

<!-- observability:metrics:end -->
