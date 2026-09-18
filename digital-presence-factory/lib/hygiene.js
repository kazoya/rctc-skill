'use strict';
const fs = require('fs');
const path = require('path');

/**
 * Repo hygiene gate — report only, never auto-delete owner files.
 * Classifications: KEEP | IGNORE | REVIEW | GENERATED
 */

const RULES = [
  { re: /node_modules(\/|\\|$)/i, cls: 'IGNORE', reason: 'dependencies' },
  { re: /\.next(\/|\\|$)/i, cls: 'IGNORE', reason: 'Next build' },
  { re: /(^|\/|\\)dist(\/|\\|$)/i, cls: 'IGNORE', reason: 'build output' },
  { re: /(^|\/|\\)build(\/|\\|$)/i, cls: 'IGNORE', reason: 'build output' },
  { re: /\.cache(\/|\\|$)/i, cls: 'IGNORE', reason: 'cache' },
  { re: /playwright-report/i, cls: 'GENERATED', reason: 'test report' },
  { re: /test-results/i, cls: 'GENERATED', reason: 'test output' },
  { re: /\.zip$/i, cls: 'REVIEW', reason: 'archive — may be handoff or debris' },
  { re: /\.(png|jpg|jpeg|webp|gif)$/i, cls: 'REVIEW', reason: 'image/screenshot candidate' },
  { re: /\.xml$/i, cls: 'REVIEW', reason: 'XML dump candidate' },
  { re: /\.(log|tmp|temp)$/i, cls: 'GENERATED', reason: 'log/temp' },
  { re: /agent-tools/i, cls: 'REVIEW', reason: 'local agent staging' },
  { re: /RCTC_.*HANDOFF.*\.zip$/i, cls: 'GENERATED', reason: 'handoff artifact' },
  { re: /browser.*capture|screenshot/i, cls: 'REVIEW', reason: 'browser capture' },
];

function classify(relPath) {
  const p = relPath.replace(/\\/g, '/');
  for (const rule of RULES) {
    if (rule.re.test(p)) return { path: relPath, classification: rule.cls, reason: rule.reason };
  }
  return { path: relPath, classification: 'KEEP', reason: 'source or unknown — keep' };
}

function walk(dir, base, out, max = 5000) {
  if (out.length >= max) return;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    if (out.length >= max) return;
    const full = path.join(dir, ent.name);
    const rel = path.relative(base, full);
    if (ent.isDirectory()) {
      const name = ent.name.toLowerCase();
      if (['.git', 'node_modules', '.next', 'dist', 'build', '.cache'].includes(name)) {
        out.push(classify(rel + path.sep));
        continue;
      }
      walk(full, base, out, max);
    } else {
      out.push(classify(rel));
    }
  }
}

function scanHygiene(root, opts = {}) {
  const findings = [];
  walk(root, root, findings, opts.max || 8000);
  const summary = { KEEP: 0, IGNORE: 0, REVIEW: 0, GENERATED: 0 };
  for (const f of findings) summary[f.classification] = (summary[f.classification] || 0) + 1;
  const review = findings.filter((f) => f.classification === 'REVIEW').slice(0, 80);
  const generated = findings.filter((f) => f.classification === 'GENERATED').slice(0, 80);
  const gitignore_proposals = [
    'node_modules/',
    '.next/',
    'dist/',
    'build/',
    '.cache/',
    '*.log',
    'playwright-report/',
    'test-results/',
    'docs/*HANDOFF*.zip',
    'docs/growth-packs/*.zip',
  ];
  return {
    root,
    scanned_at: new Date().toISOString(),
    summary,
    review_sample: review,
    generated_sample: generated,
    gitignore_proposals,
    policy: 'Do NOT automatically delete owner files. Report KEEP/IGNORE/REVIEW/GENERATED only.',
  };
}

module.exports = { classify, scanHygiene, RULES };
