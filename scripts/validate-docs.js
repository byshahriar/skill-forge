#!/usr/bin/env node
'use strict';

/**
 * @file Repo-consistency checks that go beyond per-skill lint.
 *
 * @description
 * Where validate-skills.js checks each SKILL.md in isolation, this script
 * checks the relationships between the skills and the rest of the repo.
 *
 * Error-level checks (block CI):
 * - every skill directory appears in README.md's skill tables
 * - every skill (except orchestrator itself) is routed in skills/orchestrator/SKILL.md
 * - skill-count claims in README/AGENTS.md/plugin manifests match the real count
 * - every commands/*.md references only existing skills
 * - no cross-skill reference names a skill that doesn't exist
 *
 * Usage:
 *   node scripts/validate-docs.js
 *
 * Exit codes:
 *   0 — all checks pass
 *   1 — one or more errors
 */

const fs   = require('fs');
const path = require('path');

/**
 * Absolute path to the repository root.
 * @constant {string}
 */
const ROOT = path.join(__dirname, '..');

/**
 * Absolute path to the skills/ directory.
 * @constant {string}
 */
const SKILLS_DIR = path.join(ROOT, 'skills');

/**
 * Reads a file as UTF-8 text.
 *
 * @param {string} p Absolute path to the file.
 * @returns {string} The file's contents.
 */
const read = (p) => fs.readFileSync(p, 'utf8');

/** @type {string[]} Accumulated error messages across all checks. */
const errors = [];

/** @type {string[]} Every skill directory that contains a SKILL.md. */
const skills = fs.readdirSync(SKILLS_DIR).filter((d) =>
  fs.existsSync(path.join(SKILLS_DIR, d, 'SKILL.md'))
);

/** @type {number} The authoritative skill count, derived from the filesystem. */
const count = skills.length;

// ─── Check 1: README covers every skill ──────────────────────────────────────

const readme = read(path.join(ROOT, 'README.md'));
for (const s of skills) {
  if (!readme.includes(`skills/${s}/SKILL.md`)) {
    errors.push(`README.md: skill "${s}" missing from the skill tables`);
  }
}

// ─── Check 2: orchestrator routes every skill ────────────────────────────────

const orch = read(path.join(SKILLS_DIR, 'orchestrator', 'SKILL.md'));
for (const s of skills) {
  if (s === 'orchestrator') continue;
  if (!orch.includes(`\`${s}\``)) {
    errors.push(`orchestrator: skill "${s}" not present in routing table or sequences`);
  }
}

// ─── Check 3: skill-count claims match reality ───────────────────────────────

/**
 * Files whose prose or metadata may claim a skill count.
 * Paths are relative to the repository root; missing files are skipped.
 * @constant {string[]}
 */
const COUNT_FILES = [
  'README.md',
  'AGENTS.md',
  'plugin.json',
  path.join('.claude-plugin', 'plugin.json'),
  path.join('.claude-plugin', 'marketplace.json'),
];

for (const f of COUNT_FILES) {
  const full = path.join(ROOT, f);
  if (!fs.existsSync(full)) continue;
  const text   = read(full);
  const claims = [...text.matchAll(/(\d+)\s+(?:curated\s+)?(?:engineering\s+|agent\s+)?skills/gi)]
    .map((m) => parseInt(m[1], 10));
  for (const c of claims) {
    if (c !== count) errors.push(`${f}: claims ${c} skills, repo has ${count}`);
  }
}

// ─── Check 4: commands reference existing skills ─────────────────────────────

const cmdDir = path.join(ROOT, 'commands');
if (fs.existsSync(cmdDir)) {
  for (const f of fs.readdirSync(cmdDir).filter((x) => x.endsWith('.md'))) {
    const text = read(path.join(cmdDir, f));
    for (const m of text.matchAll(/\bthe ([a-z][a-z0-9-]+) skill\b/g)) {
      if (!skills.includes(m[1])) {
        errors.push(`commands/${f}: references unknown skill "${m[1]}"`);
      }
    }
  }
}

// ─── Check 5: cross-skill references resolve ─────────────────────────────────

/**
 * Backticked-name patterns that read as cross-skill references.
 * Kept narrow on purpose: ordinary inline code should not match.
 * @constant {RegExp[]}
 */
const REF_PATTERNS = [
  /\bthe `([a-z][a-z0-9-]+)` skill\b/g,
  /\buse `([a-z][a-z0-9-]+)`(?: skill)?\b/g,
  /→ `([a-z][a-z0-9-]+)`/g,
  /\bsee `([a-z][a-z0-9-]+)`(?:'s)?\s/g,
];

for (const s of skills) {
  const text = read(path.join(SKILLS_DIR, s, 'SKILL.md'));
  for (const re of REF_PATTERNS) {
    for (const m of text.matchAll(re)) {
      const ref = m[1];
      if (!skills.includes(ref)) {
        errors.push(`skills/${s}: cross-reference to unknown skill "${ref}"`);
      }
    }
  }
}

// ─── Report ──────────────────────────────────────────────────────────────────

if (errors.length) {
  for (const e of errors) console.log(`  ERROR: ${e}`);
  console.log(`\ndocs check — ${errors.length} error(s) — FAIL`);
  process.exit(1);
}
console.log(`docs check — ${count} skills, README/orchestrator/commands/counts consistent — PASS`);
