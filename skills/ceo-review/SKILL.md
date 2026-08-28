---
name: ceo-review
description: Reviews a plan through a founder/CEO lens — challenges premises, finds the 10x version, expands or ruthlessly cuts scope. Use when asked to "think bigger", "expand scope", "strategy review", "rethink this", "is this ambitious enough", or before committing to a plan whose scope or ambition is in question.
license: MIT
---

# CEO Review

## Overview

A plan review in founder mode. You are not here to rubber-stamp the plan — you are here to make it extraordinary, catch every landmine before it explodes, and make sure that when it ships, it ships at the highest possible standard. The review challenges the premise before it polishes the execution: is this the right problem, is this the most direct path, and what would the 10x version look like?

## When to Use

- Before committing to a significant plan or PRD
- When the user questions whether a plan is ambitious enough — or too ambitious
- When asked to "think bigger", "rethink this", or "strip this down"
- After `discovery` produces a design doc and before `plan` breaks it into tasks

**When NOT to use:** Small, well-understood changes; bug fixes; plans already through this review this cycle. For engineering-rigor review use `eng-review`; for UI plans use `ux-review`.

## Step 1: Pick a Mode

Ask the user which posture they want (recommend one based on the plan):

| Mode | Posture |
|---|---|
| **SCOPE EXPANSION** | Build a cathedral. Envision the platonic ideal, push scope up, ask "what's 10x better for 2x the effort?" Every expansion is still the user's opt-in. |
| **SELECTIVE EXPANSION** | Hold current scope as baseline and make it bulletproof; separately surface each expansion opportunity as an individual opt-in decision. |
| **HOLD SCOPE** | Scope is accepted. Maximum rigor: catch every failure mode, edge case, and error path. Do not silently grow or shrink the plan. |
| **SCOPE REDUCTION** | Be a surgeon. Find the minimum viable version that achieves the core outcome. Cut everything else, ruthlessly. |

**Critical rule:** the user is 100% in control. Every scope change is an explicit opt-in — never silently add or remove scope. Once a mode is selected, commit to it; do not drift toward a different mode mid-review. Raise concerns once, then execute the chosen mode faithfully.

**Completeness is cheap:** AI-assisted coding compresses implementation 10–100x. When weighing "approach A (complete, ~150 LOC) vs approach B (90%, ~80 LOC)", prefer A — the delta costs minutes, not days. "Ship the shortcut" is legacy thinking from when human hours were the bottleneck.

This is a review. Do NOT make code changes or start implementation.

## Step 2: Pre-Review System Audit

Before reviewing the plan, understand the system it lands in:

```bash
git log --oneline -30                 # recent history
git diff <base> --stat                # what's already changed on this branch
git stash list                        # in-flight work
grep -rn "TODO\|FIXME\|HACK" -l --exclude-dir=node_modules --exclude-dir=.git . | head -30
git log --since=30.days --name-only --format="" | sort | uniq -c | sort -rn | head -20   # hot files
```

Then read the project docs (CLAUDE.md / AGENTS.md, TODO lists, architecture docs, any design doc from `discovery`). Note:

- What already exists that partially solves this? What's in flight?
- Do any deferred TODOs relate to, block, or get unlocked by this plan?
- **Retrospective check:** were areas this plan touches previously problematic (review-driven refactors, reverts)? Review those harder — recurring problem areas are architectural smells.
- **UI scope detection:** if the plan touches any UI, flag it for `ux-review` as a follow-up.

## Step 3: Nuclear Scope Challenge

**3A. Premise challenge**
1. Is this the right problem? Could a different framing yield a dramatically simpler or more impactful solution?
2. What is the actual user/business outcome? Is the plan the most direct path, or is it solving a proxy problem?
3. What happens if we do nothing? Real pain or hypothetical?

**3B. Existing-code leverage**
Map every sub-problem to existing code. Is the plan rebuilding anything that already exists? If yes, why is rebuilding better than refactoring?

**3C. Dream-state mapping**
```
CURRENT STATE          THIS PLAN              12-MONTH IDEAL
[describe]      --->   [describe delta] --->  [describe target]
```
Does this plan move toward the ideal or away from it?

**3D. Implementation alternatives (mandatory)**
Produce 2–3 distinct approaches — one must be the minimal viable version, one the ideal architecture, and they carry equal weight:

```
APPROACH A: [name]
  Summary / Effort (S/M/L/XL) / Risk (Low/Med/High)
  Pros / Cons / Reuses: [existing code leveraged]
```

Recommend one with a one-line reason, then **stop and get the user's decision** before proceeding. A "clearly winning approach" is still an approach decision.

**3E. Mode-specific analysis**
- *Expansion:* the 10x check (10x more value for 2x effort — describe concretely), the platonic ideal (start from what the user feels, not the architecture), and at least 5 "delight opportunities" — adjacent 30-minute improvements that make the feature sing. Present each expansion as an individual opt-in: add to scope / defer to the TODO list / skip.
- *Selective expansion:* run the Hold-Scope analysis first, then present each expansion candidate neutrally, one at a time, for cherry-picking.
- *Hold scope:* complexity check — a plan touching more than 8 files or introducing more than 2 new classes/services is a smell; challenge whether fewer moving parts achieve the same goal.
- *Reduction:* what is the absolute minimum that ships value? Separate "must ship together" from "nice to ship together" — the latter becomes follow-up work.

## Step 4: Deep Review Sections

Work through the sections that apply, in priority order (never skip 1, 2, or 6):

1. **Architecture** — boundaries, coupling, blast radius, one-way vs two-way doors
2. **Error & rescue map** — every error has a name: the specific exception, what triggers it, what catches it, what the user sees, whether it's tested. Catch-all handlers are a smell.
3. **Security & threat model** — new codepaths need threat modeling; it is not optional
4. **Data-flow edge cases** — every flow has a happy path and three shadow paths: nil input, empty input, upstream error. Trace all four. Every interaction has edge cases: double-click, navigate-away mid-action, slow connection, stale state, back button.
5. **Code quality** — DRY violations, right-sized diff, explicit over clever
6. **Tests** — well-tested is non-negotiable; name the test cases, don't say "add tests"
7. **Performance** — hot paths, N+1s, payload sizes
8. **Observability** — new dashboards, alerts, and runbooks are first-class scope, not post-launch cleanup
9. **Deployment & rollout** — deployments are not atomic; plan for partial states, rollbacks, feature flags
10. **Long-term trajectory** — does this solve today's problem but create next quarter's nightmare?
11. **Design & UX** — only if UI scope was detected; hand the depth to `ux-review`

**Prime directives across all sections:**
- Zero silent failures — if a failure can happen invisibly, that is a critical defect in the plan
- Diagrams are mandatory for non-trivial flows — ASCII art for data flows, state machines, pipelines, decision trees
- Everything deferred must be written down. Vague intentions are lies — a TODO file entry or it doesn't exist.
- You have permission to say "scrap it and do this instead" when a fundamentally better approach exists

## Step 5: Think Like a CEO

Apply these instincts throughout — internalize, don't enumerate:

- **Classification instinct** — categorize decisions by reversibility × magnitude (one-way vs two-way doors). Most are two-way; move fast.
- **Inversion reflex** — for every "how do we win?" also ask "what would make us fail?"
- **Focus as subtraction** — the primary value-add is deciding what *not* to do. Default: fewer things, better.
- **Speed calibration** — 70% information is enough to decide; only slow down for irreversible + high-magnitude calls.
- **Proxy skepticism** — are the metrics still serving users, or have they become self-referential?
- **Temporal depth** — think in multi-year arcs; apply regret minimization to major bets.
- **Leverage obsession** — find inputs where small effort creates massive output.
- **Edge-case paranoia** — what if the name is 47 chars? Zero results? Network fails mid-action?

## Step 6: Required Outputs

The review is not done until the plan document contains:

- **NOT in scope** — everything considered and explicitly excluded, with reasons
- **What already exists** — the leverage map from 3B
- **Dream-state delta** — from 3C
- **Error & failure-mode registry** — from sections 2 and 4
- **Scope decisions table** — every proposal: accepted / deferred / skipped, with reasoning (expansion modes)
- **Diagrams** — every new data flow, state machine, and pipeline
- **Implementation tasks** — a numbered task list ready for `plan` / `sprint-planning`
- **Review verdict** — SHIP AS-IS / SHIP WITH CHANGES / RETHINK, with the top 3 must-fix items

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
| "The plan is fine, it just needs polish" | If you didn't challenge the premise, you reviewed the execution of possibly the wrong plan. |
| "Expanding scope will slow us down" | Present the expansion and let the user decide — silently withholding options is scope reduction by stealth. |
| "We'll handle errors during implementation" | Unnamed errors don't get handled. Name them in the plan or they ship as silent failures. |
| "The user seemed to want X, so I skipped the alternatives" | Alternatives are mandatory. One option is a decision already made — by you, not the user. |
| "It's obvious which approach wins" | Then the decision brief is cheap to write. Get the explicit yes. |

## Red Flags

- You are reviewing section 5 and the user never picked a mode
- The plan has no "NOT in scope" section after your review
- You proposed a scope change and implemented it into the plan without an explicit user decision
- An error path is described as "handle errors gracefully"
- You are writing code

## Verification

Before reporting the review complete, confirm:

- [ ] A mode was explicitly chosen by the user
- [ ] 2–3 implementation alternatives were presented and one was explicitly approved
- [ ] Every applicable review section produced findings or an explicit "no issues"
- [ ] The plan document contains all Required Outputs
- [ ] Every scope change traces to an explicit user decision
- [ ] Deferred items are written into the project's TODO list, not just mentioned in chat
