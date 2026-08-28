---
name: auto-review
description: Runs the full review pipeline — ceo-review, ux-review, eng-review, dx-review — sequentially over a plan with principled auto-decisions, surfacing only taste calls and user challenges at a final gate. Use when the user wants a complete plan review without stopping at every question, or says "run all the reviews", "full review pass", or "auto-review this plan".
license: MIT
---

# Auto Review

## Overview

An orchestration skill: runs the persona reviews (`ceo-review` → `ux-review` → `eng-review` → `dx-review`) over a plan sequentially, auto-answering intermediate questions with six decision principles instead of interrupting the user each time. Mechanical decisions are made silently, taste decisions are made with a recommendation and surfaced at the end, and user challenges are never auto-decided. One final approval gate presents everything.

## When to Use

- The user wants the whole review battery without babysitting it
- A plan is mature enough that most review questions have principled answers
- Time-boxed review before implementation starts

**When NOT to use:** Early, ambiguous plans where scope itself is the open question — run `ceo-review` interactively instead. Never use it to dodge a decision the user explicitly wanted to make.

## The 6 Decision Principles

These auto-answer every intermediate question:

1. **Choose completeness** — ship the whole thing; pick the approach that covers more edge cases.
2. **Boil lakes** — fix everything in the blast radius (files the plan modifies + their direct importers). Auto-approve expansions that are in blast radius AND small (< 5 files, no new infrastructure).
3. **Pragmatic** — two options fix the same thing? Pick the cleaner one. Five seconds choosing, not five minutes.
4. **DRY** — duplicates existing functionality? Reject. Reuse what exists.
5. **Explicit over clever** — a 10-line obvious fix beats a 200-line abstraction. Pick what a new contributor reads in 30 seconds.
6. **Bias toward action** — flag concerns, don't block on them.

**Conflict tiebreakers by phase:** CEO phase — principles 1+2 dominate. Eng phase — 5+3. Design phase — 5+1.

## Decision Classification

Every decision the pipeline encounters is classified:

- **Mechanical** — one clearly right answer. Auto-decide silently. (Run the extra check? Always yes. Reduce scope on an already-complete plan? Always no.)
- **Taste** — reasonable people could disagree: close alternative approaches, borderline blast-radius scope, or a second-opinion model disagreeing with a valid point. Auto-decide with the recommendation, **and surface it at the final gate** for override.
- **User Challenge** — the review concludes the user's *stated direction* should change (merge features they wanted separate, drop something they asked for, reverse an explicit choice). **Never auto-decided.** Goes to the final gate with:
  - What the user said
  - What the review recommends and why
  - What context the review might be missing
  - If we're wrong, the cost is: …

  The user's original direction is the default; the review must make the case for change, not the other way around. Exception framing: if the challenge is a security or feasibility risk — not a preference — say so explicitly and urgently. The user still decides.

## Workflow

**Phase 0 — Intake + restore point.**
Snapshot the plan as it stands (copy the plan file or record its state) so the pipeline's edits can be reviewed as a diff and re-run if needed. Read project context: repo docs, TODO list, any design doc, recent git history.

**Phase 1 — CEO review (strategy & scope).**
Load and execute the `ceo-review` skill against the plan. Mode selection is auto-decided as SELECTIVE EXPANSION unless the user pre-specified one. Expansion opt-ins are decided by principle 2 (blast radius + small = accept; otherwise defer to the TODO list and record as a taste decision).

**Phase 2 — UX review (conditional).**
Skip with a one-line note if the plan has no UI scope. Otherwise execute `ux-review`; objective violations are fixed into the plan (mechanical), taste calls recorded.

**Phase 3 — Eng review.**
Execute `eng-review`. If a second-opinion channel is available (another model, a colleague's review, a code-review tool), gather it here and fold disagreements into taste decisions or user challenges.

**Phase 4 — DX review (conditional).**
Skip with a one-line note if there is no developer-facing scope. Otherwise execute `dx-review`.

**Sequential execution is mandatory** — each phase builds on the plan as amended by the previous one. Do not run phases in parallel or reorder them.

**Phase 5 — Final gate.**
Present one consolidated report:

```
# Auto-Review Report
Plan: <name>            Phases run: CEO, UX*, Eng, DX*   (*skipped: reason)

## Auto-decided (mechanical) — N decisions        [collapsed list, one line each]
## Taste decisions — decided with recommendation   [each: context, decision, why, how to override]
## User challenges — YOUR call                     [each: full framing per classification above]
## Plan changes                                    [diff summary vs the Phase 0 snapshot]
## Verdict                                         SHIP AS-IS / SHIP WITH CHANGES / RETHINK + top must-fixes
```

Wait for the user to resolve user challenges and any taste overrides, apply them, then hand off to `plan` / implementation.

## What "Auto-Decide" Means

Auto-decide means *applying the principles*, not skipping the thinking. Each auto-decision still gets: the question, the chosen answer, the principle applied, one line of reasoning — recorded in the report. If a question doesn't map cleanly to a principle, it is a taste decision by definition; when unsure between taste and challenge, escalate to challenge.

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
| "The user chose auto-review, so they want zero questions" | They delegated *intermediate* questions. User challenges are exactly what they'd want to hear about. |
| "Surfacing every taste call defeats the purpose" | Taste calls are decided — they're surfaced for *override*, collapsed in one section. That's the contract. |
| "The phases overlap, running two would be faster" | Each phase reviews the plan as amended by the last. Parallel phases review stale plans and produce conflicting edits. |
| "This finding is obviously right, no need to classify it" | Unclassified findings are how user challenges get silently auto-decided. Classify everything. |

## Red Flags

- A phase edited the plan and the change isn't in the final report's diff summary
- A user challenge was resolved without the user
- Phases ran out of order or a conditional phase was skipped without a stated reason
- The report's mechanical section contains a scope change larger than the blast-radius rule allows
- No restore point exists

## Verification

- [ ] Restore point captured before phase 1
- [ ] All applicable phases ran sequentially; skips have stated reasons
- [ ] Every decision classified and recorded (mechanical / taste / challenge)
- [ ] Zero user challenges auto-decided
- [ ] Final report delivered; plan diff matches the report
- [ ] User resolved the final gate before implementation began
