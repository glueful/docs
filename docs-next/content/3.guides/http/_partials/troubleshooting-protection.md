<!-- Reusable troubleshooting partial for validation, CORS/CSRF, rate limiting, and related protection layers -->

### Troubleshooting

| Concern | Symptom | Likely Cause | Resolution |
|---------|---------|--------------|------------|
| Validation | Missing field error | Rule omitted / key typo | Add rule / correct field name |
| Validation | All fields wrong type | JSON decoded twice / wrong layer reading stream | Decode body once; share parsed payload |
| Validation | Custom rule ignored | Not registered / naming mismatch | Register rule service; ensure alias maps correctly |
| Validation | Latency spikes | Expensive regex / DB in rule | Pre-fetch data; simplify or cache computations |
| DTO | Unexpected null property | Field optional or filtered out | Mark required; supply default in DTO factory |
| CORS | Browser says "CORS error" | Preflight rejected / headers absent | Ensure OPTIONS handled early; add allow headers/methods |
| CORS | Credentials blocked | Using * with credentials true | Echo explicit origin; add `Vary: Origin` |
| CSRF | Token mismatch | Rotation without client refresh | Implement grace window; force token refresh on 401/419 |
| CSRF | Token not sent | Frontend omitted header / cookie not readable | Expose token via safe cookie or bootstrap JSON; set header `X-CSRF-TOKEN` |
| Rate Limit | Limit never triggers | Parameters reversed or window too large | Ensure `rate_limit:max,window` order & realistic window |
| Rate Limit | All users share quota | Key uses global bucket only | Incorporate user/IP identifier in limiter key |
| Rate Limit | Sudden 429 bursts | Distributed clock skew / uneven shard | Prefer sliding window with centralized store (Redis) |
| Rate Limit | Headers missing | Middleware order or early exception | Move limiter earlier; ensure success path sets headers |
| Ordering | Security headers absent | Middleware placed after response commit | Place `security_headers` first in stack |
| Observability | No metrics for failures | Events not emitted | Emit structured events on validation / CSRF / 429 |

> Tip: Capture `request_id`, limiter key, and origin/token metadata in logs for reproducible incident analysis.
