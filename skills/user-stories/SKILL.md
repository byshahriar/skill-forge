---
name: user-stories
description: Writes and refines user stories with acceptance criteria — INVEST-checked, sliced vertically, sized for a sprint. Use when turning requirements or specs into backlog items, when asked to "write stories", "break this epic down", or when acceptance criteria are missing or vague.
license: MIT
---

# User Stories

## Overview

Turns intent into sprint-ready stories: each one a vertical slice of user-visible value, INVEST-checked, with acceptance criteria concrete enough to test against. The story is a placeholder for a conversation, not a contract — but the acceptance criteria are the contract, and they're where most stories fail.

## When to Use

- Converting a spec, PRD, or design doc into backlog items
- Breaking an epic into stories
- A story keeps bouncing back in review because "done" was never defined
- Before `estimation` and `sprint-planning`

**When NOT to use:** Pure technical tasks with no user-visible outcome — write them as plain tasks with a definition of done, and don't force "As a developer, I want a refactor" theater.

## Story Format

```
Title: <verb phrase — what the user can do after this ships>

As a <specific persona — not "user">,
I want <capability>,
so that <outcome they actually care about>.

Acceptance Criteria (Given/When/Then):
1. Given <context>, when <action>, then <observable result>
2. Given <edge case>, when <action>, then <defined behavior>
3. Given <failure>, when <action>, then <what the user sees>

Notes: constraints, out-of-scope, open questions
```

Rules:
- **The persona is specific.** "As a user" means you don't know who this is for. Name the role from your real personas.
- **The "so that" is an outcome, not a restatement.** "So that I can log in" explains nothing; "so that I don't lose my cart when I switch devices" does.
- **Acceptance criteria are observable.** Each one testable by someone who didn't write the code. "Works correctly" is not a criterion.
- **Every story has at least one non-happy-path criterion.** Empty state, invalid input, or failure behavior — pick what applies. Stories with only happy-path criteria ship half-features.

## INVEST Check

Run every story through:

| Letter | Test | Common failure |
|---|---|---|
| **I**ndependent | Schedulable in any order? | Hidden dependency on another story's schema |
| **N**egotiable | Room for implementation conversation? | Story prescribes the solution ("add a Redis cache") |
| **V**aluable | User-visible value on its own? | Horizontal slice ("build the API layer") |
| **E**stimable | Team can size it? | Unknown tech or unbounded scope |
| **S**mall | Fits comfortably in a sprint? | Epic wearing a story costume |
| **T**estable | Criteria checkable? | Vague criteria ("fast", "intuitive") |

A story failing I or V usually needs re-slicing; failing E needs a spike first; failing S needs splitting.

## Splitting Patterns

Split **vertically** (each slice crosses the whole stack and delivers value) — never into "frontend story + backend story":

- **By workflow step** — checkout: address → payment → confirmation, each shippable
- **By business rule** — flat shipping first; rule matrix later
- **By data variation** — one file type first, then the rest
- **By operations** — CRUD: Create/Read first, Update/Delete later
- **Happy path first, edge cases as follow-up stories** — *only* if the happy-path story still defines its failure behavior (even if it's "show a generic error, log it")
- **Spike then story** — unknown tech gets a time-boxed spike whose output is knowledge, then the real story

## Epic Breakdown Workflow

1. State the epic's outcome in one sentence — who can do what, when it's done
2. Map the user journey through the epic; each journey step is a candidate story seam
3. Slice into stories using the patterns above; INVEST-check each
4. Order by value and dependency — the first story alone should prove the epic's direction
5. Mark what the epic is explicitly **not** doing (feeds the Not Doing list)
6. Hand to `estimation`

## Worked Example: Fixing a Broken Story

**Before** (fails I, V, and T):

> As a user, I want the backend API for notifications, so that notifications work.

Persona is nobody, the slice is horizontal (API with no user-visible value), and "notifications work" is untestable.

**After** — resliced vertically and grounded:

```
Title: Get an email when a teammate comments on my document

As a document owner collaborating with reviewers,
I want an email when someone comments on a document I own,
so that I don't discover feedback three days late.

Acceptance Criteria:
1. Given I own a doc, when a teammate comments, then I receive an email
   within 5 minutes containing the comment text and a deep link.
2. Given I commented on my own doc, when the comment posts, then no email
   is sent to me.
3. Given my notification setting is "off", when anyone comments, then no
   email is sent — and the setting page shows this state.
4. Given the email provider is down, when a comment posts, then the comment
   still saves, and the notification is retried (comment success never
   depends on email success).

Notes: in-app notifications are a separate story; digest batching is Not Doing (v1).
```

Criterion 4 is the one teams skip — the failure-path criterion that decides an architectural fact (comment write must not couple to email delivery). One line in the story just prevented a production incident.

**Epic split** for "Notifications v1", by workflow step and data variation — each slice shippable alone: ① email on comment (above) → ② email on mention → ③ in-app notification center, read/unread → ④ per-event-type settings page → ⑤ daily digest option. Story ① alone proves the pipeline end to end.

## Common Rationalizations

| Excuse | Reality |
|---|---|
| "We all know what this story means" | Then acceptance criteria take two minutes to write. If they take longer, you didn't all know. |
| "Backend and frontend stories let teams parallelize" | Two horizontal slices, neither shippable, integration risk saved for the end. Vertical slices parallelize by *feature* instead. |
| "The edge cases are a later story" | Fine — but the happy-path story still defines what a failure *looks like* today, or the demo crashes in front of the customer. |
| "As-a-user is fine, everyone's a user" | Personas change decisions: an admin's bulk-delete and a viewer's bulk-delete are different features. |
| "This story is too big but splitting is overhead" | An unsplittable story is unfinishable in a sprint; you'll split it anyway on day 8, badly. |

## Red Flags

- A story whose title is a component name, not a capability
- Acceptance criteria that restate the story title
- No non-happy-path criterion anywhere in the sprint
- "Technical stories" outnumbering user stories consistently
- Stories written for a persona that doesn't exist in the product's actual user base

## Verification

- [ ] Every story: specific persona, real outcome, Given/When/Then criteria
- [ ] Every story passes INVEST or carries a note on why it's exempt
- [ ] At least one edge/failure criterion per story
- [ ] Slices are vertical — each independently demonstrates value
- [ ] Epic's Not Doing list captured
