#!/usr/bin/env node
'use strict';
/**
 * تحقق من سلامة حزمة التطبيق نفسها — يعمل محلياً وفي CI.
 *   node master-apply-packs/risha-pro-talents/scripts/validate-pack.js
 *
 * يفشل عند: ملف ناقص، JSON غير صالح، تكليف بلا بنية RCTC، رابط داخلي مكسور،
 * أو إشارة إلى مهارة غير موجودة في المستودع.
 */
const fs = require('node:fs');
const path = require('node:path');

const PACK = path.resolve(__dirname, '..');
const REPO = path.resolve(PACK, '..', '..');
const errors = [];
const checks = [];

function ok(label) { checks.push(label); }
function bad(label, detail) { errors.push(`${label}${detail ? ` — ${detail}` : ''}`); }

function mustExist(rel, from = PACK) {
  const p = path.join(from, rel);
  if (fs.existsSync(p)) { ok(`exists: ${rel}`); return p; }
  bad(`missing file: ${rel}`);
  return null;
}

// 1) الملفات الأساسية
const required = [
  'README.md',
  'LEVELS.md',
  'APPLY-PLAN.md',
  'CHECKLIST.md',
  'capabilities/risha-pro-talents-level.json',
  'scripts/apply-risha-pro-level.mjs',
  'scripts/apply-risha-pro-level.ps1',
  'scripts/apply-risha-pro-level.cmd',
  'scripts/validate-pack.js',
];
required.forEach((r) => mustExist(r));

// 2) بطاقة القدرة صالحة ومكتملة
const cardPath = path.join(PACK, 'capabilities', 'risha-pro-talents-level.json');
let card = null;
if (fs.existsSync(cardPath)) {
  try {
    card = JSON.parse(fs.readFileSync(cardPath, 'utf8'));
    ok('capability card parses');
  } catch (e) {
    bad('capability card is not valid JSON', e.message);
  }
}
if (card) {
  for (const key of ['id', 'kind', 'purpose', 'not', 'path', 'active_level', 'human_gates', 'composes']) {
    if (card[key] === undefined) bad(`capability card missing key: ${key}`);
  }
  if (card.id !== 'risha-pro-talents-level') bad('capability card id mismatch', card.id);
  if (!Array.isArray(card.human_gates) || card.human_gates.length === 0) {
    bad('capability card must declare at least one human gate');
  } else ok(`human gates declared: ${card.human_gates.length}`);

  // كل مهارة مركَّبة يجب أن يكون لها مجلد في المستودع (باستثناء المعرّفات الخارجية)
  const localAliases = {
    'rctc-method': 'SKILL.md',
    'web-marketing-and-personal-builder-super-skill': 'web_marketing_and_personal-builder-super-skill',
    'whatsapp-agent-orchestrator-super-skill': 'whatsapp-agent-orchestrator-super-skill',
  };
  for (const id of card.composes || []) {
    const rel = localAliases[id] || id;
    if (fs.existsSync(path.join(REPO, rel))) ok(`composed skill present: ${id}`);
    else bad(`composed skill not found in repo: ${id}`, `expected ${rel}`);
  }
}

// 3) التكاليف بصيغة RCTC
const promptsDir = path.join(PACK, 'prompts');
if (!fs.existsSync(promptsDir)) {
  bad('missing prompts directory');
} else {
  const prompts = fs.readdirSync(promptsDir).filter((f) => f.endsWith('.md')).sort();
  if (prompts.length < 5) bad(`expected at least 5 prompts, found ${prompts.length}`);
  for (const name of prompts) {
    const body = fs.readFileSync(path.join(promptsDir, name), 'utf8');
    const sections = ['## Role', '## Context', '## Task', '## Constraints'];
    const missing = sections.filter((s) => !body.includes(s));
    if (missing.length) bad(`prompt ${name} is not RCTC-shaped`, `missing ${missing.join(', ')}`);
    else ok(`RCTC prompt: ${name}`);
  }
}

// 4) الروابط النسبية داخل ملفات الحزمة تشير إلى شيء موجود
const mdFiles = ['README.md', 'LEVELS.md', 'APPLY-PLAN.md', 'CHECKLIST.md']
  .map((f) => path.join(PACK, f))
  .filter((f) => fs.existsSync(f));
const linkRe = /\]\((?!https?:|mailto:|#)([^)]+)\)/g;
for (const file of mdFiles) {
  const body = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = linkRe.exec(body)) !== null) {
    const target = m[1].split('#')[0];
    if (!target) continue;
    const resolved = path.resolve(path.dirname(file), target);
    if (!fs.existsSync(resolved)) {
      bad(`broken link in ${path.basename(file)}`, target);
    }
  }
}
ok('relative links checked');

// 5) السكربت لا يكتب إلا خلف بوابة --apply
const runner = fs.readFileSync(path.join(PACK, 'scripts', 'apply-risha-pro-level.mjs'), 'utf8');
for (const forbidden of ['rmSync', 'unlinkSync', 'rmdirSync']) {
  if (runner.includes(forbidden)) bad(`apply script must never delete — found ${forbidden}`);
}
ok('apply script contains no delete calls');
for (const writeCall of ['writeFileSync', 'copyFileSync', 'appendFileSync', 'mkdirSync']) {
  const lines = runner.split('\n').filter((l) => l.includes(writeCall) && !l.trim().startsWith('*'));
  const unguarded = lines.filter((l) => !/opts\.apply/.test(l));
  // أسطر الكتابة داخل كتل `if (opts.apply) {` تُحسب مقبولة عبر فحص الكتلة أدناه
  if (unguarded.length) {
    const guardedByBlock = unguarded.every((l) => {
      const idx = runner.indexOf(l);
      const before = runner.slice(Math.max(0, idx - 400), idx);
      return /if \(opts\.apply\)/.test(before);
    });
    if (!guardedByBlock) bad(`write call not behind --apply gate: ${writeCall}`);
  }
}
ok('write calls are behind the --apply gate');

// النتيجة
for (const c of checks) console.log(`  ok  ${c}`);
if (errors.length) {
  console.error(`\n✗ ${errors.length} problem(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`\n✔ pack valid — ${checks.length} checks passed`);
