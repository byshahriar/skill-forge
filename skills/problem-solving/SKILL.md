---
name: problem-solving
description: Lateral-thinking techniques for getting unstuck — simplification cascades, inversion, forced analogies, meta-patterns, and extreme-scale testing, dispatched by how you're stuck. Use when conventional approaches feel inadequate, complexity keeps growing, a solution feels forced, or you've been circling the same problem without progress.
license: MIT
---

# Problem Solving

## Overview

Different kinds of stuck need different techniques. This skill is a dispatcher plus five lateral-thinking tools: match the *symptom* of your stuckness to the technique, apply it deliberately, and combine techniques when one isn't enough. The point is not creativity theater — each technique exists because a specific failure mode of ordinary thinking blocks a specific kind of progress.

## When to Use

- Conventional solutions feel inadequate and iteration isn't converging
- Complexity keeps growing: special cases, config options, near-duplicate implementations
- A solution feels forced, or "it must be done this way" can't be justified
- The same problem keeps reappearing in different shapes
- Unsure whether an approach survives production reality

**When NOT to use:** Code is behaving wrongly — that's `debug` (root cause, not creativity). The problem is under-specified — that's `discovery`/`requirements`. Don't reach for lateral techniques to avoid finishing ordinary work.

## The Dispatch Table

| How you're stuck | Technique |
|---|---|
| **Complexity spiraling** — same thing implemented 5+ ways, growing special-case list | Simplification cascade |
| **Forced by assumptions** — "must be done this way", can't question the premise | Inversion |
| **Need a breakthrough** — everything in-domain has been tried | Collision-zone thinking |
| **Recurring shapes** — same issue in different places, reinventing wheels | Meta-pattern recognition |
| **Scale uncertainty** — will it survive production? where are the limits? | Scale game |
| **Code broken / test failing** | → `debug`, not this skill |
| **Several independent problems at once** | → `multi-agent` parallel dispatch |

One technique at a time; if it doesn't bite in 10–15 minutes, switch or combine (find the pattern with meta-recognition, then cascade-simplify all its instances; force a metaphor, then invert its assumptions).

## Technique 1: Simplification Cascade

One insight can eliminate ten components. Look for the unifying principle: **"everything here is a special case of ___".**

Symptoms → likely cascade: same thing implemented 5+ ways → abstract the common pattern · growing special-case list → find the general case · complex rules with exceptions → find the rule with no exceptions · excessive config options → find defaults that serve 95%.

Process: list the variations → ask what's the same underneath → extract the abstraction → **test that every case fits cleanly** (a cascade with two "except for…" survivors isn't a cascade — it's a sixth implementation).

Classic cascades: "batch/real-time/file/network handlers are all just stream sources" (4 implementations → 1 processor) · "session tracking, rate limiting, connection pooling are all per-entity resource limits" (4 systems → 1 governor) · "treat everything as immutable data + transformations" (entire classes of sync bugs gone).

## Technique 2: Inversion

Flip each assumption and see what still works. **List what "must" be true → invert each → explore the implications → keep the inversions that actually work somewhere.**

| Normal assumption | Inverted | What it reveals |
|---|---|---|
| Cache to reduce latency | Add latency deliberately | Debouncing, batching windows |
| Pull data when needed | Push before needed | Prefetching, eager loading |
| Handle errors when they occur | Make errors impossible | Type systems, contracts |
| Build what users want | Remove what users don't need | Subtraction as strategy |
| Optimize the common case | Optimize the worst case | Resilience patterns |

Trigger phrases that demand inversion: "there's only one way to do this", "this is just how it's done", any "must be" you can't defend when asked why.

## Technique 3: Collision-Zone Thinking

Force two unrelated concepts together: **"what if we treated X like Y?"** — then mine the emergent properties and map where the metaphor breaks (the break points teach as much as the matches).

Example: distributed system with cascading failures, treated like an electrical circuit → circuit breakers, fuses, fault isolation, load distribution. Works for failure isolation; breaks on retry logic (circuits don't retry) — and that break is exactly where the design needs its own idea.

Best source domains: physics, biology, economics, logistics, psychology. Wild combinations outperform safe ones; document failed collisions too.

## Technique 4: Meta-Pattern Recognition

A pattern appearing in **3+ unrelated domains** is probably a universal principle worth extracting. Spot the repetition → describe the abstract form domain-independently → note the per-domain variation points → ask where else it applies.

Example: rate limiting appears in API throttling, traffic shaping, circuit breakers, admission control → abstract form: *bound resource consumption to prevent exhaustion* → new application: token budgets for LLM context windows. Same pattern, battle-tested elsewhere, free to reuse.

Red flag you're missing one: "this problem is unique" (it almost never is), or two teams independently building "different" things identically.

## Technique 5: Scale Game

Test the approach at 1000x extremes — bigger/smaller, faster/slower, more/fewer users, milliseconds/years of uptime, never-fails/always-fails. **What breaks exposes hidden limits; what survives is fundamentally sound.**

Examples: "handle errors as they occur" works at normal scale; at a billion events the error volume itself is the outage — revealing you need errors made impossible (types) or expected (chaos engineering). Synchronous calls work in one process; at global latency they're unusable — the async requirement was always there, hidden by the small scale.

The game costs ten minutes of thought and regularly finds the flaw production would have found at 3am.

## Common Rationalizations

| Excuse | Reality |
|---|---|
| "I don't have time for thinking games" | You're stuck. The current plan's time estimate is already fiction. Fifteen structured minutes beats another hour of circling. |
| "The complexity is inherent to the domain" | Sometimes. But five implementations of the same idea is never domain complexity — it's a missed cascade. |
| "Analogies are unrigorous" | Untested analogies are. The technique includes finding where the metaphor breaks — that's the rigor. |
| "We'll deal with scale when we get there" | The scale game isn't about building for scale — it's about *knowing* which limits exist so the choice is conscious. |
| "I already know why we do it this way" | Then inversion costs nothing and confirms it. "Can't articulate why" is the actual red flag. |

## Red Flags

- Circling the same approach for the third time without new information
- A "must" you can't justify when questioned
- Special-case count growing with every requirement
- Reaching for these techniques on a broken test (that's `debug`)
- Trying all five techniques shotgun-style instead of dispatching by symptom

## Verification

- [ ] Stuck-type identified and matched to a technique before applying one
- [ ] Technique's process actually followed (not just name-dropped)
- [ ] Insights tested against the real problem (all cases fit / metaphor boundaries mapped / inversions validated)
- [ ] Outcome recorded — including failed techniques, into `knowledge-base` when durable
- [ ] If still stuck after two techniques: escalated with a clear statement of what was tried
