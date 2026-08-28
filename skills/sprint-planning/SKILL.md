---
name: sprint-planning
description: Plans a sprint — goal, capacity, story selection, and commitment — from a refined backlog and real velocity. Use when starting a sprint or iteration, when asked "what should we take on this sprint", or when sprints keep ending with half-done work.
license: MIT
---

# Sprint Planning

## Overview

Sprint planning that produces three things: a **sprint goal** (one sentence of why this sprint matters), a **commitment** the team actually believes (capacity- and velocity-based, not hope-based), and a **plan for day one** (who starts on what). The most common failure it guards against: treating the sprint as a bucket to fill instead of a bet to make.

## When to Use

- Start of a sprint/iteration
- Re-planning after a mid-sprint disruption big enough to void the plan
- A solo developer time-boxing the next 1–2 weeks of work

**When NOT to use:** The backlog is unrefined — run `backlog-refinement` first; planning from a pile of vague items just schedules the vagueness. Stories unsized — run `estimation` first.

## Inputs

- Refined, estimated backlog (top items meet the definition of ready: clear criteria, sized, unblocked)
- **Measured velocity** — average points completed over the last 3+ sprints (not the best sprint; the average)
- **Capacity adjustments** — holidays, on-call rotations, meetings-heavy weeks, new team members: subtract before planning, not after failing
- Carry-over: unfinished work from last sprint gets re-examined (still valuable? re-estimate remaining) — never auto-rolled

## Workflow

**Step 1 — The sprint goal.**
One sentence, outcome-shaped: "Users can complete checkout end-to-end in staging" — not "do the checkout stories". The test: mid-sprint tradeoffs should be decidable by asking "does this serve the goal?" No goal that passes the test = you're about to fill a bucket.

**Step 2 — Capacity.**
```
capacity = velocity avg (3+ sprints)
         × (available person-days this sprint / normal person-days)
         − known taxes (on-call, support rotation, release duties)
```
First sprint with no history? Plan by picking stories and sanity-checking day-count against the team's gut; measure from here.

**Step 3 — Select stories.**
Walk the refined backlog top-down:
1. Goal-serving stories first — the goal decides ties, not personal preference
2. Stop at ~85% of capacity. The remaining 15% absorbs the unplanned work that always comes; a plan at 100% is a plan to fail publicly.
3. Check dependency order: nothing selected that waits on something unselected
4. Every 8-point story gets a second look — is it really not splittable? (`user-stories` splitting patterns)
5. At most one 🔍 spike-flagged story per sprint per person — unknowns burn attention, not just time

**Step 4 — Sanity walk.**
Before committing, walk the sprint as a story: day 1 who starts what → mid-sprint what's integrating → last days what's landing and being verified. If everything lands on the final day, the plan is a cliff — reorder for a steady landing pattern. Confirm the **definition of done** applies to every item (tested, reviewed, deployed-or-deployable — the project's standing bar).

**Step 5 — Commit and record.**
```
# Sprint <n> — <dates>
Goal: <one sentence>
Committed: <N> points across <M> stories (capacity <C>, buffer <C−N>)
Stories: [id, title, points, owner-on-day-1]
Risks: [flagged uncertainties + the plan if they fire]
Not this sprint: [what was explicitly deferred and why]
```

The "Not this sprint" list matters as much as the commitment — it's what turns mid-sprint "can you just also…" into a documented trade instead of silent scope creep.

## During the Sprint

- New work arrives → trade explicitly: name what leaves the sprint to make room, or it goes to the backlog
- The goal becomes unreachable → say so immediately and re-plan; a dead goal silently carried is worse than a re-plan
- Daily state tracked via `standup`; the sprint closes with `retrospective`

## Common Rationalizations

| Excuse | Reality |
|---|---|
| "We can squeeze in one more story" | The 15% buffer isn't slack, it's the measured cost of reality. Fill it and the *committed* work pays. |
| "Velocity was 40 once, use 40" | Once. The average is the estimate; the best is the outlier you'll be judged against. |
| "The sprint goal is: finish the stories" | That's the bucket, not a bet. No goal means every mid-sprint decision escalates or goes random. |
| "Carry-over rolls automatically" | Half-done work re-earns its place. Sometimes the remaining half lost its value last Thursday. |
| "Planning is overhead, we know what to do" | Ten minutes of sanity-walk catches the dependency that would've stalled day 3. The plan is cheap; the stall isn't. |

## Red Flags

- Commitment equals or exceeds raw capacity
- No sprint goal, or a goal nobody could use to make a tradeoff
- A selected story depends on an unselected one
- Last sprint's carry-over auto-included without re-examination
- The sprint record exists only in chat scrollback

## Verification

- [ ] Sprint goal written and tradeoff-testable
- [ ] Capacity computed from measured velocity with named adjustments
- [ ] Commitment ≤ ~85% of capacity; dependencies ordered
- [ ] Sanity walk done; landing pattern isn't a last-day cliff
- [ ] Sprint record written with risks and the Not-this-sprint list
