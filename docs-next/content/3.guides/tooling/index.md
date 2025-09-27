---
title: Tooling
description: Overview of development tooling: CLI, testing, configuration, deployment
navigation:
  icon: i-lucide-wrench
---

# Tooling Overview

High‑level map of the developer tooling surface. Drill into the focused guides below.

**Audience:** Application & platform engineers establishing consistent workflows (local dev → CI → production). If you only need one topic, jump directly to its guide—this index shows relationships and maturity.

## Scope & Goals

| Goal | Description | Primary Guide |
|------|-------------|---------------|
| Fast Feedback | Tight loop: code → static analysis → tests | Testing / CLI |
| Consistent Style | Shared formatting & naming conventions | CLI & Console (authoring) |
| Safe Configuration | Isolated env overrides & secret injection | Configuration |
| Reliable Ship | Repeatable build & deploy steps | Deployment |
| Extensibility | Pluggable commands & extension discovery | CLI & Console |
| Operational Readiness | Hooks for observability & health | Deployment / Observability |

## Status Matrix

| Area | Implemented | Notes |
|------|-------------|-------|
| CLI Bootstrapping | ✅ | Single entry point `glueful` auto-wires container |
| Command Authoring | ✅ | Extension commands discovered post cache rebuild |
| Static Analysis | ✅ | PHPStan level 6 + strict & deprecation rules |
| Coding Standard | ✅ | PHPCS (PSR-12) enforced on `src/` |
| Test Suite Structure | ✅ | Unit / Integration / Feature / Performance suites in `phpunit.xml` |
| Config Layering | ✅ | Environment-driven via `.env` & `config/*.php` |
| Config Caching | ❌ | Roadmap (planned `config:cache`) |
| Deployment Guide | 🟡 | Placeholder depth—expansion planned |
| Diagnostics Commands | ❌ | Future (locks, health, services) |
| Scaffolding Generators | ❌ | Roadmap (models, controllers, extensions) |
| Tracing & Metrics CLI | ❌ | Pending observability exporters |

Legend: ✅ Available, 🟡 Partial, ❌ Not yet.

## Guides

| Area | Summary | Link |
|------|---------|------|
| CLI & Console | Run built‑in commands and author your own for automation. | [CLI & Console](/guides/tooling/cli-and-console) |
| Testing | Layered test strategy (unit, integration, feature, performance). | [Testing](/guides/tooling/testing) |
| Configuration | Environment layering, secrets handling, future config caching. | [Configuration](/guides/tooling/configuration) |
| Deployment | Targets (FPM, Swoole, RoadRunner, containers) & rollout considerations. | [Deployment](/guides/tooling/deployment) |

## When to Use What

- Spinning up or inspecting runtime commands → CLI & Console.
- Validating logic, persistence and HTTP flows → Testing.
- Adjusting behavior per environment or secret rotation → Configuration.
- Shipping to staging/production or planning rollout strategy → Deployment.

## Quick Reference

| Concern | Primary Tooling |
|---------|-----------------|
| Code Style | PHPCS (PSR-12) |
| Static Analysis | PHPStan (strict + deprecations) |
| Test Runner | PHPUnit (suites separated) |
| Extension Discovery | `glueful extensions:cache` |
| Async / Background | Queue worker + scheduler CLI |

## Quick Start Checklist

1. Install dependencies: `composer install`.
2. Copy `.env.example` → `.env`; set `APP_ENV=local`.
3. Run static analysis early: `vendor/bin/phpstan analyse`.
4. Run focused test suite: `vendor/bin/phpunit --testsuite Unit`.
5. Rebuild extension cache after adding packages: `php glueful extensions:clear && php glueful extensions:cache`.
6. Establish pre-commit hooks (PHPStan + PHPCS) in your VCS.
7. Draft CI pipeline (analysis → tests → build artifact → deploy stage).
8. Document deployment target (FPM container, etc.) using Deployment guide template.

## Related Core Guides

- Observability & Telemetry (operational visibility)
- Scheduling (time-based job execution)
- Distributed Locks (coordination & contention avoidance)

## Maintenance Cadence

| Interval | Action | Purpose |
|----------|--------|---------|
| Each Commit | Run PHPStan + PHPUnit fast suites | Catch regressions early |
| Daily | Full test matrix (includes Performance) | Detect latent perf drift |
| Weekly | Dependency audit (`composer audit`) | Security posture |
| Release Prep | Tag & run deployment dry-run | Validate build artifacts |
| Quarterly | Revisit PHPStan level / rules | Increase strictness gradually |

## Roadmap Snapshot

1. Config caching & warm boot sequence.
2. Developer diagnostics (`dev:services`, `locks:list`, `health:check`).
3. Generators (controller/model/extension scaffolds).
4. Watch mode runner (change-aware tests + static analysis batching).
5. Tracing & metrics exporter commands (`trace:tail`, `metrics:export`).
6. Deployment blueprints (Docker + process manager variants: FPM, Swoole, RoadRunner).
7. JSON log formatter activation toggle (ties to Observability).

## Summary

This index frames how tooling layers interlock: author commands & extensions (CLI), enforce correctness (Tests + Static Analysis), manage runtime variability (Configuration), and ship predictably (Deployment). Track the status matrix to know where you can rely on built-ins vs where to prototype via custom extensions.
