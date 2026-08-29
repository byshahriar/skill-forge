---
name: design-system
description: Builds a complete, coherent design system for a product — aesthetic direction, typography, color, spacing, layout, motion — through consultation, optional research, and a written DESIGN.md. Use when a project has no design system, when visual decisions keep being made ad hoc, or when asked "what should this look like", "pick fonts/colors", or "create a design system".
license: MIT
---

# Design System

## Overview

A design consultation that ends in a committed artifact. Instead of answering one-off "what font?" questions, this skill understands the product, optionally researches the landscape, proposes a *complete coherent system* — aesthetic, decoration level, layout, color, typography, spacing, motion — with explicit safe choices and deliberate risks, then writes it to `DESIGN.md` so every future visual decision has a source of truth.

## When to Use

- New project with no design decisions written down
- Existing project where every screen looks like a different product
- Asked to choose fonts, colors, or an overall look
- Before `ui-engineering` builds significant UI

**When NOT to use:** Generating candidate mockups to compare (use `design-concepts`); auditing a live UI against an existing system (use `design-qa`).

## Phase 1: Product Context

Ask one consolidated question (pre-fill everything inferable from the codebase or README): what the product is, who it's for, the space it plays in, the project type (web app / dashboard / marketing site / editorial / internal tool), and whether they want landscape research or your design knowledge directly.

Then the **memorable-thing forcing question**: *"What's the one thing you want someone to remember after seeing this product for the first time?"* One sentence — a feeling, a visual, a claim, or a posture. Every subsequent decision serves this answer. Design that tries to be memorable for everything is memorable for nothing.

If prior sessions established taste (approved/rejected fonts, palettes, aesthetics), factor them in as demonstrated preference, not constraint — and say so explicitly when deliberately departing from them.

## Phase 2: Research (only if requested)

Search for 5–10 products in the space; visually inspect the top 3–5 if a browser is available (fonts actually used, palette, layout approach, spacing density). Synthesize in three layers:

- **Layer 1 (tried and true):** patterns every product in the category shares — table stakes.
- **Layer 2 (current):** what's trending in the design discourse right now.
- **Layer 3 (first principles):** given *this* product's users and positioning — where is the conventional approach wrong? Where should we deliberately break from category norms?

Report conversationally: where the category converges, where it all feels interchangeable, where the opportunity to stand out is.

## Phase 3: The Complete Proposal

Propose everything as one coherent package — this is the soul of the skill:

```
AESTHETIC: [direction] — [rationale]
DECORATION: [minimal / intentional / expressive] — [why it pairs with the aesthetic]
LAYOUT: [grid-disciplined / creative-editorial / hybrid] — [why it fits the product type]
COLOR: [restrained / balanced / expressive] + palette (hex values) — [rationale]
TYPOGRAPHY: [display, body, data, code fonts with roles] — [why these]
SPACING: [base unit + density] — [rationale]
MOTION: [minimal-functional / intentional / expressive] — [rationale]

This system is coherent because [how the choices reinforce each other].

SAFE CHOICES (category baseline — users expect these): [2–3, with rationale]
RISKS (where this product gets its own face): [≥2 deliberate departures —
  what it is, why it works, what you gain, what it costs]
```

The SAFE/RISK split is critical: coherence is table stakes — every product in a category can be coherent and still look identical. The risks are where the product becomes memorable. Options offered: adjust a section · show wilder risks · start over · approve.

**Aesthetic directions to draw from:** Brutally Minimal · Maximalist Chaos · Retro-Futuristic · Luxury/Refined · Playful/Toy-like · Editorial/Magazine · Brutalist/Raw · Art Deco · Organic/Natural · Industrial/Utilitarian.

**Font guidance:**
- Display: Satoshi, General Sans, Instrument Serif, Fraunces, Clash Grotesk, Cabinet Grotesk
- Body: Instrument Sans, DM Sans, Source Sans 3, Geist, Plus Jakarta Sans, Outfit
- Data: Geist / DM Sans (tabular-nums), JetBrains Mono, IBM Plex Mono
- Code: JetBrains Mono, Fira Code, Berkeley Mono, Geist Mono
- **Blacklist (never):** Papyrus, Comic Sans, Lobster, Impact, Brush Script, Trajan, Courier New for body
- **Overused (never as primary unless requested by name):** Inter, Roboto, Arial, Helvetica, Open Sans, Lato, Montserrat, Poppins, Space Grotesk — the last being the classic convergence trap ("the safe alternative to Inter").

**AI-slop anti-patterns (never recommend):** purple/violet gradient default accents · 3-column feature grids with icons in colored circles · centered-everything with uniform spacing · uniform bubbly border-radius · gradient primary CTAs · generic stock-photo heroes · `system-ui` as the display font ("I gave up on typography").

**Coherence validation:** when the user overrides one section, check the rest still coheres. Flag mismatches with a gentle nudge (brutalist aesthetic + expressive motion is unusual — intentional?) but always accept the final choice. Never block.

## Phase 4: Preview

Generate a preview before committing: an HTML page (or mockups if a design tool is available) demonstrating the system — type scale in use, the palette on real components, spacing rhythm, one representative screen. The preview page must itself demonstrate the taste it proposes — no slop in your own output. Iterate until approved.

## Phase 5: Write DESIGN.md

Write `DESIGN.md` at the repo root:

```markdown
# Design System — [Project]
## Product Context      — what, who for, space, project type
## Aesthetic Direction  — direction, decoration level, mood, references
## Typography           — each role: font + rationale; loading strategy; modular scale
## Color                — approach, primary/secondary/neutrals/semantic (hex), dark-mode strategy
## Spacing              — base unit, density, scale: 2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64)
## Layout               — approach, grid per breakpoint, max content width, radius scale
## Motion               — approach, easing (enter/exit/move), duration tiers
## Decisions Log        — | date | decision | rationale |
```

Then append to the project's agent instructions (CLAUDE.md / AGENTS.md):

> **Design System:** Always read DESIGN.md before making any visual or UI decision. Do not deviate without explicit user approval.

Confirm the final summary with the user, flagging any decision that used a default without explicit confirmation.

## Rules

1. **Propose, don't present menus.** You are a consultant, not a form. Opinionated recommendation first; the user adjusts.
2. **Every recommendation needs a rationale.** Never "I recommend X" without "because Y."
3. **Coherence over individually-optimal choices.** A system where every piece reinforces every other beats mismatched best-in-class picks.
4. **Anti-convergence across sessions.** Never propose the same choices twice without explicit justification — convergence across generations is slop.
5. **Accept the user's final choice.** Nudge on coherence, never refuse to write the file.

## Anti-Default Calibration

Generated design clusters around a small set of recognizable defaults. Naming them is the defense — these are legitimate looks *for some briefs*, but they appear regardless of subject, which makes them defaults rather than choices:

1. Warm cream background (~#F4F1EA) + high-contrast serif display + terracotta accent
2. Near-black background + one bright acid-green or vermilion accent
3. Broadsheet layout: hairline rules, zero border-radius, dense newspaper columns

Where the brief pins a direction, follow it exactly — even if it asks for one of these. Where the brief leaves an axis free, **don't spend that freedom on a default**. The self-test: work through a similar brief mentally — if you'd arrive at the same design, it's a default, not a decision for *this* product. Revise that part and say what changed.

**The signature element.** Every design gets remembered for at most one thing — choose it deliberately. Spend your boldness in one place: the signature element is the memorable risk, and everything around it stays quiet and disciplined. Cut any decoration that doesn't serve the brief (before leaving the house, remove one accessory). Not taking any risk is itself a risk — a design with no signature is template output with better taste.

**Ground it in the subject.** Distinctive choices come from the product's own world — its materials, instruments, vernacular. If the brief doesn't pin down the subject, pin it yourself before designing: one concrete subject, its audience, the page's single job. The hero is a thesis: open with the most characteristic thing in the subject's world, and question inherited devices (numbered 01/02/03 markers only when the content genuinely is a sequence).

**Quality floor, unannounced:** responsive to mobile, visible keyboard focus, `prefers-reduced-motion` respected — built in, not bragged about.

## Common Rationalizations

| Excuse | Reality |
|---|---|
| "Inter is popular because it's good" | It's good and it's invisible. Popularity is exactly why it can't make this product memorable. |
| "We can pick colors as we build" | Ad-hoc decisions compound into incoherence. One hour of consultation saves fifty inconsistent screens. |
| "The safe version is what the users expect" | Safe everywhere = interchangeable. Propose the risks; the user decides which to take. |
| "DESIGN.md is bureaucracy" | It's the difference between a design system and a design memory. Agents and teammates can't read your head. |

## Red Flags

- The proposal has no RISK section
- A font from the overused list appears as primary without the user naming it
- The preview page looks like the anti-pattern list
- DESIGN.md was written but the agent-instructions pointer wasn't added
- You presented four menus instead of one opinionated proposal

## Verification

- [ ] Memorable-thing answer captured and reflected in the proposal
- [ ] Full-package proposal delivered with SAFE/RISK split and coherence rationale
- [ ] Preview generated and approved
- [ ] DESIGN.md written with all sections and concrete values (hex, px, font names)
- [ ] Agent instructions updated to point at DESIGN.md
