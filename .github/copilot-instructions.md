# Copilot Instructions — Skill Forge

This repository is a suite of 47 agent skills (one directory per skill under `skills/`, each with a `SKILL.md`).

When working in this repo:

- Read `AGENTS.md` first — it carries the routing guide, suite-wide rules, mandatory hops, and the completion status protocol.
- When editing or adding a skill, follow `docs/skill-anatomy.md` and `CONTRIBUTING.md`: frontmatter `name` must equal the directory name; `description` states triggers ("Use when …"), never workflow; required sections are Overview, When to Use, Common Rationalizations, Red Flags, Verification.
- Validate before committing: `node scripts/validate-skills.js` (zero errors required) and `node scripts/validate-docs.js`.
- Skills must stay self-contained: anything a skill needs lives inside its own directory.
