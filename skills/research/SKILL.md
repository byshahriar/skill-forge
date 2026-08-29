---
name: research
description: Turns unfamiliar domains, technologies, or source bundles into reliable mental models and structured reference output through a six-phase workflow. Use when facing an unfamiliar domain or stack, when asked to "research", "deep-dive", "compile sources", or "help me understand X", or before architectural decisions that depend on territory the team doesn't know yet. Not for quick lookups.
license: MIT
---

# Research

## Overview

A six-phase workflow that turns unfamiliar material into something usable: a working mental model, a decision-ready comparison, or a reference document. The discipline it enforces: primary sources over summaries, a distillation test before anything enters the outline, contradictions kept visible, and writing used as the proof of understanding — a section that's hard to write means the mental model is still weak there.

## When to Use

- Entering an unfamiliar domain, protocol, or stack before designing against it
- Compiling scattered sources (papers, posts, threads, repos) into one coherent reference
- An architectural decision hinges on technology nobody on the team knows deeply
- Asked to research, deep-dive, or "figure out how X actually works"

**When NOT to use:** Quick lookups and single-document reads — just read it. Understanding *this repo's* code — that's `code-research`. Validating a product idea — that's `discovery`.

## Choose the Mode First

| Mode | Goal | Runs phases | Output |
|---|---|---|---|
| **Quick model** | Working mental model fast, no document planned | 1–2 | Notes only |
| **Deep research** | Understand well enough to write about it | 1–6 | Structured reference/report |
| **Write to learn** | Materials already in hand; force understanding through writing | 3–6 | Draft |
| **Canonical reference** | One document so thorough readers need nothing else | 1–6, strict | Authoritative reference |

Unsure? Suggest Quick model — escalate if the notes turn out to matter.

**Canonical mode extras:** every major sub-topic gets its own section (nothing lives in a footnote), worked examples not just principles, a common-mistakes section, and a further-reading list of the 3–5 deepest sources with the best starting point flagged. Exit test: *could a reader implement or understand this from this document alone?*

## Phase 1: Collect

Gather **primary sources only**: the papers that introduced key ideas, official docs and design blogs, posts from the people who built it, canonical implementation repos. Not summaries, not explainers — explainers inherit their authors' misreadings.

Three ordered steps, no merging: **discover** (map the landscape by search, output a URL list — don't fetch yet), **fetch** (pull each source's actual content), **file** (organize by sub-topic so Phase 2 works from a corpus, not tabs).

Targets: 5–10 sources for a focused question, 15–20 for a deep technical survey.

## Phase 2: Digest

Read each source fully; keep what's good, cut ruthlessly. Before any claim enters the outline, run the **distillation test**:

1. Does the idea appear in at least two different contexts from the same source?
2. Can this framework predict what the source would say about a *new* problem?
3. Is this a specific insight from this source — not something any expert in the field would say?

Passes two or three → belongs in the outline. Passes one → background material. Passes zero → cut. **Generic wisdom is not worth distilling.**

When the input is internal material (postmortems, reviews, past conversations), additionally: prefer already-distilled summaries over raw transcripts; promote a lesson only with cross-source support or a repeated failure in the same family; strip dated line numbers, private paths, and one-machine setup unless the output targets that exact repo.

## Phase 3: Outline

Write the outline with **source mapping**: each section notes which materials it draws from. A section with no sources either doesn't belong or needs a source found first — that's the hard rule that keeps the output grounded instead of vibes-with-headings.

## Phase 4: Fill In

Work section by section. **A hard-to-write section is a diagnostic**, not a writing problem: the mental model is weak there — return to Phase 2 for that sub-topic, not the whole document. Stall signals: an opening sentence rewritten three times, a single-source claim with no cross-check, a claim you couldn't explain out loud. The outline may change; that's fine.

## Phase 5: Refine

Edits only — cut redundancy without changing meaning, flag broken argument flow, mark gaps (concepts used before they're explained, claims needing sources). No drafting new sections from scratch here. Then a prose pass for generated-text patterns (see `docs` → Prose Quality).

## Phase 6: Self-Review

Read the entire output linearly, start to finish, as the intended reader would. Mark everything that feels off, fix, read again — **two passes minimum**. It's ready when it reads clean end to end.

## Hard Rules

- **No Phase 4 before the outline is solid.** Unsourced sections don't get written; they get sourced or cut.
- **Contradictions stay visible.** When two sources disagree on a factual claim, present both positions with their evidence. Silently picking one is how research documents lie.
- **Uncertainty is content.** "The docs claim X; the maintainer's issue comments suggest Y; untested" is more valuable than false confidence.
- **Stop at the deliverable.** Research produces the document/model; publishing, deciding, or building on it is the user's next move, not an automatic continuation.

## Worked Example: Distillation in Action

Researching *"should we adopt CRDTs for collaborative editing?"* — three claims from the collected sources, run through the test:

1. **"CRDTs guarantee convergence without coordination."** Appears in the foundational paper *and* in two implementation postmortems (multi-context ✓); predicts what sources say about offline edits (predictive ✓); it's the field's defining property (any expert would say it ✗). Score 2/3 → **outline**, as load-bearing background.
2. **"Text CRDTs pay 10–100x memory overhead versus the raw document, and tombstone growth is unbounded without GC."** From one implementer's production writeup, echoed with numbers in a second team's migration notes (✓); predicts their stance on long-lived documents (✓); specific, non-obvious, decision-relevant (✓). Score 3/3 → **outline**, this is the finding the decision turns on.
3. **"Collaboration features increase user engagement."** One marketing-adjacent source (✗ single context); predicts nothing specific (✗); any expert would nod (✗). Score 0/3 → **cut**.

A contradiction surfaces: source A claims modern CRDT libraries have "solved" the memory problem; source B's benchmarks (18 months newer) show 40x overhead on large documents. **Both go in the outline**: "A claims solved via compression (no benchmarks provided); B measures 40x on 1MB+ docs. Untested against our document sizes — this is the spike to run before committing." The contradiction, kept visible, just became the project's next concrete action.

## Common Rationalizations

| Excuse | Reality |
|---|---|
| "This explainer summarizes the paper fine" | Explainers flatten the caveats — which are usually the part your decision hinges on. Primary sources or it's hearsay. |
| "I know enough to skip collection" | Then Quick-model mode confirms it in twenty minutes. Skipping collection on a deep dive produces confident documents about the wrong version. |
| "The outline is a formality" | The source-mapped outline is the whole quality mechanism: it's where unsourced claims become visible *before* they're prose. |
| "Both sources say roughly the same thing" | Roughly is where the interesting difference lives. Check whether they actually agree before merging them. |
| "One read-through is enough" | The first pass catches what's wrong; the second catches what the first pass broke. Two minimum. |

## Red Flags

- The source list is mostly blog explainers and zero primary material
- A section exists in the outline with no source next to it
- A contradiction was resolved by omission
- The document was declared done without a linear read-through
- Research findings drifting straight into implementation without the user's decision

## Verification

- [ ] Mode chosen explicitly; phases matched to it
- [ ] Sources are primary; count fits the target range
- [ ] Every outline section maps to sources; distillation test applied to key claims
- [ ] Contradictions presented, not resolved by silence
- [ ] Two full linear review passes done
- [ ] Deliverable matches the mode (notes / reference / draft)
