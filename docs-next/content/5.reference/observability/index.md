---
title: Observability (API)
description: Logging, metrics, and tracing APIs
navigation:
  icon: i-lucide-activity
---

# Observability API Reference

Reference for logging, metrics, and tracing APIs.

## Overview
Unified observability model.

### Cross-Signal Correlation
```
┌──────────────┐    request_id     ┌──────────────┐
│  HTTP Request├──────────────────►│  Access Log  │
└──────┬───────┘                   └─────┬────────┘
  │ trace_id/span_id                │ trace_id (future)
  ▼                                 ▼
┌──────────────┐  span attrs   ┌────────────────┐
│   Root Span  │──────────────►│  Child Spans    │
└──────┬───────┘               └──────┬──────────┘
  │ metrics (latency)            │ metrics (db.query.duration_ms)
  ▼                              ▼
┌──────────────┐                ┌──────────────┐
│ Metrics Sink │◄───────────────┤  Instrument  │
└──────────────┘   labels       └──────────────┘
```
Single request flows generate: one access log line, optional root span (future exporter), selective child spans (DB / external calls), and aggregated latency metrics. Correlation fields: `request_id` (available now), `trace_id` & `span_id` (future), plus normalized route labels for metrics.

### Unified Configuration Keys (Selected)
| Area | Key | Env / Default | Purpose |
|------|-----|---------------|---------|
| Logging | `logging.framework.enabled` | `FRAMEWORK_LOGGING_ENABLED=true` | Toggle framework emission |
| Logging | `logging.framework.level` | `FRAMEWORK_LOG_LEVEL=info` | Framework min level |
| Logging | `logging.framework.slow_requests.threshold_ms` | `SLOW_REQUEST_THRESHOLD=1000` | Slow request boundary |
| Logging | `logging.framework.slow_queries.threshold_ms` | `SLOW_QUERY_THRESHOLD=200` | Slow DB query boundary |
| Logging | `logging.rotation.strategy` | `LOG_ROTATION_STRATEGY=daily` | Rotation policy |
| Logging | `logging.rotation.days` | `LOG_ROTATION_DAYS=30` | Retention horizon |
| Logging | `logging.application.level` | `LOG_LEVEL` (env switch) | App/channel min level |
| Tracing | `observability.tracing.enabled` | (empty) | Placeholder flag for future activation |
| Tracing | `observability.tracing.driver` | `noop` | Implementation selector |
| Tracing | `observability.tracing.service_name` | `glueful-app` | Service identity |
| Metrics | `observability.metrics.enabled` | (future) | Gate metrics emission |
| Metrics | `observability.metrics.exporter` | (future) | Exporter type (prometheus/otlp) |

Configuration schema details live in `Configuration` reference; above table provides quick operational mapping.

### Performance Considerations
| Concern | Current Behavior | Planned Enhancements |
|---------|------------------|----------------------|
| Logging I/O | Daily rotated files per channel | Async flush / JSON structured mode |
| Slow Detection | Threshold log lines | Percentile surfacing (p95/p99) via metrics |
| Tracing Overhead | Near-zero (no-op spans) | Head sampling + lightweight context propagation |
| Metrics Cost | None (minimal stub) | Batched histogram encoding |
| Correlation | `request_id` manual | Automatic middleware & log enrichment |

### Roadmap Snapshot
1. JSON log formatter + context injectors (correlation, user, route).
2. OpenTelemetry tracer binding + HTTP / DB automatic spans.
3. Metrics primitives (counter, histogram) + Prometheus exporter.
4. Error/event unification (structured error emission → trace & log).
5. Adaptive sampling / tail-based retention for error & high-latency traces.

---

## Core Types
| Symbol | Kind | Summary | Notes |
|--------|------|---------|-------|

<!-- observability:index:start -->
### Summary

| Area | Symbols |
|------|---------|
| Logging | 2 |
| Metrics | 1 |
| Tracing | 6 |

### Logging Core Types
| Symbol | Kind | Methods |
|--------|------|---------|
|LogManager|class|35|
|LogManagerInterface|interface|3|


### Tracing Core Types
| Symbol | Kind | Methods |
|--------|------|---------|
|TracerInterface|interface|1|
|SpanInterface|interface|2|
|SpanBuilderInterface|interface|3|
|NoopTracer|class|1|
|NoopSpan|class|2|
|NoopSpanBuilder|class|4|


### Metrics Related Types (Experimental)
| Symbol | Kind | Methods |
|--------|------|---------|
|ApiMetricsService|class|5|



### Configuration (Tracing)
| Key | Default | Description |
|-----|---------|-------------|
|enabled||Tracing config value|
|driver|noop|Tracing config value|
|service_name|glueful-app|Tracing config value|
|service_version|1.0.0|Tracing config value|
<!-- observability:index:end -->

## Troubleshooting Matrix
| Symptom | Likely Cause | Diagnostic Steps | Mitigation |
|---------|--------------|------------------|-----------|
| High log volume spikes | Debug level left enabled in prod | Inspect `LOG_LEVEL`; sample volume by channel | Lower level; introduce sampling for verbose routes |
| Missing slow request logs | Threshold too high / disabled | Check `LOG_SLOW_REQUESTS` & `SLOW_REQUEST_THRESHOLD` | Enable & tune threshold (e.g., 1000→750ms) |
| No correlation across lines | Request ID not injected | Verify middleware adding `request_id` | Add early middleware; enrich log context |
| DB performance issues w/o logs | Slow query logging off | Check `LOG_SLOW_QUERIES` | Enable and right-size `SLOW_QUERY_THRESHOLD` |
| Log file growth beyond retention | Rotation misconfigured | Inspect `LOG_ROTATION_STRATEGY`, `LOG_ROTATION_DAYS` | Correct env vars; run cleanup task |
| (Future) Traces not appearing | Tracer not bound / sampling 0% | Check tracer driver + sampling settings | Bind concrete tracer; raise sample rate |
| (Future) Metrics cardinality explosion | High-card labels (user IDs) | List top label values in backend | Normalize to patterns / reduce labels |

## Examples
Correlated request (future enriched):
```
{"ts":"2025-09-27T12:00:00Z","level":"info","msg":"GET /users/{id}","request_id":"rk8f...","trace_id":"abc123","latency_ms":143,"endpoint":"/users/{id}"}
```

## See Also
* Guide: Observability & Telemetry
* Concept: Observability Model
* Tutorial: Observability in an Hour

---

## API Surface
### Creation
Configuring loggers, metrics exporters.
### Usage
Emitting structured logs, counters, traces.
### Extension Points
Custom exporters, log processors.

## Configuration
| Key | Type | Default | Description |
|-----|------|---------|-------------|

## Examples
Structured log + metric + trace correlation.

## Error Conditions
Exporter failures, dropped spans.

## Observability & Metrics
Meta-metrics about exporters.

## Performance Notes
Batching, sampling strategies.

## Related
Concepts: Observability Model, Performance Principles.
