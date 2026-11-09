'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const patterns = [
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN (RSA |OPENSSH )?PRIVATE KEY-----/,
  /api[_-]?key\s*[:=]\s*['\"][A-Za-z0-9_\-]{20,}/i,
  /wa\.me\/9627\d{8}/,
  /password\s*[:=]\s*['\"][^'\"]{8,}/i
];

const skip = new Set(['node_modules', '.git']);
let hits = 0;

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    if (skip.has(name)) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (/\.(js|json|md|ts|env)$/i.test(name)) {
      const text = fs.readFileSync(p, 'utf8');
      for (const re of patterns) {
        if (re.test(text)) {
          // allow documented placeholder 962700000000 in tests
          if (text.includes('962700000000') && re.source.includes('wa\\.me')) continue;
          console.error('HIT', re, p);
          hits += 1;
        }
      }
    }
  }
}

walk(ROOT);
if (hits) {
  console.error('FAIL secrets scan', hits);
  process.exit(1);
}
console.log('OK secrets scan');
