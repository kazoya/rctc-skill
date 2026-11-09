'use strict';

const { parseInquiry } = require('./parse');
const { validateParsed } = require('./validate');
const { priceInquiry } = require('./pricing');
const { buildAssessment, renderQuoteText } = require('./quote');
const { openStore, saveStore, submitCase, readCase } = require('./store');
const { buildPreviewMessage, buildWhatsAppPreviewUrl } = require('./outbound-preview');
const { guardInbound, verifyOutcome } = require('./inbound-guard');
const { switchSector } = require('./sector-config');
const { createMessagingAdapter } = require('./adapters/messaging-mock');
const { projectDashboard } = require('./adapters/dashboard-mock');
const sectors = require('./sectors');

/**
 * End-to-end portable desk workflow:
 * catalog → choices → validation → pricing → quotation → store → preview → inbound guard → verified result
 */
function runDeskWorkflow(input) {
  const sector = switchSector(input.sectorConfig || input.sectorId);
  const parsed = parseInquiry(input.raw, sector);
  if (input.destination) parsed.destination = input.destination;
  parsed.administrativeOnly = !!sector.administrativeOnly;

  if (
    sector.administrativeOnly &&
    /prescribe|prescription|تشخيص|وصفه|وصفة|جرعه|جرعة/i.test(input.raw)
  ) {
    return {
      sectorId: sector.id,
      ok: false,
      code: 'CLINICAL_CONTENT_REJECTED',
      claims: { whatsapp_send: 'NOT_IMPLEMENTED', production_gateway: 'NOT_IMPLEMENTED' },
      assessment: {
        mode: 'INCOMPLETE_RFQ',
        messages: [
          {
            code: 'CLINICAL_CONTENT_REJECTED',
            en: 'Clinical/prescribing content is rejected. Administrative workflows only.',
            ar: 'يُرفض المحتوى السريري أو الوصفات. المسار إداري فقط.'
          }
        ]
      }
    };
  }

  const validation = validateParsed(parsed, sector, {
    statedTotal: input.statedTotal,
    destination: input.destination
  });
  const pricing = priceInquiry(parsed, sector, {
    book: input.book,
    approvals: input.approvals,
    now: input.now,
    taxBps: input.taxBps,
    discountBps: input.discountBps,
    deliveryMinor: input.deliveryMinor
  });
  const assessment = buildAssessment({
    parsed,
    validation,
    pricing,
    availability: input.availability,
    issue: !!input.issue,
    actor: input.actor || null
  });

  let persistence = { persisted: false, reference: null, duplicate: false };
  if (input.storeDir && input.tenantId) {
    const opened = openStore(input.storeDir);
    const submitted = submitCase(opened.data, {
      tenantId: input.tenantId,
      actorTenant: input.actorTenant || input.tenantId,
      raw: input.raw,
      reference: input.reference,
      assessment
    });
    if (submitted.ok === false) {
      persistence = { persisted: false, code: submitted.code };
    } else {
      const saved = saveStore(input.storeDir, submitted.data);
      persistence = {
        persisted: saved.persisted,
        reference: submitted.record.reference,
        code: saved.code,
        duplicate: !!submitted.duplicate,
        idempotentReplay: !!submitted.idempotentReplay
      };
    }
  }

  const previewText = buildPreviewMessage(assessment);
  const wa = buildWhatsAppPreviewUrl(previewText, input.waDigits || null);
  const messaging = createMessagingAdapter({ mode: 'preview_only' });
  const inbound = guardInbound({ text: input.raw }, assessment);
  const verified = input.verify
    ? verifyOutcome(assessment, input.verify)
    : { ok: true, csat: 'unknown', verified: false, note: 'verification not requested' };
  const dashboard = projectDashboard(assessment, persistence);

  return {
    ok: true,
    sectorId: sector.id,
    sectorLabel: sector.label,
    administrativeOnly: !!sector.administrativeOnly,
    parsed,
    validation,
    pricing,
    assessment,
    document: renderQuoteText(assessment, { name: sector.companyName || sector.label }),
    persistence,
    dashboard,
    outbound: wa,
    messagingAdapter: { mode: messaging.mode, status: messaging.status },
    inbound,
    verified,
    pipeline: [
      'catalog',
      'parse',
      'validate',
      'pricing',
      'quotation',
      'database',
      'dashboard',
      'whatsapp_preview',
      'inbound_guard',
      'policy_guard',
      'verified_result'
    ],
    claims: {
      whatsapp_send: 'NOT_IMPLEMENTED',
      production_gateway: 'NOT_IMPLEMENTED',
      production_database: 'NOT_IMPLEMENTED',
      live_customer_data: false,
      prototype: true
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
  switchSector
};
