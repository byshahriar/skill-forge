# skills.sh / skills CLI Support

Skill Forge is fully compatible with the open `skills` CLI and the skills.sh registry. This document is the publisher-side contract and checklist.

## What compatibility means

The CLI discovers skills by scanning a GitHub repo for `skills/<name>/SKILL.md`. Skill Forge guarantees:

- **Layout** — all 53 skills live at `skills/<name>/SKILL.md`, one directory per skill
- **Frontmatter** — every skill carries the registry-spec fields: `name` (kebab-case, ≤64 chars, matches the directory), `description` (trigger-focused "Use when…", ≤1024 chars), `license: MIT`
- **Self-containment** — a per-skill install (`--skill <name>`) copies only that skill's directory, so every skill vendors its own `references/`; nothing reaches outside its folder
- **No workflow in descriptions** — descriptions state *when* to load, never *how* the skill works (see `skills/skill-authoring/SKILL.md` for why)

CI enforces all of this: `scripts/validate-skills.js` checks the frontmatter contract and registry limits; `scripts/validate-docs.js` checks repo-level consistency.

## Installing (consumer side)

```bash
npx skills add byshahriar/skill-forge              # everything
npx skills add byshahriar/skill-forge --list       # browse first
npx skills add byshahriar/skill-forge --skill tdd  # one skill, self-contained
```

The CLI targets 70+ agents (Claude Code, Cursor, Codex, Copilot, Cline, …) and asks which to install into. Per-agent notes: [cursor-setup.md](cursor-setup.md) · [codex-setup.md](codex-setup.md) · [copilot-setup.md](copilot-setup.md).

## What the CLI does not install

The `skills` CLI implements the Agent Skills spec, which covers skills only. This repo's slash commands (`commands/*.md`), like any plugin-level artifact, install through the Claude Code plugin route instead - and are optional everywhere else, since every skill auto-triggers from its description.

## Publishing checklist

Before pushing a release:

1. `node scripts/validate-skills.js` — zero errors
2. `node scripts/validate-docs.js` — zero errors
3. Smoke-test discovery from the working tree: `npx skills add ./ --list` should list all 53 skills
4. After the repo is public: `npx skills add byshahriar/skill-forge --list` from a clean machine

Once the repo is public on GitHub, it is installable immediately — the registry needs no submission step; skills.sh indexes repos as people install from them.

## Adding a skill without breaking compatibility

- Directory name = frontmatter `name`, kebab-case, ≤64 chars
- `description` with "Use when…" triggers, ≤1024 chars, no workflow summary
- `license: MIT` in frontmatter
- Everything the skill needs inside its own directory
- Run both validators

All of this is also encoded in [CONTRIBUTING.md](../CONTRIBUTING.md) and enforced by CI.
