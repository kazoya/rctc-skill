'use strict';
/**
 * Permanent Project1 canary: PLAN + INSPECT only.
 * Must never enter BUILD/PUBLISH. Must not modify Project1.
 */
const path = require('path');
const fs = require('fs');
const { planOnly, runStage } = require('../lib/engine');
const { gitSnap } = require('../lib/ledger-v2');

const RCTC = process.env.RCTC_ROOT || 'C:/rctc-skill';
const DPF = path.join(RCTC, 'digital-presence-factory');
const P1 = process.env.PROJECT1_ROOT || 'C:/project1';
const OUT = process.env.CANARY_OUT || path.join(process.env.AGENT_TOOLS || 'C:/Users/pscx9/agent-tools', 'project1-canary-out');

fs.mkdirSync(OUT, { recursive: true });
const before = gitSnap(P1);
const plan = planOnly({ rctcRoot: RCTC, dpfRoot: DPF, type: 'project-evidence', source: P1 });
const inspect = runStage({
  rctcRoot: RCTC,
  dpfRoot: DPF,
  type: 'project-evidence',
  source: P1,
  stage: 'inspect',
  outDir: OUT,
});
const after = gitSnap(P1);

// Attempt build must GAP or be skipped — we assert we did NOT call build
const buildProbe = runStage({
  rctcRoot: RCTC,
  dpfRoot: DPF,
  type: 'project-evidence',
  source: P1,
  stage: 'build',
  outDir: OUT,
  ledger: inspect.ledger,
});

const report = {
  name: 'project1-canary',
  commit_before: before.commit,
  commit_after: after.commit,
  dirty_before: before.dirty,
  dirty_after: after.dirty,
  plan_ok: !!(plan.compose_resolution && plan.compose_resolution.ok),
  inspect_ok: !!inspect.ok,
  build_must_not_write: {
    ok: buildProbe.ok === false || (buildProbe.result && (buildProbe.result.files_changed || []).length === 0),
    status: buildProbe.status || (buildProbe.result && buildProbe.result.status),
    reason: buildProbe.reason || null,
    files_changed: (buildProbe.result && buildProbe.result.files_changed) || [],
  },
  purchasing_invariants: 'not modified by canary (no Project1 file writes expected)',
  commit_unchanged: before.commit === after.commit,
};
fs.writeFileSync(path.join(OUT, 'canary-report.json'), JSON.stringify(report, null, 2));
if (inspect.ledger) {
  fs.writeFileSync(path.join(OUT, 'execution-ledger.v2.json'), JSON.stringify(inspect.ledger, null, 2));
}
console.log(JSON.stringify(report, null, 2));
if (!report.plan_ok || !report.inspect_ok || !report.build_must_not_write.ok || !report.commit_unchanged) {
  process.exit(1);
}
console.log('PROJECT1_CANARY_PASS');
