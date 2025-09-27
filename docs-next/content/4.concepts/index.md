title: Concepts
description: Core ideas and mental models behind Glueful
navigation:
  icon: i-lucide-lightbulb

# Concepts

Concept articles explain the why behind Glueful design decisions and provide durable mental models you can apply across guides, APIs, and extensions. Use them to orient new teammates or make architectural trade‑offs confidently.

## Audience

| Role | Needs |
|------|-------|
| Application engineer | Understand how to extend safely |
| Platform / infra engineer | Clarify lifecycle hooks & deployment semantics |
| Extension author | Stable abstractions & integration contracts |
| Tech lead / architect | Evaluate constraints & roadmap maturity |

## At a Glance Taxonomy

| Category | Concepts (current / planned) |
|----------|------------------------------|
| Lifecycle & Execution | Request lifecycle, Boot sequence, Shutdown semantics  |
| Composition & DI | Service container, Autowiring patterns, Provider bootstrap |
| HTTP & Controllers | Controller base capabilities, Routing resolution model |
| Security & Access | Core authorization (Gate, voters, policies), RBAC extension model, Permission evaluation path, Rate limiting, Idempotency tokens |
| State & Data | Caching layers, Query caching, Distributed locks coordination |
| Resilience & Performance | Backpressure, Circuit / retry strategy , Memory monitoring thresholds |
| Observability | Logging taxonomy, Metrics dimensions (roadmap), Trace propagation (roadmap) |
| Error Handling | Exception classification, Recovery patterns |
| Operational | Configuration layering, Deployment topology, Versioning strategy |

## Concept Document Structure

Each concept article should follow a consistent outline:

1. Problem framing (what pain / ambiguity does this solve?)
2. Mental model (diagram or succinct analogy)
3. Core principles (non-negotiable invariants)
4. Lifecycle / flow (step or sequence if applicable)
5. Extension points (where you can plug in safely)
6. Trade-offs / alternatives considered
7. Anti-patterns (what not to do and why)
8. Cross references (related concepts & guides)
9. Roadmap deltas (what will evolve)

## Relationships Map (Textual Overview)

- Request lifecycle drives controller execution which depends on routing resolution.
- Routing & middleware leverage the container for handler instantiation.
- Service providers populate the container and may register events, CLI commands, or config merges.
- RBAC integrates with routing/permissions middleware to authorize resolved controller actions.
- Caching strategies (application + query + edge) hang off service/container config and are tuned by environment.
- Backpressure & rate limiting intercept earlier in the pipeline to protect downstream services & queue consumers.
- Observability (logs now, metrics/traces upcoming) instruments each stage: routing, controller, DB, queue.
- Error handling catches thrown exceptions, classifies, logs, then maps to standardized HTTP/problem responses.

## Maturity Legend

| Status | Meaning |
|--------|---------|
| Stable | Backwards compatibility commitments in place |
| Evolving | API shape mostly stable; internals may change |
| Experimental | Subject to redesign; feedback encouraged |
| Roadmap | Planned, not yet implemented |

## Current Status Snapshot

| Concept | Status | Notes |
|---------|--------|-------|
| Service container | Stable | Core for DI, used by console & routing |
| Service providers | Evolving | Additional lifecycle hooks under consideration |
| Request lifecycle | Evolving | Formal diagram to be published |
| Controller patterns | Evolving | BaseController extension surface may expand |
| RBAC model | Evolving | Extension-defined; fine-grained audit events roadmap |
| Caching strategies | Evolving | Configured; edge/distributed features partial |
| Observability model | Evolving | Logging shipped; metrics/tracing roadmap |
| Error handling | Stable | Classification approach defined |
| Rate limiting | Stable | Integration tests exist; advanced adaptive algorithms roadmap |
| Idempotency & backpressure | Roadmap | Patterns documented in scheduling/queue guides upcoming |
| Performance principles | Evolving | Memory monitoring config present |

## Principle Examples

| Principle | Example |
|-----------|---------|
| Explicit over implicit | Service provider must register its own extension config under prefix |
| Fail fast | Configuration validation (roadmap) stops boot with aggregated errors |
| Idempotent core operations | Queue job handlers safe to retry after interruption |
| Layered observability | Structured logs now; metrics/traces slot in without code churn later |
| Isolation of side effects | Config files run without network I/O for deterministic boot |

## Drafting New Concept Articles

When introducing a new concept article:

1. Validate it is not solely tutorial material (focus on mental models, not step-by-step).
2. Provide at least one diagram (ASCII if no rendered asset yet) clarifying flow.
3. Tag status (Stable/Evolving/Experimental/Roadmap).
4. Cross-link at least two other concept or guide pages.
5. List 2–3 anti-patterns early—helps readers avoid misuse fast.

## Example Mini-Model (Request Lifecycle Sketch)

```
Inbound HTTP -> Kernel bootstrap -> Routing match -> Middleware stack -> Controller -> Domain services -> Response build -> After hooks / logging -> Terminate
```

Roadmap additions: metrics emission at start/end, tracing span boundaries around controller + DB.

## Concept Articles (Current & Planned)

Below are the canonical concept topics. Items not yet published are marked . When individual pages are created, replace the inline descriptions with links.

- [Request lifecycle](/concepts/request-lifecycle)  – Full sequence & middleware ordering
- [Service container & autowiring](/concepts/service-container)  – Resolution rules, scopes, performance notes
- [Service providers & bootstrapping](/concepts/service-providers)  – Registration phases & ordering guarantees
- [Controller patterns & BaseController](/concepts/controller-patterns)  – Handler composition & thin-controller guidance
- [Core authorization (Gate & policies)](/concepts/authorization-core)  – Gate strategy, voter pipeline, policies vs attributes
- [RBAC extension permission model](/concepts/authorization-rbac)  – Persistent roles, assignments, auditing & when to adopt
- [Caching strategies](/concepts/caching-strategies)  – Layering: in-process → distributed → edge; invalidation patterns
- [Observability model](/concepts/observability-model)  – Logs today, metrics/tracing propagation roadmap
- [Error handling & exceptions](/concepts/error-handling)  – Classification, mapping to responses, retry guidance
- [Idempotency, rate limiting, backpressure](/concepts/resilience-controls)  – Protective flow controls & coordination with queues
- [Performance principles](/concepts/performance-principles)  – Memory ceilings, payload budgets, cold start minimization

### Core Authorization vs RBAC Extension

Glueful ships a lightweight authorization core: Gate + voters (roles, scopes, ownership, policies) + optional config-defined roles and policies. This satisfies most early and medium complexity needs. The RBAC extension builds on that foundation by adding persistent storage, granular assignment (resource & expiring permissions), auditing, and advanced management APIs. Documentation intentionally separates these so you can:

| Scenario | Use Core Only | Add RBAC Extension |
|----------|---------------|--------------------|
| Static role → permission mapping | ✅ | Optional |
| Policy-based resource checks | ✅ | Same (policies still apply) |
| Per-resource, expiring grants | ❌ | ✅ |
| Audit trail / change history | ❌ | ✅ |
| Dynamic user-level overrides | Limited (custom voter) | ✅ |
| Administrative UI / APIs | Build yourself | Provided / extensible |

Adopt the extension when operational complexity (dynamic teams, compliance, auditing) justifies the added persistence layer. Until then, prefer the simpler core for lower cognitive and runtime overhead.

## Roadmap Highlights

| Area | Upcoming Focus |
|------|----------------|
| Config Validation | Schema registry & `config:validate` command |
| Observability | Metrics export + OpenTelemetry tracing hooks |
| Performance | Config cache & route cache commands |
| Security | Fine-grained permission event audit trail |
| Resilience | Backpressure controls + circuit breaker policy abstraction |
| Documentation | Auto-generated concept relationship diagram |

## Cross References

- Tooling Guides (CLI, Testing, Configuration, Deployment) for execution context.
- Core Services (Scheduling, Locks, Uploads, Observability) for applied patterns.
- Tutorials for practical end-to-end application of these abstractions.

## Summary

Concepts provide the stable mental scaffolding for daily development. Start with lifecycle, container, and error handling; layer in caching, RBAC, and observability as complexity grows. Track the maturity table to anticipate change and consult roadmap sections before tightly coupling to evolving areas.
