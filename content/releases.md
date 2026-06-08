---
title: Release Notes
description: Curated highlights, migration guidance, and structured summaries of Glueful framework releases.
---

> This page is a curated layer over the raw authoritative `CHANGELOG.md`. For complete detail (including every Added/Changed/Removed/Fix line) consult the full changelog.

## Release Summary

| Version | Codename | Date | Type | Risk | Primary Theme |
| ------- | -------- | ---- | ---- | ---- | ------------- |
| 1.52.0 | Mizar | 2026-06-07 | Minor | High | Lean core — Archive, CDN / edge-cache, queue operations (supervision / autoscaling / metrics), and rich media (image processing / thumbnails / metadata) extracted to optional `glueful/*` extensions behind narrow core seams; `intervention/image` + `james-heinrich/getid3` dropped from core; each restored via one `composer require` (breaking: removed classes / commands / config) |
| 1.51.0 | Larawag | 2026-06-06 | Minor | High | Notification subsystem refinement — core in-app `database` channel, dispatch-time channel validation, optional/safe persistence (`NOTIFICATIONS_DATABASE_STORE`), injectable async queue, structured `NotificationResult`, and extension-driven channel registration (breaking: `ChannelManager` renames + context-required jobs) |
| 1.50.2 | Kochab | 2026-06-05 | Patch | Low | `@queryParam` route-doc tag — the OpenAPI generator parses an editor-clean query-param tag (no reserved-`@param` IDE false positives); path params no longer dropped when a query param is also documented |
| 1.50.1 | Kochab | 2026-06-05 | Patch | Moderate | Two silent no-op extension points fixed — `ServiceProvider::mergeConfig()` actually applies extension config defaults; `LoginResponseBuildingEvent` listeners actually modify the login response |
| 1.50.0 | Kochab | 2026-06-04 | Minor | High | Provider-Agnostic Identity & Core-Owned Schema — user store extracted to `glueful/users`; framework owns config-gated capability migrations; lazy runtime DDL removed |
| 1.49.1 | Jishui | 2026-06-01 | Patch | Low | Reserved-word column names — `QueryValidator` accepts SQL reserved words (`from`, `order`, …) as column names |
| 1.49.0 | Jishui | 2026-06-01 | Minor | Moderate | HTTP Auth, WhatsApp Plumbing & Dependency Hardening — `auth_basic` passthrough, `whatsapp` queue type, Intervention Image v4, security patches |
| 1.48.0 | Imai | 2026-05-31 | Minor | Low | Router Verb Completeness — first-class `PATCH`/`OPTIONS`, explicit `OPTIONS` beats auto-CORS, documented route precedence |
| 1.47.0 | Hadar | 2026-05-30 | Minor | High | Extension System Re-Architecture — composer-only discovery, single `enabled` allow-list, pure resolver (breaking config change) |
| 1.46.0 | Gienah | 2026-05-28 | Minor | Low | Fluent Query Caching — `QueryBuilder::cache(ttl, tags)` wired to `QueryCacheService`; level-8 hardening kickoff |
| 1.45.0 | Fomalhaut | 2026-05-27 | Minor | Moderate | The Second Factor — core email-PIN 2FA (opt-in), selectRaw() bindings, security docs |
| 1.44.0 | Errai | 2026-05-22 | Minor | Moderate | Closing the Trust Gaps — real cache tagging, archive restore, honest security report |
| 1.43.0 | Dabih | 2026-05-21 | Minor | Moderate | Production Hardening — ORM observability, API key hardening, k8s probes |
| 1.42.0 | Caph | 2026-05-20 | Minor | Moderate | OpenAPI Spec Excellence |
| 1.41.0 | Beid | 2026-03-03 | Minor | Moderate | Profile-Driven Logging Bootstrap |
| 1.40.4 | Alnair | 2026-02-21 | Patch | Low | PHPCS Line Length Fix |
| 1.40.3 | Alnair | 2026-02-21 | Patch | Medium | Mutation WHERE + Queue Config + Async Notification |
| 1.40.2 | Alnair | 2026-02-21 | Patch | Low | Config Merge Safe Dedup |
| 1.40.1 | Alnair | 2026-02-21 | Patch | Low | Config Merge Fix |
| 1.40.0 | Alnair | 2026-02-21 | Minor | Medium | Notification Delivery Orchestration |
| 1.39.0 | Menkent | 2026-02-20 | Minor | High | Token/Session Reimplementation |
| 1.38.0 | Lesath | 2026-02-17 | Minor | Low | Auth Token-Refresh Performance Optimization |
| 1.37.0 | Kaus | 2026-02-15 | Minor | Low | Deferred Extension Commands + ORM Builder Fixes |
| 1.36.0 | Jabbah | 2026-02-14 | Minor | Low | Model Event Isolation + Base64 Extension Fix |
| 1.35.0 | Izar | 2026-02-14 | Minor | Low | Cloud Storage + Blob Fix |
| 1.34.0 | Hamal | 2026-02-14 | Minor | Low | Auth Pipeline Hardening + Blob Upload DI |
| 1.33.0 | Gacrux | 2026-02-14 | Minor | Low | Container-Enforced Request Resolution |
| 1.32.0 | Fomalhaut | 2026-02-11 | Minor | Low | Schema Builder `alterTable` Callback API |
| 1.31.0 | Enif | 2026-02-09 | Minor | Low | Centralized Context Propagation + ORM Default Context |
| 1.30.1 | Diphda | 2026-02-09 | Patch | Low | JWTService Context Initialization Fix |
| 1.30.0 | Diphda | 2026-02-09 | Minor | Low | Exception Handler Consolidation |
| 1.29.0 | Capella | 2026-02-07 | Minor | Low | Queue System Overhaul — Leaf Workers + Presets |
| 1.28.3 | Bellatrix | 2026-02-07 | Patch | Low | CLI Option Shortcut Collision Fix |
| 1.28.2 | Bellatrix | 2026-02-07 | Patch | Low | CLI Migration Discovery + PostgreSQL Schema Safety |
| 1.28.1 | Bellatrix | 2026-02-06 | Patch | Low | Router Stability + Cache-Aware Registration |
| 1.28.0 | Bellatrix | 2026-02-05 | Minor | Medium | Route Caching Support |
| 1.27.0 | Avior | 2026-02-04 | Minor | Low | DX CLI Commands + Transaction Callbacks |
| 1.26.0 | Atria | 2026-01-31 | Minor | Low | Extension Discovery Fixes |
| 1.25.0 | Ankaa | 2026-01-31 | Minor | Low | Multi-File Route Discovery |
| 1.24.0 | Alpheratz | 2026-01-31 | Minor | Low | Encryption Service |
| 1.23.0 | Aldebaran | 2026-01-31 | Minor | Low | Blob Visibility + Signed URLs |
| 1.22.0 | Achernar | 2026-01-30 | Minor | Medium | Global State Removal / ApplicationContext DI |
| 1.21.0 | Mira | 2026-01-24 | Minor | Low | File Uploader Refactoring |
| 1.20.0 | Regulus | 2026-01-24 | Minor | Low | Framework Simplification |
| 1.19.2 | Canopus | 2026-01-24 | Patch | Low | ValidationException Consolidation + Query Building |
| 1.19.1 | Canopus | 2026-01-22 | Patch | Low | Simplified Configuration |
| 1.19.0 | Canopus | 2026-01-22 | Minor | Low | Search & Filtering DSL |
| 1.18.0 | Hadar | 2026-01-22 | Minor | Low | Webhooks System |
| 1.17.0 | Alnitak | 2026-01-22 | Minor | Low | Rate Limiting Enhancements |
| 1.16.0 | Meissa | 2026-01-22 | Minor | Low | API Versioning Strategy |
| 1.15.0 | Rigel | 2026-01-22 | Minor | Low | Real-Time Development Server |
| 1.14.0 | Bellatrix | 2026-01-22 | Minor | Low | Interactive CLI Wizards |
| 1.13.0 | Saiph | 2026-01-22 | Minor | Low | Enhanced Scaffold Commands + Factories/Seeders |
| 1.12.0 | Mintaka | 2026-01-21 | Minor | Low | API Resource Transformers |
| 1.11.0 | Alnilam | 2026-01-21 | Minor | Low | ORM / Active Record |
| 1.10.0 | Elnath | 2026-01-21 | Minor | Low | Exception Handler + Request Validation |
| 1.9.2 | Deneb | 2026-01-20 | Patch | Low | OpenAPI 3.1 + resource route expansion |
| 1.9.1 | Castor | 2026-01-19 | Patch | Low | OpenAPI documentation refactor + UI generation |
| 1.9.0 | Betelgeuse | 2026-01-17 | Minor | Medium | PHP 8.3 minimum + Symfony 7.3 compat |
| 1.8.1 | Vega    | 2025-11-23 | Patch  | Low    | Password policy + async stream helper |
| 1.8.0 | Spica   | 2025-11-13 | Minor  | Low    | Session + login response events |
| 1.7.4 | Arcturus | 2025-10-28 | Patch  | Low    | Auth status gate + migration docs |
| 1.7.3 | Pollux  | 2025-10-21 | Patch  | Low    | QueryBuilder 2-arg where/orWhere fix |
| 1.7.2 | Antares | 2025-10-21 | Patch  | Low    | Route loading resilience + dev server logs |
| 1.7.1 | Canopus | 2025-10-21 | Patch  | Low    | Extension discovery/boot fix |
| 1.7.0 | Procyon | 2025-10-18 | Minor  | Medium | Async & concurrency subsystem |
| 1.6.2 | Capella | 2025-10-14 | Patch  | Low    | Mail templates config ownership |
| 1.6.1 | Arcturus | 2025-10-14 | Patch  | Low    | JWT RS256 signing |
| 1.6.0 | Sirius  | 2025-10-13 | Minor   | Low    | DI artifacts + conditional caching + DSN utils |
| 1.5.0 | Orion   | 2025-10-13 | Minor   | Medium | Notifications DI + safer email flow |
| 1.4.2 | Rigel   | 2025-10-11 | Patch   | Low    | Docs + PSR-4 tidy-up |
| 1.4.1 | Rigel   | 2025-10-11 | Patch   | Low    | Install flow hardening (SQLite-first) |
| 1.4.0 | Rigel   | 2025-10-11 | Minor   | Medium | Unified session store, legacy removal |
| 1.3.1 | Altair  | 2025-10-10 | Patch   | Low  | Install UX (CI non-interactive) |
| 1.3.0 | Deneb   | 2025-10-06 | Feature | Low  | HTTP client retries |
| 1.2.0 | Vega    | 2025-09-23 | Feature+Breaking | Medium | Tasks & Jobs overhaul |
| 1.1.0 | Polaris | 2025-09-22 | Infra | Low  | Testing infrastructure |
| 1.0.0 | Aurora  | 2025-09-20 | Major | High | First stable split |

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
