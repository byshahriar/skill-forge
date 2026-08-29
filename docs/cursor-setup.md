# Cursor Setup

## Option 1: skills CLI (fastest)

```bash
npx skills add byshahriar/skill-forge
```

Pick Cursor when the installer asks which agents to target — it writes the skills where Cursor discovers them. Re-run with `--list` to browse or `--skill <name>` for a single skill.

## Option 2: Manual

1. Clone or copy this repo's `skills/` directory into your project (e.g. `.agent/skills/` or any stable path).
2. Cursor reads `AGENTS.md` at the project root. Add:

```markdown
## Skills
Skill Forge is installed at <path>/skills — 47 engineering skills, one directory each.
Before starting work, read <path>/skills/orchestrator/SKILL.md for the routing table
and mandatory hops. Non-negotiables: tdd for logic changes, debug's root-cause rule
for bugs, verify's completion gate before claiming done, code-review before merge.
```

3. Optionally add a rule file at `.cursor/rules/skill-forge.mdc` with the same pointer so the routing applies in every chat, with `alwaysApply: true` in its frontmatter.

## Notes

- Skills are plain markdown — Cursor applies them as instructions when referenced or attached.
- The slash commands in `commands/` are Claude Code-format; in Cursor, invoke skills by name in chat ("use the code-review skill on this diff") or wire favorites as Cursor Custom Commands.
