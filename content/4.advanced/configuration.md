---
title: Configuration
description: Manage environment-based configuration
---

Configure your application for different environments with environment variables and configuration files.

::u-alert{color="neutral" variant="subtle" icon="i-lucide-sliders-horizontal"}
This page covers **application** config (`config/*.php` + env). For validating the options a single service accepts at runtime, see the [Service Options Resolver](/cookbook/configuration).
::

## Configuration Files

The framework ships a default for every config file in `vendor/glueful/framework/config/`. Your application's `config/` directory holds **overrides**: a file there is merged over the framework file of the same name, so you only need to keep the keys you change. The api-skeleton ships its own copies of the most common files to start from.

| File | What it configures |
|---|---|
| `app.php` | Environment, debug, `APP_KEY`, API versioning, filesystem `paths`, `urls` (`BASE_URL`), memory monitoring |
| `api.php` | API prefix and versioning in the path, rate limiting tiers, field selection, filtering, webhooks |
| `auth.php` | API keys, two-factor, cookie session transport (`session_cookie`) |
| `cache.php` | Cache stores (`file`, `redis`, `memcached`, `array`), prefix, stampede protection |
| `capabilities.php` | Runtime persistence switch for notifications (`NOTIFICATIONS_DATABASE_STORE`) |
| `cors.php` | CORS origins, origin patterns, headers, credentials |
| `database.php` | Selected `engine` and the `mysql` / `pgsql` / `sqlite` connection blocks, retry, pooling |
| `documentation.php` | OpenAPI generation and the API reference UI |
| `encryption.php` | Encryption keys and key rotation |
| `events.php` | Event system flags |
| `extensions.php` | Enabled extensions |
| `filesystem.php` | File manager and filesystem safety rules |
| `http.php` | HTTP client defaults, retry/backoff |
| `lock.php` | Distributed lock store (`file`, `redis`, `database`), default `ttl`, retry delay and max wait |
| `lockdown.php` | Emergency lockdown mode |
| `logging.php` | Log channels, levels, rotation and retention |
| `observability.php` | Tracing: only `tracing.enabled` (`TRACING_ENABLED`, gates the `tracing` middleware) |
| `permissions.php` | Permission provider and enforcing middleware |
| `queue.php` | Queue connections (`database`, `redis`), failed jobs, workers |
| `resource.php` | Generic resource API: table/field access control, restricted tables, bulk limits, rate limits |
| `schedule.php` | Scheduled jobs |
| `security.php` | Trusted proxies, security levels, CSRF, password policy, request validation, `?token=` / `?api_key=` query fallbacks (`TOKEN_ALLOW_QUERY_PARAM`, `API_KEY_ALLOW_QUERY_PARAM`, both default `false`) |
| `serviceproviders.php` | Application service providers |
| `services.php` | Mail (`services.mail`), storage and other service settings |
| `session.php` | Token lifetimes, `JWT_KEY`, `TOKEN_SALT`, JWT algorithm, session cleanup |
| `storage.php` | Storage disks and roots |
| `uploads.php` | Upload limits, visibility, signed URLs, EXIF stripping, purge |
| `validation.php` | Validation defaults |
| `vardumper.php` | Var dumper settings |

You can add your own files too: any `config/<name>.php` in your app is readable as `config($context, '<name>.*')`.

## Accessing Configuration

Use the `config($context, ...)` helper with dot notation. The first segment is the file name:

```php
$env      = config($context, 'app.env');
$engine   = config($context, 'database.engine');          // sqlite | mysql | pgsql
$dbHost   = config($context, 'database.mysql.host');
$driver   = config($context, 'cache.default');
$prefix   = config($context, 'api.versioning.prefix', '/api');     // with a default
```

`config()` is read-only; it is not a setter. Each file is loaded lazily on its first read and cached for the rest of the request. Inside classes, inject `ApplicationContext` and call `$context->getConfig('app.env')` (which is what the helper does).

Config files are plain PHP evaluated before any context exists, so helpers that need `$context` (`storage_path()`, `base_path()`, `config()`) **can't** be used inside them. Build paths with `dirname(__DIR__)` instead, as the framework files do.

## How Files Are Merged

For each config name, Glueful's `ConfigurationLoader` layers three sources, each merged over the one before:

1. Framework defaults: `vendor/glueful/framework/config/<name>.php`
2. Application overrides: `config/<name>.php`
3. Environment overrides: `config/<APP_ENV>/<name>.php` (e.g. `config/production/cache.php`)

Extension defaults registered with `ServiceProvider::mergeConfig()` sit **under** all three, so any file value wins over an extension default.

The merge rules (since 1.86):

- **Maps merge key by key.** Set only the keys you want to change.
- **Lists replace the list below them whole.** A list in your app's file is not appended to, or merged by position with, the framework's list.
- **An empty array adds nothing** (1.86.2). `'jobs' => []` leaves the framework's value in place; it doesn't clear it.

::u-alert{color="warning" variant="subtle" icon="i-lucide-triangle-alert"}
**List replacement is a breaking change from 1.86.** If your `config/schedule.php` sets `jobs`, that list replaces the framework's entirely. Include the framework jobs you still want, such as `webhook_cleanup` (1.86), `blob_purge` (1.87) and `queue_maintenance` (1.91, prunes failed jobs past `queue.failed.retention_days`), or deleted uploads, webhook deliveries and failed jobs are never purged.
::

## Environment Variables

### The .env File

At boot, Glueful loads `.env` from the project root with Dotenv in **immutable** mode: a variable already set in the real process environment wins over the file. Only `.env` is loaded; there is no automatic `.env.production` / `.env.staging`. Set per-environment values in the deployment environment, or use `config/<APP_ENV>/` override files.

```env
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:...
BASE_URL=https://api.example.com

# Database — pick the engine, then fill in that engine's block
DB_DRIVER=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=glueful
DB_USERNAME=glueful
DB_PASSWORD=secret

# Auth secrets (REQUIRED)
JWT_KEY=
TOKEN_SALT=

CACHE_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

QUEUE_CONNECTION=database

# Mail — required if your app sends mail (no fallback since 1.87)
MAIL_HOST=smtp.example.com
MAIL_FROM=noreply@example.com
```

Key names to get right:

| Use | Not |
|---|---|
| `BASE_URL` (`app.urls.base`) | `APP_URL` |
| `JWT_KEY` (`session.jwt_key`) | `JWT_SECRET` |
| `DB_DRIVER=sqlite` + `DB_SQLITE_DATABASE` (`:memory:` allowed) | `DB_CONNECTION`, `DB_DATABASE=:memory:` |
| `QUEUE_CONNECTION=database` or `redis` | `QUEUE_DRIVER`, `QUEUE_CONNECTION=sync` |
| `LOG_LEVEL`, `LOG_CHANNEL` | `APP_LOG_LEVEL` |

PostgreSQL reads its own variables: `DB_PGSQL_HOST`, `DB_PGSQL_PORT`, `DB_PGSQL_DATABASE`, `DB_PGSQL_USERNAME`, `DB_PGSQL_PASSWORD`, `DB_PGSQL_SCHEMA`, `DB_PGSQL_SSL_MODE`. A relative `DB_SQLITE_DATABASE` (default `storage/database/glueful.sqlite`) is resolved from the project root; `:memory:`, `file:` URIs and absolute paths are used as-is (before 1.91, `:memory:` was resolved to a file named `:memory:`).

### Using env()

```php
// In config files
'debug' => (bool) env('APP_DEBUG', false),
'base'  => env('BASE_URL', 'http://localhost'),

// In application code — read config instead
$url = config($context, 'app.urls.base');
```

`env()` returns strings from `.env` as-is, so cast where the type matters (`(bool)`, `(int)`). A config value written as the string `'env(KEY, default)'` is also resolved by the loader, which casts `true/false/null` and numbers.

## Configuration Examples

### Overriding one key

Because maps merge, an app file only needs the keys it changes:

```php
// config/cache.php
return [
    'default' => env('CACHE_DRIVER', 'redis'),
    'stores' => [
        'file' => [
            // Unset by default: the file driver uses <app>/storage/cache (1.90)
            'path' => env('CACHE_FILE_PATH'),
        ],
    ],
];
```

### database.php shape

`database.engine` selects one of the per-engine blocks. Each block uses `db`/`user`/`pass` keys:

```php
return [
    'engine' => env('DB_DRIVER', 'sqlite'),

    'mysql' => [
        'driver' => 'mysql',
        'host' => env('DB_HOST', '127.0.0.1'),
        'port' => env('DB_PORT', 3306),
        'db'   => env('DB_DATABASE', 'glueful'),
        'user' => env('DB_USERNAME', 'root'),
        'pass' => env('DB_PASSWORD', ''),
        'charset' => 'utf8mb4',
        'collation' => 'utf8mb4_unicode_ci',
        'prefix' => env('DB_PREFIX', ''),
        'ssl' => [
            'enabled' => env('DB_SSL_ENABLED', env('APP_ENV') === 'production'),
            'ca_cert' => env('DB_SSL_CA_CERT'),
            'client_cert' => env('DB_SSL_CLIENT_CERT'),
            'client_key' => env('DB_SSL_CLIENT_KEY'),
            'verify_cert' => env('DB_SSL_VERIFY_CERT', true),
        ],
    ],

    'pgsql' => [
        'driver' => 'pgsql',
        'host' => env('DB_PGSQL_HOST', '127.0.0.1'),
        'port' => env('DB_PGSQL_PORT', 5432),
        'db'   => env('DB_PGSQL_DATABASE', 'glueful'),
        'user' => env('DB_PGSQL_USERNAME', 'postgres'),
        'pass' => env('DB_PGSQL_PASSWORD', ''),
        'schema' => env('DB_PGSQL_SCHEMA', 'public'),
        'sslmode' => env('DB_PGSQL_SSL_MODE', env('APP_ENV') === 'production' ? 'require' : 'prefer'),
    ],

    'sqlite' => [
        'driver' => 'sqlite',
        'primary' => (function () {
            $path = env('DB_SQLITE_DATABASE', 'storage/database/glueful.sqlite');
            // :memory:, file: URIs and absolute paths are used as-is
            if ($path === ':memory:' || str_starts_with($path, 'file:') || str_starts_with($path, '/')) {
                return $path;
            }
            return dirname(__DIR__) . '/' . $path;
        })(),
    ],

    // Operation retry budget (transaction replay, deadlocks, idempotentRead)
    'retry' => [
        'max_attempts' => (int) env('DB_RETRY_MAX_ATTEMPTS', 3),
        'backoff_base_ms' => (int) env('DB_RETRY_BACKOFF_MS', 500),
    ],
];
```

If your app keeps its own copy of `config/database.php` from an earlier skeleton, its `sqlite.primary` closure wins over the framework's: make sure it passes `:memory:` through unchanged as above, or it still prefixes the project root.

`app.paths` (uploads, logs, cache, backups, migrations, ...) is derived from the project root in the framework's `app.php`; there are no env variables for those paths.

### Environment-aware defaults

```php
// config/app.php (framework defaults)
'debug' => (bool) env('APP_DEBUG', env('APP_ENV') !== 'production'),
'api_docs_enabled' => env('API_DOCS_ENABLED', env('APP_ENV') !== 'production'),
```

### Per-environment override files

```php
// config/production/logging.php — merged over config/logging.php when APP_ENV=production
return [
    'application' => [
        'level' => 'warning',
    ],
];
```

## Core Capabilities

Core migrations are always registered and installed (since 1.79); `config/capabilities.php` holds only a runtime persistence switch:

```php
return [
    // false: no database notification channel, and scheduling a notification throws
    'notifications' => env('NOTIFICATIONS_DATABASE_STORE', true),
];
```

Capabilities whose backing is implied by their own driver config aren't listed: locks follow `lock.default`, the queue follows `queue.default`, and uploads follow `uploads.enabled`.

## Keys That Take Effect Since 1.91

These keys existed before 1.91 but weren't applied. Review your values before upgrading (see [Upgrading](/upgrading)):

- `security.csrf` (`CSRF_PROTECTION_ENABLED`, `CSRF_TOKEN_LIFETIME`, `CSRF_DOUBLE_SUBMIT`, `exemptRoutes`): the `csrf` middleware is built from this block. With the shipped config, tokens expire after 3600s (was 7200s) and the listed exempt routes skip CSRF.
- `LOG_LEVEL` (`logging.application.level`): `LogManager` drops records below it; the profile default applies when unset. See [Logging](/cookbook/logging).
- `TRACING_ENABLED` (`observability.tracing.enabled`, default `false`): the `tracing` middleware passes requests through while it's off.
- `queue.failed.retention_days`: pruning failed jobs uses it unless `queue.maintenance.failed_jobs_cleanup_days` is set; the container's `FailedJobProvider` reads `queue.failed.*` too. `queue.failed.max_retries` is stored, not enforced.
- `api.rate_limiting.enabled` (`API_RATE_LIMITING_ENABLED`) and `api.field_selection.enabled`: `false` now switches rate limiting / field selection off. Both default to on; check apps that set them to `false`.
- MySQL `database.mysql.ssl.*` (`DB_SSL_ENABLED`, `DB_SSL_CA_CERT`, `DB_SSL_CLIENT_CERT`, `DB_SSL_CLIENT_KEY`, `DB_SSL_VERIFY_CERT`): when SSL is enabled and at least one certificate path is set, the connection uses TLS with certificate verification on. Set `DB_SSL_VERIFY_CERT=false` if your server's certificate can't be verified.
- `lock.ttl` (`LOCK_TTL`, 300s): locks created without a TTL now expire after it instead of never; the `redis` and `database` lock stores also honour `stores.*.connection`, `retry.delay` and `retry.max_wait`.
- `SESSION_COOKIE_REFRESH_PATH` (`auth.session_cookie.refresh_path`): leave it unset so the path derives from the API prefix (`api_prefix() . '/auth/session'`). Remove a `SESSION_COOKIE_REFRESH_PATH=/auth/session` line copied from an older `.env`.

## Removed Keys

These keys are no longer read. Delete them from your own copies; leaving them changes nothing.

Removed in 1.91 (nothing read them):

- `cache.lock_ttl`, `cache.enable_tags`, `cache.distributed`, `cache.tags_store`. Tags are a driver capability: `redis` and (since 1.91) `file` support them, `memcached` does not.
- `lock.retry.times` (`LOCK_RETRY_TIMES`): `lock.retry.max_wait` bounds the wait.
- `capabilities.metrics` (`METRICS_DATABASE_STORE`) and `capabilities.scheduler` (`SCHEDULE_DATABASE_STORE`).
- `observability.tracing.driver` (`TRACING_DRIVER`), the empty `tracing.drivers` block, and `tracing.service_name` / `tracing.service_version` (`TRACING_SERVICE_NAME` / `TRACING_SERVICE_VERSION`). Only the no-op tracer ships; bind your own `TracerInterface` to trace.

Removed in 1.86 / 1.87:

- `app.force_https`, `FORCE_HTTPS`, `HSTS_HEADER`: terminate TLS and set HSTS at your proxy, or per route with the `security_headers` middleware. Baseline `X-Content-Type-Options` and `Referrer-Policy` headers are added to every response since 1.87.
- The `security.headers` block: `security_headers` is configured per route.
- The `sync` and `null` queue connections (no such drivers).
- `schedule.php` `settings`, `queue_mapping`, and each job's `queue`, `timeout`, `retry_attempts`; `SCHEDULE_QUEUE_*`.
- `MAIL_BCC`.

`MAIL_HOST` and `MAIL_FROM` no longer have defaults (1.87): with either unset, the email channel reports itself unavailable.

## Tooling

```bash
# Quick health check: env, app key, cache, database, route cache, storage permissions
php glueful doctor

# Rebuild .env.example from the env() calls in config/*.php (--apply also adds missing keys to .env)
php glueful env:sync
php glueful env:sync --apply

# Check that specific env keys are set (the default key list is generic — pass your own)
php glueful system:env:validate --keys=APP_KEY --keys=JWT_KEY --keys=TOKEN_SALT --keys=MAIL_HOST

# Validate database / Redis DSNs (reads DATABASE_URL and REDIS_URL when none are passed)
php glueful config:dsn:validate --db="mysql://user:pass@127.0.0.1:3306/glueful"

# Production readiness and security checks
php glueful system:production
php glueful security:check
```

There is no `config:cache` / `config:clear` command. Config files are read on demand per request; OPcache caches the compiled files.

## Secrets Management

Keep secrets out of version control:

```
.env
!.env.example
```

Read secrets through `env()` in config files rather than hard-coding them:

```php
// Bad — hardcoded
'pass' => 'secret123',

// Good — from the environment
'pass' => env('DB_PASSWORD'),
```

In production, inject variables from your platform or a secret store (AWS Secrets Manager, Vault, ...) into the process environment. Because Dotenv is immutable, real environment variables override `.env`.

## Common Patterns

### Feature flags in your own config file

```php
// config/features.php
return [
    'new_dashboard' => (bool) env('FEATURE_NEW_DASHBOARD', false),
    'beta_api' => (bool) env('FEATURE_BETA_API', env('APP_ENV') !== 'production'),
];
```

```php
if (config($context, 'features.new_dashboard')) {
    return $this->newDashboard();
}
```

### Extension defaults

An extension provides defaults that the app's config file can override:

```php
public function register(ApplicationContext $context): void
{
    $this->mergeConfig('my_extension', require __DIR__ . '/../config/my_extension.php');
}
```

## Troubleshooting

**Environment variable ignored?**
- A variable already set in the process environment (web server, container) wins over `.env`.
- Check the exact key the config file reads, e.g. `BASE_URL` not `APP_URL`; `env:sync` writes every key your app's `config/*.php` files read into `.env.example`.

**App config not taking effect?**
- A list in your file replaces the framework's list, an empty array is ignored.
- Long-running workers keep config loaded at boot: restart them (`php glueful queue:restart`).
- With `opcache.validate_timestamps=0`, reload PHP-FPM after editing config files.

## Next Steps

- [Testing](/advanced/testing) - Test configuration
- [Middleware](/advanced/middleware) - Environment-aware middleware
- [Task Scheduling](/features/scheduling) - `config/schedule.php`
