---
name: mcp-development
description: Builds high-quality MCP (Model Context Protocol) servers — tool design, schemas, error messages, and agent-driven evaluations. Use when integrating an external API or service for agent use, when asked to "build an MCP server", "expose this API to the agent", or when an existing MCP server's tools frustrate the agents using them.
license: MIT
---

# MCP Development

## Overview

An MCP server's quality is measured by one thing: **how well it enables an agent to accomplish real tasks.** Not endpoint coverage for its own sake, not schema elegance — task completion by a model that has never seen your codebase. That inverts several normal API-design instincts: descriptions are prompts, error messages are steering, and the test suite is a set of questions an agent must answer using only your tools.

## When to Use

- Exposing an external API or internal service to agents via MCP
- An existing MCP server's tools confuse agents (wrong tool chosen, results too big, dead-end errors)
- Deciding what tool surface an agent integration should have

**When NOT to use:** Designing human-facing APIs (use `api-design` — though it feeds this); building a product feature *on* a model rather than exposing tools *to* one — that is `llm-features`; general library integration without an agent in the loop.

## Phase 1: Research & Plan

1. **Study the underlying API**: endpoints, auth, pagination, rate limits, data models. (For the protocol itself, the MCP spec at modelcontextprotocol.io is the source of truth — fetch the current spec rather than trusting memory; it moves.)
2. **Coverage vs workflow tools.** Two philosophies: comprehensive endpoint coverage (agents compose freely) vs curated workflow tools (one tool = one user-level task). Coverage gives flexibility; workflows reduce agent errors on common paths. When uncertain, **prioritize comprehensive coverage** and add workflow tools where evidence shows agents struggling to compose.
3. **Pick the stack**: TypeScript + official MCP SDK is the default (strong typing, best SDK maturity, agents generate it well); Python (FastMCP/official SDK) when the ecosystem demands. Transport: stdio for local servers; streamable HTTP (stateless) for remote — stateless scales and debugs simpler than session state.
4. **List the tools before writing any**: name, one-line purpose, inputs, output shape. This list is the review artifact.

## Phase 2: Implementation

**Shared infrastructure first**: API client with auth, uniform error handling, response formatting, pagination support — before any tool, so all tools behave identically.

**Per tool:**

- **Naming**: consistent service prefix + action verb — `github_create_issue`, `github_list_repos`. The name is the agent's first (sometimes only) routing signal.
- **Input schema**: typed and validated (Zod/Pydantic), constraints expressed in the schema, **examples inside field descriptions** — agents read schemas as documentation.
- **Output**: define `outputSchema` and return structured content where the SDK supports it; concise by default. **Context is a budget**: a tool that dumps 200 rows into the conversation makes every later step of the agent's task worse — filter, paginate, and summarize server-side, with parameters to go deeper.
- **Descriptions are prompts.** Concise summary of what it does, when to prefer it over sibling tools, and what it returns. A vague description guarantees wrong tool selection.
- **Error messages steer.** Every error tells the agent what went wrong AND what to do next: `"repo not found — call github_list_repos to see available repos"` beats `"404"`. A dead-end error ends the agent's task; an actionable one continues it.
- **Annotations**: set `readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint` honestly — clients use them for confirmation gates and safe parallelism.

## Phase 3: Review & Test

- Quality pass: DRY across tools, uniform error handling, full type coverage, every description checked against what the tool actually returns
- Build clean; run the server under **MCP Inspector** (`npx @modelcontextprotocol/inspector`) and exercise every tool: happy path, invalid input, empty results, pagination edges
- Read each tool's output *as an agent would*: is the shape parseable, is the size sane, does an error leave a next step?

## Phase 4: Agent Evaluations

The real test: can a model that's never seen your code answer realistic questions using only your tools?

1. **Inspect** your own tool list cold — is each tool's purpose inferable from name + description alone?
2. **Explore** the live data with read-only calls to find question material
3. **Write ~10 evaluation questions**, each: **independent** (no ordering), **read-only**, **complex** (multiple tool calls, real exploration), **realistic** (a task a human would actually ask), **verifiable** (one clear answer, string-comparable), **stable** (answer won't drift over time)
4. **Verify answers yourself** using the tools, then run an agent against them cold

Failures localize precisely: wrong tool chosen → naming/description problem · gave up mid-way → error messages or pagination · wrong answer from right tools → output shape or description-reality mismatch. Fix, re-run, iterate.

## Worked Example: One Tool, Done Properly

The difference between a tool an agent uses correctly and one it fumbles is almost entirely in the description, schema, and error text:

```typescript
server.registerTool(
  "github_list_issues",
  {
    // Description = prompt. Says what it does, when to prefer it, what it returns.
    description:
      "List issues in a GitHub repository, newest first. Use when the user asks " +
      "about open work, bugs, or issue counts. For the full body and comment " +
      "thread of one issue, use github_get_issue instead. Returns up to 25 " +
      "issues per page with title, state, labels, and number.",
    inputSchema: {
      owner: z.string().describe('Repository owner, e.g. "vercel"'),
      repo:  z.string().describe('Repository name, e.g. "next.js"'),
      state: z.enum(["open", "closed", "all"]).default("open")
              .describe("Filter by state. Defaults to open."),
      cursor: z.string().optional()
              .describe("Pagination cursor from a previous call's nextCursor."),
    },
    outputSchema: {
      issues: z.array(z.object({
        number: z.number(), title: z.string(),
        state: z.string(), labels: z.array(z.string()),
      })),
      nextCursor: z.string().optional(),
      totalCount: z.number(),
    },
    annotations: { readOnlyHint: true, destructiveHint: false,
                   idempotentHint: true, openWorldHint: true },
  },
  async ({ owner, repo, state, cursor }) => {
    try {
      const page = await gh.issues.list({ owner, repo, state, cursor, limit: 25 });
      return {
        // Concise: 4 fields per issue, not the full API payload.
        structuredContent: {
          issues: page.items.map(i => ({
            number: i.number, title: i.title,
            state: i.state, labels: i.labels.map(l => l.name),
          })),
          nextCursor: page.next,
          totalCount: page.total,
        },
      };
    } catch (err) {
      // Errors steer: what failed, why, and the next action.
      if (err.status === 404) {
        return { isError: true, content: [{ type: "text", text:
          `Repository ${owner}/${repo} not found or not accessible. ` +
          `Verify the owner and repo names, or call github_list_repos ` +
          `to see repositories this token can read.` }] };
      }
      if (err.status === 403 && err.isRateLimit) {
        return { isError: true, content: [{ type: "text", text:
          `GitHub rate limit exceeded. Resets at ${err.resetAt}. ` +
          `Retry after that time, or narrow the query.` }] };
      }
      throw err;   // unknown errors surface as real failures, not silent ones
    }
  }
);
```

**What each choice buys:** the description's "for the full body… use `github_get_issue`" prevents the classic wrong-tool selection between siblings. Schema `.describe()` strings are the only parameter docs the agent gets. Trimming to four fields keeps a 25-issue response affordable — the raw GitHub payload is ~40x larger and would crowd out the rest of the task. The 404 message names the recovery tool by name, so a failed call becomes a next step instead of a dead end.

**The same tool done badly**, for contrast:

```typescript
// ❌ Description states what, not when. No sibling disambiguation.
description: "Lists issues"
// ❌ Untyped, undocumented params — the agent guesses
inputSchema: { owner: z.string(), repo: z.string(), state: z.string() }
// ❌ Whole API payload, unpaginated: one call can consume the context budget
return { content: [{ type: "text", text: JSON.stringify(await gh.issues.list(...)) }] };
// ❌ Dead-end error: nothing to do next
catch { return { isError: true, content: [{ type: "text", text: "Request failed" }] }; }
```

## Worked Example: An Evaluation Question

Good evaluations force multi-step tool use and have one verifiable answer:

```xml
<evaluation>
  <qa_pair>
    <question>In the repository owned by "acme" named "billing-api", how many
    open issues carry the "regression" label, and what is the issue number of
    the oldest one?</question>
    <answer>4 / 812</answer>
  </qa_pair>
</evaluation>
```

This requires listing, filtering by label, paginating to the end, and sorting — it cannot be answered by one lucky call, and the answer is string-comparable. Contrast with a bad one: *"What issues exist?"* — unbounded, unverifiable, and answered by any single call.

## Common Rationalizations

| Excuse | Reality |
|---|---|
| "The API docs are the tool docs" | The agent never sees your API docs — only names, descriptions, and schemas. That surface IS the documentation. |
| "Return everything; the agent can filter" | The agent filters by paying context for every byte. Oversized results degrade the whole downstream task. |
| "Standard HTTP errors are fine" | An agent can't google a 422. Errors without next steps are task-enders. |
| "It works in Inspector, ship it" | Inspector proves the plumbing. Evaluations prove an agent can *use* it — the actual quality bar. |
| "More tools = more capable" | Twenty overlapping tools with vague descriptions select worse than eight sharp ones. Capability lives in selectability. |

## Red Flags

- Tool descriptions written before checking what the tool actually returns
- No pagination on anything list-shaped
- `destructiveHint` missing on something that deletes
- Zero evaluations, or evaluations that a single tool call answers
- Error paths that return raw upstream errors verbatim

## Verification

- [ ] Tool list reviewed against coverage-vs-workflow decision
- [ ] Every tool: prefixed name, typed schemas with examples, actionable errors, honest annotations
- [ ] Exercised end-to-end under MCP Inspector including failure paths
- [ ] ~10 evaluations written meeting all six requirements; answers self-verified
- [ ] An agent run against the evaluations; failures fixed and re-run
