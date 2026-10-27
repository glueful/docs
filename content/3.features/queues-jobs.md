---
title: Queues & Jobs
description: Process background tasks with retries and failure handling
---

Offload slow operations from HTTP requests: emails, reports, image processing, webhooks, bulk imports.

## Quick Start

### 1. Create a Job

```bash
php glueful scaffold:job SendWelcomeEmailJob   # writes app/Jobs/SendWelcomeEmailJob.php
```

A job extends `Glueful\Queue\Job` and implements `handle()`. The worker builds it with the data you
pushed and the application context, so read input with `$this->getData()` and resolve services
through `$this->context`:

```php
namespace App\Jobs;

use Glueful\Queue\Job;
use Psr\Log\LoggerInterface;

class SendWelcomeEmailJob extends Job
{
    public function handle(): void
    {
        $data = $this->getData();

        $user = db($this->context)->table('users')
            ->where('uuid', $data['userUuid'])
            ->first();

        if ($user === null) {
            return; // Nothing to do
        }

        // ... send the email

        app($this->context, LoggerInterface::class)->info('Welcome email sent', [
            'user' => $data['userUuid'],
        ]);
    }
}
```

::u-alert{color="warning" variant="subtle" icon="i-lucide-shield"}
**Job classes must implement `Glueful\Queue\Contracts\JobInterface`** (extending `Glueful\Queue\Job`
does this). A stored payload names a class; the worker refuses to instantiate any class that is not
a job, so a tampered queue row cannot trigger an arbitrary constructor.
::

### 2. Dispatch the Job

```php
use Glueful\Queue\QueueManager;
use App\Jobs\SendWelcomeEmailJob;

$queue = app($context, QueueManager::class);
$jobUuid = $queue->push(SendWelcomeEmailJob::class, ['userUuid' => $userUuid]);
```

`push(string $job, array $data = [], ?string $queue = null, ?string $connection = null)` returns the
job's uuid.

#### Why class names + data

- Deterministic serialization: only the job class name and a plain array are enqueued, making payloads easy to serialize and version safely.
- Safer and portable: avoids serializing arbitrary PHP objects; drivers store compact JSON payloads that work across processes and connections.
- Reliable retries/delays: workers rehydrate the job with the data and run `handle()`, ensuring consistent behavior on every attempt.
- Clear contracts: jobs read inputs via `getData()`, keeping state explicit and idempotent-friendly.

### 3. Run a Worker

```bash
php glueful queue:work
```

Plain `queue:work` runs **one** worker that processes jobs until stopped.

```bash
# Process a single job, then exit
php glueful queue:work --once

# Drain the queue and exit (useful for cron / one-shot processing)
php glueful queue:work --stop-when-empty

# Target a specific connection and queues
php glueful queue:work --connection=redis --queue=high,default
```

#### `queue:work` options

| Option | Default | Meaning |
|---|---|---|
| `--connection` | `queue.default` | Queue connection to process |
| `--queue` | `default` | Queue(s) to process, comma-separated, in priority order |
| `--once` | — | Process at most one job, then exit |
| `--stop-when-empty` | — | Exit when the queue is empty |
| `--sleep` | `3` | Seconds to sleep when no job is available |
| `--memory`, `-m` | `128` | Memory limit in MB |
| `--timeout`, `-t` | `60` | Job timeout in seconds: a job past it is released (or failed when out of attempts) and the worker exits for its process manager to restart. Needs the pcntl extension |
| `--max-jobs` | `0` | Exit after this many jobs (0 = unlimited) |
| `--max-runtime` | `0` | Exit after this many seconds (0 = unlimited) |
| `--tries` | `3` | Maximum attempts before a job is marked failed |

::u-alert{color="info" variant="subtle" icon="i-lucide-package"}
**Need a supervised fleet or autoscaling?** Core ships only the lean single-worker
`queue:work`. Multi-worker supervision, autoscaling, and worker/job metrics live in the optional
[`glueful/queue-ops`](https://github.com/glueful/queue-ops) extension, which adds `queue:supervise`
and `queue:autoscale`. See [Queue Infrastructure](/cookbook/queues-and-jobs).
::

## When to Use Jobs

**Use jobs for:**
- Email sending
- Image/video processing
- Report generation
- API webhooks
- Bulk operations
- Cache warming
- Data imports

**Keep in HTTP response:**
- Critical user feedback
- Small, fast operations
- Required synchronous validation

## Configuration

`config/queue.php` (excerpt):

```php
return [
    // `database` or `redis` — the two drivers the framework ships
    'default' => env('QUEUE_CONNECTION', 'database'),

    'connections' => [
        'database' => [
            'driver' => 'database',
            'table' => 'queue_jobs',
            'queue' => 'default',
            'retry_after' => 90,
            'failed_table' => 'queue_failed_jobs',
        ],
        'redis' => [
            'driver' => 'redis',
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'port' => env('REDIS_PORT', 6379),
            'password' => env('REDIS_PASSWORD'),
            'database' => env('REDIS_DB', 0),
            'prefix' => env('REDIS_QUEUE_PREFIX', 'glueful:queue:'),
            'queue' => env('REDIS_QUEUE', 'default'),
            'retry_after' => 90,
            'job_expiration' => 3600,
        ],
    ],

    'failed' => [
        'table' => 'queue_failed_jobs',
        'max_retries' => 5,     // stored only — nothing enforces it
        'retention_days' => 30, // age at which cleanup() / queue_maintenance prune failures
    ],

    'workers' => [
        'performance' => [
            // Delay before a failed job is retried
            'backoff_strategy' => env('QUEUE_BACKOFF_STRATEGY', 'exponential'), // linear, exponential, fixed
            'backoff_base' => env('QUEUE_BACKOFF_BASE', 2),
            'max_backoff' => env('QUEUE_MAX_BACKOFF', 3600),
        ],
    ],

    'security' => [
        'payload_signing' => [
            'enabled' => env('QUEUE_PAYLOAD_SIGNING', true),
            'require_signed' => env('QUEUE_REQUIRE_SIGNED_PAYLOADS', true),
        ],
    ],
];
```

There are no `sync` or `null` connections (removed in 1.86 — no such drivers exist).

### Payload Signing

Queue backends are mutable storage, so every payload the database and Redis drivers store is signed
with an HMAC (SHA-256) keyed on `APP_KEY` (`app.key`). The worker verifies the signature before it
runs a job: a payload whose class, data, attempts or timeout were altered is refused, and with
`QUEUE_REQUIRE_SIGNED_PAYLOADS=true` an unsigned payload is refused too. Scheduled-job parameters
persisted to `scheduled_jobs` are signed the same way.

- Keep `APP_KEY` identical on every process that pushes or works jobs; changing it invalidates jobs
  already queued.
- Without an `APP_KEY`, payloads are neither signed nor verified.

## Job Basics

### Simple Job

```php
use Glueful\Queue\Job;

class RecalculateMetricsJob extends Job
{
    public function handle(): void
    {
        $accountId = $this->getData()['accountId'];

        // ... recalculate
    }
}
```

### Dispatch

```php
$queue->push(RecalculateMetricsJob::class, ['accountId' => $accountId]);
```

## Delayed Jobs

Schedule jobs for later:

```php
// Run in 5 minutes (300 seconds)
$queue->later(300, RecalculateMetricsJob::class, ['accountId' => $accountId]);

// Run tomorrow
$queue->later(86400, SendReportJob::class, ['userId' => $userId]);
```

## Priority Queues

Use different queues for different priorities:

```php
// High priority
$queue->push(CriticalPaymentJob::class, ['data' => $data], 'payments_high');

// Normal priority
$queue->push(SendEmailJob::class, ['userUuid' => $userUuid], 'emails');

// Low priority
$queue->push(GenerateReportJob::class, ['id' => $id], 'reports_low');
```

Start workers by priority:

```bash
# Process high priority first
php glueful queue:work --queue=payments_high,emails,reports_low
```

## Retries & Failures

### Automatic Retries

A job that throws is released back onto its queue until it has used
`min($job->getMaxAttempts(), --tries)` attempts; each retry waits the backoff computed from
`queue.workers.performance` (exponential by default). After the last attempt the worker calls the
job's `failed()` method and the job is recorded as failed (see [Failed Jobs](#failed-jobs)).

```php
use Glueful\Http\Client;
use Glueful\Queue\Job;
use Psr\Log\LoggerInterface;

class SendWebhookJob extends Job
{
    public function getMaxAttempts(): int
    {
        return 5; // default is 3; --tries still caps it
    }

    public function handle(): void
    {
        $data = $this->getData();
        $response = app($this->context, Client::class)
            ->post($data['webhookUrl'], ['json' => $data['payload'] ?? []]);

        if (!$response->isSuccessful()) {
            throw new \RuntimeException('Webhook failed: HTTP ' . $response->getStatusCode());
        }
    }

    public function failed(\Exception $exception): void
    {
        app($this->context, LoggerInterface::class)
            ->error('Webhook gave up', ['error' => $exception->getMessage()]);
    }
}
```

### Custom Retry Logic

Call `release($delay)` to put the job back with a delay of your choosing, or catch an error you
should not retry:

```php
class ImportDataJob extends Job
{
    public function handle(): void
    {
        try {
            $this->importData();
        } catch (RateLimitedException $e) {
            $this->release(300); // Try again in 5 minutes
        } catch (PermanentException $e) {
            // Don't retry, just log
            app($this->context, \Psr\Log\LoggerInterface::class)
                ->error('Import failed permanently', ['error' => $e->getMessage()]);
        }
    }
}
```

## Idempotent Jobs

Make jobs safe to retry:

```php
class GenerateInvoicePdfJob extends Job
{
    public function handle(): void
    {
        $invoiceId = $this->getData()['invoiceId'];

        // Check if already generated
        if ($this->alreadyGenerated($invoiceId)) {
            return; // Safe no-op
        }

        $pdf = $this->generatePdf($invoiceId);
        $this->storePdf($invoiceId, $pdf);
    }
}
```

## Bulk Operations

Dispatch many jobs efficiently:

```php
// Warm cache for 1000 users
$userIds = range(1, 1000);

$jobs = array_map(
    fn($id) => [
        'job' => WarmUserCacheJob::class,
        'data' => ['userId' => $id],
    ],
    $userIds
);

$uuids = $queue->bulk($jobs, 'cache_warmup');
```

## Job Chaining

There is no chaining API. Push the next job at the end of the current job's `handle()`, so it is
queued only once the first one succeeds:

```php
class ProcessVideoJob extends Job
{
    public function handle(): void
    {
        $data = $this->getData();

        // ... process the video

        app($this->context, QueueManager::class)
            ->push(NotifyUserJob::class, ['userId' => $data['userId'], 'message' => 'Video ready!']);
    }
}
```

## Common Patterns

### Report Generation

```php
use Glueful\Queue\Job;
use Glueful\Queue\QueueManager;
use Glueful\Storage\StorageManager;

class GenerateMonthlyReportJob extends Job
{
    public function handle(): void
    {
        $data = $this->getData();
        $pdf = $this->generatePdf($this->gatherData());

        // Store the report on the default disk
        app($this->context, StorageManager::class)
            ->put("reports/monthly-{$data['month']}.pdf", $pdf);

        // Notify user
        app($this->context, QueueManager::class)
            ->push(NotifyReportReadyJob::class, ['userId' => $data['userId']]);
    }
}
```

For email, prefer [Notifications](/features/notifications), which can queue delivery for you.

## Monitoring

```php
// Queue depth
$pending = $queue->size('default');

// Failed jobs (database driver)
$failed = db($context)->table('queue_failed_jobs')->count();

// Oldest waiting job (database driver)
$oldest = db($context)->table('queue_jobs')
    ->orderBy('created_at', 'asc')
    ->first();
```

## Failed Jobs

A job that exhausted its attempts lands in `queue_failed_jobs` (database driver) or the
`queue:{name}:failed` list (Redis driver). Manage failures from the CLI:

```bash
php glueful queue:failed                   # List: job class, queue, error (--queue= --limit=50 --json)
php glueful queue:retry <uuid> [<uuid>…]   # Put them back on their queue as new jobs
php glueful queue:retry --all [--queue=emails]
php glueful queue:forget <uuid>            # Delete one
php glueful queue:flush [--queue=emails]   # Delete them all
```

Each takes `--connection=` (default: the configured connection). A retry verifies the stored
payload's signature first, so a payload altered after it failed is refused, never re-signed.

From code, use `FailedJobProvider` (database driver):

```php
use Glueful\Queue\Failed\FailedJobProvider;

$provider = app($context, FailedJobProvider::class);

// Filters: connection, queue, from_date, to_date
$failed = $provider->all(['queue' => 'emails'], limit: 50);

$provider->retry($uuid);   // bool
$provider->forget($uuid);  // bool
$provider->retryAll();     // retry every failed job
$provider->prune(30);      // delete failures older than 30 days; returns the count
$provider->cleanup();      // prune at the provider's retention age; bool
```

`queue.failed.*` configures both the container-resolved provider above and the one the database
driver builds (`$queue->connection('database')->failures()`); `retention_days` (default 30) is the
age `cleanup()` prunes at. The built-in `queue_maintenance` [scheduled job](/features/scheduling#built-in-jobs)
(`Glueful\Queue\Jobs\QueueMaintenanceJob`, daily at 04:15, `QUEUE_MAINTENANCE_ENABLED`) prunes
failures past that age for you (`queue.maintenance.failed_jobs_cleanup_days` overrides the age for
that pass). An app with its own `config/schedule.php` must list the job to get this pruning.
`queue.failed.max_retries` is stored but not enforced — a retry is a new job with fresh attempts,
bounded by the worker's `--tries`.

## Best Practices

### Keep Jobs Small

```php
// ✅ Good - focused, retryable
class SendEmailJob extends Job
{
    public function handle(): void
    {
        $this->send($this->getData());
    }
}

// ❌ Bad - too many responsibilities
class ProcessUserRegistrationJob extends Job
{
    public function handle(): void
    {
        // Send email
        // Update analytics
        // Notify admin
        // Create account
        // Generate invoice
        // ... (too much)
    }
}
```

### Make Idempotent

```php
// ✅ Good - safe to retry
public function handle(): void
{
    if ($this->alreadyProcessed()) {
        return;
    }
    $this->process();
}

// ❌ Bad - creates duplicates on retry
public function handle(): void
{
    $this->createRecord(); // Creates duplicate!
}
```

### Throw on Failure

```php
// ✅ Good - allows retry
public function handle(): void
{
    if (!$this->apiCall()) {
        throw new \RuntimeException('API failed');
    }
}

// ❌ Bad - hides failures
public function handle(): void
{
    try {
        $this->apiCall();
    } catch (\Exception $e) {
        // Silently fails
    }
}
```

## Troubleshooting

**Jobs not processing?**
- Ensure a worker is running: `php glueful queue:work`
- Check `QUEUE_CONNECTION` in `.env` (`database` or `redis`)
- "Refusing to run job class" in the log: the class does not implement `JobInterface`
- "signature mismatch" / "missing its HMAC signature": the payload was pushed with a different
  `APP_KEY`, or without one

**Jobs failing?**
- `php glueful queue:failed` shows the error for each failure
- Make the job idempotent, then `php glueful queue:retry <uuid>`

**Queue growing?**
- Scale workers
- Optimize job performance
- Split into priority queues

**Jobs timing out?**
- Raise `--timeout` (and `retry_after` in config)
- Break large jobs into smaller ones

## Scaling Workers

### Single Worker

```bash
php glueful queue:work
```

### Multiple Workers

Core's `queue:work` runs a single worker per invocation. To run more than one, start
several processes — either by hand, or (recommended for production) under a process
supervisor.

```bash
# Terminal 1
php glueful queue:work --queue=high

# Terminal 2
php glueful queue:work --queue=default

# Terminal 3
php glueful queue:work --queue=low
```

### Supervisor (Production)

Run multiple lean workers under your OS process manager (Supervisor, systemd):

`/etc/supervisor/conf.d/queue-worker.conf`:

```ini
[program:queue-worker]
command=php /path/to/glueful queue:work --queue=default --max-runtime=3600
process_name=%(program_name)s_%(process_num)02d
autostart=true
autorestart=true
user=www-data
numprocs=4
```

### Deploying New Code

Workers are long-running processes that keep the code they started with. As the last step of each
deploy, ask them to restart:

```bash
php glueful queue:restart
```

Every running worker exits after its current job, and your supervisor starts it again on the new
code. The signal is a timestamp in the cache, so the workers need a configured cache store they
share (without one, nothing is signalled); a worker started after the signal keeps running.

### Managed Fleets & Autoscaling

::u-alert{color="info" variant="subtle" icon="i-lucide-package"}
**Requires the `glueful/queue-ops` extension.** If you'd rather have Glueful supervise a
worker fleet for you (a single supervisor process spawning and restarting leaf workers)
or scale workers automatically based on queue depth, install
[`glueful/queue-ops`](https://github.com/glueful/queue-ops). It adds:

- `queue:supervise` — a supervisor that spawns and monitors leaf workers
- `queue:autoscale` — scales workers up/down based on load
- persisted worker/job metrics (`queue_workers`, `queue_job_metrics`)

```bash
composer require glueful/queue-ops
php glueful extensions:enable queue-ops   # also runs the extension's migrations
```

Worker-fleet config lives in the extension's `queue_ops.*` namespace.
::

## Next Steps

- [Task Scheduling](/features/scheduling) - Run jobs on a cron schedule
- [Events](/features/events) - Fan-out with events + jobs
- [Notifications](/features/notifications) - Queue notifications
- [Queue Infrastructure](/cookbook/queues-and-jobs) - Drivers, built-in tasks, queue-ops
