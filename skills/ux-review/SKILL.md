---
name: ux-review
description: Reviews a plan's UI and UX decisions through a designer's eye — hierarchy, empty states, edge cases, usability laws, and trust. Use when a plan touches any user interface, when asked "how will this feel to use?", or before implementing screens, flows, or user-visible state changes.
license: MIT
---

# UX Review

## Overview

A plan review through a designer's eye. The goal: when this ships, users feel the design is intentional — not generated, not accidental, not "we'll polish it later." The posture is opinionated but collaborative: find every gap, explain why it matters against a named principle, fix the obvious ones, and ask about the genuine taste calls. This is a review — no code changes, no implementation.

## When to Use

- Any plan that adds UI screens or pages, changes components, alters user-facing flows, or changes user-visible state
- When asked how a feature will feel to use, or whether a flow makes sense
- As the design phase of `auto-review`

**When NOT to use:** Plans with literally no UI (pure backend, API-only, infrastructure) — say so and stop. Reviewing a *live* UI is `design-qa`; creating a design system is `design-system`.

**Scope gate (first, hard stop):** confirm the plan actually has UI scope. If not, report "no UI scope — ux-review does not apply" and end.

## Design Principles

1. **Empty states are features.** "No items found." is not a design. Every empty state needs warmth, a primary action, and context.
2. **Every screen has a hierarchy.** What does the user see first, second, third? If everything competes, nothing wins.
3. **Specificity over vibes.** "Clean, modern UI" is not a design decision. Name the font, the spacing scale, the interaction pattern.
4. **Edge cases are user experiences.** 47-char names, zero results, error states, first-time vs power user — features, not afterthoughts.
5. **Generic-AI-slop is the enemy.** Generic card grids, hero sections, 3-column features — if it looks like every AI-generated site, it fails.
6. **Responsive is not "stacked on mobile."** Each viewport gets intentional design.
7. **Accessibility is not optional.** Keyboard nav, screen readers, contrast, touch targets — specified in the plan or they won't exist.
8. **Subtraction default.** If a UI element doesn't earn its pixels, cut it.
9. **Trust is earned at the pixel level.** Every interface decision builds or erodes user trust.

## The Three Laws of Usability

1. **Don't make me think.** Every page self-evident. If a user stops to ask "what do I click?", the design failed. Self-evident > self-explanatory > requires explanation.
2. **Clicks don't matter, thinking does.** Three mindless, unambiguous clicks beat one click that requires thought.
3. **Omit, then omit again.** Get rid of half the words, then half of what's left. Happy talk must die. Instructions must die.

## How Users Actually Behave

Observed behavior, not preference — apply to every decision:

- **Users scan, they don't read.** Design billboards passing at 60 mph, not brochures: visual hierarchy, clearly defined areas, headings, highlighted key terms.
- **Users satisfice.** They pick the first reasonable option, not the best. Make the right choice the most visible one.
- **Users muddle through.** Once something works — however badly — they stick to it. They won't seek the "right" way.
- **Users don't read instructions.** Guidance must be brief, timely, and unavoidable, or invisible.
- **Conventions win.** Logo top-left, nav top/left, search = magnifying glass. Innovate on navigation only when you *know* you have a better idea.
- **Clickable things must look clickable** — shape, location, formatting. Never rely on hover for discoverability; mobile has no hover.
- **Noise is guilty until proven innocent.** Three sources: shouting, disorganization, clutter. Fix by removal, not addition.
- **Clarity trumps consistency.** If significantly clearer requires slightly inconsistent, choose clarity.
- **The trunk test:** cover everything except navigation — can you still tell what site this is, what page you're on, and the major sections? If not, the navigation failed.
- **The goodwill reservoir:** every friction point depletes it — hidden info, format-punishing inputs, unnecessary questions, sizzle in the way. Replenish by making the wanted action obvious, answering questions upfront, saving steps, and easy error recovery.
- **Mobile: same rules, higher stakes.** 44px minimum touch targets; affordances must be visible; never sacrifice usability for space.

## Workflow

**Step 1 — Rating.** Rate the plan's current design thinking 0–10. Trace the score to specific principles; "feels off" must be debuggable to a broken principle. Then describe what a 10/10 looks like *for this product* — the gap is the work list.

**Step 2 — Journey walk.** For every screen or flow the plan touches:
- What does the user see first, second, third? (hierarchy as service)
- Run empathy as simulation: bad signal, one hand free, first time vs 1000th time, boss watching
- Trace the edge cases: longest realistic content, zero results, error mid-action, back button, stale state
- Storyboard the emotional arc — every moment is a scene with a mood, not just a screen with a layout

**Step 3 — Specificity pass.** Convert every vibe in the plan into a decision: name the typography, spacing scale, component variants, interaction states (hover/focus/active/disabled/loading), and motion. Flag every place the plan says "clean", "modern", "intuitive", or "polished" without saying *how*.

**Step 4 — Mockups when possible.** If the environment can render designs (HTML mockups, design tools, `design-concepts`), generate visual variants rather than describing them. Design reviews without visuals are just opinion. Show, then iterate.

**Step 5 — Findings.** Each finding: the broken principle, where, the user impact, and the concrete fix. Genuine taste calls go to the user as options with a recommendation; objective violations (contrast, touch targets, missing states) are must-fix.

## Required Outputs

- Design rating (0–10) with principle-traced justification and the 10/10 description
- Findings list: must-fix (principle violations) vs taste calls (user decisions)
- Edge-case inventory per screen: empty, error, loading, overflow, first-use
- Accessibility requirements written into the plan: keyboard paths, focus order, contrast, touch targets, screen-reader labels
- Updated plan with specificity replacing vibes

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
| "We'll polish the design after it works" | Post-hoc polish can't fix hierarchy or flow. Structure is decided now, in the plan. |
| "The empty state is an edge case" | It's the first thing every new user sees. It's the front door. |
| "Standard component library covers accessibility" | Libraries cover primitives. Focus order, labels, and flows are still your plan's job. |
| "Users will figure it out" | Users muddle through and blame themselves — then churn. "Figure-out-able" is a failed design. |
| "This feels fine to me" | You built it. You are the one person on Earth who can't judge first-use clarity. |

## Red Flags

- The plan ships a screen with no defined empty, loading, or error state
- Any plan line contains "clean", "intuitive", or "modern" with no named decision behind it
- Navigation innovation without evidence the convention fails
- A rating without a traced principle, or a critique without a concrete fix
- You are writing implementation code

## Verification

- [ ] UI scope confirmed (or review correctly declined)
- [ ] Every touched screen has hierarchy, edge cases, and states specified
- [ ] Rating given with principle-traced gaps and a 10/10 target
- [ ] Accessibility requirements are written into the plan, not assumed
- [ ] Must-fix findings landed in the plan; taste calls were decided by the user
