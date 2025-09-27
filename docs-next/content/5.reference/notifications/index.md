---
title: Notifications
description: Unified notification system overview (channels, lifecycle, templates, metrics)
navigation:
  icon: i-lucide-bell
---

# Notification System Reference

High-level reference for Glueful's notification subsystem: lifecycle, channels, templates, delivery & retry mechanics, and metrics.

## Overview
Glueful provides a channel‑oriented notification pipeline. A notification is a typed message (e.g. `email_verification`, `security_alert`) delivered to a Notifiable entity through one or more channels (email, database record, future SMS / push). The system handles persistence, scheduling, retries, templating, channel availability and success metrics.

## Core Concepts
| Concept | Description |
|---------|-------------|
| Notifiable | Interface (`Notifications\\Contracts\\Notifiable`) implemented by any model / value object that can receive notifications. Defines `getNotifiableType()` & `getNotifiableId()`. |
| Channel | Delivery implementation (`NotificationChannel`) e.g. Email, future SMS / Push. Responsible for formatting & sending. |
| Dispatcher | Orchestrates multi‑channel send attempts (`NotificationDispatcher`). |
| Service | High level facade (`NotificationService`) – create, persist, send, schedule. |
| Repository | Storage abstraction for notification records & preferences (`NotificationRepository`). |
| Retry Service | Finds due failed notifications and resubmits (`NotificationRetryService`). |
| Metrics Service | Tracks timing, success ratios, latency (`NotificationMetricsService`). |
| Templates | Resolved & rendered via `TemplateManager` and `TemplateResolver`. |
| Events | Domain events: `NotificationQueued`, `NotificationSent`, `NotificationDelivered`, `NotificationFailed`, `NotificationRetry`, `NotificationRead`. |

<!-- notifications:index:start -->
### Summary

| Services | Events | Channels | Generated |
|----------|--------|----------|-----------|
| 7 | 7 | 0 | 2025-09-27T06:07:17 |

### Services

| Class | Methods |
|-------|---------|
| `NotificationService` | 27 |
| `NotificationDispatcher` | 10 |
| `ChannelManager` | 9 |
| `NotificationRetryService` | 7 |
| `NotificationMetricsService` | 16 |
| `TemplateManager` | 15 |
| `TemplateResolver` | 7 |

### Events

| Event | Class | Summary |
|-------|-------|---------|
| `notification.delivered` | `NotificationDelivered` | NotificationDelivered |
| `notification.failed` | `NotificationFailed` | NotificationFailed |
| `notification.queued` | `NotificationQueued` | NotificationQueued |
| `notification.read` | `NotificationRead` | NotificationRead |
| `notification.retry` | `NotificationRetry` | NotificationRetry |
| `notification.scheduled` | `NotificationScheduled` | NotificationScheduled |
| `notification.sent` | `NotificationSent` | NotificationSent |

### Channels

_No channels detected in core. Email channel is provided by the email-notification extension._

<!-- notifications:index:end -->

## Lifecycle
1. Create (and persist) Notification via `NotificationService::send()` or `::create()`.
2. Queue (optional) – if configured, a `SendNotification` job processes it asynchronously.
3. Dispatcher resolves active channels (explicit in options or default channel set).
4. Each channel formats payload (template resolution, variable substitution) and attempts delivery.
5. Metrics captured (creation timestamp, per‑channel delivery time, success rate).
6. Success / failure events emitted; retry service may schedule reattempts.
7. Notification can be marked as delivered / read.

## Quick Start
```php
use Glueful\Notifications\Services\NotificationService;

$service = container()->get(NotificationService::class);
$result = $service->send(
    'email_verification',   // type
    $user,                  // Notifiable
    'Verify your email',    // subject
    ['otp' => '123456', 'expiry_minutes' => 15], // data
    ['channels' => ['email']]                   // options
);
```

Result payloads include per‑channel status metadata.

## Channels
Current stable channel: Email (extension `email-notification`). Planned: database, sms, push, webhook.

See: [Channels](./channels.md) and [Services](./services.md).

## Scheduling
Provide a `schedule` DateTime/Carbon instance in options to defer sending; returned status becomes `scheduled`.

## Retries
Failed sends are recorded. `NotificationRetryService` plus console command / task (`ProcessRetriesCommand`, `NotificationRetryTask`) reprocess due retries up to per‑channel limits.

## Templates
Templates enable rich variable & layout composition. Email extension ships responsive defaults (`default`, `welcome`, `alert`, `password-reset`, `verification`). Global variables (e.g. `app_name`, `current_year`) injected automatically.

## Metrics
Tracked per channel:
- Creation → delivery latency.
- Success / failure counts & ratios.
- Retry attempts.

Developers can extend metrics hooks for APM export.

## Events
| Event | Purpose |
|-------|---------|
| NotificationQueued | Added to asynchronous queue. |
| NotificationSent | Attempted send (may still fail later). |
| NotificationDelivered | Confirmed delivery / success. |
| NotificationFailed | Channel send failed; may trigger retry. |
| NotificationRetry | Retry scheduled or executed. |
| NotificationRead | Recipient engaged / read (where supported). |

## Configuration Summary
| Area | Key Points |
|------|------------|
| Channels | Explicit list or default fallback. |
| Queue | `MAIL_QUEUE_ENABLED` for email; other channels similar when added. |
| Templates | Multiple directories, mapping aliases, cache toggle. |
| Failover | Email supports provider failover & round robin. |
| Rate Limiting | Per‑minute caps to prevent abuse. |

## Extensibility
- Implement `NotificationChannel` for new transports.
- Add templates & global variables via config.
- Hook events for auditing or analytics.
- Override ID generator via `NotificationService` config option `id_generator`.

## Roadmap Placeholders
| Feature | Status |
|---------|--------|
| Database (inbox) channel | planned |
| SMS channel | planned |
| Push channel | planned |
| Webhook channel | planned |
| Preference aggregation UI | planned |

## Related
- Email Notification Extension README (deep dive)
- Queue System Reference
- Events Reference
- Security (Email verification integration)
