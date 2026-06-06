---
title: Repositories
description: Encapsulate data access with the repository pattern
---

Repositories provide a clean, testable layer over database operations, separating domain logic from data access.

## Quick Start

### Create a Repository

```php
<?php

namespace App\Repositories;

use Glueful\Repository\BaseRepository;

class UserRepository extends BaseRepository
{
    public function getTableName(): string
    {
        return 'users';
    }

    public function findByEmail(string $email)
    {
        return $this->db->table($this->table)
            ->where('email', $email)
            ->first();
    }

    public function findActive()
    {
        return $this->db->table($this->table)
            ->where('status', 'active')
            ->get();
    }
}
```

### Use in Controller

```php
class UserController
{
    public function __construct(private UserRepository $users) {}

    public function index()
    {
        $activeUsers = $this->users->findActive();
        return Response::success($activeUsers);
    }

    public function show($id)
    {
        $user = $this->users->find($id);

        if (!$user) {
            return Response::error('User not found', 404);
        }

        return Response::success($user);
    }
}
```

## Base Repository Methods

The `BaseRepository` provides standard CRUD operations:

### Find Operations

```php
// Find by primary key
$user = $repository->find($uuid);

// Find by conditions
$users = $repository->findWhere(['status' => 'active']);

// Find multiple by IDs
$users = $repository->findMultiple(['uuid1', 'uuid2', 'uuid3']);

// Find first match by field
$user = $repository->findBy('email', 'john@example.com');
```

### Create Operations

```php
// Create single record (returns UUID)
$uuid = $repository->create([
    'name' => 'John Doe',
    'email' => 'john@example.com',
    'status' => 'active',
]);

// Fetch the created record if needed
$user = $repository->find($uuid);

// Bulk create (returns array of UUIDs)
$uuids = $repository->bulkCreate([
    ['name' => 'John', 'email' => 'john@example.com'],
    ['name' => 'Jane', 'email' => 'jane@example.com'],
]);
```

### Update Operations

```php
// Update single record
$repository->update($uuid, [
    'status' => 'inactive',
]);

// Bulk update a set of records by UUID
$repository->bulkUpdate(
    ['uuid1', 'uuid2', 'uuid3'],
    ['status' => 'active']
);
```

### Delete Operations

```php
// Delete by ID
$repository->delete($uuid);

// Bulk delete
$repository->bulkDelete(['uuid1', 'uuid2', 'uuid3']);

// Soft delete (if supported)
$repository->softDelete($uuid);
```

### Pagination

```php
// Basic usage
$result = $repository->paginate(
    page: 1,
    perPage: 20,
    conditions: ['status' => 'active'],
    orderBy: ['created_at' => 'DESC']
);

// With selected fields
$result = $repository->paginate(
    page: 2,
    perPage: 25,
    conditions: ['status' => 'active'],
    orderBy: ['created_at' => 'DESC'],
    fields: ['uuid', 'name', 'email', 'status']
);

// Returns an array structure like:
// [
//   'data' => [...records...],
//   'total' => 100,
//   'page' => 1,
//   'perPage' => 20,
//   'totalPages' => 5,
//   'hasNextPage' => true,
//   'hasPreviousPage' => false,
// ]
```

## Custom Repository Methods

Add domain-specific methods to your repositories:

### Query Methods

```php
class ArticleRepository extends BaseRepository
{
    public function getTableName(): string
    {
        return 'articles';
    }

    public function findPublished(int $limit = 50): array
    {
        return $this->db->table($this->table)
            ->where('status', 'published')
            ->orderBy('published_at', 'DESC')
            ->limit($limit)
            ->get();
    }

    public function findByAuthor(string $authorId): array
    {
        return $this->db->table($this->table)
            ->where('author_id', $authorId)
            ->orderBy('created_at', 'DESC')
            ->get();
    }

    public function countByStatus(string $status): int
    {
        return $this->db->table($this->table)
            ->where('status', $status)
            ->count();
    }
}
```

### Complex Queries

```php
class OrderRepository extends BaseRepository
{
    public function getTableName(): string
    {
        return 'orders';
    }

    public function findWithItems(string $orderId)
    {
        return $this->db->table($this->table)
            ->select([
                'orders.*',
                'order_items.product_id',
                'order_items.quantity',
                'order_items.price',
            ])
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.uuid', $orderId)
            ->get();
    }

    public function getRevenueByMonth(int $year): array
    {
        return $this->db->table($this->table)
            ->select([
                'MONTH(created_at) as month',
                'SUM(total) as revenue',
            ])
            ->where('YEAR(created_at)', $year)
            ->groupBy('MONTH(created_at)')
            ->get();
    }
}
```

## Data Transfer Objects (DTOs)

Use DTOs for explicit contracts and type safety:

### Create DTO

```php
<?php

namespace App\DTO;

final class UserDTO
{
    public function __construct(
        public readonly string $uuid,
        public readonly string $name,
        public readonly string $email,
        public readonly string $status,
        public readonly ?string $createdAt = null,
    ) {}

    public static function fromArray(array $row): self
    {
        return new self(
            uuid: $row['uuid'],
            name: $row['name'],
            email: $row['email'],
            status: $row['status'],
            createdAt: $row['created_at'] ?? null,
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->uuid,
            'name' => $this->name,
            'email' => $this->email,
            'status' => $this->status,
        ];
    }
}
```

### Repository with DTOs

```php
class UserRepository extends BaseRepository
{
    public function getTableName(): string
    {
        return 'users';
    }

    public function findDto(string $uuid): ?UserDTO
    {
        $row = $this->find($uuid);
        return $row ? UserDTO::fromArray($row) : null;
    }

    /** @return UserDTO[] */
    public function findActiveDto(): array
    {
        $rows = $this->findWhere(['status' => 'active']);
        return array_map(fn($r) => UserDTO::fromArray($r), $rows);
    }
}
```

## Unit of Work Pattern

Coordinate multiple repository operations atomically:

```php
use Glueful\Repository\UnitOfWork;

$uow = new UnitOfWork($connection);

// Register operations
$uow->registerNew('users', [
    'uuid' => nanoid(),
    'name' => 'John',
    'email' => 'john@example.com',
]);

$uow->registerDirty('articles', $articleUuid, [
    'status' => 'published',
]);

$uow->registerRemoved('comments', $commentUuid);

// Commit all changes atomically
try {
    $result = $uow->commit();
    app($context, \Psr\Log\LoggerInterface::class)->info('Transaction committed', ['changes' => $result]);
} catch (\Exception $e) {
    app($context, \Psr\Log\LoggerInterface::class)->error('Transaction failed', ['error' => $e->getMessage()]);
    throw $e;
}
```

### Use Case Example

```php
class OrderService
{
    public function __construct(
        private UnitOfWork $uow,
        private OrderRepository $orders,
        private InventoryRepository $inventory
    ) {}

    public function placeOrder(array $orderData): void
    {
        // Register new order
        $this->uow->registerNew('orders', [
            'uuid' => \Glueful\Helpers\Utils::generateNanoID(),
            'user_id' => $orderData['user_id'],
            'total' => $orderData['total'],
            'status' => 'pending',
        ]);

        // Update inventory
        foreach ($orderData['items'] as $item) {
            $product = $this->inventory->find($item['product_id']); // returns array

            $this->uow->registerDirty('products', $product['uuid'], [
                'stock' => ((int)$product['stock']) - $item['quantity'],
            ]);
        }

        // Commit all changes atomically
        $this->uow->commit();
    }
}
```

## Repository Factory

Centralize repository instantiation:

```php
use Glueful\Repository\RepositoryFactory;

// Recommended: resolve from container
$factory = app($context, RepositoryFactory::class);

// Get a typed repository by class
$notifications = $factory->get(\App\Repositories\ArticleRepository::class);

// Built-in typed helper for the notifications repository
$notifications = $factory->notifications();

// Get a generic repository for a table/resource
$repository = $factory->getRepository('any_table');
```

## Events

Repositories emit lifecycle events:

```php
use Glueful\Events\EventService;
use Glueful\Events\Database\EntityCreatedEvent;
use Glueful\Events\Database\EntityUpdatedEvent;

$events = app($context, EventService::class);

// Listen to repository events
$events->addListener(EntityCreatedEvent::class, function ($event) use ($context) {
    app($context, \Psr\Log\LoggerInterface::class)->info('Entity created', [
        'table' => $event->getTable(),
        'id' => $event->getEntityId(),
    ]);

    // Clear cache
    $cache = \Glueful\Cache\CacheFactory::create();
    $cache->delete("entities:{$event->getTable()}");
});

$events->addListener(EntityUpdatedEvent::class, function ($event) use ($context) {
    app($context, \Psr\Log\LoggerInterface::class)->info('Entity updated', [
        'table' => $event->getTable(),
        'id' => $event->getEntityId(),
    ]);
});
```

## Testing Repositories

### Use In-Memory Database

```php
use PHPUnit\Framework\TestCase;

class UserRepositoryTest extends TestCase
{
    private UserRepository $repository;

    protected function setUp(): void
    {
        // Use SQLite in-memory for fast tests
        $connection = new Connection('sqlite::memory:');

        // Run migrations
        $this->runMigrations($connection);

        $this->repository = new UserRepository($connection);
    }

    public function test_creates_user()
    {
        $uuid = $this->repository->create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'status' => 'active',
        ]);

        $this->assertNotNull($uuid);

        $user = $this->repository->find($uuid);
        $this->assertEquals('John Doe', $user['name']);
    }

    public function test_finds_by_email()
    {
        $this->repository->create([
            'name' => 'John',
            'email' => 'john@example.com',
        ]);

        $user = $this->repository->findByEmail('john@example.com');

        $this->assertNotNull($user);
        $this->assertEquals('John', $user['name']);
    }
}
```

### Mock Repository

```php
class OrderServiceTest extends TestCase
{
    public function test_processes_order()
    {
        $orderRepo = $this->createMock(OrderRepository::class);
        $orderRepo->expects($this->once())
            ->method('create')
            ->willReturn(['uuid' => 'order-123']);

        $service = new OrderService($orderRepo);
        $order = $service->processOrder($orderData);

        $this->assertEquals('order-123', $order['uuid']);
    }
}
```

## Best Practices

### 1. Keep Repositories Focused

```php
// ✅ Good - focused on data access
class UserRepository extends BaseRepository
{
    public function findByEmail(string $email) { ... }
    public function findActive() { ... }
}

// ❌ Bad - business logic in repository
class UserRepository extends BaseRepository
{
    public function sendWelcomeEmail($userId) { ... }
    public function calculateRewards($userId) { ... }
}
```

### 2. Use Specific Selects

```php
// ✅ Good - select only needed columns
public function listUsers(): array
{
    return $this->db->table($this->table)
        ->select(['uuid', 'name', 'email', 'status'])
        ->get();
}

// ❌ Bad - select all columns
public function listUsers(): array
{
    return $this->db->table($this->table)->get();
}
```

### 3. Batch Operations

```php
// ✅ Good - bulk create
$repository->bulkCreate($users);

// ❌ Bad - loop with create
foreach ($users as $user) {
    $repository->create($user);
}
```

### 4. Domain-Specific Methods

```php
// ✅ Good - intention-revealing names
$repository->findPublishedArticles();
$repository->findActiveSubscriptions();

// ❌ Bad - generic queries
$repository->findWhere(['status' => 'published']);
$repository->findWhere(['active' => 1]);
```

## Performance Tips

### Avoid N+1 Queries

```php
// ❌ Bad - N+1 query
$users = $repository->findAll();
foreach ($users as $user) {
    $user->orders = $orderRepository->findByUser($user->id);
}

// ✅ Good - use joins
public function findUsersWithOrders(): array
{
    return $this->db->table('users')
        ->join('orders', 'users.id', '=', 'orders.user_id')
        ->select(['users.*', 'orders.total'])
        ->get();
}
```

### Use Pagination

```php
// ✅ Good - paginate large datasets
$result = $repository->paginate(page: 1, perPage: 50);

// ❌ Bad - load everything
$users = $repository->findAll();
```

### Index Frequently Queried Columns

Ensure columns used in `where()` clauses are indexed in your migrations.

## Repository Defaults

- Primary key: `uuid` by default (override with `$primaryKey`).
- Timestamps: `create()` auto‑sets `created_at` (and `updated_at` when `$hasUpdatedAt = true`); `update()` refreshes `updated_at`.
- Events: `create()` dispatches `Glueful\\Events\\Database\\EntityCreatedEvent`; `update()` dispatches `Glueful\\Events\\Database\\EntityUpdatedEvent` with context (entity_id, operation, timestamp).

## Next Steps

- [Dependency Injection](/advanced/dependency-injection) - Inject repositories
- [Service Providers](/advanced/service-providers) - Register repositories
- [Testing](/advanced/testing) - Test repositories
- [Database](/essentials/database) - Query builder
