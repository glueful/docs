---
title: Core concepts
description: Core concepts you'll use every day
---

# Essentials

Learn the fundamental concepts you'll use in every Glueful application.

## Core Topics

### HTTP Layer
- [Routing](/essentials/routing) - Define URLs and route parameters
- [Controllers](/essentials/controllers) - Handle requests and return responses
- [Requests & Responses](/essentials/requests-responses) - Work with HTTP data
- [Validation](/essentials/validation) - Validate input data

### Data Layer
- [Database](/essentials/database) - Query builder and connections
- [Migrations](/essentials/migrations) - Database schema management
- [Authentication](/essentials/authentication) - JWT and user sessions

## Learning Path

**New to Glueful?** Follow this order:

1. **Routing** - Understand how URLs map to code
2. **Controllers** - Learn to structure your application logic
3. **Database** - Query and store data
4. **Validation** - Ensure data integrity
5. **Authentication** - Secure your endpoints

## Quick Reference

### Common Tasks

**Create a new endpoint:**
```php
// routes/api.php
$router->get('/users', [UserController::class, 'index']);
```

**Query the database:**
```php
$users = $this->getConnection()->table('users')->where(['active' => true])->get();
```

**Validate input:**
```php
use Glueful\Validation\Support\Rules as RuleFactory;
use Glueful\Validation\ValidationException;
use Glueful\Validation\Rules\{Sanitize, Required, Email as EmailRule, Length};
use Glueful\Helpers\RequestHelper;

$input = RequestHelper::getRequestData();

$v = RuleFactory::of([
    'email' => [new Sanitize(['trim']), new Required(), new EmailRule()],
    'name'  => [new Sanitize(['trim','strip_tags']), new Required(), new Length(2, 50)],
]);

if ($errors = $v->validate($input)) {
    throw new ValidationException($errors);
}

$data = $v->filtered();
```

**Return JSON:**
```php
return Response::success($data);
```

## Next Steps

After mastering the essentials, explore:
- [Features](/features) - Caching, queues, events, file uploads
- [Advanced](/advanced) - DI, middleware, testing
- [Examples](/cookbook) - Real-world implementations
