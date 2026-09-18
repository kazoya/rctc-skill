'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function run(input) {
  const started = Date.now();
  const source = input.source;
  const checks = [];
  const evidence = [];
  let ok = true;

  if (!fs.existsSync(source)) {
    return {
      status: 'error',
      duration_ms: Date.now() - started,
      output: { error: 'missing source' },
      evidence: [],
      files_changed: [],
      side_effect_classification: 'tests-only',
      verification: { ok: false },
    };
  }

  const pkgPath = path.join(source, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const scripts = pkg.scripts || {};
    if (scripts.verify) {
      try {
        const out = execSync('npm run verify', { cwd: source, encoding: 'utf8', stdio: 'pipe', timeout: 120000 });
        checks.push({ name: 'npm run verify', exit: 0 });
        evidence.push({ kind: 'verify_tail', text: String(out).slice(-400) });
      } catch (e) {
        ok = false;
        checks.push({ name: 'npm run verify', exit: e.status || 1, err: String(e.stderr || e.message).slice(0, 400) });
      }
    } else if (scripts.lint) {
      checks.push({ name: 'lint_present_skipped', note: 'prefer verify when available; lint not auto-run to keep dogfood small' });
    } else {
      checks.push({ name: 'no_verify_script', note: 'README/marker checks only' });
    }
  }

  // Portfolio dogfood marker check when requested
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
    evidence,
    files_changed: [],
    side_effect_classification: 'tests-only',
    verification: { ok, checks },
  };
}

module.exports = { id: 'adapter.local-verify', run };
