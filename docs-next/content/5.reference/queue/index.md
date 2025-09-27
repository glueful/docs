# Queue Reference

This page documents the queue system configuration, drivers, workers and monitoring.

<!-- queues:reference:start -->
### Drivers
| Name | Class | Status |
| ---- | ----- | ------ |
| database | Glueful\Queue\Drivers\DatabaseQueue | available |
| redis | Glueful\Queue\Drivers\RedisQueue | available |

### Connections
#### database

Driver: `database`  
Primary Queue: `default`  

<details><summary>Configuration</summary>

```json
{
    "after_commit": false,
    "driver": "database",
    "failed_table": "queue_failed_jobs",
    "queue": "default",
    "retry_after": 90,
    "table": "queue_jobs"
}
```
</details>

#### null

Driver: `null`  
Primary Queue: `default`  

<details><summary>Configuration</summary>

```json
{
    "driver": "null"
}
```
</details>

#### redis

Driver: `redis`  
Primary Queue: `default`  

<details><summary>Configuration</summary>

```json
{
    "block_for": null,
    "database": 0,
    "driver": "redis",
    "host": "127.0.0.1",
    "job_expiration": 3600,
    "password": null,
    "persistent": false,
    "port": 6379,
    "prefix": "glueful:queue:",
    "queue": "default",
    "retry_after": 90,
    "timeout": 5
}
```
</details>

#### sync

Driver: `sync`  
Primary Queue: `default`  

<details><summary>Configuration</summary>

```json
{
    "driver": "sync"
}
```
</details>

### Monitoring
- Enabled: **yes**
- Metrics Retention (days): `30`
- Worker Heartbeat Timeout (s): `120`

**Alert Rules**
| Name | Queue | Condition | Threshold | Period | Severity | Cooldown (s) | Enabled |
| ---- | ----- | --------- | --------- | ------ | -------- | ------------ | ------- |
| high_failure_rate | * | failure_rate_above | 0.1 | 1hour | warning | 900 | yes |
| no_workers_running | * | active_workers_below | 1 | 1minute | critical | 600 | yes |
| queue_size_critical | * | queue_size_above | 1000 | 5minutes | critical | 300 | yes |
| slow_job_processing | * | avg_processing_time_above | 300 | 15minutes | warning | 1800 | no |

**Notification Channels**
| Type | Enabled |
| ---- | ------- |
| email | no |
| log | yes |
| webhook | no |

### Workers
**Process**
```json
{
    "default_workers": 2,
    "enabled": true,
    "graceful_shutdown_timeout": 30,
    "health_check_interval": 30,
    "heartbeat_interval": 15,
    "max_restarts_per_hour": 10,
    "max_workers_global": 50,
    "max_workers_per_queue": 10,
    "restart_delay": 5,
    "worker_timeout": 300
}
```

**Auto Scaling**
```json
{
    "check_interval": 60,
    "cooldown_period": 300,
    "enabled": false,
    "scale_down_step": 1,
    "scale_down_threshold": 10,
    "scale_up_step": 2,
    "scale_up_threshold": 100
}
```

**Queue Settings**
| Queue | auto_scale | max_jobs | max_workers | memory_limit | priority | timeout | workers |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| default | 1 | 1000 | 5 | 128 | 1 | 60 | 2 |
| emails |  | 2000 | 4 | 64 | 5 | 120 | 2 |
| high | 1 | 500 | 8 | 256 | 10 | 30 | 3 |
| reports |  | 50 | 2 | 512 | 2 | 600 | 1 |

**Resource Limits**
```json
{
    "job_timeout": 300,
    "max_jobs_per_worker": 1000,
    "memory_limit": "512M",
    "time_limit": 3600,
    "worker_cpu_percent": 10,
    "worker_memory_mb": 128
}
```

**Resource Thresholds**
```json
{
    "cpu": {
        "critical": 90,
        "scale_limit": 80,
        "warning": 70
    },
    "disk": {
        "critical": 95,
        "scale_limit": 90,
        "warning": 80
    },
    "load": {
        "critical": 4,
        "scale_limit": 3,
        "warning": 2
    },
    "memory": {
        "critical": 90,
        "scale_limit": 85,
        "warning": 75
    }
}
```

**Worker Performance**
```json
{
    "backoff_base": 2,
    "backoff_strategy": "exponential",
    "max_backoff": 3600,
    "max_tries": 3,
    "sleep_seconds": 3
}
```

**Supervisor (Legacy)**
```json
{
    "config_path": "/etc/supervisor/conf.d/",
    "enabled": false,
    "restart_cooldown": 60,
    "restart_threshold": 10
}
```

### Performance
```json
{
    "batch_processing": {
        "batch_size": 100,
        "batch_timeout": 30,
        "enabled": true
    },
    "compression": {
        "algorithm": "gzip",
        "enabled": false,
        "level": 6,
        "min_size": 1024
    },
    "connection_pooling": {
        "enabled": true,
        "idle_timeout": 300,
        "max_connections": 10,
        "min_connections": 1
    },
    "job_priority": {
        "default_priority": 0,
        "enabled": true,
        "high_priority_threshold": 100,
        "low_priority_threshold": -100
    }
}
```

### Security
```json
{
    "authentication": {
        "driver": "token",
        "enabled": false,
        "token": null,
        "token_header": "X-Queue-Auth-Token"
    },
    "encryption": {
        "cipher": "AES-256-CBC",
        "enabled": false,
        "key": null
    },
    "ip_whitelist": {
        "allowed_ips": [
            "127.0.0.1",
            "::1"
        ],
        "enabled": false
    },
    "rate_limiting": {
        "burst_allowance": 100,
        "enabled": false,
        "max_jobs_per_hour": 50000,
        "max_jobs_per_minute": 1000
    }
}
```

### Development
```json
{
    "debug": false,
    "log_level": "info",
    "profiling": {
        "enabled": false,
        "memory_profiling": false,
        "slow_job_threshold": 10
    },
    "query_logging": false,
    "testing": {
        "delay_simulation": false,
        "failure_simulation": false,
        "fake_mode": false
    }
}
```

### Plugins
```json
{
    "discovery": {
        "auto_register": true,
        "enabled": true,
        "paths": [
            "<project>/config/../api/Queue/Plugins",
            "<project>/config/../plugins/queue"
        ]
    },
    "validation": {
        "strict_mode": true,
        "validate_on_load": true
    }
}
```

### Meta
- Default Connection: `database`
- connections: `4`
- drivers: `2`
- alertRules: `4`
- queuesDeclared: `4`
<!-- queues:reference:end -->

