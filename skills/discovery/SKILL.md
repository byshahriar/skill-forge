---
name: discovery
description: Validates and sharpens an idea before anything is specified or built — demand evidence, premise challenge, divergent variations, and forced alternatives, ending in a design doc. Use when an idea is still vague, when deciding whether something is worth building, when asked to "ideate", "stress-test my idea", or "is this worth doing", or before spec work begins on a new product or feature.
license: MIT
---

# Discovery

## Overview

The phase before the spec. Discovery makes sure the problem is understood before solutions are proposed: it challenges premises, demands evidence over interest, opens the idea up with divergent variations, forces real alternatives, and converges on a written design doc. It adapts to who's asking — founders and product bets get the hard questions; hobby, learning, and internal-tool builders get an enthusiastic design partner.

**Hard gate:** this skill produces a design doc, not code. No implementation, no scaffolding — not even "just the project skeleton".

## When to Use

- An idea is raw, vague, or exciting-but-unexamined
- Deciding whether something is worth building at all
- Before `specify` — discovery answers *whether and what*, specify answers *exactly what*
- When a plan keeps changing because the underlying problem was never pinned down

**When NOT to use:** The problem and direction are already validated and written down — go to `specify`. Reviewing an existing plan's scope is `ceo-review`.

## Right-Sizing: The Three Paths

Not every request needs full discovery. Classify before the first question — and say the classification out loud so the user can override it:

- **Spike** — a feasibility question ("can we…?", "is it possible…?") whose output is an *answer*, not code you keep. Present the question and the probe plan in 2–3 sentences, get a nod, investigate as cheaply as correctness allows, report a recommendation. Anything built stays labeled throwaway — keeping spike code is a new request that gets its own classification.
- **Bounded** — a well-scoped change to a flow that *already exists in this repo* (a flag, a small endpoint, a one-file fix). Bounded measures the repo, not your familiarity — if there's no existing flow to change, it isn't bounded. Ask the clarifying questions that matter, present a short design in chat (a few sentences), and **stop for an explicit yes**. No design doc needed.
- **Full discovery** — new products, new subsystems, changes that restructure how components fit. Run the complete workflow above, ending in the design doc.

**The ratchet is one-way.** When in doubt between two paths, take the heavier one; hidden complexity discovered mid-task upgrades the path — stop, say so, step up. Nothing downgrades mid-task.

**The approval gate never scales down.** The *artifact* scales with simplicity (two sentences in chat vs a full doc); the approval doesn't. "Too simple to need a design" means a short design, not no design — simple tasks are where unexamined assumptions waste the most work. Presenting the design and starting in the same breath is skipping the gate.


## Socratic Refinement

When refining an idea conversationally (any path), the questioning discipline:

- **One question at a time** — never batch. Each answer reshapes what's worth asking next.
- Prefer questions that force a choice over questions that invite an essay ("A or B?" beats "what do you think about…?")
- Restate the evolving understanding every few exchanges — "so what I'm hearing is X, with constraint Y" — so drift gets caught while it's cheap
- When an answer surprises you, follow *that* thread; surprise is where the real requirements live


## Phase 1: Context & Mode

Gather what already exists: prior notes, related code (if in a codebase, ground variations in real files and patterns), previous attempts, the competitive landscape.

Then pick the mode:

- **Startup mode** — building a product, a business, or an internal bet: run the diagnostic below. Direct to the point of discomfort; diagnosis, not encouragement.
- **Builder mode** — hacking, learning, open source, fun: be an enthusiastic, opinionated collaborator. Delight is the currency; the questions become generative ("what makes someone say whoa?") instead of interrogative. If the vibe shifts mid-session ("actually this could be a real company"), upgrade to startup mode: "Okay — now let me ask you some harder questions."

**Operating principles (startup mode):**
- **Specificity is the only currency.** "Enterprises in healthcare" is not a customer. You need a name, a role, a company, a reason.
- **Interest is not demand.** Waitlists and "that's interesting" don't count. Behavior counts. Money counts. Panic when it breaks counts.
- **The user's words beat the founder's pitch.** If users describe the value differently than the pitch does, the users are right.
- **Watch, don't demo.** Guided walkthroughs teach nothing; watching someone struggle in silence teaches everything.
- **The status quo is the real competitor** — the spreadsheet-and-chat workaround, not the rival startup. If "nothing" is the current solution, the pain probably isn't real.
- **Narrow beats wide, early.** Wedge first; expand from strength.
- **No sycophancy.** Never "that's an interesting approach" — take a position and state what evidence would change it. Push once, then push again: the first answer is the polished version.

## Phase 2: The Forcing Questions (startup mode)

Ask **one at a time**. Route by stage — pre-product: Q1–Q3 · has users: Q2, Q4, Q5 · paying customers: Q4–Q6 · pure infra: Q2 + Q4. Push each until the answer is specific, evidence-based, and uncomfortable.

1. **Demand reality** — "What's the strongest evidence someone actually wants this — would be genuinely upset if it disappeared tomorrow?" Accept only behavior: paying, expanding usage, building workflows around it. Red flags: waitlist counts, "VCs are excited".
2. **Status quo** — "What are users doing right now to solve this, even badly, and what does the workaround cost them?" Accept only specifics: hours, dollars, duct-taped tools. "Nothing exists — that's the opportunity" is a red flag, not a moat.
3. **Desperate specificity** — "Name the actual human who needs this most. Title? What gets them promoted, fired, kept up at night?" Categories are filters, not people — you can't email "SMBs".
4. **Narrowest wedge** — "What's the smallest version someone would pay real money for *this week*?" If nothing smaller than the platform has value, the value proposition isn't clear yet. Bonus push: what if the user didn't have to do *anything* to get value — no login, no setup?
5. **Observation & surprise** — "Have you watched someone use this without helping? What surprised you?" Surveys lie, demos are theater, and "as expected" means not watching. Users doing something the product wasn't designed for is often the real product trying to emerge.
6. **Future-fit** — does this get stronger or weaker as the ecosystem evolves? What has to stay true for this to matter in two years?

After the first answer, check the framing itself: are key terms defined and measurable? What hidden assumptions does the framing smuggle in? Is the pain real or hypothetical? Reframe constructively if needed: "Let me restate what I think you're actually building: […] — closer?"

## Phase 3: Diverge

Open the idea up. Generate 5–8 variations using these lenses (pick what fits — don't run all mechanically):

- **Inversion** — what if we did the opposite?
- **Constraint removal** — what if budget/time/tech weren't factors?
- **Audience shift** — what if this were for a different user?
- **Combination** — merge with an adjacent idea
- **Simplification** — the 10x simpler version
- **10x** — what does this look like at massive scale?
- **Expert lens** — what would domain insiders find obvious that outsiders miss?

Push beyond what was asked for. Then converge: cluster what resonated into 2–3 meaningfully different directions and stress-test each on **user value** (painkiller or vitamin?), **feasibility** (what's the hardest part?), and **differentiation** (would anyone switch?). Surface hidden assumptions explicitly: what we're betting is true, what could kill this, what we're choosing to ignore and why that's okay for now.

## Phase 4: Premise Challenge

Before any solutioning, output the premises as statements the user must explicitly agree with:

```
PREMISES:
1. [statement] — agree/disagree?
2. [statement] — agree/disagree?
```

Include: is this the right problem or a proxy? What happens if we do nothing? What existing code/products already partially solve it? If the deliverable is a new artifact — how do users *get* it (distribution is design scope, not an afterthought)? If any premise is rejected, revise understanding and loop back.

## Phase 5: Alternatives (mandatory)

Produce 2–3 distinct approaches — never one:

```
APPROACH A: [name]
  Summary / Effort (S/M/L/XL) / Risk (Low/Med/High)
  Pros / Cons / Reuses: [existing code or products leveraged]
```

One must be **minimal viable** (ships fastest), one the **ideal architecture** (best long-term trajectory), optionally one **creative/lateral** (different framing entirely). Recommend one with a one-line reason mapped to the user's stated goal, then **stop** for the explicit decision. A "clearly winning approach" is still an approach decision.

## Phase 6: The Design Doc

Write the outcome to `docs/designs/<date>-<slug>.md` (or the project's convention):

```markdown
# [Idea Name]
## Problem Statement        — one-sentence "How Might We" framing
## Evidence                 — the demand reality from Phase 2, verbatim where possible
## Premises                 — the agreed statements
## Recommended Direction    — chosen approach and why (2–3 paragraphs max)
## Alternatives Considered  — the table from Phase 5 with rejection reasons
## Key Assumptions          — what we're betting on, unvalidated
## MVP / Wedge Scope        — the narrowest valuable version
## Not Doing                — explicitly out of scope, with reasons
## Assignment               — the one concrete real-world action to take next
```

Every session ends with the **assignment** — an action, not a strategy ("watch two users try the prototype this week"), and a completion status: DONE (doc approved) / DONE_WITH_CONCERNS (open questions listed) / NEEDS_CONTEXT (questions unanswered, doc incomplete).

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
| "The user is excited, hard questions will kill the momentum" | Momentum into the wrong product is the most expensive thing you can protect. Kind and direct beats warm and useless. |
| "They gave me a full plan, discovery is done" | Skip the questioning, but still run the premise challenge and alternatives. "Simple" plans hide the biggest premises. |
| "One approach is obviously right" | Then alternatives are cheap to write and the decision is fast. Forced alternatives exist because "obvious" is where blind spots live. |
| "I'll just start the code, the doc can come later" | The hard gate exists because scaffolding *is* a decision — it silently commits an architecture before the direction is agreed. |
| "Nothing surprised them in user tests, that's good" | That's the red flag. No surprises means no real observation happened. |

## Red Flags

- You wrote code, a scaffold, or a file that isn't the design doc
- A premise was assumed rather than explicitly agreed
- The session is ending with encouragement instead of an assignment
- Only one approach was ever on the table
- The "customer" is still a category, not a person

## Verification

- [ ] Mode chosen and diagnostic (or generative) questions asked one at a time
- [ ] Premises explicitly agreed by the user
- [ ] 2–3 alternatives presented; one explicitly chosen by the user
- [ ] Design doc written to disk with all sections, including Not Doing
- [ ] Assignment delivered — a concrete action, not advice
- [ ] Zero implementation artifacts created
