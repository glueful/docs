---
title: Release Notes
description: Curated highlights, migration guidance, and structured summaries of Glueful framework releases.
---

> This page is a curated layer over the raw authoritative `CHANGELOG.md`. For complete detail (including every Added/Changed/Removed/Fix line) consult the full changelog.

## v1.65.1 - Acrux
**Released: July 1, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-bug"}
#description
**Extension-toggle and CLI hygiene fixes.** `php glueful extensions:enable`/`disable` no longer leave a stray trailing-whitespace line in `config/extensions.php` (which tripped phpcs/CI on the very next lint), and four console commands that were unrunnable due to option-shortcut clashes with Symfony's globals now start cleanly. **Patch** — bugfixes only, no new env, no migrations, no behavioral changes.
::

### Key Highlights

::card
#title
`extensions:enable`/`disable` write clean config
#description
`ExtensionStateWriter::writeList()` captured the whitespace before the closing bracket and re-emitted a literal indent in front of it, producing a dangling 4-space line above `]` on every toggle — which then failed `Squiz.WhiteSpace.SuperfluousWhitespace` in phpcs/CI. The writer now folds that whitespace into the match and writes the closing indent and bracket cleanly, so toggling an extension no longer dirties the file with a lint violation.
::

::card
#title
Console commands no longer clash with global shortcuts
#description
Four commands declared option shortcuts that collided with Symfony's reserved globals, so the definition merge threw `An option with shortcut "…" already exists` on both run and `help` — making the command unrunnable. `serve --queue` dropped its `-q` (clashed with `-q/--quiet`), `cache:expire --verify` and `di:container:compile --validate` dropped their `-v` (clashed with `-v/--verbose`), and `install --quiet` (meaning "non-interactive", not "suppress output") was renamed `--unattended`. All long options are preserved; only the colliding shortcuts changed.
::

### Migration Notes

- **Nothing required.** Pure bugfix patch — no new env, no migrations, no behavioral changes. If you scripted `php glueful install --quiet` for unattended installs, switch it to `--unattended` (the global `-q/--quiet` now resolves normally on that command).

```bash
composer update glueful/framework
```

## v1.65.0 - Acrux
**Released: June 30, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-database"}
#description
**Database, validation, and routing improvements.** New `QueryBuilder::forceDelete()` (hard-delete on a soft-deletable table without dropping to raw SQL), validator coercion rules (`CastToInt` / `CastToBoolean` / `CastToDate`), a `DbUnique` exclude-by-column argument, an `api_key_uuid` request attribute for per-key attribution, and `ServiceProvider::resetLoadedRoutes()` for clean re-boots. Plus three routing/schema fixes — `auth.user` is always populated after auth, file-defined `require_scope:` params are now enforced, and `alterTable()->dropColumn()` actually drops. **Minor** — no new env, no migrations; scope enforcement is tightened (see Migration Notes).
::

### Key Highlights

::card
#title
Database & validation toolbelt
#description
`QueryBuilder::forceDelete()` permanently deletes matching rows, bypassing soft-delete even on a table with a `deleted_at` column — previously the only way to hard-delete such a row (e.g. to re-insert a unique key during an upsert) was raw SQL. New `MutatingRule`s — `CastToInt`, `CastToBoolean`, `CastToDate` — let a validator pipeline both coerce and validate (`filtered()` used to return uncoerced input). And `DbUnique` gains a fifth `$exceptColumn` argument (default `'id'`) so a record keyed by a non-`id` column like `uuid` can exclude the current row on update.
::

::card
#title
Routing & schema correctness
#description
`AuthMiddleware` now always populates `auth.user` — it synthesises a basic `UserIdentity` (uuid, roles, scopes) when the optional enricher hasn't run, so permission gates and audit attribution never silently see a null principal. `RequireScopeMiddleware` now enforces scopes declared as a middleware param (`->middleware('require_scope:read:content')`) fail-closed; it previously fell open when no `#[RequireScope]` attribute was present. And `TableBuilder::alterTable()` now forwards `dropColumn()` to the SQL generator (it was a silent no-op). Also new: `ApiKeyAuthenticationProvider` exposes the acting key's `api_key_uuid`, and `ServiceProvider::resetLoadedRoutes()` lets a fresh `Framework::boot()` re-register extension routes.
::

### Migration Notes

- **Scope enforcement tightened.** If you declared a route's scope as a middleware param — `->middleware('require_scope:read:content')` — it was previously **not** enforced (it fell open) and now enforces **fail-closed**. Requests lacking the scope will correctly receive `403`. Routes using the `#[RequireScope]` attribute are unaffected. Everything else is additive — no new env, no migrations.

```bash
composer update glueful/framework
```

## v1.64.0 - Zosma
**Released: June 28, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-key"}
#description
**Configurable, auditable API keys — plus webhook and blob-visibility fixes.** `ApiKeyService` now reads its brand prefix from config (`API_KEY_PREFIX`, default `gf`) so apps can rebrand generated keys, and its create/rotate/revoke paths emit framework entity events so key lifecycle is auditable (identity only, never the secret). Also fixes three latent webhook-management bugs and a blob-visibility bug where "public" uploads were stored private and 401'd on retrieval. **Minor** — one new optional env (`API_KEY_PREFIX`), backward compatible, no migrations.
::

### Key Highlights

::card
#title
Rebrandable, auditable API keys
#description
The generated key prefix is no longer hard-coded: `ApiKeyService` reads `auth.api_keys.prefix` (env `API_KEY_PREFIX`, default `gf`), so `gf_live_…` can become `lm_live_…` per app (only the first 16 chars are the indexed lookup prefix, so keep it short). And `create` / `rotate` / `revoke` now emit `EntityCreatedEvent` / `EntityUpdatedEvent` for the `api_keys` table — an audit consumer can record who minted, rotated, or revoked a key. The payload is identity only (uuid, name, key_prefix, scopes) and never carries the plaintext or hash; dispatch is best-effort, so a failed audit never breaks the key operation.
::

::card
#title
Webhook management + blob visibility fixes
#description
Three latent webhook bugs are fixed (the core ships `WebhookController` but doesn't register its routes, so they surfaced only once an app mounted them against PostgreSQL): list endpoints 500'd on the strict query validator (`OFFSET` before `LIMIT`), `WebhookSubscription` inserts failed on PostgreSQL (timestamps bound through the string path), and the auto-created UUID columns were too narrow for the generated ids. Separately, `FileUploader` now persists the requested blob `visibility` — previously every upload fell back to `private`, so a "public" image 401'd on `GET /blobs/{uuid}`.
::

### Migration Notes

- **Nothing required.** Backward compatible: `API_KEY_PREFIX` defaults to `gf` (reproduces existing keys), and no migrations ship. Set `API_KEY_PREFIX` only if you want to rebrand keys. To audit key lifecycle, ensure an audit consumer is listening for the `api_keys` entity events.

```bash
composer update glueful/framework
```

## v1.63.5 - Yildun
**Released: June 27, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-api"}
#description
**The webhook management API is now fully typed in OpenAPI.** 1.63.4 added operation summaries to `WebhookController`; this fills in the schemas — query parameters, request bodies, and response shapes — so an application that mounts the controller gets a precise spec (and a typed client) for subscriptions and deliveries, not just path stubs. **Patch** — documentation metadata only (new doc-only DTOs + attributes), no behavioral change, no new env, no migrations.
::

### Key Highlights

::card
#title
Typed query params, bodies, and responses for webhooks
#description
Added `#[QueryParam]` for the list/stats query parameters (active / status / subscription / page / per_page / days), `#[ApiRequestBody]` for create/update, and `#[ApiResponse(schema: …)]` for the subscription, delivery, list, and stats responses — backed by new documentation-only DTOs under `Glueful\Api\Webhooks\DTOs`. The controller's runtime behavior is unchanged; the DTOs are reflected for docs only (never hydrated), the same approach the auth controller uses for `login`.
::

### Migration Notes

- **Nothing required.** Documentation metadata only. After `composer update`, re-run `generate:openapi` (and your client codegen) to pick up the fully-typed webhook endpoints.

```bash
composer update glueful/framework
```

## v1.63.4 - Yildun
**Released: June 27, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-api"}
#description
**The webhook management API is now self-documenting.** The framework ships a complete `WebhookController` (subscription + delivery management), but its methods carried no OpenAPI attributes — so an application that mounts these routes got working endpoints that were invisible to `generate:openapi` and the typed client. All 11 endpoints now carry `#[ApiOperation]`/`#[ApiResponse]`. **Patch** — documentation metadata only, no behavioral change, no new env, no migrations.
::

### Key Highlights

::card
#title
`WebhookController` endpoints appear in generated docs
#description
The 11 webhook-management methods — subscription list/create/get/update/delete, rotate-secret, test, stats, plus delivery list/get/retry — now carry `#[ApiOperation]` + `#[ApiResponse]` attributes. Applications that mount the controller (the core does not auto-register these routes) pick them up in `openapi.json` and the typed client, exactly like any other annotated controller. Nothing about the routes, behavior, or signatures changed.
::

### Migration Notes

- **Nothing required.** Documentation metadata only. After `composer update`, re-run `generate:openapi` (and your client codegen) to surface the webhook endpoints in your spec.

```bash
composer update glueful/framework
```

## v1.63.3 - Yildun
**Released: June 26, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-bug"}
#description
**Blob writes are now auditable.** `BlobRepository` was constructed without an `ApplicationContext`, so its create/update/delete never dispatched entity events — blob **uploads emitted no `EntityCreatedEvent`** and silently couldn't be audited. It's now built with the context, so uploads emit events an audit/activity consumer can record. **Bugfix patch** — no new env, no migrations.
::

### Migration Notes

- **Nothing required.** Bugfix only.

```bash
composer update glueful/framework
```

## v1.63.2 - Yildun
**Released: June 26, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-bug"}
#description
**Image-variant caching fix.** Serving a resized blob variant (`GET /blobs/{uuid}?width=…`) with the variant cache enabled returned a 500: `UploadController` cached the rendered image as **raw bytes**, which a JSON-based cache serializer (e.g. the Redis driver's `SecureSerializer`) can't encode — raw bytes aren't valid UTF-8 — so every cached resize threw `Malformed UTF-8`. The un-resized original was unaffected. **Bugfix patch** — no new env, no migrations.
::

### Key Highlights

::card
#title
Resized image variants are cached correctly
#description
The rendered variant is now stored **base64-encoded** and decoded on read, so the binary survives any cache serializer (JSON or otherwise). A legacy/corrupt cache entry that fails to decode simply falls through to a re-render. Lets you keep `UPLOADS_CACHE_ENABLED=true` for on-the-fly thumbnails/resizes without the serializer choking on image bytes.
::

### Migration Notes

- **Nothing required.** Bugfix only; no env or config changes, no migrations.

```bash
composer update glueful/framework
```

## v1.63.1 - Yildun
**Released: June 25, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-bug"}
#description
**Resilient event dispatch + dead auth events.** Auth/security events (logins, logouts, failed logins, security violations) were silently not reaching their listeners: `ActivityLoggingSubscriber` — the first listener on every auth/security event — was unresolvable (it required a `LogManager` the container never registers), so it threw; and the dispatcher didn't isolate listener failures, so that one throw aborted the whole dispatch before any later listener ran. The session dispatcher swallowed the error, so logins succeeded with nothing logged. **Bugfix patch** — no new env, no migrations.
::

### Key Highlights

::card
#title
A throwing listener no longer starves the rest of the chain
#description
`EventDispatcher::dispatch()` now catches each listener's `Throwable`, logs it, and continues to the next listener (hot and traced paths). Previously the first listener to throw — a resolution failure or a runtime error — ended dispatch for that event entirely, silently starving every listener after it (cache invalidation, an audit/notification subscriber, …). One broken or misconfigured listener can no longer take the whole event down with it.
::

::card
#title
`ActivityLoggingSubscriber` is resolvable again
#description
It required a non-nullable `LogManager`, which is not a container-registered service, so the autowiring resolver couldn't construct it — making the subscriber throw on every auth/security event. Its constructor now takes `?LogManager $logger = null` and falls back to `LogManager::getInstance()`. Combined with the dispatcher fix, login/logout/security events are delivered to all listeners again — the framework's own activity logging plus any app or extension subscriber (e.g. `glueful/audit`).
::

::card
#title
Failed logins now emit `AuthenticationFailedEvent`
#description
The event was declared and listeners subscribed to it, but nothing ever dispatched it — so failed login attempts were invisible to activity logging and audit consumers. `AuthenticationService::verifyCredentials()` now dispatches it (best-effort and context-guarded — it never breaks the login flow) when credentials are rejected (`invalid_credentials`) or the resolved account is disabled (`user_disabled`), carrying the attempted username plus the request's client IP and user-agent when available.
::

### Migration Notes

- **Nothing required.** Both are bugfixes; no env or config changes, no migrations.

```bash
composer update glueful/framework
```

## v1.63.0 - Yildun
**Released: June 25, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-broadcast"}
#description
**Entity-deletion event + subclass domain-event dispatch.** `BaseRepository` now emits an `EntityDeletedEvent` on a successful delete — completing the create/update/delete triplet so audit, cache-invalidation and notification consumers can react to deletes, not just writes. And the repository's event-dispatch helper is now `protected`, so repository subclasses (including those in extensions) can emit their own domain events through the same best-effort path. **Additive** — a new event (fires only if subscribed) plus a visibility widening; no env, no migrations.
::

### Key Highlights

::card
#title
`EntityDeletedEvent` completes the entity CRUD event triplet
#description
`BaseRepository::delete()` now dispatches `Glueful\Events\Database\EntityDeletedEvent` after a successful delete (`affected_rows > 0`). It carries the **pre-delete** record — read before the row is removed — so consumers can derive the deleted entity's identity and labels, plus metadata matching the create/update events (`entity_id`, `primary_key`, `affected_rows`, `operation: 'delete'`). It mirrors `EntityCreatedEvent`'s surface (`getEntity()` / `getEntityId()` / `getTable()` / `getCacheTags()` / `isUserRelated()`, with a `getOriginalData()` alias). No-op deletes (missing row, zero affected) emit nothing. Audit trails, cache invalidation, and notifications can finally react to deletes as first-class events.
::

::card
#title
Repository subclasses can emit their own domain events
#description
`BaseRepository::dispatchEvent()` is now `protected` (was `private`), so repository subclasses — including those in extensions — can emit their own semantic domain events through the framework's best-effort, context-guarded dispatch helper (it no-ops when the repository was constructed without an `ApplicationContext`). This is the seam an RBAC or audit extension uses to publish meaningful events (e.g. "role assigned") instead of raw table writes. No behavior change for existing repositories.
::

### Migration Notes

- **Nothing required.** Both changes are additive; behavior is unchanged unless you subscribe to the new event or emit one from a subclass.

```bash
composer update glueful/framework
```

## v1.62.0 - Xuange
**Released: June 24, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-puzzle"}
#description
**User-record enrichment seam.** A new core contract lets an authorization extension attach fields — like a user's `roles` — to the records an identity store returns (`/users`, `/users/{uuid}`, `/me`), without the two extensions depending on each other. The read-side symmetric of the existing login-time `identity.claims_provider` seam. **Additive** — nothing changes unless an extension registers an enricher; no env, no migrations.
::

### Key Highlights

::card
#title
`UserRecordEnricherInterface` + the `users.record_enricher` tag
#description
An enricher receives a **batch** of user UUIDs and returns additive fields to merge per record (e.g. `{ roles: [...] }`). A consumer — the identity store's read endpoints — collects every service tagged `users.record_enricher` and folds their output into each user record. Implementations must resolve the whole batch in one query (no N+1) and may only **add** fields (they can't change identity facts). It mirrors `IdentityClaimsProviderInterface`, which enriches the authenticated principal at login; this enriches arbitrary read payloads. The upshot: `glueful/users` can show each user's roles inline (no extra round-trip, no click) while staying fully decoupled from `glueful/aegis`.
::

### Migration Notes

- **Nothing required.** The contract is additive; behavior is unchanged until an extension registers an enricher.

```bash
composer update glueful/framework
```

## v1.61.2 - Wezen
**Released: June 23, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-lock-exclamation"}
#description
**Permission gate fail-closed fix.** Every `#[RequiresPermission]` / `gate_permissions` route returned **403 for fully authorized users** — the `auth.user` principal the gate reads was never populated because `AuthMiddleware`'s enricher lookup used a container id that never matched, so the enricher silently never ran. Routes guarded by attribute permissions (admin/RBAC/i18n endpoints) were unreachable. **Bugfix patch** — no new env, no migrations.
::

### Key Highlights

::card
#title
`#[RequiresPermission]` routes no longer 403 authorized users
#description
`AuthMiddleware::autoEnrichRequest()` looked up the `auth.user` enricher by a **leading-backslash** string id (`'\Glueful\Permissions\Middleware\AuthToRequestAttributesMiddleware'`), but the container registers it under the `::class` form (no leading backslash) and does not normalize the two — so `Container::has()` returned false, the enricher never ran, and the `auth.user` `UserIdentity` was never set. `GateAttributeMiddleware` then saw a null principal and denied. The lookup now uses `AuthToRequestAttributesMiddleware::class`, matching the container key, so the gate sees the authenticated principal and authorizes correctly.
::

::card
#title
File / Memcached cache drivers accept colon-namespaced keys
#description
`FileCacheDriver` and `MemcachedCacheDriver` rejected `:` as a PSR-16 reserved character, but the framework namespaces every cache key with a colon (`session:`, `provider:`, `user_permissions:`). Login on a file or Memcached backend failed the moment `SessionCacheManager` stored the session. Both drivers now allow `:`, matching Redis (the file driver md5-hashes keys into filenames; colons are valid Memcached keys).
::

### Migration Notes

- **Nothing required.** Bugfix only.

```bash
composer update glueful/framework
```

## v1.61.1 - Wezen
**Released: June 22, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-world-www"}
#description
**CORS on every response.** Cross-origin **error** and regular responses (422, 401, …) now carry `Access-Control-Allow-Origin`, so a separately-served frontend (e.g. a Vite dev SPA on another origin) can finally read their bodies. Previously only the OPTIONS preflight got CORS headers, leaving regular and error bodies blocked by the browser. **Bugfix patch** — no new env, no migrations, no action required.
::

### Key Highlights

::card
#title
CORS headers on regular and error responses
#description
`Application::handle()` now applies CORS to the **final** response in both the dispatch and exception-handler branches — the single chokepoint that sees success **and** error paths. A new public `Cors::applyToResponse(Request, Response)` decorates an already-built response with the regular-request CORS headers (`Access-Control-Allow-Origin`, `Vary: Origin`, and per-config `Expose-Headers` / `Allow-Credentials`). It is a no-op when there is no `Origin`, the origin is not allowed, or the header is already set — so it never clobbers the router's preflight responder.
::

### Migration Notes

- **Nothing required.** Same-origin requests and disallowed origins are unchanged; allowed cross-origin requests now receive the CORS headers they should always have had on regular and error responses.

```bash
composer update glueful/framework
```

## v1.61.0 - Wezen
**Released: June 20, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-tags"}
#description
**OpenAPI tag filtering.** The doc generator can now drop operations from the generated spec by **tag** (`documentation.options.tags.include` / `.exclude`, env-driven), so a consumer-facing spec can hide infrastructure groups (`Health`, `Documentation`, `Security`) without turning off whole route sources. **Additive and off by default** (empty lists = no filtering) — no breaking changes, no migrations.
::

### Key Highlights

::card
#title
Tag allow/deny for the OpenAPI spec
#description
New `documentation.options.tags.include` (allow-list; empty = keep all) and `.exclude` (deny-list; wins over include), set via `API_DOCS_INCLUDE_TAGS` / `API_DOCS_EXCLUDE_TAGS`. Operations are filtered *before* the spec is written, so dropped operations take their now-unreferenced tags **and** schemas with them. This lets you expose the framework/extension routes a consumer needs while hiding infra groups — finer-grained than the all-or-nothing `include_framework_routes` / `include_extensions` switches. The core is a pure, unit-tested static `DocGenerator::filterPathsByTags()`.
::

::card
#title
Doc-config cleanup
#description
Removed the dead `documentation.paths.route_definitions` and `extension_definitions` keys. They pointed at the (removed) comment generator's `json-definitions/{routes,extensions}/` output dirs and were never read by the reflect generator, which merges only top-level `docs/json-definitions/*.json` fragments.
::

### Migration Notes

- **Nothing required.** Filtering is off by default (both lists empty). To use it, set e.g. `API_DOCS_EXCLUDE_TAGS="Health,Documentation,Security"` and regenerate the spec.
- The removed `route_definitions` / `extension_definitions` config keys were already inert — safe to delete if you copied them into your app's config.

```bash
composer update glueful/framework
```

## v1.60.0 - Vega
**Released: June 19, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-database-cog"}
#description
**Engine-agnostic installer + first-run setup seams.** `php glueful install` now configures and migrates **any** database engine (MySQL/PostgreSQL/SQLite) — not just SQLite — and a new `Glueful\Installer\` toolkit lets an app drive first-run setup from CLI **or** a UI without shelling out. **Additive** (no breaking API changes, no new env, no migrations) — but `install` is now interactive, so non-interactive callers should pass `--quiet`.
::

### Key Highlights

::card
#title
install works with any database engine
#description
The old install command set up SQLite only — any other engine was silently skipped. It now tests the connection and runs migrations against the **configured** engine, with the previously-orphaned interactive credential prompts (engine, host, port, db, user, password) reconnected. The command itself shrank from 710 to 238 lines, delegating to a reusable orchestrator.
::

::card
#title
Glueful\Installer\ seams (CLI or UI, no shelling out)
#description
`EnvWriter` (atomic, quoted `.env` writes — now the single writer, replacing two unsafe copies), `ConnectionTester` (transient probe of explicit credentials with a short connect timeout + a typed result that never leaks the password), `Installer` (a preflight-first pipeline returning a step-based result a UI can render), plus `DatabaseConfig` and `InstallState`. Two hard invariants hold by construction: a failed connection test mutates nothing (`.env` untouched), and the tested credentials are exactly the connection migrations run on.
::

::card
#title
Safer .env + correct PostgreSQL DSN
#description
`.env` writes are now quoted/escaped and atomic, so a password containing spaces, `#`, `=`, or quotes no longer corrupts the file. `MigrationManager` accepts an optional injected `Connection` (additive). PostgreSQL `sslmode` and `connect_timeout` now reach the DSN, so an SSL-required server connects correctly and an unreachable host fails fast instead of hanging.
::

### Migration Notes

- **`php glueful install` is now interactive.** It prompts for the database engine + credentials by default. **Non-interactive callers** (CI, `post-create-project-cmd`, scripts) should pass **`--quiet`** to use the existing `.env` without prompts, or **`--skip-database`** to skip DB setup/migrations. The api-skeleton's `post-create-project-cmd` is updated accordingly.
- No env, config, or migration changes.

```bash
composer update glueful/framework
```

## v1.59.0 - Unukalhai
**Released: June 19, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-layout-dashboard"}
#description
**First-party frontend serving.** A new `ServiceProvider::serveFrontend()` seam serves a built SPA or static bundle at any **literal** path (e.g. `/admin`) — with secure asset serving, an `index.html` deep-link fallback, and a content-hash-aware cache split. It **replaces and removes** `mountStatic()` (which only mounted at `/extensions/{mount}` and had no SPA fallback). **One small migration** if you used `mountStatic()`; everything else is additive.
::

### Key Highlights

::card
#title
serveFrontend() — serve a SPA at any literal path
#description
`$this->serveFrontend('/admin', $dir)` mounts a built bundle at a literal path: real files stream with mime + `SecurityHeaders` + ETag/304, content-hashed assets get `immutable` caching while `index.html` and unhashed files get `no-cache` (so a new deploy is always seen), and any non-asset path falls back to `index.html` for client-side routing. Pass `['spaFallback' => false]` for a plain static bundle that 404s on a miss. Path traversal, dotfiles, and `.php` are denied; the mount path is a strict literal (request trailing slashes are normalized by the router).
::

::card
#title
OpenAPI: less boilerplate per endpoint
#description
The reflect generator's auto-inferred `401`/`403`/`429` responses now carry a default `{success, message}` JSON body (configurable via `documentation.errors`, including always-emitted statuses like `500`), and `#[FromQuery]`/`#[FromRoute]` accept optional `description`/`example`. Together these let you move query/path params into a typed DTO and delete the repeated `#[QueryParam]`/`#[ApiResponse]` walls — without losing any documentation.
::

::card
#title
HEAD requests to file responses no longer 500
#description
`Router::dispatch()` stripped the `HEAD` body with `setContent('')`, which `BinaryFileResponse` rejects — so a `HEAD` to any file/download route (including the docs UI and the new `serveFrontend()` routes) could 500. It now swaps in a body-less `Response` that preserves status and headers. Affects every file response, not just the new seam.
::

### Migration Notes

- **`mountStatic()` is removed.** Replace `$this->mountStatic('foo', $dir)` (served at `/extensions/foo`) with `$this->serveFrontend('/foo', $dir)` (any literal path + `index.html` fallback). For a plain bundle that 404s on a miss, use `$this->serveFrontend('/foo', $dir, ['spaFallback' => false])`. `serveFrontend()` no-ops with a warning if the bundle has no `index.html` (when `spaFallback` is on).
- The unused `SpaManager` / `StaticFileDetector` / `SpaProvider` are removed (dead code, no callers). No config, env, or migrations.

```bash
composer update glueful/framework
```

## v1.58.1 - Thuban
**Released: June 15, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-api"}
#description
**OpenAPI response-schema fidelity.** Three additive reflect-generator fixes so typed `ResponseData` DTOs document response bodies accurately — the success envelope marks its keys `required`, and `#[ArrayOf]` now resolves array `items` in response mode. **Fully additive:** no behavior change for request DTOs, no config/env changes, nothing to migrate.
::

### Key Highlights

::card
#title
#[ArrayOf] now works on response DTOs
#description
`ClassSchemaReflector` resolves array `items` from `#[ArrayOf]` for `ResponseData` DTOs too — previously response mode read only the `@var Foo[]` docblock. `#[ArrayOf]` is now the consistent array element-type source for both request and response DTOs. To support response-DTO item types, the `#[ArrayOf]` attribute is relaxed to target any class (it no longer requires the target to implement `RequestData`).
::

::card
#title
Success envelope marks its keys required
#description
The reflected single-object success envelope now emits `required: [success, message, data]`, matching the flat-pagination envelope which already did. SDK generators and validators get an accurate contract for the always-present envelope keys.
::

::card
#title
Request-DTO safety preserved
#description
Relaxing `#[ArrayOf]` would have dropped the guarantee that a **request** DTO's array elements implement `RequestData`. That constraint moves into `RequestDataHydrator`, where it now fails loud (`LogicException`) alongside the other v2 structural-misuse guards (dual-source, nested-source). Request-DTO behavior is unchanged.
::

### Migration Notes

- Nothing to migrate. Fully additive — no behavior change for request DTOs, no config or env changes.

```bash
composer update glueful/framework
```

## v1.58.0 - Thuban
**Released: June 15, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-forms"}
#description
**Typed request-DTO hydration v2.** `RequestData` DTOs now handle arrays, nested DTOs, and path/query inputs — closing the v1 "flat-scalars, JSON-body-only" boundaries from 1.57.0. **Fully additive:** flat scalar v1 DTOs are byte-identical, there are no config or env changes, and nothing to migrate.
::

### Key Highlights

::card
#title
Arrays & nested DTOs — no more TypeError sharp edge
#description
A `RequestData` field typed `array` can declare its element type with `#[ArrayOf('int')]` (scalars) or `#[ArrayOf(FieldData::class)]` (nested DTOs). Nested DTOs hydrate recursively and validate per element, and **every failure is a clean `422`** with dot-path error keys (`schema.0.name`) — never a `TypeError`/500. Recursion is depth-capped, and `#[ArrayOf]` is the sole element-type source for request DTOs (`@var` is not read).
::

::card
#title
Path & query sources via #[FromRoute] / #[FromQuery]
#description
A DTO field can be sourced from the route path or the query string — not only the JSON body — with explicit `#[FromRoute]`/`#[FromQuery]` attributes (body is the default; one source per field, no precedence guesswork). The OpenAPI reflect generator emits them as `path`/`query` parameters and excludes them from the request-body schema. Misuse — both attributes on one field, a source attribute on a nested DTO, or a `#[FromRoute]` with no matching `{placeholder}` — fails loud, including at spec generation.
::

::card
#title
Cross-field validation & custom rules
#description
Implement `ValidatesSelf` for a post-hydration `validate()` hook covering cross-field invariants (e.g. "publishedAt required when status=published"), merged into the same `422`. Register reusable custom rules through a container-bound `RuleRegistry` and use them by name in `#[Rule('required|reserved_username')]`; built-in rule names are always reserved.
::

### Migration Notes

- Nothing to migrate. Fully additive — existing flat-scalar `RequestData` DTOs behave identically, and there are no config or env changes.

```bash
composer update glueful/framework
```

## v1.57.0 - Sargas
**Released: June 14, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-api"}
#description
A **types-first I/O** convention and a **single code-first OpenAPI generator**. Controllers can now express request/response shapes as typed DTOs that drive *both* the runtime envelope and the generated spec; the OpenAPI generator is consolidated to the code-first `reflect` engine and the legacy docblock-parsing `comments` generator is removed. Mostly additive, but it ships as a minor for one breaking change. **If you used the `comments` OpenAPI generator or documented routes with `@route`/`@response` docblocks, read the Migration Notes.**
::

### Key Highlights

::card
#title
Types-first request & response DTOs
#description
A controller parameter implementing `RequestData` is hydrated + validated from the JSON body (`#[Rule]` constraints, auto-`422`); a method returning a `ResponseData` is auto-enveloped into `{success, message, data}` (`#[ResponseStatus]` sets the status, `HasResponseMessage` supplies a custom message). `CollectionResponse`/`PaginatedResponse` cover list endpoints, and a returned `JsonResource`/`ResourceCollection`/`PaginatedResourceResponse` is auto-normalized through its own `toResponse()`. One typed class drives both the runtime payload and the OpenAPI schema. A new `php glueful scaffold:dto` command scaffolds request/response DTOs.
::

::card
#title
One code-first OpenAPI generator
#description
The legacy docblock-parsing `comments` generator is removed; the code-first `reflect` generator — which derives paths, params, per-route security, and request/response schemas from the live route table + types — is now the only generator. A minimal typed attribute surface fills the gaps types can't express: `#[ApiOperation]` (summary/description/tags), `#[QueryParam]` (arbitrary query params), `#[ApiRequestBody]` (multipart + doc-only JSON DTO-class bodies), and `#[ApiResponse]` with a `body:` mode for binary/text responses. `reflect ⊇ comment` was proven over the live route table before the comment parser was deleted.
::

::card
#title
Reference adoption across core controllers
#description
The framework's own auth, upload, resource, and health controllers adopt the convention as worked examples (each behavior-preserving, characterization-tested) — and document the convention's boundaries: where typed DTOs apply, and where manual responses remain (polymorphic bodies, multipart input, binary/stream serving, response-level headers/caching).
::

### Migration Notes

- The comment-based OpenAPI generator has been **removed**; `reflect` is now the only OpenAPI generator.
- `documentation.generator` and `API_DOCS_GENERATOR` are no longer supported — remove them from config/env (the value is ignored).
- Route `@route`, `@summary`, `@requestBody`, `@response`, and related docblock annotations are **no longer read**.
- Document endpoints with typed DTOs plus `#[ApiOperation]`, `#[QueryParam]`, `#[ApiRequestBody]`, and `#[ApiResponse]`. See the OpenAPI reflect guide.
- No migrations.

```bash
composer update glueful/framework
```

## v1.56.0 - Rastaban
**Released: June 13, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-shield-lock"}
#description
The **second wave** of the June 2026 security & correctness hardening pass: queue/scheduler payload signing, SSRF-safe HTTP with validated-DNS pinning, unified sensitive-parameter redaction, fail-closed CORS/image defaults, and JWT temporal-claim enforcement. Almost entirely fixes, but several change defaults or add config/env vars (CORS credentials off by default; remote image fetch opt-in; queue/scheduler payloads signed by default; JWT requires `exp`) -- so it ships as a minor. **Read the Migration Notes before upgrading.**
::

### Key Highlights

::card
#title
Queue & scheduler payloads are signed and gated
#description
Persisted database/Redis queue payloads and scheduled-job envelopes are HMAC-signed (handler class + parameters, plus the row's name and cron schedule) and verified before a handler is resolved or run. Stored handler classes must now implement `JobInterface` to be instantiated -- writing a class name into a queue/scheduler backend can no longer trigger an arbitrary constructor. Signing is on by default (`QUEUE_PAYLOAD_SIGNING` / `QUEUE_REQUIRE_SIGNED_PAYLOADS`) and inert without an `APP_KEY`.
::

::card
#title
SSRF-safe HTTP + unified redaction
#description
`Client::safeRequest()` / `safeFetch()` / `safeRequestAsync()` validate the scheme, resolve, and public-IP-pin **every** redirect hop, and pin the validated DNS result to reduce rebinding exposure; webhook delivery and external health checks use the safe path. Sensitive-parameter redaction is unified in one `SensitiveParamRedactor` across request/response logging, exception reporting, auth access logs, and the security-violation listener, and rate-limit cache keys now hash IP/identifier material.
::

::card
#title
Fail-closed defaults + JWT temporal claims
#description
The standalone `Glueful\Http\Cors` handler no longer defaults open, and `CORS_SUPPORTS_CREDENTIALS` now defaults to `false` (wildcard origin + credentials is refused at emit time). `ImageSecurityValidator` defaults to an empty allow-list with external URLs disabled. `JWTService::decode()` now requires bounded `exp` / `nbf` / `iat`, so a token minted without an expiry no longer validates. File encryption moves to chunked authenticated streaming and rejects all-zero keys.
::

### Migration Notes

- **CORS fails closed.** The standalone handler no longer allows all origins by default, and `CORS_SUPPORTS_CREDENTIALS` now defaults to `false`. Set `CORS_ALLOWED_ORIGINS` (and `CORS_SUPPORTS_CREDENTIALS=true` only if you genuinely need credentialed cross-origin requests).
- **Remote image fetching is opt-in.** With no `image.security` config, external image URLs are disabled and the allow-list is empty. Configure `image.security.allowed_domains` or install/configure `glueful/media`.
- **Queue & scheduler payloads are signed by default.** `QUEUE_PAYLOAD_SIGNING` / `QUEUE_REQUIRE_SIGNED_PAYLOADS` default on (inert without `APP_KEY`). To drain legacy unsigned rows, temporarily set `QUEUE_REQUIRE_SIGNED_PAYLOADS=false`. Custom queue/scheduler handlers must implement `JobInterface`.
- **JWT requires `exp`.** Tokens without `exp` (or with expired/non-numeric `exp`, future `nbf`/`iat`) are rejected.
- **Memcached cache format changed.** Flush the cache when upgrading a Memcached-backed deployment -- raw legacy string values that aren't valid serialized data now throw on read.
- **Set `TRUSTED_PROXIES`** behind a load balancer so client IPs resolve correctly. New optional `http.safe_fetch.max_redirects` (default `3`). No migrations.

```bash
composer update glueful/framework
```

## v1.55.0 - Peacock
**Released: June 11, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-shield-lock"}
#description
A **security & correctness hardening** release: a focused pass over routing/permissions, auth, storage paths, the database write-path, deserialization, and the container/extension boundary, from a five-part framework review. Mostly bug fixes, but several change behavior or defaults (permission attributes now enforce; API-key query param off by default; signed URLs fail closed without a secret; extensions fail loud at boot) and one adds a feature (range UPDATE/DELETE predicates) -- so it ships as a minor. **Read the Migration Notes before upgrading.**
::

### Key Highlights

::card
#title
Route permission attributes now actually enforce
#description
`#[RequiresPermission]` / `#[RequiresRole]` were silently unenforced -- the Router never populated the `handler_meta` the gate middleware reads, and the `gate_permissions` middleware was never auto-attached. Both are fixed: the Router derives `handler_meta` after route match, and `AttributeRouteLoader` auto-attaches the gate for attributes on the **method or the handler class**. **Behavioral:** a route annotated with a permission attribute but running without a permission provider bound now returns **403** instead of allowing the request.
::

::card
#title
Auth & storage hardening
#description
`#[RequireScope]` no longer passes for non-API-key (JWT) requests; the unverified-JWT claims fallback is removed (claims come only from signature-verified tokens); the `?api_key=` query string is **off by default** (set `security.api_keys.allow_query_param` to re-enable). Signed URLs **fail closed** when no signing secret is configured. All `FlysystemStorage` writes/reads/deletes route through PathGuard, so a traversal/absolute path can no longer reach the disk unvalidated.
::

::card
#title
Database integrity + injection hardening
#description
Soft-delete column cache is namespaced per connection (no cross-database poisoning of the soft-vs-hard delete decision); pooled connections roll back open transactions and reset session state before reuse; duplicate-column WHERE predicates on UPDATE/DELETE now **both apply** (range support) instead of silently collapsing to one (over-deletion). JOIN/HAVING/ORM-`has()` operators are allow-listed, JSON paths grammar-validated, and `wrapIdentifier()` doubles embedded quotes.
::

::card
#title
Container/extension boundary fails loud
#description
An extension whose `services()`/`defs()`/`tags()` throws is no longer silently dropped: it rethrows at boot outside production (recorded + WARNING-logged in production via `ContainerFactory::failedProviders()`), and a service bound to a bare interface/abstract is rejected at **load time** instead of fataling at first resolution. Closes the recurring extension-wiring bug class.
::

### Migration Notes

- **Permission attributes now enforce.** Routes using `#[RequiresPermission]`/`#[RequiresRole]` without a permission provider bound will now 403. Bind a provider (e.g. `glueful/aegis`), grant the permissions, or remove the attribute from open routes.
- **API key query string is off by default.** Move clients to the `X-API-Key` header, or set `security.api_keys.allow_query_param = true`.
- **Signed URLs require a secret.** Configure `uploads.signed_urls.secret` / `SIGNED_URL_SECRET` (or `app.key` / `APP_KEY`) -- a distinct value per environment. Generation/validation throws otherwise.
- **Extensions fail loud at boot (non-prod).** A previously-silent extension wiring failure will now surface; fix the binding (a bare interface id needs `['class' => Concrete::class]` or a factory).
- New optional config keys `security.api_keys.allow_query_param` / `security.csrf.rate_limit_fail_closed` (both default `false`). No new env vars, no migrations.

```bash
composer update glueful/framework
```

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
