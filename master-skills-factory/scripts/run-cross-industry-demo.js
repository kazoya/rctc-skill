'use strict';

const fs = require('fs');
const path = require('path');
const { runDeskWorkflow } = require('../src/workflow');

const CASES = [
  {
    sectorId: 'wholesale_produce',
    raw: '2 طن خيار التوصيل عمان كرتون',
    note: 'produce — market reference only'
  },
  {
    sectorId: 'electronic_components',
    raw: '10 pcs esp32 and 5 pcs relay',
    note: 'electronics'
  },
  {
    sectorId: 'clinic_reception',
    raw: '1 موعد كشف',
    note: 'clinic'
  },
  {
    sectorId: 'pharmacy_inquiries',
    raw: '2 علبه فيتامين سي',
    note: 'pharmacy'
  },
  {
    sectorId: 'cctv_installation',
    raw: '4 كاميرا 4mp عمان',
    note: 'cctv'
  },
  {
    sectorId: 'general_business_services',
    raw: '3 hours consulting',
    note: 'services',
    approvals: [
      {
        productId: 'consult_hour',
        unitPrice: '75.000',
        adminId: 'ops-1',
        expiresAt: '2099-01-01T00:00:00.000Z'
      }
    ],
    availability: [{ productId: 'consult_hour', state: 'AVAILABLE' }],
    issue: true,
    actor: 'ops-1'
  }
];

const results = CASES.map((c) => {
  const r = runDeskWorkflow(c);
  return {
    note: c.note,
    sectorId: r.sectorId,
    mode: r.assessment.mode,
    total: r.assessment.total,
    codes: r.validation.codes,
    whatsapp: r.outbound.status,
    sent: r.outbound.sent,
    inbound: r.inbound.action
  };
});

console.log(JSON.stringify({ evidence_class: 'synthetic_demo', results }, null, 2));

if (process.argv.includes('--write-evidence')) {
  const out = path.join(__dirname, '..', 'evidence', 'cross-industry-demo.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ generated_at: new Date().toISOString(), results }, null, 2));
  console.error('wrote', out);
}
