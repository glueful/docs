---
title: Contributing
description: Contribute to Glueful framework
---

Thank you for considering contributing to Glueful! This guide will help you get started.

## Ways to Contribute

- 🐛 **Report bugs** - Help us identify and fix issues
- ✨ **Suggest features** - Share ideas for improvements
- 📖 **Improve documentation** - Help others learn Glueful
- 💻 **Submit code** - Fix bugs or implement features
- 🧪 **Write tests** - Improve code coverage
- 💬 **Answer questions** - Help community members

## Getting Started

### Fork & Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/glueful.git
cd glueful

# Add upstream remote
git remote add upstream https://github.com/glueful/glueful.git
```

### Install Dependencies

```bash
composer install
```

### Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

## Development Guidelines

### Code Style

Glueful follows PSR-12 coding standards:

```bash
# Check code style
composer check-style

# Fix code style
composer fix-style
```

### Writing Tests

All new features should include tests:

```php
<?php

namespace Tests\Feature;

use PHPUnit\Framework\TestCase;

class ExampleTest extends TestCase
{
    public function test_example_feature()
    {
        $result = someFunction();

        $this->assertEquals('expected', $result);
    }
}
```

Run tests:

```bash
# Run all tests
composer test

# Run specific test
./vendor/bin/phpunit tests/Feature/ExampleTest.php

# Run with coverage
composer test-coverage
```

### Documentation

Update relevant documentation:

- Code comments (PHPDoc)
- README files
- User guides in `/docs`
- CHANGELOG.md

## Pull Request Process

### 1. Ensure Quality

Before submitting:

```bash
# Run tests
composer test

# Check code style
composer check-style

# Fix code style issues
composer fix-style

# Run static analysis (if available)
composer analyze
```

### 2. Commit Your Changes

Write clear, descriptive commit messages:

```bash
# Good commit messages
git commit -m "Add user authentication feature"
git commit -m "Fix cache invalidation bug in Redis driver"
git commit -m "Update database migration documentation"

# Bad commit messages
git commit -m "Fix stuff"
git commit -m "WIP"
git commit -m "Updates"
```

Follow conventional commits format:

```
type(scope): subject

body

footer
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
feat(auth): add JWT token refresh endpoint

Implement token refresh functionality to allow users to renew
their authentication tokens without re-logging in.

Closes #123
```

### 3. Push Changes

```bash
git push origin feature/your-feature-name
```

### 4. Create Pull Request

- Go to GitHub and create a pull request
- Fill out the PR template completely
- Reference any related issues
- Provide clear description of changes
- Add screenshots/examples if applicable

### 5. Code Review

- Respond to feedback promptly
- Make requested changes
- Push updates to the same branch
- Be open to suggestions

## Reporting Bugs

### Before Reporting

- Check existing issues
- Try latest version
- Reproduce the issue
- Gather debug information

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Actual behavior**
What actually happened.

**Environment:**
- Glueful version: [e.g. 1.0.0]
- PHP version: [e.g. 8.2.0]
- Database: [e.g. MySQL 8.0]
- OS: [e.g. Ubuntu 22.04]

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

```bash
# Clone repository
git clone https://github.com/glueful/glueful.git
cd glueful

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Configure database
# Edit .env with your settings

# Run migrations
php glueful migrate:run

# Start dev server
php glueful serve
```

### Running Documentation Locally

```bash
cd docs
npm install
npm run dev
```

## Coding Standards

### PSR Standards

- Follow PSR-12 for coding style
- Follow PSR-4 for autoloading
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
if (!$user) {
    throw new UserNotFoundException("User {$id} not found");
}

// ❌ Bad - generic exception
if (!$user) {
    throw new Exception("Error");
}
```

**3. Dependency Injection**

```php
// ✅ Good - constructor injection
public function __construct(
    private UserRepository $users,
    private EmailService $email
) {}

// ❌ Bad - static calls
public function process()
{
    $users = UserRepository::getInstance();
}
```

## Testing Guidelines

### Test Coverage

Aim for:
- 80%+ code coverage
- All public methods tested
- Edge cases covered
- Error conditions tested

### Test Organization

```
tests/
├── Unit/           # Unit tests
├── Feature/        # Feature/integration tests
└── TestCase.php    # Base test class
```

### Writing Good Tests

```php
// ✅ Good - clear, focused test
public function test_creates_user_with_valid_data()
{
    $data = ['name' => 'John', 'email' => 'john@example.com'];

    $user = $this->userService->create($data);

    $this->assertNotNull($user->id);
    $this->assertEquals('John', $user->name);
}

// ❌ Bad - tests multiple things
public function test_user_service()
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
 * @param  array  $data  User registration data
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
- Include code examples
- Add links to related docs
- Keep it concise
- Test code samples

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

Contributors are recognized in:
- CONTRIBUTORS.md
- Release notes
- GitHub contributors page

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

## Questions?

- 📧 Email: contributors@glueful.com
- 💬 Discord: [Join our server](https://discord.gg/glueful)
- 🐛 Issues: [GitHub Issues](https://github.com/glueful/glueful/issues)

Thank you for contributing to Glueful! 🎉
