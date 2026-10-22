'use strict';

const { SelfPulseEngine } = require('../src');
const fs = require('node:fs');
const path = require('node:path');

const eng = new SelfPulseEngine({ agentId: 'demo-agent' });

const success = eng.runTaskCycle({
  taskId: 'ticket-100',
  customerId: 'cust_demo1',
  pSuccess: 0.75,
  verifiedSuccess: true,
  evidenceIds: ['log-55', 'policy-ok']
});

const failThenFix = eng.runTaskCycle({
  taskId: 'ticket-101',
  customerId: 'cust_demo1',
  pSuccess: 0.9,
  verifiedSuccess: false,
  evidenceIds: ['log-56']
});
eng.errors.recordCorrection({ taskId: 'ticket-101', verifiedFixed: true });

const out = {
  successCycle: success.dashboard,
  failedCycle: failThenFix.dashboard,
  recovery: eng.errors.effectiveness(),
  note: 'Example JSON only. Not a consciousness claim.'
};

const dest = path.join(__dirname, 'sample-output.json');
fs.writeFileSync(dest, `${JSON.stringify(out, null, 2)}\n`);
process.stdout.write(`Wrote ${dest}\n`);
