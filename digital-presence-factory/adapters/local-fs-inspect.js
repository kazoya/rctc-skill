'use strict';
const fs = require('fs');
const path = require('path');

function run(input) {
  const started = Date.now();
  const source = input.source;
  const evidence = [];
  if (!source || !fs.existsSync(source)) {
    return {
      status: 'error',
      duration_ms: Date.now() - started,
      output: { error: 'source_missing' },
      evidence: [],
      files_changed: [],
      side_effect_classification: 'read-only',
      verification: { ok: false },
    };
  }
  const st = fs.statSync(source);
  evidence.push({ kind: 'stat', isDirectory: st.isDirectory() });
  if (st.isDirectory()) {
    for (const m of ['package.json', 'README.md', 'brain.json', 'BRAIN.md', 'project.json', 'app', 'data']) {
      if (fs.existsSync(path.join(source, m))) evidence.push({ kind: 'marker', name: m });
    }
  }
  return {
    status: 'ok',
    duration_ms: Date.now() - started,
    output: { source, evidence_count: evidence.length },
    evidence,
    files_changed: [],
    side_effect_classification: 'read-only',
    verification: { ok: true, checks: ['source readable'] },
  };
}

module.exports = { id: 'adapter.local-fs-inspect', run };
