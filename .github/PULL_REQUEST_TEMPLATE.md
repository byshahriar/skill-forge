## What

<!-- One or two sentences: what does this PR change and why? -->

## Type of change

- [ ] New skill
- [ ] Improvement to an existing skill
- [ ] Bug fix (validator, CI, docs)
- [ ] Documentation

## Skill checklist (delete if not a skill change)

- [ ] Frontmatter: `name` matches the directory, `description` states **triggers only** ("Use when …", no workflow summary), `license: MIT`
- [ ] Standard sections present: Overview · When to Use · Common Rationalizations · Red Flags · Verification
- [ ] Skill is **self-contained** — everything it needs lives inside its own directory
- [ ] Cross-references point to existing skills
- [ ] For discipline skills: pressure-tested per `skills/skill-authoring` (baseline → write → loophole hunt)
- [ ] README table and `skills/orchestrator` routing updated if a skill was added/renamed

## Validation

- [ ] `node scripts/validate-skills.js` — 0 errors
- [ ] `node scripts/validate-docs.js` — 0 errors

## Sources

<!-- If this skill adapts prior art, name it here (see README → References). -->
