---
title: Reference
description: API docs for modules, CLI, and configuration schema
navigation:
  icon: i-lucide-book
---

# Reference

Reference coverage targets:

- HTTP: router, middleware, request/response
- Container: binding, resolution, scopes
- Validation: rules, custom validators
- Database: query API, schema API
- Cache: drivers, configuration, API
- Queue: drivers, jobs, monitoring API
- Events: emitter, listeners, contracts
- Notifications: services, templates, channels
- Storage: adapters, uploader
- Security: auth, permissions, middleware
- Observability: logging, metrics, tracing
- Scheduler & Locks: APIs and options
- CLI command index and flags
- Configuration schema (keys, types, defaults)

---

## Domain Summary

| Domain | Path | Focus | Status |
|--------|------|-------|--------|
| HTTP | `http/` | Routing, middleware, requests, responses | drafting |
| Container | `container/` | Bindings, resolution, scopes | drafting |
| Validation | `validation/` | Rules, composing, custom validators | drafting |
| Database | `database/` | Query builder, schema, transactions | drafting |
| Cache | `cache/` | Drivers, tagging, APIs | drafting |
| Queue | `queue/` | Jobs, drivers, monitoring hooks | drafting |
| Events | `events/` | Emission, listeners, contracts | drafting |
| Notifications | `notifications/` | Channels, templates, sending | drafting |
| Storage | `storage/` | Adapters, uploader abstraction | drafting |
| Security | `security/` | Auth, permissions, middleware | drafting |
| Observability | `observability/` | Logging, metrics, tracing | drafting |
| Scheduler & Locks | `scheduler-locks/` | Scheduling + distributed locks | drafting |
| CLI | `cli/` | Built-in commands, authoring | drafting |
| Configuration | `configuration/` | Keys, types, defaults | drafting |

Legend: drafting -> structure present; populated -> tables & examples complete; generated -> machine-generated sections integrated.

---

## Structure & Conventions

Each domain index will include (when complete):

1. Overview
2. Core Types (table)
3. API Surface (Creation, Usage, Extension Points)
4. Configuration (table; auto-generated if applicable)
5. Examples (minimal runnable patterns)
6. Error Conditions (exceptions, edge behaviors)
7. Observability & Metrics (emitted counters, log categories)
8. Performance Notes (hot path considerations)
9. Related (links to Concepts + Guides)

Automation markers (do not edit internally):
```
<!-- GENERATED:config-schema -->
<!-- END GENERATED:config-schema -->

<!-- GENERATED:cli-commands -->
<!-- END GENERATED:cli-commands -->
```

---

## Upcoming Automation

| Generator | Output | Trigger |
|-----------|--------|---------|
| Config Schema Extractor | Flattens `config/*.php` keys into table | Manual script / CI |
| CLI Command Index | Command name, description, args/options | Manual script / CI |
| Symbol Scanner | Lists interfaces / middleware / jobs | Optional future |

---

## Progress Checklist

| Item | Status |
|------|--------|
| Skeletons created | ✅ |
| Root index augmented | ✅ |
| Generated block markers defined | ✅ |
| Configuration schema generation script | ☐ |
| CLI command index script | ☐ |
| Per-domain Core Types tables populated | ☐ |
| Examples added (HTTP, Container, Queue) | ☐ |

---

## Next Steps

1. Implement `tools/docs/generate-config-schema.php` to populate config block.
2. Implement `tools/docs/generate-cli-index.php` to populate CLI block.
3. Add empty generated markers to `configuration/index.md` & `cli/index.md`.
4. Populate Core Types for HTTP, Container, Queue.
5. Add first examples for Validation & Cache modules.

---

## Related

See Concepts: Caching Strategies, Observability Model, Performance Principles, Error Handling & Exceptions.
