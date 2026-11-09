'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { runDeskWorkflow } = require('../src/workflow');

const MATRIX = [
  {
    sectorId: 'wholesale_produce',
    complete: {
      raw: '2 طن خيار التوصيل عمان كرتون',
      approvals: [
        {
          productId: 'cucumber',
          unitPrice: '0.300',
          adminId: 'admin-1',
          expiresAt: '2099-01-01T00:00:00.000Z'
        }
      ],
      availability: [{ productId: 'cucumber', state: 'AVAILABLE' }],
      issue: true,
      actor: 'admin-1',
      rule: 'market_reference_is_not_sell_price'
    },
    incomplete: { raw: 'بدي تمور' }
  },
  {
    sectorId: 'electronic_components',
    complete: {
      raw: '10 pcs esp32',
      approvals: [
        {
          productId: 'esp32',
          unitPrice: '5.000',
          adminId: 'ops',
          expiresAt: '2099-01-01T00:00:00.000Z'
        }
      ],
      availability: [{ productId: 'esp32', state: 'AVAILABLE' }],
      issue: true,
      actor: 'ops',
      rule: 'unit_price_requires_approval'
    },
    incomplete: { raw: 'need boards' }
  },
  {
    sectorId: 'clinic_reception',
    complete: {
      raw: '1 موعد كشف',
      approvals: [
        {
          productId: 'gp_visit',
          unitPrice: '25.000',
          adminId: 'desk',
          expiresAt: '2099-01-01T00:00:00.000Z'
        }
      ],
      availability: [{ productId: 'gp_visit', state: 'AVAILABLE' }],
      issue: true,
      actor: 'desk',
      rule: 'administrative_booking_only'
    },
    incomplete: { raw: 'أبغى موعد' }
  },
  {
    sectorId: 'pharmacy_inquiries',
    complete: {
      raw: '2 علبه فيتامين سي',
      approvals: [
        {
          productId: 'otc_vitc',
          unitPrice: '3.000',
          adminId: 'pharm',
          expiresAt: '2099-01-01T00:00:00.000Z'
        }
      ],
      availability: [{ productId: 'otc_vitc', state: 'AVAILABLE' }],
      issue: true,
      actor: 'pharm',
      rule: 'otc_admin_inquiry_not_rx'
    },
    incomplete: { raw: 'عندكم ادوية؟' }
  },
  {
    sectorId: 'cctv_installation',
    complete: {
      raw: '4 كاميرا 4mp عمان',
      approvals: [
        {
          productId: 'cam_4mp',
          unitPrice: '55.000',
          adminId: 'sec',
          expiresAt: '2099-01-01T00:00:00.000Z'
        }
      ],
      availability: [{ productId: 'cam_4mp', state: 'AVAILABLE' }],
      issue: true,
      actor: 'sec',
      rule: 'destination_required_for_install'
    },
    incomplete: { raw: 'كاميرات' }
  },
  {
    sectorId: 'general_business_services',
    complete: {
      raw: '3 hours consulting',
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
      actor: 'ops-1',
      rule: 'hourly_approval_overlay'
    },
    incomplete: { raw: 'hello' }
  }
];

describe('cross-industry acceptance matrix', () => {
  for (const row of MATRIX) {
    it(`${row.sectorId}: complete → quote + preview + verified`, () => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'msf-acc-'));
      const r = runDeskWorkflow({
        sectorId: row.sectorId,
        ...row.complete,
        tenantId: `t-${row.sectorId}`,
        storeDir: dir,
        waDigits: '962700000000',
        verify: { success: true }
      });
      assert.equal(r.assessment.mode, 'APPROVED_QUOTATION', row.sectorId);
      assert.ok(r.assessment.total, row.sectorId);
      assert.ok(r.assessment.totalMinor, row.sectorId);
      assert.ok(r.document.includes(r.assessment.total) || r.document.includes('TOTAL'));
      assert.equal(r.outbound.status, 'PREVIEW_ONLY');
      assert.equal(r.outbound.sent, false);
      assert.equal(r.verified.verified, true);
      assert.equal(r.verified.csat, 'unknown');
      assert.equal(r.claims.whatsapp_send, 'NOT_IMPLEMENTED');
      assert.ok(r.dashboard.mode === 'APPROVED_QUOTATION');
    });

    it(`${row.sectorId}: incomplete stays RFQ`, () => {
      const r = runDeskWorkflow({ sectorId: row.sectorId, ...row.incomplete });
      assert.equal(r.assessment.mode, 'INCOMPLETE_RFQ');
      assert.equal(r.assessment.total, null);
    });
  }

  it('clinic rejects clinical/prescribing content', () => {
    const r = runDeskWorkflow({
      sectorId: 'clinic_reception',
      raw: 'اكتب وصفة لارتفاع الضغط'
    });
    assert.equal(r.code, 'CLINICAL_CONTENT_REJECTED');
  });

  it('pharmacy rejects prescription language', () => {
    const r = runDeskWorkflow({
      sectorId: 'pharmacy_inquiries',
      raw: 'صرف prescription للمريض'
    });
    assert.equal(r.code, 'CLINICAL_CONTENT_REJECTED');
  });
});

describe('sector config switch without core logic change', () => {
  it('loads produce vs clinic JSON configs', () => {
    const produce = runDeskWorkflow({
      sectorConfig: path.join(__dirname, '../config/examples/wholesale_produce.sector.json'),
      raw: '2 طن خيار عمان'
    });
    const clinic = runDeskWorkflow({
      sectorConfig: path.join(__dirname, '../config/examples/clinic_reception.sector.json'),
      raw: '1 موعد كشف'
    });
    assert.equal(produce.sectorId, 'wholesale_produce_cfg');
    assert.equal(clinic.sectorId, 'clinic_reception_cfg');
    assert.equal(clinic.administrativeOnly, true);
    assert.notEqual(produce.sectorId, clinic.sectorId);
  });
});
