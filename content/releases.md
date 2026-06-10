---
title: Release Notes
description: Curated highlights, migration guidance, and structured summaries of Glueful framework releases.
---

> This page is a curated layer over the raw authoritative `CHANGELOG.md`. For complete detail (including every Added/Changed/Removed/Fix line) consult the full changelog.

## v1.54.0 - Okab
**Released: June 10, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-plug-connected"}
#description
A coordinated release in three movements: a **container-precedence fix** that makes every "core default + extension override" seam genuinely overridable; the new **`Glueful\Entitlements` core seam** (contract-only — commercial capability gates for the forthcoming `glueful/subscriptions`); and a **storage driver registry** with the `s3`/`gcs`/`azure` factories **extracted to first-party provider packs** (breaking — lean core, same playbook as 1.52). `glueful/storage-s3` ships alongside (covers R2/MinIO/Spaces/Wasabi via presets); gcs/azure packs follow shortly.
::

### Key Highlights

::card
#title
Extension definitions now override core defaults (container precedence fix)
#description
`ContainerFactory` previously merged extension service definitions with `+=`, silently dropping any extension binding that collided with a core id — meaning `UserProviderInterface -> NullUserProvider` and every other "core default + extension override" seam was un-overridable through the normal provider path. Extension definitions now merge **over** core (`array_replace`), with `ApplicationContext` re-pinned so a framework-managed key can never be clobbered. This is the fix that makes the entitlement seam and storage registry below actually pluggable. **Deploy note:** regenerate the precompiled container (`php glueful di:container:compile --force`) — an artifact compiled before 1.54.0 still encodes the old precedence.
::

::card
#title
Entitlement seam (`Glueful\Entitlements`) — contract only
#description
A new core extension point for **commercial capability gates**: `EntitlementCheckerInterface` (`allows()` / `limit()`, explicit tenant uuid) with an absent-allow `NullEntitlementChecker` default bound in `CoreProvider`. Entitlements are paywall gates, not security boundaries — absent must never lock an app out (the opposite of authorization, which fails closed). Core ships the contract only: no consumer, no tenant/plan awareness. The forthcoming `glueful/subscriptions` binds the real checker over the default and provides the first consumer (entitlement-driven rate-limit tiers).
::

::card
#title
Storage driver registry + provider packs (breaking)
#description
Disk drivers now resolve through a registry: `StorageDriverFactoryInterface` (identity, construction, `available()`, `features()`) with optional `NativeSignedUrlProviderInterface` / `StorageHealthCheckInterface` capability contracts, registered via the `storage.driver_factory` container tag. **Core keeps only `local`/`memory`** — `s3`/`gcs`/`azure` are extracted to first-party packs; a missing driver fails fast with an exception naming the package to install. Also new: `storage:test [disk]` diagnostics (read-only by default, `--write` opt-in, never prints secrets) and an optional, default-off, visibility-scoped `native_url` field in the blob API for direct provider URLs.
::

### Migration Notes

- **Cloud storage disks need their provider pack**: `composer require glueful/storage-s3` for `s3` disks (its presets cover R2, MinIO, Spaces, Wasabi). `gcs`/`azure` users should hold the upgrade until those packs publish (following shortly). `local`/`memory`-only apps need nothing.
- **On deploy:** `php glueful commands:cache` (new `storage:test` command) and `php glueful di:container:compile --force` (the precedence fix only takes effect in a freshly compiled container).
- **Extension authors:** your `services()` definitions now genuinely override core defaults for the same id (previously dropped silently). Audit for unintentional core-id collisions.
- Optional env: `UPLOADS_NATIVE_MAX_PRIVATE_TTL` (default 900). No core migrations; no required env changes.

```bash
composer update glueful/framework
composer require glueful/storage-s3   # only if a disk uses driver: s3 / R2 / MinIO / Spaces / Wasabi
```

## v1.53.0 - Nunki
**Released: June 8, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-plug-connected"}
#description
A backward-compatible release that adds two **generic, chainable database extension seams** — so extensions can enforce scopes, narrow queries, or veto statements without patching core — and folds in **four bug fixes** uncovered while building the upcoming `glueful/tenancy` extension. Both seams are no-ops on a plain install (zero behavior change). No env vars, no migrations, no breaking changes; `composer update glueful/framework` suffices.
::

### Key Highlights

::card
#title
Chainable DB Extension Seams (interceptors + table hooks)
#description
`QueryExecutor::addQueryInterceptor()` registers **pre-execution** interceptors that run before every statement and may **throw to veto** it — suitable for enforcement (access/scope guards, read-only modes, SQL allow/deny policies), unlike the existing post-execution query log which only observes. `Connection::addTableHook()` decorates the `QueryBuilder` returned by `Connection::table()`, keyed by table name — for auto-applying scopes/columns/conditions to **raw** query-builder access (raw-level soft-deletes, org/tenant scoping, environment filtering). Both seams are **chainable**: every registration runs in order (no last-writer-wins), and both are inert when nothing is registered.
::

::card
#title
Four Bug Fixes (queue deserialization, write-path, container)
#description
**SecureSerializer:** namespace-wildcard allowlist entries (e.g. `Glueful\Queue\Jobs\*`) are now actually honored — worker-side `Job::unserialize()` was broken for those classes — and `C:` (Serializable) tokens are now allowlist-validated. **Query builder:** a table-qualified WHERE column on a write (`->where('t.col', $v)->update([...])` / `->delete()`) no longer throws `InvalidArgumentException` — an incomplete identifier-unwrap left a stray quote the column validator rejected (SELECT was unaffected). **Container:** `Connection::class` now resolves from the DI container (it was bound only as `'database'`), so the documented `db($ctx)` and `app($ctx, Connection::class)` accessors work out of the box instead of throwing "Service not found".
::

### Migration Notes

- **No action required.** `composer update glueful/framework` picks up 1.53.0. No new env vars, no migrations, no API breaks; the seams are opt-in and inert unless an extension registers a hook.
- The api-skeleton `^1.52.0` constraint already permits 1.53.0 — no skeleton changes ship in this release.

```bash
composer update glueful/framework
```

---

## v1.52.0 - Mizar
**Released: June 7, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-package-export"}
#description
A coordinated breaking release that makes **core lean**: four subsystems move out of the framework into standalone, opt-in `glueful/*` extensions, each behind a narrow seam core consumes only if bound. **Archive** → `glueful/archive`, **CDN / edge-cache** → `glueful/cdn`, **queue operations** (supervision / autoscaling / worker-metrics) → `glueful/queue-ops`, and **rich media** (image processing / thumbnails / metadata) → `glueful/media`. A plain core install boots, serves uploads, runs a lean single-worker `queue:work`, and caches responses with **none** of these subsystems' heavy dependencies present — `intervention/image` and `james-heinrich/getid3` are removed from core. Every subsystem is restored with a single `composer require`. See the migration notes.
::

### Key Highlights

::card
#title
Archive & CDN / Edge-Cache Extracted (seam-backed)
#description
`glueful/archive` now owns the generic table-archive product (`ArchiveService`, `archive:manage`, the archive schema + the `ARCHIVE_DATABASE_SCHEMA` gate) — core had no consumer of it. `glueful/cdn` owns edge purging, cache-control headers, the provider adapters, and `cache:purge`; core keeps only the `Glueful\Cache\Contracts\EdgeCacheInterface` seam bound by default to the no-op `NullEdgeCache`, so `ResponseCachingTrait` keeps emitting surrogate keys with or without the extension. Restore with `composer require glueful/archive` / `composer require glueful/cdn`.
::

::card
#title
Queue Ops Extracted; Core Ships a Lean Worker
#description
The supervised-fleet surface (`Process/*`, `WorkerMonitor`, `queue:autoscale`, and the old `queue:work` sub-actions `spawn`/`scale`/`status`/`stop`/`restart`/`health`) moves to `glueful/queue-ops`, restoring `queue:supervise` + `queue:autoscale`. Core gains a lean single-loop `QueueWorker`: plain `php glueful queue:work` runs one worker and resolves the `WorkerMonitorInterface` seam to a no-op `NullWorkerMonitor`. New additive flags ship in core regardless — `queue:work --once` / `--connection=`, and `WorkerOptions` now treats `max-jobs`/`max-runtime` `0` as **unlimited**. The `queue.workers.*` ops config relocates to the extension's `queue_ops.*` (same env vars); core keeps per-queue `priority`/`memory_limit`/`timeout`/`max_jobs`, `queue.workers.performance.*`, and `queue.monitoring.*`.
::

::card
#title
Rich Media Extracted; Uploads Stay in Core
#description
Image processing, thumbnail generation, and media-metadata extraction move to `glueful/media`, along with the two heavy deps (`intervention/image`, `james-heinrich/getid3`). Core keeps the upload pipeline — `FileUploader`, the `Glueful\Uploader\Contracts\MediaProcessorInterface` seam, and the unchanged `MediaMetadata` value object. Without the extension, uploads still succeed: `uploadMedia()` returns `thumb_url: null` + a type-only `MediaMetadata`, and the blob-resize endpoint serves the original image (returning `415` only on an explicit format conversion). The `image()` helper and `config/image.php` are now extension-provided. Restore with `composer require glueful/media`.
::

### Migration Notes

- **Restore any subsystem with one `composer require`** (auto-discovered via `extra.glueful`): `glueful/archive`, `glueful/cdn`, `glueful/queue-ops`, `glueful/media`. Run `php glueful migrate:run` for those that ship schema (archive).
- **Refresh the production command manifest on deploy.** This release removes the core `archive:manage`, `cache:purge`, and `queue:autoscale` commands; a `storage/cache/glueful_commands_manifest.php` generated before the upgrade still references them and breaks CLI boot. Run `php glueful commands:cache --clear` — `php glueful cache:clear` does **not** clear the command manifest.
- **No-extension behavior is graceful, not fatal.** Seams degrade to no-ops/defaults: `NullEdgeCache` (response caching still emits surrogate keys), lean `queue:work`, type-only media metadata + original-served variants. Removed helpers/commands (`image()`, `queue:autoscale`, the `queue:work` sub-actions) are *absent* (function/command-not-found), not error-printing stubs.
- **Namespace maps** (when restoring an extension and updating app code): `Glueful\Services\ImageProcessor` → `Glueful\Extensions\Media\ImageProcessor`; `Glueful\Cache\EdgeCacheService` → `Glueful\Extensions\Cdn\EdgeCachePurger`; `Glueful\Queue\Monitoring\WorkerMonitor` → `Glueful\Extensions\QueueOps\Monitoring\WorkerMonitor`; `Glueful\Services\Archive\*` → `Glueful\Extensions\Archive\*`. Full maps in the framework `UPGRADE.md`.
- **No new framework env vars, no core migrations.** The api-skeleton is bumped to `^1.52.0` and ships **lean** (extensions are opt-in; its published `config/image.php`, `cache.edge`, `queue.workers.*` ops blocks, and `capabilities.archive` were removed).

```bash
composer update glueful/framework
# then, to restore what you use:
composer require glueful/media glueful/queue-ops glueful/cdn glueful/archive
php glueful commands:cache --clear
```

---

## v1.51.0 - Larawag
**Released: June 6, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-bell-ringing"}
#description
A five-part refinement of the core notification subsystem. The framework now ships a real in-app **`database`** channel (the default `['database']` channel resolves end-to-end instead of failing as `channel_not_found`), validates channels at **dispatch** rather than construction, makes persistence **optional and safe** (`NOTIFICATIONS_DATABASE_STORE=false`), abstracts **async queue dispatch** behind an injectable seam, adds **structured channel results** (`NotificationResult`), and routes all channel registration through one **extension `boot()`** path. Mostly additive — but two deliberate breaking changes land in channel registration/dispatch. See the migration notes.
::

### Key Highlights

::card
#title
Real `database` Channel + Dispatch-Time Validation
#description
`Glueful\Notifications\Channels\DatabaseChannel` is registered by default in `NotificationsProvider`, so the framework's default `['database']` channel resolves end-to-end instead of failing as `channel_not_found`. It is an in-app *acknowledge* channel — it performs no writes of its own (the notification and its delivery records stay owned by `NotificationService`), and its availability tracks the `notifications` persistence capability. Channel validation also moves from construction to dispatch: `NotificationService` no longer rejects `default_channels` against a hardcoded list — names are normalized structurally only (trimmed, de-duplicated, non-empty, **case preserved**), and unknown channels surface at dispatch via the registry's existing `channel_not_found` / `channel_unavailable`. One source of truth (the `ChannelManager` registry); custom channels work without core changes.
::

::card
#title
Optional, Safe Persistence + Injectable Async Queue
#description
A new `NotificationStoreInterface` abstracts the store; `NotificationRepository` implements it (existing callers unaffected), and a `NullNotificationStore` binds instead when the `notifications` capability is off. The null store degrades explicitly — reads return empty/null/zero, transient writes no-op, and durability-implying operations (`savePreference`, `markAllAsRead`, `deleteOldNotifications`, scheduling, retries) throw `NotificationPersistenceDisabledException` rather than silently losing state. In parallel, `NotificationQueueDispatcherInterface` (default `QueueManagerNotificationDispatcher`) abstracts async dispatch so `send()` never requires a queue and queueing stays unit-testable.
::

::card
#title
Structured Results + Extension-Driven Registration
#description
Channels may opt into a richer `sendNotification(): NotificationResult` (provider message id, error code/message, retryability, latency) via the new `RichNotificationChannel` interface; the dispatcher prefers it and falls back to adapting legacy `send(): bool`, so `NotificationChannel::send()` is unchanged. And channels/`NotificationExtension` hooks now register through an extension's `ServiceProvider::boot()` via `registerNotificationChannel()` / `registerNotificationExtension()` into the shared container `ChannelManager`/dispatcher — one path, no per-job glue. `registerChannel()` is idempotent for the same class and throws `ChannelAlreadyRegisteredException` when a *different* class claims a registered name; `replaceChannel()` overrides intentionally.
::

### Migration Notes

- **Breaking: `ChannelManager` channel-name methods renamed (no aliases).** Replace `getAvailableChannels()` with `getRegisteredChannelNames()`; for only the currently-available channels' names, use the new `getActiveChannelNames()`. `getActiveChannels()` (returning channel objects) is unchanged.
- **Breaking: notification jobs/commands require an `ApplicationContext`.** `DispatchNotificationChannels`, `SendNotification`, `ProcessRetriesCommand`, and `NotificationRetryTask` resolve the shared container dispatcher and throw `NotificationContextRequiredException` if constructed without a context — they no longer build ad-hoc managers or hardcode the `EmailNotification` provider. The queue worker and console kernel already provide a context.
- **Channel packages register from `boot()`.** Custom or not-yet-migrated channel extensions must register their channel/hooks via the new `registerNotificationChannel()` / `registerNotificationExtension()` helpers; until they do, that channel won't auto-wire into the shared dispatcher used by the async jobs.
- **Retry config key moved** from the `emailnotification` namespace to channel-agnostic `notifications.retry` (built-in defaults otherwise).
- **No new env vars, no migrations.** The `notifications` capability default stays `true`; set `NOTIFICATIONS_DATABASE_STORE=false` to run without a database store.

```bash
composer update glueful/framework
```

---

## v1.50.2 - Kochab
**Released: June 5, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-file-text"}
#description
Route docblocks can now document query parameters with an editor-clean **`@queryParam name:type="…"`** tag that the OpenAPI generator actually parses. The old approach overloaded the reserved `@param` tag (`@param page query integer false "…"`), which IDEs/Intelephense mis-read as undefined PHPDoc types (P1133 warnings). A latent doc-gen bug is also fixed: routes that declared a query parameter alongside a `{id}` path segment silently lost the path parameter from their spec. Framework-only — no env vars, no migrations, no API breaks.
::

### Key Highlights

- **`@queryParam` route-doc tag.** `CommentsDocGenerator` parses `@queryParam name:type="description" [{required}]` as an `in: query` OpenAPI parameter — no more reserved-`@param` false positives in your editor. The legacy positional `@param … query …` form still parses, so existing route docblocks are unaffected.
- **Path params no longer dropped.** URL `{name}` path parameters were auto-derived only when *no* parameters were documented at all; a route with a query param plus a `{id}` lost its path param from the generated spec. Path params are now always derived from the URL and merged with documented params (de-duplicated by name; an explicit docblock still wins).
- **`routes/resource.php` migrated** to `@queryParam` for the `/data/{table}` list endpoint's `page`/`limit`/`sort`/`order` params (they now actually appear in the spec).

### Migration Notes

`composer update glueful/framework` is sufficient — the api-skeleton `^1.50.1` constraint already permits 1.50.2. No action required; the new tag is opt-in and the legacy `@param` form continues to work.

---

## v1.50.1 - Kochab
**Released: June 5, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-bug"}
#description
Two extension points that silently did nothing are now fixed. **`ServiceProvider::mergeConfig()`** delegated to a `config.manager` service that was never registered, so an extension's `config/*.php` defaults never reached `config()` — every first-party extension ran on empty/hardcoded fallbacks unless the app shipped its own copy. And **`LoginResponseBuildingEvent`** listeners' changes were discarded by the login-response shaper. Both now work as documented. Framework-only: no env vars, no migrations, no API breaks.
::

### Key Highlights

- **`mergeConfig()` actually merges now.** Backed by the new `ApplicationContext::mergeConfigDefaults()`, extension config defaults are merged **under** framework/app/env config files (your app's `config/*.php` still wins) and persist across `clearConfigCache()`. Affected extensions: `glueful/aegis`, `conversa`, `email-notification`, `entrada`, `meilisearch`, `notiva`, `payvia`, `runiva`.
- **`LoginResponseBuildingEvent` listeners affect the response.** `LoginResponseShaper::shape()` now reads `$event->getResponse()` back, so a listener can add fields (e.g. organization/department context) to the login response.

### Migration Notes

`composer update glueful/framework` is sufficient — the api-skeleton `^1.50.0` constraint already permits 1.50.1. **Behavioral note:** enabled first-party extensions now receive their declared config defaults (previously ignored); review those defaults if you relied on the prior empty behavior.

---

## v1.50.0 - Kochab
**Released: June 4, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-user-shield"}
#description
The concrete user store is extracted to the first-party `glueful/users` extension, leaving a **provider-agnostic core** that talks to identity through `UserProviderInterface` + the canonical `UserIdentity`. In parallel, the framework now **owns the database schema for its own subsystems** — the auth security spine plus DB-backed platform capabilities (queue, scheduler, notifications, metrics, locks, uploads, archive) — as first-class, config-gated, source-tracked migrations, replacing lazy runtime DDL. **Breaking** (shipped as a minor per the pre-public policy): apps must enable a user store. See the migration notes.
::

### Key Highlights

::card
#title
Provider-Agnostic Identity
#description
The concrete user store — `User`, `UserRepository`, the in-core `UserProvider`, account/2FA/password-reset, and `EmailVerification` — moves to the first-party `glueful/users` extension. Core keeps the security spine and depends only on contracts: `UserProviderInterface` (lookup + credential verification) returning the canonical, immutable `UserIdentity`, with `IdentityResolver` applying the account-status gate and folding in claims providers (the `identity.claims_provider` tag — how RBAC like `glueful/aegis` adds roles). With no store installed, core binds a fail-closed `NullUserProvider` and authentication is disabled by design. `AuthenticatedUser` is retired in favour of `UserIdentity`; 2FA becomes an optional capability behind `TwoFactorServiceInterface`.
::

::card
#title
Core Owns Its Schema
#description
The framework ships first-class migrations under `framework/migrations/<capability>/` for the tables its own code reads and writes — auth (`auth_sessions`/`auth_refresh_tokens`/`api_keys`, always on) plus `uploads`, `queue`, `scheduler`, `notifications` (including the formerly runtime-only `notification_retry_queue`), `metrics`, `locks`, and `archive`. Each capability is **registered only when its config gate is on**, under its own source `glueful/framework:<capability>`, via `config/capabilities.php` and existing driver config. The lazy `ensure*Table*()` runtime DDL is removed from `DatabaseQueue`, `JobScheduler`, `NotificationRetryService`, and `ApiMetricsService` — schema now comes from `migrate:run`, not request-time DDL.
::

::card
#title
Ordered, Package-Scoped Migrations
#description
`MigrationPriority` tiers (`FOUNDATION`/`IDENTITY`/`DEFAULT`/`DEPENDENT`) and a `source` column on the `migrations` table let core, extensions, and the app contribute one ordered stream — two packages can ship the same filename without conflict, and pending order is deterministic via `(priority, basename, source)`. Plus a declarative permission catalog (`permissions:list`/`diff`/`sync`) and column-aware soft-delete (`QueryBuilder::delete()` only soft-deletes tables that have `deleted_at`).
::

### Migration Notes

- **Breaking: enable a user store.** Core no longer ships `Glueful\Models\User` / `Glueful\Repository\UserRepository`, and `AuthenticatedUser` is removed. Install and enable `glueful/users` (the api-skeleton does so by default). Without a store, auth fails closed. See [`docs/IDENTITY.md`](https://github.com/glueful/framework/blob/main/docs/IDENTITY.md).
- **`api_keys.user_id` → `user_uuid`.** The column (and `ApiKeyService` input / `ApiKey` model field) is renamed; it remains an indexed UUID with no FK.
- **Schema is migration-owned.** Run `php glueful migrate:run`; capability tables install per `config/capabilities.php` + driver config (`queue.default`, `lock.default`, `uploads.enabled`). See [`docs/MIGRATIONS_AND_CAPABILITIES.md`](https://github.com/glueful/framework/blob/main/docs/MIGRATIONS_AND_CAPABILITIES.md).

```bash
composer require glueful/users
php glueful migrate:run
```


---

Older releases (**v1.49.1 and earlier**) live in the [Release Archive](/releases-archive). The version table at the top links every release; for the full machine-readable history see the [CHANGELOG](https://github.com/glueful/framework/blob/main/CHANGELOG.md).
