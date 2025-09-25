| Symptom | Likely Cause | Where to Look | Resolution |
|---------|--------------|---------------|------------|
| Event not firing | Event system disabled | `EVENTS_ENABLED` / `config/events.php` | Enable events or remove dependency |
| Listener not invoked | Not registered / wrong class namespace | Event provider or `listeners` map | Correct FQCN / register listener |
| High event latency | Long-running listener doing IO | Listener code / logs | Offload heavy work to a job |
| Duplicate side effects | Listener executes on retry without idempotency | Listener logic | Add idempotency guard (e.g., lock/key check) |
| Email not sent (notification) | Queue disabled or failed job | Queue dashboard / logs | Enable queue or inspect failed jobs |
| Template missing | Wrong template key or path | Extension template config | Fix mapping / clear cache |
| Rate limited email | Exceeded configured limits | `MAIL_RATE_LIMIT_*` envs | Increase thresholds or throttle callers |
| Excessive retries | Bad external service / transient errors | Job attempts logs | Add backoff/jitter or circuit breaker |