# Skill Forge — Agent Guide

This repository is a suite of 47 agent skills covering the software development lifecycle. If you are an AI agent working in a project that has Skill Forge installed, this file tells you how to use it.

## How to pick a skill

Load `skills/orchestrator/SKILL.md` — it contains the full routing table (request → skill) and the proven lifecycle sequences. Short version:

- **Idea or "is this worth building?"** → `discovery`
- **Turn intent into a spec** → `specify`; break it down → `plan`
- **Review a plan** → `ceo-review` (scope/ambition), `eng-review` (rigor), `ux-review` (UI), `dx-review` (developer-facing), or `auto-review` (all four, one gate)
- **Agile ceremonies** → `user-stories`, `estimation`, `sprint-planning`, `backlog-refinement`, `standup`, `retrospective`
- **Any logic change or bug fix** → `tdd` (test first, always)
- **Something broken** → `debug` (root cause before fixes — iron law)
- **Before merge** → `code-review`; **before prod** → `release`; **after deploy** → `canary-watch`
- **Stuck on a hard problem** → `problem-solving` (dispatch by stuck-type)
- **Risky/production session** → `guardrails` first

## Rules that apply across all skills

1. **Tests are proof.** "Seems right" is not done. Reproduce bugs as failing tests before fixing.
2. **No fixes without root cause.** Symptom-patching is how codebases rot.
3. **Scope changes are explicit user decisions.** Never silently expand or shrink what was asked.
4. **Reviews produce decisions, not essays.** Findings carry file:line, severity, and a concrete fix.
5. **Everything deferred is written down.** A TODO entry or it doesn't exist.
6. **Match process weight to change risk — but never skip the approval.** A typo fix doesn't need the lifecycle; a "simple" feature still gets a two-sentence design and an explicit yes before implementation (see `discovery` → Three Paths).
7. **Announce the skill you're applying.** One line — "using `debug` for this" — so the user knows which playbook is running and can redirect.
8. **Evidence before claims, always.** No "done / fixed / passing" without the verification command run fresh and its output read (see `verify` → Completion Gate).

## Mandatory hops

These are not suggestions — they fire automatically on their trigger:

| Trigger | Skill that MUST run |
|---|---|
| About to implement anything creative (feature, component, behavior change) | Classify via `discovery`'s Three Paths — spike / bounded / full — and get the approval |
| Writing any production logic | `tdd` — failing test first, no exceptions |
| Any bug, test failure, or unexpected behavior | `debug` — root cause before any fix |
| About to claim work is complete | `verify` — the Completion Gate |
| Before merge or PR | `code-review`; before push — `release`'s Push Gate |
| Stuck (circling, complexity spiraling, forced assumptions) | `problem-solving` — dispatch by stuck-type |

## Completion status protocol

Every skill workflow ends by reporting one of:

- **DONE** — complete, with the verification evidence
- **DONE_WITH_CONCERNS** — complete, but list the concerns explicitly
- **BLOCKED** — cannot proceed; state the blocker and what was tried
- **NEEDS_CONTEXT** — missing information; state exactly what's needed

Never report DONE while any checklist item in the skill's Verification section is unmet — that's DONE_WITH_CONCERNS at best.

## Repo layout

```
skills/<name>/SKILL.md      # 47 skills, one dir each, self-contained
commands/*.toml             # 12 slash commands
references/                 # shared checklists (also vendored per-skill where used)
scripts/validate-skills.js  # per-skill lint — run before committing skill changes
scripts/validate-docs.js    # repo consistency: README/orchestrator/counts/commands
docs/                       # anatomy + per-agent setup guides (Cursor, Codex, Copilot)
.github/                    # CI (skill lint, docs consistency, markdown sanity) + Copilot instructions
```

When editing or adding a skill, follow the anatomy in `docs/skill-anatomy.md` and run `node scripts/validate-skills.js` before committing.
