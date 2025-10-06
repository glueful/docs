---
title: Queues & Jobs
description: Process background tasks with retries and failure handling
---

Offload slow operations from HTTP requests: emails, reports, image processing, webhooks, bulk imports.

## Quick Start

### 1. Create a Job

```php
namespace App\Jobs;

use Glueful\Queue\Job;

class SendWelcomeEmailJob extends Job
{
    public function handle(): void
    {
        $data = $this->getData();
        $userId = $data['userId'];
        $user = db()->table('users')->find($userId);

        // Send email
        mail($user->email, 'Welcome!', 'Thanks for joining...');
    }
}
```

### 2. Dispatch the Job

```php
use Glueful\Queue\QueueManager;
use App\Jobs\SendWelcomeEmailJob;

$queue = service(QueueManager::class);
$queue->push(SendWelcomeEmailJob::class, ['userId' => $userId]);
```

#### Why class names + data

- Deterministic serialization: only the job class name and a plain array are enqueued, making payloads easy to serialize and version safely.
- Safer and portable: avoids serializing arbitrary PHP objects; drivers store compact payloads (often JSON) that work across processes and connections.
- Reliable retries/delays: workers rehydrate the job with the data and run handle(), ensuring consistent behavior on every attempt.
- Clear contracts: jobs read inputs via getData(), keeping state explicit and idempotent-friendly.

### 3. Run Workers

```bash
php glueful queue:work
```

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

`config/queue.php`:

```php
return [
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
            'database' => env('REDIS_DB', 0),
            'prefix' => env('REDIS_QUEUE_PREFIX', 'glueful:queue:'),
            'queue' => env('REDIS_QUEUE', 'default'),
            'retry_after' => 90,
        ],
    ],

    'failed' => [
        'driver' => env('QUEUE_FAILED_DRIVER', 'database'),
        'database' => 'default',
        'table' => 'queue_failed_jobs',
    ],
];
```

## Job Basics

### Simple Job

```php
use Glueful\Queue\Job;

class ProcessImageJob extends Job
{
    public function handle(): void
    {
        $data = $this->getData();
        $imagePath = $data['imagePath'];

        // Resize image
        $image = Image::load($imagePath);
        $image->resize(800, 600);
        $image->save();
    }
}
```

### Dispatch

```php
$queue->push(ProcessImageJob::class, ['imagePath' => $path]);
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
$queue->push(SendEmailJob::class, ['user' => $user], 'emails');

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

Jobs retry automatically on failure:

```php
class SendWebhookJob extends Job
{
    public function getMaxAttempts(): int
    {
        return 3; // Retry up to 3 times
    }

    public function handle(): void
    {
        $data = $this->getData();
        $response = $this->httpClient->post($data['webhookUrl'], $data['payload'] ?? []);

        if (method_exists($response, 'failed') ? $response->failed() : !(method_exists($response, 'successful') && $response->successful())) {
            throw new \Exception('Webhook failed');
        }
    }
}
```

### Custom Retry Logic

```php
class ImportDataJob extends Job
{
    public function handle(): void
    {
        try {
            $this->importData();
        } catch (TemporaryException $e) {
            // Retry this job
            throw $e;
        } catch (PermanentException $e) {
            // Don't retry, just log
            logger()->error('Import failed permanently', [$e]);
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
        // Check if already generated
        if ($this->alreadyGenerated($this->invoiceId)) {
            return; // Safe no-op
        }

        $pdf = $this->generatePdf($this->invoiceId);
        $this->storePdf($pdf);
    }

    private function alreadyGenerated($id): bool
    {
        return file_exists("invoices/{$id}.pdf");
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

$queue->bulk($jobs, 'cache_warmup');
```

## Job Chaining

Process jobs in sequence:

```php
// Process video, then notify user
$queue->push(ProcessVideoJob::class, ['videoId' => $videoId]);
$queue->later(600, NotifyUserJob::class, ['userId' => $userId, 'message' => 'Video ready!']);
```

## Common Patterns

### Email Queue

```php
class SendWelcomeEmailJob extends Job
{
    public function handle(): void
    {
        $data = $this->getData();
        $template = view('emails.welcome', [
            'name' => $data['name']
        ]);

        mail($data['email'], 'Welcome!', $template);
    }
}
```

### Image Processing

```php
class OptimizeImageJob extends Job
{
    public function handle(): void
    {
        $data = $this->getData();
        $image = Image::load($data['path']);

        // Generate thumbnails
        $image->resize(200, 200)->save($data['path'] . '.thumb.jpg');
        $image->resize(800, 600)->save($data['path'] . '.medium.jpg');

        // Optimize original
        $image->optimize()->save($data['path']);
    }
}
```

### Webhook Delivery

```php
class DeliverWebhookJob extends Job
{
    public function getMaxAttempts(): int
    {
        return 5;
    }

    public function handle(): void
    {
        $data = $this->getData();
        $response = $this->httpClient->post($data['url'], [
            'event' => $data['event'],
            'data' => $data['data'] ?? [],
            'timestamp' => time()
        ]);

        if (!(method_exists($response, 'successful') && $response->successful())) {
            throw new \Exception('Webhook delivery failed');
        }
    }
}
```

### Report Generation

```php
class GenerateMonthlyReportJob extends Job
{
    public function handle(): void
    {
        $data = $this->getData();
        $reportData = $this->gatherData();
        $pdf = $this->generatePdf($reportData);

        // Store report
        Storage::put("reports/monthly-{$data['month']}.pdf", $pdf);

        // Notify user
        $queue = service(\Glueful\Queue\QueueManager::class);
        $queue->push(NotifyReportReadyJob::class, ['userId' => $data['userId']]);
    }
}
```

## Monitoring

Track job metrics:

```php
// Queue depth
$pending = db()->table('queue_jobs')->count();

// Failed jobs
$failed = db()->table('queue_failed_jobs')->count();

// Job age
$oldest = db()->table('queue_jobs')
    ->orderBy('created_at', 'asc')
    ->first();
```

## Failed Jobs

Use the FailedJobProvider to inspect, retry, and delete failed jobs:

```php
use Glueful\Queue\Failed\FailedJobProvider;

$provider = new FailedJobProvider();

// List recent failed jobs
$failed = $provider->all(limit: 50);

// Retry a specific failed job
$provider->retry($uuid);

// Forget (delete) a failed job
$provider->forget($uuid);

// Retry all retryable failed jobs
$provider->retryAll();
```

## Best Practices

### Keep Jobs Small

```php
// ✅ Good - focused, retryable
class SendEmailJob extends Job
{
    public function handle(): void
    {
        mail($this->email, $this->subject, $this->body);
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
        throw new \Exception('API failed');
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
- Ensure worker is running: `php glueful queue:work`
- Check queue connection in `.env`

**Jobs failing?**
- Check `queue_failed_jobs` table
- Review error messages
- Ensure job is idempotent

**Queue growing?**
- Scale workers
- Optimize job performance
- Split into priority queues

**Jobs timing out?**
- Increase `retry_after` in config
- Break large jobs into smaller ones

## Scaling Workers

### Single Worker

```bash
php glueful queue:work
```

### Multiple Workers

```bash
# Terminal 1
php glueful queue:work --queue=high

# Terminal 2
php glueful queue:work --queue=default

# Terminal 3
php glueful queue:work --queue=low
```

### Supervisor (Production)

`/etc/supervisor/conf.d/queue-worker.conf`:

```ini
[program:queue-worker]
command=php /path/to/glueful queue:work --queue=default
autostart=true
autorestart=true
user=www-data
numprocs=4
```

## Next Steps

- [Events](/features/events) - Fan-out with events + jobs
- [Notifications](/features/notifications) - Queue notifications
- [Caching](/features/caching) - Cache warm jobs
