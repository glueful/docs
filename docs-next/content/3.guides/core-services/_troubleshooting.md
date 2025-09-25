| Symptom | Likely Cause | Where to Look | Fix |
|---------|--------------|---------------|-----|
| High latency after enabling cache | Cache misses / cold start | Metrics: hit ratio, logs | Prewarm hot keys, shorten key namespace |
| Duplicate recompute under load | Stampede protection disabled | `config/cache.php` stampede settings | Enable protection / shard keyspace |
| Jobs stuck in pending | Worker not running / queue mismatch | `queue.php` connection + worker logs | Start worker, verify queue name |
| Repeated job retries | Non-idempotent handler throwing | Job exception logs | Make handler idempotent, add backoff |
| Lock never acquired | Short TTL vs long critical section | `lock.php` store + retry config | Increase TTL or split work |
| Event listener silent | Not registered / wrong class name | Event provider / registration map | Register correctly, clear opcode cache |