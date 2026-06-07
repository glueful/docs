---
title: Field Selection
description: GraphQL‑style field selection and projection for REST APIs with whitelists, guards, and expanders.
---

Glueful provides GraphQL‑style field selection for REST responses. Clients request only the fields they need; controllers and middleware enforce limits, apply whitelists, and project responses efficiently to avoid over‑fetching and N+1 queries.

## Overview

- Request fields via query params (`fields` and optional `expand`)
- Two syntaxes supported: REST and GraphQL‑style
- Central runtime objects:
  - `Glueful\Support\FieldSelection\FieldSelector` — parsed selection + limits
  - `Glueful\Support\FieldSelection\Projector` — applies selection to data, with relation expanders
  - `Glueful\Routing\Middleware\FieldSelectionMiddleware` — request parsing + response projection
- Guards: strict mode, max depth, max fields, max items
- Whitelists: allowed fields or named whitelist keys
- Metrics + tooling: parsing and projection metrics with console commands

## Request Syntax

REST‑style with optional expansion and transformations:

```
GET /users?fields=id,name,email,posts(id,title:uppercase,created_at:date(Y-m-d))&expand=posts
```

GraphQL‑style nesting in a single parameter:

```
GET /users?fields=id,name,posts(id,title,created_at)
```

Notes:
- Use `expand=relation1,relation2` with REST syntax to request nested relations.
- Transformations are supported in REST syntax, e.g. `title:uppercase`, `created_at:date(Y-m-d)`, `price:currency(USD)`.

## Quick Start (Middleware)

Enable the field selection middleware on routes that return JSON:

```php
// routes/api.php
$router->get('/users', [UserController::class, 'index'])
    ->middleware(['field_selection']);
```

The middleware:
- Parses `fields`/`expand` into a `FieldSelector`
- Stores it at `$request->attributes->get(FieldSelector::class)`
- Projects JSON responses using `Projector`

## Using In Controllers

Inject or resolve `FieldSelector` and (optionally) use `Projector` directly:

```php
use Glueful\Controllers\BaseController;
use Glueful\Support\FieldSelection\{FieldSelector, Projector};
use Symfony\Component\HttpFoundation\Request;

class UserController extends BaseController
{
    public function __construct(private Projector $projector) {}

    public function index(Request $request)
    {
        // Build your data (array, object with toArray(), or list<array>)
        $users = $this->repo->listUsers();

        // Selector from request (fast path returns empty when no fields provided)
        $selector = FieldSelector::fromRequest($request);

        // Optionally apply a whitelist for public projections
        $allowed = ['id', 'name', 'email', 'posts'];

        $projected = $this->projector->project($users, $selector, $allowed);
        return \Glueful\\Http\\Response::success($projected);
    }
}
```

Helpers:
- `FieldSelector::fromRequest($request, strict:false, maxDepth:6, maxFields:200, maxItems:1000, whitelist:[]|null)`
- `FieldSelector::fromRequestAdvanced($request, whitelist:[...], context:[...], data:[...])`
- `$selector->empty()` to detect when no selection was requested
- `$selector->tree->requested('posts.comments.text')` to test presence

## Whitelists and Strict Mode

- Whitelist: limit selectable fields. When `'*'` is requested, it expands to the whitelist.
- Strict mode: reject unknown fields not present in the whitelist.

Examples:

```php
$allowed = ['id', 'name', 'email', 'posts'];
$selector = FieldSelector::fromRequest($request, strict: true);
$projected = $projector->project($user, $selector, $allowed);
```

Advanced, context‑aware patterns (role‑based, nested paths):

```php
$selector = FieldSelector::fromRequestAdvanced(
    request: $request,
    whitelist: ['*', 'posts.*', 'email:if(owner)', '-password'],
    context: ['user' => $request->attributes->get('user') ?? null],
    data: $user->toArray(),
    strict: true,
);
```

## Relation Expanders (Avoid N+1)

Register expanders on `Projector` to batch‑load relations based on the request context.

```php
// In a service provider or controller constructor
$projector->register('posts', function (array $context, $node, array $rows) {
    // $context['collection_ids'] is populated by middleware for list responses
    $userIds = $context['collection_ids']['item_ids'] ?? [];
    $postsByUser = $this->posts->findByUserIds($userIds, $node);
    // Return per‑row mapping or a collection based on $rows
    return array_map(fn($row) => $postsByUser[$row['id']] ?? [], $rows);
});
```

The projector records N+1 risk detections and projection metrics via `FieldSelectionMetrics`.

## Configuration

Middleware defaults (overridable per route via metadata/attributes):

```php
// config($context, 'api.field_selection') if using the config helper
[
  'strict'     => false,
  'maxDepth'   => 6,
  'maxFields'  => 200,
  'maxItems'   => 1000,
  'whitelistKey' => null,   // Named whitelist lookup in your app
  'allowed'      => null,   // Direct array whitelist override
]
```

Projector constructor defaults (DI):
- `whitelist: array<string,string[]> = []`
- `strictDefault: false`
- `maxDepthDefault: 6`
- `maxFieldsDefault: 200`
- `maxItemsDefault: 1000`

## Error Handling

Common validation errors thrown by `InvalidFieldSelectionException`:
- Depth exceeded (tune `maxDepth`)
- Too many fields (tune `maxFields`)
- Unknown fields in strict mode (fix request or whitelist)

Middleware converts these into proper JSON error responses.

## Tooling & Metrics

- `FieldSelectionMetrics::getInstance()->getSummary()` for runtime stats
- CLI commands (see Cookbook) for analysis, validation, and performance tests

## See Also

- **[Routing](/cookbook/routing#field-selection)**
- **[Middleware](/cookbook/middleware)**
- **[CLI Reference: Field Selection](/cli-reference#field-selection)**
