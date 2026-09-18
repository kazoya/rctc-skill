'use strict';
const fs = require('fs');
const path = require('path');

/** Read-only inspect adapter — no writes */
function run(input) {
  const started = Date.now();
  const source = input.source;
  const evidence = [];
  if (!source || !fs.existsSync(source)) {
    return {
      status: 'error',
      duration_ms: Date.now() - started,
      output: { error: 'source_missing', source },
      evidence: [],
      files_changed: [],
      side_effect_classification: 'read-only',
      verification: { ok: false, checks: ['source exists'] },
    };
  }
  const st = fs.statSync(source);
  evidence.push({ kind: 'stat', isDirectory: st.isDirectory(), size: st.size });
  if (st.isDirectory()) {
    const markers = [
      'package.json',
      'README.md',
      'SKILL.md',
      'brain.json',
      'BRAIN.md',
      'data',
      'app',
      'project.json',
    ];
    for (const m of markers) {
      const p = path.join(source, m);
      if (fs.existsSync(p)) evidence.push({ kind: 'marker', name: m });
    }
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(source, 'package.json'), 'utf8'));
      evidence.push({
        kind: 'package',
        name: pkg.name || null,
        scripts: Object.keys(pkg.scripts || {}).slice(0, 30),
      });
    } catch (_) {}
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
