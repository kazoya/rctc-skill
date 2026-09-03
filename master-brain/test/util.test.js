'use strict';
const fs = require('fs');
const path = require('path');
const u = require('../src/util.js');

// 1) no raw control characters in source files (they break editors and the approval UI)
function scanControlChars(dir) {
  const bad = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) { if (!['node_modules', '.git', 'data'].includes(entry.name)) bad.push(...scanControlChars(p)); continue; }
    if (!/\.(js|json|md|html|css|ps1|sh|cmd|txt|yaml|yml)$/i.test(entry.name)) continue;
    const s = fs.readFileSync(p, 'utf8');
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      if (c < 32 && c !== 9 && c !== 10 && c !== 13) { bad.push(`${p}@${i}:0x${c.toString(16)}`); break; }
    }
  }
  return bad;
}
const bad = scanControlChars(path.join(__dirname, '..'));
if (bad.length) { console.error('CONTROL CHARS FOUND:', bad); process.exit(1); }

// 2) helpers
const assert = require('assert');
assert.strictEqual(u.slugify('ريشة 360 Legal!'), 'ريشة-360-legal');
assert.strictEqual(u.fmtDate('2026-09-03T12:00:00Z'), '2026-09-03 15:00');
assert.strictEqual(u.dateStamp('2026-09-03T12:00:00Z'), '202609031500');
const fm = u.parseFrontmatter('---\ntitle: "hi: there"\nprogress: 40\n---\nbody');
assert.deepStrictEqual(fm.meta, { title: 'hi: there', progress: '40' });
assert.strictEqual(fm.body, 'body');
assert.deepStrictEqual(u.parseArgs(['log', 'x', '--type', 'a', '--flag']), { _: ['log', 'x'], type: 'a', flag: true });
assert.strictEqual(u.escapeXml('a<b>&"c' + String.fromCharCode(7) + 'd'), 'a&lt;b&gt;&amp;&quot;cd');
const built = u.buildFrontmatter({ date: '2026-09-03', title: 'x: y', tags: ['a', 'b'] }, 'hello');
assert.deepStrictEqual(u.parseFrontmatter(built).meta, { date: '2026-09-03', title: 'x: y', tags: 'a, b' });
assert.strictEqual(u.stripBom(u.BOM + 'x'), 'x');
console.log('util.test.js OK');
