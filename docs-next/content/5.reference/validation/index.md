---
title: Validation (API)
description: Rules, error formats, and custom validators
navigation:
  icon: i-lucide-check-circle
---

# Validation API Reference

Composable, rule‑driven validation with mutation (sanitization) support and deterministic error aggregation.

Pages in this section:

- `./rules` – Built‑in rule catalog & syntax
- `./custom-validators` – Creating & registering custom rules

---
## 1. Philosophy & Goals

| Principle | Why It Matters |
|-----------|----------------|
| Deterministic ordering | Rules run in declaration order for predictable errors. |
| Separation of mutation vs validation | Sanitizers implement `MutatingRule` so they never emit errors. |
| Fast bail‑out per rule | Each rule returns at most one string or null; no thrown exceptions in tight loop. |
| Context aware | Every rule receives field + full data context for cross‑field logic. |
| Minimal surface | Simple interfaces keep custom rules tiny & testable. |

---
## 2. Architecture Overview

```
Input Data ──► Validator (rules map) ──► [ Mutating Rules ] ──► [ Validation Rules ] ──► Errors[]
                                                   │                              │
                                                   └──────── filtered values ◄────┘
```

Components:

| Component | Responsibility | File |
|-----------|----------------|------|
| `Validator` | Orchestrates rule execution & collects errors | `Validation/Validator.php` |
| `Rule` | Validates a value returning error or null | `Validation/Contracts/Rule.php` |
| `MutatingRule` | Transforms value pre-validation | `Validation/Contracts/MutatingRule.php` |
| Built‑in Rules | Common validation primitives | `Validation/Rules/*.php` |
| `ValidationException` | Aggregate error carrier | `Validation/ValidationException.php` |

---
## 3. Core Types & Interfaces

| Symbol | Kind | Summary | Notes |
|--------|------|---------|-------|
| `Rule` | interface | `validate(mixed $value, array $ctx): ?string` | Return string = failure; null = pass. |
| `MutatingRule` | interface | `mutate(mixed $value, array $ctx): mixed` | Runs before non-mutating rules. |
| `Validator` | class | `validate(array $data): array` | Returns `errors[field][] = message`. |
| `ValidationException` | class | Wraps error map | Message fixed: "Validation failed." |

---
## 4. Validation Lifecycle

1. Caller instantiates `Validator` with a field → rule[] map.
2. `validate($data)` iterates fields in map order.
3. For each field:
   - Run all `MutatingRule`s first updating working value.
   - Run remaining rules; collect each non‑null error string.
   - Store final (possibly mutated) value in filtered array.
4. Caller inspects returned error map OR throws `ValidationException($errors)`.
5. Filtered values retrievable via `filtered()`—safe for persistence.

---
## 5. Example

```php
use Glueful\Validation\Validator;
use Glueful\Validation\Rules\{Required, Email, Length, Sanitize};

$v = new Validator([
  'name' => [new Sanitize(['trim']), new Required(), new Length(min: 2, max: 50)],
  'email' => [new Sanitize(['trim','lower']), new Required(), new Email()],
]);

$errors = $v->validate($_POST);
if ($errors !== []) {
    throw new Glueful\Validation\ValidationException($errors);
}
$clean = $v->filtered();
```

---
## 6. Error Model

| Aspect | Behavior |
|--------|----------|
| Multiple errors per field | Accumulates all failures (no early bail) unless you design rule ordering to short‑circuit. |
| Message Style | Human readable, sentence case, no punctuation beyond final period. |
| Transport | REST endpoints typically transform to JSON: `{ field: ["..."] }`. |
| Aggregation | Up to caller to throw `ValidationException` after collecting. |

---
## 7. Configuration & Environment

Currently the validation core is configuration‑light. Policy decisions (max lengths, allowed sets) generally passed into rule constructors or read earlier from config before constructing rules.

Future hooks (planned):

| Idea | Purpose |
|------|---------|
| Message translation map | i18n/localization of error messages. |
| Global coercion strategy | Central numeric/string coercion behavior. |
| Metrics toggle | Emit per‑rule counters for observability. |

---
## 8. Extension Points

| Point | How |
|-------|-----|
| New validation logic | Implement `Rule` and supply in rules array. |
| Sanitization / normalization | Implement `MutatingRule`. |
| Cross‑field checks | Use context `['data']` inside a rule. |
| DB aware checks | Inject services (e.g., PDO) into rule constructor like `DbUnique`. |
| Aggregated rule sets | Build factory functions returning arrays for reuse. |

---
## 9. Built‑In Rules Overview

| Rule | Purpose | Example Failure |
|------|---------|-----------------|
| Required | Reject empty / null / empty array | `This field is required.` |
| Email | RFC email format check | `Invalid email address.` |
| Length(min,max) | String length boundaries | `Must be at least 2 characters.` |
| Range(min,max) | Integer bounds (with numeric coercion) | `Must be >= 1.` |
| Type(type) | Exact PHP type match | `Expected type string.` |
| InArray(choices) | Membership test | `Value must be one of: A, B.` |
| Sanitize(ops[]) | Mutate only (trim/strip/upper etc.) | (no failure) |
| DbUnique(pdo,table,column) | Ensure uniqueness in table column | `Value must be unique.` |

See `./rules` for detailed parameter semantics.

---
## 10. Performance Notes

| Concern | Guidance |
|---------|----------|
| Avoid redundant decoding | Decode JSON / parse input once before constructing validator. |
| Heavy DB checks | Batch queries or use EXISTS queries (as done in `DbUnique`). |
| Mutators cost | Combine sanitization ops in one `Sanitize` rule to reduce loops. |
| Large payloads | Consider streaming / chunk validation (future enhancement). |

---
## 11. Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| All fields return `Expected type` | Rules expecting string/int but data already coerced differently | Inspect input decoding; adjust `Type` rule. |
| Duplicate uniqueness errors | Rule executed twice | Ensure rule array not duplicated in construction. |
| Mutations not applied | Mutating rule placed after validator rules | Order: put `Sanitize` first. |
| Cross-field rule sees stale value | Mutation in other field not yet executed | Run a second validation pass or sequence dependent fields first. |

---
## 12. Related

- Error Handling reference for exception wrapping strategies.
- Database layer docs for efficient uniqueness indices.
- Security input validation guidance (overlaps conceptually but different layer).

