---
name: dx-review
description: Reviews developer experience — onboarding friction, API ergonomics, error quality, docs, and time-to-hello-world — for tools, SDKs, APIs, and CLIs. Use when the product's users are developers, when asked "is this easy to adopt?", when reviewing a plan for developer-facing features, or when auditing an existing developer workflow.
license: MIT
---

# DX Review

## Overview

A developer-experience review for products whose users build software: SDKs, APIs, CLIs, frameworks, internal platforms. It measures the journey — discover → install → hello world → integrate → debug → upgrade — against first principles and hard benchmarks, scores each dimension 0–10, and turns every gap into a concrete fix. Works both on plans (before building) and live products (audit mode).

## When to Use

- The product or feature is developer-facing: an API, SDK, CLI, library, or internal tool
- When asked whether something is easy to adopt, integrate, or debug
- Auditing onboarding: "why do people drop off before hello world?"
- As the DX phase of `auto-review` when a plan has developer-facing scope

**When NOT to use:** End-user products with no developer surface (use `ux-review`); reviewing code quality (use `code-review`).

**Applicability gate (first):** confirm the product has a developer-facing surface. If not, report "no developer-facing scope — dx-review does not apply" and end.

## DX First Principles

Every recommendation traces back to one of these:

1. **Zero friction at T0.** The first five minutes decide everything. Hello world without reading docs, without a credit card, without a call.
2. **Incremental steps.** Never force understanding the whole system before getting value from one part. Gentle ramp, not cliff.
3. **Learn by doing.** Playgrounds, sandboxes, copy-paste code that works in context. Reference docs are necessary but never sufficient.
4. **Decide for me, let me override.** Opinionated defaults are features. Escape hatches are requirements.
5. **Fight uncertainty.** Developers need three things: what to do next, whether it worked, how to fix it when it didn't. Every error message = problem + cause + fix.
6. **Show code in context.** Hello world is a lie. Show real auth, real error handling, real deployment.
7. **Speed is a feature.** Response times, build times, lines of code per task, concepts to learn.
8. **Create magical moments.** What would feel like magic here? Stripe's instant API response, Vercel's push-to-deploy. Find yours; make it the first thing developers experience.

## The Seven DX Characteristics

| # | Characteristic | What it means | Gold standard |
|---|---|---|---|
| 1 | **Usable** | Simple to install, set up, use; fast feedback | Stripe: one key, one curl, money moves |
| 2 | **Credible** | Reliable, predictable, clear deprecation | TypeScript: gradual adoption, never breaks JS |
| 3 | **Findable** | Easy to discover and find help within | React: every question already answered |
| 4 | **Useful** | Solves real problems; features match real use cases | Tailwind: covers 95% of CSS needs |
| 5 | **Valuable** | Measurably reduces friction; worth the dependency | Next.js: SSR, routing, bundling, deploy in one |
| 6 | **Accessible** | Works across roles and environments; CLI + GUI | VS Code: junior to principal |
| 7 | **Desirable** | Devs *want* it, not tolerate it | Vercel |

## Benchmarks

**Time to Hello World (TTHW):**

| Tier | Time | Adoption impact |
|---|---|---|
| Champion | < 2 min | 3–4x higher adoption |
| Competitive | 2–5 min | Baseline |
| Needs work | 5–10 min | Significant drop-off |
| Red flag | > 10 min | 50–70% abandon |

**Scoring rubric (0–10):** 9–10 best-in-class (developers rave) · 7–8 good (usable without frustration) · 5–6 acceptable (friction, tolerated) · 3–4 poor (complaints, adoption suffers) · 1–2 broken (abandoned after first attempt) · 0 not addressed.

**The gap method:** for each score, describe what a 10 looks like *for this product*, then fix toward 10.

## Workflow

**Step 1 — Persona.** Who is the developer? Experience level, stack, what they're trying to ship, what they tried before. Recommendations for a staff engineer integrating an API differ from a weekend hacker's.

**Step 2 — Journey trace.** Walk the full journey and time each stage: discover → evaluate → install → hello world → first real integration → first error → upgrade. At each stage ask: what does the developer see, wait for, or get stuck on? Every context switch (docs, dashboard, error lookup) costs 10–20 minutes of flow.

**Step 3 — First-time roleplay.** Actually run the onboarding cold, following only public instructions. Note every stumble: missing prerequisite, unexplained error, doc/reality mismatch, decision the tool should have made for you. Measure real TTHW.

**Step 4 — Score.** Rate each of the Seven Characteristics 0–10 with the gap method. Apply the instincts:
- **Error message empathy** — does every error identify problem, cause, fix?
- **Escape hatch awareness** — every default overridable? No escape hatch = no trust at scale.
- **Upgrade fear** — clear changelogs, migration guides, deprecation warnings? Upgrades should be boring.
- **Pit of success** — is the right thing the easy thing? Simple case production-ready, complex case same API (progressive disclosure)?
- **SDK completeness** — if devs write their own HTTP wrapper, the SDK failed.

**Step 5 — Magical moment.** Identify (or design) the single moment that makes a developer say "oh, that's nice." Make it happen as early in the journey as possible.

**Step 6 — Findings.** Each: the stage, the friction, the principle it violates, the score impact, and the concrete fix — ordered by drop-off risk.

## Required Outputs

- Persona and journey map with per-stage timings and friction points
- Measured (or estimated) TTHW against benchmark tiers
- Seven-characteristic scorecard with per-dimension 10/10 descriptions
- Prioritized fix list: quick wins vs structural work
- The designated magical moment and where it lands in the journey

## Decision Brief Format

Every decision put to the user is a **brief**, not a question mark. Number them (D1, D2, …) within a session and carry all of:

```
D<N> — <one-line question title>
Context:  <one grounding sentence — what we're deciding and where>
Plain-English stakes: <2–3 sentences anyone could follow; what breaks,
  what the user sees, what's lost if we pick wrong>
Recommendation: <choice> because <one-line reason>
Options:
A) <label> (recommended)
   + <concrete, observable benefit>
   − <honest cost>
B) <label>
   + <benefit>
   − <cost>
Net: <one line naming the actual trade-off>
```

Rules: one decision per brief — never batch unrelated choices. Always include a recommendation with a reason (neutral posture is still a recommendation: "either works; default A"). When options differ in *coverage*, say so explicitly (complete vs happy-path vs shortcut). With 5+ real options, split into sequential briefs rather than dropping any — the user's option set is sacred. For one-way-door or destructive choices, require an explicit typed confirmation and state plainly what is irreversible.

## Common Rationalizations

| Excuse | Reality |
|---|---|
| "Developers are smart, they'll figure it out" | Developers are busy. They evaluate three tools in parallel and keep the one that works first. |
| "The docs cover that" | If the journey requires leaving the flow to search docs, that's a context switch and a drop-off point. |
| "Setup friction is one-time cost" | First impressions gate everything after. Nobody experiences your great API if minute 4 is a cryptic stack trace. |
| "Our internal tool doesn't need DX" | Internal developers churn too — into shadow tooling and workarounds. |
| "We'll polish onboarding after launch" | TTHW is architecture: auth model, defaults, packaging. Bolting on "easy" later means rebuilding. |

## Red Flags

- You scored without actually running the onboarding
- An error message in the product says only "something went wrong"
- Hello world requires reading more than one page of docs
- A score of 7+ with no named evidence
- The review has findings but no prioritization by drop-off risk

## Verification

- [ ] Developer-facing scope confirmed (or review correctly declined)
- [ ] Journey traced end-to-end with real or estimated timings
- [ ] TTHW measured against the benchmark table
- [ ] All seven characteristics scored with gap-method targets
- [ ] Fix list prioritized and delivered; quick wins separated from structural work
