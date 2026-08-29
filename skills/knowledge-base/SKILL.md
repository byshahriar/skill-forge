---
name: knowledge-base
description: Captures, retrieves, and maintains durable project learnings — patterns, pitfalls, preferences, and architecture decisions that survive across sessions. Use when a hard-won insight would save future time, at the end of substantial work sessions, when asked to "remember this", or when starting work that prior learnings might inform.
license: MIT
---

# Knowledge Base

## Overview

Project memory that compounds. Every session discovers things — a quirk of the build, a command that actually works, a pitfall that ate an hour, a preference the team enforces — and by default those discoveries evaporate when the session ends. This skill maintains a durable learnings file, feeds relevant entries into new work, and prunes what goes stale. The test for an entry: **would this save someone 5+ minutes in a future session?**

## When to Use

- You just discovered a project quirk, command fix, pitfall, or pattern the hard way
- Ending a substantial work session (run the capture pass)
- Starting work in an area where prior learnings might apply (run the recall pass)
- Asked to "remember this", "note this down", "what do we know about X"

**When NOT to use:** Facts the repo already records (code structure, git history, README content); one-time transient errors; anything derivable in seconds. A knowledge base full of the obvious is worse than none — it buries the real entries.

## Storage

Keep learnings in a repo-visible file the whole team (and every agent) benefits from — `docs/LEARNINGS.md` by default, or the project's existing convention. Structure:

```markdown
# Project Learnings

## Patterns          — approaches that work here
- **[kebab-key]**: [one-sentence insight] (confidence: N/10, added: YYYY-MM-DD, files: [...])

## Pitfalls          — what bites, and how to avoid it
- **[kebab-key]**: [insight] (confidence: N/10, ...)

## Preferences       — how this team/user likes things done, and why
- **[kebab-key]**: [insight]

## Architecture      — non-obvious structural facts and the reasons behind them
- **[kebab-key]**: [insight] (confidence: N/10, ...)

## Tooling           — commands that work, flags that matter, setup quirks
- **[kebab-key]**: [insight] (confidence: N/10, ...)
```

For high-value entries the whole project must respect (a build gotcha, a hard constraint), also surface a one-line pointer in CLAUDE.md / AGENTS.md so agents load it every session — but keep the body in the learnings file; agent docs are an index, not an archive.

## Capture Pass

At the end of substantial work, review the session explicitly — this step **always runs**, not just when something felt noteworthy (in practice, "log it if something stands out" captures almost nothing; the review is what surfaces the learnings). For each candidate:

1. Is it durable (true next month) and non-obvious (not derivable from the repo)?
2. Would it save 5+ minutes?
3. Does an entry with this key already exist? **Update it** rather than duplicating; raise or lower its confidence based on today's evidence.

Then write it: type, kebab-case key, one-sentence insight, confidence 1–10, related files. If the review genuinely surfaces nothing, say "no durable learnings this session" — an explicit empty result, not a skipped step.

## Recall Pass

At the start of work in a covered area: scan the learnings file for entries whose keys or files overlap the task. When a learning shapes a decision, cite it — "prior learning applied: [key]" — so the compounding is visible and wrong learnings get noticed and corrected.

## Prune Pass (periodic, or when the file feels noisy)

For every entry:

1. **File-existence check** — entries referencing deleted files are flagged STALE
2. **Contradiction check** — same key, opposite insights: flag CONFLICT, resolve to one
3. **Confidence decay** — an entry nobody has confirmed in months and can't quickly re-verify gets its confidence lowered or the entry removed
4. **Obviousness check** — entries that turned out to be general knowledge get cut

Present flagged entries for the user's decision (remove / update / keep); never silently delete a learning someone else added.

## Worked Example: Entries Worth Keeping (and Not)

A capture pass at the end of a session that debugged a flaky deploy:

```markdown
## Pitfalls
- **staging-env-lazy-load**: Staging loads env vars lazily — a missing var
  fails on first *request*, not at boot, so deploy "succeeds" then 500s.
  Check `/healthz?deep=1` after every staging deploy. (confidence: 8/10,
  added: 2026-08-29, files: [deploy/staging.yml])

## Tooling
- **worker-tests-need-runInBand**: The billing worker tests share a Redis
  fixture; parallel runs corrupt it. Always `npm test -- --runInBand` under
  services/billing/. (confidence: 9/10, added: 2026-08-29)
```

Both pass the tests: durable, non-obvious, would save 5+ minutes — the first one cost this session forty.

**Rejected from the same session**, with reasons:
- *"The deploy failed today because CI was down"* — transient, not durable
- *"Billing service lives in services/billing/"* — derivable in seconds from the repo
- *"Redis is used for queues"* — the README already says so
- *"I used git bisect to find the commit"* — general technique, not a project fact

One session, two entries. That ratio is the health signal: a knowledge base that grows by ten entries per session is capturing noise.

## Common Rationalizations

| Excuse | Reality |
|---|---|
| "I'll remember this" | The session won't. Next week's agent starts from zero unless it's written down. |
| "It's too small to record" | The 5-minute test decides, not size. `--legacy-peer-deps` is tiny and saves an hour. |
| "I'll do one big capture later" | Later has no access to what today knew. Capture at the end of *each* session. |
| "Everything might be useful, log it all" | An archive of everything is a search problem, not a memory. Curation is the feature. |
| "The learning contradicts an old one, I'll just add mine" | Two contradicting entries are worse than either alone. Resolve the conflict now. |

## Red Flags

- Session ends after significant discovery work with no capture pass (and no explicit "nothing durable")
- Duplicate keys accumulating instead of updates
- The learnings file restating the README
- A recalled learning applied without checking it's still true
- Entries with no confidence, date, or key — unmaintainable from day one

## Verification

- [ ] Capture pass ran; entries pass the durable/non-obvious/5-minute tests
- [ ] Updates preferred over duplicates; conflicts resolved
- [ ] High-value entries indexed (one line) in agent docs
- [ ] Recalled learnings cited when applied
- [ ] Prune flags resolved with the user, not silently
