# Codex CLI Setup

## Option 1: skills CLI (fastest)

```bash
npx skills add <owner>/skill-forge
```

Pick Codex when the installer asks — it places skills where the Codex CLI discovers them.

## Option 2: Manual

1. Copy `skills/` into a stable location (project-local `./skills/`, or a shared `~/.agents/skills/` if your Codex build reads the cross-runtime path).
2. Codex reads `AGENTS.md` natively. Add to your project's `AGENTS.md`:

```markdown
## Skills
Skill Forge lives at <path>/skills. Read <path>/skills/orchestrator/SKILL.md first —
it maps requests to skills and defines the mandatory hops (tdd before logic,
debug before fixes, verify before "done", code-review before merge).
Load the matching SKILL.md before starting the corresponding kind of work.
```

3. For quick invocation, add prompt shims in `~/.codex/prompts/` (e.g. `review.md` containing "Load and follow skills/code-review/SKILL.md against the current diff").

## Notes

- Global vs project: put the pointer in `~/.codex/AGENTS.md` to apply everywhere, or per-project `AGENTS.md` for repo-scoped use.
- Skills are self-contained markdown — no runtime dependencies.
