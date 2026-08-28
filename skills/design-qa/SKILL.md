---
name: design-qa
description: Audits a live UI with a designer's eye — hierarchy, typography, spacing, states, responsiveness, and AI-slop detection — scoring each category and fixing what it finds. Use when a UI "works but feels off", before shipping user-facing screens, when asked to "polish the UI", "review the design", or check whether a product looks generated.
license: MIT
---

# Design QA

## Overview

A systematic visual audit of a running UI: page by page, against a ~80-item checklist across 10 categories, producing letter grades, prioritized findings, and fixes. Where `ux-review` reviews *plans*, design-qa reviews *pixels* — the actual rendered product, in a real browser, at multiple viewports. Its signature check is AI-slop detection: would a human designer at a respected studio ever ship this?

## When to Use

- A UI works functionally but feels generic, unpolished, or "off"
- Before shipping user-facing screens
- After AI-generated UI work, to catch the telltale patterns
- Regression-checking design after a refactor

**When NOT to use:** No running UI yet (use `ux-review` on the plan); WCAG-focused audits deserve dedicated accessibility tooling on top of this; single-component styling questions.

## Modes

- **Full** (default) — every page/route, all 10 categories
- **Quick** — key pages, categories 1–5 only
- **Deep** — full + interaction flows + cross-page consistency + performance-as-design
- **Diff-aware** — on a feature branch: audit only screens the diff touches
- **Regression** — compare against a stored baseline of prior scores

## Phase 1: First Impression

Load the entry page cold. Before any checklist: what does this communicate in 3 seconds? What's the focal point? Does it look like a product with a point of view, or a template? Run the **squint test** (blur — is hierarchy still visible?) and the **trunk test** (cover everything but navigation — do you know what site, what page, what sections?).

## Phase 2: System Extraction

Extract what the UI actually uses (via browser dev tools / JS evaluation): fonts in use, color palette, heading hierarchy, undersized touch targets, load metrics. Compare against DESIGN.md if one exists — every deviation is a finding.

## Phase 3: Page-by-Page Audit

Apply the checklist per page. Every finding gets a category and an impact rating (**high / medium / polish**).

**1. Visual Hierarchy** — one focal point and one primary CTA per view · eye flows naturally · above-the-fold communicates purpose in 3s · white space intentional, not leftover · no competing noise

**2. Typography** — ≤3 font families · scale follows a ratio (1.25/1.333) · line-height 1.5 body, 1.15–1.25 headings · 45–75 chars per line · no skipped heading levels · ≥2 weights for hierarchy · body ≥16px · curly quotes and real ellipsis (…) · `tabular-nums` on number columns · no letterspacing on lowercase · flag Inter/Roboto/Open Sans/Poppins as potentially generic

**3. Color & Contrast** — coherent palette (≤12 non-gray colors) · WCAG AA (4.5:1 body, 3:1 large text and UI) · semantic colors consistent · never color-only encoding · dark mode uses elevation not inversion, off-white text (~#E0E0E0), accents desaturated 10–20% · no red/green-only combinations

**4. Spacing & Layout** — spacing on a 4/8px scale, not arbitrary values · consistent alignment · related-closer/distinct-farther rhythm · border-radius hierarchy (inner = outer − gap) · max content width · no horizontal scroll anywhere · URL reflects state (filters, tabs in query params)

**5. Interaction States** — hover on everything interactive · `focus-visible` ring (never bare `outline: none`) · active, disabled, loading states · skeletons match real content shapes · empty states have warmth + primary action · error messages include the fix · touch targets ≥44px · **mindless-choice audit:** every decision point should be an obvious click; a click that requires thought is a HIGH finding

**6. Responsive** — mobile layout is designed, not stacked desktop · nav collapses appropriately · correct input types on mobile forms · no `user-scalable=no`

**7. Motion** — ease-out enter, ease-in exit · 50–700ms · every animation communicates something · `prefers-reduced-motion` respected · only `transform`/`opacity` animated · no `transition: all`

**8. Content & Microcopy** — headings say something specific · no happy talk · buttons name the action ("Save changes", not "Submit") · consistent terminology

**9. AI Slop Detection** — the blacklist; each hit is automatic HIGH:
- Purple/violet gradient backgrounds or blue-to-purple schemes
- The 3-column feature grid: icon-in-colored-circle + bold title + 2-line description ×3 — THE most recognizable AI layout
- Icons in colored circles as decoration; decorative blobs, wavy dividers
- Centered everything; uniform bubbly border-radius on every element
- Emoji as design elements (🚀 in headings, emoji bullets)
- Colored left-border cards
- Generic hero copy ("Welcome to X", "Unlock the power of…", "Your all-in-one solution")
- Cookie-cutter section rhythm: hero → 3 features → testimonials → pricing → CTA
- `system-ui` as the primary font — the "I gave up on typography" signal

**10. Performance as Design** — LCP < 2.0s · CLS < 0.1 · lazy images with dimensions · `font-display: swap`, no FOUT flash · skeleton quality

## Phase 4: Flows & Consistency (full/deep modes)

Walk the top user flows end to end, tracking the **goodwill reservoir**: subtract for hidden information, format-punishing inputs, unnecessary questions, sizzle in the way, ambiguous choices; add for obvious top tasks, upfront costs/limits, saved steps. Then check cross-page consistency: same components, same spacing, same voice everywhere.

## Phase 5: Report & Fix

**Scoring:** every category starts at A; each high-impact finding drops a letter, each medium drops half; polish findings are listed but don't affect the grade.

```
# Design QA Report — <product> <date>
Design Score: <A–F>   (weighted: hierarchy 15%, typography 15%, spacing 15%,
                       color 10%, states 10%, responsive 10%, content 10%,
                       slop 5%, motion 5%, performance-feel 5%)
AI Slop Score: <A–F>  — standalone grade with a pithy verdict

## Findings by impact      [high → medium → polish; each: page, category, issue, fix]
## Per-category grades
## DESIGN.md deviations    (if a design system exists)
```

Then fix: high-impact findings immediately (with user confirmation for anything that changes behavior), medium in a follow-up pass, polish as a listed backlog. Re-screenshot after fixes to verify.

## Common Rationalizations

| Excuse | Reality |
|---|---|
| "It's functional, design polish can wait" | Users judge trustworthiness in 50ms from visuals. "Later" is where polish goes to die. |
| "The framework's defaults are fine" | Defaults are the definition of generic. Fine ≠ intentional. |
| "AI slop patterns are just popular patterns" | They're popular in generated output. The test: would a respected studio ship it? |
| "Grades are subjective" | Every grade traces to counted findings against named checklist items. Disagree with a finding, not the arithmetic. |
| "Nobody resizes their browser" | Half your traffic is a 375px screen. Mobile isn't a resize; it's the primary viewport. |

## Red Flags

- The audit ran without ever loading the actual UI in a browser
- Findings with no impact rating or no concrete fix
- A slop-blacklist hit rated as "polish"
- Scores reported without the per-page findings that produced them
- Fixes applied without re-verifying visually

## Verification

- [ ] Every in-scope page audited at desktop and mobile viewports
- [ ] Findings rated high/medium/polish with page, category, and fix
- [ ] Both headline scores computed and traceable to findings
- [ ] High-impact fixes applied and visually re-verified
- [ ] Baseline stored for future regression runs
