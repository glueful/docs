---
title: Testing
description: Write tests for your Glueful application
---

Write comprehensive tests to ensure your application works correctly.

## Quick Start

Glueful uses PHPUnit for testing. The framework includes a lightweight base test case (Glueful\Testing\TestCase) you can extend when you want an application instance + container, but plain PHPUnit\Framework\TestCase works for focused unit tests.

```bash
# Run all tests
vendor/bin/phpunit

# Run specific test
vendor/bin/phpunit --filter UserTest

# Run with coverage
vendor/bin/phpunit --coverage-html build/coverage
```

## Test Structure

```
tests/
├── Unit/           # Unit tests
├── Integration/    # Integration tests
├── Feature/        # Feature tests
└── bootstrap.php   # Test bootstrap
```

## Testing Helpers

- `app()` and `service()` resolve services from the DI container in tests.
- `container()` returns the PSR‑11 container (useful for constructing Router).
- Extend `Glueful\Testing\TestCase` to bootstrap a minimal application per test class.

Example using the base test case:

```php
use Glueful\Testing\TestCase;

final class UsersRepositoryTest extends TestCase
{
    private \Glueful\Repository\RepositoryFactory $repoFactory;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repoFactory = app(\Glueful\Repository\RepositoryFactory::class);
        // Optional: start transaction
        app('database')->getPDO()->beginTransaction();
    }

    protected function tearDown(): void
    {
        // Optional: rollback
        app('database')->getPDO()->rollBack();
        parent::tearDown();
    }

    public function test_lists_active_users(): void
    {
        $users = $this->repoFactory->users();
        $list = $users->findWhere(['status' => 'active']);
        $this->assertIsArray($list);
    }
}
```

## Unit Tests

Test individual classes in isolation:

```php
namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Services\CalculatorService;

class CalculatorServiceTest extends TestCase
{
    public function test_adds_numbers()
    {
        $calculator = new CalculatorService();

        $result = $calculator->add(2, 3);

        $this->assertEquals(5, $result);
    }

    public function test_divides_numbers()
    {
        $calculator = new CalculatorService();

        $result = $calculator->divide(10, 2);

        $this->assertEquals(5, $result);
    }

    public function test_division_by_zero_throws_exception()
    {
        $this->expectException(\DivisionByZeroError::class);

        $calculator = new CalculatorService();
        $calculator->divide(10, 0);
    }
}
```

## Integration Tests

Test multiple components working together:

```php
namespace Tests\Integration;

use PHPUnit\Framework\TestCase;

class UserRepositoryTest extends TestCase
{
    private \Glueful\Database\Connection $db;
    private \App\Repositories\UserRepository $userRepo;

    protected function setUp(): void
    {
        // Setup test database
        $this->db = app('database');
        $this->userRepo = new UserRepository($this->db);

        // Start transaction
        $this->db->getPDO()->beginTransaction();
    }

    protected function tearDown(): void
    {
        // Rollback after each test
        $this->db->getPDO()->rollBack();
    }

    public function test_creates_user()
    {
        $userData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => password_hash('secret', PASSWORD_DEFAULT)
        ];

        $uuid = $this->userRepo->create($userData);
        $user = $this->userRepo->find($uuid); // repositories return arrays

        $this->assertNotNull($user);
        $this->assertEquals('John Doe', $user['name']);
        $this->assertEquals('john@example.com', $user['email']);
    }

    public function test_finds_user_by_email()
    {
        // Create user
        $this->userRepo->create([
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => password_hash('secret', PASSWORD_DEFAULT)
        ]);

        // Find by email
        $user = $this->userRepo->findByEmail('jane@example.com');

        $this->assertNotNull($user);
        $this->assertEquals('Jane Doe', $user['name']);
    }
}
```

## Feature Tests

Test routes end‑to‑end using the Router and Symfony Request/Response:

```php
namespace Tests\Feature;

use PHPUnit\Framework\TestCase;
use Glueful\Routing\Router;
use Symfony\Component\HttpFoundation\Request;

final class AuthenticationTest extends TestCase
{
    public function test_user_can_register(): void
    {
        $router = new Router(container()); // or construct with a minimal PSR‑11 container
        // register routes here or load your app routes

        $request = Request::create('/auth/register', 'POST', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123'
        ]);

        $response = $router->dispatch($request);
        $this->assertEquals(201, $response->getStatusCode());
        $body = json_decode((string) $response->getContent(), true);
        $this->assertTrue($body['success'] ?? false);
        $this->assertArrayHasKey('data', $body);
    }
}
```

### HTTP JSON Assertions

```php
use Glueful\Routing\Router;
use Symfony\Component\HttpFoundation\Request;

public function test_returns_json_payload(): void
{
    $router = new Router(container());

    // Minimal route for test
    $router->get('/ping', fn() => \Glueful\Http\Response::success(['pong' => true]));

    $response = $router->dispatch(Request::create('/ping', 'GET'));

    $this->assertEquals(200, $response->getStatusCode());

    $data = json_decode((string) $response->getContent(), true);
    $this->assertTrue($data['success'] ?? false);
    $this->assertTrue(($data['data']['pong'] ?? false));
}
```

## Testing Database

### Use Transactions

```php
protected function setUp(): void
{
    $this->db->beginTransaction();
}

protected function tearDown(): void
{
    $this->db->rollback();
}
```

### Use In-Memory SQLite

`phpunit.xml`:

```xml
<php>
    <env name="APP_ENV" value="testing"/>
    <env name="CACHE_DRIVER" value="array"/>
    <env name="DB_CONNECTION" value="sqlite"/>
    <env name="DB_DATABASE" value=":memory:"/>
</php>
```

## Testing Jobs

```php
public function test_send_welcome_email_job(): void
{
    // Jobs accept array data in Glueful
    $job = new \App\Jobs\SendWelcomeEmailJob(['userId' => 123]);

    // Execute synchronously (unit level)
    $job->handle();

    // Assert side effects (e.g., check a mailer mock, outbox, or log)
    $this->assertTrue(true);
}
```

## Testing Events

```php
public function test_user_registered_event_is_dispatched(): void
{
    // Dispatch a framework event directly
    \Glueful\Events\Event::dispatch(new \App\Events\UserRegisteredEvent($userData));

    // Assert side effects triggered by your listener(s)
    $this->assertTrue(true);
}
```

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
protected function assertValidUser($user)
{
    $this->assertNotNull($user->uuid);
    $this->assertNotEmpty($user->name);
    $this->assertMatchesRegularExpression('/^[\w\.-]+@[\w\.-]+\.\w+$/', $user->email);
}
```

## Data Providers

Test multiple scenarios:

```php
/**
 * @dataProvider validEmailProvider
 */
public function test_validates_email($email)
{
    $validator = new EmailValidator();

    $this->assertTrue($validator->isValid($email));
}

public function validEmailProvider()
{
    return [
        ['john@example.com'],
        ['jane.doe@example.co.uk'],
        ['test+tag@domain.com'],
    ];
}

/**
 * @dataProvider invalidEmailProvider
 */
public function test_rejects_invalid_email($email)
{
    $validator = new EmailValidator();

    $this->assertFalse($validator->isValid($email));
}

public function invalidEmailProvider()
{
    return [
        ['invalid'],
        ['@example.com'],
        ['user@'],
    ];
}
```

## Test Organization

### Group Tests

```php
/**
 * @group slow
 */
public function test_complex_calculation()
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
    $post = $this->postRepo->create($data);

    // Assert
    $this->assertEquals('Test Post', $post->title);
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
      - uses: actions/checkout@v3

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          extensions: mbstring, pdo_sqlite

      - name: Install dependencies
        run: composer install

      - name: Run tests
        run: vendor/bin/phpunit
```

## Next Steps

- [Configuration](/advanced/configuration) - Environment setup
- [Middleware](/advanced/middleware) - Test middleware
- [Performance](/advanced/performance) - Performance testing
