---
title: Notifications
description: Send email, SMS, and push notifications
---

Send multi-channel notifications with templates, retries, and delivery tracking.

Core ships the notification system (`NotificationService`, the channel registry, persistence and
retries) with one channel, `database`. Email comes from the `glueful/email-notification`
extension; other channels (SMS, push, Slack…) are [custom channels](#extending-channels).

## Installation

```bash
composer require glueful/email-notification
php glueful extensions:enable email-notification   # also runs its migrations
```

Then configure the mailer in `.env` — `MAIL_HOST` and `MAIL_FROM` are required; with either unset
the email channel reports itself unavailable:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_ENCRYPTION=tls
MAIL_USERNAME=your-username
MAIL_PASSWORD=your-password
MAIL_FROM=noreply@example.com
MAIL_FROM_NAME="Your App"
```

See [Notification Channels & Templates](/cookbook/notifications) for API providers (SendGrid,
Mailgun, SES, Postmark, Brevo) and failover.

## Quick Start

```php
use Glueful\Notifications\Services\NotificationService;

$notifiable = new UserNotifiable($user['uuid'], $user['email']);
$notifications = app($context, NotificationService::class);

$result = $notifications->send(
    type: 'user.welcome',
    notifiable: $notifiable,
    subject: 'Welcome!',
    data: [
        'template_name' => 'welcome',
        'name' => $user['name'],
        'action_url' => 'https://app.example.com/get-started',
    ],
    options: ['channels' => ['email']]
);
```

`send(string $type, Notifiable $notifiable, string $subject, array $data = [], array $options = [])`.
Without `channels`, a notification goes to `notifications.default_channels` — `['database']` by
default — so pass `['channels' => ['email']]` to send an email.

### Notifiable

The recipient implements `Glueful\Notifications\Contracts\Notifiable` — all five methods are
required:

```php
namespace App\Notifications;

use Glueful\Notifications\Contracts\Notifiable;

class UserNotifiable implements Notifiable
{
    public function __construct(
        private string $uuid,
        private string $email
    ) {}

    public function routeNotificationFor(string $channel)
    {
        // Map channel to recipient. Extend for SMS, push, etc.
        return $channel === 'email' ? $this->email : null;
    }

    public function getNotifiableId(): string
    {
        return $this->uuid;
    }

    public function getNotifiableType(): string
    {
        return 'user';
    }

    public function shouldReceiveNotification(string $notificationType, string $channel): bool
    {
        return true; // Consult stored preferences here if you keep them
    }

    public function getNotificationPreferences(): array
    {
        return [];
    }
}
```

### Results

`send()` returns an array whose `status` is one of:

| Status | Meaning |
|---|---|
| `success` | Sent on the sync channels (per the channel failure policy) |
| `failed` | The sync channels failed |
| `queued` | Only async channels were requested; a job was queued (`queued_job_uuid`) |
| `partial` | Sync channels failed, but async channels were queued |
| `scheduled` | Stored for later (`scheduled_at`) |
| `duplicate` | An idempotency key matched a recent notification; nothing was sent |

Each result carries `notification_uuid`; sync results include the per-channel outcomes under `sync`.

## Templates

The email channel renders a **registered template**, chosen by `template_name` in the data
(`default` when omitted). The template owns the subject and body; your data fills its
`{{placeholders}}`. Built-in templates:

| Key | Use | Placeholders |
|---|---|---|
| `default` | General notifications | `name`, `message`, `action_url`, `action_text`, `otp`, `expiry_minutes` |
| `welcome` | Onboarding | `name`, `app_name`, `message`, `action_url`, `action_text` |
| `alert` | Security / important alerts | `message`, `details`, `action_url` |
| `password-reset` | Password reset | `name`, `otp`, `expiry_minutes`, `reset_url` |
| `verification` | Email verification | `otp`, `expiry_minutes` |
| `two-factor-pin` | 2FA codes | `pin`, `ttl_minutes` |

Register your own templates, or override a template's content per site, as described in
[Notification Channels & Templates](/cookbook/notifications#template-system). Unknown template keys
fail loudly; a payload cannot select a file.

## Database Channel

The core `database` channel stores the notification in the `notifications` table for in-app inboxes:

```php
$notifications->send('order.shipped', $notifiable, 'Your order has shipped', [
    'order_id' => $orderId,
]); // default_channels => ['database']

$unread = $notifications->getUnreadCount($notifiable);
$notifications->markAllAsRead($notifiable);
```

Persistence is on by default; `NOTIFICATIONS_DATABASE_STORE=false` (`config/capabilities.php`)
skips the notification tables, and then the database channel is unavailable and scheduling is
refused.

## Queued (Async) Delivery

Send critical channels now and queue the rest:

```php
// Persist + database now; email on the queue
$notifications->sendSplit(
    type: 'order.placed',
    notifiable: $notifiable,
    subject: 'Order confirmation',
    data: ['template_name' => 'default', 'message' => 'Thanks for your order!'],
    persistNowChannels: ['database'],
    dispatchAsyncChannels: ['email'],
);

// Equivalent: options sync_channels / async_channels on send()
$notifications->send('order.placed', $notifiable, 'Order confirmation', $data, [
    'async_channels' => ['email'],
]);
```

Async channels are pushed through `Glueful\Notifications\Contracts\NotificationQueueDispatcherInterface`
(the default wraps `QueueManager`) onto the `notifications` queue, so run a worker for it:

```bash
php glueful queue:work --queue=notifications,default
```

A dispatch job that exhausts its attempts is recorded in `queue_failed_jobs` (see
[Failed Jobs](/features/queues-jobs#failed-jobs)).

## Scheduled Notifications

```php
$notifications->send(
    type: 'reminder',
    notifiable: $notifiable,
    subject: "Don't forget!",
    data: ['template_name' => 'default', 'message' => 'Your trial ends tomorrow'],
    options: [
        'schedule' => new \DateTime('+1 day'),
        'channels' => ['database', 'email'],
    ]
);
```

The notification is stored with its `scheduled_at` and status `scheduled`. The built-in
`scheduled_notifications` [scheduled job](/features/scheduling#built-in-jobs)
(`Glueful\Queue\Jobs\ScheduledNotificationsJob`, every minute, up to 50 per run) delivers the ones
that are due, so all you need is a running scheduler (`php glueful queue:scheduler work` or the
cron entry). Turn it off with `SCHEDULED_NOTIFICATIONS_ENABLED=false`; it does nothing when
`NOTIFICATIONS_DATABASE_STORE=false` (and scheduling is refused then anyway).
`$notifications->processScheduledNotifications($batchSize)` runs the same pass on demand.

At delivery the recipient is rebuilt from the stored notifiable type and id — `user` through the
identity provider (`UserProviderInterface`), other types through an extension's
`resolveNotifiableEntity()` — and the notification goes out on the `channels` given at schedule
time (or `default_channels` when none were given), under the `channel_failure_policy` /
`critical_channels` it was scheduled with. The rebuilt `user` recipient
(`Glueful\Notifications\UserNotifiable`) routes `email` to the user's current address, so
scheduled emails reach the user; a user that no longer exists is skipped and counted as failed.
Notifications scheduled before 1.91 did not store their channels and go out on `default_channels`.

::u-alert{color="warning" variant="subtle" icon="i-lucide-triangle-alert"}
**Upgrading to 1.91:** before 1.91 nothing processed scheduled notifications. An app with its own
`config/schedule.php` must add the `scheduled_notifications` job to its `jobs` list (copy it from
the framework's `config/schedule.php`) — the app's list replaces the framework's. Notifications
already overdue go out on the first runs, 50 at a time. See [Upgrading](/upgrading).
::

## Priority

```php
$notifications->send('urgent.alert', $notifiable, 'Action Required', $data, [
    'channels' => ['email'],
    'priority' => 'high',
]);
```

The priority (for example `high`, `normal`, `low`) is stored on the notification.

## Idempotency

Pass an `idempotency_key` (in `options` or `data`) to make a send safe to repeat: a second send with
the same key, type and recipient within `idempotency_ttl_seconds` (300) returns
`status: duplicate` and sends nothing.

```php
$notifications->send('order.placed', $notifiable, 'Order confirmation', $data, [
    'channels' => ['email'],
    'idempotency_key' => "order-placed:{$orderUuid}",
]);
```

## Retries

Failed deliveries are queued in `notification_retry_queue` and retried by the
`notification_retry_processor` [scheduled job](/features/scheduling#built-in-jobs) (every 10
minutes), or on demand:

```bash
php glueful notifications:process-retries
```

The email extension's retry settings live in `config/emailnotification.php` (`retry.*`:
`MAIL_RETRY_ENABLED`, `MAIL_RETRY_MAX_ATTEMPTS`, `MAIL_RETRY_DELAY`, `MAIL_RETRY_BACKOFF`,
`MAIL_RETRY_JITTER`). Backoff strategies:
- `exponential`: delay × 2^(attempt-1)
- `linear`: delay × attempt
- `fixed`: same delay every time

A transport failure is retryable; a misconfigured transport (`transport_misconfigured`) is not.
A retry for a `user` recipient rebuilds it through the identity provider, so a retried email goes
to the user's current address; a retry for a user that no longer exists is removed from the queue.

## Notification Events

Listen to notification lifecycle:

```php
use Glueful\Events\EventService;
use Glueful\Notifications\Events\NotificationSent;
use Glueful\Notifications\Events\NotificationFailed;

$events = app($context, EventService::class);

$events->addListener(NotificationSent::class, function ($event) use ($context) {
    app($context, \Psr\Log\LoggerInterface::class)->info('Notification sent', [
        'type' => $event->getNotification()->getType(),
        'channel' => $event->getChannel(),
    ]);
});

$events->addListener(NotificationFailed::class, function ($event) use ($context) {
    app($context, \Psr\Log\LoggerInterface::class)->error('Notification failed', [
        'type' => $event->getNotification()->getType(),
        'error' => $event->getReason(),
    ]);
});
```

Also available: `NotificationQueued`, `NotificationScheduled`, `NotificationDelivered`,
`NotificationRead`, `NotificationRetry`.

## Configuration

**Core** — optional `config/notifications.php` in your app (only these keys are accepted):

```php
return [
    'default_channels' => ['database'],
    'async_queue' => 'notifications',
    'channel_failure_policy' => 'any_success',
    'critical_channels' => [],
    'idempotency_enabled' => true,
    'idempotency_ttl_seconds' => 300,
    'max_retry_attempts' => 3,
    'retry_delay_seconds' => 60,
];
```

**Mail transport** — `services.mail` in `config/services.php` (`MAIL_MAILER`, `MAIL_HOST`,
`MAIL_PORT`, `MAIL_FROM`, …). Settings saved through the extension's admin API override it per send.

**Email extension** — `config/emailnotification.php`:

```php
return [
    'retry' => [
        'enabled' => env('MAIL_RETRY_ENABLED', true),
        'max_attempts' => env('MAIL_RETRY_MAX_ATTEMPTS', 3),
        'delay' => env('MAIL_RETRY_DELAY', 300),
        'backoff' => env('MAIL_RETRY_BACKOFF', 'exponential'),
        'jitter' => env('MAIL_RETRY_JITTER', true),
    ],
    'debug' => ['enabled' => env('MAIL_DEBUG', false)],        // log recipient/subject/type per send
    'logging' => ['enabled' => env('MAIL_LOG_RESULTS', false)], // log each send outcome
    'security' => [
        'allowed_domains' => env('MAIL_ALLOWED_DOMAINS', null),  // exact-match allowlist
        'blocked_domains' => env('MAIL_BLOCKED_DOMAINS', null),  // also blocks subdomains
        'attachment_allowed_paths' => null,                       // null = app storage dir
    ],
];
```

## Best Practices

### Queue Email

```php
// ✅ Good - persisted now, emailed by a worker
$notifications->sendSplit($type, $notifiable, $subject, $data, ['database'], ['email']);

// ❌ Bad - the request waits on SMTP
$notifications->send($type, $notifiable, $subject, $data, ['channels' => ['email']]);
```

### Personalize

```php
// ✅ Good - personal
"Hi {$user['name']}, your order is ready!"

// ❌ Bad - generic
"Your order is ready."
```

### Clear CTAs

Give templates an explicit `action_url` and `action_text` ("Verify your email") rather than a bare
"Click here". Non-http(s) URLs in `action_url` / `reset_url` are blanked.

## Testing

```php
public function testWelcomeNotification(): void
{
    $notifiable = new \App\Notifications\UserNotifiable('user-uuid', 'user@example.com');

    $result = app($this->app->getContext(), \Glueful\Notifications\Services\NotificationService::class)->send(
        type: 'user.welcome',
        notifiable: $notifiable,
        subject: 'Welcome!',
        data: ['template_name' => 'welcome', 'name' => 'Jane Doe'],
        options: ['channels' => ['email']]
    );

    $this->assertSame('success', $result['status']);
}
```

Set `MAIL_MAILER=array` (or `null`) in the test environment so nothing leaves the process.

## Troubleshooting

**Emails not sending?**
- `MAIL_HOST` and `MAIL_FROM` set? Without them the email channel is unavailable
- Did you pass `'channels' => ['email']`? The default channel is `database`
- For async channels, is a worker running on the `notifications` queue?
- Check `queue_failed_jobs` (`php glueful queue:failed`) and `notification_retry_queue`

**Scheduled notifications not sent?**
- Is the scheduler running, and is `scheduled_notifications` in *your* `config/schedule.php`?
- `SCHEDULED_NOTIFICATIONS_ENABLED` must not be `false`
- Were the `channels` passed when scheduling? Without them delivery uses `default_channels`

**Template not found?**
- `template_name` must be a registered key (built-in, or registered by an extension)

**High failure rate?**
- Check SMTP credentials
- Verify email addresses are valid, and not blocked by `MAIL_BLOCKED_DOMAINS` / `MAIL_ALLOWED_DOMAINS`
- Review rate limits

## Extending Channels

A channel implements `Glueful\Notifications\Contracts\NotificationChannel`:

```php
namespace App\Channels;

use Glueful\Notifications\Contracts\Notifiable;
use Glueful\Notifications\Contracts\NotificationChannel;

final class SmsChannel implements NotificationChannel
{
    public function __construct(private readonly SmsProvider $sms)
    {
    }

    public function getChannelName(): string
    {
        return 'sms';
    }

    public function isAvailable(): bool
    {
        return $this->sms->isConfigured();
    }

    public function format(array $data, Notifiable $notifiable): array
    {
        return $data;
    }

    public function getConfig(): array
    {
        return [];
    }

    public function send(Notifiable $notifiable, array $data): bool
    {
        $phone = $notifiable->routeNotificationFor('sms');
        if (!is_string($phone) || $phone === '') {
            return false;
        }

        return $this->sms->send($phone, (string) ($data['body'] ?? ''))->isSuccessful();
    }
}
```

Register the channel from your extension's `ServiceProvider::boot()` with the framework helper. It resolves the shared channel registry and is the supported wiring path — the framework no longer hardcodes channel providers, so a channel that isn't registered here won't reach the async dispatcher:

```php
use Glueful\Bootstrap\ApplicationContext;
use Glueful\Extensions\ServiceProvider;

final class SmsServiceProvider extends ServiceProvider
{
    public function boot(ApplicationContext $context): void
    {
        $this->registerNotificationChannel($this->app->get(SmsChannel::class));
    }
}
```

**Structured results (optional).** For richer delivery telemetry — a provider message id, error code, retryability, and send latency — implement `Glueful\Notifications\Contracts\RichNotificationChannel` instead and return a `NotificationResult` from `sendNotification()`. The dispatcher prefers `sendNotification()` when present and falls back to `send(): bool` otherwise, so it's fully opt-in and the base contract above stays unchanged.

## Next Steps

- [Queues & Jobs](/features/queues-jobs) - Queue notifications
- [Events](/features/events) - Event-driven notifications
- [Notification Channels & Templates](/cookbook/notifications) - Providers, custom channels, templates
