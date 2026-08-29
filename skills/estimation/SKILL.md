---
name: estimation
description: Sizes work with relative estimates — story points or t-shirt sizes — surfacing uncertainty, spikes, and re-estimation triggers instead of false precision. Use when sizing stories or tasks for planning, when asked "how long will this take", or when estimates keep being badly wrong.
license: MIT
---

# Estimation

## Overview

Estimation that treats uncertainty as data. Relative sizes (points, t-shirts) beat hours because humans compare better than they measure; the estimate's job is to expose disagreement and risk *before* the sprint, not to predict the calendar. The most valuable output of an estimation session is usually the conversation a disagreement forces.

## When to Use

- Sizing stories before `sprint-planning`
- A stakeholder asks "how big is this?" and needs an honest answer
- Estimates have been consistently wrong and the process needs recalibration
- Deciding whether something needs a spike before it can be sized

**When NOT to use:** Deadline commitments to customers — that's forecasting from measured velocity plus buffer, not per-story sizing; don't dress a promise as an estimate.

## Scales

**Story points (Fibonacci: 1, 2, 3, 5, 8, 13, 21)** — the gaps are the point: as size grows, precision honestly degrades. Anchor the scale to real past work:
- **1** — trivial, known shape (copy change with a test)
- **2–3** — routine: known pattern, this codebase, no unknowns
- **5** — real work: multiple files, some design, edges to handle
- **8** — big: touches multiple areas, at least one open question
- **13** — too big to trust: split it or spike it before committing
- **21** — not an estimate; a flag that says "epic"

**T-shirt (S/M/L/XL)** — for roadmap-level sizing of epics; convert to points only when broken into stories.

**With AI-assisted implementation**, mechanical size matters less and *irreducible uncertainty* matters more: integration unknowns, decision latency, review cycles, and validation dominate the timeline. Estimate those, not keystrokes — a 500-LOC CRUD screen can be a 2; a 10-line change to an undocumented legacy flow can be a 8.

## Process

1. **Read the story and its acceptance criteria.** Unestimable usually means criteria are missing — send it back to `user-stories`.
2. **Compare, don't measure.** "Is this bigger than the auth story (a 3)?" beats "how many hours?"
3. **Estimate independently, then reveal** (planning-poker style — even asynchronously). Convergent estimates → take it and move on. Divergent → the gold: have the high and low explain. One of them knows something.
4. **Name the uncertainty explicitly.** Each 5+ story gets an uncertainty note: what's unknown, what would change the size.
5. **Spike the unestimable.** If the range is "3 or 13 depending on X", don't average to 8 — time-box a spike to resolve X, then estimate.

## Uncertainty Flags

Attach to any story where they apply — these change sprint planning:

- 🔍 **Spike needed** — can't size until X is answered
- 🔗 **External dependency** — size assumes another team/service delivers
- 🧨 **Legacy zone** — touches code with no tests / no docs; multiply your instinct by 2
- 🌊 **Scope liquid** — stakeholder still deciding; estimate is a snapshot
- ⏱ **Latency-bound** — waiting (reviews, approvals, environments) dominates effort

## Re-Estimation Triggers

Re-estimate mid-flight (and say so out loud) when:
- Acceptance criteria change
- The spike lands and the unknown resolves
- Two days in, actual effort has doubled the estimate's implication — that's information, not shame
- The chosen approach changes (e.g., a review sends it a different way)

Never silently absorb a blown estimate — the whole system calibrates on honest updates.

## Calibration Loop

At `retrospective` time, compare estimates to actuals *by category, not by story*: which uncertainty flags predicted blowups? Which anchor stories drifted? Recalibrate anchors quarterly. Velocity (points completed per sprint, averaged over 3+ sprints) is a *planning input*, never a performance metric — the moment it's a target, the points inflate and the signal dies.

## Worked Example: A Divergent Estimate

Story: *"Add CSV export to the transactions table."* Acceptance criteria exist. Independent votes come back: **3, 3, 13**.

Don't average to a 6. The 13 explains:

> "Last time we touched export, the streaming path corrupted non-ASCII characters, and transactions can be 2M rows — you can't buffer that in memory. There's no test coverage on that path."

The 3s explain:

> "The reporting table already has CSV export — I assumed we'd reuse `exportToCsv()`."

Now the real conversation: does `exportToCsv()` stream? Nobody knows. **That's a spike** — timebox 2 hours: "determine whether the existing export helper streams and handles UTF-8; output is a yes/no and a code pointer." The story leaves the sprint queue as 🔍 until the spike lands.

Spike result: it streams, but encodes Latin-1. Re-vote: **5, 5, 5** — reuse the streamer, fix the encoding, add the missing tests. The uncertainty note reads: *"5 assuming exportToCsv's encoding fix is local; if it's shared with reporting, re-estimate — blast radius doubles."*

What made this work: the divergence was surfaced instead of averaged, the unknown became a cheap spike instead of a mid-sprint surprise, and the final estimate carries its own re-estimation trigger.

## Common Rationalizations

| Excuse | Reality |
|---|---|
| "Just tell me the hours" | Hours communicate false precision. Give a range with the assumption that dominates it: "2–4 days if the API does X; a spike tells us by Tuesday." |
| "We'll average the 3 and the 13" | An 8 that nobody believes. The divergence IS the finding — make the two explain. |
| "Estimation meetings waste time" | Long ones do. The fix is anchors + independent votes + only discussing divergence — not skipping sizing and discovering the epic mid-sprint. |
| "AI makes everything fast now, size everything small" | AI compresses typing, not uncertainty. The unknowns that made it an 8 are usually still there. |
| "We're bad at estimating, why bother" | Un-calibrated, yes. The calibration loop is the fix; abandoning sizing just moves the surprise to the deadline. |

## Red Flags

- A 13 accepted into a sprint without a split or spike
- Estimates produced by one person and rubber-stamped
- Uncertainty flags never used — either the work is miraculously certain or the flags are being skipped
- Velocity quoted in a performance review
- A blown estimate discovered at sprint end instead of day 2

## Verification

- [ ] Every story sized on the agreed scale against named anchors
- [ ] Divergent estimates discussed, not averaged
- [ ] Uncertainty flags attached where applicable; spikes created for unestimables
- [ ] Estimates recorded where planning can see them
- [ ] Calibration notes fed to the next retrospective
