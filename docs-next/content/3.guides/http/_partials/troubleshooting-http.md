<!-- Reusable troubleshooting partial for HTTP guides -->

### Troubleshooting

| Symptom | Checks | Resolution |
|---------|--------|-----------|
| Route not matched | Correct HTTP verb? Leading slash? Pattern constraints? | Adjust method/path; verify `where()` patterns |
| Middleware not firing | Alias registered? Implements `RouteMiddleware`? Order correct? | Register alias, fix interface, reorder stack |
| Parameters not injected | Attribute/controller signature mismatch? | Align action parameters to route placeholders |
| Field selection ignored | `field_selection` middleware present? Query `fields` supplied? | Add middleware or provide `fields` query string |
| High latency | Which middleware is slow? External I/O? | Profile with `debug:middleware`, cache or move I/O later |
| Missing request_id | Bootstrap helper not executed early | Ensure global request id generation runs pre-dispatch |
| Double JSON encoding | Provided JSON string to `Response::success()` | Pass native array / object, not encoded string |
| Wrong pagination shape | Used `success()` not `paginated()` | Replace with `Response::paginated()` |
| Rate limit never triggers | Parameters reversed? Shared key misconfigured? | Verify pattern `rate_limit:max,window[,type]` |
| CORS header absent | `security_headers` not applied? Custom override? | Add middleware globally or call `withCors()` |

> Tip: Keep a lightweight smoke test route (`/health`) without heavy middleware for monitoring clarity.