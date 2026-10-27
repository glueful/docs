---
title: Task Scheduling
description: Run tasks on a schedule with cron-like syntax
---

Schedule recurring tasks to run automatically at specified times using cron expressions.

## Quick Start

### 1. Define Scheduled Task

`config/schedule.php`:

```php
return [
    'jobs' => [
        [
            'name' => 'cleanup_temp_files',
            'schedule' => '0 0 * * *', // Daily at midnight
            'handler_class' => 'App\\Jobs\\CleanupTempFilesJob',
            'description' => 'Delete temporary files older than a day',
            'enabled' => true,
        ],
    ],
];
```

::u-alert{color="warning" variant="subtle" icon="i-lucide-triangle-alert"}
**Your `jobs` list replaces the framework's — it is not merged** (since 1.86). An app that ships its
own `config/schedule.php` runs only the jobs it lists, so copy in the framework defaults you still
want: `session_cleaner`, `log_cleanup`, `database_backup`, `cache_maintenance`,
`notification_retry_processor`, `scheduled_notifications`, `queue_maintenance`, `webhook_cleanup`
and `blob_purge` (see the framework's `config/schedule.php`). Without `blob_purge`, deleted uploads
are never purged; without `scheduled_notifications` (added in 1.91), notifications sent with a
`schedule` never go out; without `queue_maintenance` (added in 1.91), failed jobs are never pruned.
::

### 2. Run Scheduler

```bash
# Run all due jobs once
php glueful queue:scheduler run

# Run continuously (daemon mode)
php glueful queue:scheduler work --interval=60
```

## Cron Expressions

Standard 5-part cron syntax:

```
*  *  *  *  *
│  │  │  │  │
│  │  │  │  └─ Day of week (0-7, Sunday = 0 or 7)
│  │  │  └──── Month (1-12)
│  │  └─────── Day of month (1-31)
│  └────────── Hour (0-23)
└───────────── Minute (0-59)
```

Expressions are parsed by `dragonmantank/cron-expression`.

### Common Patterns

```php
// Every minute
'schedule' => '* * * * *'

// Every 5 minutes
'schedule' => '*/5 * * * *'

// Every hour
'schedule' => '0 * * * *'

// Every hour at 30 minutes past
'schedule' => '30 * * * *'

// Daily at midnight
'schedule' => '0 0 * * *'

// Daily at 3:00 AM
'schedule' => '0 3 * * *'

// Weekdays at 9:00 AM
'schedule' => '0 9 * * 1-5'

// First day of month
'schedule' => '0 0 1 * *'

// Every Sunday at 2:00 AM
'schedule' => '0 2 * * 0'
```

### Shortcut Macros

```php
'schedule' => '@yearly'   // 0 0 1 1 *
'schedule' => '@monthly'  // 0 0 1 * *
'schedule' => '@weekly'   // 0 0 * * 0
'schedule' => '@daily'    // 0 0 * * *
'schedule' => '@hourly'   // 0 * * * *
```

## Defining Jobs

### Config-Based

Each entry in `config/schedule.php` takes exactly these keys:

| Key | Required | Meaning |
|---|---|---|
| `name` | yes | Unique job name (also the lock key) |
| `schedule` | yes | Cron expression or macro |
| `handler_class` | yes | Job class to run (must implement `JobInterface`) |
| `parameters` | no | Array handed to the handler |
| `enabled` | no | `false` skips the job (typically an env switch) |
| `persistence` | no | `true` registers the job in the database instead of memory |
| `description` | no | Shown in `list` |

```php
return [
    'jobs' => [
        [
            'name' => 'send_daily_digest',
            'schedule' => '@daily',
            'handler_class' => 'App\\Jobs\\SendDailyDigestJob',
            'parameters' => ['limit' => 500],
            'description' => 'Send daily email digest to users',
            'enabled' => env('DAILY_DIGEST_ENABLED', true),
        ],
        [
            'name' => 'generate_reports',
            'schedule' => '0 1 * * *', // 1:00 AM daily
            'handler_class' => 'App\\Jobs\\GenerateReportsJob',
            'description' => 'Generate daily analytics reports',
        ],
    ],
];
```

Nothing else is read. Config jobs run **inline**, in the process that runs `queue:scheduler`: there
is no per-job `queue`, `timeout` or `retry_attempts`, and no `settings` or `queue_mapping` block
(all removed in 1.86 — delete them from your copy). To run heavy work on a queue, have the scheduled
job push queue jobs (see [Best Practices](#best-practices)).

### Persistence

With `'persistence' => true`, the scheduler stores the job in the `scheduled_jobs` table and records
each run in `job_executions` (`last_run`/`next_run` tracking). Registration is idempotent by name:
every scheduler load updates the existing row (schedule, handler, parameters) in place, keeping its
uuid, run history and `is_enabled` flag. Its parameters are stored in a signed envelope (see
[payload signing](/features/queues-jobs#payload-signing)); a row whose parameters, handler, name or
schedule were altered is refused. Without persistence, jobs are registered in memory for the
current process.

::u-alert{color="neutral" variant="subtle" icon="i-lucide-info"}
**Since 1.91:** earlier releases inserted a new `scheduled_jobs` row on every load, and each
duplicate ran. The first 1.91 load removes those duplicate rows for you.
::

### Programmatic

```php
use Glueful\Scheduler\JobScheduler;

$scheduler = app($context, JobScheduler::class);

$scheduler->register('@hourly', function () use ($context) {
    // Cleanup task
}, 'hourly-cleanup');
```

`register(string $schedule, callable $callback, string $name = '')` adds an in-memory job for the
current process only.

## Job Handlers

A scheduled handler is a queue job: it must extend `Glueful\Queue\Job` (or otherwise implement
`Glueful\Queue\Contracts\JobInterface`) — any other class is refused. The scheduler builds it with
the configured `parameters` and the application context, then calls `handle()`. Read the
parameters with `$this->getData()` and reach services through `$this->context`:

```php
namespace App\Jobs;

use Glueful\Queue\Job;
use Glueful\Storage\StorageManager;
use Psr\Log\LoggerInterface;

class CleanupTempFilesJob extends Job
{
    public function handle(): void
    {
        $maxAge = (int) ($this->getData()['max_age'] ?? 86400);
        $storage = app($this->context, StorageManager::class);

        foreach ($storage->listContents('temp/', true) as $item) {
            if ($item->isFile() && $item->lastModified() < time() - $maxAge) {
                $storage->delete($item->path());
            }
        }

        app($this->context, LoggerInterface::class)->info('Cleaned up temp files');
    }
}
```

Each job runs under a lock named `scheduler:job:{name}` (one hour TTL) when a lock manager is
available, so two scheduler processes don't run the same job at once.

## Built-in Jobs

The framework's default `config/schedule.php` ships these (each toggled by an env var):

| Name | Schedule | Handler | Toggle |
|---|---|---|---|
| `session_cleaner` | `0 0 * * *` | `Glueful\Queue\Jobs\SessionCleanupJob` | `SESSION_CLEANER_ENABLED` |
| `log_cleanup` | `0 1 * * *` | `Glueful\Queue\Jobs\LogCleanupJob` | `LOG_CLEANUP_ENABLED` (`LOG_RETENTION_DAYS`) |
| `database_backup` | `DB_BACKUP_SCHEDULE` (`0 2 * * *`) | `Glueful\Queue\Jobs\DatabaseBackupJob` | `DB_BACKUP_ENABLED` (production only by default) |
| `cache_maintenance` | `0 3 * * *` | `Glueful\Queue\Jobs\CacheMaintenanceJob` | `CACHE_MAINTENANCE_ENABLED` |
| `notification_retry_processor` | `*/10 * * * *` | `Glueful\Queue\Jobs\NotificationRetryJob` | `NOTIFICATION_RETRIES_ENABLED` |
| `scheduled_notifications` | `* * * * *` | `Glueful\Queue\Jobs\ScheduledNotificationsJob` | `SCHEDULED_NOTIFICATIONS_ENABLED` |
| `queue_maintenance` | `15 4 * * *` | `Glueful\Queue\Jobs\QueueMaintenanceJob` | `QUEUE_MAINTENANCE_ENABLED` |
| `webhook_cleanup` | `30 3 * * *` | `Glueful\Api\Webhooks\Jobs\WebhookCleanupJob` | `WEBHOOK_CLEANUP_ENABLED` |
| `blob_purge` | `45 3 * * *` | `Glueful\Uploader\Jobs\BlobPurgeJob` | `BLOB_PURGE_ENABLED` |

`scheduled_notifications` delivers [scheduled notifications](/features/notifications#scheduled-notifications)
once they fall due (up to 50 per run); it does nothing when `NOTIFICATIONS_DATABASE_STORE=false`.
`queue_maintenance` prunes [failed jobs](/features/queues-jobs#failed-jobs) older than
`queue.failed.retention_days` (default 30) and cleans stale worker records.

The database backup needs `pg_dump` or `mysqldump` on the scheduler host for PostgreSQL/MySQL, and
fails its run when no dump is made. `webhook_cleanup` prunes delivery records for
[webhooks](/features/webhooks).

## Common Scheduled Tasks

### Weekly Report

```php
[
    'name' => 'weekly_report',
    'schedule' => '0 9 * * 1', // Mondays at 9 AM
    'handler_class' => 'App\\Jobs\\WeeklyReportJob',
],
```

```php
use Glueful\Queue\Job;

class WeeklyReportJob extends Job
{
    public function handle(): void
    {
        $since = date('Y-m-d', strtotime('-7 days'));

        $stats = [
            'users' => db($this->context)->table('users')->count(),
            'orders' => db($this->context)->table('orders')
                ->where('created_at', '>=', $since)
                ->count(),
        ];

        // ... deliver $stats (e.g. through a notification)
    }
}
```

## Running Scheduler

### One-Time Run

```bash
# Run all due jobs
php glueful queue:scheduler run

# Force run all jobs (ignore schedule)
php glueful queue:scheduler run --force

# Dry run (show what would run)
php glueful queue:scheduler run --dry-run
```

### Daemon Mode

```bash
# Run continuously, check every 60 seconds
php glueful queue:scheduler work --interval=60

# Stop after N passes; --watch shows a live status screen
php glueful queue:scheduler work --interval=60 --max-runs=100
```

### System Cron

Add to system crontab to run scheduler every minute:

```cron
* * * * * cd /path/to/app && php glueful queue:scheduler run >> /dev/null 2>&1
```

## Monitoring

```bash
# List registered jobs (--output-format=table|json|plain)
php glueful queue:scheduler list

# Stats and the next upcoming jobs
php glueful queue:scheduler status

# Health check
php glueful queue:scheduler health
```

Those five actions (`run`, `work`, `list`, `status`, `health`) are the whole command: jobs are
added, removed, enabled and disabled in `config/schedule.php`, and the run history of persisted jobs
is in the `job_executions` table. An unknown action fails and lists the available ones.

::u-alert{color="neutral" variant="subtle" icon="i-lucide-info"}
**Since 1.91:** the `add`, `remove`, `enable`, `disable` and `history` stubs (and their
`--job-name`, `--cron`, `--command`, `--description`, `--timeout`, `--history` options) are gone.
They printed "not yet implemented" and exited 0; scripts that call them now fail. See
[Upgrading](/upgrading).
::

## Production Setup

### Supervisor

`/etc/supervisor/conf.d/scheduler.conf`:

```ini
[program:scheduler]
command=php /path/to/app/glueful queue:scheduler work --interval=60
autostart=true
autorestart=true
user=www-data
stdout_logfile=/var/log/scheduler.log
```

Reload supervisor:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start scheduler
```

### Docker

`docker-compose.yml`:

```yaml
services:
  scheduler:
    image: your-app
    command: php glueful queue:scheduler work --interval=60
    restart: always
```

## Configuration

There are no scheduler env vars beyond the per-job toggles above: `SCHEDULER_ENABLED`,
`MAX_CONCURRENT_JOBS`, `DEFAULT_JOB_TIMEOUT`, `SCHEDULE_QUEUE_*` and the like are not read. Turn a
job off with its `enabled` key. The `scheduled_jobs`/`job_executions` tables are core migrations and
always installed; `SCHEDULE_DATABASE_STORE` (removed from `config/capabilities.php` in 1.91) never
gated anything — delete it from published copies.

## Best Practices

### Keep Jobs Simple

Scheduled jobs run inline in the scheduler process — fan heavy work out to the queue:

```php
use Glueful\Queue\Job;
use Glueful\Queue\QueueManager;

// ✅ Good - delegates to the job queue
class SendDigestJob extends Job
{
    public function handle(): void
    {
        $users = db($this->context)->table('users')
            ->where('digest_enabled', true)
            ->get();

        $queue = app($this->context, QueueManager::class);
        foreach ($users as $user) {
            $queue->push(\App\Jobs\SendUserDigestJob::class, ['userUuid' => $user['uuid']]);
        }
    }
}
```

### Idempotent Tasks

```php
use Glueful\Cache\CacheStore;

// ✅ Good - safe to run multiple times
public function handle(): void
{
    $today = date('Y-m-d');
    $cache = app($this->context, CacheStore::class);

    if ($cache->has("report:generated:{$today}")) {
        return; // Already ran today
    }

    $this->generateReport();

    $cache->set("report:generated:{$today}", true, 86400);
}
```

## Troubleshooting

**Jobs not running?**
- Verify scheduler is running (`work` command or cron)
- Check the cron expression is valid
- Ensure the job is enabled, and listed in *your* `config/schedule.php` if the app has one
- "Refusing to run scheduled job handler" in the log: the handler does not implement `JobInterface`
  (or a persisted row's signature no longer matches)

**Jobs running multiple times?**
- Check only one scheduler instance is running
- Verify cron isn't triggering duplicates
- Configure a lock store so the per-job lock applies

**Jobs taking too long?**
- Break into smaller jobs
- Queue the heavy work instead

## Next Steps

- [Queues & Jobs](/features/queues-jobs) - Background processing
- [Events](/features/events) - Trigger scheduled tasks
- [Caching](/features/caching) - Cache warming tasks
