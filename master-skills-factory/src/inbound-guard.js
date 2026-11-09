'use strict';

/**
 * Inbound gateway + guarded automatic response.
 * Synthetic only. Auto-reply is acknowledgment / clarification — never invents sell prices.
 */

function guardInbound(event, assessment) {
  const text = String(event?.text || '');
  const blocked = [];
  if (/ignore previous|تجاهل التعليمات/i.test(text)) blocked.push('PROMPT_INJECTION');
  if (/ضع السعر|set price\s*\d/i.test(text)) blocked.push('PRICE_INJECTION');

  if (blocked.length) {
    return {
      action: 'refuse_auto_price',
      mayAutoRespond: true,
      reply:
        'Received. Prices are set only by an approved merchant desk — not from chat instructions.',
      blocked,
      sent: false,
      verified: false
    };
  }

  if (!assessment || assessment.mode !== 'APPROVED_QUOTATION') {
    const gaps = (assessment?.messages || []).slice(0, 3).map((m) => m.en).join('; ');
    return {
      action: 'ask_clarification',
      mayAutoRespond: true,
      reply: `Received your request. It is still an incomplete RFQ. ${gaps || 'Please complete missing fields.'}`,
      blocked: [],
      sent: false,
      verified: false
    };
  }

  return {
    action: 'ack_approved_quote_reference',
    mayAutoRespond: true,
    reply: `Your approved quotation total ${assessment.total} is on file (synthetic). A human confirms dispatch.`,
    blocked: [],
    sent: false,
    verified: false
  };
}

function verifyOutcome(pre, actual) {
  if (!pre) return { ok: false, code: 'MISSING_PRE' };
  if (actual == null || actual.success == null) {
    return { ok: true, csat: 'unknown', verified: true, note: 'CSAT stays unknown without explicit feedback' };
  }
  return {
    ok: true,
    verified: true,
    success: !!actual.success,
    csat: actual.csat == null ? 'unknown' : actual.csat,
    matchesExpectation: pre.readyToIssue === true ? !!actual.success : true
  };
}

module.exports = { guardInbound, verifyOutcome };
