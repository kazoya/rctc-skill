'use strict';

/**
 * Synthetic customer-support demonstration (no real customers).
 */
const fs = require('node:fs');
const path = require('node:path');
const { SelfPulseEngine } = require('../src');

const eng = new SelfPulseEngine({ agentId: 'support-synth-1' });
const timeline = [];

function step(label, run) {
  const result = run();
  timeline.push({
    at: new Date().toISOString(),
    label,
    agentSelfState: eng.selfState.snapshot(),
    calibration: eng.confidence.calibration(),
    errors: eng.errors.effectiveness(),
    functionalSatisfaction: result && result.satisfaction ? result.satisfaction : null,
    note: 'Verified operational metrics only — not emotions.'
  });
  return result;
}

step('ticket-open-reset-password', () =>
  eng.runTaskCycle({
    taskId: 'sup-001',
    customerId: 'cust_synth_42',
    pSuccess: 0.92,
    verifiedSuccess: false,
    evidenceIds: ['email-parse-1']
  })
);

eng.errors.recordCorrection({ taskId: 'sup-001', verifiedFixed: true });

step('ticket-retry-after-verified-fix', () =>
  eng.runTaskCycle({
    taskId: 'sup-002',
    customerId: 'cust_synth_42',
    pSuccess: 0.6,
    verifiedSuccess: true,
    evidenceIds: ['email-parse-1', 'reset-audit-9']
  })
);

const last = step('ticket-billing-faq-resolved', () =>
  eng.runTaskCycle({
    taskId: 'sup-003-billing-faq',
    customerId: 'cust_synth_42',
    pSuccess: 0.7,
    verifiedSuccess: true,
    evidenceIds: ['kb-12']
  })
);

let isolation;
try {
  eng.customers.get('cust_synth_42').snapshot('cust_other');
  isolation = { ok: false };
} catch (e) {
  isolation = { ok: true, code: e.code };
}

const out = {
  demo: 'synthetic-customer-support',
  realCustomerData: false,
  isolationEnforced: isolation,
  csatPolicy: eng.customers.get('cust_synth_42').getCustomerSatisfactionScore(),
  customerSnapshot: eng.customers.get('cust_synth_42').snapshot('cust_synth_42'),
  finalDashboard: last.dashboard,
  timeline,
  disclaimer:
    'Synthetic only. FunctionalSatisfactionScore is computational, not an emotion. CSAT not manufactured.'
};

const dir = __dirname;
fs.writeFileSync(path.join(dir, 'synthetic-support-demo.json'), `${JSON.stringify(out, null, 2)}\n`);
fs.writeFileSync(
  path.join(dir, 'agent-self-state-timeline.json'),
  `${JSON.stringify({ timeline, disclaimer: out.disclaimer }, null, 2)}\n`
);

const lines = [
  '# Agent Self-State Timeline (Illustrative Output)',
  '',
  '> Synthetic demo — verified operational metrics. Not consciousness.',
  '',
  '| Step | Label | confidenceBefore | verifiedSuccess | functionalSatisfaction | Brier n | Errors |',
  '|---|---|---|---|---|---|---|'
];
timeline.forEach((t, i) => {
  const vs = t.agentSelfState.lastVerifiedOutcome
    ? t.agentSelfState.lastVerifiedOutcome.success
    : null;
  const sat = t.functionalSatisfaction ? t.functionalSatisfaction.score : null;
  lines.push(
    `| ${i + 1} | ${t.label} | ${t.agentSelfState.confidenceBefore} | ${vs} | ${sat} | ${t.calibration.nClosed} | ${t.errors.errorFrequency} |`
  );
});
lines.push('');
lines.push(
  'CSAT manufactured? **No** (`getCustomerSatisfactionScore().score === null` unless explicit feedback).'
);
fs.writeFileSync(path.join(dir, 'TIMELINE_ILLUSTRATION.md'), `${lines.join('\n')}\n`);

process.stdout.write('Wrote synthetic demo + timeline artifacts\n');
