---
title: Scheduler API
description: Define and manage recurring tasks
---

# Scheduler API

APIs to register and manage scheduled tasks.

<!-- scheduler-locks:scheduler:start -->
| Name | Cron | Handler | Queue | Enabled | Retries | Timeout(s) | Description |
|------|------|---------|-------|---------|---------|-----------|-------------|
|session_cleaner|0 0 * * *|Glueful\Queue\Jobs\SessionCleanupJob|maintenance|yes|3|300|Clean up expired user sessions|
|log_cleanup|0 1 * * *|Glueful\Queue\Jobs\LogCleanupJob|maintenance|yes|2|600|Clean up old log files|
|database_backup|0 2 * * *|Glueful\Queue\Jobs\DatabaseBackupJob|critical|no|1|1800|Create automated database backups|
|cache_maintenance|0 3 * * *|Glueful\Queue\Jobs\CacheMaintenanceJob|maintenance|yes|2|600|Perform cache maintenance|
|notification_retry_processor|*/10 * * * *|Glueful\Queue\Jobs\NotificationRetryJob|notifications|yes|2|300|Process queued notification retries|

<!-- scheduler-locks:scheduler:end -->

## Overview
The scheduler lets you declare recurring background work using familiar cron expressions combined with rich per-job metadata (queue, retry attempts, timeout, description, enabled flag, custom parameters). Jobs are defined centrally in `config/schedule.php` so they can be audited and managed as code.

## Defining Jobs
Each job entry in `config/schedule.php` includes:
- `name` Unique identifier (used for targeting, disabling, metrics).
- `schedule` Cron expression (supports standard 5-part syntax; environment overrides allowed).
- `handler_class` Queue job class that performs the work.
- `parameters` Arbitrary key/value array passed to the job instance or its handler.
- `queue` Which queue connection/channel to dispatch through (can segregate critical vs maintenance work).
- `timeout` Hard execution ceiling (seconds) enforcing cancellation/termination policy.
- `retry_attempts` Automatic retry attempts for transient failures.
- `enabled` Boolean / env-driven gate allowing selective rollout.
- `description` Human-readable purpose surfaced in docs & dashboards.

## Parameters & Environment Overrides
Many fields leverage `env()` to allow dynamic behavior per environment (e.g. enabling backups only in production, customizing retention days). Keep defaults conservative and override upward (safer) rather than the reverse. Complex nested parameter structures (like `options.retention_days`) are supported.

## Execution Semantics
1. Scheduler evaluates each job on its configured cadence.
2. If `enabled` resolves true and concurrency / max limits allow, a queue payload referencing the `handler_class` is enqueued.
3. Workers pick up the job, hydrate parameters, and enforce the declared `timeout`.
4. Failures trigger retry (bounded by `retry_attempts`) with exponential or fixed backoff (implementation specific).
5. Metrics & logs capture run duration, success/failure, and next scheduled time (future enhancement hooks).

## Queue Interaction
Jobs declare a `queue`. Use separate queues to isolate latency-sensitive (e.g. `critical`) from routine maintenance. The scheduler can later expose per-queue saturation metrics to inform tuning.

## Disabling / Enabling
Set `enabled => false` (or corresponding env var) to pause a job without deleting its definition. This preserves history and intent while preventing dispatch.

## Adding a New Job
1. Create a job class in `src/Queue/Jobs`, e.g. `ExampleReportJob` implementing the required handle/execute method.
2. Add a new array entry to `config/schedule.php` with name, cron, handler class, and metadata.
3. (Optional) Add parameters for customization.
4. Regenerate docs: `php tools/docs/generate.php --target=scheduler-locks --target=scheduler-locks-scheduler` to update the table.

### Minimal Example
```php
// config/schedule.php (excerpt)
'jobs' => [
	[
		'name' => 'daily_report',
		'schedule' => '15 6 * * *', // 06:15 daily
		'handler_class' => 'Glueful\\Queue\\Jobs\\DailyReportJob',
		'parameters' => ['report' => 'usage'],
		'description' => 'Generate daily usage report',
		'enabled' => env('DAILY_REPORT_ENABLED', true),
		'queue' => 'reports',
		'timeout' => 900,
		'retry_attempts' => 2,
	],
],
```

## Error Handling & Observability
Standardized settings (`timeout`, `retry_attempts`) enable consistent operational behavior. Future instrumentation can derive:
- Success/failure counts per job.
- Average runtime vs timeout threshold utilization.
- Skipped (disabled) job occurrences.
- Queue latency from scheduled timestamp to start execution.

## Design Guidelines
- Prefer small, composable jobs over monolith tasks to improve resilience and retry precision.
- Use descriptive `name` values: `domain_action_frequency` pattern (e.g., `cache_maintenance`).
- Avoid overlapping heavy jobs at identical cron minutes; stagger start times (already done above: 0:00, 1:00, 2:00, 3:00).
- Keep timeouts modest; rely on job chaining or follow-ups for extended work.

## Future Enhancements (Planned)
- Per-job concurrency caps / distributed mutex prior to dispatch.
- Dynamic schedule reloading without full deploy.
- Metrics export (next/previous run, last duration, failure streak).
- Web UI toggle for `enabled` state.
