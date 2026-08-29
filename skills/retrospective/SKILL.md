---
name: retrospective
description: Runs an engineering retrospective from real repo data — what shipped, commit patterns, hotspots, work rhythms, and week-over-week trends, with per-person contributions on teams. Use when asked "what shipped this week", for a weekly/sprint retro, end-of-sprint review, or when the team wants an evidence-based look at how work actually happened.
license: MIT
---

# Retrospective

## Overview

A retrospective grounded in evidence, not memory. It mines the repo (and PR/issue tracker when available) for what actually happened in the window — features shipped, commit types, hotspots, work sessions, trends — then runs the human half: what went well, what didn't, and what to change, each anchored to the data. History persists so trends compound week over week.

## When to Use

- Weekly or per-sprint retro (pairs with `sprint-planning` for the next cycle)
- "What shipped this week/month?"
- Preparing a status update or demo summary from real activity
- Diagnosing "we feel busy but nothing ships"

**When NOT to use:** Post-incident analysis (blameless postmortem is its own discipline — see `debug` for the root-cause method); performance evaluation of individuals — this data measures activity, not value, and must not be weaponized.

## Step 1: Gather

Define the window (default: 7 days; use 14+ for trend comparison). Fetch first so remote branches are fresh. Collect from git (and `gh`/PR API when available):

- Merged PRs and CHANGELOG entries → **features shipped**
- Commits to main: count, authors, insertions/deletions, test vs production LOC
- Commit timestamps → hourly distribution and work sessions
- Conventional-commit types (feat/fix/refactor/test/chore/docs)
- Most-changed files → hotspots
- Version tags in window

## Step 2: The Metrics Table

| Metric | Value |
|---|---|
| **Features shipped** (leads — what users got) | N |
| Commits to main / PRs merged / contributors | N |
| LOC added/deleted (context, not achievement) | +N/−N |
| Test LOC ratio | N% |
| Active days / detected sessions | N |

**Metric-order rationale:** features shipped leads because it's what users got. Raw LOC is demoted to context — AI inflates it; ten lines of a good fix is not less shipping than ten thousand lines of scaffold.

On teams, add a per-author leaderboard (commits, +/−, top area). Frame contributions as facts and **praise specifically** — per-person growth areas belong in 1:1s, not the retro doc.

## Step 3: Patterns

- **Time distribution** — hourly commit histogram: peak hours, dead zones, late-night clusters (a recurring after-10pm cluster is a sustainability flag, not a badge)
- **Work sessions** — group commits with a 45-minute gap threshold: deep (50+ min), medium (20–50), micro (<20, fire-and-forget). Lots of micro-sessions = fragmented focus.
- **Commit types** — percentage bar of feat/fix/refactor/test/chore. **Flag fix-ratio > 50%**: a ship-fast/fix-fast pattern that usually signals review or testing gaps.
- **Hotspots** — files changed 5+ times in the window. Churn concentrated in one file is either the week's feature or an architectural smell; decide which.
- **PR size distribution** — small (<100 LOC) / medium (100–500) / large (>500); a large-heavy week explains slow reviews.

## Step 4: Trends (windows ≥ 14 days or with history)

Compare against the prior window and stored history: shipped-per-week slope, fix-ratio trend, test-ratio trend, session depth trend. Streaks worth naming (consecutive weeks shipping, weeks with rising test ratio). Persist this run to `.retro/history.jsonl` (date, window, key metrics) so next retro compares automatically.

## Step 5: The Human Half

With the data on the table, run the classic retro — each item anchored to evidence:

- **Went well** — tie to data ("shipped the editor rewrite — 3 deep sessions, test ratio 38%")
- **Didn't go well** — tie to data ("fix ratio hit 58%; 4 of 7 fixes were in checkout/ — the hotspot")
- **Ship of the week** — the single most impactful thing that landed; celebrate it specifically
- **Changes for next cycle** — max 3, each with an owner and a check ("move review SLA to same-day — check next retro: PR pickup time")

Feed durable insights to `knowledge-base` and open items into `backlog-refinement`.

## Output

A retro document (chat summary + optional saved file):

```
# Retro — <window>
## Shipped            ## Metrics table        ## Patterns & flags
## Trends             ## Went well / Didn't   ## Changes (max 3, owned)
```

## Worked Example: Data → Insight → Owned Change

A 7-day window produced these numbers: 23 commits, 4 PRs merged, fix ratio **61%** (14 fix / 7 feat / 2 chore), hotspot `checkout/payment.ts` changed 7 times, one 41-commit-day followed by two zero-days, PR sizes: three small, one at 1,840 LOC.

The retro conversation those numbers force — which memory alone would never surface:

- **Fix ratio 61% + one hotspot** → "9 of the 14 fixes touched `payment.ts`. Went-wrong: we shipped the new payment flow without the provider-timeout tests we said we'd write." Anchored, specific, nobody's memory required.
- **The 1,840-LOC PR** → it sat in review for 3 days and produced 2 of this week's fixes. Went-wrong: batch size, not the author.
- **41-commit spike + two dead days** → the deploy freeze compressed the week into one day; sustainability flag, not a productivity trophy.
- **Ship of the week** → the retry queue: shipped Tuesday, zero fixes since, absorbed a provider outage on Thursday silently. Celebrated specifically.

Changes (≤3, owned, checkable next retro):

| Change | Owner | Check at next retro |
|---|---|---|
| Payment-path PRs require the timeout test suite green | Priya | fixes touching `payment.ts` < 3 |
| PRs over 500 LOC get split or pre-agreed | Marcus | large-PR count = 0 |
| *(deliberately only two — last retro's third item was never done)* | | |

The unfinished item from last cycle gets asked about *first* next time — that's the loop that makes retros compound instead of repeat.

## Common Rationalizations

| Excuse | Reality |
|---|---|
| "We remember what happened this week" | Memory keeps the last three days and the loudest incident. The data keeps the week. |
| "LOC and commit counts are meaningless" | As *achievement*, yes. As *patterns* — churn, fragmentation, fix ratio — they're diagnostic. That's why LOC is demoted, not deleted. |
| "Retros always produce the same action items" | Because they're unowned and unchecked. Max 3, owned, verified next retro — or don't bother. |
| "Skip the retro, we're too busy shipping" | A 58% fix ratio says you're busy re-shipping. The retro is how that becomes visible. |
| "Let's use this to see who's underperforming" | That kills the retro instantly — people who know activity data is a weapon start gaming it. Facts and praise in public; growth in private. |

## Red Flags

- Metrics presented with no interpretation ("here are numbers" is not a retro)
- Raw LOC celebrated as productivity
- More than 3 change items, or any without an owner
- Last retro's change items never checked
- Per-person criticism in the shared retro doc

## Verification

- [ ] Window defined, data gathered from real repo history (post-fetch)
- [ ] Metrics table with features-shipped leading
- [ ] Patterns computed: sessions, types (fix-ratio flag), hotspots
- [ ] History persisted; trends shown when history exists
- [ ] Went-well / didn't-go-well anchored to evidence
- [ ] ≤3 owned change items, and last cycle's items checked
