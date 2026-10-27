---
title: Service Providers
description: The provider model and lifecycle, plus the framework's built-in providers.
---

Service providers are the central place to configure and bootstrap your application services.

::u-alert{color="neutral" variant="subtle" icon="i-lucide-boxes"}
This page covers the provider **model and lifecycle**. For the service-definition syntax — the `services()` array DSL (the common app idiom), typed `defs()`, autowire/factory/alias, tags, and compilation — see [Dependency Injection](/advanced/dependency-injection). To package providers as an installable extension, see [Building Extensions](/cookbook/extensions).
::

## Quick Start

### Create a Service Provider

An app provider is a class with a **static** `services()` method returning the array DSL (see [DI → Service Registration](/advanced/dependency-injection#service-registration)). This is what the api-skeleton's `AppServiceProvider` looks like:

`app/Providers/AppServiceProvider.php`:

```php
<?php

namespace App\Providers;

use App\Contracts\PaymentGatewayInterface;
use App\Payments\PaymentGatewayFactory;
use App\Services\OrderService;

final class AppServiceProvider
{
    public static function services(): array
    {
        return [
            // Autowired singleton
            OrderService::class => ['autowire' => true],

            // Class/method factory, also resolvable by the interface
            'payment.gateway' => [
                'factory' => [PaymentGatewayFactory::class, 'create'],
                'alias' => PaymentGatewayInterface::class,
            ],
        ];
    }
}
```

The container calls `services()` statically, so it can't use `$this`. A factory that needs config resolves `ApplicationContext` from the container it receives:

```php
use Glueful\Bootstrap\ApplicationContext;
use Psr\Container\ContainerInterface;

final class PaymentGatewayFactory
{
    public static function create(ContainerInterface $c): StripePaymentGateway
    {
        $context = $c->get(ApplicationContext::class);
        return new StripePaymentGateway((array) config($context, 'payments.stripe', []));
    }
}
```

### Register Provider

Register providers in `config/serviceproviders.php`. Entries load in the order listed, before extension providers:

```php
return [
    'enabled' => [
        App\Providers\AppServiceProvider::class,
    ],
];
```

## Provider Model

- **Definitions**: a static `services()` (array DSL) or a static `defs()` (typed definitions). If both exist, `defs()` wins. Definitions are compiled into the container before anything runs, so keep them free of side effects.
- **Lifecycle (optional)**: extend `Glueful\Extensions\ServiceProvider` to get `register(ApplicationContext $context)` and `boot(ApplicationContext $context)`. `register()` runs for every provider first, then `boot()` runs after all providers are registered. Both must keep the `ApplicationContext $context` parameter, or PHP raises a fatal signature error.
- In `register()` / `boot()` you can call the base class helpers: `loadRoutesFrom()`, `loadMigrationsFrom()`, `mergeConfig()`, `loadMessageCatalogs()`, `serveFrontend()`, `commands()`, `discoverCommands()`, `registerNotificationChannel()`. Providers can also declare `permissions()`, `roles()`, `voters()` and `policies()` for the permission catalog.
- In production, a provider whose definitions fail to load is skipped and reported by `extensions:diagnose`; outside production the error is thrown.

```php
use App\Listeners\OrderListener;
use Glueful\Bootstrap\ApplicationContext;
use Glueful\Events\EventService;
use Glueful\Extensions\ServiceProvider;

final class EventServiceProvider extends ServiceProvider
{
    public static function services(): array
    {
        return [];
    }

    public function boot(ApplicationContext $context): void
    {
        // Wire listeners, register channels, etc. subscribe() autowires a listener class
        // that isn't a container service; one that can't be built throws here, at boot.
        app($context, EventService::class)->subscribe(OrderListener::class);
    }
}
```

Packaged extensions use the same `Glueful\Extensions\ServiceProvider` base, but are enabled in `config/extensions.php` (via `php glueful extensions:enable`) rather than `serviceproviders.php`. See [Building Extensions](/cookbook/extensions).

## Built-in Providers

The framework builds its container from these providers, in this order (`ContainerFactory`). They extend the internal `Glueful\Container\Providers\BaseServiceProvider` and are not user-configurable, but they're the definitive reference for core service ids:

| Provider | Registers (highlights) |
|---|---|
| `CoreProvider` | `'database'` / `Connection`, `'cache.store'` / `CacheStore`, `'logger'`, `'request'`, `Router`, `PermissionManager` (alias `'permission.manager'`), most middleware aliases |
| `ORMProvider` | ORM model support |
| `ConsoleProvider` | Console application and commands |
| `StorageProvider` | Storage manager, disks, `FileUploader` |
| `ExceptionProvider` | Exception `Handler`, `ExceptionHandlerInterface`, `'exception'` middleware |
| `RequestProvider` | Symfony `Request`, PSR-7 `ServerRequestInterface`, `RequestContext` |
| `ValidationProvider` | Validator |
| `SerializerProvider` | Serializer / normalizers |
| `HttpClientProvider` | `HttpClientInterface`, PSR-18 client, `Glueful\Http\Client` |
| `RepositoryProvider` | `RepositoryFactory`, `'repository'` |
| `AuthProvider` | Authentication manager, guards, token services, API keys |
| `NotificationsProvider` | Notification channels |
| `EventProvider` | `EventService`, PSR-14 dispatcher |
| `ExtensionProvider` | `ExtensionManager`, `'extensions'` |
| `QueueProvider` | `QueueManager`, `FailedJobProvider`, `JobScheduler` |
| `LockProvider` | Lock manager, `'lock'` |
| `FileProvider` | `FileFinder` (`'file.finder'`) |
| `HttpPsr15Provider` | PSR-15 bridge |
| `VarDumperProvider` | Var dumper |
| `ControllerProvider` | Framework controllers (`AuthController`, ...) |
| `LazyProvider` | Lazy warmup groups |
| `SecurityProvider` | Security services |
| `PermissionsProvider` / `GateProvider` | Permission catalog, `Gate` |
| `TasksProvider` | Built-in scheduled tasks |
| `ApiVersioningProvider` | Version negotiation, `'api_version'` middleware |

Most live in `src/Container/Providers/`; the rest are under their subsystem's `ServiceProvider/` directory (for example `src/Queue/ServiceProvider/QueueProvider.php`). Run `php glueful di:container:debug --services` to list what's actually registered.

## Next Steps

- [Dependency Injection](/advanced/dependency-injection) - service definitions, the `services()` DSL, factories, tags
- [Building Extensions](/cookbook/extensions) - package providers as an installable extension
- [Repositories](/advanced/repositories) - repository pattern
- [Testing](/advanced/testing) - test providers
