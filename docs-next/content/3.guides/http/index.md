---
title: HTTP
description: Build APIs using the router, middleware pipeline, request handling, validation, OpenAPI docs, CORS/CSRF, and rate limiting
navigation:
  icon: i-lucide-globe
---

# HTTP

Glueful's HTTP stack focuses on fast O(1) static route lookups, intelligent dynamic bucketing, an ordered middleware pipeline, attribute-based routing, field selection, and consistent JSON response shaping.

Use these guides when you need to expose endpoints, apply cross‑cutting policies (auth, rate limiting, logging), or document behavior via OpenAPI‑style annotations.

## Request Lifecycle (High Level)

```
Client → Router match → Middleware pipeline → Controller/Handler → Response builders → Termination hooks
```

Key phases:

1. Routing: Fast static/param route resolution with grouping & naming
2. Middleware: Ordered interception (auth, rate limiting, logging, shaping)
3. Input Handling: Request object, DTO hydration, validation
4. Domain Execution: Controller / action / invokable service
5. Output: Response factories (JSON, stream, file, error)
6. Post Response: Termination events, queue dispatch, metrics

## Core Topics

| Topic | What You Learn | When to Read |
|-------|----------------|--------------|
| [Routing](/guides/http/routing) | Defining routes, grouping, naming, versioning | Starting any API surface |
| [Middleware](/guides/http/middleware) | Composition, ordering, short‑circuiting patterns | Adding auth, logging, shaping |
| [Requests & Responses](/guides/http/requests-and-responses) | Accessing input, headers, JSON, streaming responses | Handling real traffic |
| [Validation & DTOs](/guides/http/validation-and-dtos) | Declarative validation & safe data objects | Before touching business logic |
| [API Docs (OpenAPI)](/guides/http/api-docs-openapi) | Generating & serving OpenAPI specs | When sharing or integrating |
| [CORS & CSRF](/guides/http/cors-and-csrf) | Browser trust boundaries & protections | Frontend or browser clients |
| [Rate Limiting](/guides/http/rate-limiting) | Throttling, burst handling, idempotency | Protecting resources |

## Quick Starts

### Minimal Route (Route File Context)
In route files (e.g. `routes/api.php`) a `$router` variable is injected.
```php
/** @var \Glueful\Routing\Router $router */
use Glueful\Http\Response;

$router->get('/health', function () {
  return new Response(['status' => 'healthy', 'timestamp' => date('c')]);
});
```

### Parameter & DI Example
```php
use Psr\Log\LoggerInterface;
use Glueful\Http\Response;

$router->get('/users/{id}', function (int $id, LoggerInterface $logger) {
  $logger->info('Fetching user', ['id' => $id]);
  // ... fetch user ...
  return new Response(['user_id' => $id]);
});
```

### Group with Prefix & Middleware
```php
$router->group(['prefix' => '/api/v1', 'middleware' => ['auth', 'rate_limit:60,60']], function (\Glueful\Routing\Router $router) {
  $router->get('/profile', [ProfileController::class, 'show']);
  $router->put('/profile', [ProfileController::class, 'update']);
});
```

### Controller Response Helper
Controller methods can return `Glueful\Http\Response` or use helper methods inherited from base controllers.
```php
class WelcomeController extends BaseController {
  public function index(Request $request): Response {
    return $this->success([
      'message' => 'Welcome to your Glueful API!',
      'version' => config('app.version', '1.0.0'),
      'timestamp' => date('c'),
    ]);
  }
}
```

### Middleware With Parameters
```php
$router->get('/dashboard', [DashboardController::class, 'index'])
  ->middleware('rate_limit:60,60');
```

### Typical Validation Pattern
DTO validation is covered in depth later; a simplified pattern:
```php
// Pseudo example – actual validation helpers reside in Validation guide
class CreateTaskController extends BaseController {
  public function __invoke(Request $request): Response {
    $data = validator()->validate($request->request->all(), [
      'title' => 'required|string|max:120',
      'due_date' => 'nullable|date',
    ]);
    // $data now sanitized
    return $this->success(['created' => true, 'data' => $data], 201);
  }
}
```

### Standard Error Shape
Glueful surfaces structured JSON error responses (example validation failure):
```json
{
  "success": false,
  "message": "Validation failed.",
  "data": {
  "errors": { "title": ["The title field is required."] }
  }
}
```

## Patterns & Best Practices

- Keep middleware atomic: one concern per unit.
- Normalize early: convert raw request input to validated arrays or DTOs before business logic.
- Prefer explicit route names for URL generation & version negotiation.
- Document evolving endpoints via OpenAPI incremental generation.
- Apply rate limiting closest to the edge to reduce downstream load.
- Use streaming responses for large exports to minimize memory footprint.

## Performance Notes

- Warm critical route caches in deployment steps.
- Avoid N+1 logging or metrics calls inside middleware chains—batch where possible.
- Short‑circuit unauthorized/invalid requests early to save CPU.
- Cache parsed/validated payloads; avoid re‑parsing raw input in deep layers.

## Security Considerations

- Validate content type and size before parsing bodies.
- Sanitize or reject unexpected headers (especially for signed requests).
- Enforce consistent error shape (success/message/data) to avoid leakage.
- Pair idempotency keys with rate limiting for mutation endpoints.

## Related

- Concepts: Service Container, Request Lifecycle, Error Handling
- Reference: Router API, Middleware API, Validation Rules, Response Helpers
- Recipes: Versioning routes, Conditional middleware, Streaming large downloads

## Next Steps

Begin with [Routing](/guides/http/routing) or jump directly to the topic matching your current need above.

> Missing a pattern? Open an issue or discussion—HTTP guidance expands with real usage.
