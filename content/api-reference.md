---
title: API Reference
description: Core API and helper functions reference
---

Quick reference for Glueful's core APIs and helper functions.

## Global Helpers

### app()
Get service from container

```php
$db = app('database'); // or app(DatabaseInterface::class)
$cache = app('cache'); // or app(CacheInterface::class)
```

### db()
Get database connection

```php
// Query builder entrypoint (uses from())
$users = db()->from('users')->where('status', 'active')->get();
```

### cache()
Get cache instance

```php
cache()->set('key', 'value', 3600);
$value = cache()->get('key');
```

### config()
Get configuration value

```php
$appName = config('app.name');
$dbHost = config('database.host');
```

### env()
Get environment variable

```php
$apiKey = env('API_KEY');
$debug = env('APP_DEBUG', false);
```

### logger()
Get logger instance

```php
logger()->info('Message', ['context' => 'value']);
logger()->error('Error occurred', ['error' => $e->getMessage()]);
```

## Database

### Query Builder

```php
// Basic select
db()->from('users')->get();
db()->from('users')->where('status', 'active')->get();

// Insert (returns boolean or result depending on implementation)
db()->from('users')->insert(['name' => 'John', 'email' => 'john@example.com']);

// Update
db()->from('users')->where('id', $id)->update(['name' => 'Jane']);

// Delete
db()->from('users')->where('id', $id)->delete();

// (Joins supported via dedicated join component – API name may differ; adjust if join() differs)
// Example (verify actual method name):
// db()->from('users')
//     ->join('orders', 'users.id', '=', 'orders.user_id')
//     ->select(['users.*', 'orders.total'])
//     ->get();

// Aggregates (if implemented)
// db()->from('orders')->count();
// db()->from('orders')->sum('total');
// db()->from('orders')->avg('total');
// db()->from('orders')->max('total');
// db()->from('orders')->min('total');
```

See [Database Guide](essentials/database) for full reference.

## Cache

```php
// Set
cache()->set('key', 'value', 3600);

// Get
$value = cache()->get('key');
$value = cache()->get('key', 'default');

// Remember pattern (pseudo if implemented)
$users = cache()->remember('users:active', function() {
    return db()->from('users')->where('status', 'active')->get();
}, 3600);

// Check existence
if (cache()->has('key')) { /* ... */ }

// Delete
cache()->delete('key');
// cache()->deletePattern('users:*'); // If pattern deletion supported

// Clear all
cache()->clear();
```

See [Caching Guide](features/caching) for full reference.

## Queue

```php
// Obtain queue manager (service id may differ)
$queue = app('queue'); // or app(QueueManager::class)

// Push job
$queue->push(new SendEmailJob($userId));
$queue->push(new ProcessImageJob($path), delay: 60);

// Push to specific queue
$queue->push(new SendEmailJob($userId), queue: 'emails');

// Bulk (if supported)
$queue->bulk([
    new Job1(),
    new Job2(),
]);
```

See [Queues & Jobs Guide](features/queues-jobs) for full reference.

## Events

```php
// Dispatch (using event dispatcher service)
app(Glueful\Events\EventDispatcher::class)->dispatch(new UserRegistered($user));

// Listener registration typically happens via service providers / attributes.
// Inline listening (if supported) would use dispatcher subscribe API.
```

See [Events Guide](features/events) for full reference.

## HTTP

### Request

```php
$request->getMethod();                // GET, POST, etc.
$request->getPathInfo();              // /api/users
$request->getUri();                   // Full URI
$request->get('name');                // Single input value
$request->request->all();             // POST body params
// Selecting specific fields:
$data = $request->request->all();
$subset = array_intersect_key($data, array_flip(['name','email']));
isset($data['name']);                 // Existence check
$request->files->get('avatar');       // Uploaded file
$request->headers->get('Authorization'); // Header
$request->getClientIp();              // Client IP
$request->headers->get('User-Agent'); // User agent
// Authenticated user (via auth manager)
$authUser = app(Glueful\Auth\AuthenticationManager::class)->user();
```

### Response

```php
// Success
Response::success($data);
Response::success($data, 201);

// Error
Response::error('Not found', 404);
Response::error('Validation failed', 422, ['errors' => $errors]);

// Headers
$response->headers->set('X-Custom', 'value');
```

See [Requests & Responses Guide](essentials/requests-responses) for full reference.

## Validation

```php
// Example pseudo-validation (depends on validator service binding)
$input = Glueful\Helpers\RequestHelper::getRequestData($request);
$validated = validator()->validate($input, [
    'name' => 'required|string|min:3|max:255',
    'email' => 'required|email|unique:users,email',
    'password' => 'required|min:8|confirmed',
    'age' => 'required|integer|min:18',
]);
```

### Available Rules

- `required` - Field must be present
- `nullable` - Field can be null
- `string` - Must be string
- `integer` - Must be integer
- `numeric` - Must be numeric
- `email` - Must be valid email
- `url` - Must be valid URL
- `min:n` - Minimum value/length
- `max:n` - Maximum value/length
- `between:min,max` - Between values
- `in:foo,bar` - Must be in list
- `unique:table,column` - Must be unique
- `exists:table,column` - Must exist
- `confirmed` - Must match `field_confirmation`
- `date` - Must be valid date
- `before:date` - Before date
- `after:date` - After date
- `alpha` - Only letters
- `alpha_num` - Letters and numbers
- `regex:pattern` - Match regex

See [Validation Guide](essentials/validation) for full reference.

## Authentication

```php
$auth = app(Glueful\Auth\AuthenticationManager::class);

// Login
$token = $auth->attempt(['email' => $email, 'password' => $password]);

// Get authenticated user
$user = $auth->user();

// Check authentication
if ($auth->check()) {
    // Authenticated
}

// Logout
$auth->logout();
```

See [Authentication Guide](essentials/authentication) for full reference.

## File Storage

```php
// Storage abstraction not currently exposed as 'Storage' facade in codebase scan.
// Placeholder examples (adjust to actual implementation once available):
// $storage = app(StorageManager::class);
// $path = $storage->put('avatars', $file);
// $contents = $storage->get($path);
// if ($storage->exists($path)) { /* ... */ }
// $storage->delete($path);
// $url = $storage->url($path);
```

See [File Uploads Guide](features/file-uploads) for full reference.

## Logging

```php
logger()->debug('Debug info', ['data' => $data]);
logger()->info('Info message', ['user_id' => $userId]);
logger()->warning('Warning', ['key' => $key]);
logger()->error('Error occurred', ['error' => $e->getMessage()]);
logger()->critical('Critical failure');
```

See [Logging Guide](deployment/logging) for full reference.

## Next Steps

- [CLI Reference](cli-reference) - Command-line tools
- [Essentials](essentials/) - Core concepts
- [Features](features/) - Framework features
- [Advanced](advanced/) - Advanced topics
