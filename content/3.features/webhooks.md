---
title: Webhooks
description: Signed outbound webhooks with subscriptions, queued delivery, retries and retention
---

Glueful's webhooks are **outbound**. Your app dispatches named events such as `order.shipped`, and the framework POSTs a signed JSON payload to every subscribed endpoint, on a queue, with retries. Subscriptions and delivery records live in two database tables. CLI commands, a management API and a scheduled cleanup job come with them.

There's no built-in receiver for third-party webhooks (Stripe, GitHub, …). Write that as an ordinary route that verifies the sender's own signature. See [Receiving Webhooks](#receiving-webhooks).

## Quick Start

```php
use Glueful\Api\Webhooks\Webhook;
use Glueful\Api\Webhooks\Contracts\WebhookDispatcherInterface;

// 1. Subscribe an endpoint (once, e.g. from an admin action)
$subscription = Webhook::subscribe(['order.*'], 'https://partner.example.com/hooks');
$secret = $subscription->secret; // whsec_..., give it to the receiver

// 2. Dispatch an event wherever it happens
app($context, WebhookDispatcherInterface::class)->dispatch('order.shipped', [
    'order_id' => $order->uuid,
    'carrier'  => 'ups',
]);
```

```bash
# 0. Create the webhook tables (once)
php glueful migrate:run

# 3. Run a worker on the webhooks queue
php glueful queue:work --queue=webhooks
```

## Configuration

The `webhooks` block of `config/api.php`:

| Key | Env | Default | Notes |
|-----|-----|---------|-------|
| `enabled` | `WEBHOOKS_ENABLED` | `true` | When `false`, `dispatch()` creates no deliveries |
| `queue` | `WEBHOOKS_QUEUE` | `webhooks` | Queue the delivery jobs are pushed to |
| `connection` | `WEBHOOKS_QUEUE_CONNECTION` | `null` | Queue connection for delivery jobs; `null` uses the default connection |
| `signature_header` | | `X-Webhook-Signature` | Header carrying the signature |
| `signature_algorithm` | | `sha256` | `hash_hmac()` algorithm used to sign |
| `timeout` | `WEBHOOKS_TIMEOUT` | `30` | Per-request timeout in seconds |
| `user_agent` | | `Glueful-Webhooks/1.0` | `User-Agent` header |
| `retry.max_attempts` | `WEBHOOKS_MAX_ATTEMPTS` | `5` | Total attempts before a delivery is marked failed |
| `retry.backoff` | | `[60, 300, 1800, 7200, 43200]` | Delay in seconds after each failed attempt; the last value repeats |
| `require_https` | `WEBHOOKS_REQUIRE_HTTPS` | `true` | Reject non-HTTPS subscription URLs |
| `cleanup.keep_successful_days` | | `7` | Retention for delivered records |
| `cleanup.keep_failed_days` | | `30` | Retention for failed records |

`enabled` also controls the bridge from application events: with `api.webhooks.enabled` and `events.enabled` both on, `WebhookEventListener` is registered at boot. See [From application events](#from-application-events).

## Storage

The two tables ship as the core `webhooks` migration leaf (`migrations/webhooks`, `glueful/framework:webhooks`). Create them with `php glueful migrate:run`.

| Table | Holds |
|-------|-------|
| `webhook_subscriptions` | `uuid` (`wh_sub_…`), `url`, `events` (JSON), `secret`, `is_active`, `metadata` (JSON) |
| `webhook_deliveries` | `uuid`, `subscription_id`, `event`, `payload` (JSON), `status`, `attempts`, `response_code`, `response_body`, `delivered_at`, `next_retry_at` |

::u-alert{color="info" variant="subtle" icon="i-lucide-info"}
**Since 1.91:** the tables come from the migration; the dispatcher no longer creates them at runtime. Run `php glueful migrate:run` after upgrading. Databases whose webhook tables were created by the old runtime path migrate cleanly.
::

## Subscriptions

A subscription is an endpoint URL plus the event patterns it wants. Each subscription has its own signing secret.

```php
use Glueful\Api\Webhooks\Webhook;
use Glueful\Api\Webhooks\WebhookSubscription;

$sub = Webhook::subscribe(
    ['order.created', 'order.shipped', 'customer.*'],
    'https://partner.example.com/hooks',
    ['owner' => 'partner-42'],               // metadata (optional)
);

// Equivalent, through the ORM model (context-first)
$sub = WebhookSubscription::create($context, [
    'url' => 'https://partner.example.com/hooks',
    'events' => ['order.*'],
    'is_active' => true,
]);
```

On creation, the model generates the `uuid` (`wh_sub_` + 16 characters) and a `secret` (`whsec_` + 64 hex characters) when you don't supply them. `secret` is hidden from the model's array/JSON output.

### Event patterns

| Pattern | Matches |
|---------|---------|
| `order.shipped` | Exactly `order.shipped` |
| `order.*` | `order.created`, `order.shipped`, … (anything starting `order.`) |
| `*` | Every event |

### Managing a subscription

```php
$sub = Webhook::findSubscription('wh_sub_abc123');

$sub->deactivate();             // stops new deliveries; queued ones fail
$sub->activate();
$newSecret = $sub->rotateSecret(); // takes effect immediately, with no overlap

$sub->stats(30);       // ['total' => .., 'delivered' => .., 'failed' => .., 'pending' => ..]
$sub->successRate(30); // percentage, 0-100

Webhook::activeSubscriptions();
Webhook::subscriptionsForEvent('order.shipped');
```

`rotateSecret()` replaces the secret at once, so share the new one with the receiver before rotating, or accept that deliveries fail verification until the receiver is updated.

## Dispatching Events

Inject or resolve `Glueful\Api\Webhooks\Contracts\WebhookDispatcherInterface`, which is bound to `WebhookDispatcher`:

```php
use Glueful\Api\Webhooks\Contracts\WebhookDispatcherInterface;

final class ShippingService
{
    public function __construct(private readonly WebhookDispatcherInterface $webhooks)
    {
    }

    public function markShipped(Order $order): void
    {
        // ... update the order ...

        $deliveries = $this->webhooks->dispatch('order.shipped', [
            'order_id' => $order->uuid,
            'shipped_at' => date('c'),
        ]);
    }
}
```

For each active subscription that matches the event, `dispatch()` creates a `pending` delivery record and queues a `DeliverWebhookJob`. It returns the `WebhookDelivery` records and, when at least one was created, fires `WebhookDispatchedEvent`. Nothing goes over HTTP inside the request.

The third `$options` argument overrides where and when the jobs run:

```php
$this->webhooks->dispatch('order.shipped', $data, [
    'queue' => 'webhooks-priority', // default: api.webhooks.queue
    'connection' => 'redis',        // default: api.webhooks.connection, then the default connection
    'delay' => 30,                  // seconds before the first attempt
]);
```

The static `Webhook::dispatch()` does the same thing. Its context is set during HTTP boot (and by the webhook commands), so in queue workers or your own CLI commands, use the injected dispatcher.

### Payload

Every delivery body has the same envelope:

```json
{
  "id": "wh_evt_V1StGXR8Z5jdHi6BmyT2",
  "event": "order.shipped",
  "created_at": "2026-10-27T14:03:11+00:00",
  "data": { "order_id": "ord_123", "shipped_at": "2026-10-27T14:03:11+00:00" }
}
```

The payload is built when the event is dispatched and stored on the delivery, so every retry sends the same `id` and `data`. Use `id` to deduplicate on the receiving end. To change the envelope, bind your own `Glueful\Api\Webhooks\Contracts\WebhookPayloadInterface` (`build(string $event, array $data, array $metadata = []): array`).

### From application events

`DispatchesWebhooks` (a trait) and `#[Webhookable]` (a class attribute) mark an [event](/features/events) as webhook-worthy. When `events.enabled` and `api.webhooks.enabled` are on, the framework registers `WebhookEventListener` at boot, so any marked event dispatched through `EventService` becomes a webhook dispatch. There's nothing to wire up:

```php
use Glueful\Api\Webhooks\Concerns\DispatchesWebhooks;
use Glueful\Events\Contracts\BaseEvent;
use Glueful\Events\EventService;

final class OrderShippedEvent extends BaseEvent
{
    use DispatchesWebhooks; // webhook name derived from the class: "order.shipped"

    public function __construct(public readonly string $orderId, public readonly string $carrier)
    {
        parent::__construct();
    }

    public function shouldDispatchWebhook(): bool
    {
        return $this->carrier !== 'internal';
    }

    public function webhookOptions(): array
    {
        return ['delay' => 10]; // same keys as dispatch() options: queue, connection, delay
    }
}

// Anywhere: dispatching the event also queues the webhook deliveries
app($context, EventService::class)->dispatch(new OrderShippedEvent($order->uuid, 'ups'));
```

With the trait, the payload is the event's own public properties (`orderId`, `carrier`). Override `webhookEventName()`, `webhookPayload()` or `webhookOptions()` to change the name, the data or the dispatch options. Without the trait, `#[Webhookable(event: 'order.shipped', condition: 'shouldNotify')]` sets the name and an optional condition method, and the payload is the event's public properties minus the `BaseEvent` ones. The attribute's `only` and `except` arguments are deprecated and have no effect.

The bridge listens at priority `-100`, so your own listeners for the same event run first, and a listener that stops propagation also stops the webhook.

::u-alert{color="warning" variant="subtle" icon="i-lucide-triangle-alert"}
**Since 1.91:** if you registered `WebhookEventListener` yourself (for example with `addListener(..., '@...WebhookEventListener:handleEvent')`), remove that registration, or each marked event dispatches its webhooks twice.
::

## Delivery

A queue worker runs `DeliverWebhookJob` for each delivery:

1. Loads the delivery and its subscription. A missing or inactive subscription marks the delivery `failed`.
2. Checks the destination (below). A refused URL marks it `failed` without sending.
3. POSTs the JSON payload with redirects disabled.
4. A `2xx` response marks it `delivered` and fires `WebhookDeliveredEvent`. Any other status, a `3xx` included, or a network error goes to [Retries](#retries).

The response code and body are stored on the delivery.

### Request headers

```http
POST /hooks HTTP/1.1
Content-Type: application/json
User-Agent: Glueful-Webhooks/1.0
X-Webhook-ID: <delivery uuid>
X-Webhook-Event: order.shipped
X-Webhook-Timestamp: 1793109791
X-Webhook-Signature: t=1793109791,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd
```

### Destination checks

Before every send, the job refuses:

- a scheme other than `https` when `require_https` is on (otherwise `http` or `https`)
- `localhost` and `*.localhost`
- hosts that don't resolve, or that resolve to any private, reserved, loopback, link-local, unique-local or documentation address (IPv4 and IPv6, including IPv4-mapped IPv6)

The connection is pinned to the IP that passed the check, which closes the DNS-rebinding gap between checking and connecting. The management API also rejects a non-HTTPS URL when the subscription is created while `require_https` is on.

## Signatures

Each delivery is signed with the subscription's secret, Stripe-style, in the `signature_header` header (default `X-Webhook-Signature`) with the `signature_algorithm` HMAC (default `sha256`):

```
X-Webhook-Signature: t=<unix timestamp>,v1=<hex HMAC of "<timestamp>.<raw body>">
X-Webhook-Timestamp: <unix timestamp>
```

This is the framework's only signing scheme: `Glueful\Http\Services\WebhookDeliveryService` (ad-hoc deliveries with a `secret` option) signs the same way.

::u-alert{color="info" variant="subtle" icon="i-lucide-info"}
**Since 1.91:** `WebhookDeliveryService` no longer sends `X-Glueful-Signature: sha256=…` / `X-Glueful-Timestamp`. Receivers of its deliveries must verify the `t=…,v1=…` header above.
::

A Glueful receiver can verify it with `Webhook::verify()` (or `WebhookSignature::verify()`), which checks the HMAC in constant time and rejects timestamps more than 300 seconds old by default. `Webhook::verify()` uses the configured `signature_algorithm`:

```php
use Glueful\Api\Webhooks\Webhook;
use Glueful\Http\Response;
use Symfony\Component\HttpFoundation\Request;

public function receive(Request $request): Response
{
    $valid = Webhook::verify(
        $request->getContent(),                             // the raw body, not re-encoded JSON
        (string) $request->headers->get('X-Webhook-Signature'),
        $secret,                                            // the subscription's whsec_...
        300,                                                // tolerance in seconds; null skips the age check
    );

    if (!$valid) {
        return Response::error('Invalid signature', 401);
    }
    // ...
}
```

Receivers on other stacks compute `hash_hmac('sha256', "{$t}.{$rawBody}", $secret)` (or the configured algorithm) and compare it with each `v*` value in the header.

## Retries

When an attempt fails and fewer than `retry.max_attempts` attempts have been made, the delivery becomes `retrying`, `next_retry_at` is set, and the job is released back to the queue with a delay taken from `retry.backoff`. The defaults:

| After attempt | Next try in |
|---------------|-------------|
| 1 | 1 minute |
| 2 | 5 minutes |
| 3 | 30 minutes |
| 4 | 2 hours |
| 5+ | 12 hours |

With the default 5 attempts, the fifth failure marks the delivery `failed` and fires `WebhookFailedEvent`. Delivery statuses are `pending`, `retrying`, `delivered` and `failed` (`WebhookDelivery::STATUS_*`).

Retry failed or stuck deliveries by hand:

```php
Webhook::retry('delivery-uuid');            // resets attempts to 0 and re-queues
Webhook::failedDeliveries(50, date('Y-m-d H:i:s', strtotime('-1 day'))); // recent failures
```

## Monitoring Events

| Event | Fired when | Useful accessors |
|-------|------------|------------------|
| `Glueful\Api\Webhooks\Events\WebhookDispatchedEvent` | `dispatch()` created at least one delivery | `getEvent()`, `getDeliveryCount()` |
| `Glueful\Events\Webhook\WebhookDeliveredEvent` | An endpoint answered `2xx` | `getUrl()`, `getStatusCode()`, `getDurationMs()`, `getHost()` |
| `Glueful\Events\Webhook\WebhookFailedEvent` | Attempts are exhausted, or the URL was refused | `getReason()`, `getStatusCode()`, `isNetworkError()`, `isClientError()`, `isServerError()` |

```php
app($context, EventService::class)->addListener(
    WebhookFailedEvent::class,
    fn (WebhookFailedEvent $e) => $logger->warning('Webhook failed', [
        'host' => $e->getHost(),
        'reason' => $e->getReason(),
    ]),
);
```

## Management API

Core ships `routes/webhooks.php`, which mounts `WebhookController` under the API prefix (for example `/api/v1/webhooks/...`). Every route requires `auth`; reads require the `system.config.view` permission and changes require `system.config.edit`:

| Method | Path | Permission |
|--------|------|------------|
| `GET` | `/webhooks/subscriptions` | `system.config.view` |
| `POST` | `/webhooks/subscriptions` | `system.config.edit` |
| `GET` | `/webhooks/subscriptions/{id}` | `system.config.view` |
| `PATCH` | `/webhooks/subscriptions/{id}` | `system.config.edit` |
| `DELETE` | `/webhooks/subscriptions/{id}` | `system.config.edit` |
| `POST` | `/webhooks/subscriptions/{id}/rotate-secret` | `system.config.edit` |
| `POST` | `/webhooks/subscriptions/{id}/test` | `system.config.edit` |
| `GET` | `/webhooks/subscriptions/{id}/stats` | `system.config.view` |
| `GET` | `/webhooks/deliveries` | `system.config.view` |
| `GET` | `/webhooks/deliveries/{id}` | `system.config.view` |
| `POST` | `/webhooks/deliveries/{id}/retry` | `system.config.edit` |

`{id}` is the subscription or delivery **uuid**. Creating a subscription takes `{"url": "...", "events": ["order.*"], "metadata": {}}` and returns `201` with the secret. That response and `rotate-secret` are the only ones that include it. The routes are rate limited, and the actions carry `#[ApiOperation]`/`#[ApiResponse]` attributes, so they show up in the generated [OpenAPI](/advanced/openapi) spec.

::u-alert{color="warning" variant="subtle" icon="i-lucide-triangle-alert"}
**Since 1.91:** if your app mounted `WebhookController` on these paths itself, remove those routes.
::

## CLI

```bash
php glueful webhook:list --active --stats       # alias: webhooks; also --inactive, --json
php glueful webhook:test https://example.com/hooks --secret=whsec_... --event=order.shipped
php glueful webhook:test https://example.com/hooks --subscription=wh_sub_abc123
php glueful webhook:retry <delivery-uuid>
php glueful webhook:retry --failed --since="1 hour ago" --limit=50 --dry-run
php glueful webhook:cleanup
```

`webhook:test` (and the API's test action) sends synchronously, passes through the same destination checks, and signs when a secret is available. Its body is a fixed test payload (`event`, `timestamp`, `data.test: true`), not the delivery envelope.

## Retention

`Webhook::cleanup()` deletes `delivered` records older than `cleanup.keep_successful_days` (by `delivered_at`) and `failed` records older than `cleanup.keep_failed_days` (by `created_at`). Pending and retrying deliveries are never removed by age.

The framework schedule runs it every day at 03:30 as the `webhook_cleanup` job (`WebhookCleanupJob`, disable with `WEBHOOK_CLEANUP_ENABLED=false`). Run it by hand with `php glueful webhook:cleanup`.

::u-alert{color="warning" variant="subtle" icon="i-lucide-triangle-alert"}
If your app has its own `config/schedule.php` with a `jobs` list, that list **replaces** the framework's. Include `webhook_cleanup` in it, or delivery records are never purged. See [Scheduling](/features/scheduling).
::

## Receiving Webhooks

Nothing in core receives or verifies third-party webhooks. Define a route for the provider and verify its signature with the provider's scheme. Leave `auth` off the route (the signature is the credential) and keep it out of the `csrf` middleware: mount it under `/webhooks/inbound/<provider>`, which the default `exemptRoutes` entry `webhooks/inbound/*` covers. (Since 1.91 the shipped entry is no longer `webhooks/*`, which would also have exempted the management API.) For handlers whose failures must surface so the sender retries, dispatch your domain event with `EventService::dispatchOrFail()`. See [Events](/features/events).

## Next Steps

- [Queues & Jobs](/features/queues-jobs) - Run the `webhooks` queue worker
- [Events & Listeners](/features/events) - Listen for delivery outcomes
- [Scheduling](/features/scheduling) - The `webhook_cleanup` job
