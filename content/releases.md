---
title: Release Notes
description: Curated highlights, migration guidance, and structured summaries of Glueful framework releases.
---

> This page is a curated layer over the raw authoritative `CHANGELOG.md`. For complete detail (including every Added/Changed/Removed/Fix line) consult the full changelog.

## Release Summary

| Version | Codename | Date | Type | Risk | Primary Theme |
| ------- | -------- | ---- | ---- | ---- | ------------- |
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
