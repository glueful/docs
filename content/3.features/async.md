---
title: Async & Concurrency
description: Fiber-based concurrency with a per-request scheduler, ergonomic helpers, and a parallel HTTP client.
---

Glueful includes first-class async support powered by PHP Fibers. Opt into concurrency on a per-route basis with a lightweight middleware, spawn concurrent tasks with helpers, and perform parallel HTTP requests with the built-in client.

## Overview

- Fiber-based scheduler for cooperative concurrency
- Simple helpers: `async()`, `await()`, `await_all()`, `await_race()`, `async_sleep()`
- Route opt-in via middleware alias `async`
- Parallel HTTP client with retry/backoff (`CurlMultiHttpClient`)

## Quick Start

Enable async for a route:

```php
// routes/api.php
$router->get('/users', [UserController::class, 'index'])
    ->middleware(['async']);
```

Use helpers to run work in parallel:

```php
use Symfony\Component\HttpFoundation\Request;
use Glueful\Controllers\BaseController;
use Glueful\Http\Response;

class UserController extends BaseController
{
    public function index(Request $request)
    {
        $u = async(fn() => $this->fetchUsers());
        $s = async(fn() => $this->fetchStats());

        [$users, $stats] = await_all([$u, $s]);

        return Response::success(['users' => $users, 'stats' => $stats]);
    }
}
```

Alternatively, access the scheduler directly from the request:

```php
use Glueful\Async\Middleware\AsyncMiddleware;

$scheduler = $request->attributes->get(AsyncMiddleware::ATTR_SCHEDULER);
$tasks = [
    $scheduler->spawn(fn() => $this->fetchUsers()),
    $scheduler->spawn(fn() => $this->fetchStats()),
];
[$users, $stats] = $scheduler->all($tasks);
```

## Middleware: `async`

The alias `async` resolves to `Glueful\Async\Middleware\AsyncMiddleware` and injects a `FiberScheduler` into the request attributes at key `glueful.async.scheduler`.

- Provided by the DI container (AsyncProvider)
- Adds no I/O on its own; it just exposes the scheduler to your handler/middleware

## Helpers

- `scheduler(Request $request|null = null): Scheduler` — get the current scheduler (from request/DI, or new fallback)
- `async(callable $fn, CancellationToken|null $token = null, Request|null $req = null): Task` — spawn task
- `await(Task $task): mixed` — wait for task result (throws on failure)
- `await_all(array $tasks, Request|null $req = null): array` — wait for all, preserve keys
- `await_race(array $tasks, Request|null $req = null): mixed` — first-completer wins
- `async_sleep(float $seconds, CancellationToken|null $token = null, Request|null $req = null): void` — cooperative sleep
- `async_sleep_default(...): void` — sleep using configured poll interval
- `cancellation_token(): SimpleCancellationToken` — cooperative cancellation

Example with cancellation:

```php
$token = cancellation_token();
$task = async(fn() => $this->longJob($token), $token);

// cancel later
$token->cancel();

// will throw if the task honored cancellation
try {
    await($task);
} catch (\Throwable $e) {
    // handle cancellation or error
}
```

## Scheduler

The default scheduler is `Glueful\Async\FiberScheduler`. It supports:

- Task spawning, joining (all/race), cooperative sleeping
- Optional metrics via `Glueful\Async\Instrumentation\Metrics`
- Limits and safety knobs via config

Configuration keys (set via your config system):

- `async.scheduler.max_concurrent_tasks` — int, 0 means unlimited
- `async.scheduler.max_task_execution_seconds` — float, 0.0 means unlimited
- `async.scheduler.poll_interval_seconds` — float, default 0.01 for `async_sleep_default()`

## Parallel HTTP Client

Use the `Glueful\Async\Contracts\Http\HttpClient` (default `CurlMultiHttpClient`) for non-blocking, parallel HTTP requests. It integrates with the same metrics and scheduler-friendly patterns.

Configuration keys:

- `async.http.poll_interval_seconds` — float, default 0.01
- `async.http.max_retries` — int
- `async.http.retry_delay_seconds` — float
- `async.http.retry_on_status` — `array<int>` (e.g., `[429, 500, 502, 503, 504]`)
- `async.http.max_concurrent` — int, 0 means unlimited

Example:

```php
use Glueful\Async\Contracts\Http\HttpClient;
use Glueful\Controllers\BaseController;
use Glueful\Http\Response;

class ExternalController extends BaseController
{
    public function __construct(private HttpClient $http) {}

    public function show()
    {
        $a = async(fn() => $this->http->get('https://api.example.com/a'));
        $b = async(fn() => $this->http->get('https://api.example.com/b'));

        [$ra, $rb] = await_all([$a, $b]);
        return Response::success(['a' => $ra->json(), 'b' => $rb->json()]);
    }
}
```

## Testing

- The middleware accepts an injected `Scheduler` for tests.
- Helpers fall back to a fresh `FiberScheduler` when no request/container is present (e.g., in unit tests).

## See Also

- Cookbook:- **[Async Concurrency Recipes](/cookbook/async-concurrency)**
