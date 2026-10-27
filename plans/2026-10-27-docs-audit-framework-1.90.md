# Docs audit vs framework 1.90.0 (2026-10-27)

Read-only audit of `content/` against framework `src/`, `config/`, `routes/`, `CHANGELOG.md` (1.52→1.90) and `extensions/`. Docs were last swept at ~1.51/1.52 (June 2026). Line numbers refer to the doc page.

## Cross-cutting problems (fix everywhere)

1. **`$this->db` in controllers** — `BaseController` has no such property (real: `$request`, `$currentUser`, `$authManager`, `$repositoryFactory`, `$context`). Use `db($this->context)` / injected `Connection`. Hits: essentials/controllers, database, requests-responses, authentication; api-reference L39–46.
2. **`$context` undefined** inside jobs, scheduled handlers, middleware `handle()`, notification channels, closures without `use`. Jobs: `$this->context`.
3. **Transactions** — `beginTransaction()/commit()/rollback()` aren't on `Connection`; use `->transaction()`, `afterCommit()`, `withinTransaction()`.
4. **`insert()` returns row count**, not an id → `insertGetId()` (1.86.0).
5. **QueryBuilder APIs that don't exist**: `sum/avg/min`, `find`, `insertMany` (→ `insertBatch`), `having(col,op,val)` (→ `having(array)`/`havingRaw`), variadic `select()`.
6. **Provider signatures** — `register()`/`boot()` take `ApplicationContext $context`; `mergeConfigFrom` → `mergeConfig`; `mountStatic` → `serveFrontend()`; container ids `@db`/`@cache` → `database`/`cache.store`.
7. **Middleware** — `handle()` must keep `mixed ...$params` (dropping it is a fatal). Non-existent aliases used: `cors`, `role`, `roles`, `cache:`, `admin_permission`. Real aliases: `admin, allow_ip, auth, auth_to_request, conditional_cache, csrf, enhanced_rate_limit, field_selection, filter, gate_permissions, lockdown, metrics, rate_limit, request_logging, require_scope, security_headers, session_cookie, tracing, validate`.
8. **String middleware params arrive as strings**: `rate_limit:N,W,user` (3rd param ignored), `csrf:300,true`, `request_logging:…,true` are silently ignored. Document `->rateLimit(attempts, perMinutes, tier, algorithm, by)` / `#[RateLimit]` instead. (Framework bugs too — see bottom.)
9. **Laravel-isms**: `Storage::put`, `Image::load`, `Analytics::track`, `view()`, `now()`, `logger()`, `http_client()`, `auth()->user()`, `$router->resource()`, `Model::find($id)`/`User::where(...)` without context, PSR-7 `getAttribute`/`getUploadedFiles`, `$app->add()`, `php artisan`.
10. **Helpers need context**: `has_service($context,$id)`, `base_path($context,…)`, `container($context)`; `config()` is not a setter; no context exists inside config files.
11. **Removed config/env (1.86/1.87)**: `FORCE_HTTPS`/`app.force_https`, `HSTS_HEADER`, `security.headers`, `SCHEDULE_QUEUE_*`, schedule `settings`/`queue_mapping`/per-job `timeout|retry_attempts|queue`, `MAIL_BCC`, `QUEUE_CONNECTION=sync|null`, `security.rate_limiter` block + `ENABLE_ADAPTIVE/DISTRIBUTED/ML_RATE_LIMITING` (1.20). `MAIL_HOST`/`MAIL_FROM` now required. **Config list merge now replaces, not appends (1.86, breaking)** — e.g. app `schedule.jobs` must re-include defaults (`webhook_cleanup`, `blob_purge`).
12. **Wrong env names**: `APP_URL`→`BASE_URL`; `JWT_SECRET`→`JWT_KEY`; `DB_DATABASE=:memory:`/`DB_CONNECTION`→`DB_DRIVER=sqlite`+`DB_SQLITE_DATABASE`; `QUEUE_DRIVER`, `CACHE_ENABLED`, `APP_TIMEZONE`, `APP_LOG_LEVEL`, `LOG_SAMPLING_RATE`, `SECURITY_HEADERS_ENABLED`, `API_METRICS_*`, `LOCK_REDIS_CONNECTION` — not read.
13. **Extracted to packages, still shown as core**: user-store routes (verify-email/otp, forgot/reset-password → `glueful/users`); RBAC (`glueful/aegis`); audit (`glueful/audit`); queue process/monitor (`Glueful\Extensions\QueueOps\*`); s3/gcs/azure disks (`glueful/storage-*`, 1.54); CDN purge (`glueful/cdn`); no SAML/LDAP in core.
14. **Stale ops notes**: the command-manifest "stale manifest breaks boot" warning is obsolete (self-heals since 1.81.2/1.87.0). Extensions enable/disable is allowed in production (1.79) and runs migrations first. No `config:cache`/`config:clear` commands exist.

## Per-page verdicts

### Priority 1 — REWRITE
| Page | Why |
|---|---|
| `3.features/rate-limiting.md` | Config moved to `api.rate_limiting` (tiers, `API_RATE_LIMITING_ENABLED`, `API_RATE_LIMIT_ALGORITHM`); `X-Adaptive-*`/`X-Distributed-*` headers fictional (real: `X-RateLimit-*` + IETF `RateLimit-*`); 429 body is `{error:'rate_limit_exceeded', message, retry_after, limit, tier}` with headers; client snippet reads `error.retry_after` wrongly. Add tiers/`TierResolver`, `#[RateLimitCost]`, bypass IPs, `RateLimitExceededEvent`. |
| `6.cookbook/4.error-handling.md` (1796 lines) | Built on invented `App\Exceptions\*` + custom handler. Real: `Glueful\Http\Exceptions\Client\*`/`Domain\*`, `RenderableException`, Handler `renderable()/map()/dontReport()/reportUsing()/mapChannel()`; envelope has `error.error_code`, no `error.type`; `ValidationException` → top-level `errors` (422); typed DB exceptions (1.76, unique violation → 409). ~half the page is generic JS/Vue. Rewrite as a concept page (essentials/advanced). |
| `6.cookbook/8.database.md` (1688 lines) | Wrong APIs throughout (`$schema->alter/build`, `MigrationManager->create/run/status`, `new SoftDeleteHandler()`, `ConnectionValidator->validate()`, `ExecutionPlanAnalyzer->analyze()`, `QueryPatternRecognizer->analyze()`); no 1.76 coverage. Fold transactions/soft-deletes → essentials/database, optimizer/profiler → advanced/performance, migrations → essentials/migrations; delete the rest. |

### Priority 2 — MAJOR UPDATE
| Page | Key fixes |
|---|---|
| `1.getting-started/index.md` | Port 8000/localhost; skeleton tree has no `app/Services`; drop "adaptive rate limiting with behavior analysis" (removed), "PSR-15 middleware" (bridge only), RBAC/audit as core, "other PDO databases". |
| `2.essentials/1.routing.md` | L178–223 OpenAPI docblocks are inert since 1.57 → document `reflect` generator + `#[ApiOperation]`, `#[QueryParam]`, `#[ApiRequestBody]`, `#[ApiResponse]`, `RequestData`/`ResponseData`. List all 19 aliases; add `->rateLimit()`, `#[RateLimit]`, `#[Middleware]`, `#[Fields]`, `#[RequireScope]`, `#[ResponseStatus]`, routes/*.php auto-load (`_`-prefixed skipped), `route:debug`, API prefix config. |
| `2.essentials/2.authentication.md` | Account endpoints → `glueful/users`; paths are API-prefixed (`/api/v1/auth/...`); refresh TTL 7 days (604800), not 30; remove `force_https`; `roles` alias doesn't exist; stop writing `users` directly. Add cookie session transport (`SESSION_COOKIE_ENABLED`, `/auth/session/refresh|logout`), API keys + `#[RequireScope]`. |
| `2.essentials/6.database.md` | `$this->db` → `db($context)`; `pluck/insertBatch/upsert/paginate` DO exist; `insert()` row count; no `sum/avg/min`; `having(array)`; transactions; built-in `withTrashed/onlyTrashed/restore/forceDelete`. Add ORM, `whereLike/whereJsonContains/whereContains`, typed exceptions, reconnect, `idempotentRead()`. |
| `3.features/caching.md` | Stampede protection only via `CacheHelper::remember(...)`, not driver `remember()`; defaults `CACHE_DRIVER=file`, `CACHE_FALLBACK=true`; file path `CACHE_FILE_PATH` → `<app>/storage/cache` (1.90); add `prefix/ttl/lock_ttl/enable_tags/distributed/array` store; Memcached `deletePattern()` returns false; prefer injecting `CacheStore`. Add `cache:*` CLI. |
| `3.features/cors-csrf.md` | Framework ships `config/cors.php`; document `CORS_ALLOWED_ORIGIN_PATTERNS` (wildcards in `CORS_ALLOWED_ORIGINS` don't work), `CORS_SUPPORTS_CREDENTIALS` default false; key is `allow_headers`; CSRF lifetime 3600; updated exempt list; `allow_missing_origin`, `skip_for_bearer_auth`; `csrf:` params ignored; token at `data.token`; CSRF bound to session (1.73). |
| `3.features/events.md` | Built-in events use getters (`getRequest()`, `getStatusCode()`, `getUserUuid()`, `getUsername()`, `getSql()`…), not public props. Remove `Analytics::track`, `$this->post()` test helper. Add `dispatchOrFail()`, listener-exception isolation, priorities, webhook/security/entity events. Note: `#[AsListener]` exists but is not wired; `config/events.php` `listeners` holds flags, not a class→listener map (framework CLAUDE.md claims otherwise — fix that too). |
| `3.features/queues-jobs.md` | `$this->context`; `--once` = one job (drain = `--stop-when-empty`); document all `queue:work` flags; add `queue:failed|retry|forget|flush` (1.86), `queue:restart` (1.89) in deploy step; `failed.max_retries/retention_days`; payload HMAC signing (`QUEUE_PAYLOAD_SIGNING`), `JobInterface` requirement (1.56), `Job::release()` retries. |
| `3.features/scheduling.md` | Handlers must extend `Glueful\Queue\Job`; remove per-job `timeout/retry_attempts/queue`, `settings`, `queue_mapping`, and the whole env-var section (none read); list-replace note; day-of-week contradiction; document `history/add/remove/enable/disable`. |
| `3.features/notifications.md` | Enable via `extensions:enable email-notification`; `Notifiable` example missing 2 required methods (fatal); config file is `config/emailnotification.php` and `MAIL_QUEUE_*`/`processing`/`extension_mappings` gone; async via `NotificationQueueDispatcherInterface`; table `queue_failed_jobs`; `send()` statuses; add database channel, idempotency, `sendSplit()`. |
| `3.features/file-uploads.md` | `->uuid()` (private prop); Flysystem v3 `write/read/fileExists`; remove `getMetadataExtractor()/analyze()`; `Glueful\Validation\ValidationException`; `uploads.max_size/allowed_types` precedence; cloud disks need `glueful/storage-*`; signing via `NativeSignedUrlProviderInterface`. Add blob HTTP API, blob policy seams, EXIF stripping, `blobs:purge`/`UPLOADS_PURGE_DELETED_AFTER_DAYS`. |
| `4.advanced/configuration.md` | Full config-file list; `BASE_URL`, `JWT_KEY`, `DB_SQLITE_DATABASE`; invented `app.paths`; merge semantics (list replace, `ConfigurationLoader`); no `config:cache`; `database.engine` shape; removed keys; `capabilities.php`; real tooling `doctor`, `env:sync`, `system:env:validate`, `config:dsn:validate`. |
| `4.advanced/testing.md` | Boot per test; `actingWith*` returns uuid + `InMemoryPermissionProvider`; no `beginTransaction`; `DB_DRIVER=sqlite`; PHPUnit 10 attributes; `Framework::boot` state gotchas; `scaffold:test`. |
| `6.cookbook/2.middleware.md` | Fatal `handle()` signatures; fake aliases; nonexistent `ServiceProviderInterface`/`ContainerBuilder`/`RateLimiterMiddleware`; wrong error envelope. Trim L239–414 (dup of advanced/middleware) to authoring only. |
| `6.cookbook/7.logging.md` | Prefer `LoggerInterface` over `LogManager::getInstance()`; DB table `activity_logs`; `configureN1Detection()` not public → point to `DB_LAZY_LOADING_MODE`; real env `LOG_LEVEL/LOG_CHANNEL/LOG_TO_DB/LOG_TO_FILE/LOG_ROTATION_*/LOG_RETENTION_*`; add `auth`/`security` channels. |
| `6.cookbook/11.queues-and-jobs.md` | `Glueful\Extensions\QueueOps\*` namespaces; real schema (12-char uuid, `batch_uuid`, TIMESTAMP, `queue_batches`); lock-free claim (not row locks); string job names refused; `all()/retryAll()/prune($daysOld)`; drop `QueueMonitoringService`, `queue_jobs_completed`, `worker_options/auto_scaling/pool_size`. Consider merging the remainder into features/queues-jobs. |
| `6.cookbook/18.permissions-and-authorization.md` | No `$router->resource()`; `gate_permissions` auto-attached from `#[RequiresPermission]/#[RequiresRole]`; `PolicyInterface` is `view/create/update/delete(UserIdentity, mixed, Context): ?bool`; `PermissionProviderInterface` has ~17 methods; Symfony request attributes / `'user'` principal. Add `permissions:list|diff|sync`, provider `permissions()/roles()/voters()/policies()`. |
| `6.cookbook/20.api-metrics.md` | `/metrics/*` routes not registered by core; `API_METRICS_*` env vars don't exist (only `METRICS_DATABASE_STORE`); metrics tables are core migrations. |
| `6.cookbook/21.performance.md` | PSR-15 middleware example; `QueryOptimizer` ctor; select API; `query_cache` config; `QueryCacheService` ctor; `db:profile` args; `LogManager` misuse; `cacheResponse(key, cb, ttl, tags)`; fictional `getPermissionAwareCacheKey/cacheForCDN/cacheWithTags`; `cache.response_caching` config; `Glueful\Logging\Logger`. Overlaps advanced/performance — merge. |
| `6.cookbook/22.memory-management.md` | `MemoryAlertingService` ctor/config fiction (real: `app.performance.memory.alerting`); L550–715 tracing/monitoring section is fiction — replace with `Glueful\Observability\Tracing\*` + `tracing`/`metrics` aliases, or delete. Top half OK. |
| `6.cookbook/25.extensions.md` | Fatal `register()/boot()` signatures; `extra.glueful.migrations` required since 1.80 (else `UndeclaredSchemaException`); flat `migrations/`; `mountStatic` → `serveFrontend()`; container ids; prod enable allowed + migrates. Add `DeclaresLoadOrder`, provider permission hooks, `config/extensions.php` `protected/install`, admin install API, `migrate:verify --adopt`. |
| `8.cli-reference.md` | Undocumented: `apikey:*`, `blobs:purge`, `commands:cache`, `dev:server`, `encryption:*`, `env:sync`, `event:create|listener`, `generate:client`, `migrate:verify`, `queue:failed|retry|forget|flush|restart`, `scaffold:dto`, `storage:test`, `system:env:validate|memory|production`, `webhook:cleanup`; full `queue:work` flags; `extensions:enable --dry-run --backup`; drop manifest note. Optional: extension-shipped commands section. |
| `9.extensions.md` | Add missing packages: `audit`, `flags`, `i18n`, `import-export`, `commerce`, `subscriptions`, `storage-s3/gcs/azure`. Install ≠ enable (`extensions:enable`, which migrates). |

### Priority 3 — MINOR FIXES
- `content/index.md` — hero `curl /api/posts` assumes a prefix app routes don't get.
- `1.getting-started/1.installation.md` — port 8000; skeleton ships + enables `glueful/users`; engine-agnostic `install` (1.60).
- `2.essentials/index.md` — `getConnection()` only on BaseRepository; auth needs a user store.
- `2.essentials/4.requests-responses.md` — `$this->db`; JSON bodies vs `$request->request`; add typed DTOs, `#[FromRoute]/#[FromQuery]`.
- `2.essentials/5.controllers.md` — real properties; `insertGetId()`.
- `2.essentials/7.validation.md` — 25 rules not 8; add `RequestData` + `#[Rule]` auto-422, `#[Validate]`, `scaffold:request|dto`.
- `2.essentials/8.migrations.md` — fluent chains need `->end()` (else TypeError); callback form is canonical, not "replaced"; add `PLATFORM=-50` priority, `extension_operations` + notification tables, `hasTable()`, `migrate:verify`.
- `3.features/index.md` — `Glueful\Events\Event` doesn't exist (→ `EventService`); neutral table; add Webhooks/Encryption/API keys/browser sessions.
- `3.features/distributed-locks.md` — `LOCK_DB_CONNECTION`; drop `LOCK_REDIS_CONNECTION`; `locks` migration.
- `3.features/field-selection.md` — no `date()` transform; config under `api.field_selection` (`enabled`, `whitelists`); add `#[Fields]` options, `FieldSelector` injection, transformations, `X-Fields-Tree`, `fields:*` CLI.
- `4.advanced/dependency-injection.md`, `service-providers.md`, `middleware.md`, `repositories.md`, `performance.md`, `index.md` — signature/alias/shape fixes (paginate shape; `alterTable`; `insertBatch`; baseline security headers since 1.87; full provider list; drop "configuration caching").
- `6.cookbook/index.md` — update after merges.
- `6.cookbook/1.routing.md` — health/auth/resource route lists stale (`/data/{table}`, `index/show/store/update/destroy`, bulk routes, `/refresh-token`).
- `6.cookbook/5.security.md` — env names; baseline headers; registration via `glueful/users`.
- `6.cookbook/6.configuration.md` — broken snippet L594–601; no "unknown option" error.
- `6.cookbook/10.caching.md` — no `round-robin` strategy; `getHealthyNodesForKey()`; redis `options/pool` unread; merge L223–300 into features/caching.
- `6.cookbook/13.notifications.md` — no `config/mail.php` (→ `services.php` `mail.mailers`); `notifications.php` optional; no `http_client()`.
- `6.cookbook/15.storage.md` — `glueful/storage-*` packs; `getSignedUrl()`; `config()` not a setter.
- `6.cookbook/16.image-processing.md` — `Glueful\Http\Exceptions\Domain\BusinessLogicException`; Symfony request files; remote fetch needs `allowed_domains`.
- `6.cookbook/19.sessions-analytics.md` — ctor args; resolve from container; no SAML.
- `6.cookbook/23.console-commands.md` — `container($context)`; `registerCommandClass()`/`commands()`/`discoverCommands()`; drop manifest warning; document prompt/progress helpers.
- `7.api-reference.md` — no `$this->db`.
- `contributing.md` — test tree; `bin/glueful`; CI parity (`composer run ci`, PHPStan 8.3); `dev` branch; `UPGRADE.md`.

### OK
`2.essentials/3.identity.md` (nits: `UserRecordEnricherInterface`, API prefix), `5.tooling/*`.

## Structural recommendations
- **Remove/merge**: cookbook database → essentials/database + advanced/performance + essentials/migrations; cookbook performance → advanced/performance; cookbook error-handling → new concept page; cookbook queues remainder → features/queues-jobs; cookbook caching L223–300 → features/caching; cookbook middleware L239–414 trimmed.
- **New pages**: Error handling & exceptions; API keys & scopes; Typed requests/responses (DTOs) + OpenAPI (reflect generator); ORM models (+ N+1 detector); Browser sessions (cookie transport + CSRF); Webhooks; Upgrading / breaking-changes guide (1.52→1.90).
- **releases.md**: current through 1.90.0 but 3317 lines — move v1.50–v1.69 (~L2037–3317) to releases-archive and update the archive description.

## Framework bugs surfaced (separate from docs)
- `CSRFMiddleware::handle()` checks `is_int`/`is_bool` on router params that are always strings → `csrf:` params ignored.
- `RequestResponseLoggingMiddleware` — same string/bool issue.
- `EnhancedRateLimiterMiddleware` ignores the 3rd `rate_limit:` param (by key) — doc-or-feature decision.
- `src/Console/Commands/System/CheckCommand.php:217` still reads `JWT_SECRET` (should be `JWT_KEY`).
- `#[AsListener]` exists but is unwired; framework `CLAUDE.md` documents an `events.listeners` class map that isn't implemented.

## Docs status (2026-10-27)
Docs now target framework **1.91** (framework `dev` HEAD) — publish together with the 1.91 release.
New pages: /essentials/orm, /essentials/typed-io, /advanced/openapi, /features/api-keys,
/features/browser-sessions, /features/webhooks, /upgrading. cookbook/database removed (split).
releases.md: add the 1.91 entry at release time.

## Framework bugs found during the 1.91 docs pass (resolved)
All fixed in framework 1.91.0 / 1.91.1 (2026-10-27) and the docs updated to match; kept as a record.
Found later and fixed for 1.91.2: `db:seed` couldn't build app seeders; `Model::factory()->create()`
had no context. Still open outside the framework: cookie login + 2FA completion in `glueful/users`
doesn't set session cookies.

ORM (src/Database/ORM) — highest impact
- Models with default `$timestamps = true` and no datetime casts fail on save(): DateTimeImmutable bound to PDO.
- `scaffold:model` emits `protected bool $timestamps`; trait declares it public (fatal; read-only finding).
- SoftDeletes trait: withTrashed() still hides trashed, onlyTrashed() empty; instance forceDelete() soft-deletes,
  restore() no-op, trashed() stays false; Builder::forceDelete() soft-deletes on any table with deleted_at.
- belongsToMany: with() throws (pivot join skipped); detach($ids)/sync() don't detach.
- withCount() no-op; whereHas() ignores its constraint closure; loadCount() dirties {rel}_count so save() fails.
- ORM paginate() returns raw rows and ignores with().
- boot() restoring/restored/trashed callbacks dropped; returning false from a callback doesn't cancel.
- AsEncryptedString uses ENCRYPTION_KEY + AES-256-CBC, not APP_KEY / EncryptionService.

Webhooks (src/Events/Webhook, src/Api/Webhooks)
- Tables created only inside WebhookDispatcher::dispatch(); Webhook::subscribe() fails on a fresh DB (no migration?).
- WebhookEventListener never registered → #[Webhookable] / DispatchesWebhooks do nothing; Webhookable only/except and dispatch $options unused.
- WebhookController has no shipped routes.
- Unread config: webhooks connection, signature_header, signature_algorithm, retry.backoff.
- WebhookDeliveryService signs differently (X-Glueful-Signature: sha256=…) from subscription deliveries.

Auth / sessions / CSRF
- CSRF exemptRoutes don't strip API_PREFIX → shipped `webhooks/*`, `auth/login` likely don't match /api/v1/... paths.
- Session refresh/logout: SameOriginGuard rejects Sec-Fetch-Site: same-site (app.example.com → api.example.com).
- Core /auth/login never sets session cookies (apps must write their own login handler).
- Login csrf_token is fingerprint-bound (createUserSession returns no sid) → likely fails on session-authenticated writes.
- CSRFMiddleware ignores auth_transport: skip_for_bearer_auth treats the cookie-injected Authorization header as bearer.
- security.api_keys.allow_query_param read in code but missing from shipped config/security.php.
- AuthToRequestAttributesMiddleware passes a raw string `scope` claim into UserIdentity's array param (TypeError swallowed).

Events
- subscribe()/#[AsListener] with a container: listener resolved as '@Class:method' service; unregistered class fails at dispatch (logged, skipped) — fall back to instantiation/autowire.
- Framework CLAUDE.md documents a config/events.php `listeners` class map that doesn't exist.

Notifications / queue
- Scheduled notifications don't store `channels`; processScheduledNotifications() uses default_channels → scheduled email fails (no_recipient).
- Container-built FailedJobProvider ignores queue.failed.retention_days (autowired, 30d).
- QueueMaintenance isn't a scheduled job → failed jobs never pruned automatically.

Database / validation / misc
- QueryBuilder withPurpose() value never reaches logs; builder logger has no context → QueryExecutedEvent never dispatched.
- MySQL ssl.* config unread.
- `uuid` validation rule rejects v6/v7 UUIDs.
- OpenAPI: under the default /api prefix every tag likely "Api" (read-only finding); generate:openapi --clean wipes hand-authored fragments.
- Routing ValidationMiddleware has no alias (`validate` → Glueful\Validation\Middleware\ValidationMiddleware).
- TRACING_DRIVER unread.
- Overdue removals: Utils::buildSearchConditions(), FailedJobProvider::setMaxRetries() (announced for 1.88).

Skeleton (done for 1.91.1; the skeleton has no observability.php): security.php exemptRoutes `webhooks/*` → `webhooks/inbound/*`; schedule.php scheduled_notifications + queue_maintenance; observability.php drop tracing driver/service keys; auth.php/.env.example refresh path; database.php `:memory:`
(+ delete stray `:memory:` file); drop removed cache/lock/capabilities keys.
