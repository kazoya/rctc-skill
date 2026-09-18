'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = process.argv[2] || path.join(__dirname, '..');
const recipesDir = path.join(ROOT, 'recipes');
const ALIAS = {
  'web_marketing_and_personal-builder-super-skill':
    'web-marketing-and-personal-builder-super-skill',
};

let changed = 0;
for (const f of fs.readdirSync(recipesDir).filter((x) => x.endsWith('.json') && x !== 'index.json')) {
  const p = path.join(recipesDir, f);
  const r = JSON.parse(fs.readFileSync(p, 'utf8'));
  let dirty = false;
  r.compose = (r.compose || []).map((id) => {
    if (ALIAS[id]) {
      dirty = true;
      return ALIAS[id];
    }
    return id;
  });
  if (dirty) {
    fs.writeFileSync(p, JSON.stringify(r, null, 2) + '\n');
    changed++;
    console.log('normalized', f);
  }
}
console.log('files_changed', changed);
