---
title: Bindings
description: Register services, factories, and singletons
---

# Bindings

How to bind classes, interfaces, and factories in the container.

This guide explains the binding surface: declaring services (autowire vs factory vs value), mapping interfaces to concrete implementations, choosing shared (singleton) vs non-shared semantics, tagging collections, and organizing definitions inside providers. It also covers refactoring, testing overrides, and anti‑patterns.

## Binding Goals
| Goal | Description |
|------|-------------|
| Clarity | Read a definition & instantly know lifecycle and implementation |
| Minimal Boilerplate | Favor autowire for simple classes |
| Explicit Complexity | Use factories only when logic / conditional wiring needed |
| Replaceability | Easy to swap implementations (interface + alias) |
| Testability | Child containers / overrides without side-effects |

## Binding Types Recap
| Kind | Definition Shape | When to Use |
|------|------------------|------------|
| autowire | `ClassName` => autowire | Stateless / simple constructor |
| factory | `id` => closure/container fn | Complex assembly, conditional impl selection |
| value | `id` => raw scalar/array/object | Immutable config, static data |
| alias | `id` => reference to another id | Interface -> concrete, backwards compat |

`shared` flag controls caching (defaults depend on provider conventions—most autowire entries are shared).

## Choosing Shared vs Non-Shared
| Scenario | Recommendation |
|----------|---------------|
| Stateless service | shared |
| Expensive setup (network pools) | shared |
| Holds request-specific context | non-shared or separate context object |
| Maintains internal mutable counters | non-shared or redesign to external store |

## Example Bindings File (Conceptual)
```php
return [
	// Simple autowire (singleton)
	App\Services\Slugger::class => ['autowire' => App\Services\Slugger::class, 'shared' => true],

	// Interface alias
	App\Contracts\Clock::class => ['alias' => App\Support\SystemClock::class],

	// Factory with conditional logic
	'cache.store' => [
		'factory' => function ($c) {
				$cfg = config('cache');
				return $cfg['driver'] === 'redis'
						? new RedisCache($c->get(RedisClient::class))
						: new FilesystemCache($cfg['path']);
		},
		'shared' => true,
	],

	// Non-shared builder
	'report.builder' => [
		'factory' => fn($c) => new ReportBuilder($c->get('cache.store')), 'shared' => false,
	],

	// Value binding
	'feature.flags' => [ 'value' => ['new_ui' => true, 'beta_mode' => false] ],
];
```

## Tagging Collections
Tags let you resolve groups (e.g., `console.commands`). Provider returns definition array entries with a `tags` key or registers tags externally. When collecting, container yields all services tagged accordingly (usually autowired). Use for plugin discovery, pipelines, or CLI command registration.

## Conditional / Environment-Based Bindings
Pattern: use a factory; branch on config or environment variables. Keep logic shallow; offload heavy decision trees to a dedicated selector service. Avoid `if`/`switch` explosion inside providers—extract to a separate resolver class.

## Refactoring to Interfaces
1. Introduce interface implemented by existing concrete.
2. Add alias: `Interface::class => Concrete::class`.
3. Update consumers to depend on interface.
4. Introduce alternative concrete; modify alias OR use factory selecting based on config.
5. Remove direct concrete references from domain code.

## Overriding for Tests
Use a child container: `$test = container()->with([FooInterface::class => new FakeFoo()]);` Keep overrides minimal; prefer explicit fake objects over runtime monkey patching.

## Diagnosing Binding Issues
| Symptom | Likely Cause | Fix |
|--------|--------------|-----|
| Resolution failure (not found) | Missing definition or autowire disabled | Add provider entry or verify class exists |
| Wrong implementation returned | Alias chain misunderstanding | Trace alias -> concrete chain |
| State leakage between tests | Shared binding mutated | Mark as non-shared or reset between tests |
| Performance spike | Expensive factory per resolve | Mark shared or cache expensive parts |

## Migration Checklist (When Changing a Binding)
1. Determine if contract change (interface) vs internal swap.
2. Maintain backwards-compatible alias for one release if ID changes.
3. Update tests to use interface rather than concrete binding IDs.
4. Add observability for new implementation if behavior differs.
5. Document change in CHANGELOG if user-facing.

## Anti-Patterns
| Anti-Pattern | Risk | Alternative |
|--------------|------|------------|
| Registering giant arrays of config as factories | Unnecessary instantiation cost | Use value binding |
| Conditional factories returning different types | Type ambiguity | Interface + separate concretes |
| Injecting container everywhere (service locator) | Hidden deps, hard tests | Constructor injection |
| Over-tagging everything | Noisy graphs | Tag only for iteration set needs |

## Observability
Track binding resolution counts & durations; sudden spikes may indicate an unintended per-request re-resolution of a heavy service. Tag high-impact factories with a purpose label for filtering logs.

---

<!-- container-bindings:reference:start -->
## Binding Summary

| ID | Kind | Shared | Provider |
|----|------|--------|----------|
| Glueful\Console\Commands\Migrate\RunCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Migrate\CreateCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Migrate\StatusCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Migrate\RollbackCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\ServeCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\VersionCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Cache\ClearCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Cache\StatusCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Cache\GetCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Cache\SetCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Cache\DeleteCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Cache\TtlCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Cache\ExpireCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Cache\PurgeCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Cache\MaintenanceCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Database\StatusCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Database\ResetCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Database\ProfileCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Generate\ControllerCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Generate\ApiDefinitionsCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Generate\KeyCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Extensions\InfoCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Extensions\EnableCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Extensions\DisableCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Extensions\CreateCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Extensions\ListCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Extensions\SummaryCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Extensions\CacheCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Extensions\ClearCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Extensions\WhyCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\InstallCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\System\CheckCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\System\ProductionCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\System\MemoryMonitorCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Security\CheckCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Security\VulnerabilityCheckCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Security\LockdownCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Security\ResetPasswordCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Security\ReportCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Security\RevokeTokensCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Security\ScanCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Notifications\ProcessRetriesCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Queue\WorkCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Queue\AutoScaleCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Queue\SchedulerCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Archive\ManageCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Container\ContainerDebugCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Container\ContainerCompileCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Container\ContainerValidateCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Container\LazyStatusCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Fields\AnalyzeCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Fields\ValidateCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Fields\PerformanceCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Console\Commands\Fields\WhitelistCheckCommand | autowire | yes | Glueful\Container\Providers\ConsoleProvider |
| Glueful\Controllers\AuthController | autowire | yes | Glueful\Container\Providers\ControllerProvider |
| Glueful\Controllers\ConfigController | autowire | yes | Glueful\Container\Providers\ControllerProvider |
| Glueful\Controllers\ResourceController | autowire | yes | Glueful\Container\Providers\ControllerProvider |
| Glueful\Controllers\MetricsController | autowire | yes | Glueful\Container\Providers\ControllerProvider |
| Glueful\Controllers\HealthController | autowire | yes | Glueful\Container\Providers\ControllerProvider |
| Glueful\Controllers\ExtensionsController | autowire | yes | Glueful\Container\Providers\ControllerProvider |
| logger | factory | yes | Glueful\Container\Providers\CoreProvider |
| Psr\Log\LoggerInterface | alias | no | Glueful\Container\Providers\CoreProvider |
| cache.store | factory | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Cache\CacheStore | alias | no | Glueful\Container\Providers\CoreProvider |
| database | factory | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Database\QueryBuilder | factory | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Database\Schema\Interfaces\SchemaBuilderInterface | factory | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Security\RandomStringGenerator | autowire | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Auth\TokenManager | factory | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Auth\AuthenticationManager | autowire | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Auth\AuthenticationGuard | factory | yes | Glueful\Container\Providers\CoreProvider |
| request | factory | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Permissions\Gate | factory | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Permissions\PolicyRegistry | factory | yes | Glueful\Container\Providers\CoreProvider |
| permission.manager | factory | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Permissions\PermissionCache | autowire | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Http\RequestUserContext | factory | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Auth\SessionCacheManager | autowire | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Auth\SessionAnalytics | autowire | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Auth\AuthenticationService | factory | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Auth\TokenStorageService | factory | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Performance\MemoryManager | autowire | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Services\ApiMetricsService | autowire | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Services\HealthService | autowire | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Security\SecurityManager | autowire | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Cache\CacheWarmupService | autowire | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Cache\DistributedCacheService | factory | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Cache\EdgeCacheService | autowire | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Database\QueryCacheService | autowire | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Database\Migrations\MigrationManager | autowire | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Support\FieldSelection\Projector | factory | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Routing\Middleware\FieldSelectionMiddleware | autowire | yes | Glueful\Container\Providers\CoreProvider |
| field_selection | factory | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Routing\RouteCache | autowire | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Routing\RouteCompiler | autowire | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Routing\Router | factory | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Routing\AttributeRouteLoader | factory | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Observability\Tracing\NoopTracer | autowire | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Observability\Tracing\TracerInterface | alias | no | Glueful\Container\Providers\CoreProvider |
| Glueful\Routing\Middleware\AuthMiddleware | autowire | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Routing\Middleware\RateLimiterMiddleware | autowire | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Routing\Middleware\CSRFMiddleware | autowire | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Routing\Middleware\SecurityHeadersMiddleware | autowire | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Routing\Middleware\AllowIpMiddleware | autowire | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Routing\Middleware\AdminPermissionMiddleware | autowire | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Routing\Middleware\RequestResponseLoggingMiddleware | autowire | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Routing\Middleware\TracingMiddleware | autowire | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Routing\Middleware\MetricsMiddleware | autowire | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Routing\Middleware\LockdownMiddleware | autowire | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Permissions\Middleware\GateAttributeMiddleware | factory | yes | Glueful\Container\Providers\CoreProvider |
| Glueful\Permissions\Middleware\AuthToRequestAttributesMiddleware | factory | yes | Glueful\Container\Providers\CoreProvider |
| auth | alias | no | Glueful\Container\Providers\CoreProvider |
| rate_limit | alias | no | Glueful\Container\Providers\CoreProvider |
| csrf | alias | no | Glueful\Container\Providers\CoreProvider |
| security_headers | alias | no | Glueful\Container\Providers\CoreProvider |
| admin | alias | no | Glueful\Container\Providers\CoreProvider |
| request_logging | alias | no | Glueful\Container\Providers\CoreProvider |
| lockdown | alias | no | Glueful\Container\Providers\CoreProvider |
| allow_ip | alias | no | Glueful\Container\Providers\CoreProvider |
| metrics | alias | no | Glueful\Container\Providers\CoreProvider |
| tracing | alias | no | Glueful\Container\Providers\CoreProvider |
| gate_permissions | alias | no | Glueful\Container\Providers\CoreProvider |
| auth_to_request | alias | no | Glueful\Container\Providers\CoreProvider |
| Glueful\Extensions\ExtensionMetadataRegistry | autowire | yes | Glueful\Container\Providers\ExtensionProvider |
| Glueful\Extensions\PackageManifest | autowire | yes | Glueful\Container\Providers\ExtensionProvider |
| extension.manager | factory | yes | Glueful\Container\Providers\ExtensionProvider |
| Glueful\Extensions\ExtensionManager | alias | no | Glueful\Container\Providers\ExtensionProvider |
| extensions | alias | no | Glueful\Container\Providers\ExtensionProvider |
| Glueful\Services\FileFinder | factory | yes | Glueful\Container\Providers\FileProvider |
| file.finder | alias | no | Glueful\Container\Providers\FileProvider |
| Intervention\Image\ImageManager | factory | yes | Glueful\Container\Providers\ImageProvider |
| Glueful\Services\ImageSecurityValidator | factory | yes | Glueful\Container\Providers\ImageProvider |
| Glueful\Services\ImageProcessorInterface | factory | yes | Glueful\Container\Providers\ImageProvider |
| Glueful\Services\ImageProcessor | alias | no | Glueful\Container\Providers\ImageProvider |
| lazy.background.ids | value | yes | Glueful\Container\Providers\LazyProvider |
| lazy.request_time.ids | value | yes | Glueful\Container\Providers\LazyProvider |
| Glueful\Container\Support\LazyInitializer | factory | yes | Glueful\Container\Providers\LazyProvider |
| lazy.initializer | alias | no | Glueful\Container\Providers\LazyProvider |
| Glueful\Lock\LockManagerInterface | factory | yes | Glueful\Container\Providers\LockProvider |
| lock | alias | no | Glueful\Container\Providers\LockProvider |
| Glueful\Repository\RepositoryFactory | factory | yes | Glueful\Container\Providers\RepositoryProvider |
| Glueful\Repository\UserRepository | factory | yes | Glueful\Container\Providers\RepositoryProvider |
| Glueful\Repository\ResourceRepository | factory | yes | Glueful\Container\Providers\RepositoryProvider |
| Glueful\Repository\NotificationRepository | factory | yes | Glueful\Container\Providers\RepositoryProvider |
| Glueful\Repository\BlobRepository | factory | yes | Glueful\Container\Providers\RepositoryProvider |
| repository | alias | no | Glueful\Container\Providers\RepositoryProvider |
| repository.user | alias | no | Glueful\Container\Providers\RepositoryProvider |
| repository.resource | alias | no | Glueful\Container\Providers\RepositoryProvider |
| repository.notification | alias | no | Glueful\Container\Providers\RepositoryProvider |
| repository.blob | alias | no | Glueful\Container\Providers\RepositoryProvider |
| Symfony\Component\HttpFoundation\Request | factory | yes | Glueful\Container\Providers\RequestProvider |
| Psr\Http\Message\ServerRequestInterface | factory | yes | Glueful\Container\Providers\RequestProvider |
| Glueful\Http\RequestContext | factory | yes | Glueful\Container\Providers\RequestProvider |
| Glueful\Http\SessionContext | autowire | yes | Glueful\Container\Providers\RequestProvider |
| Glueful\Http\EnvironmentContext | autowire | yes | Glueful\Container\Providers\RequestProvider |
| Glueful\Helpers\StaticFileDetector | factory | yes | Glueful\Container\Providers\SpaProvider |
| Glueful\Extensions\SpaManager | factory | yes | Glueful\Container\Providers\SpaProvider |
| Glueful\Storage\PathGuard | factory | yes | Glueful\Container\Providers\StorageProvider |
| Glueful\Storage\StorageManager | factory | yes | Glueful\Container\Providers\StorageProvider |
| Glueful\Storage\Support\UrlGenerator | factory | yes | Glueful\Container\Providers\StorageProvider |
| storage | alias | no | Glueful\Container\Providers\StorageProvider |

<!-- container-bindings:reference:end -->
