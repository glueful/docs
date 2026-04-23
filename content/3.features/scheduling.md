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
            'name' => 'cleanup_sessions',
            'schedule' => '0 0 * * *', // Daily at midnight
            'handler_class' => 'App\\Jobs\\CleanupSessionsJob',
            'description' => 'Clean up expired sessions',
            'enabled' => true,
        ],
    ],
];
```

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
│  │  │  │  └─ Day of week (0-7, Sun=0/7)
│  │  │  └──── Month (1-12)
│  │  └─────── Day of month (1-31)
│  └────────── Hour (0-23)
└───────────── Minute (0-59)
```
Note: In Glueful’s scheduler, day of week is 0–6 (Sunday = 0).

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

`config/schedule.php`:

```php
return [
    'jobs' => [
        [
            'name' => 'send_daily_digest',
            'schedule' => '@daily',
            'handler_class' => 'App\\Jobs\\SendDailyDigestJob',
            'parameters' => [],
            'description' => 'Send daily email digest to users',
            'enabled' => true,
            'timeout' => 300,
            'retry_attempts' => 3,
            // optional
            // 'queue' => 'scheduled',
            // 'persistence' => true, // persist for DB tracking/history
        ],

        [
            'name' => 'cleanup_temp_files',
            'schedule' => '0 */6 * * *', // Every 6 hours
            'handler_class' => 'App\\Jobs\\CleanupTempFilesJob',
            'description' => 'Delete temporary files older than 24 hours',
            'enabled' => true,
        ],

        [
            'name' => 'generate_reports',
            'schedule' => '0 1 * * *', // 1:00 AM daily
            'handler_class' => 'App\\Jobs\\GenerateReportsJob',
            'description' => 'Generate daily analytics reports',
            'enabled' => env('REPORTS_ENABLED', true),
        ],
    ],

    'settings' => [
        'enabled' => env('SCHEDULER_ENABLED', true),
        'max_concurrent_jobs' => env('MAX_CONCURRENT_JOBS', 5),
        'default_timeout' => env('DEFAULT_JOB_TIMEOUT', 300),
        // Additional options
        'default_queue' => env('DEFAULT_SCHEDULED_QUEUE', 'scheduled'),
        'queue_connection' => env('SCHEDULE_QUEUE_CONNECTION', 'default'),
        'use_queue_for_all_jobs' => env('USE_QUEUE_FOR_SCHEDULED_JOBS', true),
        'log_execution' => env('LOG_JOB_EXECUTION', true),
        'notification_on_failure' => env('NOTIFY_ON_JOB_FAILURE', env('APP_ENV') === 'production'),
    ],

    // Map named queues to job names (optional)
    'queue_mapping' => [
        'critical' => ['database_backup'],
        'maintenance' => ['session_cleaner', 'log_cleanup', 'cache_maintenance'],
        'notifications' => ['notification_retry_processor'],
        'system' => ['queue_maintenance'],
    ],
];
```

### Persistence

If you add `'persistence' => true` to a job in `config/schedule.php`, the scheduler persists it to the `scheduled_jobs` table and records executions in `job_executions`:
- Jobs gain `last_run`/`next_run` tracking and show up in `list`, `status`, and history.
- The scheduler invokes your handler class’s `handle(array $params = [])` method with the configured `parameters`.

Without persistence, jobs are registered in memory for the current process only (useful for quick, ephemeral schedules during development).

### Programmatic

```php
use Glueful\Scheduler\JobScheduler;

$scheduler = app($context, JobScheduler::class);

$scheduler->register('@hourly', function() {
    // Cleanup task
    $storage->cleanupOldFiles('temp/', 86400);
}, 'hourly-cleanup');
```

## Job Handlers

Create job handler classes:

Note: When jobs are loaded from config/database, the scheduler invokes your handler as handle($params). Define your method as handle(array $params = []): void and read values from $params when needed.

```php
namespace App\Jobs;

class CleanupSessionsJob
{
    public function handle(array $params = []): void
    {
        $cutoff = date('Y-m-d H:i:s', strtotime('-30 days'));

        db($context)->table('sessions')
            ->where('last_activity', '<', $cutoff)
            ->delete();

        app($context, \Psr\Log\LoggerInterface::class)->info('Cleaned up expired sessions');
    }
}
```

## Common Scheduled Tasks

### Daily Cleanup

```php
[
    'name' => 'daily_cleanup',
    'schedule' => '@daily',
    'handler_class' => 'App\\Jobs\\DailyCleanupJob',
],
```

```php
class DailyCleanupJob
{
    public function handle(array $params = []): void
    {
        // Delete old sessions
        db($context)->table('sessions')
            ->where('created_at', '<', date('Y-m-d', strtotime('-7 days')))
            ->delete();

        // Delete old logs
        db($context)->table('activity_logs')
            ->where('created_at', '<', date('Y-m-d', strtotime('-90 days')))
            ->delete();

        // Delete temporary files
        Storage::cleanupOldFiles('temp/', 86400);
    }
}
```

### Hourly Cache Warm

```php
[
    'name' => 'warm_cache',
    'schedule' => '@hourly',
    'handler_class' => 'App\\Jobs\\WarmCacheJob',
],
```

```php
class WarmCacheJob
{
    public function handle(array $params = []): void
    {
        // Warm popular product cache
        $products = db($context)->table('products')
            ->where('is_featured', true)
            ->get();

        foreach ($products as $product) {
            Cache::set('product:' . $product->uuid, $product, 3600);
        }
    }
}
```

### Weekly Reports

```php
[
    'name' => 'weekly_report',
    'schedule' => '0 9 * * 1', // Mondays at 9 AM
    'handler_class' => 'App\\Jobs\\WeeklyReportJob',
],
```

```php
class WeeklyReportJob
{
    public function handle(array $params = []): void
    {
        $stats = [
            'users' => db($context)->table('users')->count(),
            'orders' => db($context)->table('orders')
                ->where('created_at', '>=', date('Y-m-d', strtotime('-7 days')))
                ->count(),
            'revenue' => db($context)->table('orders')
                ->where('created_at', '>=', date('Y-m-d', strtotime('-7 days')))
                ->sum('total'),
        ];

        // Email report
        Notifications::send(
            type: 'report.weekly',
            notifiable: $admin,
            subject: 'Weekly Report',
            data: ['stats' => $stats]
        );
    }
}
```

### Nightly Backups

```php
[
    'name' => 'backup_database',
    'schedule' => '0 2 * * *', // 2:00 AM daily
    'handler_class' => 'App\\Jobs\\BackupDatabaseJob',
],
```

```php
class BackupDatabaseJob
{
    public function handle(array $params = []): void
    {
        $filename = 'backup-' . date('Y-m-d') . '.sql';

        exec("mysqldump -u{$user} -p{$pass} {$db} > {$path}/{$filename}");

        // Upload to S3
        Storage::disk('s3')->put("backups/{$filename}", file_get_contents("{$path}/{$filename}"));

        app($context, \Psr\Log\LoggerInterface::class)->info('Database backup completed', ['file' => $filename]);
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

# Custom interval
php glueful queue:scheduler work --interval=30
```

### System Cron

Add to system crontab to run scheduler every minute:

```cron
* * * * * cd /path/to/app && php glueful queue:scheduler run >> /dev/null 2>&1
```

## Monitoring

### List Jobs

```bash
php glueful queue:scheduler list
```

### Check Status

```bash
php glueful queue:scheduler status
```

### Health Check

```bash
php glueful queue:scheduler health
```

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

`.env`:

```env
SCHEDULER_ENABLED=true
MAX_CONCURRENT_JOBS=5
DEFAULT_JOB_TIMEOUT=300

# Optional advanced settings
DEFAULT_SCHEDULED_QUEUE=scheduled
SCHEDULE_QUEUE_CONNECTION=default
USE_QUEUE_FOR_SCHEDULED_JOBS=true
LOG_JOB_EXECUTION=true
NOTIFY_ON_JOB_FAILURE=false
```

## Best Practices

### Keep Jobs Simple

```php
// ✅ Good - delegates to job queue
class SendDigestJob
{
    public function handle(array $params = []): void
    {
        $users = db($context)->table('users')->where('digest_enabled', true)->get();

        $queue = service($context, \Glueful\Queue\QueueManager::class);
        foreach ($users as $user) {
            $queue->push(\App\Jobs\SendUserDigestJob::class, ['userId' => $user->id]);
        }
    }
}

// ❌ Bad - does everything inline
class SendDigestJob
{
    public function handle(array $params = []): void
    {
        // Heavy processing in scheduled job...
    }
}
```

### Idempotent Tasks

```php
// ✅ Good - safe to run multiple times
public function handle(): void
{
    $today = date('Y-m-d');

    if (Cache::has("report:generated:{$today}")) {
        return; // Already ran today
    }

    $this->generateReport();

    Cache::set("report:generated:{$today}", true, 86400);
}
```

### Logging

```php
public function handle(): void
{
    app($context, \Psr\Log\LoggerInterface::class)->info('Starting daily cleanup');

    $deleted = db($context)->table('sessions')
        ->where('expires_at', '<', now())
        ->delete();

    app($context, \Psr\Log\LoggerInterface::class)->info('Daily cleanup completed', [
        'sessions_deleted' => $deleted
    ]);
}
```

## Troubleshooting

**Jobs not running?**
- Verify scheduler is running (`work` command or cron)
- Check cron expression is valid
- Ensure job is enabled in config

**Jobs running multiple times?**
- Check only one scheduler instance is running
- Verify cron isn't triggering duplicates
- Consider using distributed locks

**Jobs timing out?**
- Increase `timeout` in job config
- Break into smaller jobs
- Queue heavy work instead

## Next Steps

- [Queues & Jobs](/features/queues-jobs) - Background processing
- [Events](/features/events) - Trigger scheduled tasks
- [Caching](/features/caching) - Cache warming tasks
