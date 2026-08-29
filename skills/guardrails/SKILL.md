---
name: guardrails
description: Activates safety modes for risky work — warnings before destructive commands and/or an edit boundary restricting changes to one directory. Use when touching production, debugging live systems, working in shared environments, or when asked to "be careful", "safety mode", "lock it down", or "only edit this folder".
license: MIT
---

# Guardrails

## Overview

Two composable safety modes for sessions where a mistake is expensive: **careful mode** (destructive commands get flagged before running) and **edit boundary** (file changes outside a declared directory are refused). Use either alone or both together ("guard mode"). These are session-scoped behavioral guardrails against *accidents* — not a security boundary against a determined actor.

## When to Use

- Touching production systems, live databases, or shared infrastructure
- Debugging: prevent "fixing" unrelated code while investigating
- Long or risky sessions where scope discipline matters
- Asked for careful mode, safety mode, guard mode, or edit restrictions

**When NOT to use:** Normal development in a disposable environment — friction without benefit. Also never treat it as permission to be less careful: the guardrail is a net, not a license.

## Mode 1: Careful (destructive-command warnings)

While active, before running any shell command, check it against the danger patterns. On a match: **stop, name the risk, and get explicit confirmation** before executing.

| Pattern | Example | Risk |
|---|---|---|
| `rm -rf` / recursive delete | `rm -rf /var/data` | Irreversible data loss |
| `DROP TABLE` / `DROP DATABASE` / `TRUNCATE` | `DROP TABLE users;` | Data loss |
| `git push --force` / `-f` | `git push -f origin main` | History rewrite |
| `git reset --hard` | `git reset --hard HEAD~3` | Uncommitted work loss |
| `git checkout .` / `git restore .` | `git checkout .` | Uncommitted work loss |
| `kubectl delete` / cloud resource deletion | `kubectl delete pod` | Production impact |
| `docker rm -f` / `docker system prune` | `docker system prune -a` | Container/image loss |
| Piping remote scripts to shell | `curl … \| sh` | Arbitrary execution |
| Mass file operations outside the workspace | `chmod -R`, `chown -R` on system paths | System damage |

**Safe exceptions (no warning):** recursive deletes of well-known build artifacts — `node_modules`, `dist`, `build`, `.next`, `.cache`, `__pycache__`, `coverage`, `.turbo`.

**Hard-stop tier:** two shapes get refused outright rather than confirmed — recursive delete of `/`, `~`, or `$HOME` itself, and force-push to the repo's **default branch**. (`--force-with-lease` to a feature branch is an ordinary warning, not a hard stop.)

The confirmation must name the *specific* consequence ("this rewrites history on `main` for everyone, not just you"), not just repeat the command. The user can override any warning; overriding is their call, informed by your naming of the risk.

**Enforcement note:** where the environment supports pre-tool hooks, wire these checks as a hook so they're mechanical rather than attentional (a hook that can't parse its input should fail closed for boundaries, and warn for commands). Without hooks, apply the discipline directly — check before every Bash call while the mode is active.

## Mode 2: Edit Boundary ("freeze")

Restrict file modifications to one directory for the session.

**Setup:** ask which directory; resolve to an absolute path with a trailing slash (so `/src/` never matches `/src-old/`). Announce: "Edits restricted to `<path>/`. Anything outside will be refused until you lift the boundary."

**While active:**
- Any Edit/Write outside the boundary is refused with a one-line reason and the boundary path
- Resolve symlinks before checking — an in-boundary link to an outside file counts as outside
- Reads, searches, and read-only commands are unaffected
- Shell commands that write outside the boundary (sed -i, redirects, mv) count as edits — refuse them too
- If a needed fix genuinely lies outside: **say so and ask** — the user can widen the boundary or lift it; never silently work around it

**Lifting:** the user says "unfreeze" / "lift the boundary" — confirm and deactivate. The boundary also ends with the session.

## Mode 3: Guard (both)

Activate careful + edit boundary together. Announce both protections and their lifts:

> **Guard mode active.** 1) Destructive commands warn before executing (catastrophic shapes refused). 2) Edits restricted to `<path>/`. Say "unfreeze" to lift the boundary; end the session to deactivate everything.

## Worked Example: A Guarded Session

User: *"Guard mode on — we're debugging the billing worker on prod data. Restrict edits to `services/billing/`."*

> **Guard mode active.** 1) Destructive commands warn before executing; recursive delete of `/`/`~` and force-push to `main` are refused outright. 2) Edits restricted to `services/billing/`. Say "unfreeze" to lift the boundary.

Mid-session, three moments the mode exists for:

1. Investigation suggests clearing a stale queue: `redis-cli FLUSHDB`. **Careful mode intercepts**: "This wipes every key in the current Redis DB on what appears to be production — including live rate-limit counters and sessions, not just the stale queue. Confirm, or I can delete the three `billing:retry:*` keys specifically." User picks the targeted delete. The guardrail's value wasn't blocking — it was naming the real blast radius before the yes.
2. The root cause turns out to be in `lib/currency.ts` — outside the boundary. **Refused, then asked**: "Fix is one line in `lib/currency.ts`, outside the edit boundary. Widen the boundary to include `lib/`, or note it for a follow-up?" User widens for that one file. The scope change happened *out loud*.
3. A cleanup instinct: `sed -i` a rename across `services/`. Also refused — a shell write is still a write; the boundary is about changes, not tool names.

Session ends; boundary dies with it. Nothing was prevented that the user wanted — three things were prevented that they didn't.

## Common Rationalizations

| Excuse | Reality |
|---|---|
| "This delete is obviously safe" | Obvious is how prod tables die. The warning costs five seconds; type the confirmation. |
| "The fix is just one line outside the boundary" | That's precisely the edit the boundary exists to catch. Ask first — widening is cheap; silent scope creep is what got frozen. |
| "I'll disable the guard for this one command" | One command is how every guardrail ends. Lifting is the user's decision, made per-incident. |
| "sed isn't an Edit tool, so it's allowed" | The boundary is about *changes*, not tool names. A write is a write. |
| "Safety mode is on, so I can move faster" | The net is for the fall you didn't predict. Care level stays the same. |

## Red Flags

- A matched command ran without its confirmation
- An out-of-boundary write happened via shell while Edit/Write were dutifully refused
- The boundary was widened without the user asking
- Warnings so frequent the user starts rubber-stamping — recalibrate the patterns instead of numbing the user
- Guard active but never announced — the user doesn't know what's protected

## Verification

- [ ] Active modes announced with what's protected and how to lift
- [ ] Every destructive-pattern match produced a named-consequence confirmation (or hard stop)
- [ ] Zero writes landed outside the boundary — by any tool
- [ ] Boundary changes only ever user-initiated
- [ ] Mode status restated when the session's work shifts context
