---
name: orchestrator
description: Routes any request to the right skill-forge skill and chains them through the development lifecycle. Use when unsure which skill fits, when starting a multi-phase piece of work, or when asked "which skill should I use", "what's the right workflow for this", or to run a full lifecycle end to end.
license: MIT
---

# Orchestrator

## Overview

The map of the skill-forge suite: what each skill does, when it fires, and the proven sequences between them. This is a routing *document* loaded into the main session — not an agent hop. It answers two questions: "which skill fits this request?" and "what comes next after the current skill finishes?"

## Routing Table

| The request sounds like… | Skill |
|---|---|
| "Is this idea worth building?" / "stress-test this idea" | `discovery` |
| "Help me pin down requirements" (one question at a time) | `requirements` |
| "Write the spec" / turn intent into precise behavior | `specify` |
| "Break this into tasks" / plan the implementation | `plan` |
| "Think bigger" / challenge scope / 10x version | `ceo-review` |
| "Is this over-engineered?" / feasibility check on a plan | `eng-review` |
| "How will this feel to use?" (plan-stage UI) | `ux-review` |
| "Is this easy to adopt?" (APIs/SDKs/CLIs) | `dx-review` |
| "Run all the reviews on this plan" | `auto-review` |
| Write stories / acceptance criteria / split an epic | `user-stories` |
| Size the work / story points | `estimation` |
| Plan the sprint / what to take on | `sprint-planning` |
| Groom / prioritize / clean up the backlog | `backlog-refinement` |
| Daily update / "what did I do yesterday" | `standup` |
| "What shipped this week?" / sprint retro | `retrospective` |
| Implement a feature (slice by slice) | `implement` |
| Any logic change or bug fix (test first) | `tdd` |
| Design an API or interface | `api-design` |
| Build UI | `ui-engineering` |
| Set the quality bar / enforce conventions | `standards` |
| "It works" — prove it / challenge green checkmarks | `verify` |
| Understand unfamiliar/upstream code before using it | `code-research` |
| Manage context budget / save-restore working state | `context` |
| "Remember this" / project learnings | `knowledge-base` |
| "What should this look like?" / fonts, colors, system | `design-system` |
| "Show me a few design directions" | `design-concepts` |
| "Polish this UI" / does it look AI-generated? | `design-qa` |
| "Draw the architecture" / flowchart | `technical-diagrams` |
| Something's broken / error / root cause | `debug` |
| Test the app in a browser / QA sweep | `web-qa` |
| "It's slow" / optimize / regression check | `perf` |
| "How healthy is the codebase?" | `code-health` |
| Review this PR / diff | `code-review` |
| Simplify / reduce complexity | `refactor` |
| Security audit / harden this | `security` |
| Ship it / release / deploy | `release` |
| Watch the deploy | `canary-watch` |
| CI/CD pipelines | `ci-cd` |
| Branching / commits / versioning | `git-workflow` |
| Logs / metrics / traces / alerts | `observability` |
| Deprecate / migrate off something | `modernization` |
| Write docs / ADR / README / runbook | `docs` |
| "Be careful" / prod work / restrict edits | `guardrails` |
| Split work across parallel agents | `multi-agent` |
| Stuck — complexity spiraling, forced assumptions, need a breakthrough | `problem-solving` |
| Create or fix an agent skill | `skill-authoring` |
| Unfamiliar domain or tech — "research this", "deep-dive" | `research` |
| Build or fix an MCP server / expose an API to agents | `mcp-development` |
| Production is down / alert fired / users affected | `incident-response` |
| Schema change, migration, backfill, slow query | `database` |
| Timeouts, retries, circuit breakers, failure design | `resilience` |
| Build an AI/LLM-powered feature, prompt keeps regressing | `llm-features` |

## Lifecycle Sequences

**Full feature (the long road):**
```
discovery → specify → plan → [ceo-review → ux-review → eng-review → dx-review | auto-review]
→ user-stories → estimation → sprint-planning
→ implement (tdd per slice) → verify → code-review → release → canary-watch
```
Most work doesn't need the whole road. Cut from the front, never the back: skipping discovery on a well-understood feature is fine; skipping verify and code-review before release is not.

**Bug fix:** `debug` → `tdd` (reproduce as a failing test) → fix → `verify` → `code-review` → `release`

**"Make it pretty":** `design-system` (if none exists) → `design-concepts` (if direction unclear) → `ui-engineering` → `design-qa`

**Slow app:** `perf` (measure first) → `implement` fixes → `perf` (prove the delta) → `release`

**Legacy cleanup:** `code-health` (baseline) → `refactor` / `modernization` → `code-health` (delta)

**Sprint cadence:** `backlog-refinement` → `sprint-planning` → daily `standup` → `retrospective` → repeat

**Risky/production session:** `guardrails` first, then whatever the work is.

**Unfamiliar territory:** external domain/tech → `research` → `specify`; this repo's code → `code-research` → the work.

**Agent tooling:** `api-design` (fundamentals) → `mcp-development` (agent-facing inversions) → `tdd` → `code-review` → `release`.

**Production incident:** `incident-response` (mitigate → diagnose → comms) → `debug` (root cause) → `resilience` / `observability` (so it fails better next time) → postmortem actions to `backlog-refinement`.

**Data change:** `database` (design + expand/contract plan) → `eng-review` for risky migrations → `implement` → `canary-watch` on the deploy.

**AI feature:** `llm-features` (evals first) → `security` (LLM section) → `resilience` (the model is a network dependency) → `release`.

**Stuck mid-anything:** `problem-solving` (dispatch by stuck-type) — unless code is misbehaving, which is `debug`.

**Standalone or grouped — both are first-class.** Every skill is self-contained and works invoked alone; the sequences above are composition patterns, not dependencies. A skill's hand-off pointers ("then consider X") are offers, not requirements — take the single skill when the task is one skill big, chain when the work spans phases.

## Mandatory Hops

Some skills aren't routed by request — they fire automatically on their trigger, whatever else is happening:

| Trigger | Mandatory skill |
|---|---|
| About to implement anything creative | `discovery` Three-Paths classification + explicit approval |
| Writing any production logic | `tdd` — failing test first |
| Any bug / test failure / unexpected behavior | `debug` — root cause before fixes |
| About to claim "done / fixed / passing" | `verify` — the Completion Gate |
| Before merge or PR | `code-review`; before push — `release`'s Push Gate |
| Stuck and circling | `problem-solving` — dispatch by stuck-type |
| Production down or degraded for real users | `incident-response` — mitigate before diagnosing |
| Migration against a table with real data | `database` — expand/contract, tested down path |

Routing answers "what did the user ask for?"; mandatory hops answer "what does this moment require regardless?" Both apply.

## Suite Protocol

Applies inside every skill:

- **Announce the skill** in one line when you start applying it, so the user can redirect
- **Decision briefs** for anything put to the user: numbered (D1, D2…), one decision per brief, recommendation with reason, honest pros/cons, explicit confirmation for one-way doors (full format in the review skills)
- **Completion status** on finish: DONE (with evidence) / DONE_WITH_CONCERNS (listed) / BLOCKED (what was tried) / NEEDS_CONTEXT (exactly what's missing). DONE with unmet Verification items doesn't exist — that's DONE_WITH_CONCERNS.

## Routing Rules

1. **Route by the noun and the phase.** "Review" of a *plan* → the persona reviews; of a *diff* → `code-review`; of a *live UI* → `design-qa`; of an *idea* → `discovery`.
2. **When two skills both fit, pick the earlier-phase one.** If the spec is shaky, reviewing the plan polishes the wrong artifact.
3. **Don't stack ceremony on small work — but never skip the approval.** Classify first (see `discovery`'s Three Paths): a spike needs a nod, a bounded change needs a short design in chat and an explicit yes, and only architectural work needs the full lifecycle. The artifact scales down; the approval gate doesn't. When in doubt, take the heavier path — and hidden complexity discovered mid-task upgrades the path, never downgrades it.
4. **Chain, announce, and hand off.** When a skill completes, name the natural next skill and let the user decide — no silent auto-chaining through judgment gates (that's the paraphrasing-orchestrator anti-pattern from `multi-agent`).
5. **Unknown territory → `code-research` first.** Most mis-routed work is really "we didn't understand the existing system yet."

## Common Rationalizations

| Excuse | Reality |
|---|---|
| "The request is vague, I'll just start coding" | Vague requests are exactly what `discovery`/`requirements` are for. Code written against a guess is rework with extra steps. |
| "Run the whole lifecycle every time to be safe" | Ceremony on trivial work teaches people to skip process on important work. Weight to risk. |
| "I'll chain everything automatically, the user wants results" | The gates between phases are where humans catch wrong-direction work. Announce and hand off. |

## Verification

- [ ] Request mapped to a specific skill (or two, with the phase rule applied)
- [ ] Process weight matches change risk
- [ ] On completion, the next skill in the sequence was named for the user
