---
title: Dependency Injection
description: Manage dependencies with the service container
---

Glueful uses a service container for dependency injection, making your code testable and decoupled.

For standalone examples on this page, assume `$context` is an available `ApplicationContext`. In controllers, prefer constructor injection and `BaseController` helpers over ad hoc container calls.

## Quick Start

### Resolving from Container

```php
// Get services from the container
$db = app($context, 'database'); // Glueful\\Database\\Connection
$cache = app($context, \\Glueful\\Cache\\CacheStore::class);

// Convenience alias
$logger = app($context, \\Psr\\Log\\LoggerInterface::class); // aliased to 'logger'
```

### Constructor Injection

```php
class UserController
{
    public function __construct(
        private UserRepository $users,
        private CacheInterface $cache
    ) {}

    public function index()
    {
        return $this->cache->remember('users:all', function () {
            return $this->users->all();
        });
    }
}
```

### Method Injection

```php
class TaskController extends \Glueful\Controllers\BaseController
{
    public function store(Request $request, TaskRepository $tasks)
    {
        $data = $this->getRequestData();

        if ($error = $this->validateRequest($data, [
            'title' => 'required|max:255',
        ])) {
            return $error;
        }

        $task = $tasks->create($data);

        return $this->created($task);
    }
}
```

## Container Bindings

In Glueful, you register services via Service Providers (extending the framework’s BaseServiceProvider). Define your services in the `defs()` method using autowire/alias/factory definitions.

```php
namespace App\Providers;

use Glueful\Container\Providers\BaseServiceProvider;
use Glueful\Container\Definition\FactoryDefinition;
use Glueful\Container\Definition\AliasDefinition;

final class AppServiceProvider extends BaseServiceProvider
{
    public function defs(): array
    {
        return [
            // Autowire concrete classes (shared by default)
            App\Services\OrderService::class => $this->autowire(App\Services\OrderService::class),

            // Factory-built services
            'report.generator' => new FactoryDefinition(
                'report.generator',
                fn() => new App\Services\ReportGenerator(config($this->getContext(), 'app'))
            ),

            // Aliases (map type-hints to existing ids)
            \Psr\Log\LoggerInterface::class =>
                new AliasDefinition(\Psr\Log\LoggerInterface::class, 'logger'),
        ];
    }
}
```

Register your provider in `config/serviceproviders.php` under `'enabled'` to load it. Extensions/providers can also be managed in `config/extensions.php`.

## Auto-Resolution

The container resolves type-hinted dependencies for services it knows about (registered or autowireable):

```php
class OrderService
{
    public function __construct(
        private Database $db,
        private EmailService $email,
        private LoggerInterface $logger
    ) {}
}

// Container resolves dependencies
$orderService = app($context, OrderService::class);
```

### Type-Hinted Parameters

```php
public function processOrder(
    Request $request,
    OrderService $orders,
    PaymentGateway $gateway
) {
    // All parameters auto-injected
}
```

## Service Providers

Organize container services with providers (defs + autowire/factory/alias):

```php
use Glueful\\Container\\Providers\\BaseServiceProvider;
use Glueful\\Container\\Definition\\FactoryDefinition;
use Glueful\\Container\\Definition\\AliasDefinition;

final class CacheServiceProvider extends BaseServiceProvider
{
    public function defs(): array
    {
        return [
            // Cache store (factory)
            'cache.store' => new FactoryDefinition(
                'cache.store',
                fn() => \\Glueful\\Cache\\CacheFactory::create()
            ),
            // Alias for type-hints
            \\Glueful\\Cache\\CacheStore::class =>
                new AliasDefinition(\\Glueful\\Cache\\CacheStore::class, 'cache.store'),
        ];
    }
}
```

### Registering Providers

Register application providers via `config/serviceproviders.php` (order preserved). Extensions/providers can also be managed in `config/extensions.php`.

## Contextual Binding

Note: The Laravel-style contextual binding API (`when()->needs()->give()`) is not supported in Glueful’s container. Prefer explicit factories, adapters, or separate service ids registered via providers.

## Practical Examples

### Repository Pattern

```php
interface UserRepositoryInterface
{
    public function find($id);
    public function all();
}

class UserRepository implements UserRepositoryInterface
{
    public function __construct(private Database $db) {}

    public function find($id)
    {
        return $this->db->table('users')->find($id);
    }

    public function all()
    {
        return $this->db->table('users')->get();
    }
}

// Bind interface to implementation
$container->bind(
    UserRepositoryInterface::class,
    UserRepository::class
);

// Use in controller
class UserController
{
    public function __construct(
        private UserRepositoryInterface $users
    ) {}

    public function index()
    {
        return Response::success($this->users->all());
    }
}
```

### Service Layer

```php
class OrderService
{
    public function __construct(
        private Database $db,
        private PaymentGateway $payment,
        private EmailService $email,
        private LoggerInterface $logger
    ) {}

    public function createOrder(array $data): Order
    {
        $this->db->beginTransaction();

        try {
            // Create order
            $order = $this->db->table('orders')->create($data);

            // Process payment
            $this->payment->charge($order->total, $data['payment_method']);

            // Send confirmation
            $this->email->send($order->email, 'order-confirmation', [
                'order' => $order,
            ]);

            $this->db->commit();

            $this->logger->info('Order created', ['order_id' => $order->id]);

            return $order;
        } catch (\Exception $e) {
            $this->db->rollback();
            $this->logger->error('Order failed', ['error' => $e->getMessage()]);
            throw $e;
        }
    }
}

// Register service via provider autowire (see AppServiceProvider above)

// Use in controller
class OrderController
{
    public function store(Request $request, OrderService $orders)
    {
        $order = $orders->createOrder($request->toArray());
        return Response::created($order);
    }
}
```

### Factory Pattern

```php
interface NotificationChannelInterface
{
    public function send($recipient, $message);
}

class NotificationFactory
{
    public function __construct(private Container $container) {}

    public function make(string $channel): NotificationChannelInterface
    {
        return match ($channel) {
            'email' => $this->container->make(EmailChannel::class),
            'sms' => $this->container->make(SmsChannel::class),
            'push' => $this->container->make(PushChannel::class),
            default => throw new \InvalidArgumentException("Unknown channel: {$channel}"),
        };
    }
}

// Register factory
$container->singleton(NotificationFactory::class);

// Use factory
class NotificationService
{
    public function __construct(private NotificationFactory $factory) {}

    public function notify($user, $message, $channels)
    {
        foreach ($channels as $channelName) {
            $channel = $this->factory->make($channelName);
            $channel->send($user, $message);
        }
    }
}
```

## Testing with DI

Dependency injection makes testing easy:

```php
use PHPUnit\Framework\TestCase;

class OrderServiceTest extends TestCase
{
    public function test_creates_order()
    {
        // Mock dependencies
        $db = $this->createMock(Database::class);
        $payment = $this->createMock(PaymentGateway::class);
        $email = $this->createMock(EmailService::class);
        $logger = $this->createMock(LoggerInterface::class);

        // Set expectations
        $payment->expects($this->once())
            ->method('charge')
            ->with(100.00, 'card_123');

        // Create service with mocks
        $service = new OrderService($db, $payment, $email, $logger);

        // Test
        $order = $service->createOrder([
            'total' => 100.00,
            'payment_method' => 'card_123',
        ]);

        $this->assertNotNull($order);
    }
}
```

### Swap Bindings in Tests

```php
class UserControllerTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Replace real repository with mock
        container($context)->load([
            UserRepositoryInterface::class => fn() => new FakeUserRepository(),
        ]);
    }

    public function test_lists_users()
    {
        $response = $this->get('/api/users');
        $response->assertStatus(200);
    }
}
```

## Best Practices

### 1. Depend on Interfaces

```php
// ✅ Good - depend on interface
class UserService
{
    public function __construct(
        private CacheInterface $cache,
        private LoggerInterface $logger
    ) {}
}

// ❌ Bad - depend on concrete class
class UserService
{
    public function __construct(
        private RedisCache $cache,
        private FileLogger $logger
    ) {}
}
```

### 2. Use Constructor Injection

```php
// ✅ Good - dependencies clear and testable
class TaskService
{
    public function __construct(
        private Database $db,
        private EventDispatcher $events
    ) {}

    public function create(array $data)
    {
        $task = $this->db->table('tasks')->create($data);
        $this->events->dispatch(new TaskCreated($task));
        return $task;
    }
}

// ❌ Bad - hidden dependencies
class TaskService
{
    public function create(array $data)
    {
        $task = db($context)->table('tasks')->create($data);
        event(new TaskCreated($task));
        return $task;
    }
}
```

### 3. Keep Constructors Simple

```php
// ✅ Good - only store dependencies
public function __construct(
    private Database $db,
    private CacheInterface $cache
) {}

// ❌ Bad - logic in constructor
public function __construct(Database $db)
{
    $this->db = $db;
    $this->users = $db->table('users')->get(); // Don't do this
}
```

### 4. Use Singletons Wisely

```php
// ✅ Good - stateless singletons
$container->singleton(Database::class);
$container->singleton(CacheInterface::class);

// ⚠️ Careful - stateful singletons
$container->singleton(ShoppingCart::class); // May cause issues
```

## Container Methods

### Binding

```php
// Bind service
$container->bind('service', callable $factory);

// Singleton (shared instance)
$container->singleton('service', callable $factory);

// Bind instance
$container->instance('service', $instance);

// Alias
$container->alias('name', 'actual-name');
```

### Resolving

```php
// Resolve service
$service = $container->make('service');
$service = $container->get('service');
$service = $container['service'];

// Check if bound
if ($container->bound('service')) {
    //...
}

// Check if singleton
if ($container->isShared('service')) {
    //...
}
```

### Helper Functions

```php
// Get container instance
$container = container($context);

// Resolve service by id or class
$db = app($context, 'database');
$cache = app($context, \Glueful\Cache\CacheStore::class);

// Convenience helper
$queue = service($context, \Glueful\Queue\QueueManager::class);
```

## Built-in Aliases

Common container ids and class aliases registered by core providers:

- 'logger' → \Psr\Log\LoggerInterface
  - Resolve with: app($context, 'logger') or app($context, \Psr\Log\LoggerInterface::class)
- 'database' → \Glueful\Database\Connection
  - Resolve with: app($context, 'database')
  - Also available: \Glueful\Database\QueryBuilder::class, \Glueful\Database\Schema\Interfaces\SchemaBuilderInterface::class
- 'cache.store' → \Glueful\Cache\CacheStore
  - Resolve with: app($context, 'cache.store') or app($context, \Glueful\Cache\CacheStore::class)
- 'request' → \Symfony\Component\HttpFoundation\Request (from globals)
- Queue manager (class-based): `\Glueful\Queue\QueueManager` via `service($context, \Glueful\Queue\QueueManager::class)` or `app($context, \Glueful\Queue\QueueManager::class)`

Note: Exact registrations can vary with environment and extensions. Check config/serviceproviders.php, config/extensions.php, and the provider classes for full lists.

### More Core Services and Aliases

These are commonly available from CoreProvider and related providers:

- Logging
  - 'logger' (Factory) and alias to \Psr\Log\LoggerInterface

- Database
  - 'database' → \Glueful\Database\Connection
  - \Glueful\Database\QueryBuilder::class (factory via connection)
  - \Glueful\Database\Schema\Interfaces\SchemaBuilderInterface::class (factory via connection)

- Cache
  - 'cache.store' (Factory) and alias to \Glueful\Cache\CacheStore

- HTTP/Request
  - 'request' → \Symfony\Component\HttpFoundation\Request

- Auth (selected examples)
  - \Glueful\Auth\AuthenticationManager (autowire)
  - \Glueful\Auth\AuthenticationGuard (factory using AuthenticationService)
  - \Glueful\Auth\TokenManager (factory + initializer)

- Permissions
  - \Glueful\Permissions\Gate (factory configured from config/permissions.php)

- Queue & Scheduling
  - \Glueful\Queue\QueueManager (autowire)
  - \Glueful\Queue\Failed\FailedJobProvider (autowire)
  - \Glueful\Scheduler\JobScheduler (autowire)

This list focuses on stable, commonly used services. Explore \Glueful\Container\Providers\CoreProvider, QueueProvider, SecurityProvider, SerializerProvider, HttpClientProvider, TasksProvider, etc., for the definitive set.

## Custom AppServiceProvider (Quick Start)

1) Create a provider (e.g., `app/Providers/AppServiceProvider.php`):

```php
namespace App\Providers;

use Glueful\Container\Providers\BaseServiceProvider;
use Glueful\Container\Definition\FactoryDefinition;
use Glueful\Container\Definition\AliasDefinition;

final class AppServiceProvider extends BaseServiceProvider
{
    public function defs(): array
    {
        return [
            // Autowired service
            App\Services\ReportService::class => $this->autowire(App\Services\ReportService::class),

            // Factory-built service with config
            'reports.exporter' => new FactoryDefinition(
                'reports.exporter',
                fn() => new App\Services\Exporter(config($this->getContext(), 'app.urls'))
            ),

            // Alias a type-hint to an id
            App\Contracts\ExporterInterface::class =>
                new AliasDefinition(App\Contracts\ExporterInterface::class, 'reports.exporter'),
        ];
    }
}
```

2) Enable it in `config/serviceproviders.php`:

```php
return [
    'enabled' => [
        App\Providers\AppServiceProvider::class,
    ],
];
```

3) Resolve anywhere:

```php
$reports = app($context, App\Services\ReportService::class);
$exporter = app($context, App\Contracts\ExporterInterface::class); // resolves to 'reports.exporter'
```

## Troubleshooting

**Class not found?**
- Check namespace is correct
- Ensure class is autoloaded
- Verify binding is registered

**Circular dependency?**
- Review constructor dependencies
- Use setter injection if needed
- Refactor to remove circular reference

**Cannot instantiate interface?**
- Bind interface to implementation
- Check binding is registered before use

**Wrong instance injected?**
- Check binding order (last binding wins)
- Verify contextual binding if used
- Clear container cache if applicable

## Next Steps

- [Service Providers](/advanced/service-providers) - Organize bindings
- [Repositories](/advanced/repositories) - Repository pattern
- [Testing](/advanced/testing) - Test with DI
- [Middleware](/advanced/middleware) - DI in middleware
