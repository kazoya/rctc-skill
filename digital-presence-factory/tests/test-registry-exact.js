'use strict';
const path = require('path');
const assert = require('assert');
const { loadRegistry, resolveExact, resolveComposeList } = require('../lib/registry');

const RCTC = process.argv[2] || path.join(__dirname, '..', '..');
const reg = loadRegistry(path.join(RCTC, 'registry', 'skills.json'));

// known id
const ok = resolveExact(reg, 'factory-sales-concept');
assert.strictEqual(ok.ok, true);
assert.strictEqual(ok.status, 'RESOLVED');

// unknown must STOP/GAP — never ok
const bad = resolveExact(reg, 'web_marketing_and_personal-builder-super-skill');
assert.strictEqual(bad.ok, false);
assert.strictEqual(bad.status, 'GAP');
assert.strictEqual(bad.action, 'STOP');

const gapList = resolveComposeList(reg, [
  'factory-sales-concept',
  'this-skill-does-not-exist-xyz',
]);
assert.strictEqual(gapList.ok, false);
assert.strictEqual(gapList.action, 'STOP');

const goodList = resolveComposeList(reg, [
  'factory-sales-concept',
  'safe-forward-execution',
  'focused3-agentic-phases',
]);
assert.strictEqual(goodList.ok, true);

console.log('PASS test-registry-exact');
