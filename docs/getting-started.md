# Getting Started

## Install

**Skills CLI (any of 70+ agents):**
```bash
npx skills add <owner>/skill-forge
```

**Claude Code plugin:**
```
/plugin marketplace add <owner>/skill-forge
/plugin install skill-forge@skill-forge
```

**Manual (any agent):** copy `skills/` into your agent's skills directory (e.g. `~/.claude/skills/` or the project's `.claude/skills/`).

## First session

1. Ask your agent: *"which skill fits: <your task>?"* — it will load `orchestrator` and route you.
2. Or jump straight in:
   - New feature: `/spec` → `/plan` → `/build`
   - Bug: describe it — `debug` + `tdd` auto-trigger
   - Pre-merge: `/review` · Ship: `/ship`
3. For a full plan review battery: ask for `auto-review` on your plan.

## Recommended per-project setup

Add to the project's CLAUDE.md / AGENTS.md:

```markdown
## Skills
Skill Forge is installed. Route work via the orchestrator skill.
Non-negotiables: tdd for logic changes, code-review before merge,
release for shipping. See AGENTS.md in the skill-forge repo.
```
