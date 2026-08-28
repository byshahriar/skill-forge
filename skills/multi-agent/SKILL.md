---
name: multi-agent
description: Designs and runs multi-agent work — when to fan out subagents, how to isolate contexts, verify adversarially, and merge results without losing information. Use when a task is too big for one context, when independent perspectives would raise confidence, when asked to "parallelize this", "fan out agents", or "use subagents".
license: MIT
---

# Multi-Agent

## Overview

Orchestration discipline for work split across agents. The governing rule: **the orchestrator is the user or the main session — workers do not invoke workers.** Multi-agent is a cost: every hand-off summarizes (loses) context and every layer adds tokens and latency. Reach for it only when one of three forces demands it: **scale** one context can't hold, **independence** (perspectives that must not contaminate each other), or **parallelism** across genuinely independent subtasks. Always compare against the baseline: one agent, one context, doing it directly.

## When to Use

- The work list is bigger than one context (migrations, audits, broad sweeps)
- Confidence needs independent derivation (reviews, verification, competing hypotheses)
- Subtasks are independent and wall-clock time matters
- Research would pollute the main context (read 50 files, return a digest)

**When NOT to use:** One perspective on one artifact — direct work is cheaper and better. Sequential phases with judgment between them — keep the human in the loop instead of an orchestrating agent that paraphrases.

## The Patterns

**1. Direct (baseline).** One agent, one artifact, one report. Always price other patterns against this.

**2. Parallel fan-out with merge.** N workers on the same input (different lenses) or on disjoint slices; a merge step in the *main* context synthesizes.
```
        ┌─→ correctness reviewer ─┐
input ──┼─→ security reviewer    ─┼─→ merge → decision
        └─→ test-coverage lens   ─┘
```
Requirements: subtasks truly independent (no shared mutable state, no ordering), each worker returns a *structured* result (findings with file:line, not prose essays), and the merge dedupes before any expensive downstream step.

**3. Research isolation.** A subagent reads the big thing and returns only a digest, keeping the main context clean for the decision that follows. Use when the result is much smaller than its inputs. Prefer the platform's built-in read-only explore/research agent where one exists.

**4. Adversarial verification.** For each finding/claim, spawn independent skeptics prompted to *refute* it; keep only what survives. Diversity beats redundancy: verifiers with distinct lenses (does it reproduce? is it exploitable? is it by design?) catch failure modes N identical checkers miss.

**5. Worker pool over a work list.** Discover the full work list first (scout inline), then run items through identical workers — each in an isolated context, writing to disjoint files or isolated worktrees. The pattern for migrations and sweeps.

**6. Judge panel.** Generate N independent attempts from different angles, score with independent judges, synthesize from the winner grafting the runners-up's best ideas. For wide solution spaces where one-attempt-iterated gets stuck in its first idea.

## Anti-Patterns

- **Router agent** — an agent whose only job is deciding which agent to call. Two paraphrase hops, ~2x cost, zero domain value. Use direct commands/skills instead.
- **Worker calling worker** — the summary passed along loses exactly the context the second worker needed, and cost hides from the user. The worker *recommends* a follow-up; the orchestrator runs it.
- **Sequential orchestrator that paraphrases** — an agent running spec→plan→build on the user's behalf deletes the human checkpoints where judgment matters most and drifts a little at every hand-off.
- **Deep trees** — coordinator → sub-coordinator → worker. Keep depth at 1: orchestrator → workers, merge in the main context.
- **Fan-out for the feeling of thoroughness** — three agents confirming each other's vibes cost 3x and verify nothing. Independence of *method* is what buys confidence, not headcount.

## Design Rules

1. **Scout before you fan out.** Discover the work list inline (cheap searches) so workers get precise, self-contained briefs — not "go find stuff".
2. **Self-contained briefs.** A worker sees nothing of this conversation. Its prompt carries: exact scope, file paths, output schema, and what *done* means. Ambiguous briefs return essays.
3. **Structured returns.** Define the return shape (list of {file, line, finding, severity}) so merging is mechanical, not another LLM pass.
4. **Isolate writes.** Parallel workers that write must not share files — disjoint slices or per-worker worktrees/branches, merged deliberately.
5. **Merge dedupes before verify.** Overlapping finders produce duplicates; dedupe by anchor (file:line, key) before spending verification on each.
6. **Verify what matters.** Findings that drive action get the adversarial pass; observations don't.
7. **Report honestly.** The final synthesis states coverage (what was and wasn't examined) and confidence — silently-partial coverage reads as "checked everything" and is worse than saying "top 20 of 210 files".

## Decision Flow

```
One perspective, one artifact?            → direct. stop.
Result much smaller than inputs?          → research isolation.
Independent subtasks / lenses?            → fan-out + merge (verify adversarially if findings drive action).
Big uniform work list?                    → scout, then worker pool.
Wide-open solution space?                 → judge panel.
Phases with judgment between them?        → user-driven sequence — no orchestrating agent.
```

## Subagent-Driven Plan Execution

The strongest form of the worker-pool pattern: executing a written plan (from `plan`) with a **fresh implementer subagent per task, a review after each task, and one broad whole-branch review at the end**. Fresh context per task means no pollution between tasks; the orchestrating session spends its context on coordination, not implementation.

**Per task:**
1. Dispatch an implementer with *only* what the task needs: the task text (files, interfaces, steps), the plan's Global Constraints, and nothing of the session history
2. Implementer implements test-first, self-reviews, commits
3. Dispatch a task reviewer (fresh context): spec compliance + code quality against the task's requirements
4. Findings → fix rounds, capped: rounds 1–3 resume the same implementer; rounds 4–5 dispatch a *fresh* implementer on a more capable model (the stuck one's context is part of the problem). After 5 rounds, stop and adjudicate each open finding rather than looping.
5. Log completion in the **ledger**, then next task

**The ledger is the recovery map.** Session memory does not survive compaction — controllers that lost their place have re-dispatched entire completed task sequences, the single most expensive observed failure. Keep a progress file (task N: complete / mid-fix-round / rulings made); after any context loss, trust the ledger and `git log` over recollection.

**Pre-flight conflict scan.** Before dispatching task 1, scan the plan: one row per pair of tasks sharing a file or interface (produces vs consumes), one row per task for internal consistency. Rule on every conflict found — the spec is the binding authority — and record rulings in the ledger. "The scan is clean" without the rows is not a scan.

**Model selection per role.** Use the least capable model that handles the role: mechanical well-specified tasks → fast/cheap; integration and debugging → standard; architecture decisions and the final whole-branch review → most capable; fix-round escalation → at least one tier above the stuck implementer.

## Parallel Dispatch Mechanics

For N independent problems (different failing test files, unrelated bugs):

- Group failures by *what's broken*, not where they appear; each group must be understandable without the others
- Each agent's brief: specific scope (one file/subsystem) · clear goal ("make these tests pass") · constraints ("don't change other code") · expected output shape
- **Issue all dispatches in one response** — that's what makes them parallel; one per response is sequential by accident
- Don't parallelize when failures might be related (fix one may fix others — investigate together first) or when agents would touch shared state

## Common Rationalizations

| Excuse | Reality |
|---|---|
| "More agents = more thorough" | More agents = more summaries. Thoroughness comes from coverage design and verification, not headcount. |
| "The workers can coordinate among themselves" | Peer-to-peer summaries compound loss. Coordination is the orchestrator's job, once, at the merge. |
| "It's parallel, so it's faster" | Only past the constant costs of briefing, spawning, and merging. For small tasks the pool is slower than doing it. |
| "The agent can decide how to split the work" | Splitting *is* the orchestration decision — delegate it and you've built the router anti-pattern. |
| "One verifier is enough" | One verifier with the same blind spot as the finder confirms the bug into production. Distinct lenses or don't bother. |

## Red Flags

- A worker's brief says "investigate and use your judgment" with no scope or output shape
- Two parallel workers editing the same file
- A merge step that concatenates instead of synthesizing
- Orchestration depth > 1
- The final report can't say what *wasn't* covered

## Verification

- [ ] Baseline considered: would one agent doing it directly be cheaper/better?
- [ ] Work list scouted; briefs self-contained with output schemas
- [ ] Writes isolated; merge deduped; action-driving findings verified
- [ ] Depth ≤ 1; no worker invoked another worker
- [ ] Synthesis states coverage and confidence honestly
