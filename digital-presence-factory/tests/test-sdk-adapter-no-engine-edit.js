'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const assert = require('assert');
const { selectAdapterManifest, loadAdapterManifests } = require('../lib/contracts');

const dpfRoot = process.argv[2] || path.join(__dirname, '..');
const manifests = loadAdapterManifests(dpfRoot);
const demo = manifests.find((m) => m.adapter_id === 'adapter.sdk-demo-inspect');
assert.ok(demo, 'sdk-demo-inspect manifest missing');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rctc-sdk-'));
fs.writeFileSync(path.join(tmp, '.rctc-sdk-demo'), '1');

const sel = selectAdapterManifest(manifests, {
  stage: 'inspect',
  recipeId: 'sdk-demo-only',
  source: tmp,
});
assert.strictEqual(sel.ok, true);
assert.strictEqual(sel.manifest.adapter_id, 'adapter.sdk-demo-inspect');
console.log('PASS test-sdk-adapter-no-engine-edit');
