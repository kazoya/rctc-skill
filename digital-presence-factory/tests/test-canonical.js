'use strict';
const path = require('path');
const assert = require('assert');
const { loadCanonical, resolveCanonical, resolveComposeCanonical } = require('../lib/canonical');

const RCTC = process.argv[2] || path.join(__dirname, '..', '..');
const c = loadCanonical(RCTC);
assert.ok(c.data.metrics.canonical_capabilities >= 20);
assert.ok(c.data.metrics.discovered_skill_records >= c.data.metrics.canonical_capabilities);

const ok = resolveCanonical(c, 'factory-sales-concept');
assert.strictEqual(ok.ok, true);
assert.ok(ok.installation_count >= 1);

const bad = resolveCanonical(c, 'web_marketing_and_personal-builder-super-skill');
assert.strictEqual(bad.ok, false);
assert.strictEqual(bad.action, 'STOP');

const list = resolveComposeCanonical(c, ['safe-forward-execution', 'no-such-capability-xyz']);
assert.strictEqual(list.ok, false);
console.log('PASS test-canonical', c.data.metrics.public_claim);
