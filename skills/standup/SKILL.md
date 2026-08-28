---
name: standup
description: Generates an honest standup update — yesterday, today, blockers — from real activity: commits, PRs, task state, and session history. Use when preparing for daily standup, when asked "what did I do yesterday", or to turn rough notes into a shareable async update.
license: MIT
---

# Standup

## Overview

Builds the daily update from evidence instead of memory: mine the actual activity (commits, PRs, reviews, task moves), compress it into outcomes rather than motion, and surface the one thing standups exist to catch — blockers, while they're still cheap. Works for spoken standups, async posts, and solo developers keeping their own log honest.

## When to Use

- Before daily standup or an async check-in post
- "What did I even do yesterday?"
- A manager/stakeholder wants a quick status
- Solo: a daily two-minute log that keeps the week recoverable

**When NOT to use:** Weekly/sprint summaries (`retrospective`); status *reports* with metrics and narrative (that's documentation, not standup).

## Step 1: Gather

Pull the window since the last update (default: previous working day):

```bash
git log --since="yesterday 00:00" --author="<me>" --oneline --all   # commits, all branches
gh pr list --author "@me" --state all --limit 10                    # PRs opened/merged
gh pr list --search "reviewed-by:@me updated:>=<date>" --limit 10   # reviews given
```

Plus: task-tracker moves, meetings that produced decisions, and anything in progress that never hit a commit (design thinking, debugging that didn't land — real work leaves no git trace some days; say it anyway).

## Step 2: Compress to Outcomes

Raw activity is not the update. Translate:

| Activity (don't say) | Outcome (say) |
|---|---|
| "6 commits on auth-fix branch" | "Fixed the session-expiry logout bug — PR up for review" |
| "Worked on the migration" | "Migration script handles the two big tables; user table remains — today" |
| "Meetings" | "Decided with design to drop the modal flow — simplifies story 42" |
| "Debugged CI" | "CI flake root-caused to test pollution in checkout suite — fix is one line, landing today" |

Rules: lead with what *changed in the world*, name artifacts (PR #, story id), and keep "yesterday" ≤3 bullets — more means you're listing motion, not outcomes.

## Step 3: The Update

```
**Yesterday**
- <outcome with artifact link>
- <outcome>

**Today**
- <intended outcome — falsifiable by tomorrow: "get PR 214 merged", not "continue working on auth">

**Blockers / Needs**
- <blocked-on-what, needed-from-whom, since-when>   — or "none"
```

**Blockers get the strictest honesty.** The standup's entire economic value is early blocker surfacing:
- Waiting 2+ days on a review? That's a blocker, name the PR and the person.
- Stuck 4+ hours on the same error? Blocker — asking is cheaper than the third day of grinding.
- "Slowed by X" counts. Blocker-shame produces standups where everyone is fine until the sprint fails.

**Today's items must be checkable tomorrow.** "Continue working on X" can't fail, so it says nothing. "Get the migration through review" can — that's a real intention.

## Step 4: Deliver

Match the venue: 30-second spoken version (one line per section), or async post with links. For teams: consistency beats completeness — the same three sections every day makes drift visible across a week.

## Common Rationalizations

| Excuse | Reality |
|---|---|
| "I'll just wing it in the meeting" | Winging it produces "worked on some stuff, no blockers" — the update that carries zero information. |
| "My blocker isn't worth raising yet" | Day-one blockers cost minutes to clear; day-three blockers cost the sprint. Raise at first suspicion. |
| "Nothing shipped, so nothing to say" | Investigation that ruled out three causes *is* progress. Report the learning, not silence. |
| "Standup is for proving I was busy" | It's for coordination. Busy-proof updates ("many meetings, various tasks") actively hide the coordination signal. |
| "Today: continue yesterday's work" | Unfalsifiable filler. What will be *true* tonight that isn't now? |

## Red Flags

- "No blockers" for the fifth straight day while a PR sits unreviewed
- Yesterday-bullets that are branch names and commit counts
- The same "today" item three days running with no blocker declared
- Updates that never link a single artifact
- A standup written entirely from memory when the git log was one command away

## Verification

- [ ] Activity gathered from real sources, not recall
- [ ] Yesterday: ≤3 outcome-bullets with artifacts
- [ ] Today: falsifiable intentions
- [ ] Blockers checked against the honesty rules (2-day reviews, 4-hour stalls)
- [ ] Format matched to the venue
