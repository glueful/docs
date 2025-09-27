---
title: Rules
description: Built-in rules and parameters
---

# Rules

Catalog of built‑in validation & mutating rules with parameters, semantics, and example failures. For philosophy & lifecycle see `./index`.

---
## 1. Summary Table

| Rule | Category | Purpose | Parameters | Mutation | Example Failure |
|------|----------|---------|------------|----------|-----------------|
| Required | Core | Reject null/empty | – | No | This field is required. |
| Email | String | RFC email format | – | No | Invalid email address. |
| Length | String | Enforce min/max characters | min?, max? (ints) | No | Must be at least 2 characters. |
| Range | Numeric | Enforce integer bounds | min?, max? (ints) | No | Must be >= 1. |
| Type | Core | Exact PHP type check | type (string) | No | Expected type string. |
| InArray | Set | Membership test | choices (array) | No | Value must be one of: A, B. |
| Sanitize | Mutator | Apply string ops | ops[] (trim, lower, …) | Yes | (n/a) |
| DbUnique | DB | Uniqueness in table column | pdo, table, column | No | Value must be unique. |

---
## 2. Detailed Reference

### Required
Rejects empty string, null, or empty array. Does not treat `0` or `"0"` as empty.

Example:
```php
new Required();
```

### Email
Validates using `FILTER_VALIDATE_EMAIL`. Null passes (combine with Required for mandatory fields).

### Length
```php
new Length(min: 2, max: 50);
```
Skips null; non‑string produces `Expected string.` before length checks.

### Range
```php
new Range(min: 1, max: 100);
```
Coerces numeric strings that are clean integers (e.g., "12") to int. Rejects floats or non‑numeric.

### Type
Strict PHP runtime type match via `gettype`. Typical values: `string`, `integer`, `boolean`, `array`.

### InArray
```php
new InArray(['draft','published']);
```
Uses strict comparison; ensure types in choices reflect expected input.

### Sanitize (MutatingRule)
Applies ordered transformations to scalar/string values. Supported ops:

| Op | Effect |
|----|--------|
| trim | Trim both ends |
| ltrim | Left trim |
| rtrim | Right trim |
| strip_tags | Remove HTML tags |
| strtolower / lower | To lowercase |
| strtoupper / upper | To uppercase |

Does not emit validation messages; always returns null from `validate`.

### DbUnique
```php
new DbUnique($pdo, 'users', 'email');
```
Executes a `SELECT 1 ... LIMIT 1`; any match triggers failure. Ensure an index for performance.

---
## 3. Usage Patterns

Chain mutators first, then validators:
```php
new Validator([
	'email' => [new Sanitize(['trim','lower']), new Required(), new Email(), new DbUnique($pdo, 'users','email')]
]);
```

Reuse rule sets:
```php
function userNameRules(): array {
	return [new Sanitize(['trim']), new Required(), new Length(min: 2, max: 40)];
}
```

---
## 4. Error Aggregation Example

If both Length and Type fail:
```php
$v = new Validator(['name' => [new Length(min: 2), new Type('string')]]);
$errors = $v->validate(['name' => 123]);
// $errors['name'] might include: ['Expected string.'] (Length skipped after early type failure)
```
Note: In current implementation Length returns `Expected string.` and does not proceed to size checks. Type then may add a second message; ordering influences duplicates—prefer Type before Length when strict typing desired.

---
## 5. Performance Considerations

| Concern | Mitigation |
|---------|-----------|
| Repeated DB uniqueness checks in batch | Preload existing values or add composite uniqueness constraints. |
| Excess sanitation passes | Combine ops into one Sanitize instance. |
| Large choice arrays in InArray | Convert to hash map (future option) if > O(1000). |

---
## 6. Extending the Set

Add your custom rules and document them in a local extension table. Prefer single responsibility (one validation concern per rule) to keep composition flexible.

---
## 7. Related

- `./custom-validators` for authoring guidance.
- Input parsing & error handling references.

