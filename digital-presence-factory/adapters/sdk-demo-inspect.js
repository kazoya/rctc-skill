'use strict';
const fs = require('fs');
function run(input) {
  const started = Date.now();
  const ok = !!(input.source && fs.existsSync(pathJoin(input.source, '.rctc-sdk-demo')));
  return {
    status: ok ? 'ok' : 'error',
    duration_ms: Date.now() - started,
    output: { sdk_demo: true, ok },
    evidence: [{ kind: 'sdk-demo' }],
    files_changed: [],
    side_effect_classification: 'read-only',
    verification: { ok, command: 'exists .rctc-sdk-demo', exit_code: ok ? 0 : 1 },
  };
}
function pathJoin(a, b) {
  return require('path').join(a, b);
}
module.exports = { id: 'adapter.sdk-demo-inspect', run };
