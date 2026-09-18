#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const recipesDir = path.join(root, 'digital-presence-factory', 'recipes');
const registry = JSON.parse(fs.readFileSync(path.join(root, 'registry', 'skills.json'), 'utf8'));
const list = Array.isArray(registry) ? registry : registry.skills || [];
const known = new Set(
  list.map((x) => (typeof x === 'string' ? x : x.id || x.name || x.slug))
);
let failed = 0;
for (const f of fs.readdirSync(recipesDir)) {
  if (!f.endsWith('.json') || f === 'index.json') continue;
  const r = JSON.parse(fs.readFileSync(path.join(recipesDir, f), 'utf8'));
  for (const c of r.compose || []) {
    if (!known.has(c)) {
      console.error('GAP compose id', c, 'in', f, '(not in registry/skills.json)');
      failed++;
    }
  }
  console.log('OK', r.id);
}
if (failed) process.exit(1);
console.log('RECIPES_VALID against registry');
