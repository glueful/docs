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

Most app providers are a plain class with a static `services()` method (see [DI → Service Registration](/advanced/dependency-injection#service-registration)). For typed, explicit control you can instead extend `BaseServiceProvider` and return definitions from `defs()`:

`app/Providers/AppServiceProvider.php`:

```php
<?php

namespace App\Providers;

use Glueful\Container\Providers\BaseServiceProvider;
use Glueful\Container\Definition\FactoryDefinition;
use Glueful\Container\Definition\AliasDefinition;

final class AppServiceProvider extends BaseServiceProvider
{
    public function defs(): array
    {
        return [
            // Autowire concrete service
            App\Services\OrderService::class => $this->autowire(App\Services\OrderService::class),

            // Factory with config
            'payment.gateway' => new FactoryDefinition(
                'payment.gateway',
                fn() => new App\Payments\StripePaymentGateway(config($this->context, 'services.stripe'))
            ),

            // Alias interface to id
            App\Contracts\PaymentGatewayInterface::class =>
                new AliasDefinition(App\Contracts\PaymentGatewayInterface::class, 'payment.gateway'),
        ];
    }
}
```

### Register Provider

Register providers in `config/serviceproviders.php`:

```php
return [
    'enabled' => [
        App\Providers\AppServiceProvider::class,
    ],
];
```

## Provider Model

- Providers extend `BaseServiceProvider` and return an array of service definitions in `defs()`.
- Use `autowire()` for concrete classes, `FactoryDefinition` for factory-built services, and `AliasDefinition` to map type-hints to ids.
- Avoid side effects in providers; initialize on first use or via explicit boot steps (e.g., console commands, listeners) rather than a `boot()` method.

## Built-in Providers

Glueful ships with several providers you can inspect for reference:

- CoreProvider — core services/aliases
  - File: `src/Container/Providers/CoreProvider.php`
  - Aliases/services: `'logger'` (→ `Psr\Log\LoggerInterface`), `'database'`, `'request'`, `'cache.store'` (via factory), query/schema builders

- RepositoryProvider — repositories factory
  - File: `src/Container/Providers/RepositoryProvider.php`
  - Services: `Glueful\Repository\RepositoryFactory`, alias `'repository'`

- QueueProvider — queue system
  - File: `src/Queue/ServiceProvider/QueueProvider.php`
  - Services: `Glueful\Queue\QueueManager`, `Glueful\Queue\Failed\FailedJobProvider`, `Glueful\Scheduler\JobScheduler`

- HttpClientProvider — HTTP client stack
  - File: `src/Http/ServiceProvider/HttpClientProvider.php`
  - Services: `Symfony\Contracts\HttpClient\HttpClientInterface`, `Psr\Http\Client\ClientInterface`, `Glueful\Http\Client`

- SerializerProvider — serialization/normalization
  - File: `src/Serialization/ServiceProvider/SerializerProvider.php`

- SecurityProvider — auth/security helpers
  - File: `src/Security/ServiceProvider/SecurityProvider.php`

- TasksProvider — task scheduling/related bindings
  - File: `src/Tasks/ServiceProvider/TasksProvider.php`

- (PSR‑15) HttpPsr15Provider — PSR‑15 bridge config
  - File: `src/Container/Providers/HttpPsr15Provider.php`

Tip: Open these files to learn consistent patterns for FactoryDefinition, AliasDefinition, and autowire usage.

## Next Steps

- [Dependency Injection](/advanced/dependency-injection) - service definitions, the `services()` DSL, factories, tags
- [Building Extensions](/cookbook/extensions) - package providers as an installable extension
- [Repositories](/advanced/repositories) - repository pattern
- [Testing](/advanced/testing) - test providers
