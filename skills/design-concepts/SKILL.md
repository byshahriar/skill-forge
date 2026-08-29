---
name: design-concepts
description: Generates multiple genuinely distinct design directions for the same screen or product, presents them side by side, collects structured feedback, and iterates toward a winner. Use when the user can't articulate what they want visually, when asked to "show me some options", "try a few directions", or when a design decision is stuck on taste.
license: MIT
---

# Design Concepts

## Overview

Design exploration by shotgun: instead of debating one design in the abstract, generate N deliberately different directions, put them side by side, and let reactions drive the iteration. People can't describe the design they want, but they can instantly point at the one they like. The skill's discipline is *divergence* — variants that feel like they came from three different design teams, not the same team at three coffee levels.

## When to Use

- The user says "I don't know what I want it to look like" or "show me options"
- A visual direction is contested or stuck
- Rebooting the look of an existing screen ("I don't like THIS")
- After `design-system` when a key screen needs its concrete expression

**When NOT to use:** The direction is already decided and needs specification (use `design-system`) or QA (use `design-qa`).

## Step 1: Context

Gather the inputs: what screen/product, who it's for, any existing DESIGN.md (variants may deliberately break from it — say when they do), prior feedback ("taste memory": what was approved and rejected before), and the user's request. If evolving from an existing UI, capture a screenshot of the current state first.

## Step 2: Concept Generation

Before producing anything visual, write N (default 3) text concepts — each a distinct creative direction, not a minor variation:

```
I'll explore 3 directions:
A) "Name" — one-line visual description
B) "Name" — one-line visual description
C) "Name" — one-line visual description
```

**Anti-convergence directive (hard requirement):** each variant MUST use a different font family, color palette, and layout approach. Concrete test: if someone could swap the headline text between two variants without noticing, they're too similar — regenerate the weaker one with a deliberately different direction.

Confirm the concepts with the user before generating (adjust / add / drop directions — max 2 rounds of rework).

## Step 3: Generate Variants

Produce each variant as a self-contained rendering — an HTML/CSS page per variant is the portable default (real fonts loaded, real spacing, plausible content — never lorem ipsum for headlines). If an image-generation or design tool is available, use it; run variants in parallel when possible. Name outputs `variant-a`, `variant-b`, `variant-c`.

Every variant must be honest: real content lengths, at least one non-happy state (empty or edge case) visible, mobile behavior at least sketched.

## Step 4: Comparison Board

Present all variants side by side — one artifact or page showing every direction with its name and one-line intent. Then collect **structured** feedback, per variant:

- **Keep** — what specifically works (element-level, not "I like B")
- **Kill** — what specifically fails
- **Steal** — anything from a losing variant worth grafting onto the winner

Push past "B looks nice": *which parts* of B — the type scale? the density? the color temperature? Structured reactions are what make iteration converge.

## Step 5: Iterate

Synthesize: winner + grafts + kills → one refined direction. Generate the refined version. Repeat the feedback loop until approved — typically 1–2 rounds. If two rounds produce no convergence, stop and ask whether the disagreement is actually about the underlying product framing (send that back to `discovery` or `design-system`).

## Step 6: Commit

- Record the outcome: winning direction, its named fonts/colors/layout, and *why* it won
- Update DESIGN.md's Decisions Log (or create one via `design-system`) so the exploration isn't re-litigated next month
- Record rejected directions and the reasons — taste memory for future sessions
- Hand off to implementation (`ui-engineering`) with the winning variant as the visual spec

## Worked Example: Three Directions for a Dev-Tool Landing Page

Product: an open-source database migration tool. Brief: "landing page; devs should trust it instantly."

```
I'll explore 3 directions:
A) "Terminal-native" — the page IS a terminal session: dark, monospace
   (Berkeley Mono), the hero is a live-typed migration run with real output.
   Palette: near-black, phosphor green used *only* for command output.
B) "Field manual" — printed-manual aesthetic: cream paper, Fraunces serif
   headings, numbered sections, engineering-drawing diagrams of the
   expand/contract flow. Reads like documentation you'd trust with prod.
C) "Control room" — data-dense dashboard look: IBM Plex Sans, grid of live
   stats (migrations run, rollbacks, locks avoided), status-light accents.
   The hero is the tool's own telemetry, shown honestly.
```

**Headline-swap test:** swap A's headline onto B — instantly wrong (a typed terminal command makes no sense on paper texture). A↔C share darkness, so check harder: different type families (mono vs Plex), different structure (single narrative column vs stat grid), different accent logic (output-only green vs status lights). Pass — three different design teams.

**Structured feedback after the board:** Keep — A's live-typed hero ("that's the product, immediately"), B's expand/contract diagram. Kill — C entirely ("looks like we're selling observability"), B's cream background ("too gentle for a tool that touches prod"). **Steal** — B's diagram and numbered-section structure, grafted into A. Round 2: A's terminal world with B's engineering-manual structure inside it. Approved. The winner existed in nobody's head before the board — that's the shotgun working.

## Common Rationalizations

| Excuse | Reality |
|---|---|
| "Three variants is 3x the work" | Variants are cheap; building the wrong direction is expensive. The comparison board *is* the requirements gathering. |
| "Two of my variants are similar but both good" | Then you made one variant twice. Similar variants waste a slot that could have tested a genuinely different direction. |
| "The user picked A, ship it" | Ask what to steal from B and C first — the winner is usually A's layout with B's palette. |
| "I'll describe the options in text to save time" | Nobody can evaluate a design from prose. Show it or don't offer it. |
| "Lorem ipsum is fine for a concept" | Fake content hides the design's real problems: overflow, hierarchy, density. Real content or realistic content. |

## Red Flags

- Two variants share a font family or palette
- Feedback collected as "which do you like?" with no keep/kill/steal structure
- More than 2 refinement rounds without convergence and no escalation
- The winning direction was never written down anywhere durable
- Variants generated before the concepts were confirmed

## Verification

- [ ] N distinct concepts confirmed before generation
- [ ] Every variant passes the headline-swap test against every other
- [ ] Comparison presented side by side with structured feedback collected
- [ ] Winner synthesized with explicit steals and kills
- [ ] Decision recorded durably (DESIGN.md decisions log or equivalent)
