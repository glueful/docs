---
title: Security (API)
description: Authentication, permissions, and middleware APIs
navigation:
  icon: i-lucide-shield
---

# Security API Reference

Programmatic APIs for authentication, permissions, and security middleware.

<!-- security:index:start -->
### Summary

| Area | Count |
|------|-------|
| Roles | 0 |
| Permissions | 0 |
| Policies | 0 |
| Auth Providers | 2 |
| Auth Attributes | 0 |
| Auth Middleware | 1 |

> No roles configured (config/permissions.php roles array empty or commented).

> No explicit permissions enumerated (wildcards or empty role sets).

> No policies registered (config/permissions.php policies array empty).

### Core Configuration
| Key | Value |
|-----|-------|
|strategy|affirmative|
|provider_mode|replace|
|allow_deny_override||
|super_roles|[]|

<!-- security:index:end -->

## Overview
The security layer unifies authentication (who are you?) and authorization (what can you do?) behind small, composable building blocks. It favors explicit provider capabilities, declarative attributes, and config-driven role & policy wiring.

## Architecture
```
┌────────────┐   request   ┌────────────────┐   context   ┌────────────────────┐
│  Client     │────────────>│ Auth Middleware │────────────>│ Controller / Action │
└────────────┘              └────────────────┘              └─────────┬──────────┘
                                             attributes (role/permission)│
                                                    policy lookup       │
                                                        v               │
                                                  Permission Engine <───┘
                                                         │
                                                  Role / Policy Config
```

## Component Matrix
| Component | Responsibility | Extensible Via |
|-----------|---------------|----------------|
| Auth Provider | Authenticate request & (optionally) issue tokens | Implement interface |
| Token Service | Encode/verify / persist tokens & sessions | New service class |
| Middleware | Orchestrate provider chain & enrich request | Custom middleware |
| Attributes | Declarative method/class access constraints | New attribute classes |
| Policy | Resource-level contextual authorization | Policy class mapping |
| Role | Aggregate permissions for user populations | Config `permissions.php` |

## Common Flows
### Authentication
1. Middleware iterates providers.
2. First success attaches user + provider metadata.
3. Attributes evaluated (if present) → permission engine.
4. Controller executes.

### Permission Check (Attribute)
1. Collect required roles/permissions from attributes.
2. Expand user roles → permissions set (respect wildcards & super roles).
3. If policy for resource & ability → evaluate; else simple membership.
4. Apply strategy (e.g., affirmative).

### Token Refresh (JWT)
1. Client presents refresh token.
2. Provider validates session + refresh token.
3. TokenManager issues new pair; rotates refresh.
4. Old refresh invalidated.

### Role Update Propagation
- Config change deployed → generator reflects new matrix.
- Cached permission sets (future) should be flushed or versioned.

## Extension Points
| Area | How to Extend | Considerations |
|------|---------------|----------------|
| Provider | Implement & register new provider | Ensure deterministic failure (return null) when not applicable |
| Policy | Add class + map in config | Keep fast; avoid heavy I/O |
| Attribute | New PHP 8 attribute | Provide clear constructor signature |
| Middleware | Chain before/after auth | Avoid duplicating auth logic |
| Token Service | Implement specialized storage/encoding | Keep crypto code audited |

## Configuration Deep Dive
| Key | Purpose | Guidance |
|-----|---------|----------|
| strategy | Conflict resolution (e.g., affirmative) | Choose predictable model; document internally |
| provider_mode | How providers are ordered / replaced | Keep minimal; remove unused providers |
| allow_deny_override | Explicit allow beating deny or vice versa | Prefer explicit denies for audit clarity |
| super_roles | Always-granted elevated actors | Keep list short & monitored |

## Hardening Guidelines
- Short-lived access tokens; rotate refresh tokens.
- Avoid logging raw tokens or API keys.
- Use attributes + policies together for layered defense.
- Limit wildcard roles; prefer granular explicit permissions.
- Implement revocation hook on credential compromise.
- Monitor auth failure rates & anomaly spikes.

## Troubleshooting
| Symptom | Likely Cause | Action |
|---------|-------------|--------|
| Provider never matches | Token format mismatch | Verify header & provider `canHandleToken()` |
| Always unauthenticated | Middleware not registered | Ensure middleware in pipeline |
| Permission always denied | Role expansion empty | Inspect `permissions.php` & user role assignment |
| Policy ignored | Resource key mismatch | Confirm fully-qualified resource class in config |
| Token refresh fails | Refresh rotation mismatch | Ensure storage updated after pair issuance |

## Related Pages
- Authentication (`/reference/security/auth`)
- Permissions (`/reference/security/permissions`)
- Events & Observability (audit logging, metrics)

## Future Enhancements
- Pluggable permission data providers (remote / cached hybrid)
- Fine-grained audit event stream for each decision
- Rate-limited authentication attempts & lockouts
- Metadata-based dynamic policy injection
