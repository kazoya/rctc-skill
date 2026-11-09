'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { parseToMinor, formatMinor, buildMoneyBreakdown } = require('../src/money');
const { openStore, saveStore, submitCase, migrateDesk } = require('../src/store');
const { runDeskWorkflow, tenantIsolationCheck } = require('../src/workflow');

describe('money minor units', () => {
  it('parses and formats without float drift', () => {
    assert.equal(parseToMinor('0.300').toString(), '300');
    assert.equal(formatMinor(600n), '0.600');
    const m = buildMoneyBreakdown({
      unitPrice: '0.300',
      quantity: '2',
      taxBps: 1600,
      discountBps: 0,
      deliveryMinor: 50n
    });
    // net 0.600, tax 16% = 0.096, delivery 0.050 → 0.746
    assert.equal(m.total, '0.746');
  });
});

describe('tenant + idempotency + migration', () => {
  it('idempotent submit and reversible migration metadata', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'msf-idemp-'));
    const opened = openStore(dir);
    const a = submitCase(opened.data, {
      tenantId: 't1',
      actorTenant: 't1',
      raw: 'same payload',
      assessment: { mode: 'INCOMPLETE_RFQ' }
    });
    saveStore(dir, a.data);
    const opened2 = openStore(dir);
    const b = submitCase(opened2.data, {
      tenantId: 't1',
      actorTenant: 't1',
      raw: 'same payload',
      assessment: { mode: 'INCOMPLETE_RFQ' }
    });
    assert.equal(b.duplicate, true);
    assert.equal(b.idempotentReplay, true);
    assert.equal(b.record.reference, a.record.reference);

    const migrated = migrateDesk({ cases: [], availability: [], approvals: [] });
    assert.equal(migrated.reversible, true);
    assert.equal(migrated.data.schemaVersion, 2);
  });

  it('server-side actor mismatch forbidden', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'msf-auth-'));
    const r = runDeskWorkflow({
      sectorId: 'general_business_services',
      raw: '1 hours consulting',
      tenantId: 't-owner',
      actorTenant: 't-other',
      storeDir: dir
    });
    assert.equal(r.persistence.code, 'FORBIDDEN');
    assert.equal(r.persistence.persisted, false);
  });

  it('cross-tenant read blocked', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'msf-x-'));
    const r = runDeskWorkflow({
      sectorId: 'general_business_services',
      raw: '2 hours consulting',
      tenantId: 'alpha',
      storeDir: dir
    });
    const iso = tenantIsolationCheck(dir, 'alpha', 'beta', r.persistence.reference);
    assert.equal(iso.ownerRead, true);
    assert.equal(iso.crossTenant, true);
  });
});
