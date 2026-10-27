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
  - `Glueful\Routing\Middleware\FieldSelectionMiddleware` (alias `field_selection`) — request parsing + response projection
- Guards: strict mode, max depth, max fields, max items
- Whitelists: allowed fields or named whitelist keys
- Metrics + tooling: parsing and projection metrics with `fields:*` console commands

## Request Syntax

REST‑style, with optional expansion, aliases and simple transformations:

```
GET /users?fields=id,name:full_name,email,title:uppercase&expand=posts.title,posts.comments.text
```

GraphQL‑style nesting in a single parameter:

```
GET /users?fields=id,name,posts(id,title,comments(text))
```

Notes:
- Use `expand=relation1,relation2` (dot paths for nesting) with REST syntax to request nested relations.
- `*` selects everything, or the whitelist when one applies: `?fields=*&expand=posts`.
- If `fields` contains a `(`, the whole value is parsed as GraphQL‑style. That is why parameterized transformations can't be used in `fields` (see below).

### Transformations and aliases (REST syntax)

| Directive | Example | Result |
|-----------|---------|--------|
| Alias | `name:full_name` | Output key `full_name` |
| `uppercase` / `lowercase` | `title:uppercase` | Upper/lower‑cased string |
| `format(fmt)` | `created_at:format(Y-m-d)` | Date formatted with PHP `date()` codes |
| `currency(CODE)` | `price:currency(USD)` | `number_format(value, 2) . ' USD'` |
| `truncate(n)` | `body:truncate(100)` | First `n` chars + `...` |
| Condition | `email:if(authenticated)` | Included only when the condition holds: `authenticated` (a `user` is on the request), `admin` (`user.role` is `admin`), `public` (row's `is_public` is `true`). Unknown conditions always pass |

Because a `(` in `fields` switches to the GraphQL parser, which doesn't read `:` directives, only `uppercase`, `lowercase` and aliases work from the query string. `format()`, `currency()`, `truncate()` and `if()` take effect when you build the tree with the REST parser yourself, or via a custom transformation. There is no `date()` transformation; use `format()`.

Register your own transformations or computed fields on the `Projector`:

```php
$projector->registerTransformation('slug', fn (mixed $value, array $params) => strtolower(str_replace(' ', '-', (string) $value)));
$projector->registerComputedField('post_count', fn (array $context, $node, array $row) => count($row['posts'] ?? []));
// request computed fields with @: ?fields=id,@post_count
```

## Quick Start (Middleware)

Attach the `field_selection` middleware to routes that return JSON, or give the route field options (`#[Fields]` or `->setFieldsConfig()`), which attaches it for you:

```php
// routes/api.php
$router->get('/users', [UserController::class, 'index'])
    ->middleware(['field_selection']);

// Same, with route options; field_selection is attached automatically
$router->get('/users/{id}', [UserController::class, 'show'])
    ->setFieldsConfig(['allowed' => ['id', 'name', 'email'], 'strict' => true]);
```

The middleware:
- Does nothing when neither `fields` nor `expand` is present
- Parses `fields`/`expand` into a `FieldSelector` and stores it at `$request->attributes->get(FieldSelector::class)`
- Projects `application/json` responses using `Projector`
- Returns `400` with `{"error": {"code", "message", "meta"}}` when the selection is invalid
- Adds an `X-Fields-Tree` header with a preview of the parsed tree when the request has `?fields_debug=1`

## Route Options with `#[Fields]`

On attribute-routed methods, `#[Fields]` sets per-route options and attaches the `field_selection` middleware (once; listing it yourself is not duplicated). A bare `#[Fields]` turns projection on with the `api.field_selection` defaults:

```php
use Glueful\Routing\Attributes\{Fields, Get, Middleware};
use Glueful\Support\FieldSelection\FieldSelector;

#[Get('/users/{id}')]
#[Middleware(['auth'])]
#[Fields(allowed: ['id', 'name', 'email', 'posts', 'posts.comments'], strict: true, maxDepth: 3)]
public function show(string $id, FieldSelector $selector): array
{
    $user = $this->users->findAsArray($id);

    if ($selector->requested('posts')) {
        $user['posts'] = $this->users->findPostsForUser($id);
    }

    return $user; // the middleware projects the response
}
```

`#[Fields]` options: `strict`, `allowed`, `whitelistKey`, `maxDepth`, `maxFields`, `maxItems`, `useAdvancedPatterns`. For fluent routes, use `->setFieldsConfig([...])` with the same keys. A strict whitelist violation returns `400`.

::u-alert{color="info" variant="subtle" icon="i-lucide-info"}
**Since 1.91.** Earlier versions stored `#[Fields]` config without attaching the middleware, so responses weren't projected unless `field_selection` was listed by hand, and route-cached routes lost their fields config. `#[Fields]` routes now project by `?fields=` / `?expand=` and can return `400` in strict mode. Run `php glueful route:cache:clear` on deploy.
::

### Advanced patterns on a route

With `useAdvancedPatterns: true`, the `allowed` entries are treated as whitelist patterns instead of literal field names:

```php
#[Get('/users/{id}')]
#[Fields(
    allowed: ['*', 'posts.*', '-password', 'email:if(owner)'],
    useAdvancedPatterns: true,
    strict: true,
)]
public function show(string $id): array { /* ... */ }
```

| Pattern | Meaning |
|---------|---------|
| `*`, `posts.*` | Wildcards over field paths |
| `-password` | Exclusion; never selectable |
| `field:if(cond)` | Selectable only when the condition holds: `owner` (`user.id` equals the record's `user_id`/`owner_id`), `authenticated`, `admin` (`user.role`), `public` (`is_public === true`), `premium` (`user.subscription`). Unknown conditions pass |

A comma-joined entry such as `'*,-password'` is split into separate patterns. Conditions are evaluated against the request's `user` attribute and, for single-record responses, the record itself (on list responses record conditions such as `owner` see no data). In strict mode, a requested top-level field the patterns reject is a `400`.

## Using In Controllers

Type-hint `FieldSelector` or `Projector` on a handler and the router injects them. `FieldSelector` comes from the middleware when it ran, otherwise from `FieldSelector::fromRequest($request)`:

```php
use Glueful\Controllers\BaseController;
use Glueful\Http\Response;
use Glueful\Support\FieldSelection\{FieldSelector, Projector};

class UserController extends BaseController
{
    public function index(FieldSelector $selector, Projector $projector)
    {
        // Build your data (array, object with toArray(), or list<array>)
        $users = $this->users->listUsers();

        // Optionally apply a whitelist for public projections
        $allowed = ['id', 'name', 'email', 'posts'];

        return Response::success($projector->project($users, $selector, $allowed));
    }
}
```

Helpers:
- `FieldSelector::fromRequest($request, strict: false, maxDepth: 6, maxFields: 200, maxItems: 1000, whitelist: null)`
- `FieldSelector::fromRequestAdvanced($request, whitelist: [...], context: [...], data: [...], strict: false, ...)`
- `$selector->empty()` to detect when no selection was requested
- `$selector->requested('posts.comments.text')` to test presence

## Whitelists and Strict Mode

- Whitelist: limit selectable fields. When `'*'` is requested, it expands to the whitelist.
- Strict mode: reject unknown fields not present in the whitelist.

```php
$allowed = ['id', 'name', 'email', 'posts'];
$selector = FieldSelector::fromRequest($request, strict: true);
$projected = $projector->project($user, $selector, $allowed);
```

Named whitelists live in `config/api.php` under `field_selection.whitelists` and are referenced by key (`whitelistKey: 'user'` on `#[Fields]`, or the fourth argument of `project()`).

Advanced, context‑aware patterns (role‑based, nested paths):

```php
$selector = FieldSelector::fromRequestAdvanced(
    request: $request,
    whitelist: ['*', 'posts.*', 'email:if(authenticated)', '-password'],
    context: ['user' => $request->attributes->get('user')],
    data: $user,
    strict: true,
);
```

## Relation Expanders (Avoid N+1)

Register expanders on `Projector` to load relations that aren't already in the row. The projector calls the expander once per row as `($context, $node, [$row])` and uses the return value as that row's field, so batch the lookup with the IDs the middleware collects:

```php
// In a service provider's boot() or a controller constructor
$projector->register('posts', function (array $context, $node, array $rows) {
    // For list responses the middleware fills $context['collection_ids']
    $userIds = $context['collection_ids']['item_ids'] ?? [];
    $postsByUser = $this->posts->findByUserIds($userIds); // memoize this across calls

    return $postsByUser[$rows[0]['id']] ?? [];
});
```

The projector records N+1 risk detections and projection metrics via `FieldSelectionMetrics`.

## Configuration

`config/api.php`:

```php
'field_selection' => [
    'enabled'    => true,
    'strict'     => false,
    'maxDepth'   => 6,
    'maxFields'  => 200,
    'maxItems'   => 1000,

    // Named whitelists, referenced by whitelistKey
    'whitelists' => [
        // 'user' => ['id', 'name', 'email', 'posts', 'comments', 'profile'],
    ],
],
```

`strict`/`maxDepth`/`maxFields`/`maxItems` are the middleware defaults; route options override them. `whitelists` is loaded into the container's `Projector`. Field selection runs wherever `field_selection` is attached, explicitly or through `#[Fields]` / `setFieldsConfig()`. `enabled => false` switches it off everywhere: the middleware passes responses through unprojected and ignores `?fields=` / `?expand=` (so strict-mode `400`s don't fire either).

::u-alert{color="info" variant="subtle" icon="i-lucide-info"}
**Since 1.91**, `enabled => false` is honoured. Before, the key was never read and field selection always ran. Check app configs that set it.
::

## Error Handling

`InvalidFieldSelectionException` is raised for:
- Depth exceeded (tune `maxDepth`)
- Too many fields (tune `maxFields`)
- Unknown fields in strict mode (fix request or whitelist)

The middleware converts it into a `400` JSON response whose `error.code` names the reason.

## Tooling & Metrics

```bash
php glueful fields:analyze            # field-selection usage across routes (incl. #[Fields] routes)
php glueful fields:validate           # validate route field configurations
php glueful fields:performance        # projection performance analysis
php glueful fields:whitelist-check    # whitelist compliance
```

`fields:analyze` and `fields:validate` count a route as using field selection when it lists `field_selection` or carries fields config (`Route::hasFieldSelection()`).

`FieldSelectionMetrics::getInstance()->getSummary()` returns runtime stats.

## See Also

- **[Routing Recipes](/cookbook/routing)** — `/data/{table}` routes use `field_selection`
- **[Middleware](/cookbook/middleware)**
- **[CLI Reference: Field Selection](/cli-reference#field-selection)**
