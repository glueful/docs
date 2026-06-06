---
title: Service Providers
description: Organize application services and bootstrapping
---

Service providers are the central place to configure and bootstrap your application services.

## Quick Start

### Create a Service Provider

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
                fn() => new App\Payments\StripePaymentGateway(config($context, 'services.stripe'))
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

## Common Patterns

### Database Service Example

CoreProvider registers a connection as `'database'`. To expose a scoped helper:

```php
use Glueful\Container\Providers\BaseServiceProvider;
use Glueful\Container\Definition\FactoryDefinition;

final class ReportingDbProvider extends BaseServiceProvider
{
    public function defs(): array
    {
        return [
            'db.reporting' => new FactoryDefinition(
                'db.reporting',
                fn(\Psr\Container\ContainerInterface $c) => $c->get('database')
            ),
        ];
    }
}
```

### Cache Service Example

Glueful registers `'cache.store'` and aliases `Glueful\Cache\CacheStore::class`. To create a named cache:

```php
use Glueful\Container\Providers\BaseServiceProvider;
use Glueful\Container\Definition\FactoryDefinition;

final class CacheServiceProvider extends BaseServiceProvider
{
    public function defs(): array
    {
        return [
            'cache.reports' => new FactoryDefinition(
                'cache.reports',
                fn() => \Glueful\Cache\CacheFactory::create()
            ),
        ];
    }
}
```

### Queue Service Example

Resolve the manager as needed:

```php
$queue = app($context, \Glueful\Queue\QueueManager::class);
$queue->push(App\Jobs\SendEmail::class, ['userId' => $id]);
```

### Notification Service Provider

Build a service from config using a `FactoryDefinition`:

```php
use Glueful\Container\Providers\BaseServiceProvider;
use Glueful\Container\Definition\FactoryDefinition;

final class NotificationServiceProvider extends BaseServiceProvider
{
    public function defs(): array
    {
        return [
            'notifications' => new FactoryDefinition(
                'notifications',
                function () {
                    $manager = new NotificationManager();
                    $manager->registerChannel('email', new EmailChannel(config($context, 'mail')));
                    $manager->registerChannel('sms', new SmsChannel(config($context, 'sms')));
                    $manager->registerChannel('push', new PushChannel(config($context, 'push')));

                    return $manager;
                }
            ),
        ];
    }
}
```

## Custom Providers

### Repository Provider

Map interfaces to implementations with `alias()`/`AliasDefinition`, and autowire the concrete classes:

```php
use Glueful\Container\Providers\BaseServiceProvider;

final class RepositoryServiceProvider extends BaseServiceProvider
{
    public function defs(): array
    {
        return [
            // Autowire the concrete repositories
            App\Repositories\OrderRepository::class => $this->autowire(App\Repositories\OrderRepository::class),
            App\Repositories\ProductRepository::class => $this->autowire(App\Repositories\ProductRepository::class),

            // Map type-hints to the concrete ids
            App\Contracts\OrderRepositoryInterface::class =>
                $this->alias(App\Contracts\OrderRepositoryInterface::class, App\Repositories\OrderRepository::class),
            App\Contracts\ProductRepositoryInterface::class =>
                $this->alias(App\Contracts\ProductRepositoryInterface::class, App\Repositories\ProductRepository::class),
        ];
    }
}
```

### API Client Provider

```php
use Glueful\Container\Providers\BaseServiceProvider;
use Glueful\Container\Definition\FactoryDefinition;

final class ApiServiceProvider extends BaseServiceProvider
{
    public function defs(): array
    {
        return [
            StripeClient::class => new FactoryDefinition(
                StripeClient::class,
                fn() => new StripeClient(config($context, 'services.stripe.secret'))
            ),

            SendGridClient::class => new FactoryDefinition(
                SendGridClient::class,
                fn() => new SendGridClient(config($context, 'services.sendgrid.api_key'))
            ),

            S3Client::class => new FactoryDefinition(
                S3Client::class,
                function () {
                    $config = config($context, 'filesystems.s3');

                    return new S3Client([
                        'credentials' => [
                            'key' => $config['key'],
                            'secret' => $config['secret'],
                        ],
                        'region' => $config['region'],
                        'version' => 'latest',
                    ]);
                }
            ),
        ];
    }
}
```

## Advanced Patterns

### Environment-Specific Services

Branch on configuration when building a definition:

```php
use Glueful\Container\Providers\BaseServiceProvider;

final class PaymentServiceProvider extends BaseServiceProvider
{
    public function defs(): array
    {
        $impl = match (config($context, 'app.env')) {
            'production' => StripePaymentGateway::class,
            'staging' => StripeTestGateway::class,
            default => FakePaymentGateway::class,
        };

        return [
            $impl => $this->autowire($impl),
            PaymentGateway::class => $this->alias(PaymentGateway::class, $impl),
        ];
    }
}
```

## Testing with Providers

### Override Bindings in Tests

```php
class UserServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Replace provider bindings
        container($context)->load([
            EmailService::class => fn() => new FakeEmailService(),
            PaymentGateway::class => fn() => new FakePaymentGateway(),
        ]);
    }

    public function test_creates_user()
    {
        $service = app($context, UserService::class);
        $user = $service->create(['email' => 'test@example.com']);

        $this->assertNotNull($user);
    }
}
```

### Mock Services

```php
class OrderServiceTest extends TestCase
{
    public function test_processes_order()
    {
        // Mock payment gateway
        $gateway = $this->createMock(PaymentGateway::class);
        $gateway->method('charge')->willReturn(['status' => 'success']);

        container($context)->load([
            PaymentGateway::class => fn() => $gateway,
        ]);

        // Test
        $service = app($context, OrderService::class);
        $order = $service->processOrder($orderData);

        $this->assertEquals('completed', $order->status);
    }
}
```

## Best Practices

### 1. Keep Providers Focused

```php
// ✅ Good - focused provider
final class CacheServiceProvider extends BaseServiceProvider
{
    public function defs(): array
    {
        // Only cache-related definitions
        return [/* ... */];
    }
}

// ❌ Bad - mixed concerns
final class AppServiceProvider extends BaseServiceProvider
{
    public function defs(): array
    {
        // Cache, queue, email, payment, etc.
        return [/* ... */];
    }
}
```

### 2. Avoid Side Effects in defs()

`defs()` should only return definitions. Keep wiring that triggers work (event
subscriptions, channel registration) out of definition building; do it lazily on
first use, or use a lifecycle `ServiceProvider` (`register()`/`boot()`) for an
extension. See [Extensions](/extending/extensions).

```php
// ✅ Good - defs() just declares services
public function defs(): array
{
    return [
        EventService::class => $this->autowire(EventService::class),
    ];
}

// ❌ Bad - resolving and mutating services while declaring them
public function defs(): array
{
    $events = app($this->getContext(), EventService::class); // don't resolve here
    $events->addListener(/* ... */);

    return [/* ... */];
}
```

### 3. Document Provider Dependencies

```php
/**
 * Requires:
 * - ConfigServiceProvider
 * - DatabaseServiceProvider
 *
 * Provides:
 * - UserRepository
 * - OrderRepository
 */
class RepositoryServiceProvider
{
    //...
}
```

### 4. Organize Providers by Domain

```
app/Providers/
├── AppServiceProvider.php       # Core app services
├── DatabaseServiceProvider.php  # Database
├── CacheServiceProvider.php     # Caching
├── QueueServiceProvider.php     # Queues
├── EventServiceProvider.php     # Events
├── NotificationServiceProvider.php
├── PaymentServiceProvider.php
└── RepositoryServiceProvider.php
```

## Troubleshooting

**Services not available in register()?**
- Move code to `boot()` method
- Other providers may not have registered yet

**Circular dependency?**
- Review service dependencies
- Use lazy loading or setter injection
- Refactor to remove circular reference

**Provider not loading?**
- Check `config/serviceproviders.php` (and `config/extensions.php` for extensions)
- Verify namespace/class exists and is autoloaded

**Bindings overwritten?**
- Check provider order
- Last binding wins for same key
- Use unique service names

## Next Steps

- [Dependency Injection](/advanced/dependency-injection) - Container basics
- [Repositories](/advanced/repositories) - Repository pattern
- [Testing](/advanced/testing) - Test providers
- [Configuration](/advanced/configuration) - Manage config
