---
title: Contributing
description: Contribute to Glueful framework
---

Thank you for considering contributing to Glueful! This guide will help you get started.

## Ways to Contribute

-  **Report bugs** - Help us identify and fix issues
-  **Suggest features** - Share ideas for improvements
-  **Improve documentation** - Help others learn Glueful
-  **Submit code** - Fix bugs or implement features
-  **Write tests** - Improve code coverage
-  **Answer questions** - Help community members

## Getting Started

### Fork & Clone

```bash
# Fork the framework repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/framework.git glueful-framework
cd glueful-framework

# Add upstream remote
git remote add upstream https://github.com/glueful/framework.git
```

### Install Dependencies

```bash
composer install
```

The framework needs PHP 8.3+. CI runs the test suite on PHP 8.3 and 8.4.

### Create a Branch

Active development happens on the `dev` branch; `main` tracks releases. Branch from `dev` and target `dev` with your pull request:

```bash
git fetch upstream
git checkout -b fix/bug-description upstream/dev
# or
git checkout -b feature/your-feature-name upstream/dev
```

## Development Guidelines

### Code Style

Glueful follows PSR-12 (plus a line-length rule), configured in `phpcs.xml`:

```bash
# Check code style
composer run phpcs

# Fix code style
composer run phpcbf      # or: composer run format
```

### Static Analysis

PHPStan runs at level 8 over `src/`, with `phpVersion` pinned to PHP 8.3 in `phpstan.neon` so results match CI even if you develop on a newer PHP:

```bash
composer run analyse            # what CI runs
composer run analyse:changed    # only files changed vs main
composer run types:validate     # per-component passes (DI, database, HTTP, cache)
```

### Writing Tests

Framework tests are plain PHPUnit tests in the `Glueful\Tests\` namespace (autoloaded from `tests/`). They extend `PHPUnit\Framework\TestCase`:

```php
<?php

declare(strict_types=1);

namespace Glueful\Tests\Unit\Support;

use PHPUnit\Framework\TestCase;

final class ExampleTest extends TestCase
{
    public function testExampleFeature(): void
    {
        $result = someFunction();

        $this->assertSame('expected', $result);
    }
}
```

Run tests:

```bash
# All suites
composer test

# One suite
composer run test:unit
composer run test:integration

# One file or test
vendor/bin/phpunit tests/Unit/Support/ExampleTest.php
vendor/bin/phpunit --filter=testExampleFeature

# Coverage (HTML in coverage/)
composer run test:coverage
```

`phpunit.xml.dist` points tests at in-memory SQLite, so most tests need no database server. Core code and tests must not depend on concrete extensions: use the framework's contracts and in-suite fakes instead.

### Documentation and Changelog

- PHPDoc for public APIs
- An entry under `## [Unreleased]` in `CHANGELOG.md` for every user-visible change (Keep a Changelog sections: Added, Changed, Fixed, …)
- For breaking or behavior-changing work, an `### Upgrade Notes` entry in the changelog and, where manual steps are needed, a section in `UPGRADE.md`
- User guides live in the separate [docs repository](https://github.com/glueful/docs); user-facing upgrade steps also go in its [Upgrading](/upgrading) guide

## Pull Request Process

### 1. Ensure Quality

Run the same gate CI runs before submitting:

```bash
composer run ci        # composer test + composer run analyse + composer run phpcs
```

`composer run ci:fast` swaps the full analysis for `analyse:changed` while you iterate; run the full `ci` before pushing.

### 2. Commit Your Changes

Follow the conventional commits format:

```
type(scope): subject

body

footer
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
fix(cache): keep the file cache in the app's storage directory

The file driver resolved a config key no app defines, so entries
landed under vendor/. Resolve the app's storage path instead.

Closes #123
```

Avoid messages like "Fix stuff", "WIP", or "Updates".

### 3. Push Changes

```bash
git push origin fix/bug-description
```

### 4. Create Pull Request

- Open the pull request against `dev`
- Fill out the PR template completely
- Reference any related issues
- Describe the change and how you tested it
- Mention the CHANGELOG entry and any upgrade note

### 5. Code Review

- Respond to feedback promptly
- Push updates to the same branch
- Be open to suggestions

## Reporting Bugs

### Before Reporting

- Check existing issues
- Try the latest version
- Reproduce the issue
- Gather debug information (`php glueful version --system`, `php glueful doctor`)

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. ...
2. ...
3. See error

**Expected behavior**
What you expected to happen.

**Actual behavior**
What actually happened.

**Environment:**
- Glueful version: [e.g. 1.91.0]
- PHP version: [e.g. 8.3.0]
- Database: [e.g. PostgreSQL 16]
- OS: [e.g. Ubuntu 24.04]

**Additional context**
Any other relevant information.

**Code samples**
```php
// Relevant code
```
```

## Suggesting Features

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution**
How you'd like it to work.

**Describe alternatives**
Alternative solutions you've considered.

**Additional context**
Any other context or examples.
```

## Development Setup

### Local Environment

The framework is a library; its CLI entry point is `bin/glueful`. To work on it against a real app, create an app from the api-skeleton and point it at your clone with a Composer path repository:

```bash
composer create-project glueful/api-skeleton my-app
cd my-app

# In my-app/composer.json, add:
#   "repositories": [{ "type": "path", "url": "../glueful-framework", "options": { "symlink": true } }]
composer require glueful/framework:@dev

php glueful install
php glueful migrate:run
```

Inside the framework repo itself, run CLI commands with `php bin/glueful <command>`.

### Running Documentation Locally

```bash
git clone https://github.com/glueful/docs.git
cd docs
pnpm install
pnpm run dev
```

## Coding Standards

### PSR Standards

- Follow PSR-12 for coding style
- Follow PSR-4 for autoloading (`Glueful\` → `src/`, `Glueful\Tests\` → `tests/`)
- Follow PSR-3 for logging

### Best Practices

**1. Type Declarations**

```php
// ✅ Good - strict types, type hints
declare(strict_types=1);

public function process(string $name, int $age): User
{
    // ...
}

// ❌ Bad - no types
public function process($name, $age)
{
    // ...
}
```

**2. Error Handling**

```php
// ✅ Good - specific exceptions
if ($user === null) {
    throw new UserNotFoundException("User {$id} not found");
}

// ❌ Bad - generic exception
if (!$user) {
    throw new Exception("Error");
}
```

**3. Dependency Injection and Context**

```php
// ✅ Good - constructor injection; ApplicationContext passed explicitly
public function __construct(
    private ApplicationContext $context,
    private EmailService $email
) {}

// ❌ Bad - hidden global state
public function process()
{
    $users = UserRepository::getInstance();
}
```

## Testing Guidelines

### Test Coverage

Aim for:
- All public behavior tested
- Edge cases covered
- Error conditions tested
- A regression test with every bug fix

### Test Organization

```
tests/
├── Unit/           # Unit tests, mirroring src/ (Auth, Cache, Database, Extensions, Routing, …)
├── Integration/    # Integration tests across subsystems
├── Feature/        # End-to-end feature tests (CLI, system checks)
├── Core/           # Framework boot, router, and exception-handler tests
├── Performance/    # Benchmarks (own suite)
├── Fixtures/       # Test fixtures
├── Support/        # Shared test helpers
└── bootstrap.php   # PHPUnit bootstrap
```

### Writing Good Tests

```php
// ✅ Good - clear, focused test
public function testCreatesUserWithValidData(): void
{
    $data = ['name' => 'John', 'email' => 'john@example.com'];

    $user = $this->userService->create($data);

    $this->assertNotNull($user->id);
    $this->assertSame('John', $user->name);
}

// ❌ Bad - tests multiple things
public function testUserService(): void
{
    // Creates user
    // Updates user
    // Deletes user
    // All in one test
}
```

## Documentation Guidelines

### Code Comments

```php
/**
 * Process user registration
 *
 * @param  array<string, mixed>  $data  User registration data
 * @return User  The created user
 * @throws ValidationException
 */
public function register(array $data): User
{
    // ...
}
```

### Markdown Documentation

- Use clear headings
- Include code examples, and verify every method, config key, and command against the source
- Add links to related docs
- Keep it concise

## Community Guidelines

### Be Respectful

- Be welcoming and inclusive
- Respect different viewpoints
- Accept constructive criticism
- Focus on what's best for the community

### Communication

- Use clear, professional language
- Provide constructive feedback
- Assume good intentions
- Ask questions for clarity

## Recognition

Contributors are recognized in release notes and on the GitHub contributors page.

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

## Questions?

- 📧 Email: contributors@glueful.dev
- 🐛 Issues: [GitHub Issues](https://github.com/glueful/framework/issues)

Thank you for contributing to Glueful! 🎉
