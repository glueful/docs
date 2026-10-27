---
title: API Keys & Scopes
description: Issue, rotate and revoke scoped API keys, and protect routes with #[RequireScope]
---

API keys are long-lived credentials for server-to-server clients: CI jobs, integrations, partner backends. Each key belongs to a user, is stored hashed in the core `api_keys` table, and can be limited by scopes, an IP allowlist and an expiry date. The standard `auth` middleware accepts them alongside JWT bearer tokens.

## Quick Start

```bash
# 1. Create a key (the plaintext is printed once)
php glueful apikey:create --user=<user-uuid> --name="CI deploy" \
  --scopes="read:posts,write:posts" --expires=+1year

# 2. Call the API with it
curl -H "X-API-Key: gf_live_..." https://api.example.com/api/v1/posts
```

```php
// 3. Require a scope on the route
use Glueful\Routing\Attributes\{Get, Middleware, RequireScope};

#[Get('/posts')]
#[Middleware('auth')]
#[RequireScope('read:posts')]
public function index(): Response { /* ... */ }
```

## Key Format

Keys look like `gf_live_<32 random characters>` or `gf_test_<32 random characters>`:

| Segment | Value |
|---------|-------|
| Brand | `auth.api_keys.prefix` (`API_KEY_PREFIX`, default `gf`) |
| Environment | `live` when the application environment is `production`, otherwise `test` |
| Random | 32 base62 characters from `random_int()` |

The environment is fixed when the key is created, so a key minted on a staging box is always `gf_test_…`. The segment is a label that helps people spot a production key in a log or a leaked config. It does not limit where the key works: any key in the `api_keys` table authenticates.

```env
# Rebrand generated keys: lm_live_... / lm_test_...
API_KEY_PREFIX=lm
```

Keep the brand short. Only the first 16 characters of a key are stored as the indexed lookup prefix (`key_prefix`); the full key is SHA-256 hashed into `key_hash`. The plaintext is never stored, so a lost key can't be recovered, only rotated or revoked.

## The `api_keys` Table

Core installs the table (`migrations/auth/003_CreateApiKeysTable.php`) with the other auth tables:

| Column | Notes |
|--------|-------|
| `uuid` | Key id, used by the CLI and in audit events |
| `user_uuid` | The principal the key acts as. Indexed, no foreign key: it's resolved through your `UserProviderInterface` |
| `name` | Human label |
| `key_prefix`, `key_hash` | Lookup prefix and SHA-256 hash; `key_hash` is unique |
| `scopes`, `allowed_ips` | JSON arrays, `NULL` means no restriction |
| `expires_at`, `revoked_at` | Lifecycle timestamps |
| `rotated_from_id` | Set on the successor key after a rotation |

If `user_uuid` doesn't resolve to a user through the user provider, authentication fails even with a valid key.

## Creating Keys

### From the CLI

```bash
php glueful apikey:create --user=<user-uuid> --name="Partner sync" \
  --scopes="read:*,write:orders" \
  --ips="203.0.113.10,198.51.100.0/24" \
  --expires="+90 days"
```

| Option | Description |
|--------|-------------|
| `--user` | User UUID (required) |
| `--name` | Label (required) |
| `--scopes` | Comma-separated scopes; omit for an unrestricted key |
| `--ips` | Comma-separated IPs or IPv4 CIDR ranges |
| `--expires` | Anything `strtotime()` accepts: `2027-01-01`, `+1year`, `+90 days` |

The command prints the plaintext key once, with the key's UUID. Store the plaintext immediately.

### In code

`Glueful\Auth\ApiKey\ApiKeyService` is a static, context-first service:

```php
use Glueful\Auth\ApiKey\ApiKeyService;

$result = ApiKeyService::create($context, [
    'user_uuid'   => $user->uuid(),
    'name'        => 'Partner sync',
    'scopes'      => ['read:*', 'write:orders'],     // null = unrestricted
    'allowed_ips' => ['198.51.100.0/24'],             // null = any IP
    'expires_at'  => date('Y-m-d H:i:s', strtotime('+90 days')), // null = never
]);

$plain = $result['plain']; // show to the user once
$key   = $result['key'];   // Glueful\Auth\ApiKey\ApiKey model (uuid, name, scopes, ...)
```

Creating, rotating and revoking a key each dispatch a generic `EntityCreatedEvent` / `EntityUpdatedEvent` for the `api_keys` table, which an audit extension can record. The payload has the key's identity, scopes, IPs and timestamps, never the plaintext or the hash. If dispatching fails, the key operation still succeeds.

## Listing Keys

```bash
php glueful apikey:list --user=<user-uuid>
```

```php
$keys = ApiKeyService::forUser($context, $userUuid); // list<ApiKey>

foreach ($keys as $key) {
    $key->getScopes();     // list<string>, [] = unrestricted
    $key->getAllowedIps(); // list<string>, [] = any IP
    $key->isExpired();
    $key->isRevoked();
}
```

## Rotating Keys

Rotation mints a successor and keeps the old key working for a grace period so clients can switch without downtime:

```bash
php glueful apikey:rotate <key-uuid> --grace=48   # hours, default 24
```

```php
use Glueful\Auth\ApiKey\ApiKey;
use Glueful\Auth\ApiKey\ApiKeyService;

$existing = ApiKey::query($context)->where('uuid', '=', $uuid)->first();

$rotation = ApiKeyService::rotate($context, $existing, graceHours: 48);
// ['old_uuid' => ..., 'new_uuid' => ..., 'new_plain' => 'gf_live_...', 'old_expires_at' => '...']
```

The successor copies the scopes, IP allowlist and expiry of the old key, gets the name `<name> (rotated)`, and records `rotated_from_id`. The old key's expiry becomes the **earlier** of its current expiry and `now + grace`, so rotation never extends a key's life.

## Revoking Keys

```bash
php glueful apikey:revoke <key-uuid>
```

```php
ApiKeyService::revoke($context, $key); // sets revoked_at, effective immediately
```

## Sending the Key

Clients send the key in one of these places, checked in order:

1. `X-API-Key: gf_live_...` header (preferred)
2. `?api_key=gf_live_...` query parameter, **only** when `security.api_keys.allow_query_param` is `true`
3. `Authorization: ApiKey gf_live_...` header

The query parameter is off by default because URLs end up in access logs, proxies and `Referer` headers. The shipped `config/security.php` carries the switch, driven by an env var:

```php
// config/security.php
'api_keys' => [
    'allow_query_param' => env('API_KEY_ALLOW_QUERY_PARAM', false), // true only if a client truly can't send headers
],
```

```env
API_KEY_ALLOW_QUERY_PARAM=true
```

**Since 1.91**, the block is in the shipped config. An app that added its own `api_keys` block keeps working; the env var is now the simpler switch.

On success the request carries these attributes:

| Attribute | Value |
|-----------|-------|
| `auth_method` | `api_key` |
| `user_id` | The key owner's uuid |
| `api_key_uuid` | The key's own uuid (for audit or rate-limit keying) |
| `api_key_scopes` | The key's scopes (`[]` = unrestricted) |

A missing, unknown, revoked, expired or IP-blocked key fails authentication with a generic error. The response doesn't say which check failed.

## IP Allowlists

`allowed_ips` takes exact addresses and IPv4 CIDR ranges:

```php
'allowed_ips' => ['203.0.113.10', '10.0.0.0/8'],
```

Matching is fail-closed: a malformed entry matches nothing. IPv6 works only as an exact address; IPv6 CIDR ranges never match. The client address comes from `Request::getClientIp()`, so behind a load balancer configure trusted proxies, or every request will appear to come from the proxy.

## Expiry

A key past `expires_at` is rejected. Keys with no `expires_at` never expire. Use `--expires` on creation for keys handed to third parties, and rotate before the date arrives.

## Scopes

Scopes are free-form strings. The usual convention is `action:resource`, for example `read:posts` or `write:orders`. A key's granted scopes are matched against a route's required scope with `fnmatch()`, so `*` wildcards work on the **granted** side:

| Granted | Required | Passes? |
|---------|----------|---------|
| `read:posts` | `read:posts` | Yes |
| `read:*` | `read:posts` | Yes |
| `*` | anything | Yes |
| `read:posts` | `write:posts` | No |
| *(no scopes)* | anything | Yes: an unrestricted key |

### Requiring scopes with `#[RequireScope]`

`#[RequireScope]` declares the scopes a route needs and auto-attaches the `require_scope` middleware. It doesn't authenticate on its own, so the route also needs `auth`.

- **One attribute, several scopes = any of them.**
- **Stacked attributes = all of them.** Each attribute must pass independently.

```php
use Glueful\Routing\Attributes\{Get, Post, Middleware, RequireScope};

#[Middleware('auth')]
final class PostController
{
    #[Get('/posts')]
    #[RequireScope('read:posts')]
    public function index(): Response { /* ... */ }

    // Needs (write:posts OR admin:posts) AND publish:posts
    #[Post('/posts/{id}/publish')]
    #[RequireScope(['write:posts', 'admin:posts'])]
    #[RequireScope('publish:posts')]
    public function publish(string $id): Response { /* ... */ }
}
```

For file-defined routes, pass the scopes as middleware parameters. They form a single any-of group:

```php
$router->get('/reports', [ReportController::class, 'index'])
    ->middleware(['auth', 'require_scope:read:reports,admin:reports']);
```

A request that fails the check gets `403` (`Glueful\Auth\ApiKey\Exceptions\InsufficientScopeException`) with the message `Insufficient scope: required any of [...]`. An unauthenticated request is denied too: a missing credential never counts as full access.

::u-alert{color="warning" variant="subtle" icon="i-lucide-triangle-alert"}
Run `php glueful route:cache:clear` when you upgrade to 1.91. Before 1.91, routes loaded from the route cache lost their `#[RequireScope]` configuration, so `require_scope` saw no requirement and **let requests through**. The cache format is now v3, and older cache files are also discarded on the next boot.
::

## Scopes on JWT Requests

**New in 1.91.** `#[RequireScope]` used to reject every JWT, so scoped routes in practice required an API key. JWT requests can now pass when the authenticated identity (the `auth.user` `UserIdentity`) carries the scopes. The same wildcard matcher and the same any-of/all-of rules apply.

The identity's scopes come from:

- the token's `scopes` claim, or its `scope` claim, as either an array or an OAuth-style space-delimited string (`"read:posts write:posts"`, RFC 6749 §3.3). Both forms are normalised (`UserIdentity::normalizeScopes()`) wherever the identity is built, `AuthToRequestAttributesMiddleware` included
- a `scopes` value on the user record
- any `identity.claims_provider`, which can add scopes after login (see [Identity](/essentials/identity))

Here is a claims provider that grants scopes by role:

```php
use Glueful\Auth\Contracts\IdentityClaimsProviderInterface;
use Glueful\Auth\UserIdentity;

final class EditorScopes implements IdentityClaimsProviderInterface
{
    public function enrich(UserIdentity $identity): UserIdentity
    {
        if (!in_array('editor', $identity->roles(), true)) {
            return $identity;
        }

        return $identity->withClaims([
            'scopes' => [...$identity->scopes(), 'read:posts', 'write:posts'],
        ]);
    }
}

// In your provider's services():
// EditorScopes::class => ['class' => EditorScopes::class, 'shared' => true,
//                         'tags' => ['identity.claims_provider']],
```

::u-alert{color="info" variant="subtle" icon="i-lucide-info"}
**An empty scope set means different things for the two credentials.** An API key with no scopes is unrestricted and passes every scoped route. A JWT whose identity has no scopes is **denied** on every scoped route. A token never gets full access just because it lacks scopes.
::

When a request carries an API key, the key's scopes always decide. The identity that API-key authentication builds can't widen them.

## Best Practices

- Give every key the narrowest scopes it needs; avoid unrestricted keys outside internal tooling.
- Set `--expires` on keys for third parties and rotate before expiry.
- Use IP allowlists for fixed-egress integrations.
- Prefer the `X-API-Key` header; leave the query parameter disabled.
- Revoke a key the moment it leaks. Rotation leaves the old key valid during the grace period, so it isn't enough for a leaked key.

## Next Steps

- [Authentication](/essentials/authentication) - JWT login, the `auth` middleware and roles
- [Identity](/essentials/identity) - `UserIdentity`, the user store and claims providers
- [Rate Limiting](/features/rate-limiting) - Throttle API clients
