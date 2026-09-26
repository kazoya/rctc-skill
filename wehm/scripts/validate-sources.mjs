#!/usr/bin/env node
import fs from 'node:fs';

const file = process.argv[2] || new URL('../references/sources.json', import.meta.url);
const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
const errors = [];
if (doc.schema !== 'rctc.expertise-source-map.v1') errors.push('unexpected schema');
if (doc.skill !== 'wehm') errors.push('skill must be wehm');
if (doc.layer !== 1) errors.push('layer must be 1');
if (doc.safety?.uncertain_authorization !== 'STOP') errors.push('uncertain authorization must STOP');
if (!Array.isArray(doc.safety?.forbidden) || doc.safety.forbidden.length < 6) errors.push('forbidden list too small');
if (!Array.isArray(doc.sources) || doc.sources.length < 9) errors.push('at least 9 sources required');
const ids = new Set();
const ranks = new Set();
for (const [i, s] of (doc.sources || []).entries()) {
  for (const key of ['rank', 'tier', 'id', 'repository', 'default_branch', 'focus', 'anchors', 'relationship']) {
    if (s[key] === undefined || s[key] === '') errors.push(`sources[${i}].${key} missing`);
  }
  if (!String(s.repository || '').startsWith('https://github.com/')) errors.push(`${s.id}: repository must be GitHub HTTPS`);
  if (!Number.isInteger(s.tier) || s.tier < 0 || s.tier > 4) errors.push(`${s.id}: tier must be 0..4`);
  if (!Array.isArray(s.focus) || s.focus.length < 2) errors.push(`${s.id}: focus needs >=2 entries`);
  if (!Array.isArray(s.anchors) || s.anchors.length < 2) errors.push(`${s.id}: anchors needs >=2 entries`);
  if (ids.has(s.id)) errors.push(`${s.id}: duplicate id`); else ids.add(s.id);
  if (ranks.has(s.rank)) errors.push(`${s.rank}: duplicate rank`); else ranks.add(s.rank);
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`WEHM source map valid: ${doc.sources.length} sources, tiers 0..4`);
