---
title: Drivers
description: Available drivers and configuration options
---

# Drivers

Supported cache drivers and how to configure each.

<!-- cache-drivers:reference:start -->

## Driver List

- `array` (array)
- `file` (file)
- `memcached` (memcached)
- `redis` (redis)

## Configuration Details

### array (`array`)

```json
{
    "driver": "array"
}
```

### file (`file`)

```json
{
    "driver": "file",
    "path": "<project>/storage/cache/"
}
```

### memcached (`memcached`)

```json
{
    "driver": "memcached",
    "host": "127.0.0.1",
    "persistent_id": null,
    "port": 11211,
    "sasl": {
        "password": null,
        "username": null
    },
    "weight": 100
}
```

### redis (`redis`)

```json
{
    "database": 0,
    "driver": "redis",
    "host": "127.0.0.1",
    "password": null,
    "port": 6379,
    "read_timeout": 2.5,
    "retry_interval": 100,
    "timeout": 2.5
}
```

<!-- cache-drivers:reference:end -->
