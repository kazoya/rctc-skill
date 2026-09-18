#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const id = process.argv[2];
const cat = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'catalog.json'), 'utf8'));
if (!id) {
  console.log(cat.packages.map((p) => p.id).join('\n'));
  process.exit(0);
}
const p = cat.packages.find((x) => x.id === id);
if (!p) { console.error('unknown package', id); process.exit(1); }
console.log(JSON.stringify(p, null, 2));
