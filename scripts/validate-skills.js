#!/usr/bin/env node
'use strict';

/**
 * @file CLI that validates every skill in skills/ against the rules in
 * docs/skill-anatomy.md.
 *
 * @description
 * The rules themselves live in scripts/lib/skill-lint.js (a single source of
 * truth, importable and unit-testable); this file is a thin wrapper that
 * walks the skills directory, runs the linter, prints the report, and sets
 * the exit code.
 *
 * Usage:
 *   node scripts/validate-skills.js
 *
 * Exit codes:
 *   0 — all skills pass (warnings allowed)
 *   1 — one or more errors, or an unexpected failure
 */

const fs   = require('fs');
const path = require('path');

const { lintSkill } = require('./lib/skill-lint');

/**
 * Absolute path to the repository's skills/ directory.
 * @constant {string}
 */
const SKILLS_DIR = path.resolve(__dirname, '..', 'skills');

/**
 * Walks the skills directory, lints every skill, prints a per-skill report,
 * and exits non-zero when any error-level finding exists.
 *
 * @returns {void}
 */
function main() {
  if (!fs.existsSync(SKILLS_DIR)) {
    console.error(`ERROR: skills directory not found at ${SKILLS_DIR}`);
    process.exit(1);
  }

  const skillDirs = fs.readdirSync(SKILLS_DIR)
    .filter(d => fs.statSync(path.join(SKILLS_DIR, d)).isDirectory())
    .sort();

  const knownSkills = new Set(skillDirs);

  let totalErrors   = 0;
  let totalWarnings = 0;

  for (const dirName of skillDirs) {
    const { errors, warnings, exempt } = lintSkill(dirName, SKILLS_DIR, knownSkills);
    totalErrors   += errors.length;
    totalWarnings += warnings.length;

    if (errors.length === 0 && warnings.length === 0) {
      const tag = exempt ? ' (section checks exempt)' : '';
      console.log(`  ✓  ${dirName}${tag}`);
    } else {
      const icon = errors.length > 0 ? '  ✗ ' : '  ⚠ ';
      console.log(`${icon} ${dirName}`);
      for (const msg of errors)   console.log(`       ERROR: ${msg}`);
      for (const msg of warnings) console.log(`       WARN:  ${msg}`);
    }
  }

  const status = totalErrors > 0 ? 'FAILED' : totalWarnings > 0 ? 'PASSED WITH WARNINGS' : 'PASSED';
  console.log(`\n${skillDirs.length} skills checked — ${totalErrors} error(s), ${totalWarnings} warning(s) — ${status}`);

  if (totalErrors > 0) process.exit(1);
}

// Surface unexpected failures (fs errors, bad symlinks, …) as a structured
// one-line CI error instead of an uncaught stack trace.
try {
  main();
} catch (err) {
  console.error(`\nERROR: validate-skills failed unexpectedly: ${err.message}`);
  process.exit(1);
}
