#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'skill-factory', 'out');

function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'skill';
}

function draft(intent) {
  const id = slugify(intent);
  const dir = path.join(OUT, id);
  fs.mkdirSync(path.join(dir, 'examples'), { recursive: true });
  const manifest = {
    id,
    name: id,
    version: '0.1.0',
    description: intent,
    tags: ['generated', 'draft'],
    inputs: ['task description'],
    outputs: ['skill package'],
    required_capabilities: ['filesystem:write-local'],
    permissions: ['create-files-under-skill-factory/out'],
    side_effect_level: 'reversible',
    reversible: true,
    dependencies: [],
    compatible_agents: ['cursor', 'claude', 'grok'],
    verification: 'node skill-factory/scripts/sf.js validate ' + id,
    rollback: 'Delete skill-factory/out/' + id,
    provenance: 'skill-factory draft @ ' + new Date().toISOString(),
    status: 'draft'
  };
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(dir, 'SKILL.md'), [
    '---',
    'name: ' + id,
    'description: >',
    '  ' + intent,
    '---',
    '',
    '# ' + id,
    '',
    intent,
    '',
    '## Safety',
    '- Local draft only until validate/review.',
    '- No secrets. No auto-publish.',
    ''
  ].join('\n'));
  fs.writeFileSync(path.join(dir, 'README.md'), '# ' + id + '\n\n' + intent + '\n\nStatus: draft\n');
  fs.writeFileSync(path.join(dir, 'examples', 'usage.md'), '# Example\n\nIntent: ' + intent + '\n');
  fs.writeFileSync(path.join(dir, 'SAFETY.md'), '# Safety\n\nside_effect_level: reversible\nDo not publish without owner gate.\n');
  console.log('drafted', dir);
  return dir;
}

function validate(id) {
  const dir = path.join(OUT, id);
  const required = ['SKILL.md', 'README.md', 'manifest.json', 'SAFETY.md'];
  const missing = required.filter((f) => !fs.existsSync(path.join(dir, f)));
  if (missing.length) {
    console.error('FAIL missing', missing.join(','));
    process.exit(1);
  }
  const m = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  for (const k of ['id', 'name', 'version', 'description', 'status']) {
    if (!m[k]) {
      console.error('FAIL manifest field', k);
      process.exit(1);
    }
  }
  console.log('OK validate', id);
}

function review(id) {
  const dir = path.join(OUT, id);
  const m = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  const packet = {
    id,
    status: m.status,
    side_effect_level: m.side_effect_level,
    questions: [
      'Does an existing registry skill already solve this?',
      'Are permissions minimal?',
      'Is publish explicitly owner-gated?'
    ]
  };
  const p = path.join(dir, 'REVIEW_PACKET.json');
  fs.writeFileSync(p, JSON.stringify(packet, null, 2));
  console.log('review packet', p);
}

function packageSkill(id) {
  // deterministic file list hash (no zip dependency)
  const dir = path.join(OUT, id);
  const files = [];
  function walk(d, rel) {
    for (const name of fs.readdirSync(d).sort()) {
      const fp = path.join(d, name);
      const r = rel ? rel + '/' + name : name;
      if (fs.statSync(fp).isDirectory()) walk(fp, r);
      else files.push({ path: r, sha256: crypto.createHash('sha256').update(fs.readFileSync(fp)).digest('hex') });
    }
  }
  walk(dir, '');
  const artifact = { id, created: 'deterministic-content-addressed', files };
  const out = path.join(dir, 'PACKAGE_MANIFEST.json');
  fs.writeFileSync(out, JSON.stringify(artifact, null, 2));
  console.log('packaged', out);
}

function repoReady(id) {
  const dir = path.join(OUT, id);
  const repo = path.join(dir, 'repo-ready');
  fs.mkdirSync(path.join(repo, '.github', 'ISSUE_TEMPLATE'), { recursive: true });
  fs.writeFileSync(path.join(repo, 'LICENSE'), 'MIT — see parent repo unless overridden.\n');
  fs.writeFileSync(path.join(repo, '.gitignore'), 'node_modules/\n.venv/\n.env\n');
  fs.writeFileSync(path.join(repo, 'CONTRIBUTING.md'), '# Contributing\n\nOpen a Skill Proposal issue in kazoya/rctc-skill first.\n');
  fs.writeFileSync(path.join(repo, 'SECURITY.md'), '# Security\n\nReport to innervision2016@gmail.com\n');
  fs.copyFileSync(path.join(dir, 'SKILL.md'), path.join(repo, 'SKILL.md'));
  fs.copyFileSync(path.join(dir, 'README.md'), path.join(repo, 'README.md'));
  fs.copyFileSync(path.join(dir, 'manifest.json'), path.join(repo, 'manifest.json'));
  console.log('repo-ready at', repo);
  console.log('OWNER GATE: creating/pushing a public repo requires explicit approval.');
}

function publishHelp(id) {
  console.log('OWNER GATE — publish not executed.');
  console.log('If approved, exact next steps:');
  console.log('  1) Review skill-factory/out/' + id + '/repo-ready');
  console.log('  2) gh repo create kazoya/<name> --public --source=... (owner runs)');
  console.log('  3) Do not use bots for stars or promotion.');
}

const [mode, ...rest] = process.argv.slice(2);
if (!mode) {
  console.log('usage: node skill-factory/scripts/sf.js <draft|validate|review|package|repo-ready|publish> ...');
  process.exit(0);
}
if (mode === 'draft') draft(rest.join(' ') || 'untitled skill intent');
else if (mode === 'validate') validate(rest[0]);
else if (mode === 'review') review(rest[0]);
else if (mode === 'package') packageSkill(rest[0]);
else if (mode === 'repo-ready') repoReady(rest[0]);
else if (mode === 'publish') publishHelp(rest[0] || 'id');
else {
  console.error('unknown mode', mode);
  process.exit(1);
}
