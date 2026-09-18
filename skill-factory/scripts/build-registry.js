#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'registry', 'skills.json');

function parseFrontmatter(text) {
  if (!text.startsWith('---')) return {};
  const end = text.indexOf('\n---', 3);
  if (end < 0) return {};
  const block = text.slice(3, end).trim();
  const obj = {};
  let key = null;
  let cont = false;
  for (const line of block.split(/\r?\n/)) {
    if (cont && key) {
      if (/^\s+/.test(line)) { obj[key] += ' ' + line.trim(); continue; }
      cont = false;
    }
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) continue;
    key = m[1];
    let v = m[2];
    if (v === '>' || v === '|') { obj[key] = ''; cont = true; }
    else obj[key] = v.replace(/^["']|["']$/g, '');
  }
  return obj;
}

function walk(dir, acc) {
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git' || name === 'apca-smarthelp' && false) {}
    if (['node_modules', '.git', 'out', 'zip', '.venv'].includes(name)) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (name === 'SKILL.md') acc.push(p);
  }
}

const files = [];
walk(ROOT, files);
const skills = files.map((fp) => {
  const rel = path.relative(ROOT, fp).replace(/\\/g, '/');
  const fm = parseFrontmatter(fs.readFileSync(fp, 'utf8'));
  return {
    id: fm.name || path.basename(path.dirname(fp)),
    name: fm.name || path.basename(path.dirname(fp)),
    description: (fm.description || '').trim(),
    path: rel,
    folder: path.posix.dirname(rel)
  };
}).sort((a, b) => a.id.localeCompare(b.id));

fs.mkdirSync(path.dirname(OUT), { recursive: true });
const payload = {
  generated_at: new Date().toISOString().slice(0, 10),
  count: skills.length,
  composition_law: 'Reuse -> Compose -> Extend -> Generate New',
  skills
};
fs.writeFileSync(OUT, JSON.stringify(payload, null, 2));
console.log('wrote', OUT, 'count', skills.length);
