---
title: Custom Validators
description: Create and register custom validation logic
---

# Custom Validators

Implement bespoke domain rules, reusable sanitizers, and cross‑field checks.

---
## 1. When to Create a Custom Rule

| Scenario | Use a Custom Rule? | Rationale |
|----------|--------------------|-----------|
| Simple required / length / email | No (use built‑ins) | Avoid duplication. |
| Domain logic (e.g., plan tier allows feature) | Yes | Encapsulate policy for reuse. |
| DB check (unique, foreign key existence) | Yes | Inject repository / PDO. |
| Sanitization (normalize case, strip tags) | Implement MutatingRule | Keep validation clean. |
| Cross-field relationship (start_date < end_date) | Yes | Need full data context. |

---
## 2. Rule Interface Recap

```php
interface Rule {
	public function validate(mixed $value, array $context = []): ?string;
}

interface MutatingRule {
	public function mutate(mixed $value, array $context = []): mixed;
}
```

Return a human readable error or null for success—never throw for routine failures.

---
## 3. Basic Example

```php
use Glueful\Validation\Contracts\Rule;

final class Slug implements Rule {
	public function validate(mixed $value, array $ctx = []): ?string {
		if ($value === null) return null;
		if (!is_string($value)) return 'Expected string.';
		return preg_match('/^[a-z0-9-]+$/', $value) ? null : 'Invalid slug format.';
	}
}
```

Usage:

```php
$validator = new Validator([
	'slug' => [new Slug()]
]);
```

---
## 4. Cross‑Field Rule Example

```php
final class StartBeforeEnd implements Rule {
	public function validate(mixed $value, array $ctx = []): ?string {
		$data = $ctx['data'] ?? [];
		$end = $data['end_date'] ?? null;
		if ($value === null || $end === null) return null; // other rules handle required
		return strtotime($value) < strtotime($end) ? null : 'Start date must be before end date.';
	}
}
```

---
## 5. Mutating Rule Example

```php
use Glueful\Validation\Contracts\{Rule, MutatingRule};

final class NormalizePhone implements Rule, MutatingRule {
	public function mutate(mixed $value, array $ctx = []): mixed {
		if (!is_string($value)) return $value;
		return preg_replace('/[^0-9]/', '', $value);
	}
	public function validate(mixed $value, array $ctx = []): ?string {
		if ($value === null) return null;
		return (is_string($value) && strlen($value) >= 10) ? null : 'Invalid phone number.';
	}
}
```

Order this rule first in the field's rule list so other rules see normalized form.

---
## 6. Dependency Injection

Inject services (DB, cache, HTTP client) through the constructor:

```php
final class ActiveUser implements Rule {
	public function __construct(private UserRepository $repo) {}
	public function validate(mixed $value, array $ctx = []): ?string {
		if ($value === null) return null;
		return $this->repo->isActive($value) ? null : 'User is not active.';
	}
}
```

Register the rule as a service in your container for reuse.

---
## 7. Error Message Design

| Guideline | Reason |
|-----------|-------|
| Human focused, not technical | Aids UI display. |
| Avoid field names in message if context obvious | Keep concise. |
| Consistent punctuation | Predictable UI formatting. |
| Distinguish validation vs business rule failures | User clarity on remediation. |

---
## 8. Testing Strategy

| Test | What to Assert |
|------|---------------|
| Happy path | `null` returned for valid values. |
| Failure path | Exact error string. |
| Null handling | Rule returns `null` when value omitted (unless required). |
| Mutation effect | Downstream rule sees mutated value. |
| Cross-field | Provide full data context stub. |

---
## 9. Composition Patterns

- Factory functions returning an array of rules for a concept (e.g., `userNameRules()` returning sanitize + length + pattern).
- Higher order builder that yields configured `Length` etc. from config constants.
- Layer multiple mutators in single `Sanitize` rule to reduce passes.

---
## 10. Localization (Planned)

Strategy: map canonical message codes to translated strings at presentation layer instead of embedding i18n in rule logic. Future `TranslatingRule` decorator could proxy to inner rule then translate result.

---
## 11. Async & External Checks

Current rules are synchronous. For expensive remote calls:

- Pre-fetch external state (e.g., caching) before constructing validator.
- Or stage a second pass (post basic validation) for slow/remote assertions.

---
## 12. Anti‑Patterns

| Smell | Alternative |
|-------|------------|
| Throwing exceptions inside `validate` for routine failures | Return string; exceptions only for catastrophic issues. |
| Embedding DB queries inside loops without indexes | Add proper DB indices or batch existence checks. |
| Mutating in a normal `Rule` implementation | Implement `MutatingRule` to keep semantics clear. |
| Catch‑all regex rule doing many responsibilities | Split into narrow rules for composability. |

---
## 13. Reference

- Core principles: see `./index`.
- Built‑ins: see `./rules`.
- Error handling: see global exceptions docs.

