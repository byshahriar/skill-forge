---
name: canary-watch
description: Monitors a freshly deployed application against a pre-deploy baseline — page loads, console errors, performance, broken links — alerting only on real regressions. Use when a deploy just went out, when asked to "watch the deploy", "monitor production", or verify that a release didn't break anything user-visible.
license: MIT
---

# Canary Watch

## Overview

Post-deploy monitoring with a baseline discipline: capture what "healthy" looked like before the deploy, then watch the deployed app and alert on *changes*, not absolutes. A page that always had three console errors is fine at three — one *new* error is the alert. The output is a per-page health report and, when something regresses, an evidence-backed alert with a recommended action including rollback.

## When to Use

- Immediately after deploying to production or staging
- During a canary/staged rollout window
- After infra changes (CDN, DNS, dependency upgrades) that could break the live site
- When `release` completes a deploy step

**When NOT to use:** Pre-merge functional testing (`web-qa`); long-term uptime monitoring (that's an alerting system's job — see `observability`; this skill is the *deploy window* watch).

## Phase 1: Baseline

Ideally captured **before** the deploy (offer this whenever a deploy is imminent). For each key page:

- Screenshot
- Console errors present (count and messages — this is the "known noise" register)
- Load time / core metrics
- HTTP status of on-page links

Store under `.canary/baseline/`. Without a baseline, the run degrades to a plain health check — say so, and capture one now for next time.

## Phase 2: Page Discovery

Determine the pages to watch: user-specified list, sitemap, or crawl of primary nav (cap at the top ~10 routes). Prioritize revenue/critical paths: landing, auth, checkout/core action, dashboard.

## Phase 3: Monitoring Loop

Watch for the agreed duration (default 10 minutes; longer for riskier deploys). Each cycle (about every 60s), per page: load it, screenshot, collect console errors, capture load time. Compare to baseline:

| Change | Severity |
|---|---|
| Page fails to load / times out | CRITICAL |
| New console error not in baseline | HIGH |
| Load time > 2x baseline | MEDIUM |
| New broken links | LOW |

**Rules of the loop:**
- **Alert on changes, not absolutes.** The baseline defines normal — not industry standards.
- **Don't cry wolf.** Alert only on patterns that persist across 2+ consecutive checks; a single transient blip is noise.
- **Screenshots are evidence.** Every alert includes one. No exceptions.
- **2x baseline is a regression; 1.5x might be variance.**
- **Read-only.** Observe and report; don't modify code unless the user pivots to investigation.
- **Start fast.** Begin monitoring within moments of invocation — the riskiest minutes are the first ones.

On CRITICAL or HIGH, interrupt immediately:

```
CANARY ALERT
Time:      check #3 at 180s
Page:      /checkout
Type:      HIGH
Finding:   new console error: TypeError: cart.items is undefined
Evidence:  .canary/screenshots/checkout-3.png
Baseline:  0 errors    Current: 1 error (persisted 2 checks)
```

Options: **A)** investigate now — if users are already affected this is an incident: switch to `incident-response` (mitigate first), otherwise `debug` · **B)** keep watching (might be transient) · **C)** rollback the deploy · **D)** dismiss as false positive. Recommend by severity — CRITICAL leans rollback-or-investigate, never "keep watching".

## Phase 4: Health Report

```
CANARY REPORT — <url>
Duration: 10m   Pages: 6   Checks: 60   Status: HEALTHY / DEGRADED / BROKEN

Page          Status   New errors   Avg load   vs baseline
/             OK       0            0.8s       1.0x
/checkout     DEGRADED 1 (HIGH)     2.1s       2.3x
```

DEGRADED or BROKEN reports end with a recommendation and the evidence paths. If the deploy proves healthy, offer to promote this run's data as the new baseline.

## Common Rationalizations

| Excuse | Reality |
|---|---|
| "The deploy was small, no need to watch" | Small deploys break prod through the dependency you didn't think about. Ten minutes of watching is cheap. |
| "CI passed, we're covered" | CI tested the build, not the deployed environment — CDN, env vars, third-party scripts, real latency. |
| "There are always console errors, ignore them" | That's what the baseline is for. Known noise is registered; *new* noise alerts. |
| "One failed check — roll back!" | One check is a blip. Two consecutive is a pattern. The 2-check rule cuts false alarms without meaningfully delaying real ones. |
| "No baseline, skip the run" | A degraded health check still catches hard failures — and today's run is next deploy's baseline. |

## Red Flags

- Monitoring started without noting whether a baseline exists
- An alert raised from a single check
- An alert with no screenshot
- "Rollback" never offered on a CRITICAL finding
- The loop silently edited code to "fix" what it saw

## Verification

- [ ] Baseline captured or its absence explicitly noted
- [ ] Critical paths included in the page set
- [ ] Alerts follow the 2-consecutive-checks rule with evidence attached
- [ ] Final report delivered with per-page status and verdict
- [ ] Healthy run offered as the next baseline
