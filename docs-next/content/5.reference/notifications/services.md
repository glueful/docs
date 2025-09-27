---
title: Notification Services
description: Service layer APIs (creation, dispatch, retries, metrics, templates)
navigation:
  icon: i-lucide-cog
---

# Services

Service components orchestrate channel resolution, persistence, scheduling, retries, templates and metrics.

## Primary Services
| Service | Responsibility | Key Methods / Notes |
|---------|----------------|---------------------|
| NotificationService | High-level API: create, send, schedule, persist notifications | `send()`, `create()`; options: `channels`, `schedule`, custom `uuid` |
| NotificationDispatcher | Multi-channel orchestration, channel filtering & execution | `send(Notification, Notifiable, ?array $channels)` |
| ChannelManager | Channel registry & availability checks | `getChannel(name)`, `getChannels()` |
| NotificationRetryService | Retrieves failed / deferred notifications & re-dispatches | `processDueRetries(limit, NotificationService)` |
| NotificationMetricsService | Tracks per-channel success, latency, ratios | `trackDeliveryTime()`, `updateSuccessRateMetrics()` |
| TemplateManager | Resolves template file, merges globals, caching | `render($name, $variables)` |
| TemplateResolver | Path resolution, mappings, default layout logic | internal to TemplateManager |

<!-- notifications:services:start -->
### NotificationService

| Method | Signature | Summary |
|--------|-----------|---------|
| `send` | `send(string $type, Glueful\Notifications\Contracts\Notifiable $notifiable, string $subject, array $data = [], array $options = []): array` | Create and send a notification |
| `create` | `create(string $type, Glueful\Notifications\Contracts\Notifiable $notifiable, string $subject, array $data = [], array $options = []): Glueful\Notifications\Models\Notification` | Create a notification without sending it |
| `sendWithTemplate` | `sendWithTemplate(string $type, Glueful\Notifications\Contracts\Notifiable $notifiable, string $templateName, array $templateData = [], array $options = []): array` | Send a notification using a template |
| `markAsRead` | `markAsRead(Glueful\Notifications\Models\Notification $notification, ?DateTime $readAt = null): Glueful\Notifications\Models\Notification` | Mark a notification as read |
| `markAsUnread` | `markAsUnread(Glueful\Notifications\Models\Notification $notification): Glueful\Notifications\Models\Notification` | Mark a notification as unread |
| `setPreference` | `setPreference(Glueful\Notifications\Contracts\Notifiable $notifiable, string $notificationType, ?array $channels = null, bool $enabled = true, ?array $settings = null, ?string $uuid = null): Glueful\Notifications\Models\NotificationPreference` | Set user preference for a notification type |
| `getNotifications` | `getNotifications(Glueful\Notifications\Contracts\Notifiable $notifiable, bool $onlyUnread = false, ?int $limit = null, ?int $offset = null, array $filters = []): array` | Get notifications for a user with optional filtering |
| `getNotificationsWithPagination` | `getNotificationsWithPagination(Glueful\Notifications\Contracts\Notifiable $notifiable, bool $onlyUnread = false, int $page = 1, int $perPage = 20, array $filters = []): array` | Get notifications with built-in pagination |
| `countNotifications` | `countNotifications(Glueful\Notifications\Contracts\Notifiable $notifiable, bool $onlyUnread = false, array $filters = []): int` | Count total notifications for a user with optional filters |
| `getNotificationByUuid` | `getNotificationByUuid(string $uuid): ?Glueful\Notifications\Models\Notification` | Get notification by UUID |
| `getUnreadCount` | `getUnreadCount(Glueful\Notifications\Contracts\Notifiable $notifiable): int` | Get unread notification count for a user |
| `markAllAsRead` | `markAllAsRead(Glueful\Notifications\Contracts\Notifiable $notifiable): int` | Mark all notifications as read for a user |
| `processScheduledNotifications` | `processScheduledNotifications(int $batchSize = 50): array` | Process scheduled notifications |
| `deleteOldNotifications` | `deleteOldNotifications(int $olderThanDays): bool` | Delete old notifications |
| `getPreferences` | `getPreferences(Glueful\Notifications\Contracts\Notifiable $notifiable): array` | Get notification preferences for a user |
| `setIdGenerator` | `setIdGenerator(callable $generator): self` | Set a notification ID generator |
| `getDispatcher` | `getDispatcher(): Glueful\Notifications\Services\NotificationDispatcher` | Get the notification dispatcher |
| `getRepository` | `getRepository(): Glueful\Repository\NotificationRepository` | Get the notification repository |
| `getTemplateManager` | `getTemplateManager(): ?Glueful\Notifications\Templates\TemplateManager` | Get the template manager |
| `setTemplateManager` | `setTemplateManager(Glueful\Notifications\Templates\TemplateManager $templateManager): self` | Set the template manager |
| `getConfig` | `getConfig(string $key, $default = null)` | Get configuration option |
| `getMetricsService` | `getMetricsService(): Glueful\Notifications\Services\NotificationMetricsService` | Get the metrics service |
| `setMetricsService` | `setMetricsService(Glueful\Notifications\Services\NotificationMetricsService $metricsService): self` | Set the metrics service |
| `getPerformanceMetrics` | `getPerformanceMetrics(): array` | Get notification performance metrics for all channels |
| `getChannelMetrics` | `getChannelMetrics(string $channel): array` | Get metrics for a specific channel |
| `resetChannelMetrics` | `resetChannelMetrics(string $channel): bool` | Reset metrics for a specific channel |
| `configureOptions` | `configureOptions(Glueful\Support\Options\SimpleOptionsResolver $resolver): void` | Configure notification service options |

### NotificationDispatcher

| Method | Signature | Summary |
|--------|-----------|---------|
| `send` | `send(Glueful\Notifications\Models\Notification $notification, Glueful\Notifications\Contracts\Notifiable $notifiable, ?array $channels = null): array` | Send a notification through the specified channels |
| `registerExtension` | `registerExtension(Glueful\Notifications\Contracts\NotificationExtension $extension): self` | Register a notification extension |
| `getExtension` | `getExtension(string $name): ?Glueful\Notifications\Contracts\NotificationExtension` | Get a registered extension |
| `removeExtension` | `removeExtension(string $name): self` | Remove a registered extension |
| `getExtensions` | `getExtensions(): array` | Get all registered extensions |
| `setConfig` | `setConfig(string $key, $value): self` | Set configuration option |
| `getConfig` | `getConfig(string $key, $default = null)` | Get configuration option |
| `getChannelManager` | `getChannelManager(): Glueful\Notifications\Services\ChannelManager` | Get the channel manager |
| `setLogger` | `setLogger(Glueful\Logging\LogManager $logger): self` | Set the logger |
| `getLogger` | `getLogger(): ?Glueful\Logging\LogManager` | Get the logger |

### ChannelManager

| Method | Signature | Summary |
|--------|-----------|---------|
| `registerChannel` | `registerChannel(Glueful\Notifications\Contracts\NotificationChannel $channel): self` | Register a notification channel |
| `getChannel` | `getChannel(string $name): Glueful\Notifications\Contracts\NotificationChannel` | Get a registered channel by name |
| `hasChannel` | `hasChannel(string $name): bool` | Check if a channel is registered |
| `removeChannel` | `removeChannel(string $name): self` | Remove a registered channel |
| `getChannels` | `getChannels(): array` | Get all registered channels |
| `getAvailableChannels` | `getAvailableChannels(): array` | Get available channel names |
| `getActiveChannels` | `getActiveChannels(): array` | Get only channels that are currently available for sending |
| `getConfig` | `getConfig(): array` | Get the manager configuration |
| `setConfig` | `setConfig(string $key, $value): self` | Set a configuration value |

### NotificationRetryService

| Method | Signature | Summary |
|--------|-----------|---------|
| `queueForRetry` | `queueForRetry(Glueful\Notifications\Models\Notification $notification, Glueful\Notifications\Contracts\Notifiable $notifiable, string $channel): bool` | Queue a notification for retry |
| `calculateRetryDelay` | `calculateRetryDelay(int $retryCount): int` | Calculate retry delay based on retry count and backoff strategy |
| `ensureRetryQueueTableExists` | `ensureRetryQueueTableExists(): void` | Ensure the retry queue table exists |
| `processDueRetries` | `processDueRetries(int $limit, Glueful\Notifications\Services\NotificationService $notificationService): array` | Process due retry attempts |
| `shouldRetry` | `shouldRetry(Glueful\Notifications\Models\Notification $notification): bool` | Check if a notification should be retried |
| `getConfig` | `getConfig(): array` | Get the configuration |
| `setConfig` | `setConfig(string $key, $value): self` | Set configuration option |

### NotificationMetricsService

| Method | Signature | Summary |
|--------|-----------|---------|
| `getConfig` | `getConfig(): array` | Get the current configuration |
| `setNotificationCreationTime` | `setNotificationCreationTime(string $notificationUuid, string $channel): void` | Store notification creation time for calculating delivery time later |
| `getNotificationCreationTime` | `getNotificationCreationTime(string $notificationUuid, string $channel): ?int` | Get notification creation time |
| `trackDeliveryTime` | `trackDeliveryTime(string $notificationUuid, string $channel, int $deliveryTime): void` | Track delivery time for performance metrics |
| `getAverageDeliveryTime` | `getAverageDeliveryTime(string $channel): float` | Get the average delivery time |
| `incrementRetryCount` | `incrementRetryCount(string $notificationUuid, string $channel): int` | Increment and get retry count for a notification |
| `getRetryCount` | `getRetryCount(string $notificationUuid, string $channel): int` | Get retry count for a notification |
| `getRetryDistribution` | `getRetryDistribution(string $channel, int $maxRetries = 3): array` | Get retry distribution data |
| `updateSuccessRateMetrics` | `updateSuccessRateMetrics(string $channel, bool $success): void` | Update success/failure rate metrics |
| `getSuccessRate` | `getSuccessRate(string $channel): float` | Get success rate |
| `getTotalSent` | `getTotalSent(string $channel): int` | Get total sent notifications count |
| `getTotalFailed` | `getTotalFailed(string $channel): int` | Get total failed notifications count (after all retries) |
| `cleanupNotificationMetrics` | `cleanupNotificationMetrics(string $notificationUuid, string $channel): void` | Clean up notification-specific metrics data after processing is complete |
| `getChannelMetrics` | `getChannelMetrics(string $channel, int $maxRetries = 3): array` | Get all performance metrics for a specific channel |
| `getAllMetrics` | `getAllMetrics(array $channels = []): array` | Get metrics for all channels |
| `resetChannelMetrics` | `resetChannelMetrics(string $channel): bool` | Reset all metrics for a specific channel |

### TemplateManager

| Method | Signature | Summary |
|--------|-----------|---------|
| `registerTemplate` | `registerTemplate(Glueful\Notifications\Models\NotificationTemplate $template): self` | Register a notification template |
| `registerTemplates` | `registerTemplates(array $templates): self` | Register multiple templates at once |
| `getTemplate` | `getTemplate(string $type, string $name, string $channel): ?Glueful\Notifications\Models\NotificationTemplate` | Get a template by its components |
| `getAllTemplates` | `getAllTemplates(): array` | Get all registered templates |
| `getTemplatesForType` | `getTemplatesForType(string $type): array` | Get templates for a specific notification type |
| `getTemplatesForChannel` | `getTemplatesForChannel(string $channel): array` | Get templates for a specific channel |
| `removeTemplate` | `removeTemplate(string $type, string $name, string $channel): self` | Remove a template |
| `resolveTemplates` | `resolveTemplates(string $type, string $name, ?array $channels = null): array` | Resolve templates for a notification across channels |
| `getAvailableChannels` | `getAvailableChannels(): array` | Get available channels from registered templates |
| `createTemplate` | `createTemplate(string $id, string $type, string $name, string $channel, string $content, ?array $parameters = null, ?string $uuid = null): Glueful\Notifications\Models\NotificationTemplate` | Create a new template instance and register it |
| `getResolver` | `getResolver(): Glueful\Notifications\Templates\TemplateResolver` | Get the template resolver |
| `setResolver` | `setResolver(Glueful\Notifications\Templates\TemplateResolver $resolver): self` | Set the template resolver |
| `getConfig` | `getConfig(string $key, $default = null)` | Get configuration option |
| `setConfig` | `setConfig(string $key, $value): self` | Set configuration option |
| `renderTemplate` | `renderTemplate(string $type, string $name, string $channel, array $data): ?string` | Render a template with data |

### TemplateResolver

| Method | Signature | Summary |
|--------|-----------|---------|
| `resolve` | `resolve(string $type, string $name, string $channel, array $templates): ?Glueful\Notifications\Models\NotificationTemplate` | Resolve a template for a specific notification type, name, and channel |
| `resolveForChannels` | `resolveForChannels(string $type, string $name, array $channels, array $templates): array` | Resolve templates for all channels |
| `generateTemplateId` | `generateTemplateId(string $type, string $name, string $channel): string` | Generate a unique template identifier |
| `parseTemplateId` | `parseTemplateId(string $templateId): array` | Parse a template identifier into its components |
| `clearCache` | `clearCache(): self` | Clear the template cache |
| `setFallbackPatterns` | `setFallbackPatterns(array $patterns): self` | Set custom fallback patterns |
| `getFallbackPatterns` | `getFallbackPatterns(): array` | Get current fallback patterns |
<!-- notifications:services:end -->

## NotificationService::send()
### Signature
```php
array send(
  string $type,
  Notifiable $notifiable,
  string $subject,
  array $data = [],
  array $options = []
)
```

### Behavior
1. Creates Notification model (assigns UUID / id).
2. Persists to repository.
3. Records creation timestamp per candidate channel.
4. If no `schedule`, dispatches immediately through `NotificationDispatcher`.
5. Updates metrics (success, latency) and persists sent status.
6. Returns structured result with channel outcomes.

### Result Structure (typical success)
```php
[
  'status' => 'success',
  'notification_id' => '...',
  'uuid' => '...',
  'channels' => [
      'email' => [
          'status' => 'success',
          'attempts' => 1,
          'sent_at' => '2025-09-27 11:25:13'
      ]
  ]
]
```

If scheduled: `['status' => 'scheduled', 'scheduled_at' => 'YYYY-mm-dd HH:MM:SS']`.

## Scheduling
Provide `$options['schedule'] = DateTimeInterface` to defer dispatch. Cron / task runners then process due scheduled notifications.

## Retries
- Failures yield retry records with backoff policy (implementation detail).
- `NotificationRetryService::processDueRetries($limit, $notificationService)` iterates due items, reuses dispatcher.
- Console: `ProcessRetriesCommand` & Task: `NotificationRetryTask` automate execution.

## Metrics
Metrics service maintains:
| Metric | Description |
|--------|-------------|
| Delivery latency | Time (s) from creation to successful channel delivery. |
| Success rate | Ratio of successful vs total attempts per channel. |
| Retry attempts | Number of retries executed per notification / channel. |

Developers can export or aggregate metrics for external monitoring.

## Templates
TemplateManager merges:
- Global variables (configured) – `app_name`, `current_year`, etc.
- Dynamic data passed in `send()`.
- Layout partials unless template already has full HTML structure.

Aliases map friendly names to nested template paths via configuration mappings.

## Channel Selection Logic
- Explicit `['channels'=>['email']]` overrides defaults.
- Without explicit list, dispatcher queries default / configured channels from internal config / environment.
- Unavailable channels (failing `isAvailable()`) are skipped with a recorded status.

## Extending the System
| Extension Point | How |
|-----------------|-----|
| New Channel | Implement `NotificationChannel`, register via extension provider. |
| Custom ID Generation | Pass `id_generator` callable in `NotificationService` config. |
| Additional Metrics | Decorate `NotificationMetricsService` or register event listeners. |
| Template Source | Add paths / mappings in services config. |
| Custom Retry Strategy | Extend `NotificationRetryService` or hook into retry events. |

## Error Handling
Typical error conditions:
| Scenario | Handling |
|----------|----------|
| Invalid channel name | Channel ignored; result marks unknown channel. |
| Template missing | Channel marks failure; may trigger retry. |
| Provider outage (email) | Failover attempts next provider; all fail => failure recorded. |
| Repository save failure | Throws; caller should catch (rare). |

## Example: Scheduled + Multiple Channels (future channels placeholder)
```php
$service->send(
  'user_digest',
  $user,
  'Daily Digest',
  ['digest_items' => $items],
  [
    'channels' => ['email', 'sms'], // sms planned
    'schedule' => (new DateTime('+10 minutes')),
  ]
);
```

## Related
- [Notification Index](./index.md)
- [Channels](./channels.md)
- Queue Reference
- Events Reference
