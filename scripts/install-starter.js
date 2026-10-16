#!/usr/bin/env node
/**
 * Install the starter skill pack into a host skills folder.
 * Usage:
 *   node scripts/install-starter.js
 *   node scripts/install-starter.js --host cursor --target .
 *   node scripts/install-starter.js --host claude --target /path/to/project
 *   node scripts/install-starter.js --dry-run
 *
 * Does not publish, deploy, or write outside --target. Overwrites only the
 * destination skill folders named in skills/STARTER.json.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const STARTER = path.join(ROOT, 'skills', 'STARTER.json');

function parseArgs(argv) {
  const out = { host: 'cursor', target: process.cwd(), dryRun: false, help: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') out.help = true;
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--host') out.host = String(argv[++i] || 'cursor').toLowerCase();
    else if (a === '--target') out.target = path.resolve(argv[++i] || '.');
  }
  return out;
}

function rmrf(p) {
  fs.rmSync(p, { recursive: true, force: true });
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, ent.name);
    const to = path.join(dest, ent.name);
    if (ent.isDirectory()) copyDir(from, to);
    else copyFile(from, to);
  }
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log('Install RCTC starter skills\n\n  node scripts/install-starter.js [--host cursor|claude|codex] [--target DIR] [--dry-run]\n');
    process.exit(0);
  }

  const cfg = JSON.parse(fs.readFileSync(STARTER, 'utf8'));
  const relHost = (cfg.hosts && cfg.hosts[args.host]) || null;
  if (!relHost) {
    console.error('Unknown host "' + args.host + '". Use: ' + Object.keys(cfg.hosts || {}).join(', '));
    process.exit(1);
  }

  const destRoot = path.join(args.target, relHost);
  const report = [];

  for (const item of cfg.skills || []) {
    const slug = item.slug;
    const srcRel = String(item.path).replace(/\\/g, '/');
    const srcAbs = path.join(ROOT, srcRel);
    if (!fs.existsSync(srcAbs)) {
      console.error('Missing source: ' + srcRel);
      process.exit(1);
    }
    const destDir = path.join(destRoot, slug);
    const mode = item.copy === 'file' ? 'file' : 'dir';

    if (args.dryRun) {
      report.push({ slug: slug, from: srcRel, to: path.relative(args.target, destDir) || destDir, mode: mode, dryRun: true });
      continue;
    }

    rmrf(destDir);
    fs.mkdirSync(destDir, { recursive: true });
    if (mode === 'file') {
      copyFile(srcAbs, path.join(destDir, 'SKILL.md'));
    } else {
      copyDir(srcAbs, destDir);
    }
    report.push({ slug: slug, from: srcRel, to: path.relative(args.target, destDir) || destDir, mode: mode });
  }

  console.log(JSON.stringify({
    ok: true,
    host: args.host,
    target: args.target,
    destRoot: path.relative(args.target, destRoot) || destRoot,
    dryRun: args.dryRun,
    installed: report,
    next: 'Reload the agent / open a new chat, then try the 60s demo in docs/QUICKSTART_60S.md',
  }, null, 2));
}

main();