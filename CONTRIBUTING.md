# Contributing to Skill Forge

## Adding or changing a skill

1. One directory per skill: `skills/<kebab-name>/SKILL.md`. The frontmatter `name` must equal the directory name.
2. Frontmatter contract:
   - `name`: lowercase-kebab, matches the directory
   - `description`: third-person what-it-does, then explicit "Use when …" trigger conditions. Max 1024 chars. The description is what agents match against — write the triggers the way users actually phrase requests.
   - `license: MIT` — required for registry display (skills.sh)
3. Standard sections (validator-enforced): `## Overview`, `## When to Use`, `## Common Rationalizations`, `## Red Flags`, `## Verification`. The workflow sections between them are yours to shape.
4. **Self-contained skills only.** Anything a skill needs lives inside its directory (`references/`, `scripts/`, `templates/`) so a single-skill install (`npx skills add … --skill <name>`) never breaks. Shared checklists in the repo-level `references/` are vendored into each consuming skill.
5. Names: short, industry-standard vocabulary (`tdd`, `code-review`, `sprint-planning`).
6. Run `node scripts/validate-skills.js` — zero errors required; treat warnings seriously.

## Style

- Write for an agent executing under pressure: imperative, concrete, no filler.
- Tables for checklists and rationalizations; short paragraphs for method.
- Every rule earns its place with a reason — "do X because Y", never bare commandments.
- Common Rationalizations = the excuses an agent (or human) will actually make, answered.
- Verification = a checklist the agent can self-audit before reporting done.

## Provenance

New skills note any sources or prior art in the PR description (the PR template has a Sources field); substantial external references belong in the README's References & Acknowledgments section.
