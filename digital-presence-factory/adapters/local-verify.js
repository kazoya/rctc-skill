'use strict';
const fs = require('fs');
const path = require('path');

function run(input) {
  const started = Date.now();
  const source = input.source;
  const checks = [];
  let ok = true;
  if (!fs.existsSync(source)) {
    return {
      status: 'error',
      duration_ms: Date.now() - started,
      output: { error: 'missing' },
      evidence: [],
      files_changed: [],
      side_effect_classification: 'tests-only',
      verification: { ok: false, command: null, exit_code: 1 },
    };
  }
  checks.push({ name: 'source_exists', ok: true });
  if (input.expect_marker) {
    const readme = path.join(source, 'README.md');
    const has = fs.existsSync(readme) && fs.readFileSync(readme, 'utf8').includes(input.expect_marker);
    checks.push({ name: 'expect_marker', ok: has });
    if (!has) ok = false;
  }
  return {
    status: ok ? 'ok' : 'error',
    duration_ms: Date.now() - started,
    output: { checks },
    evidence: checks,
    files_changed: [],
    side_effect_classification: 'tests-only',
    verification: {
      ok,
      command: input.expect_marker ? 'README marker contains check' : 'source exists',
      exit_code: ok ? 0 : 1,
      checks,
    },
  };
}

module.exports = { id: 'adapter.local-verify', run };
