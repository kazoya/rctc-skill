'use strict';
const fs = require('fs');
const path = require('path');
const { loadCanonical } = require('../lib/canonical');
const { PERMISSION_KEYS } = require('../lib/sandbox');

const dpfRoot = process.argv[2] || path.join(__dirname, '..');
const rctcRoot = path.resolve(dpfRoot, '..');
const canonical = loadCanonical(rctcRoot);
const dir = path.join(dpfRoot, 'contracts', 'adapters');
let failed = 0;
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.manifest.json'))) {
  const m = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  if (!m.adapter_id || !m.module || !m.canonical_capability_id) {
    console.error('INVALID', f, 'missing required fields');
    failed++;
    continue;
  }
  if (!canonical.byId.has(m.canonical_capability_id)) {
    console.error('GAP canonical', m.canonical_capability_id, 'in', f);
    failed++;
  }
  const mod = path.resolve(dpfRoot, m.module);
  if (!fs.existsSync(mod)) {
    console.error('MISSING module', mod);
    failed++;
  }
  const perms = m.permissions || {};
  for (const k of Object.keys(perms)) {
    if (!PERMISSION_KEYS.includes(k)) {
      console.error('UNKNOWN permission key', k, 'in', f);
      failed++;
    }
  }
  console.log('OK', m.adapter_id);
}
if (failed) process.exit(1);
console.log('ADAPTER_MANIFESTS_VALID');
