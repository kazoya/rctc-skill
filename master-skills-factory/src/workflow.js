'use strict';

const { loadSector } = require('./catalog');
const { parseInquiry } = require('./parse');
const { validateParsed } = require('./validate');
const { priceInquiry } = require('./pricing');
const { buildAssessment, renderQuoteText } = require('./quote');
const { openStore, saveStore, submitCase, readCase } = require('./store');
const { buildPreviewMessage, buildWhatsAppPreviewUrl } = require('./outbound-preview');
const { guardInbound, verifyOutcome } = require('./inbound-guard');
const sectors = require('./sectors');

/**
 * End-to-end portable desk workflow:
 * catalog → choices → validation → pricing → quotation → store → preview → inbound guard → verified result
 */
function runDeskWorkflow(input) {
  const sector = loadSector(input.sectorId, sectors);
  const parsed = parseInquiry(input.raw, sector);
  if (input.destination) parsed.destination = input.destination;
  const validation = validateParsed(parsed, sector, {
    statedTotal: input.statedTotal,
    destination: input.destination
  });
  const pricing = priceInquiry(parsed, sector, {
    book: input.book,
    approvals: input.approvals,
    now: input.now
  });
  const assessment = buildAssessment({
    parsed,
    validation,
    pricing,
    availability: input.availability,
    issue: !!input.issue,
    actor: input.actor || null
  });

  let persistence = { persisted: false, reference: null };
  if (input.storeDir && input.tenantId) {
    const opened = openStore(input.storeDir);
    const submitted = submitCase(opened.data, {
      tenantId: input.tenantId,
      raw: input.raw,
      reference: input.reference,
      assessment
    });
    const saved = saveStore(input.storeDir, submitted.data);
    persistence = {
      persisted: saved.persisted,
      reference: submitted.record.reference,
      code: saved.code
    };
  }

  const previewText = buildPreviewMessage(assessment);
  const wa = buildWhatsAppPreviewUrl(previewText, input.waDigits || null);
  const inbound = guardInbound({ text: input.raw }, assessment);
  const verified = input.verify
    ? verifyOutcome(assessment, input.verify)
    : { ok: true, csat: 'unknown', verified: false, note: 'verification not requested' };

  return {
    sectorId: sector.id,
    parsed,
    validation,
    pricing,
    assessment,
    document: renderQuoteText(assessment, { name: sector.companyName || sector.label }),
    persistence,
    outbound: wa,
    inbound,
    verified,
    pipeline: [
      'catalog',
      'parse',
      'validate',
      'pricing',
      'quotation',
      'database',
      'dashboard_text',
      'whatsapp_preview',
      'inbound_guard',
      'verified_result'
    ],
    claims: {
      whatsapp_send: 'NOT_IMPLEMENTED',
      production_gateway: 'NOT_IMPLEMENTED',
      live_customer_data: false
    }
  };
}

function tenantIsolationCheck(storeDir, tenantA, tenantB, reference) {
  const opened = openStore(storeDir);
  const a = readCase(opened.data, tenantA, reference, tenantA);
  const b = readCase(opened.data, tenantA, reference, tenantB);
  return { ownerRead: a.ok === true, crossTenant: b.ok === false && b.code === 'FORBIDDEN' };
}

module.exports = {
  runDeskWorkflow,
  tenantIsolationCheck,
  sectors,
  loadSector
};
