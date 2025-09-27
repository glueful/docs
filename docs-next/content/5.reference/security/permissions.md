---
title: Permissions API
description: Role and permission checks, context-aware decisions
---

# Permissions API

Programmatic permission checks and role management hooks.

## Overview
Glueful's permission system provides a declarative & composable way to express what a caller can do, while remaining framework-light and config-driven. Roles map to sets of permission strings; policies provide code paths for resource-sensitive authorization; attributes on controllers supply inline constraints.

### Core Concepts
| Concept | Description |
|---------|-------------|
| Role | Named collection of permission identifiers (strings). |
| Permission | Dot-or-slash namespacing (e.g. `posts.create`, `users.delete`). Purely convention-based. |
| Policy | Class method providing contextual authorization logic for a resource. |
| Strategy | Global resolution rule (e.g. first deny wins vs allow overrides). |
| Wildcard `*` | Grants all permissions for a role (not enumerated in generated list). |
| Super Roles | Elevated roles (e.g. `admin`) always granted privileged access where configured. |
| Provider Mode | How permissions are retrieved (direct DB, cached, hybrid, etc.). |

## Permission Evaluation Flow
1. Collect caller identity (from authentication layer) and associated role(s).
2. Expand roles into concrete permission set (excluding `*` which implies universal grant).
3. If a policy is registered for the target resource/action, delegate to policy method first (policy may allow/deny/abstain).
4. If policy abstains or missing, fall back to raw permission membership check.
5. Apply strategy rules (e.g. explicit deny override, allow-dominant, etc.).
6. Return boolean + optional audit trail (logging layer can consume).

### Policy Resolution
A policy is typically mapped like:
```php
return [
    Post::class => App\Policies\PostPolicy::class,
];
```
Each policy method conventionally matches an ability name:
```php
class PostPolicy {
    public function update(array $user, Post $post): bool {
        // Ownership or elevated role
        return $user['uuid'] === $post->author_uuid || ($user['is_admin'] ?? false);
    }
}
```

## Examples
### Checking a Permission Imperatively
```php
if (!PermissionHelper::can($userUuid, 'posts.publish')) {
    throw new HttpException(403, 'Insufficient permission');
}
```

### Combining Role & Permission Attributes
```php
#[RequiresRole('editor')]
#[RequiresPermission('posts.publish')]
public function publish(int $id) { /* ... */ }
```

### Seeding Roles (Config `permissions.php`)
```php
return [
    'roles' => [
        'admin' => ['*'],
        'editor' => ['posts.create', 'posts.edit', 'posts.publish'],
        'viewer' => ['posts.view'],
    ],
    'policies' => [
        App\Models\Post::class => App\Policies\PostPolicy::class,
    ],
    'strategy' => 'allow-first',
    'provider_mode' => 'database',
    'super_roles' => ['admin'],
];
```

### Writing a Policy Method With Context
```php
class PostPolicy {
    public function delete(array $user, Post $post): bool {
        if (($user['is_admin'] ?? false)) { return true; }
        return $user['uuid'] === $post->author_uuid && $post->status !== 'locked';
    }
}
```

## Best Practices
- Minimize use of `*`; tailor roles to least privilege.
- Keep permission strings stable; treat them like public API contracts consumed by UI & services.
- Log both denies and escalations for audit trails.
- Co-locate policy logic with domain models to prevent anemic design.
- Avoid performing heavy I/O in policy methods; pre-fetch required context earlier in request.
- Periodically export role/permission matrix for security review.

## Troubleshooting
| Symptom | Possible Cause | Action |
|---------|----------------|--------|
| Always denied | Role not attached / empty permission set | Verify roles assignment after auth phase. |
| Wildcard not reflected | `*` not enumerated by design | Works implicitly; list remains minimal. |
| Policy ignored | Resource class mismatch | Confirm exact FQCN key in `policies` map. |
| Slow checks | Excessive remote lookups in policy | Cache or pre-hydrate needed data. |

## Extending
To add a new policy:
1. Create policy class with ability methods.
2. Map resource => policy in `permissions.php`.
3. (Optional) Add unit tests asserting allow/deny for edge cases.

To introduce dynamic permissions (runtime): implement a provider that augments the set before evaluation (not yet scaffolded; future extension point).

---

<!-- security:permissions:start -->
### Roles

> (none defined)

### Aggregated Permissions

> (none enumerated)

### Policies

> (none registered)

<!-- security:permissions:end -->
