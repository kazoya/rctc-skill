'use strict';

/**
 * WhatsApp / channel PREVIEW only.
 * Builds wa.me deep links. Does NOT send. Does NOT claim gateway production readiness.
 * Phone digits must be injected by the host; public demos use placeholders.
 */

function buildPreviewMessage(assessment, labels = {}) {
  const intro = labels.intro || 'Trade desk preview (not sent):';
  const lines = (assessment.lines || []).map(
    (l) => `- ${l.label}: ${l.quantity || '?'} ${l.unit || ''}`
  );
  const mode =
    assessment.mode === 'APPROVED_QUOTATION'
      ? `APPROVED total ${assessment.total}`
      : 'INCOMPLETE_RFQ — no sell total';
  return [intro, mode, ...lines, 'This message was generated locally. Send=false.'].join('\n');
}

function buildWhatsAppPreviewUrl(text, waDigits) {
  if (!waDigits || !/^\d{8,15}$/.test(String(waDigits))) {
    return {
      ok: false,
      code: 'WA_DIGITS_REQUIRED',
      status: 'NOT_IMPLEMENTED_FOR_SEND',
      url: null,
      sent: false
    };
  }
  return {
    ok: true,
    status: 'PREVIEW_ONLY',
    url: `https://wa.me/${waDigits}?text=${encodeURIComponent(text)}`,
    sent: false,
    evidence_class: 'deep_link_preview'
  };
}

module.exports = { buildPreviewMessage, buildWhatsAppPreviewUrl };
