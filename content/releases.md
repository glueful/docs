---
title: Release Notes
description: Curated highlights, migration guidance, and structured summaries of Glueful framework releases.
---

> This page is a curated layer over the raw authoritative `CHANGELOG.md`. For complete detail (including every Added/Changed/Removed/Fix line) consult the full changelog.

## Release Summary

| Version | Codename | Date | Type | Risk | Primary Theme |
| ------- | -------- | ---- | ---- | ---- | ------------- |
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

## v1.38.0 - Lesath
**Released: February 17, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-bolt"}
#description
Auth token-refresh performance optimization — eliminates redundant `auth_sessions` database lookups during token refresh, removes direct `new Connection()` instantiation, and adds request-level caching for refresh-token session lookups.
::

### Key Highlights

::card
#title
Token-Refresh DB Lookup Reduction
#description
`TokenManager::getSessionFromRefreshToken()` now fetches `provider` and `remember_me` in the initial query. Two subsequent `auth_sessions` queries that re-fetched these fields during token refresh are eliminated, reducing per-refresh DB round-trips from 3 to 1.
::

::card
#title
AuthenticationService DI Cleanup
#description
`refreshTokens()` resolves the session via `SessionStore::getByRefreshToken()` up front and passes `user_uuid` directly to `getUserDataByUuid()`. Removes direct `new Connection()` instantiation in favour of the injected `UserRepository`, improving testability and DI consistency.
::

::card
#title
Request-Level Refresh-Token Cache
#description
`SessionStore::getByRefreshToken()` now caches results in `$requestCache` keyed by `refresh:{hash}`, matching the existing `getByAccessToken()` pattern. Repeated lookups within the same request (e.g., validation then token generation) hit memory instead of the database.
::

### Migration Notes
- No breaking changes. All modified methods are `private` or internal to the auth subsystem.
- For optimal performance, add the composite index `idx_auth_sessions_refresh_status` on `(refresh_token, status)` to production databases.

---

## v1.33.0 - Gacrux
**Released: February 14, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-shield-lock"}
#description
Eliminated all `fromGlobals()` fallbacks from service code — every auth and utility service now resolves `RequestContext` from the container's shared singleton, fixing memory exhaustion on high-header requests and enabling long-running server compatibility.
::

### Key Highlights

::card
#title
Container-Enforced Request Resolution
#description
15 files across auth services (`TokenManager`, `JwtAuthenticationProvider`, `SessionStore`, `EmailVerification`, `AuthenticationService`) and utility services (`RequestHelper`, `Utils`, `Cors`, `SpaManager`, `UserRepository`, `SecurityManager`) no longer call `RequestContext::fromGlobals()` or `Request::createFromGlobals()` as fallbacks. All request data is resolved from the DI container's shared singleton, which is created once per request lifecycle.
::

::card
#title
Memory Safety for High-Header Requests
#description
Previously, each `fromGlobals()` call independently reconstructed a PSR-7 request from `$_SERVER` superglobals, allocating fresh header arrays. On requests with many headers, this caused unbounded memory growth — crashing at Nyholm's `MessageTrait.php` with 512MB exhaustion. The container singleton eliminates redundant construction entirely.
::

::card
#title
Silent Fallback Removal
#description
`SessionStoreResolver` and `TokenManager::getSessionStore()` no longer silently construct bare `SessionStore()` instances (with stale globals) when the container is unavailable. Container resolution failures now surface immediately with clear `\RuntimeException` messages, making wiring bugs visible rather than hidden.
::

::card
#title
Long-Running Server Compatibility
#description
Services that read `$_SERVER`, `getallheaders()`, or `apache_request_headers()` directly would return stale data on RoadRunner, Swoole, or FrankenPHP after the first request. All request data now flows through the container singleton, which is reset between requests via `Container::reset()`.
::

### Migration Notes
- No breaking changes for services instantiated via the container (the standard path).
- Direct `new Service()` calls without providing `ApplicationContext` now throw `\RuntimeException` instead of silently using stale globals. Pass `context:` to the constructor.
- `EmailVerification::sendPasswordResetEmail()` has a new optional `?ApplicationContext $context` parameter. Existing callers without context continue to work but should add context for proper resolution.
- `SecurityManager` constructor has a new optional `?ApplicationContext $context` parameter (appended, no positional break).

---

## v1.32.0 - Fomalhaut
**Released: February 11, 2026**

::u-alert{color="primary" variant="subtle" icon="i-tabler-database"}
#description
Schema builder `alterTable` now supports the same callback-style API as `createTable`, enabling concise inline table alterations with automatic execution.
::

### Key Highlights

::card
#title
Dual-Mode `alterTable` API
#description
`alterTable()` now accepts an optional callback parameter. Without a callback, it returns a fluent `TableBuilder` for chaining (existing behavior). With a callback, it passes the builder to the callback, executes the ALTER statements, and returns `$this` for schema-level chaining — matching the `createTable` pattern.
::

::card
#title
ColumnBuilder Finalization Safety
#description
The callback path calls `gc_collect_cycles()` before executing, forcing PHP to run `ColumnBuilder` destructors so that `finalizeColumn()` registers columns before the ALTER SQL is generated. This prevents empty ALTER statements when column definitions are created as temporaries inside the callback.
::

### Migration Notes
- No breaking changes. All existing callers use the no-callback path and are unaffected.
- Convenience methods (`addColumn`, `dropColumn`, `addIndex`, `dropIndex`, `addForeignKey`, `dropForeignKey`) continue to work unchanged.

---

## v1.31.0 - Enif
**Released: February 9, 2026**

::u-alert{color="primary" variant="subtle" icon="i-tabler-plug-connected"}
#description
Centralized context propagation: core services and ORM receive application context during framework boot, enabling cleaner static API usage.
::

### Key Highlights

::card
#title
ORM Default Context
#description
`Model::setDefaultContext()` allows static model calls like `User::find($id)` without explicitly passing `ApplicationContext` as the first argument. The framework sets this automatically during boot. Explicit context passing (`User::find($context, $id)`) continues to work and takes priority.
::

::card
#title
Boot-Time Context Propagation
#description
`Framework::boot()` now sets `ApplicationContext` on core services during initialization: `Model`, `Utils`, `CacheHelper`, `SecureErrorResponse`, `RoutesManager`, `ImageProcessor`, `ConfigManager`, `Webhook`, and `RequestUserContext`. Eliminates scattered manual `setContext()` calls throughout application code.
::

### Migration Notes
- No breaking changes. Existing code passing context explicitly is unaffected.
- Default context is only available after `Framework::boot()` completes. Service provider constructors must still pass context explicitly.

---

## v1.30.1 - Diphda (Patch)
**Released: February 9, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-key"}
#description
Ensures `JWTService` has access to the application context during authentication provider initialization.
::

### What Changed
- `AuthBootstrap::initialize()` now calls `JWTService::setContext()` before creating JWT and API key authentication providers, fixing potential context-missing issues during token operations.

### Migration Notes
- No breaking changes. Drop-in patch.

---

## v1.30.0 - Diphda
**Released: February 9, 2026**

::u-alert{color="primary" variant="subtle" icon="i-tabler-arrows-join-2"}
#description
Unified exception handling: consolidated two overlapping exception handlers into a single source of truth with channel-based log routing and optimized context building.
::

### Key Highlights

::card
#title
Single Handler, Single Code Path
#description
The modern `Handler` (`src/Http/Exceptions/Handler.php`) is now the sole authority for rendering, reporting, and event dispatch. The legacy `ExceptionHandler` has been reduced from 1041 lines to a ~250-line bootstrap shim that registers PHP global handlers and delegates to the DI-managed Handler instance.
::

::card
#title
Channel-Based Log Routing
#description
Exceptions are automatically routed to named log channels (`auth`, `database`, `security`, `http`, `ratelimit`, `extensions`, `api`, `permissions`, `framework`) based on their type. Custom mappings can be registered via `Handler::mapChannel()`.
::

::card
#title
Optimized Context Building
#description
High-frequency exceptions (validation errors, 404s) get lightweight context (URI, method, IP). All others get full context including headers, memory usage, and processing time. Eliminates the previous three separate context-building methods.
::

### Migration Notes
- No breaking changes. `ExceptionHandler::logError()`, `setTestMode()`, `getTestResponse()`, `setLogger()` continue to work as static methods.
- `ExceptionHandler::setContext()` is now a no-op — can be removed from calling code.
- Extensions using `Glueful\Exceptions\HttpException`, `NotFoundException`, `BusinessLogicException`, or `ValidationException` should update imports to their modern namespaces under `Glueful\Http\Exceptions\*` or `Glueful\Validation\*`.

---

## v1.29.0 - Capella
**Released: February 7, 2026**

::u-alert{color="primary" variant="subtle" icon="i-tabler-rocket"}
#description
Queue system overhaul with leaf worker mode, config normalization, distributed lock fix, and env-driven queue presets.
::

### Key Highlights

::card
#title
Leaf Worker Mode
#description
New `queue:work process` action enables spawned workers to execute jobs directly in-process. Eliminates recursive manager spawning for cleaner process trees and better resource isolation. Supports `--sleep`, `--max-jobs`, `--max-runtime`, `--stop-when-empty`, `--with-monitoring`, and `--emit-heartbeat`.
::

::card
#title
Queue Presets & Env-Driven Config
#description
Seven pre-configured queue profiles (`critical`, `maintenance`, `default`, `high`, `emails`, `reports`, `notifications`) with per-queue workers, memory limits, timeouts, priorities, and autoscale toggles — all env-driven. Schedule queue names also env-backed via `SCHEDULE_QUEUE_*` variables.
::

::card
#title
Process Management Fixes
#description
ProcessManager config normalization (`max_workers` / `max_workers_global`), new `stop()` API with state cleanup, status payload includes worker runtime, and distributed lock changed from host-scoped to queue-scoped for correct multi-host coordination.
::

### Migration Notes
- No breaking changes. Existing `queue:work` behavior is unchanged.
- Auto-scaling is default-off for all queue presets. Enable per-queue via `*_QUEUE_AUTO_SCALE=true`.
- Review `.env.example` for new `QUEUE_*` and `SCHEDULE_QUEUE_*` variables.

---

## v1.28.3 - Bellatrix (Patch)
**Released: February 7, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-bug"}
#description
Fix CLI option shortcut collision causing `LogicException` when running queue commands.
::

### Key Highlights

::card
**`-q` Shortcut Collision Fix**
- `WorkCommand`, `ServerCommand`, and `MaintenanceCommand` all defined `-q` as shortcut for `--queue`
- Symfony Console reserves `-q` for the global `--quiet` option, causing a `LogicException` at runtime
- Removed the `-q` shortcut from all three commands — use `--queue` instead
::

### Risk Assessment
- **Risk Level**: Low
- **Breaking Changes**: None — `-q` was never usable due to the collision
- **Migration Effort**: None — drop-in patch

---

## v1.28.2 - Bellatrix (Patch)
**Released: February 7, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-bug"}
#description
CLI migration commands now properly discover extension migrations. PostgreSQL schema introspection is now schema-safe.
::

### Key Highlights

::card
**Container Self-Registration**
- `ContainerFactory::create()` now registers the built container under `ContainerInterface`
- Enables autowiring to inject the fully-configured container into CLI commands
- CLI commands no longer create a separate container that lacks extension state
::

::card
**Migration Command DI Wiring**
- `RunCommand`, `StatusCommand`, `RollbackCommand` accept optional `ContainerInterface` and `ApplicationContext` via constructor
- When booted via DI, commands receive the container with extension-registered migration paths
- `migrate:run`, `migrate:status`, `migrate:rollback` now see extension migrations
::

::card
**PostgreSQL Schema-Safe Introspection**
- All `PostgreSQLSqlGenerator` introspection queries now use `current_schema()` instead of hardcoding `public`
- `getTableColumns()` scoped with `table_schema`, `pg_namespace` joins, and schema-aware FK lookups
- Enables correct behavior in multi-tenant setups and non-`public` schema deployments
::

### Risk Assessment
- **Risk Level**: Low
- **Breaking Changes**: None
- **Migration Effort**: None — drop-in patch

---

## v1.28.1 - Bellatrix (Patch)
**Released: February 6, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-bug"}
#description
Router stability fixes for applications using route caching with extensions.
::

### Key Highlights

::card
**Router Group Stack Fix**
- `Router::group()` now uses `try/finally` to always clean up `groupStack` and `middlewareStack`
- Prevents route prefix leakage when exceptions occur inside nested group callbacks
- Eliminates cascading path accumulation across extension route loading (e.g., `/rbac/roles/auth/social/...`)
::

::card
**Cache-Aware Route Registration**
- Router tracks when routes were pre-loaded from cache via `routesLoadedFromCache` flag
- Static routes: overwrites cached entry instead of throwing `LogicException("Route already defined")`
- Dynamic routes: replaces cached entry in `dynamicRoutes` and `routeBuckets` instead of appending duplicates
- Ensures fresh extension definitions always take priority over cached routes
::

### Risk Assessment
- **Risk Level**: Low
- **Breaking Changes**: None
- **Migration Effort**: None — drop-in patch

---

## v1.28.0 - Bellatrix (Minor)
**Released: February 5, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-route"}
#description
Route caching support through controller refactoring. Routes now use cacheable syntax for improved performance.
::

### Key Highlights

::card
**ResourceController Refactoring**
- Removed wrapper methods pattern (`listResources`, `showResource`, etc.)
- Renamed methods to RESTful conventions: `index`, `show`, `store`, `update`, `destroy`
- Added `destroyBulk` and `updateBulk` for bulk operations
- Methods now accept `Request` directly instead of array parameters
::

::card
**Cacheable Route Syntax**
- All routes now use `[Controller::class, 'method']` syntax
- Closures replaced throughout for route cache compatibility
- Routes can be compiled and cached for faster resolution
::

::card
**Route Caching Infrastructure**
- RouteCompiler: `validateHandlers()`, `hasClosures()`, `getClosureRoutes()` for detecting non-cacheable routes
- RouteCache: `cacheContainsClosures()` auto-invalidates cache when closures detected
- Logs warnings to help developers identify routes needing conversion
- Use `route:debug` command to find closure-based routes
::

::card
**Breaking Changes**
- `get()` → `index()`, `getSingle()` → `show()`, `post()` → `store()`
- `put()` → `update()`, `delete()` → `destroy()`
- Method signatures changed from `(array $params, array $data)` to `(Request $request)`
::

### Migration Guide

If you extended `ResourceController` and overrode methods:

```php
// Before
public function get(array $params, array $queryParams)
{
    // custom logic
}

// After
public function index(Request $request): Response
{
    $table = $request->attributes->get('table', '');
    $queryParams = $request->query->all();
    // custom logic
}
```

### Risk Assessment
- **Risk Level**: Medium
- **Breaking Changes**: Yes - method names and signatures changed
- **Migration Effort**: Low for most users; update required if extending ResourceController

---

## v1.27.0 - Avior (Minor)
**Released: February 4, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-terminal-2"}
#description
Developer experience improvements with new CLI commands, route cache signatures, database transaction callbacks, and extension management enhancements.
::

### Key Highlights

::card
**New CLI Commands**
- `doctor` - Quick health checks for local development (env, cache, database, routes, storage)
- `env:sync` - Sync `.env.example` from config `env()` usage with `--apply` option
- `route:debug` - Dump resolved routes with `--method`, `--path`, `--name` filters
- `route:cache:clear` / `route:cache:status` - Route cache management
- `cache:inspect` - Inspect cache driver and PHP extension status
- `test:watch` - Run tests on file changes with configurable polling
::

::card
**Database Transaction Callbacks**
- `Connection::afterCommit(callable)` - Execute callback after transaction commits
- `Connection::afterRollback(callable)` - Execute callback after transaction rollback
- Shared `TransactionManager` ensures consistent state across QueryBuilders
- Callbacks promoted to parent level for nested transactions (savepoints)
::

::card
**Route Cache Improvements**
- Signature-based invalidation replaces TTL-based caching
- SHA-256 hash of route file paths, mtimes, and sizes
- Cache invalidates automatically when any source file changes
- Works consistently across all environments
::

::card
**Extensions Enable/Disable**
- Commands now edit `config/extensions.php` directly (dev only)
- `--dry-run` to preview changes, `--backup` to create .bak file
- Disable comments out provider line (safer for trailing commas)
::

### Example Usage

```bash
# Quick health check
php glueful doctor

# Sync env variables from config
php glueful env:sync --apply

# Debug routes
php glueful route:debug --method=GET --path=/api

# Enable extension with preview
php glueful extensions:enable Meilisearch --dry-run
```

### Risk Assessment
- **Risk Level**: Low
- **Breaking Changes**: None
- **Migration Effort**: None required

---

## v1.26.0 - Atria (Minor)
**Released: January 31, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-plug"}
#description
Fixed extension discovery reliability and improved ExtensionManager efficiency for CLI tools and documentation generation.
::

### Key Highlights

::card
**Extension Discovery Fallback**
- `PackageManifest` now falls back to `installed.json` when `installed.php` lacks provider metadata
- Composer's optimized `installed.php` may omit the `extra` field where providers are specified
- `installed.json` contains complete package metadata and is used as reliable fallback
::

::card
**Lazy Auto-Discovery**
- `ExtensionManager::getProviders()` now triggers discovery if not yet run
- CLI commands that create their own container automatically discover extensions
- Fixes empty provider lists in documentation generation and other CLI tools
::

::card
**Discovery Efficiency**
- Added `$discovered` flag to ensure discovery runs exactly once
- Prevents redundant discovery when zero extensions are legitimately installed
- More efficient than checking for empty providers array
::

### Technical Details

The issue occurred because Composer's `installed.php` (used for fast autoloading) doesn't always include the `extra` field where Glueful extension providers are declared. The fix adds a fallback:

```php
// PackageManifest::discover()
$providers = $this->extractFromInstalledPhp($installed);
if ($providers !== []) {
    return $providers;
}
// Fallback to installed.json which has complete metadata
return $this->extractFromInstalledJson();
```

### Risk Assessment
- **Risk Level**: Low
- **Breaking Changes**: None
- **Migration Effort**: None required

---

## v1.25.0 - Ankaa (Minor)
**Released: January 31, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-route"}
#description
Enhanced RouteManifest with automatic discovery of multiple application route files, enabling domain-driven route organization.
::

### Key Highlights

::card
**Multi-File Route Discovery**
- All `*.php` files in `routes/` directory auto-discovered
- Alphabetical loading order for deterministic behavior
- Files starting with underscore (`_helpers.php`) excluded as partials
- Double-load prevention tracks files to avoid duplicate registration
::

::card
**Route Loading Priority**
- Application routes load first (highest priority)
- Framework API routes load second (act as fallbacks)
- Public routes (health, docs) load last without prefix
::

::card
**Domain-Driven Organization**
- Split large route files into domain-specific files
- Each file receives `$router` and `$context` in scope
- Full control over prefixes per file
::

### Example Structure

```
routes/
├── api.php           # Main/shared routes
├── identity.php      # Auth, profile, preferences
├── parps.php         # Domain-specific routes
├── social.php        # Follow, block
├── engagement.php    # Reactions, comments, bookmarks
├── moderation.php    # Reports
└── _helpers.php      # Shared helpers (excluded from auto-load)
```

### Usage

```php
// routes/identity.php
$router->group(['prefix' => api_prefix($context)], function (Router $router) {
    $router->post('/auth/login', [AuthController::class, 'login']);
    $router->post('/auth/register', [AuthController::class, 'register']);
    $router->get('/profile', [ProfileController::class, 'show']);
});

// routes/social.php
$router->group(['prefix' => api_prefix($context)], function (Router $router) {
    $router->post('/follow/{uuid}', [FollowController::class, 'follow']);
    $router->delete('/follow/{uuid}', [FollowController::class, 'unfollow']);
});
```

### Risk Assessment
- **Risk Level**: Low
- **Breaking Changes**: None
- **Migration Effort**: None required (backward compatible with single route file)

---

## v1.24.0 - Alpheratz (Minor)
**Released: January 31, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-shield-lock"}
#description
Comprehensive encryption service providing secure, easy-to-use AES-256-GCM encryption for strings, files, and database fields with key rotation support.
::

### Key Highlights

::card
**EncryptionService Core**
- AES-256-GCM authenticated encryption (industry standard)
- Random 12-byte nonce per encryption (prevents ciphertext repetition)
- 16-byte authentication tag for tamper detection
- Key ID in output format enables O(1) key lookup during rotation
- Self-identifying format: `$glueful$v1$<key_id>$<nonce>$<ciphertext>$<tag>`
::

::card
**String & Binary Encryption**
- `encrypt($value, $aad)` / `decrypt($encrypted, $aad)` for UTF-8 strings
- `encryptBinary()` / `decryptBinary()` for arbitrary binary data
- `isEncrypted($value)` to detect encrypted strings by format
- AAD (Additional Authenticated Data) binding prevents cross-field attacks
::

::card
**File Encryption**
- `encryptFile($source, $dest)` - Encrypt entire files
- `decryptFile($source, $dest)` - Decrypt encrypted files
- CLI: `php glueful encryption:file encrypt /path/to/file`
::

::card
**Key Rotation**
- `encryption.previous_keys` config array for old keys
- O(1) key lookup via key ID (no trial decryption needed)
- CLI: `php glueful encryption:rotate --table=users --columns=ssn,api_key`
- Seamless migration: old data decrypts with previous keys
::

::card
**CLI Commands**
- `encryption:test` - Verify encryption is working (6 self-tests)
- `encryption:file` - Encrypt/decrypt files with `--force`, `--delete-source`
- `encryption:rotate` - Re-encrypt database columns with `--batch-size`, `--dry-run`
::

::card
**Test Coverage**
- 32 unit tests covering all functionality
- Core encryption, AAD binding, key validation, binary handling
- Key rotation, file encryption, error handling
::

### Usage Example

```php
use Glueful\Encryption\EncryptionService;

$encryption = new EncryptionService($context);

// Basic encryption
$encrypted = $encryption->encrypt('sensitive data');
$decrypted = $encryption->decrypt($encrypted);

// With AAD (prevents cross-field attacks)
$encrypted = $encryption->encrypt($ssn, aad: 'user.ssn');
$decrypted = $encryption->decrypt($encrypted, aad: 'user.ssn');

// Binary data
$encrypted = $encryption->encryptBinary($binaryData);
$binary = $encryption->decryptBinary($encrypted);

// File encryption
$encryption->encryptFile('/path/to/file', '/path/to/file.enc');
$encryption->decryptFile('/path/to/file.enc', '/path/to/file');
```

### Configuration

```php
// config/encryption.php
return [
    'key' => env('APP_KEY'),  // base64:... format supported
    'cipher' => 'aes-256-gcm',
    'previous_keys' => array_filter(
        explode(',', env('APP_PREVIOUS_KEYS', ''))
    ),
];
```

### Risk Assessment
- **Risk Level**: Low
- **Breaking Changes**: None
- **Migration Effort**: None required (opt-in feature)

---

## v1.23.0 - Aldebaran (Minor)
**Released: January 31, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-lock"}
#description
Enhanced blob storage system with per-blob visibility controls, HMAC-signed URLs for secure temporary access, and comprehensive test coverage.
::

### Key Highlights

::card
**Per-Blob Visibility**
- Blobs can now be marked as `public` or `private` individually
- Upload requests accept `visibility` parameter
- Defaults to configured `uploads.default_visibility` (private)
- Public blobs accessible without auth (unless global access is `private`)
- Private blobs require authentication or valid signed URL
::

::card
**Signed URL Support**
- New `SignedUrl` helper class for HMAC-based URL signing
- Time-limited access with customizable TTL (default 1 hour, max 7 days)
- New endpoint: `POST /blobs/{uuid}/signed-url`
- Automatic signature validation on blob retrieval
- Falls back to `APP_KEY` if no dedicated secret configured
::

::card
**Configuration Options**
- `uploads.default_visibility` - Set default visibility for new uploads
- `uploads.signed_urls.enabled` - Enable/disable signed URL generation
- `uploads.signed_urls.secret` - Dedicated secret for URL signing
- `uploads.signed_urls.ttl` - Default TTL in seconds (default: 3600)
::

::card
**Comprehensive Test Coverage**
- `SignedUrlTest` - 17 tests covering URL generation, validation, expiration, tampering
- `UploadControllerTest` - 38 tests covering resize params, caching, access control, visibility
- Total: 55 new tests with 95 assertions
::

### Usage Example

```php
// Upload with visibility
POST /blobs
{
    "file": "...",
    "visibility": "private"
}

// Generate signed URL for temporary access
POST /blobs/{uuid}/signed-url?ttl=7200

// Response
{
    "uuid": "abc123",
    "signed_url": "https://example.com/blobs/abc123?expires=...&signature=...",
    "expires_in": 7200,
    "expires_at": "2026-01-31 14:00:00"
}
```

### Risk Assessment
- **Risk Level**: Low
- **Breaking Changes**: None
- **Migration Effort**: None required

---

## v1.22.0 - Achernar (Minor)
**Released: January 30, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-replace"}
#description
Major refactoring release replacing global state with explicit dependency injection via `ApplicationContext`. Improves testability, enables multi-app support, and prepares for long-running server environments.
::

### Key Highlights

::card
**ApplicationContext Dependency Injection**
- All helper functions now require `ApplicationContext` as first parameter
- `config($context, $key)`, `app($context, $id)`, `base_path($context, $path)`
- Enables true state isolation for testing and multi-app scenarios
- Prepares framework for Swoole/RoadRunner long-running servers
::

::card
**PHP 8.3 Compatibility**
- New `QueueContextHolder` class replaces deprecated static trait properties
- Fixed `InteractsWithQueue` trait to avoid deprecated static method calls on traits
- All deprecation warnings resolved
::

::card
**Service Provider Updates**
- `register()` and `boot()` methods now receive `ApplicationContext` parameter
- Extensions must update to new signatures
- Enables proper DI access throughout provider lifecycle
::

::card
**Console Command Auto-Discovery**
- Commands auto-discovered from `src/Console/Commands/` directory
- Just add `#[AsCommand]` attribute - no manual registration needed
- Production caching for fast startup (auto-generated on first run)
- New `commands:cache` CLI command for cache management
::

::card
**Code Quality Improvements**
- Fixed PHPStan errors (duplicate properties, missing returns, visibility)
- Fixed 25+ PHPCS line length violations
- Added PHPStan `banned_code` rule to prevent `$GLOBALS` usage
- Cleaned up phpstan.neon excludePaths for removed files
::

### Migration Required

This release requires updating code that uses helper functions:

```php
// Before (1.21.x)
$value = config('app.name');
$service = app(MyService::class);

// After (1.22.0)
$value = config($context, 'app.name');
$service = app($context, MyService::class);
```

Extensions must update provider signatures:

```php
// Before
public function boot(): void { }

// After
public function boot(ApplicationContext $context): void { }
```

### Risk Assessment
- **Risk Level**: Medium
- **Breaking Changes**: Helper function signatures, ServiceProvider interface
- **Migration Effort**: Low-Medium (search-replace for most cases)

---

## v1.21.0 - Mira (Minor)
**Released: January 24, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-upload"}
#description
Feature release refactoring the file upload system with improved architecture, pure PHP media metadata extraction, and enhanced configurability.
::

### Key Highlights

::card
**ThumbnailGenerator**
- New dedicated class for thumbnail creation using ImageProcessor (Intervention Image)
- Configurable width, height, and quality settings via config or method parameters
- Configurable supported formats (JPEG, PNG, GIF, WebP by default)
- Configurable thumbnail subdirectory for organized storage
::

::card
**MediaMetadataExtractor with getID3**
- Pure PHP metadata extraction — no external binaries required
- Removed fragile ffprobe/shell_exec dependency for video duration
- Supports images, audio, and video files
- Falls back gracefully when getID3 is not installed
::

::card
**MediaMetadata Value Object**
- New readonly value object for type-safe metadata representation
- Properties: `type`, `width`, `height`, `durationSeconds`
- Helper methods: `isImage()`, `isVideo()`, `isAudio()`, `hasDimensions()`
- `getAspectRatio()` and `getFormattedDuration()` utilities
::

::card
**Enhanced Configuration**
- New `filesystem.uploader` configuration section
- Global toggle: `THUMBNAIL_ENABLED` to enable/disable thumbnails
- Configurable dimensions: `THUMBNAIL_WIDTH`, `THUMBNAIL_HEIGHT`
- Configurable quality and subdirectory settings
- Configurable thumbnail formats array
::

::card
**Storage Adapter Documentation**
- Added installation instructions for optional Flysystem adapters
- S3/MinIO/DigitalOcean Spaces: `league/flysystem-aws-s3-v3`
- Google Cloud Storage: `league/flysystem-google-cloud-storage`
- Azure Blob Storage: `league/flysystem-azure-blob-storage`
- SFTP/FTP adapters documented
::

### Usage

**Upload media with automatic thumbnail:**

```php
use Glueful\Uploader\FileUploader;

$uploader = new FileUploader($storage);
$result = $uploader->uploadMedia($file, 'media/images');

// Result includes file info, thumbnail URL, and metadata
$metadata = $result['metadata'];
if ($metadata->isImage()) {
    echo "Image: {$metadata->width}x{$metadata->height}";
} elseif ($metadata->isVideo()) {
    echo "Video duration: " . $metadata->getFormattedDuration();
}
```

**Configuration (.env):**

```env
THUMBNAIL_ENABLED=true
THUMBNAIL_WIDTH=400
THUMBNAIL_HEIGHT=400
THUMBNAIL_QUALITY=80
THUMBNAIL_SUBDIRECTORY=thumbs
```

### Migration

No breaking changes. The new classes are used internally by `FileUploader`.

**New dependency:** Add `james-heinrich/getid3` if not already installed:

```bash
composer require james-heinrich/getid3
```

---

## v1.20.0 - Regulus (Minor)
**Released: January 24, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-leaf"}
#description
Minor release focusing on framework simplification by removing unused subsystems and improving API URL structure for better separation of concerns.
::

### Key Highlights

::card
**Resource Routes URL Structure**
- Added `/data` prefix to all generic CRUD resource routes
- Routes changed from `/api/v1/{table}` to `/api/v1/data/{table}`
- Prevents conflicts with custom application routes using same table names
- Clearer separation between generic data API and custom endpoints
::

::card
**Async/Fiber System Removed**
- Removed entire Fiber-based async concurrency subsystem (~30 files)
- System was unused in practice — Queue system handles background jobs
- Removed `AsyncProvider`, `config/async.php`, and all async helpers
- Simplifies codebase and reduces maintenance surface
::

::card
**Rate Limiting Consolidated**
- Removed basic rate limiting system (6 files)
- Enhanced rate limiting system retained with all advanced features
- `EnhancedRateLimiterMiddleware` provides tiered limits, multiple algorithms
- Per-route rate limiting via `#[RateLimit]` attribute still fully supported
::

::card
**Configuration Cleanup**
- Removed unused `ENABLE_AUDIT` environment variable
- Removed duplicate pagination settings from security config
- Cleaner configuration with less unused options
::

### Migration

**Resource Routes (Breaking Change):**

If your application calls generic resource endpoints, update the URLs:

```diff
- GET /api/v1/users
+ GET /api/v1/data/users

- POST /api/v1/products
+ POST /api/v1/data/products

- PUT /api/v1/orders/abc-123
+ PUT /api/v1/data/orders/abc-123
```

**Async System (if used):**

If you were using the Fiber-based async system (rare), migrate to the Queue system:

```diff
- use function Glueful\async;
- use function Glueful\await_all;
-
- $results = await_all([
-     async(fn() => $this->fetchUsers()),
-     async(fn() => $this->fetchProducts()),
- ]);
+ // Use queue jobs for background processing
+ $queue = service(\Glueful\Queue\QueueManager::class);
+ $queue->push(FetchUsersJob::class, ['callback' => $callbackUrl]);
```

**Rate Limiting:**

No migration needed. If using `RateLimiterMiddleware` alias, it now points to `EnhancedRateLimiterMiddleware`. All existing `#[RateLimit]` attributes and route middleware continue to work.

---

## v1.19.2 - Canopus (Patch)
**Released: January 24, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-code"}
#description
Patch release consolidating ValidationException classes, improving SQL query building, and enhancing cross-database compatibility.
::

### Key Highlights

::card
**ValidationException Consolidation**
- Unified from 3 exception classes to 1 canonical class
- Removed legacy `Glueful\Exceptions\ValidationException`
- Removed empty `Glueful\Uploader\ValidationException`
- All code now uses `Glueful\Validation\ValidationException`
- Static factory methods: `forField()`, `forFields()`, `withErrors()`
::

::card
**Database Query Building Improvements**
- `PaginationBuilder` improved regex for ORDER BY and LIMIT removal
- Handles MySQL offset syntax (`LIMIT 10, 20`) and placeholders (`LIMIT ?`)
- Added detection for UNION, INTERSECT, EXCEPT, CTEs, and window functions
- `QueryValidator` now supports `schema.table` format
::

::card
**WhereClause Enhancements**
- Expanded valid operators: `IS`, `IS NOT`, `BETWEEN`, `NOT BETWEEN`, `REGEXP`, `RLIKE`, `ILIKE`
- Added operator injection protection
- Invalid NULL comparisons now throw clear exceptions
::

### Migration

If using the legacy ValidationException directly:

```diff
- use Glueful\Exceptions\ValidationException;
+ use Glueful\Validation\ValidationException;

- throw new ValidationException('Error message');
+ throw ValidationException::forField('field', 'Error message');

- throw new ValidationException(['field' => 'error']);
+ throw ValidationException::withErrors(['field' => 'error']);
```

---

## v1.19.1 - Canopus (Patch)
**Released: January 22, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-settings"}
#description
Patch release simplifying API configuration by consolidating URL and version environment variables for cleaner deployment setup.
::

### Key Changes

::card
**Simplified URL Configuration**
- All URLs now derive from single `BASE_URL` variable
- Removed `API_BASE_URL` — no longer needed
- Set `BASE_URL` to your deployment URL (e.g., `https://api.example.com`)
::

::card
**Simplified Version Configuration**
- Consolidated to single `API_VERSION` variable (integer format)
- Removed `API_VERSION_FULL` — docs version derived automatically
- Removed `API_DEFAULT_VERSION` — use `API_VERSION` instead
- Changed from `API_VERSION=v1` to `API_VERSION=1`
::

### Migration

Update your `.env` file:

```diff
- BASE_URL=http://localhost:8000
- API_BASE_URL=http://localhost:8000
- API_VERSION=v1
- API_VERSION_FULL=1.0.0
- API_DEFAULT_VERSION=1
+ BASE_URL=http://localhost:8000
+ API_VERSION=1
```

**Deployment examples:**

| Scenario | BASE_URL |
|----------|----------|
| Local development | `http://localhost:8000` |
| API on subdomain | `https://api.example.com` |
| API on main domain | `https://example.com` |

---

## v1.19.0 - Canopus (Minor)
**Released: January 22, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-filter"}
#description
Feature release introducing a powerful Search & Filtering DSL with multiple search engine adapters, QueryFilter classes, and comprehensive filtering operators for building flexible API queries.
::

### Key Highlights

::card
**Search Engine Adapters**
- Pluggable search backends: Database (LIKE), Elasticsearch, Meilisearch
- Unified `SearchAdapterInterface` for consistent API
- Auto-migration for search index tracking table
- Optional dependency support (no extra packages required for basic usage)
::

::card
**QueryFilter Classes**
- Reusable filter classes for API resources
- Support for 20+ operators (eq, ne, gt, lt, in, between, like, etc.)
- Automatic query building with secure parameter binding
- Field whitelisting for security
::

::card
**Searchable ORM Trait**
- Add search functionality to any ORM model
- Automatic index synchronization on model changes
- Custom searchable fields configuration
- Batch indexing support
::

::card
**scaffold:filter Command**
- Generate QueryFilter classes from CLI
- Automatic field detection from models
- Customizable operator sets per field
::

### Search Engine Adapters

**Core Classes:**
| Class | Purpose |
|-------|---------|
| `SearchAdapterInterface` | Contract for search adapters |
| `SearchAdapter` | Base class with auto-migration |
| `SearchResult` | Value object for search results |
| `DatabaseAdapter` | SQL LIKE search (default) |
| `ElasticsearchAdapter` | Elasticsearch integration |
| `MeilisearchAdapter` | Meilisearch integration |

**Optional Packages:**
```bash
# For Elasticsearch support
composer require elasticsearch/elasticsearch:^8.0

# For Meilisearch support
composer require meilisearch/meilisearch-php:^1.0
```

### Filtering Operators

| Operator | Aliases | Description | Example |
|----------|---------|-------------|---------|
| `eq` | `=` | Equal to | `filter[status]=active` |
| `ne` | `!=`, `<>` | Not equal | `filter[status][ne]=deleted` |
| `gt` | `>` | Greater than | `filter[age][gt]=18` |
| `gte` | `>=` | Greater or equal | `filter[price][gte]=100` |
| `lt` | `<` | Less than | `filter[stock][lt]=10` |
| `lte` | `<=` | Less or equal | `filter[rating][lte]=5` |
| `in` | | In array | `filter[status][in]=active,pending` |
| `nin` | `not_in` | Not in array | `filter[type][nin]=draft,archived` |
| `like` | `contains` | Contains substring | `filter[name][like]=john` |
| `starts` | | Starts with | `filter[email][starts]=admin` |
| `ends` | | Ends with | `filter[domain][ends]=.com` |
| `between` | | Range (inclusive) | `filter[price][between]=10,100` |
| `null` | `is_null` | Is null | `filter[deleted_at][null]=1` |
| `not_null` | | Is not null | `filter[verified_at][not_null]=1` |

### Quick Usage

```php
use Glueful\Api\Filtering\QueryFilter;
use Glueful\Api\Filtering\Adapters\DatabaseAdapter;
use Glueful\Api\Filtering\Concerns\Searchable;

// Create a QueryFilter
class UserFilter extends QueryFilter
{
    protected array $filterable = [
        'name' => ['eq', 'like', 'starts'],
        'email' => ['eq', 'like'],
        'status' => ['eq', 'in', 'nin'],
        'created_at' => ['gt', 'gte', 'lt', 'lte', 'between'],
    ];

    protected array $sortable = ['name', 'email', 'created_at'];
}

// Apply filter to query
$filter = new UserFilter($request);
$users = $filter->apply(QueryBuilder::table('users'))->get();

// Use Searchable trait in models
class User extends Model
{
    use Searchable;

    protected array $searchableFields = ['name', 'email', 'bio'];
}

// Search users
$results = User::search('john doe', [
    'fields' => ['name', 'email'],
    'limit' => 20,
]);

// Use search adapter directly
$adapter = new DatabaseAdapter('users');
$results = $adapter->search('john', [
    'fields' => ['name', 'email'],
    'limit' => 10,
]);
```

### Configuration

```php
// config/api.php
'filtering' => [
    'default_limit' => 25,
    'max_limit' => 100,
    'allow_all_fields' => false,
    'strict_mode' => true,

    // Search engine configuration
    'search' => [
        // Options: 'database', 'elasticsearch', 'meilisearch'
        'driver' => env('API_SEARCH_DRIVER', 'database'),
        'index_prefix' => env('SEARCH_INDEX_PREFIX', ''),
        'auto_index' => env('SEARCH_AUTO_INDEX', false),

        // Elasticsearch (requires: elasticsearch/elasticsearch:^8.0)
        'elasticsearch' => [
            'hosts' => [env('ELASTICSEARCH_HOST', 'localhost:9200')],
        ],

        // Meilisearch (requires: meilisearch/meilisearch-php:^1.0)
        'meilisearch' => [
            'host' => env('MEILISEARCH_HOST', 'http://localhost:7700'),
            'key' => env('MEILISEARCH_KEY'),
        ],
    ],
],
```

### CLI Commands

```bash
# Generate a filter class
php glueful scaffold:filter UserFilter

# Generate with specific model
php glueful scaffold:filter UserFilter --model=User

# Generate with custom fields
php glueful scaffold:filter ProductFilter --fields=name,price,category,status
```

---

## v1.18.0 - Hadar (Minor)
**Released: January 22, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-webhook"}
#description
Feature release introducing a comprehensive Webhooks System with event-driven integrations, subscription management, HMAC signature verification, and reliable delivery with exponential backoff retry.
::

### Key Highlights

::card
**Event-Based Subscriptions**
- Subscribe to specific events or wildcard patterns (`user.*`, `*`)
- Multiple event patterns per subscription
- `WebhookSubscription` ORM model with `listensTo()` wildcard matching
::

::card
**HMAC-SHA256 Signatures**
- Stripe-style signature format (`t=timestamp,v1=signature`)
- Timing-safe comparison to prevent timing attacks
- Timestamp validation to prevent replay attacks
- Configurable tolerance for signature expiration
::

::card
**Reliable Delivery System**
- Queue-based delivery via `DeliverWebhookJob`
- Exponential backoff retry: 1m, 5m, 30m, 2h, 12h
- Maximum 5 retry attempts (configurable)
- `WebhookDelivery` ORM model for tracking
::

::card
**Auto-Migration**
- Database tables created automatically on first use
- Follows `DatabaseLogHandler` pattern
- Zero configuration required
::

### Webhooks Components

**Core Classes:**
| Class | Purpose |
|-------|---------|
| `WebhookDispatcher` | Central dispatcher with auto-migration |
| `WebhookSubscription` | ORM model for subscriptions |
| `WebhookDelivery` | ORM model for delivery tracking |
| `WebhookSignature` | HMAC signature generation/verification |
| `WebhookPayload` | Standardized payload builder |
| `Webhook` | Static facade for easy access |

**Event Integration:**
| Class | Purpose |
|-------|---------|
| `DispatchesWebhooks` | Trait for webhookable events |
| `#[Webhookable]` | PHP 8 attribute for marking events |
| `WebhookEventListener` | Bridge app events to webhooks |
| `WebhookDispatchedEvent` | Event fired when webhooks queued |

**CLI Commands:**
| Command | Purpose |
|---------|---------|
| `webhook:list` | List all webhook subscriptions |
| `webhook:test` | Test a webhook endpoint |
| `webhook:retry` | Retry failed webhook deliveries |

### REST API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/webhooks/subscriptions` | Create subscription |
| `GET` | `/api/webhooks/subscriptions` | List subscriptions |
| `GET` | `/api/webhooks/subscriptions/{id}` | Get subscription |
| `PATCH` | `/api/webhooks/subscriptions/{id}` | Update subscription |
| `DELETE` | `/api/webhooks/subscriptions/{id}` | Delete subscription |
| `POST` | `/api/webhooks/subscriptions/{id}/test` | Send test webhook |
| `GET` | `/api/webhooks/deliveries` | List deliveries |
| `POST` | `/api/webhooks/deliveries/{id}/retry` | Retry delivery |

### Quick Usage

```php
use Glueful\Api\Webhooks\Webhook;
use Glueful\Api\Webhooks\WebhookSignature;

// Dispatch a webhook
Webhook::dispatch('user.created', ['user' => $userData]);

// Create a subscription
$subscription = Webhook::subscribe(
    ['user.*', 'order.completed'],
    'https://example.com/webhooks'
);

// Make an event webhookable
class UserCreated extends BaseEvent
{
    use DispatchesWebhooks;

    public function webhookEventName(): string
    {
        return 'user.created';
    }

    public function webhookPayload(): array
    {
        return ['user' => $this->user];
    }
}

// Verify webhook signature (for receiving webhooks)
$isValid = WebhookSignature::verify(
    $payload,
    $request->headers->get('X-Webhook-Signature'),
    $secret
);
```

### Webhook Payload Structure

```json
{
    "id": "wh_evt_01HXYZ123456789ABCDEF",
    "event": "user.created",
    "created_at": "2026-01-22T12:00:00+00:00",
    "data": {
        "user": {
            "id": "usr_01HXYZ987654321FEDCBA",
            "email": "john@example.com",
            "name": "John Doe"
        }
    }
}
```

### Webhook Headers

| Header | Description | Example |
|--------|-------------|---------|
| `X-Webhook-ID` | Unique delivery ID | `wh_del_01HXYZ...` |
| `X-Webhook-Event` | Event name | `user.created` |
| `X-Webhook-Timestamp` | Unix timestamp | `1706011200` |
| `X-Webhook-Signature` | HMAC signature | `t=1706011200,v1=abc...` |
| `Content-Type` | Always JSON | `application/json` |
| `User-Agent` | Glueful identifier | `Glueful-Webhooks/1.0` |

### Configuration

```php
// config/api.php
'webhooks' => [
    'enabled' => true,
    'queue' => 'webhooks',
    'connection' => null,
    'signature_header' => 'X-Webhook-Signature',
    'signature_algorithm' => 'sha256',
    'timeout' => 30,
    'user_agent' => 'Glueful-Webhooks/1.0',
    'retry' => [
        'max_attempts' => 5,
        'backoff' => [60, 300, 1800, 7200, 43200],
    ],
    'require_https' => true,
    'cleanup' => [
        'keep_successful_days' => 7,
        'keep_failed_days' => 30,
    ],
]
```

### Migration Notes

::u-alert{color="info" variant="subtle" icon="i-tabler-info-circle"}
#description
No breaking changes. The Webhooks System is opt-in and additive. Database tables are created automatically on first use.
::

- Auto-migration creates `webhook_subscriptions` and `webhook_deliveries` tables
- Webhooks are delivered asynchronously via the queue system
- Integrates with existing `WebhookDeliveredEvent` and `WebhookFailedEvent`

---

## v1.17.0 - Alnitak (Minor)
**Released: January 22, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-shield-check"}
#description
Feature release introducing comprehensive Rate Limiting Enhancements with per-route limits, tiered access, cost-based limiting, and multiple algorithms.
::

### Key Highlights

::card
**Per-Route Rate Limiting**
- `#[RateLimit]` attribute for declarative rate limiting on controllers and methods
- IS_REPEATABLE for defining multiple time windows (e.g., per-minute AND per-hour limits)
- Configurable by tier, key pattern, algorithm, and identifier (IP, user, custom)
::

::card
**Tiered Rate Limiting**
- Built-in tiers: `anonymous`, `free`, `pro`, `enterprise`
- Per-tier limits for minute, hour, and day windows
- `TierResolver` for automatic tier detection from request user data
- Unlimited tier support for enterprise users
::

::card
**Multiple Algorithms**
- Fixed Window - Simple time-window counting
- Sliding Window - More accurate request distribution using sorted sets
- Token Bucket - Burst-friendly with refill rate calculation
::

::card
**Cost-Based Limiting**
- `#[RateLimitCost]` attribute for expensive operations
- Consume multiple units per request (e.g., exports cost 100 units)
- Reason tracking for cost documentation
::

### Rate Limiting Components

**Core Classes:**
| Class | Purpose |
|-------|---------|
| `RateLimitManager` | Central orchestrator for rate limiting operations |
| `TierManager` | Tier configuration and limit lookup |
| `TierResolver` | Resolve user tier from request |
| `RateLimitHeaders` | IETF-compliant header generation |
| `RateLimitResult` | Immutable result value object |

**Limiters:**
| Class | Algorithm |
|-------|-----------|
| `FixedWindowLimiter` | Simple fixed time window |
| `SlidingWindowLimiter` | Sliding window using sorted sets |
| `TokenBucketLimiter` | Token bucket with burst support |

**Storage Backends:**
| Class | Purpose |
|-------|---------|
| `CacheStorage` | Production storage using `CacheStore` |
| `MemoryStorage` | In-memory storage for testing |

### Attributes

**RateLimit Attribute:**
```php
#[RateLimit(
    attempts: 60,           // Max requests
    perMinutes: 1,          // Time window (or perHours, perDays)
    tier: 'free',           // Optional tier restriction
    key: 'custom:{ip}',     // Custom key pattern
    algorithm: 'sliding',   // fixed, sliding, or bucket
    by: 'ip'                // Identifier: ip, user, or custom
)]
```

**RateLimitCost Attribute:**
```php
#[RateLimitCost(
    cost: 100,
    reason: 'Full data export operation'
)]
```

### IETF-Compliant Headers

The middleware adds standardized rate limit headers:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1706011260
RateLimit-Limit: 60
RateLimit-Remaining: 45
RateLimit-Reset: 1706011260
RateLimit-Policy: 60;w=60
Retry-After: 30  (when rate limited)
```

### Quick Usage

```php
use Glueful\Api\RateLimiting\Attributes\{RateLimit, RateLimitCost};

class UserController
{
    // 60 requests per minute, 1000 per hour
    #[RateLimit(attempts: 60, perMinutes: 1)]
    #[RateLimit(attempts: 1000, perHours: 1)]
    public function index(): Response { }

    // Tiered limits - different limits per subscription tier
    #[RateLimit(tier: 'free', attempts: 100, perDays: 1)]
    #[RateLimit(tier: 'pro', attempts: 10000, perDays: 1)]
    public function search(): Response { }

    // Cost-based limiting - expensive operations
    #[RateLimit(attempts: 1000, perDays: 1)]
    #[RateLimitCost(cost: 100, reason: 'Full data export')]
    public function export(): Response { }
}

// Route-level configuration
$router->get('/api/users', [UserController::class, 'index'])
    ->middleware(['enhanced_rate_limit']);
```

### Configuration

```php
// config/api.php
'rate_limiting' => [
    'enabled' => true,
    'algorithm' => 'sliding',
    'default_tier' => 'anonymous',
    'tiers' => [
        'anonymous' => [
            'requests_per_minute' => 30,
            'requests_per_hour' => 500,
            'requests_per_day' => 5000,
        ],
        'free' => [
            'requests_per_minute' => 60,
            'requests_per_hour' => 1000,
            'requests_per_day' => 10000,
        ],
        'pro' => [
            'requests_per_minute' => 300,
            'requests_per_hour' => 10000,
            'requests_per_day' => 100000,
        ],
        'enterprise' => [
            'requests_per_minute' => null,  // unlimited
            'requests_per_hour' => null,
            'requests_per_day' => null,
        ],
    ],
    'headers' => [
        'enabled' => true,
        'include_legacy' => true,  // X-RateLimit-* headers
        'include_ietf' => true,    // RateLimit-* headers
    ],
    'bypass_ips' => '127.0.0.1,::1',
],
```

### Migration Notes

::u-alert{color="info" variant="subtle" icon="i-tabler-info-circle"}
#description
No breaking changes. The new enhanced rate limiting system is opt-in and coexists with the existing `RateLimiterMiddleware`.
::

- Existing `rate_limit:100,60,ip` middleware syntax continues to work
- New `enhanced_rate_limit` middleware is opt-in for attribute-based limiting
- Both systems can coexist in the same application

---

## v1.16.0 - Meissa (Minor)
**Released: January 22, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-versions"}
#description
Feature release introducing comprehensive API Versioning with multiple resolution strategies, deprecation system, and sunset headers.
::

### Key Highlights

::card
**Multiple Version Strategies**
- URL Prefix: `/v1/users`, `/v2/users`
- Header: `X-API-Version: 2.0`
- Query Parameter: `?api_version=2`
- Accept Header: `Accept: application/vnd.api+json;version=2`
::

::card
**Version Attributes**
- `#[Version]` for declaring version requirements on routes
- `#[Deprecated]` for marking deprecated endpoints with messages
- `#[Sunset]` for specifying retirement dates
::

::card
**Version Negotiation**
- Automatic version detection from request
- Fallback to default version when not specified
- Version comparison and constraint matching
::

### API Versioning Components

**Core Classes:**
| Class | Purpose |
|-------|---------|
| `VersionManager` | Central manager for version resolution |
| `ApiVersion` | Value object for version representation |
| `VersionNegotiationMiddleware` | Automatic version detection |

**Resolvers:**
| Class | Strategy |
|-------|----------|
| `UrlPrefixResolver` | Extract version from URL path (`/v1/`) |
| `HeaderResolver` | Read `X-API-Version` header |
| `QueryParameterResolver` | Read `api_version` query param |
| `AcceptHeaderResolver` | Parse Accept header media type |

**Attributes:**
| Attribute | Purpose |
|-----------|---------|
| `#[Version]` | Declare version requirements |
| `#[Deprecated]` | Mark deprecated endpoints |
| `#[Sunset]` | Specify sunset/retirement date |

### Quick Usage

```php
use Glueful\Api\Versioning\Attributes\{Version, Deprecated, Sunset};

class UserController
{
    #[Version('1.0')]
    public function indexV1(): Response
    {
        return $this->json(['users' => $this->legacyFormat()]);
    }

    #[Version('2.0')]
    public function indexV2(): Response
    {
        return $this->json(['data' => $this->modernFormat()]);
    }

    #[Version('1.0')]
    #[Deprecated(message: 'Use v2 endpoint instead', since: '2026-01-01')]
    #[Sunset(date: '2026-06-01')]
    public function legacyEndpoint(): Response
    {
        // Deprecation warning headers automatically added
        return $this->json(['legacy' => true]);
    }
}
```

### Response Headers

Deprecation and sunset information is communicated via headers:

```
Deprecation: true
Sunset: Sat, 01 Jun 2026 00:00:00 GMT
X-API-Deprecated-Message: Use v2 endpoint instead
X-API-Version: 1.0
```

### Configuration

```php
// config/api.php
'versioning' => [
    'enabled' => true,
    'default' => 'v1',
    'strategy' => 'url',  // url, header, query, accept
    'header' => 'X-API-Version',
    'query_param' => 'api_version',
    'deprecation' => [
        'sunset_header' => true,
        'warning_header' => true,
    ],
],
```

### Migration Notes

::u-alert{color="info" variant="subtle" icon="i-tabler-info-circle"}
#description
No breaking changes. API versioning is opt-in and additive.
::

- Versioning is entirely opt-in - existing routes continue to work unchanged
- Apply `#[Version]` attributes only where version-specific behavior is needed
- Use middleware `version_negotiation` to enable automatic version detection

---

## v1.15.0 - Rigel (Minor)
**Released: January 22, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-server"}
#description
Feature release introducing Real-Time Development Server with file watching, integrated services, and enhanced logging.
::

### Key Highlights

::card
**File Watching**
- Automatic file change detection with configurable polling
- Auto-restart on code changes with `--watch` option
- Configurable poll interval via `--poll-interval`
::

::card
**Integrated Services**
- `--queue` option for integrated queue worker
- Port auto-selection when preferred port is in use
- Graceful shutdown handling
::

::card
**Enhanced Logging**
- Colorized HTTP request logging
- Method and status code highlighting
- Request timing information
::

### Development Server Components

**Core Classes:**
| Class | Purpose |
|-------|---------|
| `FileWatcher` | File change detection with polling |
| `RequestLogger` | Colorized request logging |
| `LogEntry` | Structured request log entries |

### Quick Usage

```bash
# Basic development server
php glueful serve

# With file watching (auto-restart on changes)
php glueful serve --watch

# With integrated queue worker
php glueful serve --queue

# Custom port and poll interval
php glueful serve --port=8080 --watch --poll-interval=2000

# Full development setup
php glueful serve --watch --queue --port=8000
```

### Command Options

| Option | Description |
|--------|-------------|
| `--port=8000` | Specify the port (default: 8000) |
| `--host=localhost` | Specify the host (default: localhost) |
| `--watch` | Enable file watching for auto-restart |
| `--queue` | Start integrated queue worker |
| `--poll-interval=1000` | File watch poll interval in ms |

### Migration Notes

::u-alert{color="info" variant="subtle" icon="i-tabler-info-circle"}
#description
No breaking changes. All new features are opt-in via command flags.
::

- Existing `php glueful serve` continues to work unchanged
- New features activated via `--watch` and `--queue` flags
- Completes Priority 2 developer experience features

---

## v1.14.0 - Bellatrix (Minor)
**Released: January 22, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-sparkles"}
#description
Feature release introducing Interactive CLI Wizards for enhanced developer experience with interactive prompts, progress bars, and spinner animations.
::

### Key Highlights

::card
**Prompter Class**
- Fluent API for CLI prompts with automatic non-interactive fallback
- `ask()`, `askRequired()` - Text input with validation
- `secret()` - Hidden input for passwords/secrets
- `confirm()` - Yes/no confirmation prompts
- `choice()`, `multiChoice()` - Single and multiple selection menus
- `suggest()` - Input with auto-completion suggestions
::

::card
**Progress Indicators**
- Enhanced `ProgressBar` wrapper with predefined formats
- `iterate()` generator for automatic progress tracking
- `Spinner` class with multiple animation styles
- Easy `withProgress()` and `withSpinner()` helpers in BaseCommand
::

::card
**Interactive Scaffold Commands**
- Scaffold commands now prompt for arguments when not provided
- `scaffold:model` supports full interactive mode
- Maintains CLI compatibility with `--no-interaction` flag
- Graceful fallback to defaults in CI/CD environments
::

### Interactive Components

**Prompter Methods:**
| Method | Description |
|--------|-------------|
| `ask(question, default, validator)` | Text input with optional validation |
| `askRequired(question, default)` | Required text input |
| `secret(question, validator)` | Hidden input for passwords |
| `confirm(question, default)` | Yes/no confirmation |
| `choice(question, choices, default)` | Single selection from options |
| `multiChoice(question, choices, defaults)` | Multiple selection |
| `suggest(question, suggestions, default)` | Input with auto-completion |

**Progress Formats:**
| Format | Description |
|--------|-------------|
| `FORMAT_NORMAL` | Basic progress display |
| `FORMAT_VERBOSE` | Progress with elapsed time |
| `FORMAT_VERY_VERBOSE` | Progress with elapsed and estimated time |
| `FORMAT_DEBUG` | Full progress with memory usage |
| `FORMAT_WITH_MESSAGE` | Progress with custom message |

**Spinner Styles:**
| Style | Animation |
|-------|-----------|
| `dots` | Braille dot animation (default) |
| `line` | Classic line spinner |
| `arrows` | Directional arrows |
| `bouncing` | Bouncing dots |
| `growing` | Growing bar |
| `circle` | Circle quadrants |
| `square` | Square quadrants |
| `toggle` | Toggle switch |
| `simple` | Simple dots |

### BaseCommand Helpers

**New Methods:**
| Method | Description |
|--------|-------------|
| `getPrompter()` | Get Prompter instance |
| `isInteractive()` | Check if running interactively |
| `prompt()` | Quick text input |
| `promptRequired()` | Quick required text input |
| `multiChoice()` | Multi-select from options |
| `suggest()` | Input with auto-completion |
| `createEnhancedProgressBar()` | Get enhanced progress bar |
| `createSpinner()` | Create spinner instance |
| `withProgress(items, callback)` | Process items with progress |
| `withSpinner(callback, message)` | Run task with spinner |
| `confirmDestructive(message)` | Confirmation for destructive ops |

### Migration Notes

::u-alert{color="info" variant="subtle" icon="i-tabler-info-circle"}
#description
No breaking changes. All interactive features gracefully fallback to defaults when `--no-interaction` flag is used.
::

**Non-Interactive Mode:**
```bash
# All prompts use defaults in CI/CD
php glueful scaffold:model User --migration --no-interaction
```

### Requirements
- No additional dependencies required
- All features built on existing Symfony Console components

---

## v1.13.0 - Saiph (Minor)
**Released: January 22, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-tools"}
#description
Feature release introducing Enhanced Scaffold Commands and Database Factories & Seeders, completing Priority 2 developer experience features.
::

### Key Highlights

::card
**Enhanced Scaffold Commands**
- `scaffold:middleware` - Generate route middleware implementing `RouteMiddleware`
- `scaffold:job` - Generate queue jobs with configurable retries and timeouts
- `scaffold:rule` - Generate validation rules with parameter support
- `scaffold:test` - Generate PHPUnit unit and feature test classes
::

::card
**Database Factories**
- Factory base class with fluent interface for test data generation
- Factory states for model variations (e.g., `->admin()`, `->unverified()`)
- Sequences for rotating attribute values across created models
- Relationship support with `has()` and `for()` methods
- `HasFactory` trait for ORM models enabling `Model::factory()` syntax
::

::card
**Database Seeders**
- Seeder base class with dependency ordering
- Transaction support for atomic seeding operations
- `db:seed` command with production environment protection
- `scaffold:seeder` command for generating seeder classes
::

### Scaffold Commands

**New Commands:**
| Command | Purpose |
|---------|---------|
| `scaffold:middleware` | Generate middleware implementing `RouteMiddleware` |
| `scaffold:job` | Generate queue job classes extending `Job` |
| `scaffold:rule` | Generate validation rule classes implementing `Rule` |
| `scaffold:test` | Generate PHPUnit test classes (unit/feature) |
| `scaffold:factory` | Generate model factory classes |
| `scaffold:seeder` | Generate database seeder classes |
| `db:seed` | Run database seeders |

**Command Options:**
| Command | Options |
|---------|---------|
| `scaffold:middleware` | `--force`, `--path` |
| `scaffold:job` | `--queue`, `--tries`, `--backoff`, `--timeout`, `--unique` |
| `scaffold:rule` | `--params`, `--implicit` |
| `scaffold:test` | `--unit`, `--feature`, `--class`, `--methods` |
| `scaffold:factory` | `--model`, `--force`, `--path` |
| `scaffold:seeder` | `--model`, `--force`, `--path` |
| `db:seed` | `--force` (required in production) |

### Factory Components

**Core Classes:**
| Class | Purpose |
|-------|---------|
| `Factory` | Base class for model factories with fluent interface |
| `FakerBridge` | Bridge to optional Faker library with availability checking |
| `HasFactory` | Trait for models to enable `Model::factory()` syntax |

**Factory Methods:**
| Method | Purpose |
|--------|---------|
| `definition()` | Define default model attributes |
| `count(int $n)` | Set number of models to create |
| `state(array\|string\|callable)` | Apply state transformations |
| `sequence(array...)` | Rotate attribute values |
| `make()` / `create()` | Build models (without/with persistence) |
| `has(string $relation, int\|Factory)` | Create with has-many relationships |
| `for(string $relation, Factory\|Model)` | Create with belongs-to relationships |
| `recycle(Collection\|Model)` | Reuse existing models for relationships |

### Seeder Components

**Core Classes:**
| Class | Purpose |
|-------|---------|
| `Seeder` | Base class for database seeders |
| `DatabaseSeeder` | Main orchestrator for all seeders |

**Seeder Methods:**
| Method | Purpose |
|--------|---------|
| `run()` | Abstract method to implement seeding logic |
| `call(string\|array $class)` | Call other seeders |
| `withTransaction(callable)` | Wrap operations in database transaction |
| `truncate(string $table)` | Clear table before seeding |

### Quick Usage

```php
// Define a factory
class UserFactory extends Factory
{
    protected string $model = User::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'status' => 'active',
        ];
    }

    public function admin(): static
    {
        return $this->state(['role' => 'admin']);
    }
}

// Use the factory
$user = User::factory()->create();
$admins = User::factory()->count(5)->admin()->create();

// Create with relationships
$user = User::factory()
    ->has('posts', 3)
    ->create();
```

```php
// Define a seeder
class UserSeeder extends Seeder
{
    protected array $dependencies = [RoleSeeder::class];

    public function run(): void
    {
        User::factory()->admin()->create([
            'email' => 'admin@example.com',
        ]);

        User::factory()->count(50)->create();
    }
}

// Run seeders
// php glueful db:seed
// php glueful db:seed UserSeeder
// php glueful db:seed --force (production)
```

### Console Commands

```bash
# Generate scaffold classes
php glueful scaffold:middleware AuthMiddleware
php glueful scaffold:job ProcessPaymentJob --queue=payments --tries=3
php glueful scaffold:rule PhoneNumber --params=country
php glueful scaffold:test UserTest --feature --class=UserController

# Generate factories and seeders
php glueful scaffold:factory UserFactory --model=User
php glueful scaffold:seeder UserSeeder --model=User

# Run seeders
php glueful db:seed
php glueful db:seed UserSeeder
php glueful db:seed --force  # Required in production
```

### Migration Notes
- No breaking changes. All features are opt-in and additive.
- Factories require `fakerphp/faker` as a dev dependency: `composer require --dev fakerphp/faker`
- The `db:seed` command requires `--force` flag to run in production environments.
- Generated files are placed in `database/factories/` and `database/seeders/`.

---

## v1.12.0 - Mintaka (Minor)
**Released: January 21, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-transform"}
#description
Feature release introducing API Resource Transformers, completing the Priority 1 features for the framework's output layer.
::

### Key Highlights

::card
**JSON Resource Transformation**
- JsonResource base class for transforming any data to JSON
- Conditional attributes with `when()`, `mergeWhen()`, `whenHas()`, `whenNotNull()`
- Response wrapping with configurable wrapper key
- Additional metadata support via `additional()` method
::

::card
**Model Resources**
- ModelResource with ORM-specific helpers
- `attribute()` and `dateAttribute()` for safe attribute access
- `relationshipResource()` and `relationshipCollection()` for nested transformations
- `whenLoaded()`, `whenCounted()`, `whenPivotLoaded()` for relationships
::

::card
**Collections & Pagination**
- ResourceCollection for multiple items with metadata
- PaginatedResourceResponse with link generation
- Support for both QueryBuilder and ORM pagination formats
- `withPaginationFrom()` and `withLinks()` helpers
::

### Resource Components

**Core Classes:**
| Class | Purpose |
|-------|---------|
| `JsonResource` | Base class for transforming arrays/objects to JSON |
| `ModelResource` | Extended resource with ORM-specific helpers |
| `ResourceCollection` | Collection wrapper with metadata support |
| `PaginatedResourceResponse` | Pagination handling with link generation |
| `AnonymousResourceCollection` | Collection without dedicated class |
| `MissingValue` | Sentinel for conditional attribute omission |

**Conditional Attribute Methods:**
| Method | Purpose |
|--------|---------|
| `when($condition, $value, $default)` | Include attribute conditionally |
| `mergeWhen($condition, $attributes)` | Merge multiple attributes conditionally |
| `whenHas($key)` | Include if key exists in source |
| `whenNotNull($value)` | Include if value is not null |
| `whenLoaded($relation)` | Include if relationship is loaded |
| `whenCounted($relation)` | Include relationship count if available |
| `whenPivotLoaded($table, $key)` | Include pivot table data |

**ModelResource Helpers:**
| Method | Purpose |
|--------|---------|
| `attribute($key, $default)` | Get model attribute with default |
| `dateAttribute($key)` | Format date as ISO 8601 |
| `whenDateNotNull($key)` | Include date only if not null |
| `relationshipResource($relation, $class)` | Transform single relationship |
| `relationshipCollection($relation, $class)` | Transform collection relationship |
| `isRelationLoaded($relation)` | Check if relationship is loaded |

### Quick Usage

```php
use Glueful\Http\Resources\JsonResource;
use Glueful\Http\Resources\ModelResource;

// Basic resource
class UserResource extends JsonResource
{
    public function toArray(): array
    {
        return [
            'id' => $this->resource['uuid'],
            'name' => $this->resource['name'],
            'email' => $this->when(
                $this->isAdmin(),
                $this->resource['email']
            ),
        ];
    }
}

// Model resource with relationships
class PostResource extends ModelResource
{
    public function toArray(): array
    {
        return [
            'id' => $this->attribute('uuid'),
            'title' => $this->attribute('title'),
            'created_at' => $this->dateAttribute('created_at'),
            'author' => $this->relationshipResource('author', UserResource::class),
            'comments_count' => $this->whenCounted('comments'),
        ];
    }
}

// Controller usage
public function index(): Response
{
    $posts = Post::with('author')->withCount('comments')->paginate(25);

    return PostResource::collection($posts['data'])
        ->withPaginationFrom($posts)
        ->withLinks('/api/posts')
        ->toResponse();
}
```

### Console Commands

```bash
# Generate a basic resource
php glueful scaffold:resource UserResource

# Generate a model resource
php glueful scaffold:resource UserResource --model

# Generate a collection
php glueful scaffold:resource UserCollection --collection

# Overwrite existing
php glueful scaffold:resource UserResource --force
```

### Migration Notes
- No breaking changes. API Resources are opt-in and additive.
- Existing controllers and responses continue to work unchanged.
- Resources provide a transformation layer; use them when you need consistent JSON structures.

---

## v1.11.0 - Alnilam (Minor)
**Released: January 21, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-database"}
#description
Feature release introducing the ORM/Active Record system, completing the data layer of Priority 1 features.
::

### Key Highlights

::card
**Active Record ORM**
- Complete Active Record pattern implementation built on QueryBuilder
- Model base class with CRUD operations and mass assignment protection
- Builder class with eager loading and global scope support
- Rich Collection class for model results
::

::card
**Relationships**
- HasOne, HasMany, BelongsTo for basic relationships
- BelongsToMany with pivot table support
- HasOneThrough and HasManyThrough for indirect relationships
- Eager loading to prevent N+1 query problems
::

::card
**Model Features**
- Attribute casting with custom cast classes
- SoftDeletes trait for recoverable deletion
- HasTimestamps for automatic date management
- Model lifecycle events integrated with framework events
::

### ORM Components

**Core Classes:**
| Class | Purpose |
|-------|---------|
| `Model` | Base class for all models with CRUD, attributes, and relations |
| `Builder` | Query builder wrapper with model-aware functionality |
| `Collection` | Rich collection class for model results |
| `Pivot` | Pivot model for many-to-many relationships |

**Relationships:**
| Relationship | Use Case |
|--------------|----------|
| `HasOne` | One-to-one (owning side) |
| `HasMany` | One-to-many |
| `BelongsTo` | Inverse of HasOne/HasMany |
| `BelongsToMany` | Many-to-many with pivot table |
| `HasOneThrough` | One-to-one through intermediate model |
| `HasManyThrough` | One-to-many through intermediate model |

**Traits:**
| Trait | Purpose |
|-------|---------|
| `HasAttributes` | Attribute get/set, casting, dirty tracking |
| `HasRelationships` | Relationship definition and eager loading |
| `HasTimestamps` | Automatic `created_at`/`updated_at` |
| `HasEvents` | Model lifecycle event integration |
| `HasGlobalScopes` | Global query scope management |
| `SoftDeletes` | Soft delete with `deleted_at` column |

**Custom Casts:**
| Cast | Purpose |
|------|---------|
| `AsJson` | JSON encode/decode |
| `AsArrayObject` | JSON to ArrayObject |
| `AsCollection` | JSON to Collection |
| `AsDateTime` | String to DateTimeImmutable |
| `AsEncryptedString` | Transparent encryption |
| `AsEnum` | Backed enum casting |
| `Attribute` | Custom getter/setter accessors |

### Quick Usage

```php
use Glueful\Database\ORM\Model;
use Glueful\Database\ORM\Concerns\{HasTimestamps, SoftDeletes};

class User extends Model
{
    use HasTimestamps, SoftDeletes;

    protected string $table = 'users';
    protected array $fillable = ['name', 'email'];
    protected array $casts = [
        'settings' => 'array',
        'email_verified_at' => 'datetime',
    ];

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }
}

// CRUD operations
$user = User::find(1);
$user = User::create(['name' => 'John', 'email' => 'john@example.com']);
$user->update(['name' => 'Jane']);
$user->delete(); // Soft delete

// Eager loading
$users = User::with('posts')->get();

// Query scopes
$active = User::where('status', 'active')->get();
```

### Console Commands

```bash
# Generate a new model
php glueful scaffold:model User

# With migration
php glueful scaffold:model Post --migration

# With soft deletes and timestamps
php glueful scaffold:model Comment --soft-deletes --timestamps

# With fillable attributes
php glueful scaffold:model Product --fillable=name,price,description
```

### Migration Notes
- No breaking changes. The ORM is opt-in and additive.
- Existing QueryBuilder code continues to work unchanged.
- Models require `Model::setContainer()` which is called automatically during framework boot.

---

## v1.10.0 - Elnath (Minor)
**Released: January 21, 2026**

::u-alert{color="success" variant="subtle" icon="i-tabler-shield-check"}
#description
Feature release introducing centralized exception handling and declarative request validation, completing the foundation layer of Priority 1 features.
::

### Key Highlights

::card
**Centralized Exception Handling**
- New `ExceptionHandlerInterface` contract for customizable exception handling
- Typed HTTP exceptions for Client (4xx), Server (5xx), and Domain errors
- `ExceptionMiddleware` for automatic exception-to-response conversion
- Environment-aware error responses (detailed in dev, safe in production)
::

::card
**Declarative Request Validation**
- `#[Validate]` attribute for inline validation on controller methods
- `FormRequest` base class with authorization and data preparation hooks
- `ValidatedRequest` wrapper for type-safe validated data access
- Laravel-style string rule syntax via `RuleParser`
::

### Exception Handler

New typed exception classes provide semantic error handling:

**Client Exceptions (4xx):**
| Exception | HTTP Code | Use Case |
|-----------|-----------|----------|
| `BadRequestException` | 400 | Malformed request |
| `UnauthorizedException` | 401 | Missing/invalid credentials |
| `ForbiddenException` | 403 | Insufficient permissions |
| `NotFoundException` | 404 | Resource not found |
| `MethodNotAllowedException` | 405 | Wrong HTTP method |
| `ConflictException` | 409 | Resource conflict |
| `UnprocessableEntityException` | 422 | Validation failed |
| `TooManyRequestsException` | 429 | Rate limit exceeded |

**Server Exceptions (5xx):**
| Exception | HTTP Code | Use Case |
|-----------|-----------|----------|
| `InternalServerException` | 500 | Unexpected server error |
| `ServiceUnavailableException` | 503 | Service temporarily down |
| `GatewayTimeoutException` | 504 | Upstream timeout |

**Domain Exceptions:**
| Exception | Use Case |
|-----------|----------|
| `ModelNotFoundException` | Entity not found in database |
| `AuthenticationException` | Authentication failure |
| `AuthorizationException` | Permission denied |
| `TokenExpiredException` | JWT/session expired |

### Request Validation

**New Validation Rules:**
- `Confirmed` - Password confirmation matching
- `Date`, `Before`, `After` - Date validation and comparison
- `Url`, `Uuid`, `Json` - Format validation
- `Exists` - Database existence check
- `Nullable`, `Sometimes` - Conditional validation
- `File`, `Image`, `Dimensions` - File upload validation

### Quick Usage

```php
// Throwing typed exceptions
throw new NotFoundException('User not found', ['id' => $userId]);
throw new TooManyRequestsException(retryAfter: 60);

// Using #[Validate] attribute
#[Validate(['email' => 'required|email', 'name' => 'required|max:255'])]
public function store(ValidatedRequest $request): Response
{
    $data = $request->validated();
}

// Using FormRequest class
// Generate with: php bin/glueful make:request CreateUserRequest
public function store(CreateUserRequest $request): Response
{
    $data = $request->validated();
}
```

### Migration Notes
- No breaking changes. Both features are opt-in and additive.
- Existing controllers continue to work unchanged.
- Add `'validate'` middleware to routes for automatic validation.

---

## v1.9.2 - Deneb (Patch)
**Released: January 20, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-api"}
#description
OpenAPI 3.1 support with automatic resource route expansion from database schemas and documentation UI improvements.
::

### Key Highlights

::card
**OpenAPI 3.1 Support**
- Full JSON Schema draft 2020-12 alignment
- Nullable types use array syntax (`type: ["string", "null"]`)
- License supports SPDX `identifier` field
- `jsonSchemaDialect` declaration included
- Default version changed from 3.0.0 to 3.1.0
::

::card
**Resource Route Expansion**
- New `ResourceRouteExpander` class automatically expands `{resource}` routes
- Generates table-specific endpoints with full database schemas
- No more intermediate JSON files - schemas expand directly from database
- Resource tags renamed from "Resources - {table}" to "Table - {table}"
::

::card
**Documentation UI Improvements**
- Scalar: Added `hideClientButton` and `showDeveloperTools` options
- Tags in sidebar now sorted alphabetically
- Output file renamed from `swagger.json` to `openapi.json`
::

### Bug Fixes
- **Database**: Fixed `SchemaBuilder::getTableColumns()` returning empty arrays due to incorrect `array_is_list()` check on associative column data.

### Removed
- `TableDefinitionGenerator` class - resource routes now expand directly from database schemas
- `--database` and `--table` options from `generate:openapi` command (no longer needed)

### Migration Notes
- No breaking changes. The output file is now `openapi.json` instead of `swagger.json`.
- If you had custom scripts referencing `swagger.json`, update the path.
- Config key `paths.swagger` renamed to `paths.openapi`.

---

## v1.9.1 - Castor (Patch)
**Released: January 19, 2026**

::u-alert{color="info" variant="subtle" icon="i-tabler-ad-2"}
#description
Major refactor of the OpenAPI documentation system with interactive UI generation support for Scalar, Swagger UI, and Redoc.
::

### Key Highlights

::card
**Documentation UI Generation**
- New `DocumentationUIGenerator` class generates interactive HTML documentation
- Supports Scalar (default), Swagger UI, and Redoc
- New `--ui` option for `generate:openapi` command
- Centralized configuration in `config/documentation.php`
::

::card
**Documentation Architecture Refactor**
- Replaced `ApiDefinitionGenerator` with focused `TableDefinitionGenerator` and `OpenApiGenerator`
- Renamed `ApiDefinitionsCommand` to `OpenApiDocsCommand`
- `CommentsDocGenerator` now uses `phpDocumentor/ReflectionDocBlock` for robust PHPDoc parsing
- Extension routes discovered via `ExtensionManager::getProviders()` for Composer packages
::

### New Validation Rules
- `Numeric` - Validates numeric values with optional range, integer-only, and positive-only constraints
- `Regex` - Validates values against regular expression patterns

### Dependencies
- Updated Symfony packages from `^7.3` to `^7.4`
- Added `phpdocumentor/reflection-docblock: ^6.0`

### Quick Usage

```bash
# Generate docs with default UI (Scalar)
php glueful generate:openapi --ui

# Generate with specific UI
php glueful generate:openapi --ui=swagger-ui
php glueful generate:openapi --ui=redoc
```

### Migration Notes
- No breaking changes. The old `ApiDefinitionGenerator` is removed but the command interface remains compatible.
- If you referenced internal documentation classes directly, update to use `OpenApiGenerator` and `TableDefinitionGenerator`.

---

## v1.9.0 - Betelgeuse (Minor)
**Released: January 17, 2026**

::u-alert{color="warning" variant="subtle" icon="i-tabler-alert-triangle"}
#description
Raises minimum PHP version to 8.3 and addresses Symfony Console 7.3 compatibility. Review the upgrade guide before updating.
::

### Breaking Changes
- **PHP 8.3 Required**: Minimum PHP version raised from 8.2 to 8.3. Ensure your environment is updated before upgrading.
- **Console Method Renamed**: `Application::addCommand(string $class)` renamed to `Application::registerCommandClass(string $class)` due to Symfony Console 7.3 adding a conflicting `addCommand(Command|callable)` method.

### Key Highlights
- **Routing**: `RouteManifest::load()` now prevents double-loading routes during framework initialization, eliminating "Route already defined" warnings in CLI commands.
- **Security**: Fixed PHPStan strict boolean check in `CSRFMiddleware` for explicit cookie token validation.
- **Tests**: Added missing PSR-4 namespace declarations to async test files for proper autoloading.
- **CI**: Test matrix now targets PHP 8.3 and 8.4 (dropped PHP 8.2 support).

### New APIs
- `RouteManifest::reset()` - Reset loaded state (for testing)
- `RouteManifest::isLoaded()` - Check if routes have been loaded

### Migration Notes

::u-alert{color="warning" variant="subtle" icon="i-tabler-alert-triangle"}
#description
**Action Required**: Update your PHP environment to 8.3+ before upgrading.
::

1. **Environment**: Ensure PHP 8.3 or higher is installed
2. **Method Rename**: If you called `$app->addCommand(MyCommand::class)`, update to `$app->registerCommandClass(MyCommand::class)`
3. **Dependencies**: Run `composer update` to refresh the lock file

---

## v1.8.1 - Vega (Patch)
**Released: November 23, 2025**

::u-alert{color="info" variant="subtle" icon="i-tabler-ad-2"}
#description
Tightens password policy helpers with lowercase enforcement and makes the async stream helper smarter about buffering existing async transports.
::

### Key Highlights
- Security: `Utils::validatePassword()` now supports a `$requireLowercase` flag alongside existing numeric, special-character, and uppercase toggles, enabling mixed-case enforcement without custom validators.
- Async I/O: `async_stream()` accepts raw resources, `AsyncStream`, or `BufferedAsyncStream` instances and normalizes them before optionally wrapping in a buffer. This keeps buffered helpers type-safe and resolves analyzer warnings about expected vs. actual types.

### Migration Notes
- No breaking changes. Opt into the lowercase flag when updating password policies, and the stream helper works seamlessly with existing calls.

---

## v1.8.0 - Spica (Minor)
**Released: November 13, 2025**

::u-alert{color="info" variant="subtle" icon="i-tabler-ad-2"}
#description
First-class session and login response events. Safely enrich cached session payloads and shape login responses without modifying framework code.
::

### Key Highlights
- Events/Auth:
  - `SessionCachedEvent`: Dispatched after a session is written to cache (and DB). Listeners can augment the cached payload (e.g., `user.organization`) or warm caches.
  - `LoginResponseBuildingEvent`: Dispatched just before returning the login JSON. Provides a mutable response map so apps can add fields (e.g., `context.organization`).
  - `LoginResponseBuiltEvent`: Dispatched after the response is finalized for analytics/metrics.
- Wiring:
  - Session cached hook in `SessionCacheManager::storeSession()` after successful `cache->set`.
  - Login response hooks in `AuthController::login()` just before returning.
- Docs: Proposal updated with final API (setter-based mutation, paths under `src/...`) and example listeners.

### Migration Notes
- Backward compatible: No behavior change unless listeners are registered.
- Performance: Events are synchronous; offload heavy work to queues.
- Guidance: Prefer adding app-specific fields under `context.*` to avoid collisions.

---

## v1.7.4 - Arcturus (Patch)
**Released: October 28, 2025**

::u-alert{color="info" variant="subtle" icon="i-tabler-ad-2"}
#description
Minimal, configurable account‑status gate in AuthenticationService (secure by default).
::

### Key Highlights
- Auth: Enforce allowed statuses during username/password login and refresh‑token flows via `security.auth.allowed_login_statuses` (default `['active']`).
  - Fails silently to prevent account enumeration.
  - Policy intentionally lean for app‑level extension.
- Docs: Added `docs/migration-examples-views-functions.md` covering three approaches to create views/functions in migrations (SchemaBuilder queue, direct PDO exec, QueryBuilder DDL).

### Migration Notes
- If you experimented with `auth.allowed_login_statuses`, move it to `security.auth.allowed_login_statuses`.

---

## v1.7.3 - Pollux (Patch)
**Released: October 21, 2025**

::u-alert{color="info" variant="subtle" icon="i-tabler-ad-2"}
#description
QueryBuilder 2‑argument where/orWhere fix and clearer dev‑server logs.
::

### Key Highlights
- Database/QueryBuilder: Normalize 2‑argument `where($column, $value)` and `orWhere($column, $value)` to use `=` internally.
  - Prevents a TypeError when non‑string values were misread as the operator.
  - Improves portability for boolean filters across PostgreSQL/MySQL/SQLite.
- CLI: `serve` further reclassifies PHP built‑in server access/lifecycle lines written to STDERR (e.g., “Accepted”, “Closed without sending a request”, “[200]: GET /…”) as normal output, while preserving real errors.

---

## v1.7.2 - Antares (Patch)
**Released: October 21, 2025**

::u-alert{color="info" variant="subtle" icon="i-tabler-ad-2"}
#description
Route loading resilience and quieter dev‑server logs.
::

### Key Highlights
- Extensions: `ServiceProvider::loadRoutesFrom()` is idempotent and exception‑safe now.
  - Prevents duplicate route registration if a routes file is loaded more than once.
  - Catches exceptions from route files; logs and continues in production, rethrows in non‑production for fast feedback.
- CLI: `serve` reclassifies common PHP built‑in server access/startup lines from STDERR as normal output, reducing false `[ERROR]` noise.

---

## v1.7.1 - Canopus (Patch)
**Released: October 21, 2025**

::u-alert{color="info" variant="subtle" icon="i-tabler-ad-2"}
#description
Fixes extension discovery/boot sequencing so extensions reliably load and their migrations appear.
::

### Key Highlights
- Extensions: Call `ExtensionManager::discover()` before `::boot()` during framework initialization so enabled providers load correctly.
- Migrations: Extension migrations registered via `loadMigrationsFrom()` are discovered by `migrate:status`/`migrate:run` once providers are discovered at boot.
- CLI: `extensions:why`/`extensions:list` now reflect included providers after boot, improving diagnostics.

### Impact
- Apps that previously saw “No pending migrations found” for extension migrations should now see them once the provider is enabled. No config changes required.

---

## v1.7.0 - Procyon
**Released: October 18, 2025**

::u-alert{color="info" variant="subtle" icon="i-tabler-ad-2"}
#description
Major async/concurrency subsystem. Fiber‑based scheduler, async HTTP client with streaming/pooling, buffered I/O, cooperative cancellation, metrics instrumentation, and a Promise‑style wrapper. Centralized configuration and DI wiring included.
::

### Key Highlights

::card
**Fiber‑Based Async Scheduler**
- `Glueful\\Async\\FiberScheduler` with `spawn`, `all`, `race`, `sleep`
- Resource‑limit guards (max concurrent tasks, per‑task execution time, optional memory/FDS caps)
- Rich metrics hooks (suspend/resume, queue depth, cancellations, resource limits)
::

::card
**Async HTTP + Streaming**
- `Glueful\\Async\\Http\\CurlMultiHttpClient` with cooperative polling and optional `max_concurrent`
- `poolAsync()` for concurrent requests; `HttpStreamingClient::sendAsyncStream()` for chunked callbacks
- `FakeHttpClient` for test isolation
::

::card
**Async I/O + Helpers**
- `AsyncStream` and `BufferedAsyncStream` with line/whole‑read helpers and buffered reads/writes
- Helpers: `scheduler()`, `async()`, `await()`, `await_all()`, `await_race()`, `async_sleep()`, `async_sleep_default()`, `async_stream()`, `cancellation_token()`
- Promise wrapper: `Glueful\\Async\\Promise` with `then/catch/finally`, `all/race`
::

### Configuration & DI
- New `config/async.php` for `scheduler`, `http`, `streams`, `limits`
- `AsyncProvider` wires `Metrics`, `Scheduler`, `HttpClient`; registers `AsyncMiddleware` (alias `async`)

### Migration Notes
- Backward‑compatible defaults: limits disabled when set to 0
- To adopt in routes, add middleware alias `async` or use helpers (`async()`, `await_all()`, etc.)

---

## v1.6.2 - Capella
**Released: October 14, 2025**

::u-alert{color="info" variant="subtle" icon="i-tabler-ad-2"}
#description
Template configuration responsibility moved to the Email Notification extension.
::

### What's Changed
- The primary templates directory is now controlled by the Email Notification extension configuration
- Framework no longer sets a default `services.mail.templates.path`
- Custom paths, caching, layout, mappings, and globals remain supported

### Migration Notes
- If you relied on the framework default templates path, configure `email-notification.templates.extension_path` in the extension
- Or set `services.mail.templates.path` in your app config

---

## v1.6.1 - Arcturus
**Released: October 14, 2025**

::u-alert{color="info" variant="subtle" icon="i-tabler-ad-2"}
#description
JWT RS256 signing support for generating JWTs using an RSA private key.
::

### Key Highlights
- Auth/JWT: `JWTService::signRS256(array $claims, string $privateKey)`
- Requires PHP `openssl` extension

---

Risk scale: High = architectural changes / broad API shifts; Medium = targeted breaking or migration; Low = additive or internal refactors.

## v1.6.0 - Sirius
**Released: October 13, 2025**

::u-alert{color="info" variant="subtle" icon="i-tabler-ad-2"}
#description
Minor features and DX improvements. This release focuses on compiled DI artifacts, conditional HTTP caching helpers, and configuration utilities.
::

### Key Highlights

::card
**Compiled Container Artifacts**
- `di:container:compile` now emits `services.json` at `storage/cache/container/services.json` with fields: `shared`, `tags`, `provider`, `type`, `alias_of`.
- `di:container:map` prefers the compiled `services.json` in production (no reflection overhead).
- `ContainerFactory` prefers a precompiled container class in production when available.
::

::card
**Conditional HTTP Caching**
- New `ConditionalCacheMiddleware` handles ETag/If‑None‑Match and Last‑Modified/If‑Modified‑Since to return 304 efficiently.
- `Response::withLastModified(DateTimeInterface)` helper for setting validators.
::

::card
**DSN Utilities**
- `Glueful\\Config\\DsnParser` with `parseDbDsn()` and `parseRedisDsn()`.
- New CLI: `config:dsn:validate` validates DSNs from flags or environment (e.g., `DATABASE_URL`, `REDIS_URL`).
::

### Notes
- OpenTelemetry support is planned as a Glueful extension package (not part of the core framework).

---

## v1.5.0 - Orion
**Released: October 13, 2025**

::u-alert{color="info" variant="subtle" icon="i-tabler-ad-2"}
#description
Notifications DI wiring and safer email flows. This release introduces a shared notifications provider and makes email verification/password reset flows more robust.
::

### Key Highlights

::card
**Notifications DI Provider**
- New `NotificationsProvider` registers shared `ChannelManager` and `NotificationDispatcher` in the container.
- Extensions can register channels/hooks against the dispatcher during boot.
::

::card
**Safer Email Flows**
- Email verification and SendNotification now prefer DI‑resolved dispatcher/channel with safe fallbacks.
- Removed hard `ExtensionManager` prechecks; channel availability is evaluated at send time.
- Soft diagnostics when the email channel is unavailable or when no channels succeeded.
::

### What's Changed
- Retry configuration aligned to `email-notification.retry`.

---


## v1.4.2 - Rigel (Patch)
**Released: October 11, 2025**

::u-alert{color="info" variant="subtle" icon="i-tabler-ad-2"}
#description
Developer‑facing tidy‑ups; no runtime behavior changes.
::

### Fixes
- PSR‑4 autoloading for tests: corrected a test namespace to match `Glueful\\Tests\\…` and remove Composer warnings during autoload generation.

### Documentation
- Roadmap and this page updated to reflect 1.4.1’s SQLite‑first install flow and non‑interactive flags.

---

## v1.4.1 - Rigel (Patch)
**Released: October 11, 2025**

::u-alert{color="info" variant="subtle" icon="i-tabler-ad-2"}
#description
Installation flow hardening and SQLite‑first defaults. This patch improves non‑interactive installs and avoids fragile checks during initial setup.
::

### Key Highlights

::card
**SQLite‑first Install & Non‑Interactive Flags**
- Install enforces SQLite during setup; other engines can be configured after install
- `migrate:run` executed with `--force`; in quiet installs also `--no-interaction` and `--quiet`
- `cache:clear` during install passes `--force` and respects quiet mode flags
- Removed DB connection health check during install (SQLite does not require network; migrations surface issues)
::

### Quick Usage

```bash
# Default (SQLite) install
php glueful install --quiet --force

# After switching DB in .env, run migrations
php glueful migrate:run -f --no-interaction
```

### Notes
- Post‑install message now includes a brief guide for switching databases and running migrations later.

---

## v1.4.0 - Rigel
**Released: October 11, 2025**

::u-alert{color="info" variant="subtle" icon="i-tabler-ad-2"}
#description
**Rigel** consolidates session management behind a single, testable SessionStore API and removes the legacy TokenStorageService. It unifies TTL policy, standardizes DI resolution, and hardens cache-key handling for tokens.
::

### Key Highlights

::card
**Unified Session Store**
- New SessionStoreInterface + default SessionStore for create/update/revoke/lookup/health
- Canonical TTL helpers: `getAccessTtl()`, `getRefreshTtl()` (provider + remember‑me aware)
- DI consistency with SessionStoreResolver utility and ResolvesSessionStore trait
- Safe cache keys for token mappings (hashed tokens + sanitized prefixes)
::

### What's Changed

- TokenManager defers TTL policy to SessionStore and persists sessions via the store.
- JwtAuthenticationProvider and SessionCacheManager resolve the store via the trait; fewer ad‑hoc `new` calls.
- SessionAnalytics prefers the store for listing sessions (falls back to cache query when needed).
- JWTService cleanup; rely on DB‑backed revocation.

### Removed

- TokenStorageService and TokenStorageInterface (fully migrated to SessionStore).
- Deprecated code paths tied to the legacy storage/invalidation.

### Migration Notes

::u-alert{color="warning" variant="subtle" icon="i-tabler-alert-triangle"}
#description
If you previously referenced `TokenStorageService`, migrate to `SessionStoreInterface`:
::

```php
use Glueful\\Auth\\Interfaces\\SessionStoreInterface;

/** @var SessionStoreInterface $store */
$store = container()->get(SessionStoreInterface::class);

// Create
$created = $store->create($user, $tokens, 'jwt', false);

// Read / Update / Revoke
$session = $store->getByAccessToken($tokens['access_token']);
$updated = $store->updateTokens($tokens['refresh_token'], $newTokens);
$revoked = $store->revoke($newTokens['access_token']);
```

---

## v1.3.1 - Altair
**Released: October 10, 2025**

::u-alert{color="info" variant="subtle" icon="i-tabler-ad-2"}
#description
**Altair** improves CI/automation ergonomics: the installation command now runs truly non-interactive for scripted environments, and static analysis warnings are cleaned up.
::

### Key Highlights

::card
**Install Command: Non-Interactive Mode**
- `php glueful install` skips the environment confirmation prompt when any of these flags are present: `--quiet`, `--no-interaction`, or `--force`.
- Keeps helpful output; add Symfony's global `-q` if you want near-silent runs.
::

### What's Changed

- Unattended installs: skip `Have you set all required environment variables?` when running with `--quiet`, `--no-interaction`, or `--force`.
- DX: remove redundant `method_exists()` check around `InputInterface::isInteractive()` to satisfy PHPStan.

### Quick Usage

```bash
# CI-safe, non-interactive install
php glueful install --quiet --force

# Or use Symfony's global flag to reduce verbosity further
php glueful install --quiet --force -q
```

### Migration

- No action required. For CI pipelines, prefer `--quiet --force` to avoid prompts.

---

## v1.3.0 - Deneb
**Released: October 6, 2025**

::u-alert{color="info" variant="subtle" icon="i-tabler-ad-2"}
#description
**Deneb** refines the HTTP client with first-class, configurable retries via Symfony's retry system, improving resilience and clarity for API integrations.
::

### Key Highlights

::card
**HTTP Client Retry Support**
- Automatic retry logic with configurable strategies
- Built on Symfony's `RetryableHttpClient` for production-ready reliability
- Sensible defaults for common scenarios (payments, external APIs)
::

### What's New

- **Retry Configuration API**: New `Client::withRetry(array $config)` method to wrap any configured client with retry logic
- **ApiClientBuilder Enhancements**:
  - `retries()` - Configure retry behavior
  - `buildWithRetries()` - Build client with retries enabled
  - `getRetryConfig()` - Inspect retry configuration
- **Smart Defaults**: Preset retry configurations for payments and external service integrations

### Code Example

```php
use Glueful\Http\Client;
use Glueful\Http\Builders\ApiClientBuilder;

// Configure retries with custom settings via DI + scoped client
$client = app(Client::class)
    ->createScopedClient(['base_uri' => 'https://api.example.com'])
    ->withRetry([
        'max_retries' => 3,
        'delay_ms' => 1000,
        'multiplier' => 2.0,
        'status_codes' => [429, 500, 502, 503, 504],
    ]);

// Or use builder with presets
$apiClient = (new ApiClientBuilder(app(Client::class)))
    ->baseUri('https://payment-gateway.com')
    ->forPayments()
    ->buildWithRetries();
```

### Additional Context

Underlying change: retry logic migrated from prior internal handling to Symfony's strategy model (status-based exponential backoff) improving observability and consistency.

### Related Documentation
- [HTTP Client](/essentials/requests-responses#http-client)
- [Configuration](/advanced/configuration)

---

## v1.2.0 - Vega
**Released: September 23, 2025**

::u-alert{color="info" variant="subtle" icon="i-tabler-ad-2"}
#description
**Vega** introduces robust task management architecture and enhanced testing reliability. Named after one of the brightest stars in the night sky, this release brings enhanced reliability and clarity to task execution and framework testing infrastructure.
::

### Key Highlights

::card
**Tasks/Jobs Architecture**
- Clean separation of business logic (Tasks) from queue execution (Jobs)
- Support for both direct execution and queued processing
- Comprehensive task management system for common operations
::

### What's New

#### Task Management System
New task classes for common maintenance operations:
- `CacheMaintenanceTask` - Comprehensive cache maintenance
- `DatabaseBackupTask` - Automated backups with retention policies
- `LogCleanupTask` - Log file cleanup
- `NotificationRetryTask` - Retry failed notifications
- `SessionCleanupTask` - Session maintenance

#### Queue Job Wrappers
Reliable queue integration with dedicated job classes:
- `CacheMaintenanceJob`, `DatabaseBackupJob`, `LogCleanupJob`
- `NotificationRetryJob`, `SessionCleanupJob`
- Built-in failure handling and logging

#### Enhanced Console Commands
```bash
# New cache maintenance command with improved options
php glueful cache:maintenance --operation=clearExpiredKeys

# Enqueue instead of running immediately
php glueful cache:maintenance --operation=fullCleanup --queue
```

#### Comprehensive Testing Suite
- Complete integration test coverage for all Tasks and Jobs
- Enhanced test bootstrap with proper DI container management
- Fixed test interference issues

### Stability & Fixes

- Improved container state isolation in tests.
- Reduced interference between suites by refining bootstrap resets.

### Removed (for clarity)

- Legacy Cron classes replaced by Tasks + Queue Jobs.

### Migration Guide

::u-alert{color="warning" variant="subtle" icon="i-tabler-ad-2"}
#description
**Breaking Changes**: The `src/Cron/` directory has been removed in favor of the new `src/Tasks/` + `src/Queue/Jobs/` pattern.
::

#### Step 1: Update Namespace Imports

**Before:**
```php
use Glueful\Cron\CacheMaintenance;
use Glueful\Cron\DatabaseBackup;
```

**After:**
```php
use Glueful\Tasks\CacheMaintenanceTask;
use Glueful\Queue\Jobs\CacheMaintenanceJob;
```

#### Step 2: Update Service Registration

**Before:**
```php
// In your service provider
$container->set('cron.cache', CacheMaintenance::class);
```

**After:**
```php
// Tasks are auto-registered via TasksProvider
// For queued execution, push the Job wrapper via QueueManager:
use Glueful\Queue\Jobs\CacheMaintenanceJob;
use Glueful\Queue\QueueManager;

$queue = app(QueueManager::class);
$queue->push(CacheMaintenanceJob::class, ['operation' => 'clearExpiredKeys'], 'maintenance');
```

#### Step 3: Update Direct Execution

**Before:**
```php
$cronJob = new CacheMaintenance();
$cronJob->execute();
```

**After:**
```php
/** @var CacheMaintenanceTask $task */
$task = app(CacheMaintenanceTask::class);
$task->handle(['driver' => 'redis', 'operation' => 'clearExpiredKeys']);
```

### Related Documentation
- [Queues & Jobs](/features/queues-jobs)
- [Scheduling](/features/scheduling)
- [Testing](/advanced/testing)
- [Service Providers](/advanced/service-providers)

---

## v1.1.0 - Polaris
**Released: September 22, 2025**

::u-alert{color="info" variant="subtle" icon="i-tabler-ad-2"}
#description
**Polaris** introduces comprehensive testing infrastructure and enhanced documentation to guide framework development. Like the North Star that guides navigation, this release provides developers with the tools and knowledge to build robust applications.
::

### Key Highlights

::card
**Testing Infrastructure**
- Base `TestCase` class for application-level tests
- Framework state reset utilities for isolation
- Expanded event system documentation
::

### What's New

- **Testing Utilities**: Base `TestCase` with container access (`$this->get()`), app boot, refresh support
- **Event Documentation**: Expanded conceptual and usage coverage (listeners, dispatch patterns)
- **(Planned / Pending)** Event abstraction & HTTP helper methods (e.g. `post()`, `assertStatus()`) — not yet present in current codebase; will appear in a future minor.

### Example (Current Capabilities)

```php
use Glueful\Testing\TestCase;

final class UserLifecycleTest extends TestCase
{
    public function test_boots_application(): void
    {
        $this->assertNotNull($this->app());
        $this->assertTrue($this->has(\Glueful\Logging\LogManager::class));
    }
}
```

> Helpers like `$this->post()` or `$this->assertStatus()` will be documented once implemented; they are intentionally omitted here to avoid confusion.

### Related Documentation
- [Testing](/advanced/testing)
- [Events](/features/events)

---

## v1.0.0 - Aurora
**Released: September 20, 2025**

::u-alert{color="success" variant="subtle" icon="i-tabler-ad-2"}
#description
**Aurora** — The first stable release of the split Glueful Framework package. This version establishes the framework runtime as a standalone library with comprehensive features and sets a clear baseline for future 1.x releases.
::

### Key Highlights

::card
**Major Features**
- Custom Dependency Injection system (DSL + compiled container)
- Permissions & authorization layer
- Observability & metrics (profiling + middleware)
- Security middleware suite (auth, rate limiting, CSRF, headers, guards)
- File upload pipeline (validation, S3, signed URLs)
- Extensions system v2 (deterministic provider discovery)
::

### What's New

#### Router
- Fast static/dynamic matching with first-segment bucketing
- Attribute-based route definitions (`#[Get]`, `#[Post]`, etc.)
- Route cache compiler with automatic invalidation
- Standardized JSON errors for 404/405

```php
use Glueful\Routing\Attributes\{Get, Post};

class UserController
{
    #[Get('/users/{id}')]
    public function show(int $id): Response
    {
        // Route automatically registered
    }

    #[Post('/users')]
    public function create(Request $request): Response
    {
        // POST /users
    }
}
```

#### Dependency Injection Overhaul
- Custom lightweight container optimized for Glueful
- DSL for service registration with compile-time generation
- Compiled container support for faster production startup

```php
// Typical application bootstrap (dev/prod aware)
use Glueful\Container\Bootstrap\ContainerFactory;

$container = ContainerFactory::create(prod: false); // prod:true enables compilation path

// Overriding / adding a service at runtime (e.g. during tests)
$testContainer = $container->with([
    'fake.clock' => fn() => new \Glueful\Support\Clock\FrozenClock('2025-10-08T00:00:00Z'),
]);

// Accessing a service
$logger = $testContainer->get('logger');

// Defining services in a Provider (preferred for framework + extensions)
use Glueful\Container\Providers\BaseServiceProvider;
use Glueful\Container\Definition\FactoryDefinition;

final class PaymentProvider extends BaseServiceProvider
{
    public function defs(): array
    {
        return [
            // FactoryDefinition gives you full control
            'payment.client' => new FactoryDefinition('payment.client', function(\Psr\Container\ContainerInterface $c) {
                return new PaymentClient($c->get('http.client'), baseUrl: config('payments.base_url'));
            }),
            // Simple autowire helper (shared by default)
            PaymentService::class => $this->autowire(PaymentService::class),
        ];
    }
}
```

> Service registration happens through Provider `defs()` returning definitions; runtime overrides use `$container->with([...])`.

#### Security Enhancements
New middleware suite:
- Authentication & Authorization
- Rate Limiting
- CSRF Protection
- Security Headers
- Admin Guard
- IP Allow-listing

New CLI security commands:
```bash
php glueful security:check
php glueful security:scan
php glueful security:vulnerabilities
```

#### File Upload System
- Native Symfony `UploadedFile` support
- Extension and MIME validation
- Hazard scanning for security
- S3 storage with signed URLs
- Configurable ACL (private by default)

```php
use Glueful\Uploader\FileUploader;

// Upload using the framework uploader (validates and stores metadata)
$uploader = app(FileUploader::class);
$result = $uploader->handleUpload(
    $token,                   // your upload token / CSRF guard
    ['user_id' => $userId, 'key' => 'document'],
    $request->files->all()    // or $_FILES
);

// $result contains: ['uuid' => '...', 'url' => 'https://...']
// To create a presigned link for a known path on S3:
// $signedUrl = app(Glueful\Uploader\Storage\FlysystemStorage::class)
//     ->getSignedUrl('documents/example.pdf', 3600);
```

#### Observability & Metrics
- `BootProfiler` for startup timing analysis
- `MetricsMiddleware` for request tracking
- `ApiMetricsService` for API analytics
- Pluggable tracing middleware

#### Extensions System v2
- Deterministic provider discovery
- App providers + vendor extensions unified
- Extension service compilation for better performance

### Migration Guide

::u-alert{color="error" variant="subtle" icon="i-tabler-ad-2"}
#description
**Breaking Changes**: This release includes significant architectural changes. Please review carefully before upgrading.
::

#### 1. Dependency Injection Container

The framework now uses a custom DI container instead of Symfony DI.

**Before:**
```php
use Symfony\Component\DependencyInjection\ContainerBuilder;

$container = new ContainerBuilder();
$container->register('my.service', MyService::class);
```

**After:**
```php
// Create container (typically done via ContainerFactory in bootstrap)
use Glueful\Container\Bootstrap\ContainerFactory;

$container = ContainerFactory::create(prod: false); // prod:true enables compilation

// Runtime service override (e.g., in tests)
$container = $container->with([
    'my.service' => fn($c) => new MyService($c->get('dependency')),
]);

// Or define services in a Provider (recommended for extensions/framework services)
use Glueful\Container\Providers\BaseServiceProvider;
use Glueful\Container\Definition\FactoryDefinition;

final class MyServiceProvider extends BaseServiceProvider
{
    public function defs(): array
    {
        return [
            // Factory definition
            'my.service' => new FactoryDefinition('my.service', function($c) {
                return new MyService($c->get('dependency'));
            }),
            // Or autowire
            MyService::class => $this->autowire(MyService::class),
        ];
    }
}
```

#### 2. Event System (PSR-14)

Event system migrated from custom implementation to PSR-14.

**Before:**
```php
$events->listen('user.created', function($event) {
    // Handle event
});
```

**After:**
```php
use Psr\EventDispatcher\EventDispatcherInterface;
use Glueful\Events\Contracts\BaseEvent;
use Glueful\Events\ListenerProvider;

class UserCreated extends BaseEvent
{
    public function __construct(public User $user) {}
}

// Register listener via ListenerProvider
$provider = app(ListenerProvider::class);
$provider->addListener(UserCreated::class, function (UserCreated $event) {
    // Handle event
});

// Dispatch via PSR-14 dispatcher
$dispatcher = app(EventDispatcherInterface::class);
$dispatcher->dispatch(new UserCreated($user));
```

#### 3. Storage Configuration

Migrated to Flysystem with updated configuration structure.

**Before:**
```php
// config/storage.php
return [
    's3' => [
        'key' => env('AWS_KEY'),
        'secret' => env('AWS_SECRET'),
    ]
];
```

**After:**
```php
// config/storage.php
return [
    's3' => [
        'driver' => 's3',
        'key' => env('S3_ACCESS_KEY_ID'),
        'secret' => env('S3_SECRET_ACCESS_KEY'),
        'region' => env('S3_REGION', 'us-east-1'),
        'bucket' => env('S3_BUCKET'),
        'endpoint' => env('S3_ENDPOINT'),
        'use_path_style_endpoint' => true,

        // Optional behavior hints
        'acl' => env('S3_ACL', 'private'),
        'signed_urls' => env('S3_SIGNED_URLS', true),
        'signed_ttl' => (int) env('S3_SIGNED_URL_TTL', 3600),
        'cdn_base_url' => env('S3_CDN_BASE_URL'),
    ],
];
```

#### 4. Environment Variable Updates

Several environment variables have been renamed for consistency:

```bash
# Redis
REDIS_CACHE_DB → REDIS_DB

# Mail
MAIL_SECURE → MAIL_ENCRYPTION

# Logging
LOG_PATH → LOG_FILE_PATH
# New: LOG_TO_DB=false (default)

# S3 Storage
# New variables:
S3_ACL=private
S3_SIGNED_URLS=true
S3_SIGNED_URL_TTL=3600

# PSR-15 Middleware
PSR15_ENABLED=true
PSR15_AUTO_DETECT=true
PSR15_STRICT=false
```

#### 5. Validation System

Moved to rules-based system with clearer composition.

**Before:**
```php
$validator = new Validator([
    'email' => 'required|email',
]);
```

**After:**
```php
use Glueful\Validation\Validator;
use Glueful\Validation\Rules\{Required, Email};

$validator = new Validator([
    'email' => [new Required(), new Email()],
]);

$errors = $validator->validate($data);
```

#### 6. Router Changes

Routes now return standardized JSON for errors.

**404 Response:**
```json
{
    "error": "Not Found",
    "message": "The requested resource was not found",
    "status": 404
}
```

**405 Response:**
```json
{
    "error": "Method Not Allowed",
    "message": "Method POST not allowed. Allowed methods: GET, PUT",
    "status": 405,
    "allowed_methods": ["GET", "PUT"]
}
```

#### 7. FileUploader Changes

FileUploader now resolves repositories via the DI container.

**Before:**
```php
$uploader = new FileUploader($storage);
$uploader->setRepository($repository);
```

**After:**
```php
// Repository is auto-resolved from container
$uploader = $container->get(FileUploader::class);
```

### Related Documentation
- [Installation](/getting-started/installation)
- [Quickstart](/getting-started/quickstart)
- [Routing](/essentials/routing)
- [Dependency Injection](/advanced/dependency-injection)
- [Events](/features/events)
- [File Uploads](/features/file-uploads)
- [Middleware](/advanced/middleware)
- [Configuration](/advanced/configuration)

---

## Upgrade Checklist

When upgrading between major or minor versions:

- [ ] Review breaking changes for your target version
- [ ] Update environment variables (`.env`)
- [ ] Update configuration files in `config/`
- [ ] Run `composer update`
- [ ] Clear compiled caches: `php glueful cache:clear`
- [ ] Update service provider registrations
- [ ] Run your test suite
- [ ] Review and update custom middleware
- [ ] Check deprecated features in your codebase

## Semantic Versioning

Glueful follows [Semantic Versioning](https://semver.org/):

- **Major versions** (2.0.0): Breaking changes, major new features
- **Minor versions** (1.1.0): New features, backward-compatible
- **Patch versions** (1.0.1): Bug fixes, backward-compatible

## Support Policy

- **Latest minor version**: Active development, new features, bug fixes
- **Previous minor version**: Bug fixes for 6 months
- **Older versions**: Security fixes only for 12 months

## Release Names

Glueful releases are named after stars and celestial objects:
- **Aurora** (1.0.0) - The dawn of the framework
- **Polaris** (1.1.0) - The guiding star
- **Vega** (1.2.0) - Bright and reliable
- **Deneb** (1.3.0) - Distant but brilliant
- **Betelgeuse** (1.9.0) - A red supergiant marking a new era
- **Castor** (1.9.1) - One of the twin stars, bringing documentation clarity
- **Elnath** (1.10.0) - The butting horn, bringing structured error handling and validation
- **Alnilam** (1.11.0) - The central star of Orion's Belt, bringing the ORM foundation
- **Mintaka** (1.12.0) - The western star of Orion's Belt, completing the output transformation layer
- **Saiph** (1.13.0) - The sword of Orion, enhancing developer productivity with scaffolding and factories
- **Bellatrix** (1.14.0) - The Amazon Star, powering interactive CLI wizards
- **Rigel** (1.15.0) - The bright foot of Orion, illuminating real-time development
- **Meissa** (1.16.0) - The head of Orion, governing API versioning strategy
- **Alnitak** (1.17.0) - The eastern star of Orion's Belt, protecting APIs with rate limiting
- **Hadar** (1.18.0) - Beta Centauri, a bright beacon enabling event-driven webhook integrations
## v1.5.0 - Orion (Minor)
**Released: October 13, 2025**

::u-alert{color="info" variant="subtle" icon="i-tabler-ad-2"}
#description
Notification system wiring improvements with a shared DI provider and a safer email verification flow that avoids hard prechecks.
::

### Key Highlights

::card
**Notifications DI Provider**
- New `NotificationsProvider` binds `ChannelManager` and `NotificationDispatcher` as shared services
- Extensions can register channels and hooks during boot without ad‑hoc construction
::

::card
**Safer Email Verification & Password Reset**
- EmailVerification/SendNotification resolve dispatcher/channel via DI first (with a clean fallback)
- Removed `ExtensionManager` prechecks; rely on dispatcher/channel availability at send time
- Soft diagnostics log when the email channel is unavailable or no channels succeed
::

### Other Changes
- Align retry configuration lookup to `email-notification.retry` (consistent with the extension)
- Namespacing and static analysis fixes; line‑length formatting for diagnostics

### Migration Notes

::u-alert{color="warning" variant="subtle" icon="i-tabler-alert-triangle"}
#description
If you referenced `config('extensions.EmailNotification.retry')`, update to `config('email-notification.retry')`. No breaking API changes are introduced in 1.5.0.
::

---
## v1.7.1 - Canopus
**Released: October 21, 2025**

::u-alert{color="info" variant="subtle" icon="i-tabler-ad-2"}
#description
Patch release that fixes extension discovery and boot sequencing so enabled extensions reliably load at runtime.
::

### What’s Fixed
- Framework initializes extensions by calling `ExtensionManager::discover()` before `::boot()`.
- Extension migrations registered via `loadMigrationsFrom()` are now discovered by `migrate:status` / `migrate:run`.
- CLI `extensions:why` and `extensions:list` now accurately reflect included providers after boot.

### Impact
- If you saw “EXCLUDED from final provider list” or “No pending migrations found” for extension migrations, this patch resolves it. No configuration changes required.

---
## v1.7.2 - Antares
**Released: October 21, 2025**

::u-alert{color="info" variant="subtle" icon="i-tabler-ad-2"}
#description
Patch release improving route loading resilience in extensions and reducing noise in the development server logs.
::

### What’s Fixed
- Extensions: `ServiceProvider::loadRoutesFrom()` is now idempotent and exception‑safe.
  - Prevents duplicate route registration when a routes file would otherwise be loaded twice.
  - Catches exceptions from route files; logs and continues in production, rethrows in non‑production for fast feedback.

### Developer Experience
- CLI `serve`: Reclassifies PHP built‑in server access/startup lines (written to STDERR) as normal output to avoid false `[ERROR]` entries while preserving real error reporting.

---
## v1.7.3 - Pollux
**Released: October 21, 2025**

::u-alert{color="info" variant="subtle" icon="i-tabler-ad-2"}
#description
Patch release fixing 2‑argument where/orWhere handling and refining dev‑server logging.
::

### What’s Fixed
- Database/QueryBuilder: The 2‑argument forms `where($column, $value)` and `orWhere($column, $value)` now normalize to `=` internally, avoiding a `TypeError` and improving portability of boolean and integer filters across PostgreSQL/MySQL/SQLite.

### Developer Experience
- CLI `serve`: Additional refinement of PHP built‑in server access/lifecycle lines (written to STDERR) so they appear as normal output instead of false `[ERROR]` entries; real errors remain highlighted.

---
