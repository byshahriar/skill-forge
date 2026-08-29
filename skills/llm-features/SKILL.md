---
name: llm-features
description: Builds product features on language models with evaluation-driven development — golden sets, prompt iteration against measured scores, non-determinism handling, and cost/latency budgets. Use when adding an AI-powered feature, when prompt changes keep breaking things that used to work, when deciding between prompting and fine-tuning or RAG, or when an LLM feature needs to be made reliable enough to ship.
license: MIT
---

# LLM Features

## Overview

Shipping a feature built on a language model breaks the normal development loop in one specific way: **the same input can produce different output, and "correct" is a spectrum rather than a boolean.** Every practice below follows from that. You cannot unit-test your way to confidence, you cannot eyeball your way to a regression check, and the demo that impressed everyone proves almost nothing about the ninety-ninth user.

**The iron law:**

```
NO PROMPT CHANGE WITHOUT A MEASURED EVALUATION
```

Prompt engineering without evals is not engineering — it is anecdote collection, and it degrades silently: the change that fixed the case you were staring at broke three you weren't.

## When to Use

- Adding any product feature powered by a language model
- A prompt keeps regressing: fixing one case breaks another
- Choosing between prompting, retrieval (RAG), tool use, and fine-tuning
- Making an LLM feature reliable, affordable, or fast enough to ship
- Reviewing an existing AI feature that "works in the demo"

**When NOT to use:** Exposing tools *to* an agent (MCP servers) — that's `mcp-development`. Securing an AI feature against prompt injection and data leakage — that's `security`'s LLM section (run both; they're complements). General API design — `api-design`.

## Phase 1: Define Success Before Prompting

Write down, before the first prompt: **what does a good output look like, and how will we know?**

- **Task shape**: classification, extraction, generation, summarization, or agentic action. Each has different evaluation methods and different failure modes — extraction can be checked exactly, generation cannot.
- **Quality bar in observable terms.** "Helpful summaries" is not a bar. "Names every party mentioned in the contract, ≤120 words, no claims absent from the source" is.
- **Failure taxonomy**: enumerate how this can be wrong — fabricated facts, wrong format, refusal, truncation, wrong language, ignored instruction, unsafe content. You'll grade against this list.
- **Cost of being wrong.** A wrong autocomplete costs a keystroke; a wrong medication summary costs far more. This decides how much verification, review, and human-in-the-loop the feature needs — and whether it should ship at all.

## Phase 2: Build the Golden Set First

The evaluation set is the test suite, and it comes **before** prompt iteration — the same reason a test comes before the implementation:

- **Start with 20–50 cases**, curated by hand. Small and real beats large and synthetic. Grow it with every bug found in the wild — a production failure becomes an eval case, permanently.
- **Cover the distribution, not just the happy path**: typical inputs, edge cases (empty, enormous, malformed, adversarial), the ambiguous cases where reasonable outputs differ, and cases the feature *should refuse*.
- **Each case carries what "good" means**: an exact expected value where one exists, or explicit criteria/rubric where it doesn't ("must mention X; must not assert Y; under N words").
- **Hold out a portion.** Prompts get overfitted to the cases you stare at, exactly like models overfit training data. Keep a slice you don't iterate against and check it before shipping.

**Grading methods**, cheapest first — use the cheapest that actually measures the thing:

| Method | Use for | Cost |
|---|---|---|
| Exact / fuzzy match | Classification, extraction, structured fields | Free, deterministic |
| Programmatic assertions | Format, schema validity, length, required substrings, no-PII | Free, deterministic |
| LLM-as-judge with a rubric | Open-ended quality, faithfulness, tone | Cheap, noisy — validate the judge against human labels on a sample |
| Human review | Anything high-stakes; calibrating the other methods | Expensive, definitive |

Most real evals combine them: programmatic checks for the hard requirements, judge or human for the soft ones.

## Phase 3: Iterate Against the Score

Now, and only now, engineer the prompt — one change at a time, re-run the suite, keep the score.

- **Track every run**: prompt version, model + version, parameters, per-case results, aggregate score. Without this you cannot tell improvement from noise, and "it feels better" is the thing you're trying to escape.
- **Prompt techniques, in rough order of leverage**: clear task framing and explicit output format → few-shot examples drawn from your golden set → decomposition into steps or chained calls → letting the model reason before answering → tool use / retrieval for facts it cannot know.
- **Ground facts rather than trusting recall.** If the answer depends on your data, retrieve and provide it; hallucination is not a bug to be prompted away, it is what a model does when it lacks the fact. When grounding, require the output to be attributable to the provided context and evaluate faithfulness explicitly.
- **Structured output over prose parsing.** Ask for JSON against a schema and validate it; a regex over free text is a permanent source of silent breakage.
- **Pin the model version.** Providers update models; a silent upgrade re-runs your unverified prompt on a different system. Pin, then re-run evals deliberately when you migrate.
- **Know when to stop prompting.** If accuracy plateaus below the bar, the next lever is retrieval, decomposition, a stronger model, or narrowing the feature — not a fifteenth rewording.

## Phase 4: Engineer for Non-Determinism

The feature ships into a world where the same input may produce different output on Tuesday:

- **Validate every output before it acts.** Schema-check structured responses; range-check numbers; verify referenced entities exist. Never let unvalidated model output flow into a privileged operation (that boundary is `security`'s trust rule).
- **Define the failure path**: retry once with a repair instruction, fall back to a deterministic path, or surface an honest error. Every LLM call needs the same four answers as any other network dependency (see `resilience`) — plus one more: what happens when it returns *successfully* but wrongly?
- **Set temperature deliberately**, low for extraction and classification, higher only where variety is the product.
- **Budget cost and latency explicitly.** Token cost per request × expected volume, and p95 latency against what the UI can absorb. Streaming changes perceived latency, not cost. Cache aggressively where inputs repeat.
- **Design the UI for uncertainty.** Show sources, make editing easy, and never present generated content as authoritative when it isn't. A feature that lets the user correct it cheaply survives errors that a feature presenting confident output does not.

## Phase 5: Ship With Measurement

- **Evals run in CI** on every prompt change, exactly like tests — the suite is the gate (`ci-cd`).
- **Log inputs, outputs, model version, and latency in production** (with privacy rules applied), because the eval set only knows what you thought of. Sample and review them regularly.
- **Instrument quality signals**, not just system metrics: refusal rate, schema-validation failure rate, fallback rate, user edits/regenerations/thumbs-down. These are the drift detector (`observability`).
- **Stage rollouts behind a flag** and compare quality metrics between variants before full release (`release`).
- **Re-run evals when anything changes** — model version, prompt, retrieval corpus, or upstream data.

## Common Rationalizations

| Excuse | Reality |
|---|---|
| "The prompt works, I tested it on a few examples" | A few examples is the sample size at which everything works. That's why the golden set exists. |
| "Evals are overhead for a small feature" | Without them, the next prompt tweak silently breaks working cases and nobody learns until users complain. Twenty cases is an afternoon. |
| "I'll add the eval set once the prompt is stable" | Prompts don't stabilize without measurement. The set is what *makes* it stable. |
| "It hallucinated because the prompt wasn't strict enough" | Models fabricate when they lack the fact. Sternness doesn't add knowledge; retrieval does. |
| "We'll parse the response with a regex for now" | Free-text parsing breaks on the first phrasing drift and fails silently. Ask for structured output and validate it. |
| "Newer model version, should be strictly better" | Different, not strictly better — for *your* task. That's a re-run of the evals, not an assumption. |
| "Temperature 0 makes it deterministic" | It reduces variance; it does not guarantee identical output across time, load, or provider changes. Design for variability anyway. |

## Red Flags

- A prompt file with no eval suite next to it
- Prompt changes reviewed by reading the diff, with no before/after scores
- Model version unpinned, or unknown
- Model output flowing into a database write, an API call, or a privileged action without validation
- Only happy-path cases in the eval set; no refusals, no adversarial inputs, no ambiguity
- No cost or latency number attached to a shipped feature
- Quality measured only at build time, never in production
- The judge model grading its own outputs with no human calibration

## Verification

- [ ] Success criteria and failure taxonomy written before prompting
- [ ] Golden set exists (20+ cases), covers edges and refusals, with a held-out slice
- [ ] Grading method chosen per criterion; LLM judges calibrated against human labels
- [ ] Every prompt change measured against the suite; runs tracked with model version
- [ ] Outputs validated structurally before use; failure path defined
- [ ] Cost and p95 latency measured and within stated budget
- [ ] Evals wired into CI; production quality signals instrumented and reviewed
