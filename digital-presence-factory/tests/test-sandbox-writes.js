'use strict';
const assert = require('assert');
const path = require('path');
const { authorizeManifest, enforceWrites } = require('../lib/sandbox');

const manifest = {
  permissions: {
    read_paths: ['${source}'],
    write_paths: ['${source}/README.md'],
    process_exec: false,
    network: false,
    git_write: false,
    github_write: false,
    deploy: false,
    secrets: false,
  },
};
const auth = authorizeManifest(manifest, 'build', { source: 'C:/tmp/proj', outDir: 'C:/tmp/out' });
assert.strictEqual(auth.ok, true);

const good = enforceWrites(auth.declared, [path.join('C:/tmp/proj', 'README.md')]);
assert.strictEqual(good.ok, true);

const bad = enforceWrites(auth.declared, [path.join('C:/tmp/proj', 'secret.env')]);
assert.strictEqual(bad.ok, false);
assert.strictEqual(bad.action, 'STOP');

const secrets = authorizeManifest(
  { permissions: { ...manifest.permissions, secrets: true } },
  'build',
  { source: 'C:/tmp/proj' }
);
assert.strictEqual(secrets.ok, false);
console.log('PASS test-sandbox-writes');
