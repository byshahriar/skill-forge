---
name: code-health
description: Runs the project's quality tooling — typecheck, lint, tests, dead-code, shell lint — scores each category, and presents a weighted health dashboard with trends and recommendations. Use when asked "how healthy is this codebase", for a periodic quality check, before a big refactor, or when quality feels like it's drifting and nobody has numbers.
license: MIT
---

# Code Health

## Overview

A code-quality dashboard: detect the project's quality tools, run them all, score each category 0–10 on a defined rubric, roll up a weighted composite, and track the number over time. Health becomes a measured trend instead of a vibe — and the recommendations that follow are ranked by what moves the score most.

## When to Use

- Periodic health check (weekly, or at sprint boundaries with `retrospective`)
- Before starting a large refactor — capture the baseline
- Quality feels like it's slipping and the team needs numbers
- Onboarding to an unfamiliar codebase — one command tells you where it hurts

**When NOT to use:** Reviewing a specific change (`code-review`); investigating one failure (`debug`); deciding *what* to refactor in depth (`refactor` uses this as input).

## Step 1: Detect the Health Stack

Check project agent docs (CLAUDE.md / AGENTS.md) for a configured `## Health Stack` section first — if present, use those exact commands, no second-guessing. Otherwise detect:

- **Typecheck** — `tsc --noEmit`, `mypy`, `cargo check`, etc.
- **Lint** — biome/eslint/ruff/clippy/golangci-lint
- **Tests** — the project's test runner from its manifest/scripts
- **Dead code** — knip/vulture/cargo-udeps where available
- **Shell lint** — shellcheck over repo scripts, if any

Offer to persist the detected stack into the agent docs so future runs (and other agents) use the same commands:

```markdown
## Health Stack
- typecheck: tsc --noEmit
- lint: biome check .
- test: npm test
- deadcode: knip
```

## Step 2: Run Everything

Run each tool sequentially (some share resources or lock files), recording exit code, duration, and the tail of output. A tool that isn't installed is **SKIPPED with reason** — never counted as a failure. Wrap anything that might hang in a timeout so one stuck tool doesn't stall the dashboard.

## Step 3: Score

Per-category rubric (0–10):

| Category | Weight | 10 | 7 | 4 | 0 |
|---|---|---|---|---|---|
| Type check | 25% | clean | <10 errors | <50 errors | ≥50 |
| Lint | 20% | clean | <5 warnings | <20 warnings | ≥20 |
| Tests | 35% | all pass | >95% pass | >80% pass | ≤80% |
| Dead code | 12% | clean | <5 unused exports | <20 | ≥20 |
| Shell lint | 8% | clean | <5 findings | ≥5 | — |

Composite = weighted sum; when a category is skipped, redistribute its weight proportionally among the rest. Parse real counts from tool output (e.g. `error TS` lines for tsc, runner pass/fail summary for tests); if a runner only gives an exit code, exit 0 = 10, non-zero = 4.

## Step 4: Dashboard

```
# Code Health — <project> <date>
Composite: 7.8 / 10  (▲ +0.4 vs last run)

Category     Score  Weight  Evidence
Typecheck     10     25%    clean, 3.2s
Lint           7     20%    4 warnings (list)
Tests          8     35%    142/145 pass — 3 failures (named)
Dead code      6     12%    11 unused exports (top files)
Shell          —      —     skipped: no shell scripts
```

Every score line carries its evidence — the failing test names, the warning list, the unused exports. Numbers without receipts don't drive fixes.

## Step 5: History & Trends

Persist each run (e.g. `.health/history.jsonl`: date, per-category scores, composite, commit hash). On subsequent runs show the delta and the trend: which categories are improving, which are decaying, and what changed in between (correlate with git log). A dropping category that nobody decided to drop is the finding.

## Step 6: Recommendations

Rank by score impact per effort:

1. Quick wins — failures with obvious fixes (a broken test, an unused export)
2. Decay stoppers — categories trending down
3. Structural — the fix that changes the slope, not the point (e.g. adding typecheck to CI so the score can't regress silently)

Offer to fix the quick wins immediately; hand structural items to `refactor`, `tdd`, or `ci-cd` as appropriate.

## Common Rationalizations

| Excuse | Reality |
|---|---|
| "We know the codebase has issues, a score adds nothing" | Knowing ≠ measuring. Trends catch decay while it's cheap; vibes catch it at the rewrite. |
| "The lint warnings are all noise" | Then fix the config — a warning channel full of noise can't carry signal. That's itself a finding. |
| "Skipped tools should count as zero" | Punishing absent tooling teaches people to not install tools. Skip and redistribute; *recommend* adding the tool. |
| "Run it in parallel, it's faster" | Shared locks and resource contention make parallel runs flaky. Sequential and correct beats fast and noisy. |

## Red Flags

- A score reported without the underlying counts
- A missing tool recorded as a failure
- The dashboard shown but never persisted — next month has no baseline
- Composite improved because a failing category was silently skipped
- Recommendations that don't map to specific score movements

## Verification

- [ ] Health stack detected or read from project docs
- [ ] Every tool ran (or SKIPPED with reason), with captured evidence
- [ ] Scores computed per rubric; composite weight-redistributed correctly
- [ ] Run persisted to history; delta vs previous run shown
- [ ] Recommendations ranked and quick wins offered
