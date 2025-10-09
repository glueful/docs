---
title: Release Notes
description: Curated highlights, migration guidance, and structured summaries of Glueful framework releases.
---

> This page is a curated layer over the raw authoritative `CHANGELOG.md`. For complete detail (including every Added/Changed/Removed/Fix line) consult the full changelog.

## Release Summary

| Version | Codename | Date | Type | Risk | Primary Theme |
| ------- | -------- | ---- | ---- | ---- | ------------- |
| 1.3.0 | Deneb   | 2025-10-06 | Feature | Low  | HTTP client retries |
| 1.2.0 | Vega    | 2025-09-23 | Feature+Breaking | Medium | Tasks & Jobs overhaul |
| 1.1.0 | Polaris | 2025-09-22 | Infra | Low  | Testing infrastructure |
| 1.0.0 | Aurora  | 2025-09-20 | Major | High | First stable split |

Risk scale: High = architectural changes / broad API shifts; Medium = targeted breaking or migration; Low = additive or internal refactors.

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

// Configure retries with custom settings
$client = Client::create('https://api.example.com')
    ->withRetry([
        'max_retries' => 3,
        'delay' => 1000, // milliseconds
        'multiplier' => 2,
        'status_codes' => [429, 500, 502, 503, 504]
    ]);

// Or use builder with presets
$apiClient = ApiClientBuilder::create()
    ->baseUrl('https://payment-gateway.com')
    ->retries(['preset' => 'payment'])
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
php glueful cache:maintenance --driver=redis --action=clear
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
// Tasks are now auto-registered via TasksProvider
// For queued execution, dispatch the Job wrapper:
use Glueful\Queue\Jobs\CacheMaintenanceJob;

$queue->dispatch(new CacheMaintenanceJob(['action' => 'clear']));
```

#### Step 3: Update Direct Execution

**Before:**
```php
$cronJob = new CacheMaintenance();
$cronJob->execute();
```

**After:**
```php
$task = new CacheMaintenanceTask($cacheManager, $logger);
$task->execute(['driver' => 'redis', 'action' => 'clear']);
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
use Glueful\Storage\FileUploader;

$uploader = new FileUploader($storage, $repository);
$file = $uploader->upload(
    $request->files->get('document'),
    'documents',
    ['visibility' => 'private']
);

// Generate signed URL for private files
$url = $storage->signedUrl($file->path, '+1 hour');
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
use Glueful\Events\BaseEvent;

class UserCreated extends BaseEvent
{
    public function __construct(public User $user) {}
}

// Register listener
$dispatcher->addListener(UserCreated::class, function(UserCreated $event) {
    // Handle event
});

// Dispatch
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
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION'),
        'bucket' => env('AWS_BUCKET'),
        'acl' => env('S3_ACL', 'private'),
        'signed_urls' => env('S3_SIGNED_URLS', true),
    ]
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
use Glueful\Validation\Rules\{Required, Email};

$validator = Validator::make($data, [
    'email' => [new Required(), new Email()],
]);
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
