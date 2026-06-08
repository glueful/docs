---
title: Notifications
description: Send email, SMS, and push notifications
---

Send multi-channel notifications with templates, retries, and delivery tracking.

## Installation

```bash
composer require glueful/email-notification
```

Register in `config/extensions.php`:

```php
'providers' => [
    Glueful\Extensions\EmailNotification\EmailNotificationServiceProvider::class,
],
```

## Quick Start

```php
use Glueful\Notifications\Services\NotificationService;

$notifiable = new UserNotifiable('user-uuid', 'user@example.com');
$notifications = app($this->getContext(), NotificationService::class);

$notifications->send(
    type: 'user.welcome',
    notifiable: $notifiable,
    subject: 'Welcome to Glueful!',
    data: [
        'template' => 'welcome',
        'name' => 'Jane Doe',
        'cta_url' => 'https://app.example.com/get-started'
    ]
);
```

### Minimal Notifiable Wrapper

If your user/entity does not implement `Glueful\Notifications\Contracts\Notifiable`, wrap it with a tiny adapter:

```php
namespace App\Notifications;

use Glueful\Notifications\Contracts\Notifiable;

class UserNotifiable implements Notifiable
{
    public function __construct(
        private string $uuid,
        private string $email
    ) {}

    public function routeNotificationFor(string $channel): ?string
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
}

// Usage
use Glueful\Notifications\Services\NotificationService;

$notifiable = new \App\Notifications\UserNotifiable($user['uuid'], $user['email']);
app($this->getContext(), NotificationService::class)->send(
    type: 'user.welcome',
    notifiable: $notifiable,
    subject: 'Welcome!',
    data: ['template' => 'welcome', 'name' => $user['name']]
);
```

## Basic Email

### Send Welcome Email

```php
public function register()
{
    $user = [
        'uuid' => 'user-uuid',
        'email' => 'user@example.com',
        'name' => 'Jane Doe',
    ];
    $notifiable = new UserNotifiable($user['uuid'], $user['email']);

    $notifications = app($this->getContext(), \Glueful\Notifications\Services\NotificationService::class);
    $notifications->send(
        type: 'user.welcome',
        notifiable: $notifiable,
        subject: 'Welcome!',
        data: [
            'template' => 'welcome',
            'name' => $user['name']
        ]
    );

    return Response::created($user);
}
```

### Send with Custom Data

```php
$notifications->send(
    type: 'order.confirmation',
    notifiable: $notifiable,
    subject: 'Order #' . $orderId,
    data: [
        'template' => 'order-confirmation',
        'order_id' => $orderId,
        'total' => $total,
        'items' => $items,
        'shipping_address' => $address
    ]
);
```

## Templates

### Create Email Template

`templates/html/welcome.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .button { background: #007bff; color: white; padding: 12px 24px; }
    </style>
</head>
<body>
    <h1>Welcome, {{name}}!</h1>
    <p>Thanks for joining Glueful. Get started now:</p>
    <a href="{{cta_url}}" class="button">Get Started</a>
</body>
</html>
```

### Use Template

```php
$notifications->send(
    type: 'user.welcome',
    notifiable: $notifiable,
    subject: 'Welcome!',
    data: [
        'template' => 'welcome',  // Matches welcome.html
        'name' => $user['name'],
        'cta_url' => 'https://app.example.com'
    ]
);
```

## Built-in Templates

Glueful includes these templates:

- `welcome` - Welcome new users
- `verification` - Email verification
- `password-reset` - Password reset link
- `alert` - System alerts
- `default` - Generic template

## Scheduled Notifications

Send notifications later:

```php
$notifications->send(
    type: 'reminder',
    notifiable: $notifiable,
    subject: 'Don't forget!',
    data: ['template' => 'reminder'],
    options: [
        'schedule' => new DateTime('+1 day')
    ]
);
```

## Priority

Set notification priority:

```php
$notifications->send(
    type: 'urgent.alert',
    notifiable: $notifiable,
    subject: 'Action Required',
    data: ['template' => 'alert'],
    options: [
        'priority' => 'high'  // high, normal, low
    ]
);
```

## Retries

Automatic retries on failure:

```php
// Configure retries
'retry' => [
    'enabled' => true,
    'delay' => 300,        // 5 minutes
    'backoff' => 'exponential',
    'max_attempts' => 3
],
```

Backoff strategies:
- `exponential`: delay × 2^(attempt-1)
- `linear`: delay × attempt
- `fixed`: same delay every time

## Common Patterns

### Welcome Email

```php
public function register()
{
    $data = $this->getRequestData();
    $user = [
        'uuid' => 'user-uuid',
        'name' => $data['name'] ?? 'Jane Doe',
        'email' => $data['email'] ?? 'user@example.com',
    ];
    $notifiable = new UserNotifiable($user['uuid'], $user['email']);
    $notifications = app($this->getContext(), \Glueful\Notifications\Services\NotificationService::class);

    $notifications->send(
        type: 'user.registered',
        notifiable: $notifiable,
        subject: 'Welcome to Glueful',
        data: [
            'template' => 'welcome',
            'name' => $user['name'],
            'verify_url' => 'https://app.example.com/verify/' . $user['uuid']
        ]
    );

    return Response::created($user);
}
```

### Password Reset

```php
public function forgotPassword()
{
    $data = $this->getRequestData();
    $email = $data['email'] ?? null;
    $user = $this->getConnection()->table('users')->where(['email' => $email])->first();

    if (!$user) {
        return Response::success(null, 'If email exists, reset link sent');
    }

    $token = bin2hex(random_bytes(32));

    $this->getConnection()->table('password_resets')->insert([
        'email' => $email,
        'token' => hash('sha256', $token),
        'created_at' => date('Y-m-d H:i:s')
    ]);

    $notifications = app($this->getContext(), \Glueful\Notifications\Services\NotificationService::class);
    $notifiable = new UserNotifiable($user['uuid'], $user['email']);
    $notifications->send(
        type: 'password.reset',
        notifiable: $notifiable,
        subject: 'Reset Your Password',
        data: [
            'template' => 'password-reset',
            'name' => $user['name'] ?? $user['email'],
            'reset_url' => 'https://app.example.com/reset-password/' . $token
        ]
    );

    return Response::success(null, 'Password reset link sent');
}
```

### Order Confirmation

```php
public function placeOrder()
{
    $order = [
        'id' => 1234,
        'uuid' => 'order-uuid',
        'total' => 149.99,
        'user_uuid' => 'user-uuid',
    ];
    $user = [
        'uuid' => 'user-uuid',
        'email' => 'user@example.com',
    ];
    $notifiable = new UserNotifiable($user['uuid'], $user['email']);
    $notifications = app($this->getContext(), \Glueful\Notifications\Services\NotificationService::class);
    $notifications->send(
        type: 'order.placed',
        notifiable: $notifiable,
        subject: 'Order Confirmation #' . $order['id'],
        data: [
            'template' => 'order-confirmation',
            'order_id' => $order['id'],
            'total' => $order['total'],
            'items' => $this->getOrderItems($order['id']),
            'tracking_url' => 'https://app.example.com/orders/' . $order['uuid']
        ]
    );

    return Response::created($order);
}
```

### Digest Notifications

```php
public function sendWeeklyDigest()
{
    $users = $this->getConnection()->table('users')
        ->where(['digest_enabled' => true])
        ->get();

    $notifications = app($this->getContext(), \Glueful\Notifications\Services\NotificationService::class);
    foreach ($users as $user) {
        $notifiable = new UserNotifiable($user['uuid'], $user['email']);
        $stats = $this->getUserStats($user['uuid']);

        $notifications->send(
            type: 'digest.weekly',
            notifiable: $notifiable,
            subject: 'Your Weekly Summary',
            data: [
                'template' => 'weekly-digest',
                'name' => $user['name'] ?? $user['email'],
                'stats' => $stats,
                'highlights' => $this->getHighlights($user['uuid'])
            ]
        );
    }
}
```

## Queue Notifications

Queue expensive notifications:

```php
'queue' => [
    'enabled' => true,
    'queue_name' => 'emails',
    'max_attempts' => 3
],
```

## Notification Events

Listen to notification lifecycle:

```php
use Glueful\Events\EventService;
use Glueful\Notifications\Events\NotificationSent;
use Glueful\Notifications\Events\NotificationFailed;

$events = app($context, EventService::class);

$events->addListener(NotificationSent::class, function($event) use ($context) {
    app($context, \Psr\Log\LoggerInterface::class)->info('Notification sent', [
        'type' => $event->getNotification()->getType(),
        'channel' => $event->getChannel()
    ]);
});

$events->addListener(NotificationFailed::class, function($event) use ($context) {
    app($context, \Psr\Log\LoggerInterface::class)->error('Notification failed', [
        'type' => $event->getNotification()->getType(),
        'error' => $event->getReason()
    ]);
});
```

## Configuration

`config/email-notification.php`:

```php
return [
    'templates' => [
        'extension_path' => __DIR__ . '/../templates/html',
        'extension_mappings' => [
            'welcome' => 'welcome',
            'password-reset' => 'password-reset',
            'verification' => 'verification',
            'alert' => 'alert',
            'default' => 'default'
        ],
        'processing' => [
            'minify_html' => env('MAIL_MINIFY_HTML', false),
            'inline_css' => env('MAIL_INLINE_CSS', true),
            'auto_text_version' => true
        ]
    ],

    'queue' => [
        'enabled' => env('MAIL_QUEUE_ENABLED', true),
        'queue_name' => env('MAIL_QUEUE_NAME', 'emails'),
        'max_attempts' => env('MAIL_QUEUE_MAX_ATTEMPTS', 3)
    ],

    'retry' => [
        'enabled' => env('MAIL_RETRY_ENABLED', true),
        'delay' => env('MAIL_RETRY_DELAY', 300),
        'backoff' => env('MAIL_RETRY_BACKOFF', 'exponential')
    ]
];
```

## Best Practices

### Use Queues

```php
// ✅ Good - queued
'queue' => ['enabled' => true]

// ❌ Bad - blocks response
'queue' => ['enabled' => false]
```

### Personalize

```php
// ✅ Good - personal
"Hi {$user['name']}, your order is ready!"

// ❌ Bad - generic
"Your order is ready."
```

### Clear CTAs

```php
// ✅ Good - clear action
<a href="{{verify_url}}">Verify Your Email</a>

// ❌ Bad - unclear
<a href="{{url}}">Click here</a>
```

### Unsubscribe Links

```php
// Always include
<p>
    <a href="{{unsubscribe_url}}">Unsubscribe</a>
</p>
```

## Testing

Test notifications without sending:

```php
public function testWelcomeEmail()
{
    $notifiable = new \App\Notifications\UserNotifiable('user-uuid', 'user@example.com');

    $result = app($this->getContext(), \Glueful\Notifications\Services\NotificationService::class)->send(
        type: 'user.welcome',
        notifiable: $notifiable,
        subject: 'Welcome!',
        data: ['template' => 'welcome', 'name' => 'Jane Doe']
    );

    $this->assertEquals('success', $result['status']);
}
```

## Troubleshooting

**Emails not sending?**
- Check SMTP configuration in `.env`
- Verify queue worker is running
- Check `failed_jobs` table

**Template not found?**
- Verify template file exists
- Check template mapping in config
- Ensure template name matches

**High failure rate?**
- Check SMTP credentials
- Verify email addresses are valid
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
- [Templates](/cookbook/notifications) - Advanced templates
