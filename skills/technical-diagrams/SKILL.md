---
name: technical-diagrams
description: Turns an English description or mermaid source into editable technical diagrams — architecture, data flow, state machines, pipelines — delivered as source plus rendered output. Use when asked to "make a diagram", "draw the architecture", "create a flowchart", "visualize this flow", or when a plan or doc needs a non-trivial flow made visible.
license: MIT
---

# Technical Diagrams

## Overview

English in, editable diagram out. Every diagram is delivered as a **pair, never a dead pixel dump**: the source (mermaid — the LLM- and human-editable interchange format) plus the rendered output (SVG/PNG, or the source embedded directly where the destination renders mermaid natively). The source is the single source of truth; edits happen there and re-render, so diagrams stay maintainable instead of rotting as screenshots.

## When to Use

- Asked to diagram an architecture, flow, pipeline, or state machine
- A plan, PR, ADR, or README describes a non-trivial flow in prose — flows deserve pictures
- Explaining a system to someone new
- A design review demands the mandatory flow diagrams

**When NOT to use:** Trivial linear flows (A calls B) — a sentence beats a two-box diagram; UI mockups (use `design-concepts`); data visualizations/charts.

## Step 1: Choose the Diagram Type

| Content | Type | Mermaid form |
|---|---|---|
| Pipelines, data flow, request flow | Flowchart | `graph LR` |
| Hierarchies, decision trees | Flowchart | `graph TD` |
| Multi-party interactions over time | Sequence | `sequenceDiagram` |
| Lifecycle with named states | State machine | `stateDiagram-v2` |
| Data models | ER diagram | `erDiagram` |
| Timelines/phases | Gantt | `gantt` |

Flowcharts are the sweet spot — most editable, most portable. Prefer them unless the content is genuinely temporal (sequence) or stateful (state machine).

## Step 2: Author the Source

Write the mermaid source first, to a file (`diagrams/<slug>.mmd` in a repo, kebab-case slug ≤40 chars) or directly into the destination document. Rules:

- **Keep node labels short; put detail in edge labels.** Nodes name things; edges explain relationships.
- **5–15 nodes is the readable range.** More than that: split into multiple diagrams (overview + drill-downs) and say why.
- **The diagram must show the real mechanism** — branch points, failure paths, async boundaries. A diagram of only the happy path is a diagram of the demo.
- Label the arrows. An unlabeled arrow between two boxes conveys almost nothing.
- Include error/fallback paths as first-class edges (dashed or labeled), not footnotes.

## Step 3: Render

Pick the first available path:

1. **Native mermaid rendering** — GitHub READMEs/PRs/issues, many doc systems, and artifact viewers render ```` ```mermaid ```` fences directly. Embed the source; done — source and render are the same artifact.
2. **Local mermaid CLI** — `npx -y @mermaid-js/mermaid-cli -i <slug>.mmd -o <slug>.svg` (add `-o <slug>.png -s 3` for a high-DPI raster). Verify the render succeeded; if mermaid errors, fix the source and retry — never deliver a broken source file.
3. **ASCII fallback** — when the destination is plain text (code comments, terminals): draw a clean ASCII diagram *and* keep the mermaid source alongside for future rendering.

For hand-editable output, the mermaid source opens in mermaid.live and most diagram tools (Excalidraw imports mermaid flowcharts) — tell the user this; it's the "edit a box yourself" escape hatch.

## Step 4: Deliver

1. Show the rendered result (or the fenced source where it renders natively)
2. List the artifact paths: source + renders
3. Note the edit loop: "the `.mmd` is the source of truth — ask for changes and I re-render, or edit it in mermaid.live yourself"
4. If the diagram documents code, place it near the code it documents (README section, doc page, or a comment block) — and treat **diagram maintenance as part of any future change to that flow**. Stale diagrams are worse than none.

## Common Rationalizations

| Excuse | Reality |
|---|---|
| "A PNG is fine, nobody edits diagrams" | Nobody edits *PNGs* — that's why they rot. Source-first is what keeps the diagram alive. |
| "The flow is too complex to diagram" | Then it's too complex to hold in prose either. Split: one overview + drill-downs. |
| "I'll skip the error paths to keep it clean" | The error paths are usually why the diagram was needed. Clean and wrong loses to slightly busy and true. |
| "Everyone understands this system already" | The diagram is for the person who doesn't yet — next quarter that includes you. |

## Red Flags

- Delivering a render with no editable source
- A diagram with more than ~15 nodes and no split
- Unlabeled arrows everywhere
- The happy path is the only path shown
- A broken mermaid source handed to the user "to fix later"

## Verification

- [ ] Source file (or embedded fence) exists and parses cleanly
- [ ] Render verified visually — no overlap, readable at target size
- [ ] Error/branch paths present where the real system has them
- [ ] Artifacts placed where they'll be found (repo `diagrams/`, doc, or README)
- [ ] Edit loop explained to the user
