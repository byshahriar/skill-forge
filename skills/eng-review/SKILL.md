---
name: eng-review
description: Reviews a plan through an engineering-manager lens — scope challenge, complexity smells, architecture, tests, performance, and risk. Use when a plan needs feasibility and rigor review before implementation, when asked "is this over-engineered?", or after ceo-review settles scope and the plan needs an engineering pass.
license: MIT
---

# Engineering Review

## Overview

A plan review in engineering-manager mode. Where `ceo-review` challenges *what* to build, this review challenges *how*: is the plan the minimum set of changes that cleanly achieves the goal, does it reuse what exists, is it boring where it should be boring, and will it hold up in production at 3am? The review is interactive — one section at a time, findings surfaced as decisions, never silent rewrites of the plan.

## When to Use

- After scope is settled and before implementation starts
- When a plan smells over-engineered or under-engineered
- When asked for a feasibility check, risk assessment, or "sanity check this approach"
- As phase 3 of `auto-review`

**When NOT to use:** Reviewing written code (use `code-review`); challenging product scope (use `ceo-review`); UI-specific plans (use `ux-review`).

## Engineering Preferences

Use these to guide every recommendation:

- DRY is important — flag repetition aggressively.
- Well-tested code is non-negotiable; too many tests beats too few.
- Code should be "engineered enough" — neither fragile and hacky, nor prematurely abstracted.
- Err toward handling more edge cases, not fewer; thoughtfulness > speed.
- Bias toward explicit over clever.
- Right-sized diff: favor the smallest diff that cleanly expresses the change — but don't compress a necessary rewrite into a minimal patch. If the foundation is broken, say "scrap it and do this instead."
- Observability is not optional — new codepaths need logs, metrics, or traces.
- ASCII diagrams for complex designs, embedded in plans and code comments. Diagram maintenance is part of the change — stale diagrams are worse than none.

## Step 1: Scope Challenge

Before reviewing anything, answer:

1. **Existing-code leverage** — what existing code already partially or fully solves each sub-problem? Can outputs be captured from existing flows rather than building parallel ones?
2. **Minimum change set** — what is the smallest set of changes that achieves the stated goal? Flag anything deferrable without blocking the core objective.
3. **Complexity check** — a plan touching more than 8 files or introducing more than 2 new classes/services is a smell. Challenge whether fewer moving parts achieve the same goal. If this triggers, STOP: name what's overbuilt, propose the minimal version, and ask the user whether to reduce or proceed — before any section review.
4. **Search check** — for each architectural pattern, infrastructure component, or concurrency approach the plan introduces: does the framework have a built-in? Is the approach current best practice? Are there known footguns? A custom solution where a built-in exists is a scope-reduction opportunity.
5. **Completeness check** — is the plan the complete version or a shortcut? With AI-assisted coding, completeness (full edge cases, error paths, test coverage) is 10–100x cheaper than it used to be. If the shortcut only saves minutes, recommend the complete version.
6. **Distribution check** — if the plan introduces a new artifact type (CLI, package, image, app), does it include the build/publish pipeline and install story? Code without distribution is code nobody can use. If deferred, put it in "NOT in scope" explicitly.

**Once the user accepts or rejects a scope recommendation, commit fully.** Do not re-argue during later sections; do not silently reduce scope or skip planned components.

## Step 2: Section Review

One section at a time, at most 8 top issues per section, ordered by severity:

1. **Architecture** — boundaries, dependency direction, blast radius, migration path
2. **Code quality** — repetition, naming, right-sized abstractions, explicit over clever
3. **Tests** — name the specific test cases the plan needs: happy path, each named error, each edge case. Include a test diagram for non-obvious setups. Never accept "add tests" as a plan line.
4. **Performance** — hot paths, N+1 access patterns, payload sizes, caching implications

For each finding: what's wrong, why it matters (user or maintainer impact), and the concrete fix. Present genuine decisions to the user as options with a recommendation — don't decide taste calls unilaterally.

## Step 3: Think Like an Eng Manager

Instincts to apply throughout — internalize, don't enumerate:

1. **Blast radius instinct** — what's the worst case, and how many systems/people does it hit?
2. **Boring by default** — every team gets about three innovation tokens; everything else should be proven technology. New infrastructure spends a token — is it worth it?
3. **Incremental over revolutionary** — strangler fig, not big bang; canary, not global rollout; refactor, not rewrite.
4. **Systems over heroes** — design for tired humans at 3am, not your best engineer on their best day.
5. **Reversibility preference** — feature flags, staged rollouts; make the cost of being wrong low.
6. **Essential vs accidental complexity** — is this solving a real problem or one we created?
7. **Two-week smell test** — if a competent engineer can't ship a small feature in two weeks, you have an architecture problem disguised as onboarding.
8. **Make the change easy, then make the easy change** — refactor first, implement second; never structural + behavioral changes in one step.
9. **Own it in production** — no wall between dev and ops; the plan's authors carry its pager.
10. **Error budgets over uptime targets** — reliability is a resource to allocate, not a trophy.

## Step 4: Required Outputs

- Findings per section with severity and concrete fixes
- **Test plan** — the named test cases the implementation must include
- Updated "NOT in scope" entries for anything deferred during the review
- ASCII diagrams for any non-trivial flow the plan adds
- Verdict: SHIP AS-IS / SHIP WITH CHANGES / RETHINK, with the top must-fix items
- Implementation tasks updated to reflect accepted findings

## Productive Tensions

Not every disagreement in a plan review needs resolving. A tension is **productive** — worth preserving, not settling — when both approaches optimize different valid priorities (cost vs latency, simplicity vs capability), the "better" choice depends on deployment context rather than technical superiority, and the trade-off won't disappear with clever engineering. Preserve those via configuration or a documented seam, and record *why both exist*.

Force resolution only when: the approaches fundamentally can't coexist, preserving both is prohibitively expensive, one is clearly superior *for this use case*, or it's a one-way door that locks the architecture. Prematurely resolving a context-dependent tension destroys flexibility the review was supposed to protect.

## Decision Brief Format

Every decision put to the user is a **brief**, not a question mark. Number them (D1, D2, …) within a session and carry all of:

```
D<N> — <one-line question title>
Context:  <one grounding sentence — what we're deciding and where>
Plain-English stakes: <2–3 sentences anyone could follow; what breaks,
  what the user sees, what's lost if we pick wrong>
Recommendation: <choice> because <one-line reason>
Options:
A) <label> (recommended)
   + <concrete, observable benefit>
   − <honest cost>
B) <label>
   + <benefit>
   − <cost>
Net: <one line naming the actual trade-off>
```

Rules: one decision per brief — never batch unrelated choices. Always include a recommendation with a reason (neutral posture is still a recommendation: "either works; default A"). When options differ in *coverage*, say so explicitly (complete vs happy-path vs shortcut). With 5+ real options, split into sequential briefs rather than dropping any — the user's option set is sacred. For one-way-door or destructive choices, require an explicit typed confirmation and state plainly what is irreversible.

## Common Rationalizations

| Excuse | Reality |
|---|---|
| "The complexity is justified by future needs" | Speculative generality is accidental complexity. Review against today's requirement plus known—not imagined—trajectory. |
| "We can skip the search check, I know this stack" | The check takes two minutes and catches built-ins that erase whole plan sections. |
| "Tests are implementation detail, not plan detail" | Unnamed tests don't get written. The test list is plan scope. |
| "The user approved the plan already" | They approved the goal. Feasibility and rigor findings are new information they need. |
| "8 files is arbitrary" | It is — that's why it's a smell test, not a rule. Triggering it means *justify*, not *abort*. |

## Red Flags

- You're reviewing section 2 and never ran the scope challenge
- A finding was fixed by silently editing the plan instead of surfacing a decision
- The test section of the plan still says "add tests"
- You recommended new infrastructure without noting it spends an innovation token
- The review produced zero findings — plans that survive contact with this checklist untouched are rare; look harder or say explicitly why it's genuinely clean

## Verification

- [ ] Scope challenge ran and its outcome was explicitly settled with the user
- [ ] All four sections reviewed, findings ordered by severity
- [ ] Test plan names concrete cases, including error paths and edge cases
- [ ] Every accepted finding landed in the plan document
- [ ] Verdict delivered with top must-fix items
