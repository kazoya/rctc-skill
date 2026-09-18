'use strict';
/** Template adapter — read-only echo of source existence */
function run(input) {
  const started = Date.now();
  const fs = require('fs');
  const ok = !!(input.source && fs.existsSync(input.source));
  return {
    status: ok ? 'ok' : 'error',
    duration_ms: Date.now() - started,
    output: { exists: ok },
    evidence: [{ kind: 'exists', ok }],
    files_changed: [],
    side_effect_classification: 'read-only',
    verification: { ok, command: 'fs.existsSync(source)', exit_code: ok ? 0 : 1 },
  };
}
module.exports = { id: 'adapter.example-echo-inspect', run };
