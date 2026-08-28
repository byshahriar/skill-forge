---
name: backlog-refinement
description: Grooms the backlog — clarifies, splits, prioritizes, and prunes items so the top of the backlog is always sprint-ready. Use before sprint planning, when the backlog has become a graveyard of stale items, or when asked to "groom the backlog", "prioritize these", or "clean up the issues".
license: MIT
---

# Backlog Refinement

## Overview

Continuous backlog hygiene: keep the top of the backlog **ready** (clear, sized, unblocked — plannable on sight), the middle **roughly ordered**, and the bottom **honest** (deleted when dead, not hoarded). A backlog is a prioritization device, not an archive; every item it holds costs attention every time someone scans it.

## When to Use

- Regularly, ahead of `sprint-planning` (refinement feeds planning; planning is not the place to discover a story is vague)
- The backlog has 100+ items and nobody can say what's next
- Asked to prioritize, groom, or triage issues
- After `retrospective` produces new items

**When NOT to use:** Mid-sprint scope decisions (that's the sprint-planning trade rule); deep specification of a single complex item (that's `specify`).

## The Ready Bar

An item at the top of the backlog is *ready* when:

- [ ] The problem/outcome is one clear sentence — a new team member gets it on first read
- [ ] Acceptance criteria exist (or a definition of done for technical tasks)
- [ ] It's sized (`estimation`) and small enough for a sprint
- [ ] Dependencies and blockers are named
- [ ] It's still wanted — someone would object if it were deleted

Refinement's job: the next ~2 sprints' worth of items meet this bar. Not the whole backlog — polishing item #94 is waste; it will change or die before it's reached.

## Workflow

**Step 1 — Sweep the top.** For each item in the next-2-sprints zone: does it meet the ready bar? Fix what's fixable inline (sharpen the sentence, add criteria via `user-stories`, size via `estimation`), flag what needs the owner's input, split what's too big.

**Step 2 — Order by value ÷ effort, then adjust.** Base order: expected value over estimated size. Then apply the modifiers that pure math misses:
- **Unblockers first** — an item that unblocks three others jumps the queue
- **Time-decay** — items whose value expires (event, contract, migration window) get scheduled or consciously dropped
- **Risk-first for scary unknowns** — pulling a 🔍 item earlier buys information while there's still time to react
- **Cluster by context** — adjacent items in the same code area batched into one sprint amortize the context-loading

**Step 3 — Prune ruthlessly.** For everything older than ~3 months untouched:
- Still describes a real need? → refresh and re-rank
- Superseded, fixed by other work, or nobody remembers why? → **delete** (or close as won't-do with one line of reasoning)
- "Might be useful someday" → that's what deletion is for; if it matters, it comes back with fresh context

The prune is the step teams skip, and it's why backlogs rot into anxiety lists. Closing an item is an act of prioritization, not loss.

**Step 4 — Dedupe and merge.** Same underlying need filed three ways → one item with the best framing, links from the closed ones.

**Step 5 — Report.**

```
# Refinement — <date>
Ready for planning: N items (M points) — the next sprint can be planned on sight
Fixed inline: N (list)     Needs owner input: N (list, with the question)
Split: A → A1, A2          Pruned: N closed (list with one-line reasons)
Priority changes: [item: old → new position, why]
```

## Common Rationalizations

| Excuse | Reality |
|---|---|
| "Deleting items loses information" | An item nobody has touched in six months *is* the information: it didn't matter. Real needs come back sharper. |
| "We'll refine during sprint planning" | Planning with unready items becomes refinement-under-deadline — the vagueness gets scheduled instead of resolved. |
| "Everything in the backlog is important" | Then nothing is ordered and the backlog decides nothing. Ranking is choosing. |
| "The reporter will be upset if we close it" | A one-line honest close ("superseded by X") respects them more than two years of silent limbo. |
| "Refine the whole backlog properly, once" | The bottom 80% will change before it's reached. Refine the top continuously; let the deep backlog stay rough. |

## Red Flags

- Sprint planning regularly discovers unready items at the top
- Backlog only ever grows; nothing has been closed in months
- The same item reworded in three places
- Item #1 and item #40 got equal refinement attention
- Priority order that nobody can explain ("it's just always been there")

## Verification

- [ ] Next-2-sprints zone meets the ready bar
- [ ] Order reflects value/effort plus the named modifiers
- [ ] Stale items pruned with one-line reasons
- [ ] Duplicates merged
- [ ] Report delivered; owner-input questions actually routed to the owner
