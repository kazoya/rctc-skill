#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const recipesDir = path.join(root, 'digital-presence-factory', 'recipes');
const known = new Set([
  'web_marketing_and_personal-builder-super-skill',
  'factory-sales-concept',
  'safe-forward-execution',
  'focused3-agentic-phases',
  'update-zip-skill',
  'portfolio-commander',
  'start-skill',
  'continuous-improving',
  'skill-factory',
  'dev-agora-skill'
]);
let failed = 0;
for (const f of fs.readdirSync(recipesDir)) {
  if (!f.endsWith('.json') || f === 'index.json') continue;
  const r = JSON.parse(fs.readFileSync(path.join(recipesDir, f), 'utf8'));
  for (const c of r.compose || []) {
    const folder = path.join(root, c);
    const alt = c === 'portfolio-commander' ? path.join(root, 'portfolio-commander', 'skill', 'SKILL.md') : path.join(folder, 'SKILL.md');
    const ok = fs.existsSync(folder) || fs.existsSync(alt) || known.has(c);
    if (!ok) { console.error('MISSING compose target', c, 'in', f); failed++; }
  }
  console.log('OK', r.id);
}
if (failed) process.exit(1);
console.log('RECIPES_VALID');
