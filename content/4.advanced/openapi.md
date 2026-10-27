---
title: OpenAPI Generation
description: Generate an OpenAPI 3.1 spec from your live routes and PHP types, add the gaps with a few attributes, and serve it with an interactive reference UI.
---

Glueful builds its OpenAPI document **code-first**. The generator (`Glueful\Support\Documentation\RouteReflectionDocGenerator`, driven by `OpenApiGenerator`) reads the live route table and the PHP types on each handler. Paths, parameters, security, request bodies and success responses are all inferred. You annotate only what types can't express.

```bash
php glueful generate:openapi -f --ui
```

This writes `docs/openapi.json` and a reference UI at `docs/index.html`, both served by the app at `/api-docs`.

::u-alert{color="warning" variant="subtle" icon="i-tabler-alert-triangle"}
#description
Route docblocks are **not** read. `@route`, `@summary`, `@requestBody`, `@response` and similar tags have had no effect since 1.57, when the comment-parsing generator was removed. Use types and the attributes below instead.
::

## What Is Inferred

| Source | Becomes |
|--------|---------|
| Route path and method | Path item and operation; `{param}` segments become required path parameters, with any `->where()` constraint as `pattern` |
| Route name | `operationId` and `summary` (`posts.show` → "Posts Show"); unnamed routes use the method and path |
| First literal path segment after the API prefix (`api.versioning.prefix`, default `/api`), skipping `{params}` and `v1`-style version segments | Tag (override with `#[ApiOperation(tags: [...])]`) |
| `auth` / `api_key` middleware | `security` via `documentation.middleware_map`, plus `401` and `403` responses |
| `->rateLimit()` / `#[RateLimit]` | `429` response with `Retry-After` and `X-RateLimit-*` headers |
| `#[RequireScope]` | "Requires scope: …" in the description |
| `#[Fields]` | `fields` and `expand` query parameters, listing the allowed fields |
| `RequestData` parameter | JSON `requestBody` from the DTO, `path`/`query` parameters from `#[FromRoute]`/`#[FromQuery]`, and a `422` response |
| `#[Validate]` (no `RequestData` parameter) | Fallback JSON `requestBody` from the rule strings |
| `ResponseData`, `CollectionResponse`, `PaginatedResponse` return type | Success response schema, wrapped in the envelope, at the `#[ResponseStatus]` status |

Most routes need no annotation at all.

**Since 1.91:** under `/api/v1` the tag comes from the segment after the prefix (`/api/v1/users` → "Users"); earlier versions tagged every such route "Api". Regenerate SDKs and check `API_DOCS_INCLUDE_TAGS` / `API_DOCS_EXCLUDE_TAGS` lists that named "Api".

## Types Shape the Schema

The generator reflects the same classes the router uses at runtime (see [Typed Requests & Responses](/essentials/typed-io)), so the documented contract and the enforced contract can't drift apart.

```php
use App\DTOs\{CreatePostData, PostData};
use Glueful\Http\Responses\PaginatedResponse;
use Glueful\Routing\Attributes\ResponseStatus;

final class PostController extends BaseController
{
    /** @return PaginatedResponse<\App\DTOs\PostData> */
    public function index(ListPostsData $query): PaginatedResponse { /* ... */ }

    #[ResponseStatus(201)]
    public function store(CreatePostData $data): PostData { /* ... */ }
}
```

**Request bodies** (`POST`, `PUT`, `PATCH` only) come from the `RequestData` constructor:

- Property types give the structure: scalars, nullables, backed enums (as `enum`), nested DTOs and `DateTimeInterface` (`date-time`).
- `#[Rule]` strings add constraints: `required` → the `required` list, `email`/`uuid`/`url`/`date` → `format`, `in:` → `enum`, `min:`/`max:` → length or numeric bounds.
- `#[ArrayOf]` is the only source of an array's `items`. Docblock `@var` types are not read for request DTOs.
- `#[FromRoute]` and `#[FromQuery]` fields become parameters and are removed from the body schema. A `#[FromQuery]` field is required when its rule says `required` or it has no default.
- An example payload is derived from the rules.

**Responses** come from the return type:

- A `ResponseData` return type is reflected from its public properties and wrapped in `{success, message, data}`.
- `CollectionResponse` documents `data` as an array, and `PaginatedResponse` documents the flat pagination envelope (always `200`).
- The item type comes from the `@return CollectionResponse<Item>` / `@return PaginatedResponse<Item>` docblock. Write the class fully qualified, or keep it in the controller's namespace: imported or aliased short names aren't resolved and fall back to `{type: object}`.
- For `ResponseData` arrays, `#[ArrayOf]` on the property sets `items`. Otherwise a `@var Foo[]` docblock is used.
- A DTO with a custom `toArray()` is still documented from its public properties.

Returning a `JsonResource` or a plain array isn't reflectable. Document those handlers with `#[ApiResponse]`.

## Override Attributes

Four method attributes in `Glueful\Routing\Attributes` fill the gaps. Each is optional and only replaces what it sets.

### `#[ApiOperation]`

Prose, tags and identity:

```php
use Glueful\Routing\Attributes\ApiOperation;

#[ApiOperation(
    summary: 'Publish a post',
    description: 'Moves a draft to published and notifies subscribers.',
    tags: ['Posts'],
    operationId: 'publishPost',
    deprecated: false,
)]
public function publish(string $uuid): PostData { /* ... */ }
```

Empty fields keep the derived value. A hand-written description comes before the auto-generated scope text.

### `#[QueryParam]`

Documents a query parameter that isn't a `#[FromQuery]` DTO field. It is repeatable:

```php
use Glueful\Routing\Attributes\QueryParam;

#[QueryParam('days', type: 'integer', description: 'Lookback window', required: false)]
#[QueryParam('status', enum: ['active', 'archived'])]
#[QueryParam('since', format: 'date')]
public function stats(Request $request): Response { /* ... */ }
```

A `#[QueryParam]` with the same name as a generated parameter (for example `fields`) replaces it.

### `#[ApiRequestBody]`

For handlers that read the body manually, or accept a non-JSON body. Set exactly one of `schema` or `inlineSchema`:

```php
use Glueful\Routing\Attributes\ApiRequestBody;

// JSON body described by a DTO class (documentation only, no runtime hydration)
#[ApiRequestBody(schema: LoginData::class, description: 'Credentials')]
public function login(Request $request): Response { /* ... */ }

// Multipart upload: a raw schema, only for non-JSON content types
#[ApiRequestBody(
    contentType: 'multipart/form-data',
    inlineSchema: [
        'type' => 'object',
        'properties' => ['file' => ['type' => 'string', 'format' => 'binary']],
        'required' => ['file'],
    ],
)]
public function upload(Request $request): Response { /* ... */ }
```

Setting both, setting neither, or using `inlineSchema` with `application/json` throws `InvalidArgumentException`. When present, `#[ApiRequestBody]` overrides `RequestData` and `#[Validate]` inference.

### `#[ApiResponse]`

Documents a response by status. It is repeatable, and each attribute replaces the inferred or default entry for its status:

```php
use Glueful\Routing\Attributes\ApiResponse;

#[ApiResponse(200, PostData::class)]                                   // {success, message, data: PostData}
#[ApiResponse(200, PostData::class, collection: true)]                 // data: PostData[]
#[ApiResponse(201, PostData::class, envelope: false)]                  // raw object, no envelope
#[ApiResponse(404, description: 'Post not found')]                     // description only
#[ApiResponse(200, contentType: 'application/pdf', body: 'binary')]   // file download
#[ApiResponse(200, contentType: 'text/html', body: 'text')]           // HTML page
```

`body:` accepts `'binary'`, `'text'` or `'object'`, and is used only when `schema` is null.

### Precedence

| For | Winner (highest first) |
|-----|------------------------|
| Request body | `#[ApiRequestBody]` → `RequestData` parameter → `#[Validate]` |
| A response status | `#[ApiResponse]` → return-type inference → defaults (`200`, `401`/`403`, `429`, `422`) |
| Query parameters | `#[QueryParam]` → `#[FromQuery]` / `#[Fields]` parameters |
| Summary, tags, operationId | Non-empty `#[ApiOperation]` field → derived value |

## Generating the Spec

```bash
php glueful generate:openapi              # asks for confirmation
php glueful generate:openapi -f           # no prompt (use in CI and scripts)
php glueful generate:openapi -f --ui      # also write the reference UI (default: scalar)
php glueful generate:openapi -f --ui=redoc
```

| Option | Effect |
|--------|--------|
| `-f`, `--force` | Skip the confirmation prompt |
| `-u`, `--ui[=TYPE]` | Write the reference UI: `scalar`, `swagger-ui` or `redoc` (default from `API_DOCS_UI`) |
| `-c`, `--clean` | Delete the generated `routes/` and `extensions/` folders under `docs/json-definitions/` before generating; top-level hand-authored fragments are kept |

The spec is written to `documentation.paths.openapi` (`docs/openapi.json`) and the UI to `documentation.paths.output` + `documentation.ui.filename` (`docs/index.html`). When `documentation.enabled` is on (`API_DOCS_ENABLED`, default: on outside production), the app serves them at:

- `GET /api-docs`: the reference UI
- `GET /api-docs/openapi.json`: the spec

Change the mount point with `API_DOCS_PATH` (for example `API_DOCS_PATH=/docs`).

## Route Origin Filtering

Every route is classified by its handler's namespace:

| Origin | Handler namespace | Included when |
|--------|-------------------|---------------|
| App | `App\…`, or a closure | Always |
| Framework | `Glueful\…` | `API_DOCS_INCLUDE_FRAMEWORK_ROUTES=true` (default) |
| Extension | Anything else | `documentation.options.include_extensions` is `true` (default) |

To publish a spec of only your own API:

```env
API_DOCS_INCLUDE_FRAMEWORK_ROUTES=false
```

To trim by tag instead, use comma-separated allow/deny lists. Exclusions win:

```env
API_DOCS_EXCLUDE_TAGS=Health,Documentation
API_DOCS_INCLUDE_TAGS=
```

`API_DOCS_PRUNE_UNREFERENCED_SCHEMAS=true` drops built-in component schemas that no path references.

## Hand-Authored Fragments

For an endpoint the generator can't see, place a JSON fragment at the **top level** of `docs/json-definitions/`. Every `*.json` file there is merged on each run. The `routes/` and `extensions/` subdirectories are skipped, because they hold output from the removed comment generator.

```json
{
  "doc": {
    "name": "reports/export",
    "method": "POST",
    "is_public": false,
    "consumes": ["application/json"],
    "fields": [
      { "name": "from", "type": "date", "description": "Start date", "nullable": false },
      { "name": "format", "type": "string", "description": "csv or xlsx" }
    ],
    "response": { "type": "object", "properties": { "url": { "type": "string" } } }
  }
}
```

The fragment becomes `POST /reports/export` with a request schema built from `fields` (a field with `"nullable": false` is required) and, when `response` is given, a `200` response using that schema. Non-public fragments get the `auth` security scheme.

`--clean` removes only the generated `routes/` and `extensions/` folders, so top-level fragments survive it (since 1.91; earlier versions deleted every file under `docs/json-definitions/`).

## Configuration

Settings live in `config/documentation.php`:

| Key | Env | Default |
|-----|-----|---------|
| `enabled` | `API_DOCS_ENABLED` | on unless `APP_ENV=production` |
| `openapi_version` | `OPENAPI_VERSION` | `3.1.0` (also `3.0.0`, `3.0.3`) |
| `info.title` / `info.description` / `info.version` | `API_TITLE`, `API_DESCRIPTION`, `API_VERSION` | app name / generic / `1.0.0` |
| `servers.0.url` | `API_SERVER_URL` | `APP_URL` |
| `route_prefix` | `API_DOCS_PATH` | `/api-docs` |
| `security_schemes` | — | `BearerAuth` (JWT), `ApiKeyAuth` (`X-API-Key` header) |
| `middleware_map` | — | `auth` → `BearerAuth`, `api_key` → `ApiKeyAuth` |
| `errors.schema` | `API_DOCS_ERROR_SCHEMA` | `null` (inline `{success, message}`) |
| `errors.always` | — | `[]`: extra error statuses on every operation |
| `ui.default` | `API_DOCS_UI` | `scalar` |
| `options.include_resource_routes` | `API_DOCS_INCLUDE_RESOURCE_ROUTES` | `false` |
| `webhooks` | — | `[]`: events emitted into the OpenAPI `webhooks` object |

Map your own middleware to a scheme by adding to `middleware_map`, for example `'auth_session' => ['BearerAuth']`. Webhook entries (`'order.paid' => ['summary' => ..., 'payload_schema' => 'Order']`) document what [webhooks](/features/webhooks) send; the documented signature header is `api.webhooks.signature_header` (default `X-Webhook-Signature`).

## Generating Clients

`generate:client` builds the command for an off-the-shelf code generator: `openapi-typescript` for TypeScript, `openapi-generator-cli` for every other language. By default it only prints the command:

```bash
php glueful generate:client typescript --spec=docs/openapi.json -o ./sdk           # prints the command
php glueful generate:client python --spec=docs/openapi.json -o ./sdk/python --execute
```

| Option | Default |
|--------|---------|
| `language` (argument) | `typescript`/`ts`, or any `openapi-generator` target (`python`, `go`, `java`, …) |
| `--spec` | `openapi.json` (relative to the current directory) |
| `-o`, `--output` | `./generated`; TypeScript writes `api.d.ts` there |
| `--execute` | Run the command instead of printing it |

The generator tool must be installed separately.

## Next Steps

- [Typed Requests & Responses](/essentials/typed-io): the DTOs the generator reflects
- [Validation](/essentials/validation): rule strings that become schema constraints
- [Routing](/essentials/routing): route names, constraints and attributes
- [API Keys](/features/api-keys): the `ApiKeyAuth` scheme and `#[RequireScope]`
