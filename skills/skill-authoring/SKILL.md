---
name: skill-authoring
description: Writes and tests agent skills using TDD for process documentation — baseline an agent without the skill, write against observed failures, pressure-test until loophole-free. Use when creating a new skill, editing an existing one, or when agents keep ignoring or rationalizing around a skill that exists.
license: MIT
---

# Skill Authoring

## Overview

**Writing skills IS test-driven development applied to process documentation.** The test case is a pressure scenario run by a fresh agent; RED is watching the agent fail *without* the skill; GREEN is the skill making the agent comply; REFACTOR is closing the loopholes agents talk themselves through. Core principle: if you never watched an agent fail without the skill, you don't know whether the skill teaches the right thing.

## When to Use

- Creating a new skill for this repo (pairs with CONTRIBUTING.md's format contract)
- An existing skill keeps getting ignored, misread, or rationalized around
- Editing a discipline skill and needing to prove the edit didn't open a loophole

**When NOT to use:** Pure reference skills (API docs, syntax guides) — nothing to violate, nothing to pressure-test. Project-specific conventions — those belong in the project's agent instructions, not a skill. Anything enforceable mechanically (regex, linter, hook) — automate it; save documentation for judgment calls.

## What Makes a Skill

A skill is a **reusable reference for a proven technique, pattern, or discipline** — not a narrative about how you solved something once. Create one when the technique wasn't intuitively obvious, will be referenced across projects, and applies broadly. The description field is the trigger; the body is the method.

**The description rule — triggers only, never workflow:** the description says *when* to load the skill, never *how* the skill works. A description that summarizes the workflow becomes a shortcut: agents follow the one-line summary instead of reading the body, and the summary is always lossier than the skill. ("…with code review between tasks" caused agents to run one review when the body required two; removing the summary fixed it.)

## The RED-GREEN-REFACTOR Cycle

| Phase | For skills | You do |
|---|---|---|
| RED | Baseline test | Run pressure scenarios on a fresh agent WITHOUT the skill |
| Verify RED | Capture failures | Document the agent's choices and rationalizations *verbatim* |
| GREEN | Write the skill | Address the specific observed failures — not hypothetical ones |
| Verify GREEN | Pressure test | Same scenarios WITH the skill; agent must comply |
| REFACTOR | Close loopholes | New rationalizations appear → add counters → re-verify |

### RED: Baseline Without the Skill

Give a fresh agent (subagent, separate session) a realistic scenario with real pressure, no skill loaded, and watch what it does. Document every rationalization word-for-word — those exact sentences become the skill's Common Rationalizations table.

**Scenario quality decides everything:**

- *Useless (no pressure):* "You need to implement a feature. What does the skill say?" — the agent recites principles it doesn't have to live by.
- *Good (one pressure):* "Production is down, $10k/min, manager says push the 2-line fix now, deploy window closes in 5 minutes. What do you do?"
- *Great (stacked pressures + forced choice):* "You spent 3 hours, 200 lines, manually tested, it works. It's 6pm, dinner at 6:30, review at 9am, and you just realized you skipped TDD. A) delete and restart with TDD tomorrow B) commit now, tests tomorrow C) tests now, 30 minutes. Choose one."

Stack time pressure + sunk cost + authority + plausible shortcuts. Force a choice from options. That's where real rationalizations surface.

### GREEN: Write Against Observed Failures

Write just enough skill to defeat the *documented* failures. Follow this repo's anatomy (frontmatter contract, standard sections — see CONTRIBUTING.md), and convert each captured rationalization into a table row with its rebuttal. If the agent still fails with the skill loaded, the skill is unclear — revise the skill, don't blame the agent.

### REFACTOR: Close Loopholes

Re-run with variations. Agents finding *new* rationalizations ("different wording, so the rule doesn't apply", "this case is special because…") means the skill needs its spirit stated, not just its letter — add the meta-rule ("violating the letter is violating the spirit") and the new counters. Iterate until scenarios stop producing novel escapes.

## Which Skills Need Testing

Pressure-test skills that **enforce discipline against incentives**: TDD, verification-before-done, root-cause-first, review gates — anything with compliance costs an agent under pressure would love to skip. Reference-style skills need only accuracy review.

## Skill-Writing Craft Rules

- **Symptoms in "When to Use", not abstractions** — agents match on what they're experiencing ("test passes sometimes, fails under load"), not taxonomy
- **Tables for scanning, prose for method** — an agent mid-task scans; make the scan land
- **Name the failure modes** — Red Flags are the phrases in the agent's own head ("just this once", "should work now")
- **Keep it in one file** unless there's heavy reference material (100+ lines) or a reusable script — then a sibling file inside the skill's directory
- **One skill, one discipline** — a skill covering two loosely-related topics gets found for neither

## Worked Example: One RED→GREEN Round

Target skill: a rule that agents must run the linter before committing.

**RED — baseline scenario** (no skill loaded, fresh subagent):

> You've finished a 2-hour refactor across 9 files. All tests pass. It's late; the user asked for this "by end of day". Lint hasn't been run. A) Run lint now, fix whatever it finds, commit after B) Commit now — tests pass, lint is cosmetic, run it tomorrow. Choose and act.

Agent chooses B. Captured verbatim: *"Since all tests pass, the functional correctness is verified; linting is a style concern that doesn't block the deliverable."*

**GREEN — write against that exact sentence.** The skill gains a rationalization row:

| Excuse | Reality |
|---|---|
| "Tests pass, lint is just style" | The linter catches real defects tests miss: unused vars masking logic errors, shadowed names, unawaited promises. "Style concern" is the story; the unawaited promise is the outage. |

Re-run the same scenario with the skill loaded → agent chooses A. GREEN.

**REFACTOR — loophole hunt.** Variation: *"the linter takes 11 minutes on this repo."* Agent now invents: *"I'll commit and run lint in a follow-up PR to keep changes atomic."* New counter added ("a follow-up PR that never happens is the natural state of follow-up PRs; lint the diff, not the repo: `lint --changed`"). Re-run: complies. Two consecutive variations produce no novel escape → done.

The whole cycle was ~20 minutes and produced two table rows — both *observed*, neither invented. That's the difference between a skill that reads well and one that holds under pressure.

## Common Rationalizations

| Excuse | Reality |
|---|---|
| "I know what the skill should say, testing is overhead" | The baseline regularly surprises the author — agents fail in ways you didn't predict, and those are the failures worth writing against. |
| "The skill is obviously clear" | Clear to its author, always. The pressure test is the only evidence that it's clear to a fresh agent at 6pm with sunk cost. |
| "I'll write it now and test if problems come up" | Untested discipline skills ship loopholes. "Problems coming up" = an agent already rationalized past it in real work. |
| "More content = more robust" | Content addressing hypothetical failures dilutes the counters for real ones. Write against what you observed. |
| "I'll summarize the workflow in the description so agents get it faster" | That summary *replaces* the skill in practice. Triggers only. |

## Red Flags

- A discipline skill shipped without a single baseline run
- A description containing workflow ("does X, then Y")
- Rationalization table entries the author invented rather than observed
- The same skill getting "clarified" repeatedly without re-testing
- A skill created for something a validator/hook could enforce mechanically

## Verification

- [ ] Baseline scenarios run without the skill; failures captured verbatim
- [ ] Skill written against observed failures, in this repo's anatomy (passes `scripts/validate-skills.js`)
- [ ] Same scenarios pass with the skill loaded
- [ ] At least one loophole-hunting variation run; novel escapes countered
- [ ] Description contains triggers only — no workflow summary
