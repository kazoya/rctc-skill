'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'skills');
const required = ['SKILL.md', 'README.md', 'manifest.json', 'SAFETY.md'];
let failed = 0;

for (const id of fs.readdirSync(ROOT)) {
  const dir = path.join(ROOT, id);
  if (!fs.statSync(dir).isDirectory()) continue;
  const missing = required.filter((f) => !fs.existsSync(path.join(dir, f)));
  if (missing.length) {
    console.error('FAIL', id, 'missing', missing.join(','));
    failed += 1;
    continue;
  }
  const m = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  for (const k of ['id', 'name', 'version', 'description', 'status']) {
    if (!m[k]) {
      console.error('FAIL', id, 'manifest field', k);
      failed += 1;
    }
  }
  console.log('OK validate', id);
}

process.exit(failed ? 1 : 0);
