---
title: Core Types
description: Core framework symbols (classes, interfaces, traits, enums)
navigation:
  icon: i-lucide-layers
---

# Core Types Reference

Summary of foundational framework symbols.

<!-- GENERATED:core-types -->
Generated 597 symbols across 37 groups (2 internal, 1 deprecated).

### application

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|Application|class|Application class - handles HTTP requests|Glueful|Application.php|

### auth

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|ApiKeyAuthenticationProvider|class|API Key Authentication Provider|Glueful\Auth|Auth/ApiKeyAuthenticationProvider.php|
|AuthBootstrap|class|Authentication Bootstrapper|Glueful\Auth|Auth/AuthBootstrap.php|
|AuthenticationGuard|class|Laravel-style authentication guard wrapper|Glueful\Auth|Auth/AuthenticationGuard.php|
|AuthenticationManager|class|Authentication Manager|Glueful\Auth|Auth/AuthenticationManager.php|
|AuthenticationProviderInterface|interface|Authentication Provider Interface|Glueful\Auth\Interfaces|Auth/Interfaces/AuthenticationProviderInterface.php|
|AuthenticationService|class|Authentication Service|Glueful\Auth|Auth/AuthenticationService.php|
|JWTService|class|JWT (JSON Web Token) Service|Glueful\Auth|Auth/JWTService.php|
|JwtAuthenticationProvider|class|JWT Authentication Provider|Glueful\Auth|Auth/JwtAuthenticationProvider.php|
|PasswordHasher|class|Password Hashing and Verification Service|Glueful\Auth|Auth/PasswordHasher.php|
|RequiresPermission|class|-|Glueful\Auth\Attributes|Auth/Attributes/RequiresPermission.php|
|RequiresRole|class|-|Glueful\Auth\Attributes|Auth/Attributes/RequiresRole.php|
|SessionAnalytics|class|Session Analytics and Metrics System|Glueful\Auth|Auth/SessionAnalytics.php|
|SessionCacheManager|class|Session Cache Management System|Glueful\Auth|Auth/SessionCacheManager.php|
|SessionQueryBuilder|class|Session Query Builder|Glueful\Auth|Auth/SessionQueryBuilder.php|
|SessionTransaction|class|Session Transaction Manager|Glueful\Auth|Auth/SessionTransaction.php|
|TokenManager|class|Token Management System|Glueful\Auth|Auth/TokenManager.php|
|TokenStorageInterface|interface|Token Storage Interface|Glueful\Auth\Interfaces|Auth/Interfaces/TokenStorageInterface.php|
|TokenStorageService|class|Token Storage Service|Glueful\Auth|Auth/TokenStorageService.php|
|UserIdentity|class|Lightweight user identity for permission voters/policies|Glueful\Auth|Auth/UserIdentity.php|

### bootstrap

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|BootProfiler|class|-|Glueful\Bootstrap|Bootstrap/BootProfiler.php|
|ConfigurationCache|class|-|Glueful\Bootstrap|Bootstrap/ConfigurationCache.php|
|ConfigurationLoader|class|-|Glueful\Bootstrap|Bootstrap/ConfigurationLoader.php|

### cache

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|AbstractCDNAdapter|class|Abstract base class for CDN Adapters|Glueful\Cache\CDN|Cache/CDN/AbstractCDNAdapter.php|
|ArrayCacheDriver|class|Array-based cache driver for testing|Glueful\Cache\Drivers|Cache/Drivers/ArrayCacheDriver.php|
|CDNAdapterInterface|interface|Interface for CDN Adapter implementations|Glueful\Cache\CDN|Cache/CDN/CDNAdapterInterface.php|
|CacheDriverInterface|interface|Cache Driver Interface|Glueful\Cache\Drivers|Cache/Drivers/CacheDriverInterface.php|
|CacheFactory|class|Cache Factory|Glueful\Cache|Cache/CacheFactory.php|
|CacheInvalidationService|class|-|Glueful\Cache|Cache/CacheInvalidationService.php|
|CacheNode|class|Cache Node|Glueful\Cache\Nodes|Cache/Nodes/CacheNode.php|
|CacheNodeManager|class|Cache Node Manager|Glueful\Cache\Nodes|Cache/Nodes/CacheNodeManager.php|
|CacheStore|interface|Cache Store Interface|Glueful\Cache|Cache/CacheStore.php|
|CacheTaggingService|class|-|Glueful\Cache|Cache/CacheTaggingService.php|
|CacheWarmupService (internal)|class|Cache Warmup Service|Glueful\Cache|Cache/CacheWarmupService.php|
|CircuitBreaker|class|Circuit Breaker|Glueful\Cache\Health|Cache/Health/CircuitBreaker.php|
|ConsistentHashingStrategy|class|Consistent Hashing Replication Strategy|Glueful\Cache\Replication|Cache/Replication/ConsistentHashingStrategy.php|
|DistributedCacheService|class|Distributed Cache Service|Glueful\Cache|Cache/DistributedCacheService.php|
|EdgeCacheService|class|Service for edge caching functionality|Glueful\Cache|Cache/EdgeCacheService.php|
|FailoverManager|class|Failover Manager|Glueful\Cache\Health|Cache/Health/FailoverManager.php|
|FileCacheDriver|class|File Cache Driver|Glueful\Cache\Drivers|Cache/Drivers/FileCacheDriver.php|
|FileNode|class|File Node|Glueful\Cache\Nodes|Cache/Nodes/FileNode.php|
|FullReplicationStrategy|class|Full Replication Strategy|Glueful\Cache\Replication|Cache/Replication/FullReplicationStrategy.php|
|HealthMonitoringService|class|Health Monitoring Service|Glueful\Cache\Health|Cache/Health/HealthMonitoringService.php|
|KeyPatternShardingStrategy|class|Sharded by Key Pattern Strategy|Glueful\Cache\Replication|Cache/Replication/KeyPatternShardingStrategy.php|
|MemcachedCacheDriver|class|Memcached Cache Driver|Glueful\Cache\Drivers|Cache/Drivers/MemcachedCacheDriver.php|
|MemcachedNode|class|Memcached Node|Glueful\Cache\Nodes|Cache/Nodes/MemcachedNode.php|
|NodeHealthChecker|class|Node Health Checker|Glueful\Cache\Health|Cache/Health/NodeHealthChecker.php|
|PrimaryReplicaStrategy|class|Primary-Replica Replication Strategy|Glueful\Cache\Replication|Cache/Replication/PrimaryReplicaStrategy.php|
|RecoveryManager|class|Recovery Manager|Glueful\Cache\Health|Cache/Health/RecoveryManager.php|
|RedisCacheDriver|class|Redis Cache Driver|Glueful\Cache\Drivers|Cache/Drivers/RedisCacheDriver.php|
|RedisNode|class|Redis Node|Glueful\Cache\Nodes|Cache/Nodes/RedisNode.php|
|ReplicationStrategyFactory|class|Replication Strategy Factory|Glueful\Cache\Replication|Cache/Replication/ReplicationStrategyFactory.php|
|ReplicationStrategyInterface|interface|Replication Strategy Interface|Glueful\Cache\Replication|Cache/Replication/ReplicationStrategyInterface.php|

### console

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|AnalyzeCommand|class|-|Glueful\Console\Commands\Fields|Console/Commands/Fields/AnalyzeCommand.php|
|ApiDefinitionsCommand|class|-|Glueful\Console\Commands\Generate|Console/Commands/Generate/ApiDefinitionsCommand.php|
|Application|class|Glueful Symfony Console Application|Glueful\Console|Console/Application.php|
|AutoScaleCommand|class|-|Glueful\Console\Commands\Queue|Console/Commands/Queue/AutoScaleCommand.php|
|BaseCommand|class|Glueful Console Command Base Class|Glueful\Console|Console/BaseCommand.php|
|BaseQueueCommand|class|Base Queue Command|Glueful\Console\Commands\Queue|Console/Commands/Queue/BaseQueueCommand.php|
|BaseSecurityCommand|class|Base Security Command|Glueful\Console\Commands\Security|Console/Commands/Security/BaseSecurityCommand.php|
|CacheCommand|class|-|Glueful\Console\Commands\Extensions|Console/Commands/Extensions/CacheCommand.php|
|CheckCommand|class|-|Glueful\Console\Commands\Security|Console/Commands/Security/CheckCommand.php|
|CheckCommand|class|-|Glueful\Console\Commands\System|Console/Commands/System/CheckCommand.php|
|ClearCommand|class|-|Glueful\Console\Commands\Cache|Console/Commands/Cache/ClearCommand.php|
|ClearCommand|class|-|Glueful\Console\Commands\Extensions|Console/Commands/Extensions/ClearCommand.php|
|ContainerCompileCommand|class|-|Glueful\Console\Commands\Container|Console/Commands/Container/ContainerCompileCommand.php|
|ContainerDebugCommand|class|-|Glueful\Console\Commands\Container|Console/Commands/Container/ContainerDebugCommand.php|
|ContainerValidateCommand|class|-|Glueful\Console\Commands\Container|Console/Commands/Container/ContainerValidateCommand.php|
|ControllerCommand|class|-|Glueful\Console\Commands\Generate|Console/Commands/Generate/ControllerCommand.php|
|CreateCommand|class|-|Glueful\Console\Commands\Extensions|Console/Commands/Extensions/CreateCommand.php|
|CreateCommand|class|-|Glueful\Console\Commands\Migrate|Console/Commands/Migrate/CreateCommand.php|
|CreateEventCommand|class|-|Glueful\Console\Commands\Event|Console/Commands/Event/CreateEventCommand.php|
|CreateListenerCommand|class|-|Glueful\Console\Commands\Event|Console/Commands/Event/CreateListenerCommand.php|
|DeleteCommand|class|-|Glueful\Console\Commands\Cache|Console/Commands/Cache/DeleteCommand.php|
|DisableCommand|class|-|Glueful\Console\Commands\Extensions|Console/Commands/Extensions/DisableCommand.php|
|EnableCommand|class|-|Glueful\Console\Commands\Extensions|Console/Commands/Extensions/EnableCommand.php|
|ExpireCommand|class|-|Glueful\Console\Commands\Cache|Console/Commands/Cache/ExpireCommand.php|
|GetCommand|class|-|Glueful\Console\Commands\Cache|Console/Commands/Cache/GetCommand.php|
|InfoCommand|class|-|Glueful\Console\Commands\Extensions|Console/Commands/Extensions/InfoCommand.php|
|InstallCommand|class|-|Glueful\Console\Commands|Console/Commands/InstallCommand.php|
|KeyCommand|class|-|Glueful\Console\Commands\Generate|Console/Commands/Generate/KeyCommand.php|
|LazyStatusCommand|class|-|Glueful\Console\Commands\Container|Console/Commands/Container/LazyStatusCommand.php|
|ListCommand|class|-|Glueful\Console\Commands\Extensions|Console/Commands/Extensions/ListCommand.php|
|LockdownCommand|class|-|Glueful\Console\Commands\Security|Console/Commands/Security/LockdownCommand.php|
|MaintenanceCommand|class|-|Glueful\Console\Commands\Cache|Console/Commands/Cache/MaintenanceCommand.php|
|ManageCommand|class|-|Glueful\Console\Commands\Archive|Console/Commands/Archive/ManageCommand.php|
|MemoryMonitorCommand|class|-|Glueful\Console\Commands\System|Console/Commands/System/MemoryMonitorCommand.php|
|PerformanceCommand|class|-|Glueful\Console\Commands\Fields|Console/Commands/Fields/PerformanceCommand.php|
|ProcessRetriesCommand|class|-|Glueful\Console\Commands\Notifications|Console/Commands/Notifications/ProcessRetriesCommand.php|
|ProductionCommand|class|-|Glueful\Console\Commands\System|Console/Commands/System/ProductionCommand.php|
|ProfileCommand|class|-|Glueful\Console\Commands\Database|Console/Commands/Database/ProfileCommand.php|
|PurgeCommand|class|-|Glueful\Console\Commands\Cache|Console/Commands/Cache/PurgeCommand.php|
|ReportCommand|class|-|Glueful\Console\Commands\Security|Console/Commands/Security/ReportCommand.php|
|ResetCommand|class|-|Glueful\Console\Commands\Database|Console/Commands/Database/ResetCommand.php|
|ResetPasswordCommand|class|-|Glueful\Console\Commands\Security|Console/Commands/Security/ResetPasswordCommand.php|
|RevokeTokensCommand|class|-|Glueful\Console\Commands\Security|Console/Commands/Security/RevokeTokensCommand.php|
|RollbackCommand|class|-|Glueful\Console\Commands\Migrate|Console/Commands/Migrate/RollbackCommand.php|
|RunCommand|class|-|Glueful\Console\Commands\Migrate|Console/Commands/Migrate/RunCommand.php|
|ScanCommand|class|-|Glueful\Console\Commands\Security|Console/Commands/Security/ScanCommand.php|
|SchedulerCommand|class|-|Glueful\Console\Commands\Queue|Console/Commands/Queue/SchedulerCommand.php|
|ServeCommand|class|-|Glueful\Console\Commands|Console/Commands/ServeCommand.php|
|SetCommand|class|-|Glueful\Console\Commands\Cache|Console/Commands/Cache/SetCommand.php|
|StatusCommand|class|-|Glueful\Console\Commands\Database|Console/Commands/Database/StatusCommand.php|
|StatusCommand|class|-|Glueful\Console\Commands\Cache|Console/Commands/Cache/StatusCommand.php|
|StatusCommand|class|-|Glueful\Console\Commands\Migrate|Console/Commands/Migrate/StatusCommand.php|
|SummaryCommand|class|-|Glueful\Console\Commands\Extensions|Console/Commands/Extensions/SummaryCommand.php|
|TtlCommand|class|-|Glueful\Console\Commands\Cache|Console/Commands/Cache/TtlCommand.php|
|ValidateCommand|class|-|Glueful\Console\Commands\Fields|Console/Commands/Fields/ValidateCommand.php|
|VersionCommand|class|-|Glueful\Console\Commands|Console/Commands/VersionCommand.php|
|VulnerabilityCheckCommand|class|-|Glueful\Console\Commands\Security|Console/Commands/Security/VulnerabilityCheckCommand.php|
|WhitelistCheckCommand|class|-|Glueful\Console\Commands\Fields|Console/Commands/Fields/WhitelistCheckCommand.php|
|WhyCommand|class|-|Glueful\Console\Commands\Extensions|Console/Commands/Extensions/WhyCommand.php|
|WorkCommand|class|-|Glueful\Console\Commands\Queue|Console/Commands/Queue/WorkCommand.php|

### constants

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|ErrorCodes|class|Error Codes|Glueful\Constants|Constants/ErrorCodes.php|

### container

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|AliasDefinition|class|-|Glueful\Container\Definition|Container/Definition/AliasDefinition.php|
|AutowireDefinition|class|-|Glueful\Container\Autowire|Container/Autowire/AutowireDefinition.php|
|BaseServiceProvider|class|-|Glueful\Container\Providers|Container/Providers/BaseServiceProvider.php|
|ConsoleProvider|class|-|Glueful\Container\Providers|Container/Providers/ConsoleProvider.php|
|Container|class|-|Glueful\Container|Container/Container.php|
|ContainerCompiler|class|-|Glueful\Container\Compile|Container/Compile/ContainerCompiler.php|
|ContainerException|class|-|Glueful\Container\Exception|Container/Exception/ContainerException.php|
|ContainerFactory|class|-|Glueful\Container\Bootstrap|Container/Bootstrap/ContainerFactory.php|
|ControllerProvider|class|-|Glueful\Container\Providers|Container/Providers/ControllerProvider.php|
|CoreProvider|class|-|Glueful\Container\Providers|Container/Providers/CoreProvider.php|
|DefaultServicesLoader|class|-|Glueful\Container\Loader|Container/Loader/DefaultServicesLoader.php|
|DefinitionInterface|interface|-|Glueful\Container\Definition|Container/Definition/DefinitionInterface.php|
|ExtensionProvider|class|-|Glueful\Container\Providers|Container/Providers/ExtensionProvider.php|
|FactoryDefinition|class|-|Glueful\Container\Definition|Container/Definition/FactoryDefinition.php|
|FileProvider|class|-|Glueful\Container\Providers|Container/Providers/FileProvider.php|
|HttpPsr15Provider|class|-|Glueful\Container\Providers|Container/Providers/HttpPsr15Provider.php|
|ImageProvider|class|-|Glueful\Container\Providers|Container/Providers/ImageProvider.php|
|Inject|class|-|Glueful\Container\Autowire|Container/Autowire/Inject.php|
|LazyInitializer|class|-|Glueful\Container\Support|Container/Support/LazyInitializer.php|
|LazyProvider|class|-|Glueful\Container\Providers|Container/Providers/LazyProvider.php|
|LockProvider|class|-|Glueful\Container\Providers|Container/Providers/LockProvider.php|
|NotFoundException|class|-|Glueful\Container\Exception|Container/Exception/NotFoundException.php|
|ParamBag|class|-|Glueful\Container\Support|Container/Support/ParamBag.php|
|ReflectionResolver|class|-|Glueful\Container\Autowire|Container/Autowire/ReflectionResolver.php|
|RepositoryProvider|class|-|Glueful\Container\Providers|Container/Providers/RepositoryProvider.php|
|RequestProvider|class|-|Glueful\Container\Providers|Container/Providers/RequestProvider.php|
|ServicesLoader|interface|-|Glueful\Container\Loader|Container/Loader/ServicesLoader.php|
|SpaProvider|class|-|Glueful\Container\Providers|Container/Providers/SpaProvider.php|
|StorageProvider|class|-|Glueful\Container\Providers|Container/Providers/StorageProvider.php|
|TagCollector|class|-|Glueful\Container\Providers|Container/Providers/TagCollector.php|
|TaggedIteratorDefinition|class|-|Glueful\Container\Definition|Container/Definition/TaggedIteratorDefinition.php|
|ValueDefinition|class|-|Glueful\Container\Definition|Container/Definition/ValueDefinition.php|
|VarDumperProvider|class|-|Glueful\Container\Providers|Container/Providers/VarDumperProvider.php|

### controllers

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|AuthController|class|Authentication Controller|Glueful\Controllers|Controllers/AuthController.php|
|AuthorizationTrait|trait|Authorization Trait|Glueful\Controllers\Traits|Controllers/Traits/AuthorizationTrait.php|
|BaseController|class|Base Controller|Glueful\Controllers|Controllers/BaseController.php|
|BulkOperationsTrait|trait|BulkOperationsTrait|Glueful\Controllers\Traits|Controllers/Traits/BulkOperationsTrait.php|
|CachedUserContextTrait|trait|Cached User Context Trait|Glueful\Controllers\Traits|Controllers/Traits/CachedUserContextTrait.php|
|ConfigController|class|-|Glueful\Controllers|Controllers/ConfigController.php|
|ExtensionsController|class|Simplified read-only Extensions API|Glueful\Controllers|Controllers/ExtensionsController.php|
|FieldLevelPermissionsTrait|trait|FieldLevelPermissionsTrait|Glueful\Controllers\Traits|Controllers/Traits/FieldLevelPermissionsTrait.php|
|HealthController|class|-|Glueful\Controllers|Controllers/HealthController.php|
|MetricsController|class|-|Glueful\Controllers|Controllers/MetricsController.php|
|QueryRestrictionsTrait|trait|QueryRestrictionsTrait|Glueful\Controllers\Traits|Controllers/Traits/QueryRestrictionsTrait.php|
|RateLimitingTrait|trait|Rate Limiting Trait|Glueful\Controllers\Traits|Controllers/Traits/RateLimitingTrait.php|
|ResourceController|class|ResourceController - RESTful CRUD API Controller|Glueful\Controllers|Controllers/ResourceController.php|
|ResponseCachingTrait|trait|Response Caching Trait|Glueful\Controllers\Traits|Controllers/Traits/ResponseCachingTrait.php|
|TableAccessControlTrait|trait|TableAccessControlTrait|Glueful\Controllers\Traits|Controllers/Traits/TableAccessControlTrait.php|

### database

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|AlterTableBuilder|class|Concrete Alter Table Builder Implementation|Glueful\Database\Schema\Builders|Database/Schema/Builders/AlterTableBuilder.php|
|AlterTableBuilderInterface|interface|Alter Table Builder Interface|Glueful\Database\Schema\Interfaces|Database/Schema/Interfaces/AlterTableBuilderInterface.php|
|CacheResult|class|-|Glueful\Database\Attributes|Database/Attributes/CacheResult.php|
|ColumnBuilder|class|Concrete Column Builder Implementation|Glueful\Database\Schema\Builders|Database/Schema/Builders/ColumnBuilder.php|
|ColumnBuilderInterface|interface|Column Builder Interface|Glueful\Database\Schema\Interfaces|Database/Schema/Interfaces/ColumnBuilderInterface.php|
|ConfigurableConnectionPool|class|Configurable Connection Pool|Glueful\Database|Database/ConfigurableConnectionPool.php|
|Connection|class|Database Connection Manager|Glueful\Database|Database/Connection.php|
|ConnectionPool|class|ConnectionPool|Glueful\Database|Database/ConnectionPool.php|
|ConnectionPoolException|class|ConnectionPoolException|Glueful\Database\Exceptions|Database/Exceptions/ConnectionPoolException.php|
|ConnectionPoolManager|class|ConnectionPoolManager|Glueful\Database|Database/ConnectionPoolManager.php|
|ConnectionValidator|class|Database Connection Validator|Glueful\Database|Database/ConnectionValidator.php|
|DatabaseDriver|interface|Database Driver Interface|Glueful\Database\Driver|Database/Driver/DatabaseDriver.php|
|DatabaseInterface|interface|Database Connection Interface|Glueful\Database|Database/DatabaseInterface.php|
|DeleteBuilder|class|DeleteBuilder|Glueful\Database\Query|Database/Query/DeleteBuilder.php|
|DeleteBuilderInterface|interface|DeleteBuilder Interface|Glueful\Database\Query\Interfaces|Database/Query/Interfaces/DeleteBuilderInterface.php|
|DevelopmentQueryMonitor|class|Development Query Monitor|Glueful\Database|Database/DevelopmentQueryMonitor.php|
|ExecutionPlanAnalyzer|class|Query Execution Plan Analyzer|Glueful\Database\Tools|Database/Tools/ExecutionPlanAnalyzer.php|
|ForeignKeyBuilder|class|Concrete Foreign Key Builder Implementation|Glueful\Database\Schema\Builders|Database/Schema/Builders/ForeignKeyBuilder.php|
|ForeignKeyBuilderInterface|interface|Foreign Key Builder Interface|Glueful\Database\Schema\Interfaces|Database/Schema/Interfaces/ForeignKeyBuilderInterface.php|
|InsertBuilder|class|InsertBuilder|Glueful\Database\Query|Database/Query/InsertBuilder.php|
|InsertBuilderInterface|interface|InsertBuilder Interface|Glueful\Database\Query\Interfaces|Database/Query/Interfaces/InsertBuilderInterface.php|
|JoinClause|class|JoinClause|Glueful\Database\Query|Database/Query/JoinClause.php|
|JoinClauseInterface|interface|JoinClause Interface|Glueful\Database\Query\Interfaces|Database/Query/Interfaces/JoinClauseInterface.php|
|MigrationInterface|interface|Migration Interface|Glueful\Database\Migrations|Database/Migrations/MigrationInterface.php|
|MigrationManager|class|Database Migration Manager|Glueful\Database\Migrations|Database/Migrations/MigrationManager.php|
|MySQLDriver|class|MySQL Database Driver Implementation|Glueful\Database\Driver|Database/Driver/MySQLDriver.php|
|MySQLSqlGenerator|class|MySQL SQL Generator Implementation|Glueful\Database\Schema\Generators|Database/Schema/Generators/MySQLSqlGenerator.php|
|PaginationBuilder|class|PaginationBuilder|Glueful\Database\Features|Database/Features/PaginationBuilder.php|
|PaginationBuilderInterface|interface|PaginationBuilder Interface|Glueful\Database\Features\Interfaces|Database/Features/Interfaces/PaginationBuilderInterface.php|
|ParameterBinder|class|ParameterBinder|Glueful\Database\Execution|Database/Execution/ParameterBinder.php|
|ParameterBinderInterface|interface|ParameterBinder Interface|Glueful\Database\Execution\Interfaces|Database/Execution/Interfaces/ParameterBinderInterface.php|
|PoolMonitor|class|PoolMonitor|Glueful\Database|Database/PoolMonitor.php|
|PooledConnection|class|PooledConnection|Glueful\Database|Database/PooledConnection.php|
|PostgreSQLDriver|class|PostgreSQL Database Driver Implementation|Glueful\Database\Driver|Database/Driver/PostgreSQLDriver.php|
|PostgreSQLSqlGenerator|class|PostgreSQL SQL Generator Implementation|Glueful\Database\Schema\Generators|Database/Schema/Generators/PostgreSQLSqlGenerator.php|
|QueryAnalyzer|class|Query Analyzer|Glueful\Database|Database/QueryAnalyzer.php|
|QueryBuilder|class|Modular QueryBuilder - Orchestrator Pattern|Glueful\Database|Database/QueryBuilder.php|
|QueryBuilderInterface|interface|QueryBuilder Interface|Glueful\Database\Query\Interfaces|Database/Query/Interfaces/QueryBuilderInterface.php|
|QueryCacheService|class|Query Cache Service|Glueful\Database|Database/QueryCacheService.php|
|QueryExecutor|class|QueryExecutor|Glueful\Database\Execution|Database/Execution/QueryExecutor.php|
|QueryExecutorInterface|interface|QueryExecutor Interface|Glueful\Database\Execution\Interfaces|Database/Execution/Interfaces/QueryExecutorInterface.php|
|QueryHasher|class|Query Hasher|Glueful\Database|Database/QueryHasher.php|
|QueryLogger|class|Database Query Logger|Glueful\Database|Database/QueryLogger.php|
|QueryModifiers|class|Manages query modifiers (GROUP BY, HAVING, ORDER BY)|Glueful\Database\Query|Database/Query/QueryModifiers.php|
|QueryModifiersInterface|interface|Interface for query modifiers (GROUP BY, HAVING, ORDER BY)|Glueful\Database\Query\Interfaces|Database/Query/Interfaces/QueryModifiersInterface.php|
|QueryOptimizer|class|Query Optimizer|Glueful\Database|Database/QueryOptimizer.php|
|QueryPatternRecognizer|class|-|Glueful\Database\Tools|Database/Tools/QueryPatternRecognizer.php|
|QueryProfilerService|class|-|Glueful\Database\Tools|Database/Tools/QueryProfilerService.php|
|QueryPurpose|class|Tracks and manages the business purpose of database queries|Glueful\Database\Features|Database/Features/QueryPurpose.php|
|QueryPurposeInterface|interface|Interface for tracking business purpose of queries|Glueful\Database\Features\Interfaces|Database/Features/Interfaces/QueryPurposeInterface.php|
|QueryState|class|QueryState|Glueful\Database\Query|Database/Query/QueryState.php|
|QueryStateInterface|interface|QueryState Interface|Glueful\Database\Query\Interfaces|Database/Query/Interfaces/QueryStateInterface.php|
|QueryValidator|class|Validates query components to ensure data integrity and prevent errors|Glueful\Database\Features|Database/Features/QueryValidator.php|
|QueryValidatorInterface|interface|Interface for query validation functionality|Glueful\Database\Features\Interfaces|Database/Features/Interfaces/QueryValidatorInterface.php|
|RawExpression (internal)|class|Raw SQL Expression Container|Glueful\Database|Database/RawExpression.php|
|ResultProcessor|class|Processes and transforms database query results|Glueful\Database\Execution|Database/Execution/ResultProcessor.php|
|ResultProcessorInterface|interface|Interface for processing database query results|Glueful\Database\Execution\Interfaces|Database/Execution/Interfaces/ResultProcessorInterface.php|
|SQLiteDriver|class|SQLite Database Driver Implementation|Glueful\Database\Driver|Database/Driver/SQLiteDriver.php|
|SQLiteSqlGenerator|class|SQLite SQL Generator Implementation|Glueful\Database\Schema\Generators|Database/Schema/Generators/SQLiteSqlGenerator.php|
|SavepointManager|class|SavepointManager|Glueful\Database\Transaction|Database/Transaction/SavepointManager.php|
|SavepointManagerInterface|interface|SavepointManager Interface|Glueful\Database\Transaction\Interfaces|Database/Transaction/Interfaces/SavepointManagerInterface.php|
|SchemaBuilder|class|Concrete Schema Builder Implementation|Glueful\Database\Schema\Builders|Database/Schema/Builders/SchemaBuilder.php|
|SchemaBuilderInterface|interface|Schema Builder Interface|Glueful\Database\Schema\Interfaces|Database/Schema/Interfaces/SchemaBuilderInterface.php|
|SelectBuilder|class|SelectBuilder|Glueful\Database\Query|Database/Query/SelectBuilder.php|
|SelectBuilderInterface|interface|SelectBuilder Interface|Glueful\Database\Query\Interfaces|Database/Query/Interfaces/SelectBuilderInterface.php|
|SoftDeleteHandler|class|Handles soft delete functionality for database queries|Glueful\Database\Features|Database/Features/SoftDeleteHandler.php|
|SoftDeleteHandlerInterface|interface|Interface for handling soft delete functionality in queries|Glueful\Database\Features\Interfaces|Database/Features/Interfaces/SoftDeleteHandlerInterface.php|
|SqlGeneratorInterface|interface|SQL Generator Interface|Glueful\Database\Schema\Interfaces|Database/Schema/Interfaces/SqlGeneratorInterface.php|
|TableBuilder|class|Concrete Table Builder Implementation|Glueful\Database\Schema\Builders|Database/Schema/Builders/TableBuilder.php|
|TableBuilderContextInterface|interface|Table Builder Context Interface|Glueful\Database\Schema\Interfaces|Database/Schema/Interfaces/TableBuilderContextInterface.php|
|TableBuilderInterface|interface|Table Builder Interface|Glueful\Database\Schema\Interfaces|Database/Schema/Interfaces/TableBuilderInterface.php|
|TransactionManager|class|TransactionManager|Glueful\Database\Transaction|Database/Transaction/TransactionManager.php|
|TransactionManagerInterface|interface|TransactionManager Interface|Glueful\Database\Transaction\Interfaces|Database/Transaction/Interfaces/TransactionManagerInterface.php|
|UpdateBuilder|class|UpdateBuilder|Glueful\Database\Query|Database/Query/UpdateBuilder.php|
|UpdateBuilderInterface|interface|UpdateBuilder Interface|Glueful\Database\Query\Interfaces|Database/Query/Interfaces/UpdateBuilderInterface.php|
|WhereClause|class|WhereClause|Glueful\Database\Query|Database/Query/WhereClause.php|
|WhereClauseInterface|interface|WhereClause Interface|Glueful\Database\Query\Interfaces|Database/Query/Interfaces/WhereClauseInterface.php|

### dtos

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|EmailDTO|class|-|Glueful\DTOs|DTOs/EmailDTO.php|
|ErrorResponseDTO|class|Error Response DTO|Glueful\DTOs|DTOs/ErrorResponseDTO.php|
|ListResourceRequestDTO|class|-|Glueful\DTOs|DTOs/ListResourceRequestDTO.php|
|PaginatedResponseDTO|class|Paginated Response DTO|Glueful\DTOs|DTOs/PaginatedResponseDTO.php|
|PaginationMetaDTO|class|Pagination Metadata DTO|Glueful\DTOs|DTOs/PaginationMetaDTO.php|
|PasswordDTO|class|-|Glueful\DTOs|DTOs/PasswordDTO.php|
|UserDTO|class|Enhanced User Data Transfer Object (migrated to new Validation rules)|Glueful\DTOs|DTOs/UserDTO.php|
|UserResponseModel|class|User Response Model|Glueful\DTOs|DTOs/UserResponseModel.php|
|UsernameDTO|class|-|Glueful\DTOs|DTOs/UsernameDTO.php|

### events

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|AdminAccessEvent|class|Admin Access Event|Glueful\Events\Security|Events/Security/AdminAccessEvent.php|
|AdminSecurityViolationEvent|class|Admin Security Violation Event|Glueful\Events\Security|Events/Security/AdminSecurityViolationEvent.php|
|AsListener|class|-|Glueful\Events\Attributes|Events/Attributes/AsListener.php|
|AuthenticationFailedEvent|class|Authentication Failed Event|Glueful\Events\Auth|Events/Auth/AuthenticationFailedEvent.php|
|BaseEvent|class|BaseEvent with lightweight propagation control and framework metadata|Glueful\Events\Contracts|Events/Contracts/BaseEvent.php|
|CSRFViolationEvent|class|CSRF Violation Event|Glueful\Events\Security|Events/Security/CSRFViolationEvent.php|
|CacheHitEvent|class|Cache Hit Event|Glueful\Events\Cache|Events/Cache/CacheHitEvent.php|
|CacheInvalidatedEvent|class|Cache Invalidated Event|Glueful\Events\Cache|Events/Cache/CacheInvalidatedEvent.php|
|CacheInvalidationListener|class|Cache Invalidation Event Listener|Glueful\Events\Listeners|Events/Listeners/CacheInvalidationListener.php|
|CacheMissEvent|class|Cache Miss Event|Glueful\Events\Cache|Events/Cache/CacheMissEvent.php|
|ContainerListener|class|-|Glueful\Events|Events/ContainerListener.php|
|Dispatchable|trait|Dispatchable Trait|Glueful\Events\Traits|Events/Traits/Dispatchable.php|
|EntityCreatedEvent|class|Entity Created Event|Glueful\Events\Database|Events/Database/EntityCreatedEvent.php|
|EntityUpdatedEvent|class|Entity Updated Event|Glueful\Events\Database|Events/Database/EntityUpdatedEvent.php|
|Event|class|-|Glueful\Events|Events/Event.php|
|EventDispatcher|class|-|Glueful\Events|Events/EventDispatcher.php|
|EventHelpers|trait|Event Helpers Trait|Glueful\Events\Traits|Events/Traits/EventHelpers.php|
|EventProvider|class|-|Glueful\Events\ServiceProvider|Events/ServiceProvider/EventProvider.php|
|EventSubscriberInterface|interface|-|Glueful\Events|Events/EventSubscriberInterface.php|
|EventTracerInterface|interface|-|Glueful\Events\Tracing|Events/Tracing/EventTracerInterface.php|
|ExceptionEvent|class|Exception Event|Glueful\Events\Http|Events/Http/ExceptionEvent.php|
|HttpAuthFailureEvent|class|Event emitted when HTTP-level authentication fails|Glueful\Events\Http|Events/Http/HttpAuthFailureEvent.php|
|HttpAuthSuccessEvent|class|Event emitted when HTTP-level authentication succeeds|Glueful\Events\Http|Events/Http/HttpAuthSuccessEvent.php|
|HttpClientFailureEvent|class|HTTP Client Failure Event|Glueful\Events\Http|Events/Http/HttpClientFailureEvent.php|
|InheritanceResolver|class|-|Glueful\Events|Events/InheritanceResolver.php|
|InteractsWithQueue|trait|InteractsWithQueue Trait (migrated)|Glueful\Events\Traits|Events/Traits/InteractsWithQueue.php|
|ListenerProvider|class|ListenerProvider with stable priority order and de-dup across inheritance paths|Glueful\Events|Events/ListenerProvider.php|
|NullEventTracer|class|-|Glueful\Events\Tracing|Events/Tracing/NullEventTracer.php|
|PerformanceMonitoringListener|class|Performance Monitoring Event Listener|Glueful\Events\Listeners|Events/Listeners/PerformanceMonitoringListener.php|
|QueryExecutedEvent|class|Query Executed Event|Glueful\Events\Database|Events/Database/QueryExecutedEvent.php|
|RateLimitExceededEvent|class|Rate Limit Exceeded Event|Glueful\Events\Auth|Events/Auth/RateLimitExceededEvent.php|
|RequestEvent|class|Request Event|Glueful\Events\Http|Events/Http/RequestEvent.php|
|ResponseEvent|class|Response Event|Glueful\Events\Http|Events/Http/ResponseEvent.php|
|SecurityMonitoringListener|class|Security Monitoring Event Listener|Glueful\Events\Listeners|Events/Listeners/SecurityMonitoringListener.php|
|Serializable|trait|-|Glueful\Events\Traits|Events/Traits/Serializable.php|
|SessionCreatedEvent|class|Session Created Event|Glueful\Events\Auth|Events/Auth/SessionCreatedEvent.php|
|SessionDestroyedEvent|class|Session Destroyed Event|Glueful\Events\Auth|Events/Auth/SessionDestroyedEvent.php|
|SubscriberRegistrar|class|-|Glueful\Events|Events/SubscriberRegistrar.php|
|Timestampable|trait|Timestampable Trait|Glueful\Events\Traits|Events/Traits/Timestampable.php|
|WebhookDeliveredEvent|class|Webhook Delivered Event|Glueful\Events\Webhook|Events/Webhook/WebhookDeliveredEvent.php|
|WebhookFailedEvent|class|Webhook Failed Event|Glueful\Events\Webhook|Events/Webhook/WebhookFailedEvent.php|

### exceptions

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|ApiException|class|Base API Exception|Glueful\Exceptions|Exceptions/ApiException.php|
|AuthenticationException|class|Authentication Exception|Glueful\Exceptions|Exceptions/AuthenticationException.php|
|BusinessLogicException|class|Business Logic Exception|Glueful\Exceptions|Exceptions/BusinessLogicException.php|
|CacheException|class|Cache Exception|Glueful\Exceptions|Exceptions/CacheException.php|
|DatabaseException|class|Database Exception|Glueful\Exceptions|Exceptions/DatabaseException.php|
|ExceptionHandler|class|-|Glueful\Exceptions|Exceptions/ExceptionHandler.php|
|ExtensionException|class|Extension Exception|Glueful\Exceptions|Exceptions/ExtensionException.php|
|HttpAuthException|class|HTTP Authentication Exception|Glueful\Exceptions|Exceptions/HttpAuthException.php|
|HttpException|class|HTTP Exception|Glueful\Exceptions|Exceptions/HttpException.php|
|HttpProtocolException|class|HTTP Protocol Exception|Glueful\Exceptions|Exceptions/HttpProtocolException.php|
|NotFoundException|class|Not Found Exception|Glueful\Exceptions|Exceptions/NotFoundException.php|
|RateLimitExceededException|class|Rate Limit Exceeded Exception|Glueful\Exceptions|Exceptions/RateLimitExceededException.php|
|SecurityException|class|Security Exception|Glueful\Exceptions|Exceptions/SecurityException.php|
|ValidationException|class|Validation Exception|Glueful\Exceptions|Exceptions/ValidationException.php|

### extensions

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|DeferrableProvider|interface|Optional: providers can declare services they provide for future deferral|Glueful\Extensions|Extensions/DeferrableProvider.php|
|ExtensionManager|class|Discovers, registers, boots extension providers|Glueful\Extensions|Extensions/ExtensionManager.php|
|ExtensionMetadataRegistry|class|-|Glueful\Extensions|Extensions/ExtensionMetadataRegistry.php|
|OrderedProvider|interface|Marker for providers that implement booAfter(): Class[]|Glueful\Extensions|Extensions/OrderedProvider.php|
|PackageManifest|class|Discovers Glueful extensions from Composer's installed metadata|Glueful\Extensions|Extensions/PackageManifest.php|
|ProviderLocator|class|Unified provider discovery for both compile-time and runtime phases|Glueful\Extensions|Extensions/ProviderLocator.php|
|ServiceProvider|class|API-first base provider (PSR-11 compliant)|Glueful\Extensions|Extensions/ServiceProvider.php|
|SpaManager|class|SPA Manager|Glueful\Extensions|Extensions/SpaManager.php|

### framework

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|Framework|class|Consolidated Framework class - handles all bootstrapping logic|Glueful|Framework.php|

### helpers

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|CDNAdapterManager|trait|CDN Adapter Manager|Glueful\Helpers|Helpers/CDNAdapterManager.php|
|CacheHelper|class|Cache Helper Utilities|Glueful\Helpers|Helpers/CacheHelper.php|
|ConfigManager|class|Centralized Configuration Manager|Glueful\Helpers|Helpers/ConfigManager.php|
|DatabaseConnectionTrait|trait|Database Connection Trait|Glueful\Helpers|Helpers/DatabaseConnectionTrait.php|
|RequestHelper|class|Request Helper|Glueful\Helpers|Helpers/RequestHelper.php|
|RoutesManager|class|-|Glueful\Helpers|Helpers/RoutesManager.php|
|StaticFileDetector|class|Enhanced Static File Detector|Glueful\Helpers|Helpers/StaticFileDetector.php|
|Utils|class|Utility Functions|Glueful\Helpers|Helpers/Utils.php|
|ValidationHelper|class|Validation Helper|Glueful\Helpers|Helpers/ValidationHelper.php|

### http

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|ApiClientBuilder|class|API Client Builder|Glueful\Http\Builders|Http/Builders/ApiClientBuilder.php|
|AuthenticationMethods|class|Authentication Methods|Glueful\Http\Authentication|Http/Authentication/AuthenticationMethods.php|
|Client|class|HTTP Client Service|Glueful\Http|Http/Client.php|
|Cors|class|Configurable CORS Handler - Developer-Friendly|Glueful\Http|Http/Cors.php|
|EnvironmentContext|class|Environment Context Service|Glueful\Http|Http/EnvironmentContext.php|
|ExternalApiService|class|External API Service|Glueful\Http\Services|Http/Services/ExternalApiService.php|
|FileResponseWrapper|class|Wrapper for BinaryFileResponse to support Laravel-style header() method chaining|Glueful\Http|Http/FileResponseWrapper.php|
|HealthCheckService|class|Health Check Service|Glueful\Http\Services|Http/Services/HealthCheckService.php|
|HttpClientConfig|class|HTTP Client Configuration|Glueful\Http\Configuration|Http/Configuration/HttpClientConfig.php|
|HttpClientException|class|HTTP Client Exception|Glueful\Http\Exceptions|Http/Exceptions/HttpClientException.php|
|HttpClientProvider|class|-|Glueful\Http\ServiceProvider|Http/ServiceProvider/HttpClientProvider.php|
|HttpResponse|class|HTTP Response|Glueful\Http|Http/HttpResponse.php|
|HttpResponseException|class|HTTP Response Exception|Glueful\Http\Exceptions|Http/Exceptions/HttpResponseException.php|
|MiddlewareAsPsr15|class|Expose a Glueful middleware (handle(Request $r, callable $next): Response) as a PSR-15 middleware|Glueful\Http\Bridge\Psr15|Http/Bridge/Psr15/MiddlewareAsPsr15.php|
|MiddlewareDispatcher|class|PSR-15 Compatible Middleware Dispatcher|Glueful\Http\Middleware|Http/Middleware/MiddlewareDispatcher.php|
|MiddlewareInterface|interface|PSR-15 Compatible Middleware Interface|Glueful\Http\Middleware|Http/Middleware/MiddlewareInterface.php|
|NotificationClientBuilder|class|Notification Client Builder|Glueful\Http\Builders|Http/Builders/NotificationClientBuilder.php|
|OAuthClientBuilder|class|OAuth Client Builder|Glueful\Http\Builders|Http/Builders/OAuthClientBuilder.php|
|Pagination|class|Pagination Handler|Glueful\Http|Http/Pagination.php|
|PaymentClientBuilder|class|Payment Client Builder|Glueful\Http\Builders|Http/Builders/PaymentClientBuilder.php|
|Psr15AdapterFactory|class|Wrap a PSR-15 middleware as a Glueful-compatible callable(Request, callable): Response|Glueful\Http\Bridge\Psr15|Http/Bridge/Psr15/Psr15AdapterFactory.php|
|RequestContext|class|Request Context Service|Glueful\Http|Http/RequestContext.php|
|RequestHandlerAdapter|class|Wrap a Glueful $next(Request): Response as a PSR-15 RequestHandlerInterface|Glueful\Http\Bridge\Psr15|Http/Bridge/Psr15/RequestHandlerAdapter.php|
|RequestHandlerInterface|interface|PSR-15 Compatible Request Handler Interface|Glueful\Http\Middleware|Http/Middleware/RequestHandlerInterface.php|
|RequestUserContext|class|Request User Context|Glueful\Http|Http/RequestUserContext.php|
|Response|class|Enhanced HTTP Response Wrapper|Glueful\Http\Response|Http/Response/Response.php|
|Response|class|Modern API Response Handler using Symfony JsonResponse|Glueful\Http|Http/Response.php|
|ResponseHelper|class|Response helper for fluent API|Glueful\Http|Http/ResponseHelper.php|
|RetryMiddleware|class|Retry Middleware|Glueful\Http\Middleware|Http/Middleware/RetryMiddleware.php|
|ScopedClientFactory|class|Scoped Client Factory|Glueful\Http\Factory|Http/Factory/ScopedClientFactory.php|
|SecureErrorResponse|class|Secure Error Response Helper|Glueful\Http|Http/SecureErrorResponse.php|
|ServerRequestFactory|class|PSR-7 Server Request Factory|Glueful\Http|Http/ServerRequestFactory.php|
|SessionContext|class|Session Context Service|Glueful\Http|Http/SessionContext.php|
|WebhookDeliveryService|class|Webhook Delivery Service|Glueful\Http\Services|Http/Services/WebhookDeliveryService.php|

### interfaces

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|PermissionCacheInterface|interface|Permission Cache Interface|Glueful\Interfaces\Permission|Interfaces/Permission/PermissionCacheInterface.php|
|PermissionManagerInterface|interface|Permission Manager Interface|Glueful\Interfaces\Permission|Interfaces/Permission/PermissionManagerInterface.php|
|PermissionProviderInterface|interface|Permission Provider Interface|Glueful\Interfaces\Permission|Interfaces/Permission/PermissionProviderInterface.php|
|PermissionStandards|interface|Permission Standards Interface|Glueful\Interfaces\Permission|Interfaces/Permission/PermissionStandards.php|
|RbacPermissionProviderInterface|interface|Optional RBAC-specific provider capabilities|Glueful\Interfaces\Permission|Interfaces/Permission/RbacPermissionProviderInterface.php|
|RoleStandards|interface|Role Standards Interface|Glueful\Interfaces\Permission|Interfaces/Permission/RoleStandards.php|

### lock

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|DatabaseLockStore|class|-|Glueful\Lock\Store|Lock/Store/DatabaseLockStore.php|
|FileLockStore|class|-|Glueful\Lock\Store|Lock/Store/FileLockStore.php|
|Lock|class|-|Glueful\Lock|Lock/Lock.php|
|LockInterface|interface|-|Glueful\Lock|Lock/LockInterface.php|
|LockManager|class|-|Glueful\Lock|Lock/LockManager.php|
|LockManagerInterface|interface|-|Glueful\Lock|Lock/LockManagerInterface.php|
|RedisLockStore|class|-|Glueful\Lock\Store|Lock/Store/RedisLockStore.php|

### logging

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|DatabaseLogHandler|class|Database Log Handler|Glueful\Logging|Logging/DatabaseLogHandler.php|
|DatabaseLogPruner|class|Log Pruner for DatabaseLogHandler|Glueful\Logging|Logging/DatabaseLogPruner.php|
|LogManager|class|Enhanced Application Logger|Glueful\Logging|Logging/LogManager.php|
|LogManagerInterface|interface|-|Glueful\Logging|Logging/LogManagerInterface.php|
|StandardLogProcessor|class|Adds consistent structured fields to every log record|Glueful\Logging|Logging/StandardLogProcessor.php|

### models

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|User|class|-|Glueful\Models|Models/User.php|

### notifications

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|ChannelManager|class|Channel Manager Service|Glueful\Notifications\Services|Notifications/Services/ChannelManager.php|
|Notifiable|interface|Notifiable Interface|Glueful\Notifications\Contracts|Notifications/Contracts/Notifiable.php|
|Notification|class|Notification Model|Glueful\Notifications\Models|Notifications/Models/Notification.php|
|NotificationChannel|interface|NotificationChannel Interface|Glueful\Notifications\Contracts|Notifications/Contracts/NotificationChannel.php|
|NotificationDelivered|class|NotificationDelivered|Glueful\Notifications\Events|Notifications/Events/NotificationDelivered.php|
|NotificationDispatcher|class|Notification Dispatcher Service|Glueful\Notifications\Services|Notifications/Services/NotificationDispatcher.php|
|NotificationEvent|class|NotificationEvent|Glueful\Notifications\Events|Notifications/Events/NotificationEvent.php|
|NotificationExtension|interface|NotificationExtension Interface|Glueful\Notifications\Contracts|Notifications/Contracts/NotificationExtension.php|
|NotificationFailed|class|NotificationFailed|Glueful\Notifications\Events|Notifications/Events/NotificationFailed.php|
|NotificationMetricsService|class|Notification Metrics Service|Glueful\Notifications\Services|Notifications/Services/NotificationMetricsService.php|
|NotificationPreference|class|NotificationPreference Model|Glueful\Notifications\Models|Notifications/Models/NotificationPreference.php|
|NotificationQueued|class|NotificationQueued|Glueful\Notifications\Events|Notifications/Events/NotificationQueued.php|
|NotificationRead|class|NotificationRead|Glueful\Notifications\Events|Notifications/Events/NotificationRead.php|
|NotificationResultParser|class|Notification Result Parser|Glueful\Notifications\Utils|Notifications/Utils/NotificationResultParser.php|
|NotificationRetry|class|NotificationRetry|Glueful\Notifications\Events|Notifications/Events/NotificationRetry.php|
|NotificationRetryService|class|Notification Retry Service|Glueful\Notifications\Services|Notifications/Services/NotificationRetryService.php|
|NotificationScheduled|class|NotificationScheduled|Glueful\Notifications\Events|Notifications/Events/NotificationScheduled.php|
|NotificationSent|class|NotificationSent|Glueful\Notifications\Events|Notifications/Events/NotificationSent.php|
|NotificationService|class|Notification Service|Glueful\Notifications\Services|Notifications/Services/NotificationService.php|
|NotificationTemplate|class|NotificationTemplate Model|Glueful\Notifications\Models|Notifications/Models/NotificationTemplate.php|
|TemplateManager|class|Template Manager|Glueful\Notifications\Templates|Notifications/Templates/TemplateManager.php|
|TemplateResolver|class|Template Resolver|Glueful\Notifications\Templates|Notifications/Templates/TemplateResolver.php|

### observability

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|NoopSpan|class|-|Glueful\Observability\Tracing|Observability/Tracing/NoopSpan.php|
|NoopSpanBuilder|class|-|Glueful\Observability\Tracing|Observability/Tracing/NoopSpanBuilder.php|
|NoopTracer|class|-|Glueful\Observability\Tracing|Observability/Tracing/NoopTracer.php|
|SpanBuilderInterface|interface|-|Glueful\Observability\Tracing|Observability/Tracing/SpanBuilderInterface.php|
|SpanInterface|interface|-|Glueful\Observability\Tracing|Observability/Tracing/SpanInterface.php|
|TracerInterface|interface|-|Glueful\Observability\Tracing|Observability/Tracing/TracerInterface.php|

### performance

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|ChunkedDatabaseProcessor|class|A utility class for processing database results in a memory-efficient way|Glueful\Performance|Performance/ChunkedDatabaseProcessor.php|
|LazyContainer|class|-|Glueful\Performance|Performance/LazyContainer.php|
|MemoryAlertingService|class|Service for monitoring memory usage and triggering alerts|Glueful\Performance|Performance/MemoryAlertingService.php|
|MemoryEfficientIterators|class|-|Glueful\Performance|Performance/MemoryEfficientIterators.php|
|MemoryManager|class|-|Glueful\Performance|Performance/MemoryManager.php|
|MemoryPool|class|-|Glueful\Performance|Performance/MemoryPool.php|
|StreamingIterator|class|A memory-efficient streaming iterator for large datasets|Glueful\Performance|Performance/StreamingIterator.php|

### permissions

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|AuthToRequestAttributesMiddleware|class|Auth To Request Attributes Middleware|Glueful\Permissions\Middleware|Permissions/Middleware/AuthToRequestAttributesMiddleware.php|
|Context|class|-|Glueful\Permissions|Permissions/Context.php|
|Gate|class|-|Glueful\Permissions|Permissions/Gate.php|
|GateAttributeMiddleware|class|-|Glueful\Permissions\Middleware|Permissions/Middleware/GateAttributeMiddleware.php|
|GateProvider ⚠️|class|Gate Service Provider|Glueful\Permissions\ServiceProvider|Permissions/ServiceProvider/GateProvider.php|
|OwnershipVoter|class|-|Glueful\Permissions\Voters|Permissions/Voters/OwnershipVoter.php|
|PermissionCache|class|Permission Cache|Glueful\Permissions|Permissions/PermissionCache.php|
|PermissionContext|class|-|Glueful\Permissions|Permissions/PermissionContext.php|
|PermissionException|class|Permission Exception|Glueful\Permissions\Exceptions|Permissions/Exceptions/PermissionException.php|
|PermissionHelper|class|Permission Helper Class|Glueful\Permissions\Helpers|Permissions/Helpers/PermissionHelper.php|
|PermissionManager|class|Permission Manager|Glueful\Permissions|Permissions/PermissionManager.php|
|PermissionProviderRegistry|class|Permission Provider Registry|Glueful\Permissions|Permissions/PermissionProviderRegistry.php|
|PermissionsProvider|class|-|Glueful\Permissions\ServiceProvider|Permissions/ServiceProvider/PermissionsProvider.php|
|PolicyInterface|interface|-|Glueful\Permissions|Permissions/PolicyInterface.php|
|PolicyRegistry|class|Registry maps resource slugs (e.g., 'posts') or FQCNs to policy classes|Glueful\Permissions|Permissions/PolicyRegistry.php|
|PolicyVoter|class|-|Glueful\Permissions\Voters|Permissions/Voters/PolicyVoter.php|
|ProviderNotFoundException|class|Provider Not Found Exception|Glueful\Permissions\Exceptions|Permissions/Exceptions/ProviderNotFoundException.php|
|RoleHelper|class|Role Helper Class|Glueful\Permissions\Helpers|Permissions/Helpers/RoleHelper.php|
|RoleVoter|class|-|Glueful\Permissions\Voters|Permissions/Voters/RoleVoter.php|
|ScopeVoter|class|-|Glueful\Permissions\Voters|Permissions/Voters/ScopeVoter.php|
|SuperRoleVoter|class|-|Glueful\Permissions\Voters|Permissions/Voters/SuperRoleVoter.php|
|UnauthorizedException|class|Unauthorized Exception|Glueful\Permissions\Exceptions|Permissions/Exceptions/UnauthorizedException.php|
|Vote|class|-|Glueful\Permissions|Permissions/Vote.php|
|VoterInterface|interface|-|Glueful\Permissions|Permissions/VoterInterface.php|

### queue

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|AutoScaler|class|Auto-scaling Service for Queue Workers|Glueful\Queue\Process|Queue/Process/AutoScaler.php|
|CacheMaintenanceJob|class|Cache Maintenance Queue Job|Glueful\Queue\Jobs|Queue/Jobs/CacheMaintenanceJob.php|
|DatabaseBackupJob|class|Database Backup Queue Job|Glueful\Queue\Jobs|Queue/Jobs/DatabaseBackupJob.php|
|DatabaseJob|class|Database Job Implementation|Glueful\Queue\Jobs|Queue/Jobs/DatabaseJob.php|
|DatabaseQueue|class|Database Queue Driver|Glueful\Queue\Drivers|Queue/Drivers/DatabaseQueue.php|
|DriverDiscovery|class|Driver Discovery System|Glueful\Queue\Discovery|Queue/Discovery/DriverDiscovery.php|
|DriverInfo|class|Driver Information Class|Glueful\Queue\Contracts|Queue/Contracts/DriverInfo.php|
|DriverNotFoundException|class|Driver Not Found Exception|Glueful\Queue\Exceptions|Queue/Exceptions/DriverNotFoundException.php|
|DriverRegistry|class|Driver Registry System|Glueful\Queue\Registry|Queue/Registry/DriverRegistry.php|
|EventDispatcher|class|Event Dispatcher|Glueful\Queue\Events|Queue/Events/EventDispatcher.php|
|FailedJobProvider|class|Failed Job Provider|Glueful\Queue\Failed|Queue/Failed/FailedJobProvider.php|
|HealthStatus|class|Health Status Class|Glueful\Queue\Contracts|Queue/Contracts/HealthStatus.php|
|InvalidConfigurationException|class|Invalid Configuration Exception|Glueful\Queue\Exceptions|Queue/Exceptions/InvalidConfigurationException.php|
|Job|class|Base Job Class|Glueful\Queue|Queue/Job.php|
|JobInterface|interface|Job Interface|Glueful\Queue\Contracts|Queue/Contracts/JobInterface.php|
|LogCleanupJob|class|Log Cleanup Queue Job|Glueful\Queue\Jobs|Queue/Jobs/LogCleanupJob.php|
|NotificationRetryJob|class|Notification Retry Queue Job|Glueful\Queue\Jobs|Queue/Jobs/NotificationRetryJob.php|
|PluginManager|class|Plugin Manager for Queue Extensions|Glueful\Queue\Plugins|Queue/Plugins/PluginManager.php|
|ProcessFactory|class|-|Glueful\Queue\Process|Queue/Process/ProcessFactory.php|
|ProcessManager|class|-|Glueful\Queue\Process|Queue/Process/ProcessManager.php|
|QueueDriverInterface|interface|Queue Driver Interface|Glueful\Queue\Contracts|Queue/Contracts/QueueDriverInterface.php|
|QueueException|class|Base Queue Exception|Glueful\Queue\Exceptions|Queue/Exceptions/QueueException.php|
|QueueMaintenance|class|Queue Maintenance Job|Glueful\Queue\Jobs|Queue/Jobs/QueueMaintenance.php|
|QueueManager|class|Queue Manager|Glueful\Queue|Queue/QueueManager.php|
|QueueProvider|class|-|Glueful\Queue\ServiceProvider|Queue/ServiceProvider/QueueProvider.php|
|RedisJob|class|Redis Job Implementation|Glueful\Queue\Jobs|Queue/Jobs/RedisJob.php|
|RedisQueue|class|Redis Queue Driver|Glueful\Queue\Drivers|Queue/Drivers/RedisQueue.php|
|ResourceMonitor|class|Resource Monitor for Queue Worker Scaling|Glueful\Queue\Process|Queue/Process/ResourceMonitor.php|
|ScheduledScaler|class|Scheduled Scaling Service for Queue Workers|Glueful\Queue\Process|Queue/Process/ScheduledScaler.php|
|SendNotification|class|Send Notification Job|Glueful\Queue\Jobs|Queue/Jobs/SendNotification.php|
|SessionCleanupJob|class|Session Cleanup Queue Job|Glueful\Queue\Jobs|Queue/Jobs/SessionCleanupJob.php|
|StreamingMonitor|class|Streaming Monitor for Real-time Worker Output|Glueful\Queue\Process|Queue/Process/StreamingMonitor.php|
|WorkerMonitor|class|Worker Monitor|Glueful\Queue\Monitoring|Queue/Monitoring/WorkerMonitor.php|
|WorkerOptions|class|Worker Configuration Options|Glueful\Queue|Queue/WorkerOptions.php|
|WorkerProcess|class|-|Glueful\Queue\Process|Queue/Process/WorkerProcess.php|

### repository

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|BaseRepository|class|Base Repository|Glueful\Repository|Repository/BaseRepository.php|
|BlobRepository|class|Blob Repository|Glueful\Repository|Repository/BlobRepository.php|
|NotificationRepository|class|Notification Repository|Glueful\Repository|Repository/NotificationRepository.php|
|QueryFilterTrait|trait|Query Filter Trait|Glueful\Repository\Concerns|Repository/Concerns/QueryFilterTrait.php|
|RepositoryFactory|class|Repository Factory|Glueful\Repository|Repository/RepositoryFactory.php|
|RepositoryInterface|interface|Repository Interface|Glueful\Repository\Interfaces|Repository/Interfaces/RepositoryInterface.php|
|ResourceRepository|class|Generic Resource Repository|Glueful\Repository|Repository/ResourceRepository.php|
|TransactionTrait|trait|Transaction management trait for repositories|Glueful\Repository\Traits|Repository/Traits/TransactionTrait.php|
|UnitOfWork|class|Unit of Work Implementation|Glueful\Repository|Repository/UnitOfWork.php|
|UserRepository|class|User Repository|Glueful\Repository|Repository/UserRepository.php|

### routing

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|AdminPermissionMiddleware|class|Admin Permission Middleware for Next-Gen Router|Glueful\Routing\Middleware|Routing/Middleware/AdminPermissionMiddleware.php|
|AllowIpMiddleware|class|-|Glueful\Routing\Middleware|Routing/Middleware/AllowIpMiddleware.php|
|AttributeRouteLoader|class|-|Glueful\Routing|Routing/AttributeRouteLoader.php|
|AuthMiddleware|class|Enterprise Authentication Middleware for Next-Gen Router|Glueful\Routing\Middleware|Routing/Middleware/AuthMiddleware.php|
|CSRFMiddleware|class|CSRF Protection Middleware for Next-Gen Router|Glueful\Routing\Middleware|Routing/Middleware/CSRFMiddleware.php|
|Controller|class|-|Glueful\Routing\Attributes|Routing/Attributes/Controller.php|
|Delete|class|-|Glueful\Routing\Attributes|Routing/Attributes/Delete.php|
|FieldSelectionMiddleware|class|-|Glueful\Routing\Middleware|Routing/Middleware/FieldSelectionMiddleware.php|
|Fields|class|-|Glueful\Routing\Attributes|Routing/Attributes/Fields.php|
|Get|class|-|Glueful\Routing\Attributes|Routing/Attributes/Get.php|
|LockdownMiddleware|class|Emergency Lockdown Middleware for Next-Gen Router|Glueful\Routing\Middleware|Routing/Middleware/LockdownMiddleware.php|
|MetricsMiddleware|class|-|Glueful\Routing\Middleware|Routing/Middleware/MetricsMiddleware.php|
|Middleware|class|-|Glueful\Routing\Attributes|Routing/Attributes/Middleware.php|
|Post|class|-|Glueful\Routing\Attributes|Routing/Attributes/Post.php|
|Psr15MiddlewareResolverTrait|trait|Mixin/trait to be used by Router or MiddlewareResolver component|Glueful\Routing\Internal|Routing/Internal/Psr15MiddlewareResolverTrait.php|
|Put|class|-|Glueful\Routing\Attributes|Routing/Attributes/Put.php|
|RateLimiterMiddleware|class|Rate Limiter Middleware for Next-Gen Router|Glueful\Routing\Middleware|Routing/Middleware/RateLimiterMiddleware.php|
|RequestResponseLoggingMiddleware|class|Request/Response Logging Middleware for Next-Gen Router|Glueful\Routing\Middleware|Routing/Middleware/RequestResponseLoggingMiddleware.php|
|Route|class|-|Glueful\Routing\Attributes|Routing/Attributes/Route.php|
|Route|class|-|Glueful\Routing|Routing/Route.php|
|RouteCache|class|-|Glueful\Routing|Routing/RouteCache.php|
|RouteCompiler|class|-|Glueful\Routing|Routing/RouteCompiler.php|
|RouteManifest|class|-|Glueful\Routing|Routing/RouteManifest.php|
|RouteMiddleware|interface|Native Glueful Middleware Contract|Glueful\Routing|Routing/RouteMiddleware.php|
|Router|class|-|Glueful\Routing|Routing/Router.php|
|SecurityHeadersMiddleware|class|Security Headers Middleware for Next-Gen Router|Glueful\Routing\Middleware|Routing/Middleware/SecurityHeadersMiddleware.php|
|TracingMiddleware|class|-|Glueful\Routing\Middleware|Routing/Middleware/TracingMiddleware.php|
|ValidationMiddleware|class|-|Glueful\Routing\Middleware|Routing/Middleware/ValidationMiddleware.php|

### scheduler

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|JobScheduler|class|Job Scheduler|Glueful\Scheduler|Scheduler/JobScheduler.php|

### security

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|AdaptiveRateLimiter|class|Adaptive Rate Limiter|Glueful\Security|Security/AdaptiveRateLimiter.php|
|AuthFailureTracker|class|Authentication Failure Tracker|Glueful\Security|Security/AuthFailureTracker.php|
|EmailVerification|class|Email Verification System|Glueful\Security|Security/EmailVerification.php|
|Hash|class|Hash Generation and Verification System|Glueful\Security|Security/Hash.php|
|OTP|class|One-Time Password Generator and Validator|Glueful\Security|Security/OTP.php|
|ProductionSecurityValidator|class|Production Security Validator|Glueful\Security|Security/ProductionSecurityValidator.php|
|RandomStringGenerator|class|Random String Generator|Glueful\Security|Security/RandomStringGenerator.php|
|RateLimiter|class|Rate Limiter|Glueful\Security|Security/RateLimiter.php|
|RateLimiterDistributor|class|Rate Limiter Distributor|Glueful\Security|Security/RateLimiterDistributor.php|
|RateLimiterRule|class|Rate Limiter Rule|Glueful\Security|Security/RateLimiterRule.php|
|SecureSerializer|class|Secure Serialization Service|Glueful\Security|Security/SecureSerializer.php|
|SecurityManager|class|Security Manager Class|Glueful\Security|Security/SecurityManager.php|
|SecurityProvider|class|-|Glueful\Security\ServiceProvider|Security/ServiceProvider/SecurityProvider.php|
|VulnerabilityScanner|class|Standalone Vulnerability Scanner|Glueful\Security|Security/VulnerabilityScanner.php|

### serialization

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|SerializationContext|class|-|Glueful\Serialization\Context|Serialization/Context/SerializationContext.php|
|Serializer|class|-|Glueful\Serialization|Serialization/Serializer.php|
|SerializerProvider|class|-|Glueful\Serialization\ServiceProvider|Serialization/ServiceProvider/SerializerProvider.php|

### services

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|ApiMetricsService|class|Service for collecting and analyzing API metrics|Glueful\Services|Services/ApiMetricsService.php|
|ArchiveFile|class|Archive File Information|Glueful\Services\Archive\DTOs|Services/Archive/DTOs/ArchiveFile.php|
|ArchiveHealthChecker|class|Archive Health Checker|Glueful\Services\Archive|Services/Archive/ArchiveHealthChecker.php|
|ArchiveProvider|class|-|Glueful\Services\Archive\ServiceProvider|Services/Archive/ServiceProvider/ArchiveProvider.php|
|ArchiveRestoreOptions|class|Archive Restore Options|Glueful\Services\Archive\DTOs|Services/Archive/DTOs/ArchiveRestoreOptions.php|
|ArchiveResult|class|Archive Operation Result|Glueful\Services\Archive\DTOs|Services/Archive/DTOs/ArchiveResult.php|
|ArchiveSearchQuery|class|Archive Search Query|Glueful\Services\Archive\DTOs|Services/Archive/DTOs/ArchiveSearchQuery.php|
|ArchiveSearchResult|class|Archive Search Result|Glueful\Services\Archive\DTOs|Services/Archive/DTOs/ArchiveSearchResult.php|
|ArchiveService|class|Archive Service Implementation|Glueful\Services\Archive|Services/Archive/ArchiveService.php|
|ArchiveServiceInterface|interface|Archive Service Interface|Glueful\Services\Archive|Services/Archive/ArchiveServiceInterface.php|
|ArchiveSummary|class|Archive System Summary|Glueful\Services\Archive\DTOs|Services/Archive/DTOs/ArchiveSummary.php|
|ExportResult|class|Export Operation Result|Glueful\Services\Archive\DTOs|Services/Archive/DTOs/ExportResult.php|
|FileFinder|class|File Finder Service|Glueful\Services|Services/FileFinder.php|
|HealthCheckResult|class|Health Check Result|Glueful\Services\Archive\DTOs|Services/Archive/DTOs/HealthCheckResult.php|
|HealthService|class|Health Service|Glueful\Services|Services/HealthService.php|
|ImageProcessor|class|Image Processor|Glueful\Services|Services/ImageProcessor.php|
|ImageProcessorInterface|interface|Image Processing Interface|Glueful\Services|Services/ImageProcessorInterface.php|
|ImageSecurityValidator|class|Image Security Validator|Glueful\Services|Services/ImageSecurityValidator.php|
|RestoreResult|class|Archive Restore Result|Glueful\Services\Archive\DTOs|Services/Archive/DTOs/RestoreResult.php|
|RouteHash|class|-|Glueful\Services|Services/RouteHash.php|
|TableArchiveStats|class|Table Archive Statistics|Glueful\Services\Archive\DTOs|Services/Archive/DTOs/TableArchiveStats.php|

### storage

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|ExceptionClassifier|class|Minimal classifier for Flysystem exceptions|Glueful\Storage\Support|Storage/Support/ExceptionClassifier.php|
|PathGuard|class|-|Glueful\Storage|Storage/PathGuard.php|
|StorageException|class|-|Glueful\Storage\Exceptions|Storage/Exceptions/StorageException.php|
|StorageManager|class|-|Glueful\Storage|Storage/StorageManager.php|
|UrlGenerator|class|-|Glueful\Storage\Support|Storage/Support/UrlGenerator.php|

### support

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|AdvancedWhitelistMatcher|class|Advanced whitelist pattern matcher supporting:|Glueful\Support\FieldSelection|Support/FieldSelection/AdvancedWhitelistMatcher.php|
|ApiDefinitionGenerator|class|JSON Definition Generator for API|Glueful\Support\Documentation|Support/Documentation/ApiDefinitionGenerator.php|
|CommentsDocGenerator|class|Comments Documentation Generator|Glueful\Support\Documentation|Support/Documentation/CommentsDocGenerator.php|
|ConfigurableInterface|interface|Configurable Interface|Glueful\Support\Options|Support/Options/ConfigurableInterface.php|
|ConfigurableService|class|Configurable Service Base Class|Glueful\Support\Options|Support/Options/ConfigurableService.php|
|ConfigurableTrait|trait|Configurable Trait|Glueful\Support\Options|Support/Options/ConfigurableTrait.php|
|DocGenerator|class|API Documentation Generator|Glueful\Support\Documentation|Support/Documentation/DocGenerator.php|
|FieldNode|class|Immutable node representing a selected field and its children|Glueful\Support\FieldSelection|Support/FieldSelection/FieldNode.php|
|FieldSelectionMetrics|class|Performance metrics collector for field selection operations|Glueful\Support\FieldSelection\Performance|Support/FieldSelection/Performance/FieldSelectionMetrics.php|
|FieldSelector|class|Lightweight value-object exposed to controllers (DI-injectable)|Glueful\Support\FieldSelection|Support/FieldSelection/FieldSelector.php|
|FieldTree|class|Root wrapper around a map of top-level FieldNodes|Glueful\Support\FieldSelection|Support/FieldSelection/FieldTree.php|
|FieldTreeCache|class|Caching layer for parsed field trees to improve performance|Glueful\Support\FieldSelection\Performance|Support/FieldSelection/Performance/FieldTreeCache.php|
|GraphQLProjectionParser|class|-|Glueful\Support\FieldSelection\Parsers|Support/FieldSelection/Parsers/GraphQLProjectionParser.php|
|InvalidFieldSelectionException|class|-|Glueful\Support\FieldSelection\Exceptions|Support/FieldSelection/Exceptions/InvalidFieldSelectionException.php|
|PerformanceDashboard|class|Performance dashboard for field selection metrics|Glueful\Support\FieldSelection\Performance|Support/FieldSelection/Performance/PerformanceDashboard.php|
|Projector|class|Applies a FieldTree to arrays/objects and runs expanders for relations|Glueful\Support\FieldSelection|Support/FieldSelection/Projector.php|
|RestProjectionParser|class|-|Glueful\Support\FieldSelection\Parsers|Support/FieldSelection/Parsers/RestProjectionParser.php|
|SimpleOptionsResolver|class|A very small subset of Symfony OptionsResolver for internal use|Glueful\Support\Options|Support/Options/SimpleOptionsResolver.php|
|Version|class|Glueful Framework Version Information|Glueful\Support|Support/Version.php|

### tasks

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|CacheMaintenanceTask|class|-|Glueful\Tasks|Tasks/CacheMaintenanceTask.php|
|DatabaseBackupTask|class|-|Glueful\Tasks|Tasks/DatabaseBackupTask.php|
|LogCleanupTask|class|-|Glueful\Tasks|Tasks/LogCleanupTask.php|
|NotificationRetryTask|class|NotificationRetryProcessor|Glueful\Tasks|Tasks/NotificationRetryTask.php|
|SessionCleanupTask|class|-|Glueful\Tasks|Tasks/SessionCleanupTask.php|
|TasksProvider|class|-|Glueful\Tasks\ServiceProvider|Tasks/ServiceProvider/TasksProvider.php|

### testing

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|TestCase|class|-|Glueful\Testing|Testing/TestCase.php|

### uploader

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|FileUploader|class|-|Glueful\Uploader|Uploader/FileUploader.php|
|FlysystemStorage|class|-|Glueful\Uploader\Storage|Uploader/Storage/FlysystemStorage.php|
|StorageInterface|interface|-|Glueful\Uploader\Storage|Uploader/Storage/StorageInterface.php|
|UploadException|class|-|Glueful\Uploader|Uploader/UploadException.php|
|ValidationException|class|-|Glueful\Uploader|Uploader/ValidationException.php|

### validation

| Symbol | Kind | Summary | Namespace | File |
|--------|------|---------|-----------|------|
|Coerce|class|-|Glueful\Validation\Support|Validation/Support/Coerce.php|
|DbUnique|class|-|Glueful\Validation\Rules|Validation/Rules/DbUnique.php|
|Email|class|-|Glueful\Validation\Rules|Validation/Rules/Email.php|
|InArray|class|-|Glueful\Validation\Rules|Validation/Rules/InArray.php|
|Length|class|-|Glueful\Validation\Rules|Validation/Rules/Length.php|
|MutatingRule|interface|-|Glueful\Validation\Contracts|Validation/Contracts/MutatingRule.php|
|Range|class|-|Glueful\Validation\Rules|Validation/Rules/Range.php|
|Required|class|-|Glueful\Validation\Rules|Validation/Rules/Required.php|
|Rule|interface|-|Glueful\Validation\Contracts|Validation/Contracts/Rule.php|
|Rules|class|Sugar factory for building Validators from rules|Glueful\Validation\Support|Validation/Support/Rules.php|
|Sanitize|class|Applies simple sanitization functions to scalar/string values|Glueful\Validation\Rules|Validation/Rules/Sanitize.php|
|Type|class|-|Glueful\Validation\Rules|Validation/Rules/Type.php|
|ValidationException|class|-|Glueful\Validation|Validation/ValidationException.php|
|ValidationProvider|class|-|Glueful\Validation\ServiceProvider|Validation/ServiceProvider/ValidationProvider.php|
|Validator|class|-|Glueful\Validation|Validation/Validator.php|
|ValidatorInterface|interface|-|Glueful\Validation\Contracts|Validation/Contracts/ValidatorInterface.php|

<!-- END GENERATED:core-types -->
