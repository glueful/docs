---
title: Logging API
description: Structured logs, sinks, and correlation
---

# Logging API

APIs for structured logging, sinks, and correlation IDs.

## Architecture & Responsibilities

Glueful separates logging concerns so you can tune volume and retention independently:

| Layer | Purpose | Typical Volume | Channel | Config Roots |
|-------|---------|----------------|---------|--------------|
| Framework | HTTP lifecycle, internal exceptions, protocol errors | Medium | `framework` | `logging.framework.*` |
| Application | Domain / business events & decisions | Variable | `app` (default) | `logging.application.*` |
| Access / API | Per-request summary or enriched access events | High | `api` | `logging.channels.api.*` |
| Error | Elevated severity (error+) for alert pipelines | Low | `error` | `logging.channels.error.*` |
| Debug / Dev | Verbose diagnostics (only in non-prod) | Burst | `debug` | `logging.channels.debug.*` |

Daily rotation (or alternative strategy) plus retention days is applied per channel. Size-based rotation is supported via `logging.rotation.strategy=size` and `logging.rotation.max_size`.

### Lifecycle
1. Code calls `LogManager::log()` (or level shortcut like `info()`).
2. Message + context are normalized (stringable, arrays JSON encoded when format demands).
3. Sampling (if configured via `setSamplingRate()`) may short‑circuit low-value events.
4. Record dispatched to channel handler (file / database) – batching if `setBatchMode(true)`.
5. Rotation / retention cleanup may run (lazy trigger in `cleanup()` or scheduled).

### Performance & Sampling
High‑throughput endpoints can degrade throughput if every request emits verbose payload logs. Recommended:
* Emit an access summary line (status, latency, request_id, trace_id?) at 100%.
* Sample detailed context (headers, payload sizes) at 1–10% depending on traffic (`setSamplingRate(0.05)`).
* Convert repeated warnings into counters (future metrics integration) rather than repeated lines.

### Structured Context Conventions
Prefer consistent flat keys (avoid deep nesting) for index efficiency:

| Key | Meaning | Source |
|-----|---------|--------|
| `request_id` | Correlation token across logs | Middleware / helper (`request_id()`) |
| `trace_id` | Trace correlation (future) | Tracer injection (when tracing enabled) |
| `span_id` | Span correlation (future) | Tracer injection |
| `user_uuid` | Authenticated user identity | Session / auth layer |
| `endpoint` | Route pattern or URI | Router attributes |
| `latency_ms` | Request wall time | Timing helper / timer API |
| `slow` | Boolean flag for threshold breach | Slow request / query detection |

Avoid storing raw PII (emails, tokens); instead store stable hashed identifiers if needed for pattern analytics.

### Correlation & IDs
If you add a simple middleware that generates a request UUID early and stores it (e.g., in a global helper or request attribute), log lines plus future traces can be joined. When tracing is later enabled, propagate the trace context (trace_id/span_id) into the logging context (adapter hook or explicit enrichment) so log search tools can pivot to trace views.

### Channel Strategy
Start minimal (framework + app). Introduce specialized channels only when you have a consumer (e.g., ship `error` channel to alerting sink). Each extra file handle + formatter adds overhead; keep surface area intentional.

### Rotation & Retention
Environment keys:

| Setting | Env Var | Notes |
|---------|---------|-------|
| Strategy | `LOG_ROTATION_STRATEGY` | `daily` (default) or `weekly`, `monthly`, `size` |
| Days | `LOG_ROTATION_DAYS` | Retention horizon; align with compliance |
| Max Size | `LOG_MAX_SIZE` | Only used when strategy = size (e.g., `100M`) |

### Slow Threshold Signals
Framework emits warning level entries when thresholds breach:

| Signal | Enable Var | Threshold Var | Default | Context Keys |
|--------|------------|---------------|---------|--------------|
| Slow Request | `LOG_SLOW_REQUESTS` | `SLOW_REQUEST_THRESHOLD` | 1000 ms | `latency_ms`, `endpoint`, `slow` |
| Slow Query | `LOG_SLOW_QUERIES` | `SLOW_QUERY_THRESHOLD` | 200 ms | `query`, `duration_ms`, `slow` |
| Slow Outbound HTTP | `LOG_HTTP_CLIENT_FAILURES` (for failures) | `HTTP_CLIENT_SLOW_THRESHOLD` | 5000 ms | `target`, `duration_ms`, `status` |

### Database Logging
`configureDatabaseLogging()` lets you persist structured rows (optionally enriched) for exploratory queries or building dashboards. Guard this behind environment flags (`LOG_TO_DB`) to avoid production write amplification if not needed.

### Migration Path to External Backends
Wrap your app logging behind a tiny helper (e.g., `app_log('event_name', [...])`). Later you can:
* Swap file drivers with JSON emitters for forwarders (Fluent Bit, Vector).
* Add enrichers (correlation IDs, sampling decisions, deployment metadata) centrally.
* Funnel select channels to external services (ELK, Loki, Datadog) via tail/shipper without changing call sites.

### Common Pitfalls
| Pitfall | Impact | Mitigation |
|---------|--------|-----------|
| Logging payload bodies with PII | Compliance & storage risk | Mask or omit fields; whitelist attributes |
| Excess debug logs left enabled | I/O saturation | Environment-based `LOG_LEVEL` gating |
| Missing request correlation | Hard incident triage | Introduce early middleware for `request_id` |
| Oversharded channels | Operational complexity | Consolidate; derive facets from structured fields |
| Unbounded DB log table growth | Storage bloat | TTL / partitioning / retention job |

---

<!-- observability:logging:start -->
#### LogManager (class)
Enhanced Application Logger
| Method | Visibility | Static | Params |
|--------|-----------|--------|--------|
|__construct|public|no|$logFile:string<br>$maxFiles:int<br>$defaultChannel:string|
|getInstance|public|yes||
|resetInstance|public|yes||
|getLogger|public|no|$channel:string|
|setFormat|public|no|$format:string<br>$options:array|
|setSamplingRate|public|no|$rate:float|
|setMinimumLevel|public|no|$level:Monolog\Level|
|setMinimumLevelByName|public|no|$levelName:string|
|setBatchMode|public|no|$enabled:bool<br>$maxSize:int|
|configureRotation|public|no|$strategy:string<br>$parameter|
|suppressExceptions|public|no|$suppress:bool|
|configureDatabaseLogging|public|no|$enabled:bool<br>$options:array|
|channel|public|no|$channel:string|
|startTimer|public|no|$operation:string|
|endTimer|public|no|$timerId:string<br>$context:array|
|getRecentLogs|public|no||
|clearRecentLogs|public|no||
|getMemoryUsage|public|no|$real:bool|
|cleanup|public|no||
|flush|public|no||
|log|public|no|$level<br>$message:Stringable|string<br>$context:array|
|logWithChannel|public|no|$message:Stringable|string<br>$context:array<br>$level:mixed<br>$channel:?string|
|isDebugMode|public|no||
|logApiRequest|public|no|$request<br>$response<br>$error<br>$startTime|
|configure|public|no|$options:array|
|emergency|public|no|$message:Stringable|string<br>$context:array|
|alert|public|no|$message:Stringable|string<br>$context:array|
|critical|public|no|$message:Stringable|string<br>$context:array|
|error|public|no|$message:Stringable|string<br>$context:array|
|warning|public|no|$message:Stringable|string<br>$context:array|
|notice|public|no|$message:Stringable|string<br>$context:array|
|info|public|no|$message:Stringable|string<br>$context:array|
|debug|public|no|$message:Stringable|string<br>$context:array|
|getLogFormat|public|no||
|getRotationParameter|public|no||

#### LogManagerInterface (interface)
| Method | Visibility | Static | Params |
|--------|-----------|--------|--------|
|getLogger|public|no|$channel:string|
|error|public|no|$message:string<br>$context:array|
|getInstance|public|yes||

<!-- observability:logging:end -->
