---
title: Testing
description: Write tests for your Glueful application
---

Write comprehensive tests to ensure your application works correctly.

## Quick Start

Glueful uses PHPUnit 10. The framework ships a base test case, `Glueful\Testing\TestCase`, for tests that need a booted application and container; plain `PHPUnit\Framework\TestCase` is the right choice for focused unit tests that don't.

```bash
# Run all tests
vendor/bin/phpunit

# Run one suite, or one test
vendor/bin/phpunit --testsuite Unit
vendor/bin/phpunit --filter UserServiceTest

# With coverage (needs Xdebug or PCOV)
vendor/bin/phpunit --coverage-html build/coverage
```

Scaffold a test class with the CLI:

```bash
php glueful scaffold:test UserServiceTest                                # unit test (default)
php glueful scaffold:test UserServiceTest --class="App\Services\UserService" --methods=create,update
php glueful scaffold:test CheckoutTest --feature                         # feature/integration test
```

## Test Structure

The api-skeleton ships this layout, with a `phpunit.xml` that defines the `Feature` and `Unit` suites:

```
tests/
├── Feature/        # Tests that boot the app
├── Unit/           # Isolated class tests
├── Support/        # Test doubles (e.g. InMemoryUserProvider)
└── TestCase.php    # App\Tests\TestCase extends Glueful\Testing\TestCase
```

## The Base TestCase

`Glueful\Testing\TestCase` **boots a fresh application in `setUp()` for every test**: `Framework::create($basePath)->withEnvironment('testing')->boot()`. In `tearDown()` it clears the permission provider installed by the `acting*` helpers, clears the context's config cache and request state, and drops the application.

| Method | Purpose |
| ------ | ------- |
| `$this->get(Service::class)` | Resolve a service from the booted container |
| `$this->getContainer()` | The PSR-11 container |
| `$this->has($id)` | Whether a service is registered |
| `$this->app()` | The `Glueful\Application` (`->handle($request)`, `->getContext()`) |
| `$this->actingWithPermissions([...], $uuid = 'test-user')` | Grant those permission slugs to `$uuid` only; returns the uuid |
| `$this->actingWithRoles([...], $uuid = 'test-user')` | Grant the permissions of declared roles; returns the uuid |
| `$this->refreshApplication()` | Reset state and boot a new application mid-test |
| `createApplication()` / `getBasePath()` | Override to change how or where the app boots |

`getBasePath()` defaults to `dirname(__DIR__, 3)` of the framework's `TestCase` file, which only points at your project when you override it. The skeleton's `App\Tests\TestCase` overrides `createApplication()` with its own root:

```php
namespace App\Tests;

use Glueful\Framework;
use Glueful\Testing\TestCase as FrameworkTestCase;

abstract class TestCase extends FrameworkTestCase
{
    protected function createApplication(): \Glueful\Application
    {
        return Framework::create(__DIR__ . '/..')
            ->withEnvironment('testing')
            ->boot();
    }
}
```

> Inside a test, resolve services with `$this->get(...)`; there is no `$context` variable in a test method. When an API needs the context, use `$this->app()->getContext()`.

### Permission helpers

`actingWithPermissions()` installs `Glueful\Testing\InMemoryPermissionProvider` in `replace` mode, so **only** the returned uuid is granted the given slugs. It does not authenticate a request: it returns the uuid to use as the acting user. `actingWithRoles()` resolves each role's permissions from the `PermissionRegistry` and throws `InvalidArgumentException` for a role that isn't declared, so a typo fails loudly instead of denying silently.

```php
public function test_editor_can_publish(): void
{
    $uuid = $this->actingWithPermissions(['posts.publish']);

    $permissions = $this->get('permission.manager');
    $this->assertTrue($permissions->can($uuid, 'posts.publish', 'posts'));
}
```

## Unit Tests

Test individual classes in isolation with plain PHPUnit; there is nothing to boot:

```php
namespace App\Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Services\PriceCalculator;

final class PriceCalculatorTest extends TestCase
{
    public function test_applies_discount(): void
    {
        $calculator = new PriceCalculator();

        $this->assertSame(90.0, $calculator->discounted(100.0, 0.10));
    }

    public function test_rejects_negative_discount(): void
    {
        $this->expectException(\InvalidArgumentException::class);

        (new PriceCalculator())->discounted(100.0, -0.5);
    }
}
```

## Integration Tests

Extend your app's `TestCase` and resolve real services. Services that need the context take it from `$this->app()->getContext()`:

```php
namespace App\Tests\Feature;

use App\Tests\TestCase;
use Glueful\Database\Connection;

final class ArticleQueryTest extends TestCase
{
    public function test_lists_published_articles(): void
    {
        $db = $this->get(Connection::class);

        $db->table('articles')->insert(['title' => 'Hello', 'status' => 'published']);

        $rows = $db->table('articles')->where('status', 'published')->get();
        $this->assertCount(1, $rows);
    }
}
```

The skeleton's own feature test needs no database: it swaps in a test double (`tests/Support/InMemoryUserProvider`) for the user store. Prefer that for seams that have an interface.

## Feature Tests (HTTP)

`$this->app()->handle()` runs a Symfony `Request` through the full pipeline: the router with your loaded routes and middleware, the exception handler, CORS and the baseline security headers.

```php
namespace App\Tests\Feature;

use App\Tests\TestCase;
use Symfony\Component\HttpFoundation\Request;

final class HealthTest extends TestCase
{
    public function test_liveness_probe_answers(): void
    {
        $response = $this->app()->handle(Request::create('/healthz', 'GET'));

        $this->assertSame(200, $response->getStatusCode());
    }
}
```

Framework API routes (auth, blobs, ...) are mounted under the API prefix (`/api/v1/...` by default); public routes such as `/healthz` are not; app route files under `routes/` control their own prefix.

::u-alert{color="warning" variant="subtle" icon="i-lucide-triangle-alert"}
`RouteManifest::load()` runs **once per process**. Since `TestCase` boots a new application for every test, the second and later boots get no freshly registered routes (only what the route cache holds). For HTTP tests, call `\Glueful\Routing\RouteManifest::reset()` before booting, for example at the top of your `createApplication()` override.
::

To test a route in isolation, build a router and register it directly:

```php
use Glueful\Http\Response;
use Glueful\Routing\Router;

$router = new Router($this->getContainer());
$router->get('/ping', fn() => Response::success(['pong' => true]));

$response = $router->dispatch(Request::create('/ping', 'GET'));
```

## Testing Database

### Use SQLite

Point the test run at SQLite in `phpunit.xml`. Use `DB_DRIVER` and `DB_SQLITE_DATABASE`; `DB_CONNECTION` is not read:

```xml
<php>
    <env name="APP_ENV" value="testing"/>
    <env name="CACHE_DRIVER" value="array"/>
    <env name="DB_DRIVER" value="sqlite"/>
    <env name="DB_SQLITE_DATABASE" value="storage/database/testing.sqlite"/>
    <env name="LOG_TO_FILE" value="false"/>
    <env name="LOG_TO_DB" value="false"/>
    <env name="JWT_KEY" value="testing-secret-key-not-for-production-use-only"/>
</php>
```

A relative `DB_SQLITE_DATABASE` is resolved from the project root; add the test file to `.gitignore`.

`DB_SQLITE_DATABASE=:memory:` (as the skeleton's `phpunit.xml` ships) is a real in-memory database since 1.91; before, it was resolved to a file named `:memory:` in the project root. An in-memory database lives only as long as its connection and each SQLite `Connection` opens its own, so it starts empty: `migrate:run` in another process can't populate it, and tables must be created in the test (for example in `setUp()`). Use a file path when tests need a migrated schema. If your app has its own `config/database.php` copy, check that its `sqlite.primary` closure passes `:memory:` through unchanged (see [Configuration](/advanced/configuration#databasephp-shape)).

Run your migrations against that database before the suite. Real environment variables win over `.env`, so you can target the test file directly:

```bash
DB_DRIVER=sqlite DB_SQLITE_DATABASE=storage/database/testing.sqlite php glueful migrate:run
```

Or create the tables a test needs in `setUp()`.

### Isolating tests

`Connection` has no `beginTransaction()` / `rollback()`. Its transaction API is `transaction(callable)`, which commits on return and rolls back on an exception, plus `afterCommit()` and `withinTransaction()`. A per-test "wrap and roll back" therefore doesn't map onto it. Instead:

- Delete the rows you created in `tearDown()`, or use unique values per test.
- Or recreate the SQLite file between suites.

To assert rollback behaviour, throw inside `transaction()`:

```php
$db = $this->get(Connection::class);

try {
    $db->transaction(function () use ($db) {
        $db->table('orders')->insert(['reference' => 'A-1']);
        throw new \RuntimeException('boom');
    });
} catch (\RuntimeException) {
}

$this->assertSame(0, $db->table('orders')->where('reference', 'A-1')->count());
```

## Testing Jobs

Jobs extend `Glueful\Queue\Job`: the constructor takes `(array $data = [], ?ApplicationContext $context = null)` and `handle()` returns `void`. Inside the job, data is `$this->getData()` and the context is `$this->context`.

```php
public function test_welcome_email_job_runs(): void
{
    $job = new \App\Jobs\SendWelcomeEmailJob(
        ['user_uuid' => 'u-123'],
        $this->app()->getContext()
    );

    $job->handle();

    // Assert side effects: a mailer test double, a row written, a log entry...
}
```

## Testing Events

```php
public function test_order_shipped_listener_runs(): void
{
    $this->get(\Glueful\Events\EventService::class)
        ->dispatch(new \App\Events\OrderShippedEvent('order-1'));

    // Assert side effects triggered by your listener(s)
}
```

## Test-State Gotchas

- **Don't combine `Framework::boot()` with `#[RunInSeparateProcess]`.** Booting in a PHPUnit child process breaks the child's result serialization ("child process ended unexpectedly").
- **Routes load once per process.** See the `RouteManifest::reset()` note under Feature Tests. Separately, **`ServiceProvider::loadRoutesFrom()` loads each file once per process**: a second boot in the same process won't re-register an extension's routes from that file unless you call `\Glueful\Extensions\ServiceProvider::resetLoadedRoutes()` first. Alternatively, `require` the route file into a fresh `Router` directly.
- **`SoftDeleteHandler` caches "does this table have `deleted_at`?" per `Connection` instance and table, for the process.** If two tests reuse one `Connection` and the second rebuilds `users` without `deleted_at`, its queries still add `WHERE deleted_at IS NULL` against a missing column. Give each test schema its own `Connection`, or keep hand-built test schemas identical to the real migrations.
- Run the suite with `--order-by=random` occasionally to catch order-dependent state.

## Mocking

### Mock Dependencies

```php
public function test_sends_notification()
{
    $mockMailer = $this->createMock(MailerInterface::class);
    $mockMailer->expects($this->once())
        ->method('send')
        ->with($this->equalTo('john@example.com'));

    $service = new NotificationService($mockMailer);
    $service->sendWelcome('john@example.com');
}
```

### Mock External APIs

```php
public function test_fetches_weather()
{
    $mockClient = $this->createMock(HttpClientInterface::class);
    $mockClient->method('get')
        ->willReturn(['temp' => 72, 'condition' => 'sunny']);

    $weather = new WeatherService($mockClient);
    $result = $weather->getWeather('London');

    $this->assertEquals(72, $result['temp']);
}
```

## Assertions

### Common Assertions

```php
// Equality
$this->assertEquals($expected, $actual);
$this->assertNotEquals($expected, $actual);

// Identity
$this->assertSame($expected, $actual);
$this->assertNotSame($expected, $actual);

// Truthiness
$this->assertTrue($value);
$this->assertFalse($value);
$this->assertNull($value);
$this->assertNotNull($value);

// Arrays
$this->assertCount(3, $array);
$this->assertContains('value', $array);
$this->assertArrayHasKey('key', $array);

// Strings
$this->assertStringContainsString('needle', $haystack);
$this->assertStringStartsWith('prefix', $string);
$this->assertStringEndsWith('suffix', $string);

// Exceptions
$this->expectException(\Exception::class);
$this->expectExceptionMessage('Error message');
```

### Custom Assertions

```php
protected function assertValidUser(array $user): void
{
    $this->assertNotEmpty($user['uuid'] ?? null);
    $this->assertNotFalse(filter_var($user['email'] ?? '', FILTER_VALIDATE_EMAIL));
}
```

## Data Providers

PHPUnit 10 uses attributes; data provider methods must be `public static`:

```php
use PHPUnit\Framework\Attributes\DataProvider;

#[DataProvider('validEmails')]
public function test_accepts_valid_email(string $email): void
{
    $this->assertNotFalse(filter_var($email, FILTER_VALIDATE_EMAIL));
}

public static function validEmails(): array
{
    return [
        ['john@example.com'],
        ['jane.doe@example.co.uk'],
        ['test+tag@domain.com'],
    ];
}
```

## Test Organization

### Group Tests

```php
use PHPUnit\Framework\Attributes\Group;

#[Group('slow')]
public function test_complex_calculation(): void
{
    // Slow test
}
```

Run specific group:

```bash
vendor/bin/phpunit --group slow
vendor/bin/phpunit --exclude-group slow
```

### Test Suites

`phpunit.xml`:

```xml
<testsuites>
    <testsuite name="Unit">
        <directory>tests/Unit</directory>
    </testsuite>
    <testsuite name="Feature">
        <directory>tests/Feature</directory>
    </testsuite>
</testsuites>
```

Run specific suite:

```bash
vendor/bin/phpunit --testsuite Unit
vendor/bin/phpunit --testsuite Feature
```

## Best Practices

### AAA Pattern

```php
public function test_creates_post()
{
    // Arrange
    $data = ['title' => 'Test Post', 'content' => 'Content'];

    // Act
    $post = $this->service->create($data);

    // Assert
    $this->assertSame('Test Post', $post['title']);
}
```

### One Assertion Per Test

```php
// ✅ Good
public function test_post_has_title()
{
    $post = $this->createPost();
    $this->assertEquals('Test', $post->title);
}

public function test_post_has_content()
{
    $post = $this->createPost();
    $this->assertNotEmpty($post->content);
}

// ❌ Bad - multiple concerns
public function test_post()
{
    $post = $this->createPost();
    $this->assertEquals('Test', $post->title);
    $this->assertNotEmpty($post->content);
    $this->assertNotNull($post->uuid);
}
```

### Descriptive Test Names

```php
// ✅ Good
public function test_user_cannot_delete_other_users_posts()

// ❌ Bad
public function test_delete()
```

## Continuous Integration

### GitHub Actions

`.github/workflows/tests.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'
          extensions: mbstring, pdo_sqlite, sodium

      - name: Install dependencies
        run: composer install

      - name: Run tests
        run: vendor/bin/phpunit
```

## Next Steps

- [Configuration](/advanced/configuration) - Environment setup
- [Middleware](/advanced/middleware) - Test middleware
- [Performance](/advanced/performance) - Performance testing
