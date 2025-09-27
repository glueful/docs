---
title: Notification Channels
description: Available & planned notification delivery channels with capabilities
navigation:
  icon: i-lucide-share-2
---

# Channels

Delivery channels encapsulate transport‑specific logic: formatting, availability checks, send semantics, and feature flags (attachments, templates, queue characteristics).

## Current Channel: Email
Provided by the `email-notification` extension. Uses Symfony Mailer with multi‑provider bridge support.

<!-- notifications:channels:start -->
_No concrete channels registered at generation time. If you have installed the email notification extension, ensure it is autoloadable or re-run generation._
<!-- notifications:channels:end -->

### Capabilities
| Capability | Support | Notes |
|------------|---------|-------|
| Templates | yes | Built-in responsive templates + custom paths, alias mapping |
| Attachments | yes | Via `email_options.attachments` array |
| Embedded Images | yes | `embedImages` data option |
| Multi-Provider | yes | Failover & round‑robin across configured mailers |
| Queueing | yes | Controlled by `MAIL_QUEUE_ENABLED` (async processing) |
| Rate Limiting | yes | Per‑minute via env vars (e.g. `MAIL_RATE_LIMIT_PER_MINUTE`) |
| Custom Headers | yes | `email_options.headers` |
| Priority | yes | `email_options.priority` |
| CC / BCC | yes | `email_options.cc`, `email_options.bcc` |
| Return Path | yes | Bounce handling via `email_options.returnPath` |
| Metrics | yes | Delivery latency, success/failure ratios |

### Data & Options Shape
```php
$service->send(
    'security_alert',
    $user,
    'Security Alert',
    [
        'message' => 'Access from new device',
        'template_name' => 'alert',      // optional template selection
        'embedImages' => [ 'logo' => '/path/logo.png' ],
    ],
    [
        'channels' => ['email'],
        'email_options' => [
            'attachments' => [ [ 'path' => '/tmp/r.pdf', 'name' => 'Report.pdf' ] ],
            'priority' => 'high',
            'headers' => [ 'X-Trace-ID' => $traceId ],
        ],
    ]
);
```

### Provider Failover Example (`config/services.php`)
```php
'mail' => [
  'failover' => [ 'mailers' => ['brevo','sendgrid','smtp'] ],
  'round_robin' => [ 'mailers' => ['ses','mailgun'] ],
]
```

## Planned Channels
| Channel | Status | Notes |
|---------|--------|-------|
| Database (inbox) | planned | Persist & user UI retrieval |
| SMS | planned | Pluggable provider gateway abstraction |
| Push | planned | Web/device push via unified adapter |
| Webhook | planned | Signed outbound HTTP POST with retries |

## Channel Discovery & Registration
Channels are resolved by the `ChannelManager` through registered extensions + internal defaults. Custom channels implement `NotificationChannel` and are added via an Extension Provider or service container definition.

## Implementing a Custom Channel
1. Implement `NotificationChannel` methods.
2. Provide configuration section (if needed) & health check logic in `isAvailable()`.
3. Register via extension ServiceProvider or container binding.
4. Expose channel name through `getChannelName()`; reference it in notification send options.

Example skeleton:
```php
class SmsChannel implements NotificationChannel {
    public function getChannelName(): string { return 'sms'; }
    public function send(Notifiable $notifiable, array $data): bool { /* dispatch to provider */ }
    public function format(array $data, Notifiable $notifiable): array { return $data; }
    public function isAvailable(): bool { return true; }
    public function getConfig(): array { return []; }
}
```

## Selection Logic
If explicit `['channels'=>['email']]` provided, only those channels run. Otherwise default channel list (internal configuration or environment) is used.

## Metrics Integration
Each channel reports success / failure enabling per‑channel success ratios and latency calculations via `NotificationMetricsService`.

## Related
- [Notification Index](./index.md)
- [Services](./services.md)
- Email Notification Extension README (deep dive)
