'use strict';

/**
 * @file Skill validation rules, packaged as a shared library.
 * @module lib/skill-lint
 *
 * @description
 * Single source of truth for what makes a SKILL.md valid (see
 * docs/skill-anatomy.md). The CLI in scripts/validate-skills.js is a thin
 * wrapper over this module. Keeping the rules out of the CLI makes them
 * importable and unit-testable without spawning a process or touching the
 * filesystem.
 *
 * Error-level checks (block CI):
 * - SKILL.md exists in every skill directory
 * - YAML frontmatter is present with `name` and `description` fields
 * - frontmatter `name` matches the directory name
 * - directory name is lowercase-hyphen-separated and within the 64-char registry limit
 * - description does not exceed 1024 characters
 * - description includes a "when to use" trigger
 * - required sections are present
 *
 * Warning-level checks (reported, do not block CI):
 * - frontmatter carries a `license` field (registry metadata)
 * - cross-skill references point to known skills
 */

const fs   = require('fs');
const path = require('path');

// ─── Configuration ───────────────────────────────────────────────────────────

/**
 * Maximum allowed length of the frontmatter `description`, in characters.
 * Agents inject the description into their system prompt, so it must stay small.
 * @constant {number}
 */
const MAX_DESCRIPTION_LENGTH = 1024;

/**
 * Maximum allowed length of a skill name, in characters (registry limit).
 * @constant {number}
 */
const MAX_NAME_LENGTH = 64;

/**
 * A skill directory name must be lowercase-hyphen-separated
 * (docs/skill-anatomy.md → Naming Conventions).
 * @constant {RegExp}
 */
const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * A description must state WHEN to use the skill, not just what it does
 * (docs/skill-anatomy.md → Required). Accepts the canonical "Use when …"
 * plus the equivalent "Use before/after/during …" phrasings in use today.
 * @constant {RegExp}
 */
const DESCRIPTION_TRIGGER = /\buse (this )?when\b|\buse (before|after|during)\b/i;

/**
 * Negated trigger phrasings ("Do not use when …", "Don't use when …").
 * These describe exclusions, not trigger conditions, so a description whose
 * only trigger match is negated still fails the trigger check.
 * @constant {RegExp}
 */
const DESCRIPTION_TRIGGER_NEGATE = /\b(do not|don't|never) use (this )?(when|before|after|during)\b/i;

/**
 * Sections every standard SKILL.md must contain.
 * Each entry is an array of acceptable heading strings — the first match
 * wins, so a rule can list its canonical heading plus legacy aliases.
 * @constant {string[][]}
 */
const REQUIRED_SECTIONS = [
  ['## Overview'],
  ['## When to Use'],
  ['## Common Rationalizations'],
  ['## Red Flags'],
  ['## Verification'],
];

/**
 * Skills intentionally exempt from the required-section checks, keyed by
 * directory name, with a documented reason as the value.
 *
 * Exemptions live HERE, not in skill frontmatter, so contributors cannot
 * bypass the validator by editing their own skill file.
 * @constant {Object<string, string>}
 */
const SECTION_EXEMPT_SKILLS = {
  'orchestrator': 'Meta-skill — routes to other skills; the routing table replaces When-to-Use, and Red Flags are not applicable to a routing document.',
};

/**
 * Regex patterns that indicate an explicit cross-skill reference.
 * Only these patterns trigger the dead-reference warning — generic
 * backtick strings in code blocks are intentionally excluded.
 * @constant {RegExp[]}
 */
const SKILL_REF_PATTERNS = [
  /\buse the `([a-z][a-z0-9-]+[a-z0-9])` skill/g,
  /\bfollow the `([a-z][a-z0-9-]+[a-z0-9])` skill/g,
  /\binvoke the `([a-z][a-z0-9-]+[a-z0-9])` skill/g,
  /\bcontinue with `([a-z][a-z0-9-]+[a-z0-9])`/g,
  /\buse `([a-z][a-z0-9-]+[a-z0-9])` skill/g,
  /`([a-z][a-z0-9-]+[a-z0-9])` skill\b/g,
  /`([a-z][a-z0-9-]+[a-z0-9])` persona\b/g,
  /\bsee `([a-z][a-z0-9-]+[a-z0-9])`/g,
  /──→ ([a-z][a-z0-9-]+[a-z0-9])\b/g, // ASCII diagram arrows
  /→ `([a-z][a-z0-9-]+[a-z0-9])`/g,
];

// ─── Types ───────────────────────────────────────────────────────────────────

/**
 * Result of linting one skill.
 * @typedef {Object} LintResult
 * @property {string[]} errors   Error messages; any entry fails CI.
 * @property {string[]} warnings Warning messages; reported but non-blocking.
 * @property {boolean}  exempt   Whether the skill is exempt from section checks.
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Strips fenced code blocks from markdown content so that headings,
 * references, and trigger phrases inside examples or templates are not
 * matched by lint rules.
 *
 * @param {string} content Raw markdown content.
 * @returns {string} The content with all fenced code blocks removed.
 */
function stripFencedCodeBlocks(content) {
  return content.replace(/^(`{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm, '');
}

/**
 * Parses YAML-style frontmatter from the top of a markdown file.
 * Only flat `key: value` pairs are supported; values are stripped of
 * surrounding quotes.
 *
 * @param {string} content Raw markdown content.
 * @returns {?Object<string, string>} A key→value map, or `null` when no
 *   frontmatter block is found.
 */
function parseFrontmatter(content) {
  const match = content.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*\r?\n/);
  if (!match) return null;

  const result = {};
  for (const line of match[1].split(/\r?\n/)) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key   = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key) result[key] = value;
  }
  return result;
}

/**
 * Collects all explicit skill cross-references from content.
 * Matches only against {@link SKILL_REF_PATTERNS} to avoid false positives
 * from ordinary inline code snippets.
 *
 * @param {string} content Raw markdown content.
 * @returns {Set<string>} The set of referenced skill names.
 */
function extractSkillReferences(content) {
  const refs = new Set();
  for (const pattern of SKILL_REF_PATTERNS) {
    // Global regexes are stateful; reset before each scan.
    pattern.lastIndex = 0;
    let m;
    while ((m = pattern.exec(content)) !== null) {
      refs.add(m[1]);
    }
  }
  return refs;
}

// ─── Linter ──────────────────────────────────────────────────────────────────

/**
 * Lints already-read SKILL.md content.
 *
 * Pure function — no filesystem access — so the rules can be exercised
 * against crafted fixtures in a unit test.
 *
 * @param {string}      dirName     The skill's directory name (expected to equal frontmatter `name`).
 * @param {string}      content     The raw SKILL.md content.
 * @param {Set<string>} knownSkills All valid skill names, for cross-reference checking.
 * @returns {LintResult} The lint outcome for this skill.
 */
function lintSkillContent(dirName, content, knownSkills) {
  const errors   = [];
  const warnings = [];
  let   exempt   = false;

  // ── Frontmatter ──────────────────────────────────────────────────────────
  const fm = parseFrontmatter(content);
  if (!fm) {
    errors.push('Missing or malformed YAML frontmatter (expected --- block at top of file)');
    return { errors, warnings, exempt };
  }

  if (!fm.name) {
    errors.push("Frontmatter missing required field: 'name'");
  } else if (fm.name !== dirName) {
    errors.push(`Frontmatter name '${fm.name}' does not match directory name '${dirName}'`);
  }

  if (!KEBAB_CASE.test(dirName)) {
    errors.push(`Directory name '${dirName}' is not lowercase-hyphen-separated (skill-anatomy.md: Naming Conventions)`);
  }

  // Registry compatibility: names are capped at 64 characters; the charset
  // restriction (letters/numbers/hyphens) is already covered by KEBAB_CASE.
  if (dirName.length > MAX_NAME_LENGTH) {
    errors.push(`Directory name '${dirName}' is ${dirName.length} chars — exceeds the ${MAX_NAME_LENGTH}-char registry limit`);
  }

  // Registry metadata: every published skill carries an explicit license.
  if (!fm.license) {
    warnings.push("Frontmatter missing 'license' field — add 'license: MIT' for registry display");
  }

  if (!fm.description) {
    errors.push("Frontmatter missing required field: 'description'");
  } else {
    if (fm.description.length > MAX_DESCRIPTION_LENGTH) {
      errors.push(
        `Description is ${fm.description.length} chars — exceeds the ${MAX_DESCRIPTION_LENGTH}-char limit` +
        ` (agents inject this into the system prompt)`
      );
    }
    const hasTrigger  = DESCRIPTION_TRIGGER.test(fm.description);
    const onlyNegated = hasTrigger && DESCRIPTION_TRIGGER_NEGATE.test(fm.description)
      && !fm.description.replace(DESCRIPTION_TRIGGER_NEGATE, '').match(DESCRIPTION_TRIGGER);
    if (!hasTrigger || onlyNegated) {
      errors.push(
        `Description has no 'when to use' trigger — add a "Use when …" clause ` +
        `(skill-anatomy.md: Required — the description must say both what the skill does and when to use it)`
      );
    }
  }

  // ── Exemption guard ──────────────────────────────────────────────────────
  // Exemptions are validator-owned (SECTION_EXEMPT_SKILLS above). If a
  // skill's frontmatter tries to declare its own exemption, fail loud —
  // that's a sign someone is trying to bypass the validator.
  if (fm.type === 'meta' || fm.exempt === 'sections') {
    if (!Object.hasOwn(SECTION_EXEMPT_SKILLS, dirName)) {
      errors.push(
        `Frontmatter declares 'type: meta' or 'exempt: sections' but '${dirName}' is not in ` +
        `the validator's SECTION_EXEMPT_SKILLS allowlist. ` +
        `Add an entry to scripts/lib/skill-lint.js with a documented reason.`
      );
    }
  }

  // ── Required sections ────────────────────────────────────────────────────
  // `Object.hasOwn`, not `in`: `in` walks the prototype chain, so a skill
  // directory named `constructor` — which passes the kebab-case check — would
  // otherwise resolve to Object.prototype.constructor and be silently exempt
  // from every required-section check.
  exempt = Object.hasOwn(SECTION_EXEMPT_SKILLS, dirName);

  if (!exempt) {
    // Strip fenced code blocks so headings inside examples/templates don't
    // satisfy the check, and match headings at the start of a line so
    // `### Verification` inside a block doesn't satisfy `## Verification`.
    const proseContent = stripFencedCodeBlocks(content);
    for (const aliases of REQUIRED_SECTIONS) {
      const found = aliases.some(heading => {
        const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`^${escaped}\\s*$`, 'm').test(proseContent);
      });
      if (!found) {
        errors.push(`Missing required section: ${aliases[0]}`);
      }
    }
  }

  // ── Workflow completeness ────────────────────────────────────────────────
  // A named workflow that advertises numbered steps must document each step
  // before the next level-two section. Otherwise the summary promises a
  // process stage that the skill never teaches agents how to perform.
  const workflowSections = content.matchAll(
    /^## The [^\n]+ Workflow\s*\r?\n([\s\S]*?)(?=^## |(?![\s\S]))/gm
  );
  for (const match of workflowSections) {
    const section  = match[1];
    const declared = [...section.matchAll(/^\s*(\d+)\.\s+[A-Z][A-Z -]*\s+→/gm)];
    if (declared.length < 2) continue;

    const documented = new Set(
      [...section.matchAll(/^### Step\s+(\d+):/gm)].map(step => step[1])
    );
    for (const step of declared) {
      if (!documented.has(step[1])) {
        errors.push(`Workflow declares Step ${step[1]} but has no matching process section`);
      }
    }
  }

  // ── Cross-skill references ───────────────────────────────────────────────
  const refs = extractSkillReferences(content);
  for (const ref of refs) {
    if (!knownSkills.has(ref)) {
      warnings.push(`Dead cross-reference: \`${ref}\` is not a known skill`);
    }
  }

  return { errors, warnings, exempt };
}

/**
 * Lints a skill by directory name: reads its SKILL.md from disk, then
 * delegates to {@link lintSkillContent}. This is the thin filesystem wrapper
 * the CLI uses.
 *
 * @param {string}      dirName     The skill's directory name.
 * @param {string}      skillsDir   Absolute path to the skills/ directory.
 * @param {Set<string>} knownSkills All valid skill names, for cross-reference checking.
 * @returns {LintResult} The lint outcome for this skill.
 */
function lintSkill(dirName, skillsDir, knownSkills) {
  const skillPath = path.join(skillsDir, dirName, 'SKILL.md');

  if (!fs.existsSync(skillPath)) {
    return { errors: ['Missing SKILL.md'], warnings: [], exempt: false };
  }

  let content;
  try {
    content = fs.readFileSync(skillPath, 'utf8');
  } catch (err) {
    return { errors: [`Unreadable SKILL.md: ${err.message}`], warnings: [], exempt: false };
  }

  return lintSkillContent(dirName, content, knownSkills);
}

// Export only the linting functions. The policy collections
// (REQUIRED_SECTIONS, SECTION_EXEMPT_SKILLS, SKILL_REF_PATTERNS, and the
// regexes) stay private so a test or future consumer cannot mutate shared
// state and change lint results for the rest of the process. Exercise the
// rules through these functions.
module.exports = {
  parseFrontmatter,
  extractSkillReferences,
  lintSkillContent,
  lintSkill,
};
