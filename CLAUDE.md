# Skill Forge — Claude Code Notes

See AGENTS.md for the skill routing guide and cross-cutting rules — everything there applies here.

Claude Code specifics:

- Skills load via the Skill tool or auto-trigger from their `description` frontmatter. The slash commands in `commands/` map the common lifecycle entry points (`/spec`, `/plan`, `/build`, `/test`, `/review`, `/ship`, `/qa`, `/refactor`, `/security`, `/design`, `/standup`, `/retro`).
- `orchestrator` is a routing document, not an agent hop — load it when unsure which skill fits.
- For `multi-agent` work, prefer the built-in Explore subagent for research isolation, and keep orchestration depth at 1 (see the skill's anti-patterns).
- Before committing changes to any skill: `node scripts/validate-skills.js`.
