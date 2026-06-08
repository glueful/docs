---
title: Dependency Injection
description: Manage dependencies with the Glueful PSR-11 container — providers, autowire, factories, aliases, tags, and CLI tools
---

Glueful ships a lightweight, fast PSR-11 container tailored to the framework. It supports constructor autowiring, explicit factories, aliases, tagging, and a PHP code generator that compiles definitions for production.

For standalone examples on this page, assume `$context` is an available `ApplicationContext`. In controllers, prefer constructor injection and `BaseController` helpers over ad hoc container calls.

Highlights:
- PSR-11 compatible interface
- Constructor autowiring with an `#[Inject]` attribute (`Glueful\Container\Autowire\Inject`)
- Simple array DSL for app/extension providers
- Aliases and interface bindings
- Tags and tag-based iterators
- Lazy warmup groups (background / request-time)
- Compile-to-PHP container for production (best-effort, with fallback)

## Quick Start

### Resolving from the container

```php
// Using helpers
$db     = app($context, 'database');                       // Glueful\Database\Connection
$cache  = app($context, \Glueful\Cache\CacheStore::class);
$logger = app($context, \Psr\Log\LoggerInterface::class);  // aliased to 'logger'

// PSR-11 directly
$c = container($context);
$database = $c->get('database'); // some services are string IDs

// Optional access — there is no getOptional(); guard with has_service()
if (has_service(\Glueful\Auth\AuthenticationService::class)) {
    $auth = app($context, \Glueful\Auth\AuthenticationService::class);
}
```

### Constructor injection

```php
class UserController
{
    public function __construct(
        private UserRepository $users,
        private CacheInterface $cache
    ) {}

    public function index()
    {
        return $this->cache->remember('users:all', fn () => $this->users->all());
    }
}
```

### Method injection

```php
class TaskController extends \Glueful\Controllers\BaseController
{
    public function store(Request $request, TaskRepository $tasks)
    {
        $data = $this->getRequestData();

        if ($error = $this->validateRequest($data, ['title' => 'required|max:255'])) {
            return $error;
        }

        return $this->created($tasks->create($data));
    }
}
```

### Resolution semantics

- **Class name**: `app($context, Foo\Bar::class)` autowires constructor dependencies.
- **Aliases**: string IDs (e.g. `'cache.store'`, `'database'`) resolve to services.
- **Interfaces**: bind via alias so `app($context, Interface::class)` returns the implementation.
- **Parameters**: inject via `#[Glueful\Container\Autowire\Inject(param: 'key')]` when autowiring, or read via `parameter('key')` inside a factory.

## Service Registration

App and extension providers define services in a **static `services()` method** that returns a simple array DSL — this is the path used by the api-skeleton's `AppServiceProvider`. Framework **core** providers instead implement a `defs()` instance method that returns typed definitions (via `BaseServiceProvider`). If both forms exist for a provider, the typed `defs()` is used.

### The `services()` array DSL (app/extension providers)

Supported keys per service entry:
- `class` string — concrete class (if omitted and the ID is a FQCN, the ID is used)
- `autowire` bool — constructor autowiring (default false; set true to autowire a class)
- `factory` callable|string|array — one of `fn(Container $c) => ...`, `'Class::method'`, `[ClassName::class, 'method']`, or `['@service.id', 'method']`
- `arguments` array — constructor args; strings beginning with `@` are treated as service references
- `shared` bool — singleton when true (default true). `singleton` / `bind` are shorthands that map to `shared`
- `alias` string|array — additional IDs that resolve to this service
- `tags` array — tag names, or maps like `['name' => 'tag.name', 'priority' => 10]`

```php
final class AppServiceProvider
{
    public static function services(): array
    {
        return [
            // Autowired service (singleton by default)
            App\Services\UserService::class => [
                'autowire' => true,
                'alias' => 'user_service',
                'tags' => [['name' => 'domain.user', 'priority' => 50]],
            ],

            // Interface binding via alias
            App\Services\RedisCache::class => [
                'autowire' => true,
                'alias' => App\Contracts\CacheInterface::class,
            ],

            // Factory service (prefer class/method factories for production)
            Psr\Log\LoggerInterface::class => [
                'factory' => [App\Factories\LoggerFactory::class, 'create'],
                'shared' => true,
            ],

            // String ID + concrete class
            'payment' => [
                'class' => App\Services\PaymentService::class,
                'autowire' => true,
            ],
        ];
    }
}
```

Enable the provider in `config/serviceproviders.php` (see [Service providers](#service-providers)).

#### Shorthands & references

- `singleton: true|false` and `bind: true|false` both map to `shared`.
- Use `'@id'` inside `arguments` and in factory target arrays to reference another service. `'@'` alone is invalid.

```php
return [
    // Class + arguments (singleton via shorthand)
    'mail.transport' => [
        'class' => App\Mail\Transport::class,
        'arguments' => ['smtp', 587, '@'.Psr\Log\LoggerInterface::class],
        'singleton' => true,
        'tags' => ['lazy.request_time'],
    ],

    // Factory using a service method
    'blog.client' => [
        'class' => Vendor\Blog\Client::class,
        'factory' => ['@http.client', 'forBlog'],
        'alias' => [Vendor\Blog\Client::class, 'blog.http'],
        'tags' => [['name' => 'lazy.background', 'priority' => 5]],
    ],
];
```

**Production rules** (enforced by the loader/compiler): no Closure factories, and no arbitrary object instances in `arguments` (scalars/arrays/enums only). Prefer class/method factories.

### Typed `defs()` (core / advanced providers)

For maximum performance and explicit control, providers can extend `Glueful\Container\Providers\BaseServiceProvider` and return typed definitions with `autowire()`, `alias()`, factory, and value helpers:

```php
use Glueful\Container\Providers\BaseServiceProvider;
use Glueful\Container\Definition\{FactoryDefinition, ValueDefinition, AliasDefinition};

final class CoreProvider extends BaseServiceProvider
{
    public function defs(): array
    {
        $defs = [];

        // Autowire singleton
        $defs[App\Services\HealthService::class] = $this->autowire(App\Services\HealthService::class);

        // Factory definition — the closure receives the container; read config via $this->context
        $defs['db.pool'] = new FactoryDefinition(
            'db.pool',
            fn(\Psr\Container\ContainerInterface $c) =>
                \Vendor\Db\Pool::fromConfig((array) config($this->context, 'database.pool', []))
        );

        // String alias for convenience
        $defs['health'] = $this->alias('health', App\Services\HealthService::class);

        // Value/parameter style service
        $defs['feature.flags'] = new ValueDefinition('feature.flags', [
            'beta' => (bool) config($this->context, 'app.beta', false),
        ]);

        // Tag for lazy warmup (higher priority warms earlier)
        $this->tag('db.pool', 'lazy.background', 10);

        return $defs;
    }
}
```

## Dependency Injection Patterns

### Constructor injection (recommended)

```php
class UserService
{
    public function __construct(
        private UserRepository $repository,
        private LoggerInterface $logger,
        private string $defaultRole = 'user'
    ) {}
}

// Registration
public static function services(): array
{
    return [ App\Services\UserService::class => ['autowire' => true] ];
}
```

### Interface dependencies

Bind the interface by aliasing to the implementation entry, then type-hint the interface:

```php
public static function services(): array
{
    return [
        RedisCache::class => [
            'autowire' => true,
            'arguments' => ['@redis'],
            'alias' => CacheInterface::class,
        ],
    ];
}
```

### Optional dependencies and config

Use `#[Inject]` for configuration values; use constructor defaults for optional services:

```php
use Glueful\Container\Autowire\Inject;

class ApiClient
{
    public function __construct(
        #[Inject(param: 'api.base_url')] private string $baseUrl,
        #[Inject(param: 'api.key')] private string $apiKey,
        ?LoggerInterface $logger = null,
    ) {}
}

public static function services(): array
{
    return [ ApiClient::class => ['autowire' => true] ];
}
```

> **No contextual binding.** Laravel's `when()->needs()->give()` API is **not** supported. Prefer explicit factories, adapters, or separate service IDs registered via providers.

## Service Providers

Enable providers via config — both files use a single `enabled` list of plain string FQCNs:

- **App providers**: `config/serviceproviders.php` → `enabled` (always loaded, in order).
- **Composer-discovered extensions**: `config/extensions.php` → `enabled` (an installed `glueful-extension` does nothing until its provider FQCN is listed; manage with `extensions:enable|disable`).

```php
// config/serviceproviders.php
return [
    'enabled' => [
        App\Providers\AppServiceProvider::class,
    ],
];
```

Extension providers extend `Glueful\Extensions\ServiceProvider` and may also implement `register()` / `boot()` lifecycle hooks:

```php
use Glueful\Extensions\ServiceProvider;

final class PaymentServiceProvider extends ServiceProvider
{
    public static function services(): array { return [/* ... */]; }

    public function register(): void
    {
        $this->mergeConfig('payment', require base_path('config/payment.php'));
    }

    public function boot(): void
    {
        // optional: runs after all providers are registered
    }
}
```

## Service Factories

Factories provide dynamic service creation. Prefer class/method factories (they compile for production):

```php
use Glueful\Bootstrap\ApplicationContext;
use Psr\Log\LoggerInterface;

class EmailServiceFactory
{
    public static function create(\Psr\Container\ContainerInterface $c): EmailServiceInterface
    {
        $context = $c->get(ApplicationContext::class);
        $config = config($context, 'mail', []);
        return match ($config['driver'] ?? 'smtp') {
            'smtp' => new SmtpEmailService(/* ... */),
            'log'  => new LogEmailService($c->get(LoggerInterface::class)),
            default => throw new \InvalidArgumentException('Unsupported mail driver'),
        };
    }
}

public static function services(): array
{
    return [
        EmailServiceInterface::class => [
            'factory' => [EmailServiceFactory::class, 'create'],
            'shared' => true,
        ],
    ];
}
```

## Tags & Lazy Warmup

Services may be tagged. Each tag is exposed as a container service of the same name that resolves to an array of instances ordered by `priority` descending — `app($context, 'my.tag')` returns the tagged services.

Special lazy warmup tags:
- `lazy.background` — warmed after the first response returns
- `lazy.request_time` — warmed during first request processing

```bash
php glueful di:lazy:status --warm-background   # warm the background set
php glueful di:lazy:status --warm-request      # warm the request-time set
```

## Container Compilation

Glueful compiles service definitions to a compact PHP class in production. It prefers a precompiled container at `storage/cache/container/CompiledContainer.php`; otherwise it attempts best-effort compilation at runtime and falls back to the dynamic container if unsupported definitions are present.

```bash
php glueful di:container:debug --services          # list services
php glueful di:container:debug My\\Service          # inspect a service
php glueful di:container:debug --aliases           # show aliases
php glueful di:container:debug --tags              # show tags
php glueful di:container:map --format=json         # dump the service map
php glueful di:container:validate --check-circular # check circular deps
php glueful di:container:compile --optimize        # compile for production
```

**Compiler support matrix:**
- Compiled: `AutowireDefinition`, `ValueDefinition`, `TaggedIteratorDefinition`, `AliasDefinition`
- Not compiled (fallback to runtime): `FactoryDefinition` and any definition involving runtime closures or non-serializable objects

## Container Methods

The container is PSR-11. You declare services in a provider (see above); at runtime you mostly resolve them.

### Registering at runtime

`load()` adds definitions to the active container; values may be a `DefinitionInterface`, a `callable` factory, or a plain value. This is handy in tests for overriding bindings:

```php
container($context)->load([
    'service' => fn() => new MyService(),     // factory
    MyInterface::class => $existingInstance,  // value
]);

// Build a child container with overrides (does not mutate the parent)
$scoped = container($context)->with([
    PaymentGateway::class => fn() => new FakePaymentGateway(),
]);
```

### Resolving & helpers

```php
$service = container($context)->get('service');
if (container($context)->has('service')) { /* ... */ }

$db    = app($context, 'database');
$cache = app($context, \Glueful\Cache\CacheStore::class);
$queue = service($context, \Glueful\Queue\QueueManager::class);
```

## Built-in Aliases & Core Services

Common IDs and class aliases registered by core providers (exact registrations vary with environment and enabled extensions — inspect `config/serviceproviders.php`, `config/extensions.php`, and the provider classes for the definitive set):

- `'logger'` → `\Psr\Log\LoggerInterface`
- `'database'` → `\Glueful\Database\Connection`; also `\Glueful\Database\QueryBuilder::class` and `\Glueful\Database\Schema\Interfaces\SchemaBuilderInterface::class` (factories via the connection)
- `'cache.store'` → `\Glueful\Cache\CacheStore`
- `'request'` → `\Symfony\Component\HttpFoundation\Request` (from globals)
- Auth: `\Glueful\Auth\AuthenticationManager`, `\Glueful\Auth\AuthenticationGuard`, `\Glueful\Auth\TokenManager`
- Permissions: `\Glueful\Permissions\Gate` (configured from `config/permissions.php`)
- Queue & scheduling: `\Glueful\Queue\QueueManager`, `\Glueful\Queue\Failed\FailedJobProvider`, `\Glueful\Scheduler\JobScheduler`
- Middleware aliases: `'auth'`, `'rate_limit'`, `'csrf'`, `'metrics'`, `'tracing'`, etc. (see [Middleware](/advanced/middleware))

Explore `\Glueful\Container\Providers\CoreProvider`, `QueueProvider`, `SecurityProvider`, `HttpClientProvider`, and friends for the full list.

## Testing with DI

**Unit tests** — construct services directly with mock dependencies:

```php
$payment = $this->createMock(PaymentGateway::class);
$payment->expects($this->once())->method('charge')->with(100.00, 'card_123');

$service = new OrderService($db, $payment, $email, $logger);
$order = $service->createOrder(['total' => 100.00, 'payment_method' => 'card_123']);
```

**Integration tests** — boot the framework to build the real container, then resolve services and override bindings:

```php
// Override a binding for the test
container($context)->load([
    UserRepositoryInterface::class => fn() => new FakeUserRepository(),
]);
```

See [Testing](/advanced/testing) for the full test harness.

## Best Practices

- **Depend on interfaces**, not concrete classes — bind the interface via an alias and type-hint it.
- **Use constructor injection**; avoid pulling from the container inside services (hidden dependencies).
- **Keep constructors simple** — only store dependencies, no work.
- **Inject config with `#[Inject(param: 'key')]`** instead of reading config in method bodies.
- Definitions are **shared (one instance) by default** — prefer shared, stateless services; pass `shared: false` (or `'shared' => false`) for stateful ones.
- Use **tags** for batch operations and to defer heavy warmups to lazy groups.

## Troubleshooting

**Missing service** — guard with `has_service(App\Services\UserService::class)` and confirm the provider is in `config/serviceproviders.php`.

**Circular dependency** — `Glueful\Container\Exception\ContainerException: Circular dependency detected: A -> B -> A`. Break the cycle: extract an interface, use a factory, or invert one dependency.

**Cannot instantiate interface** — bind the interface to an implementation via an alias before use.

**Debugging tools:**
- `php glueful di:container:debug` — inspect services, aliases, tags, parameters
- `php glueful di:container:validate` — validate graphs and circular refs
- `php glueful di:container:compile` — precompile for production

## Next Steps

- [Service Providers](/advanced/service-providers) — organize bindings
- [Repositories](/advanced/repositories) — repository pattern
- [Testing](/advanced/testing) — test with DI
- [Middleware](/advanced/middleware) — DI in middleware
