---
name: resilience
description: Designs systems that degrade instead of collapsing — timeouts, retries with backoff, circuit breakers, idempotency, and graceful fallbacks. Use when integrating any network dependency or external API, when failures cascade across services, when a slow dependency takes down the caller, or when adding retry or queue logic.
license: MIT
---

# Resilience

## Overview

Every network call fails eventually; the design question is what happens next. Resilience is the discipline of deciding that *in advance* — because the default answer, chosen by omission, is "hang until something upstream also hangs." Most production outages are not caused by a component failing. They are caused by a component failing *in a way the callers were not designed for*.

**Core principle:** a dependency's failure should degrade your service, never define it.

## When to Use

- Adding or reviewing any call across a network boundary (HTTP, RPC, queue, database, third-party API)
- One slow or failing dependency is taking down callers that don't strictly need it
- Adding retry, queue, or background-job logic
- Designing for partial failure: which features must work when X is down?
- After an incident whose root cause was a cascade (`incident-response` → here)

**When NOT to use:** Making a healthy system faster — that's `perf`. Diagnosing a specific live failure — that's `debug`. Instrumenting so failures are visible — that's `observability` (its complement: this skill decides behavior, that one decides visibility).

## The Failure Budget: Four Questions Per Dependency

Answer these for every network dependency, and write the answers down — an unanswered one is a default you didn't choose:

1. **How long do we wait?** (timeout)
2. **Do we try again?** (retry policy — and is that safe?)
3. **What do we do when it's definitively down?** (fallback / degradation)
4. **How do we stop hammering it while it's down?** (circuit breaker / load shedding)

## 1. Timeouts

**Every network call has an explicit timeout.** A call without one inherits the client library's default, which is frequently "forever" — and an unbounded wait converts someone else's outage into yours by exhausting your connection pool or thread pool.

- Set timeouts from **observed latency**, not intuition: p99 plus headroom. A timeout below p99 turns normal slowness into errors; one at 30s when p99 is 200ms is barely a timeout at all.
- **Budget them across the chain.** If the user-facing request has a 3s budget and calls three services, those cannot each have a 3s timeout. Pass the remaining budget down; a call with no time left should fail immediately rather than start.
- **Connect timeout and read timeout are different.** Set both.
- The deadline belongs to the *whole* operation, retries included — otherwise a "2s timeout with 3 retries" is quietly a 6+ second call.

## 2. Retries

Retries turn transient failures into invisible ones — and turn a struggling dependency into a dead one. Both are true, so the policy matters:

- **Only retry what is safe to repeat.** Reads and idempotent writes: yes. Non-idempotent writes: only with an idempotency key (below). "It probably didn't go through" is how duplicate charges happen.
- **Only retry what might succeed next time.** Timeouts, connection resets, 429, 503: yes. 400, 401, 404, 422: never — the answer will not change, and retrying wastes the budget you might need.
- **Exponential backoff with jitter**, always. Fixed-interval retries from many clients synchronize into a thundering herd that keeps the dependency down:
  ```
  delay = min(cap, base * 2^attempt) * random(0.5, 1.0)     # full jitter
  ```
- **Cap attempts (2–3 is usually right) and cap total time** against the caller's deadline. Deep retry chains multiply: three services each retrying three times is 27 calls for one user action.
- **Never retry in more than one layer.** Client library + service wrapper + gateway each retrying "just twice" is eight attempts nobody designed.

## 3. Idempotency

Idempotency is what makes retries safe, and it must be designed in — it cannot be added by the caller.

- **Idempotency key**: the client generates a unique key per logical operation and sends it with every attempt. The server stores the key with the result; a repeat key returns the stored result instead of acting again. This is the standard for payments and any create-with-side-effect.
- **Natural idempotency** where possible: `PUT` semantics (set to this value) over `POST` (add another), state transitions guarded by the current state (`WHERE status = 'pending'`), and unique constraints that make the duplicate impossible rather than merely unlikely (see `database`).
- **Consumers of queues must assume duplicate delivery.** Nearly every queue is at-least-once; a consumer that isn't idempotent is a data-corruption bug waiting for its first redelivery.

## 4. Circuit Breakers and Load Shedding

When a dependency is down, continuing to call it wastes your resources and delays its recovery.

**Circuit breaker states:**
```
CLOSED  → normal; count failures over a rolling window
        → threshold exceeded (e.g. >50% of ≥20 requests)
OPEN    → fail fast immediately, don't call the dependency
        → after a cooldown
HALF-OPEN → allow a few trial requests
        → success: CLOSED   ·   failure: OPEN again
```

The point is not the failure — it's failing *fast and cheap*, so your threads, connections, and user requests aren't consumed waiting on something you already know is broken.

**Bulkheads:** give each dependency its own connection/thread pool. Without isolation, one slow dependency drains the shared pool and takes down features that never touched it. This is the mechanism behind most "why did the whole site go down when search broke?" postmortems.

**Load shedding:** when overloaded, reject some requests fast rather than serving all of them badly — every request timing out at once serves nobody. Shed by priority (health checks and paying-customer paths last).

## 5. Graceful Degradation

Decide per feature, at design time, what "dependency down" means to the user:

| Dependency | Degradation |
|---|---|
| Recommendations service | Show popular items; page still renders |
| Avatar/CDN asset | Initials placeholder |
| Analytics | Drop the event; never block the user action |
| Search | Fall back to a simple DB query, fewer features |
| Payments | **No degradation possible** — fail explicitly and clearly |

Two rules: **classify every dependency as critical or optional**, and make sure an optional one *cannot* fail the request (a non-critical call inside the critical path with no timeout is the classic mistake). Cache the last-known-good value where staleness is acceptable and say so in the UI ("prices updated 5 minutes ago") — silent stale data is a correctness bug, labeled stale data is a feature.

## Testing Resilience

Resilience that has never been exercised is a hypothesis. Test the failure paths as deliberately as the happy path:

- Unit/integration tests that inject timeouts, errors, and slow responses — not just failures, but *slowness*, which is the harder case
- Verify the breaker opens, half-opens, and closes; verify retries stop at the cap; verify a duplicate idempotency key doesn't act twice
- Exercise dependency failure in a staging environment (kill it, block it, add latency) and confirm the degradation is the one you designed
- Alert on the resilience mechanisms themselves: breaker open, retry rate spike, shed count — these are leading indicators of an incident, and `observability` should surface them

## Common Rationalizations

| Excuse | Reality |
|---|---|
| "The client library has sensible defaults" | Its default is often no timeout and sometimes silent retries. Read them; set them explicitly. |
| "We'll add retries if it becomes a problem" | Fine — but the timeout isn't optional. A missing timeout is how one slow dependency exhausts your pool. |
| "Retrying is harmless" | Retrying a non-idempotent write is a duplicate. Retrying without jitter is a thundering herd. Retrying a 400 is pure waste. |
| "This dependency is reliable" | Reliable means it fails rarely, not never — and rare failures are exactly the ones nobody designed for. |
| "Degradation logic is extra complexity" | The alternative isn't simplicity; it's an outage in a feature that didn't need the dependency at all. |
| "It's an internal service, not a third party" | Internal services fail as often as external ones and are usually called more tightly. Same four questions. |
| "We tested the error path in code review" | Reading code proves intent, not behavior. Inject the failure and watch. |

## Red Flags

- A network call with no explicit timeout anywhere in the stack
- Retry logic at more than one layer of the same call
- Retries on non-idempotent writes with no idempotency key
- A queue consumer that assumes exactly-once delivery
- One shared connection pool across all dependencies
- Non-critical calls inside the critical path with no fallback
- Fallback code that has never been executed, in any environment
- Timeout values that are round numbers nobody derived from latency data

## Verification

- [ ] Every network dependency has all four answers written down (timeout, retry, fallback, breaker)
- [ ] Timeouts derived from observed latency and budgeted across the call chain
- [ ] Retries: idempotent-only, retryable-errors-only, backoff with jitter, capped, single-layer
- [ ] Idempotency keys (or natural idempotency) on every retryable write; consumers duplicate-safe
- [ ] Dependencies classified critical vs optional; optional ones cannot fail the request
- [ ] Breaker/bulkhead behavior verified by injected failure, not by reading code
- [ ] Resilience signals (breaker state, retry rate, shed count) instrumented and alerted
