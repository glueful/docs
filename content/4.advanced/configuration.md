---
title: Configuration
description: Manage environment-based configuration
---

Configure your application for different environments with environment variables and configuration files.

::u-alert{color="neutral" variant="subtle" icon="i-lucide-sliders-horizontal"}
This page covers **application** config (`config/*.php` + env). For validating the options a single service accepts at runtime, see the [Service Options Resolver](/cookbook/configuration).
::

## Configuration Files

Configuration lives in `config/` directory:

```
config/
├── app.php           # Application settings
├── database.php      # Database connections
├── cache.php         # Cache drivers
├── queue.php         # Queue connections
├── security.php      # Security settings
└── logging.php       # Logging configuration
```

Other useful configs you may encounter:
- `permissions.php` – Gates/roles and permission system
- `session.php` – Session lifetime, storage, cookie security
- `storage.php` – Storage roots, disks, CDN paths
- `filesystem.php` – File manager, uploads, safety rules
- `http.php` – HTTP client defaults, retry/backoff
- `observability.php` – Tracing/metrics/log correlation
- `resource.php` – Resource API defaults (ratelimits, pagination)
- `serviceproviders.php` / `extensions.php` – Service/extension registration
- `schedule.php` – Scheduled jobs and settings

## Accessing Configuration

Use the `config($context, ...)` helper:

```php
// Get value
$env = config($context, 'app.env');
$dbHost = config($context, 'database.mysql.host');

// Get with default
$timeout = config($context, 'app.timeout', 30);

// Get nested value
$cacheDriver = config($context, 'cache.default');
```

## Environment Variables

### .env File

Create `.env` file in project root:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.example.com

DB_DRIVER=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=glueful
DB_USERNAME=root
DB_PASSWORD=secret

CACHE_DRIVER=redis
REDIS_HOST=localhost
REDIS_PORT=6379

QUEUE_CONNECTION=database

JWT_SECRET=your-secret-key
```

### Accessing Environment Variables

```php
// In config files
'debug' => env('APP_DEBUG', false),
'url' => env('APP_URL', 'http://localhost'),

// In application code (not recommended)
$debug = env('APP_DEBUG');
```

## Configuration File Examples

### app.php

```php
return [
    'env' => env('APP_ENV', 'production'),
    'debug' => env('APP_DEBUG', false),
    'url' => env('APP_URL', 'http://localhost'),
    'timezone' => env('APP_TIMEZONE', 'UTC'),

    'paths' => [
        'uploads' => env('UPLOADS_PATH', __DIR__ . '/../storage/uploads'),
        'logs' => env('LOGS_PATH', __DIR__ . '/../storage/logs'),
        'cache' => env('CACHE_PATH', __DIR__ . '/../storage/cache'),
    ],
];
```

### database.php

```php
return [
    // Selected engine: sqlite, mysql, pgsql
    'engine' => env('DB_DRIVER', 'sqlite'),

    // MySQL settings
    'mysql' => [
        'driver' => 'mysql',
        'host' => env('DB_HOST', '127.0.0.1'),
        'port' => env('DB_PORT', 3306),
        'db' => env('DB_DATABASE', 'glueful'),
        'user' => env('DB_USERNAME', 'root'),
        'pass' => env('DB_PASSWORD', ''),
        'charset' => 'utf8mb4',
        'collation' => 'utf8mb4_unicode_ci',
        'prefix' => env('DB_PREFIX', ''),
    ],

    // PostgreSQL settings
    'pgsql' => [
        'driver' => 'pgsql',
        'host' => env('DB_PGSQL_HOST', '127.0.0.1'),
        'port' => env('DB_PGSQL_PORT', 5432),
        'db' => env('DB_PGSQL_DATABASE', 'glueful'),
        'user' => env('DB_PGSQL_USERNAME', 'postgres'),
        'pass' => env('DB_PGSQL_PASSWORD', ''),
        'schema' => env('DB_PGSQL_SCHEMA', 'public'),
        'charset' => 'utf8',
        'prefix' => env('DB_PGSQL_PREFIX', ''),
    ],

    // SQLite settings
    'sqlite' => [
        'driver' => 'sqlite',
        'primary' => env('DB_SQLITE_DATABASE', base_path('storage/database/glueful.sqlite')),
        'testing' => env('DB_SQLITE_TESTING', base_path('storage/database/testing.sqlite')),
    ],
];
```

### cache.php

```php
return [
    'default' => env('CACHE_DRIVER', 'file'),
    'prefix' => env('CACHE_PREFIX', 'glueful:'),

    'stores' => [
        'file' => [
            'driver' => 'file',
            'path' => env('CACHE_FILE_PATH', storage_path($context, 'cache')),
        ],

        'redis' => [
            'driver' => 'redis',
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'port' => env('REDIS_PORT', 6379),
            'password' => env('REDIS_PASSWORD'),
            'database' => env('REDIS_DB', 0),
        ],

        'memcached' => [
            'driver' => 'memcached',
            'host' => env('MEMCACHED_HOST', '127.0.0.1'),
            'port' => env('MEMCACHED_PORT', 11211),
        ],

        'array' => [
            'driver' => 'array',
        ],
    ],
];
```

## Environment-Specific Configuration

### Development

`.env.development`:

```env
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_DRIVER=sqlite
DB_DATABASE=:memory:

CACHE_DRIVER=array
QUEUE_CONNECTION=sync

LOG_LEVEL=debug
```

### Staging

`.env.staging`:

```env
APP_ENV=staging
APP_DEBUG=true
APP_URL=https://staging.example.com

DB_DRIVER=mysql
DB_HOST=staging-db.example.com
DB_DATABASE=staging_db
DB_USERNAME=staging_user
DB_PASSWORD=${STAGING_DB_PASSWORD}

CACHE_DRIVER=redis
QUEUE_CONNECTION=redis

LOG_LEVEL=info
```

### Production

`.env.production`:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.example.com

DB_DRIVER=mysql
DB_HOST=prod-db.example.com
DB_DATABASE=production_db
DB_USERNAME=prod_user
DB_PASSWORD=${PRODUCTION_DB_PASSWORD}

CACHE_DRIVER=redis
QUEUE_DRIVER=redis

LOG_LEVEL=warning
```

## Environment-Aware Defaults

```php
// config/app.php
return [
    'debug' => (bool) env('APP_DEBUG', env('APP_ENV') !== 'production'),

    'log_level' => env('LOG_LEVEL', match(env('APP_ENV')) {
        'production' => 'warning',
        'staging' => 'info',
        default => 'debug',
    }),

    'cache_enabled' => env('CACHE_ENABLED', env('APP_ENV') === 'production'),
];
```

## Configuration Loading & Overrides

Glueful merges framework defaults with your application overrides:
- The `config($context, ...)` helper loads framework config first, then application `config/*.php`, using `loadConfigWithHierarchy()`.
- Deep merge semantics: associative arrays are merged (app wins), numeric lists are appended and de-duplicated.
- Use `env()` in config files to make settings environment-aware.

## Cross-References

- Queues: see Features → Queues & Jobs for `config/queue.php` usage
- Rate Limiting: see Features → Rate Limiting for `config/security.php` rate_limiter
- Scheduling: see Features → Task Scheduling for `config/schedule.php`
- Caching: see Features → Caching for `config/cache.php`
- Logging: see Advanced → Logging for `config/logging.php`
- Security: see Features → CORS & CSRF and Security for `config/security.php`

## Secrets Management

### Never Commit Secrets

Add to `.gitignore`:

```
.env
.env.*
!.env.example
```

### Environment Variables

Preferred for sensitive data:

```env
# ❌ Bad - hardcoded in config
'password' => 'secret123',

# ✅ Good - from environment
'password' => env('DB_PASSWORD'),
```

### External Secret Stores

For production, use:
- AWS Secrets Manager
- HashiCorp Vault
- Azure Key Vault
- Google Secret Manager

## Configuration Caching

### Cache Configuration (Future)

```bash
# Cache configuration for production
php glueful config:cache

# Clear configuration cache
php glueful config:clear
```

## Common Patterns

### Multiple Databases

```php
// config/database.php
'connections' => [
    'mysql_main' => [
        'driver' => 'mysql',
        'host' => env('DB_HOST'),
        'database' => env('DB_DATABASE'),
    ],

    'mysql_analytics' => [
        'driver' => 'mysql',
        'host' => env('ANALYTICS_DB_HOST'),
        'database' => env('ANALYTICS_DB_DATABASE'),
    ],
],
```

In application code, resolve additional connections through your configured database services or repositories. Do not assume a `db('connection')` helper exists unless you added one in your app:

```php
$mainDb = container($context)->get(\Glueful\Database\Connection::class);
$users = $mainDb->table('users')->get();

$analytics = app($context, App\Services\AnalyticsStore::class);
$stats = $analytics->latest();
```

### Multi-Tenant Configuration

```php
// config/tenants.php
return [
    'default' => env('TENANT_ID', 'main'),

    'tenants' => [
        'main' => [
            'database' => 'tenant_main',
            'cache_prefix' => 'main:',
        ],
        'client1' => [
            'database' => 'tenant_client1',
            'cache_prefix' => 'client1:',
        ],
    ],
];
```

### Feature Flags

```php
// config/features.php
return [
    'new_dashboard' => env('FEATURE_NEW_DASHBOARD', false),
    'beta_api' => env('FEATURE_BETA_API', env('APP_ENV') !== 'production'),
    'experimental' => env('FEATURE_EXPERIMENTAL', false),
];
```

Use in code:

```php
if (config($context, 'features.new_dashboard')) {
    return $this->newDashboard();
}

return $this->oldDashboard();
```

## Validation

### Validate Required Variables

```php
// bootstrap/app.php
$required = ['APP_URL', 'DB_HOST', 'DB_DATABASE', 'JWT_SECRET'];

foreach ($required as $key) {
    if (!env($key)) {
        throw new \RuntimeException("Required environment variable {$key} is not set");
    }
}
```

### Type Casting

```php
// Ensure boolean
'debug' => (bool) env('APP_DEBUG', false),

// Ensure integer
'port' => (int) env('DB_PORT', 3306),

// Ensure float
'timeout' => (float) env('REQUEST_TIMEOUT', 30.0),
```

## Best Practices

### Use env() Only in Config Files

```php
// ✅ Good - in config/app.php
'url' => env('APP_URL', 'http://localhost'),

// Then use in code
$url = config($context, 'app.url');

// ❌ Bad - in application code
$url = env('APP_URL');
```

### Provide Sensible Defaults

```php
// ✅ Good
'timeout' => env('API_TIMEOUT', 30),

// ❌ Bad - no default
'timeout' => env('API_TIMEOUT'),
```

### Document Environment Variables

Create `.env.example`:

```env
# Application
APP_ENV=production
APP_DEBUG=false
APP_URL=http://localhost:8000

# Database
DB_DRIVER=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=glueful
DB_USERNAME=root
DB_PASSWORD=

# Cache
CACHE_DRIVER=redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=
```

## Troubleshooting

**Environment variables not loading?**
- Check `.env` file exists
- Verify file permissions
- Ensure no syntax errors

**Wrong environment detected?**
- Check `APP_ENV` is set correctly
- Verify environment file is loaded
- Check for typos in variable names

**Configuration not updating?**
- Clear configuration cache
- Restart application
- Check file permissions

## Next Steps

- [Testing](/advanced/testing) - Test configuration
- [Middleware](/advanced/middleware) - Environment-aware middleware
- [Deployment](/deployment/production) - Production configuration
