# GitHub Copilot Setup

## Option 1: skills CLI (fastest)

```bash
npx skills add <owner>/skill-forge
```

Pick Copilot when the installer asks — it targets the Copilot CLI / coding-agent discovery paths.

## Option 2: Manual (VS Code Copilot + Copilot coding agent)

1. Copy `skills/` into your repo (e.g. `.github/skills/` or `./skills/`).
2. Create `.github/copilot-instructions.md` (Copilot Chat and the coding agent read it automatically):

```markdown
# Instructions

Skill Forge is installed at ./skills — 47 engineering skills.
Read ./skills/orchestrator/SKILL.md for the routing table and mandatory hops.
Non-negotiables: tdd (failing test before logic), debug (root cause before fixes),
verify (fresh evidence before claiming done), code-review before merge.
When a task matches a skill, read that SKILL.md in full and follow it.
```

3. Optionally add per-task prompt files under `.github/prompts/*.prompt.md` (VS Code) that load a specific skill, e.g. a `review.prompt.md` pointing at `skills/code-review/SKILL.md`.

## Notes

- The Copilot coding agent (assigned GitHub issues) also respects `AGENTS.md` — this repo ships one; keep the skills pointer in whichever file your fleet standardizes on.
- Skills are plain markdown with YAML frontmatter — no extensions required.
