---
title: CLI Reference
description: Complete Glueful command-line interface reference
---

Complete reference for all Glueful CLI commands.

## Getting Started

```bash
# List all commands (installed via Composer)
 php glueful

# Get help for a command
 php glueful help <command>

# List commands by namespace
 php glueful list extensions
 php glueful list security
 php glueful list system
```

## Database & Migrations

### migrate:run
Run pending migrations

```bash
 php glueful migrate:run
 php glueful migrate:run --force   # Skip confirmation in production
 php glueful migrate:run --dry-run # Show operations without running
```

### migrate:rollback
Rollback the last migration batch

```bash
 php glueful migrate:rollback
 php glueful migrate:rollback --steps=2   # Rollback N steps
 php glueful migrate:rollback --dry-run   # Preview rollbacks
```

### migrate:status
Show migration status

```bash
 php glueful migrate:status
```

### migrate:create
Create a new migration

```bash
 php glueful migrate:create CreateUsersTable
```

### db:reset
Drop all tables (use with care)

```bash
 php glueful db:reset
 php glueful db:reset --dry-run  # Preview tables to be dropped
 php glueful db:reset --force    # Skip confirmations
```

### db:status
Show database status and connectivity

```bash
 php glueful db:status
```

### db:profile
Profile slow queries and database health

```bash
 php glueful db:profile
```

## Queue & Jobs

### queue:work
Start and manage workers (multi-worker)

```bash
# Default (2 workers on 'default' queue)
 php glueful queue:work

# Queues and worker count
 php glueful queue:work --queue=emails,reports --workers=4

# Limits and behavior
 php glueful queue:work --memory=256 --timeout=90 --max-jobs=1000 --stop-when-empty

# Other actions
 php glueful queue:work status --json
 php glueful queue:work spawn --count=2 --queue=emails
 php glueful queue:work restart --all
```

### queue:autoscale
Auto-scale workers with monitoring and scheduling

```bash
 php glueful queue:autoscale               # Run autoscaler
 php glueful queue:autoscale status --json # Show status as JSON
 php glueful queue:autoscale config --show --validate
 php glueful queue:autoscale schedule --list --preview --days=7
```

### queue:scheduler
Advanced job scheduling and management system

```bash
# Run the scheduler
 php glueful queue:scheduler
```

## Cache

### cache:clear
Clear application cache

```bash
 php glueful cache:clear
```

### cache:delete
Remove specific cache key

```bash
 php glueful cache:delete users:active
```

### cache:get
Get cache value

```bash
 php glueful cache:get users:active
```

### cache:set
Set cache value

```bash
 php glueful cache:set users:active '{"ids":[1,2,3]}' --ttl=3600
```

### cache:ttl
Show TTL for a key

```bash
 php glueful cache:ttl users:active
```

### cache:expire
Expire a key in N seconds

```bash
 php glueful cache:expire users:active 120
```

### cache:status
Show cache driver status and capabilities

```bash
 php glueful cache:status
```

### cache:purge
Clear all cache entries (driver-specific)

```bash
 php glueful cache:purge
```

### cache:maintenance
Run or queue cache maintenance tasks

```bash
 php glueful cache:maintenance
```

## Development Server

### serve
Start development server

```bash
# Default: localhost:8000
 php glueful serve

# Custom host and port
 php glueful serve --host=0.0.0.0 --port=9000

# Open in browser
 php glueful serve --open
```

## Code Generation

### generate:controller
Generate a REST API controller from template

```bash
 php glueful generate:controller UserController
 php glueful generate:controller Api/UserController  # Nested
```

### generate:key
Generate secure encryption keys for the framework

```bash
 php glueful generate:key
```

### generate:api-definitions
Generate OpenAPI/route definitions

```bash
 php glueful generate:api-definitions
```

### event:create
Create a new event class

```bash
 php glueful event:create UserRegistered
```

### event:listener
Create a new event listener class

```bash
 php glueful event:listener SendWelcomeEmail
```

### create:extension
Create new local extension

```bash
 php glueful create:extension MyExtension
```

## Extensions

```bash
 php glueful extensions:list
 php glueful extensions:info <slug>
 php glueful extensions:enable <slug>
 php glueful extensions:disable <slug>
 php glueful extensions:cache
 php glueful extensions:clear
 php glueful extensions:summary
 php glueful extensions:why <Provider\Class>
```

## System

```bash
 php glueful install
 php glueful system:check
 php glueful system:production
 php glueful system:memory
 php glueful version
```

## Container (DI)

```bash
 php glueful di:container:debug
 php glueful di:container:compile
 php glueful di:container:validate
 php glueful di:lazy:status
```

## Security

```bash
 php glueful security:check
 php glueful security:scan
 php glueful security:vulnerabilities
 php glueful security:lockdown
 php glueful security:reset-password --email=user@example.com
 php glueful security:report
 php glueful security:revoke-tokens --all
```

## Inspection & Debugging

### route:list
List all registered routes

```bash
php glueful route:list

# Filter by method
php glueful route:list --method=POST

# Filter by path
php glueful route:list --path=/api/users
```

### config:show
Display configuration values

```bash
# Show all config
php glueful config:show

# Show specific config
php glueful config:show database
```

### env:check
Validate .env configuration

```bash
php glueful env:check
```

## Maintenance

### down
Put application in maintenance mode

```bash
php glueful down
php glueful down --message="Scheduled maintenance"
```

### up
Bring application out of maintenance mode

```bash
php glueful up
```

### optimize
Optimize the framework for better performance

```bash
php glueful optimize
```

## Security

### security:check
Check security configuration and show issues

```bash
php glueful security:check
```

### security:lockdown
Manage emergency security lockdown mode

```bash
php glueful security:lockdown
```

### security:scan
Scan for security vulnerabilities

```bash
php glueful security:scan
```

### security:vulnerabilities
Check for known vulnerabilities in dependencies

```bash
php glueful security:vulnerabilities
```

## Extensions

### extensions:list
List discovered extensions with comprehensive status

```bash
php glueful extensions:list
```

### extensions:info
Show detailed extension information

```bash
php glueful extensions:info <slug>
php glueful extensions:info Aegis
```

### extensions:why
Explain why/how a provider was included or excluded

```bash
php glueful extensions:why <provider>
```

### extensions:summary
Show startup summary and diagnostics

```bash
php glueful extensions:summary
```

### extensions:cache
Build extensions cache for production with verification

```bash
php glueful extensions:cache
```

### extensions:clear
Clear extensions cache with optional development reset

```bash
php glueful extensions:clear
```

### extensions:enable
Enable extension (development only)

```bash
php glueful extensions:enable <name>
```

### extensions:disable
Disable extension (development only)

```bash
php glueful extensions:disable <name>
```

## System

### system:check
Validate framework installation and configuration

```bash
php glueful system:check
```

### system:production
Comprehensive production environment configuration and validation

```bash
php glueful system:production
```

## Database

### db:status
Show database connection status and statistics

```bash
php glueful db:status
```

### db:reset
Reset database to clean state (drops all tables)

```bash
php glueful db:reset
```

## Installation

### install
Run installation setup wizard for new Glueful installation

```bash
php glueful install
```

## Creating Custom Commands

### Basic Command

```php
<?php

namespace App\Console\Commands;

use Glueful\Console\BaseCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;

class GreetCommand extends BaseCommand
{
    protected static $defaultName = 'app:greet';
    protected static $defaultDescription = 'Greet a user';

    protected function configure(): void
    {
        $this->addArgument('name', InputArgument::REQUIRED, 'User name');
        $this->addOption('yell', 'y', InputOption::VALUE_NONE, 'Yell the greeting');
    }

    protected function execute($input, $output): int
    {
        $name = $input->getArgument('name');
        $message = "Hello, {$name}!";

        if ($input->getOption('yell')) {
            $message = strtoupper($message);
        }

        $this->success($message);

        return self::SUCCESS;
    }
}
```

### Command with Dependencies

```php
class ProcessUsersCommand extends BaseCommand
{
    protected static $defaultName = 'app:process-users';

    public function __construct(
        private UserRepository $users,
        private EmailService $email
    ) {
        parent::__construct();
    }

    protected function execute($input, $output): int
    {
        $users = $this->users->findActive();

        $this->info("Processing {count($users)} users...");

        $this->progressBar(count($users), function ($bar) use ($users) {
            foreach ($users as $user) {
                $this->processUser($user);
                $bar->advance();
            }
        });

        $this->success('All users processed!');

        return self::SUCCESS;
    }
}
```

### Interactive Command

```php
class SetupCommand extends BaseCommand
{
    protected static $defaultName = 'app:setup';

    protected function execute($input, $output): int
    {
        $this->info('Welcome to setup!');

        $name = $this->ask('Application name');
        $email = $this->ask('Admin email', 'admin@example.com');
        $password = $this->secret('Admin password');

        $env = $this->choice(
            'Environment',
            ['development', 'staging', 'production'],
            'development'
        );

        if (!$this->confirm('Continue with setup?', true)) {
            $this->warning('Setup cancelled');
            return self::FAILURE;
        }

        // Perform setup...

        $this->success('Setup complete!');

        return self::SUCCESS;
    }
}
```

## Helper Methods

All commands extending `BaseCommand` have access to:

### Output Methods
- `success(string $message)` - Success message
- `error(string $message)` - Error message
- `warning(string $message)` - Warning message
- `info(string $message)` - Info message
- `note(string $message)` - Note
- `tip(string $message)` - Tip

### Interactive Methods
- `ask(string $question, $default = null)` - Ask question
- `secret(string $question)` - Ask for password/secret
- `confirm(string $question, bool $default = false)` - Yes/no confirmation
- `choice(string $question, array $choices, $default = null)` - Select from choices

### Display Methods
- `table(array $headers, array $rows)` - Display table
- `progressBar(int $steps, callable $callback)` - Show progress bar

### Safety Methods
- `confirmProduction(string $action)` - Confirm in production

## Exit Codes

- `self::SUCCESS` (0) - Command succeeded
- `self::FAILURE` (1) - Command failed
- `self::INVALID` (2) - Invalid usage

## Best Practices

### 1. Use Descriptive Names

```bash
# ✅ Good
php glueful cache:clear
php glueful queue:work

# ❌ Bad
php glueful cc
php glueful qw
```

### 2. Handle Errors Gracefully

```php
protected function execute($input, $output): int
{
    try {
        $this->processData();
        $this->success('Processing complete');
        return self::SUCCESS;
    } catch (\Exception $e) {
        $this->error($e->getMessage());
        return self::FAILURE;
    }
}
```

### 3. Provide Feedback

```php
$this->info('Starting process...');
// Do work
$this->success('Process complete!');
```

### 4. Use Progress Bars

```php
$this->progressBar(count($items), function ($bar) use ($items) {
    foreach ($items as $item) {
        $this->process($item);
        $bar->advance();
    }
});
```

## Next Steps

- [Creating Commands](guides/cli-and-console) - Detailed guide
- [Queue Workers](features/queues-jobs) - Background jobs
- [Task Scheduler](features/scheduling) - Scheduled tasks
