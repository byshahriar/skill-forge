---
name: incident-response
description: Runs a production incident from alert to postmortem — triage and severity, mitigate before diagnosing, stakeholder comms, and a blameless writeup. Use when production is down or degraded, when an alert fires and users are affected, when asked "are we having an outage", or when writing the postmortem after one.
license: MIT
---

# Incident Response

## Overview

An incident is not a debugging session with urgency attached — it is a different discipline with a different objective. Debugging optimizes for *understanding*; incident response optimizes for *stopping user pain*, and understanding comes after. The single most expensive mistake during an outage is investigating root cause while the bleeding continues.

**The iron law:**

```
MITIGATE FIRST. DIAGNOSE SECOND. FIX THIRD.
```

Rolling back an unclear deploy in 90 seconds beats understanding it in 40 minutes.

## When to Use

- Production is down, degraded, or throwing errors at real users
- An alert fired and someone needs to decide whether it's an incident
- Mid-incident: coordinating, communicating, or deciding whether to escalate
- After resolution: writing the postmortem

**When NOT to use:** A bug found in development or staging with no user impact — that's `debug`. Post-deploy monitoring of a healthy release — that's `canary-watch` (which escalates *into* this skill when it finds a real regression). Designing systems that fail gracefully — that's `resilience`.

## Phase 1: Triage (first 5 minutes)

Answer three questions, in this order, before touching anything:

1. **Is it real?** Reproduce the symptom independently of the alert — load the page, hit the endpoint, check a second signal. Alerts lie (a broken monitor is not an outage; a monitoring blind spot is).
2. **Who is affected, and how badly?** Which users, which flows, what fraction. "Checkout fails for all users" and "an admin report renders slowly" are different incidents.
3. **What changed?** Deploys, config flips, feature-flag changes, migrations, infra events, third-party status pages — in the last few hours. **Most incidents are caused by a change, and the change log is faster than the codebase.**

### Severity

Assign severity explicitly and say it out loud — it drives everything downstream:

| Sev | Meaning | Response |
|---|---|---|
| **SEV1** | Core flow broken for most users; data loss or corruption risk; security breach | All hands, immediate comms, mitigate now |
| **SEV2** | Significant degradation or a core flow broken for a subset; workaround exists | Owner + support engaged, comms to affected users |
| **SEV3** | Minor or cosmetic; single-tenant; no revenue/data impact | Normal working hours, tracked as a bug |

When torn between two levels, **take the higher one** — de-escalating later is cheap and reassuring; escalating late is neither. Data loss or a security dimension is always at least SEV2 regardless of user count.

## Phase 2: Mitigate

Restore service by the fastest safe route. Mitigation is not a fix — it is the return of service:

| Mitigation | When it applies | Typical time |
|---|---|---|
| **Roll back the deploy** | Symptom started near a release | Fastest, first choice |
| **Kill the feature flag** | Change is flag-guarded | Seconds |
| **Scale up / restart** | Resource exhaustion, leak, wedged process | Fast, may recur |
| **Fail over** | One region/replica/dependency unhealthy | Fast, needs a healthy target |
| **Disable the failing path** | One endpoint or job poisons the system | Contains the blast radius |
| **Roll forward** | Rollback impossible (irreversible migration, data written in new format) | Slowest, highest risk |

**Rollback discipline:** don't diagnose the deploy to decide whether to roll it back. If the timeline correlates and rollback is safe, roll back — you can study the diff at leisure once users are served. The exception that must be checked first: **has the change already written data in a new shape?** If yes, rolling back the code without a plan for that data creates a second, worse incident.

**One change at a time, announced.** Two people making simultaneous fixes turns a diagnosable incident into an undiagnosable one. State what you're about to do, do it, state the result.

**Preserve evidence before it evaporates:** capture logs, metrics screenshots, error samples, and a copy of the current config *before* restarting things. Restarts destroy the state that explains the failure.

## Phase 3: Communicate

Communication is a parallel workstream, not an afterthought — and for anyone outside the response, it *is* the incident.

**Cadence:** an initial notice within minutes of confirming a SEV1/SEV2, then updates on a **fixed interval** (every 30 minutes for SEV1) even when there is no news. "Still investigating, next update at 14:30" is a complete and useful update; silence is what makes people escalate around you.

**Update format:**

```
[SEV1 · INVESTIGATING] Checkout failures
Impact:  ~40% of checkout attempts failing since 13:05 UTC
Status:  Rolled back release 4.2.1; monitoring recovery
Next:    Update at 14:00 UTC or sooner if resolved
```

Rules: state **impact in user terms**, never internal jargon ("the queue consumer is wedged" means nothing to the person waiting). Never promise an ETA for a cause you haven't found; promise the *next update* instead. Say "we don't know yet" — it is more credible than a guess that ages badly, and admitting uncertainty preserves the trust you'll need at the postmortem.

**Roles**, once more than two people are involved: one **coordinator** (decides, communicates, does not debug), one or more **investigators** (debug, do not communicate outward), one **scribe** (timestamps everything). The coordinator's most important job is protecting investigators from status requests.

## Phase 4: Resolve and Verify

Service restored is not incident over. Confirm with evidence, not vibes:

- The original symptom, re-tested directly (`verify`'s completion gate applies here — a fresh check, output read)
- Error rates and latency back to baseline, **and holding** — watch through at least one full traffic cycle
- Backlogs drained: queues, retries, dead-letter, delayed jobs
- Collateral checked: data written during the incident (partial records, duplicate charges, missed notifications) — reconciled or explicitly listed as follow-up

Then close the loop: announce resolution with the same channel and format, schedule the postmortem, and file the follow-up work *before* everyone disperses.

## Phase 5: Blameless Postmortem

Within a few days, while memory is fresh. The document, not the meeting, is the artifact:

```markdown
# Postmortem — <short title>
**Date** · **Duration** (detection → mitigation → resolution) · **Severity** · **Author**

## Impact
Who was affected, how many, for how long, in user terms. Revenue/data if known.

## Timeline
UTC timestamps: first symptom · detection · escalation · each action taken and
its result · mitigation · resolution. Include what people believed at each step,
not just what turned out to be true.

## Root cause
The chain, not the last link: what condition allowed this, what triggered it,
and why the safeguards that existed did not stop it.

## What went well
Detection, tooling, decisions worth repeating. Name them — these are the
practices that survive the next reorg only if they are written down.

## What went wrong
Gaps in detection, response, tooling, or knowledge. Systems, not people.

## Where we got lucky
Near-misses. "The on-call happened to be awake." Luck is a finding.

## Action items
| Action | Type (prevent/detect/mitigate) | Owner | Due |
Each one concrete, owned, dated — and small enough to actually land.
```

**Blameless means systems-focused, not consequence-free.** "Alice deployed without testing" is blame *and* a bad diagnosis; "our pipeline allows deploys with failing tests, and the failure signal is a link nobody opens" is the same event described so it can be fixed. If a human error was possible, the system permitted it — that permission is the finding.

**Balance the action items across the three levers:** *prevent* it recurring, *detect* it faster next time, *mitigate* it faster next time. A postmortem whose actions are all prevention is a postmortem that will be repeated with a different cause — detection and mitigation improvements pay off across whole classes of incident.

Feed durable lessons to `knowledge-base`, alerting gaps to `observability`, and design weaknesses to `resilience`.

## Common Rationalizations

| Excuse | Reality |
|---|---|
| "Let me just find the root cause first, then I'll know what to fix" | Every minute of diagnosis is a minute of user pain you chose. Mitigate, then diagnose with the pressure off. |
| "Rolling back feels like giving up" | Rollback is the professional move. The deploy will still be there, diffable, after users are served. |
| "It's probably fine now, the errors stopped" | Errors stop for many reasons, including load shedding and dead traffic. Confirm recovery with the original symptom and a held baseline. |
| "I'll send an update when I have real news" | Silence reads as absence. A no-news update on the promised interval is what keeps people from escalating around you. |
| "We know what happened, we don't need a postmortem" | The postmortem isn't for knowing; it's for changing the system and for the next person, who wasn't there. |
| "The postmortem will make someone look bad" | Then it's written wrong. Describe the system that permitted the action, not the person who took it. |
| "Small incident, skip the writeup" | Small incidents are the cheapest possible teachers. The pattern that caused this one is rehearsing for a bigger one. |

## Red Flags

- Reading code before mitigating a SEV1
- Two people changing production simultaneously
- No severity ever assigned, so nobody knows what response this deserves
- A restart performed before any evidence was captured
- Thirty minutes of silence during a SEV1
- The postmortem names a person in its root cause
- Action items with no owner or no date — those are wishes
- "Resolved" declared from a dashboard without re-testing the original symptom

## Verification

- [ ] Symptom independently reproduced; impact and severity stated explicitly
- [ ] Recent changes checked before code was read
- [ ] Mitigation applied by the fastest safe route; one change at a time, announced
- [ ] Evidence captured before restarts destroyed it
- [ ] Comms sent on a fixed interval, in user terms, through resolution
- [ ] Recovery verified against the original symptom, held through a traffic cycle
- [ ] Collateral data checked and reconciled or filed
- [ ] Blameless postmortem written with owned, dated actions across prevent/detect/mitigate
