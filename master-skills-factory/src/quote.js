'use strict';

/**
 * Quotation document modes:
 * - INCOMPLETE_RFQ: no grand total
 * - APPROVED_QUOTATION: snapshot with totals only when readyToIssue
 */

function buildAssessment({ parsed, validation, pricing, availability, issue = false, actor = null }) {
  const availMap = Object.fromEntries((availability || []).map((a) => [a.productId, a.state]));
  const availabilityRows = (parsed.lines || []).map((line) => ({
    productId: line.productId,
    state: availMap[line.productId] || 'UNKNOWN'
  }));
  const availOk = availabilityRows.every((r) => r.state === 'AVAILABLE' || r.state === 'LIMITED');
  const readyToIssue =
    !!issue &&
    validation.ok &&
    pricing.allSellable &&
    availOk &&
    !!actor &&
    !validation.codes.includes('PRICE_FROM_MESSAGE_REJECTED');

  let snapshot = null;
  let total = null;
  if (readyToIssue) {
    const lines = parsed.lines.map((line, i) => ({
      productId: line.productId,
      label: line.label,
      quantity: line.quantity,
      unit: line.unit,
      unitPrice: pricing.prices[i].unitPrice,
      lineTotal: pricing.prices[i].lineTotal
    }));
    total = lines.reduce((acc, l) => acc + Number(l.lineTotal || 0), 0).toFixed(3);
    snapshot = {
      version: 1,
      issuedAt: new Date().toISOString(),
      currency: 'JOD',
      destination: parsed.destination,
      lines,
      total,
      approvedBy: [...new Set(pricing.prices.map((p) => p.approvedBy).filter(Boolean))],
      freight: 'EXCLUDED',
      customs: 'EXCLUDED'
    };
  }

  return {
    sectorId: parsed.sectorId,
    mode: readyToIssue ? 'APPROVED_QUOTATION' : 'INCOMPLETE_RFQ',
    codes: validation.codes,
    messages: validation.messages,
    lines: parsed.lines,
    destination: parsed.destination,
    prices: pricing.prices,
    availability: availabilityRows,
    total: readyToIssue ? total : null,
    draftTotal: null,
    readyForMerchantReview: validation.readyForMerchantReview,
    readyToIssue,
    binding: readyToIssue,
    sent: false,
    modelUsed: false,
    marketUsedAsTodaysPrice: false,
    snapshot,
    evidence_class: readyToIssue ? 'synthetic_approved_quote' : 'incomplete_rfq'
  };
}

function renderQuoteText(assessment, company) {
  const title =
    assessment.mode === 'APPROVED_QUOTATION'
      ? 'Approved quotation (synthetic demo)'
      : 'Incomplete RFQ — no sell total';
  const lines = (assessment.lines || [])
    .map((l, i) => {
      const p = assessment.prices[i];
      const money =
        assessment.mode === 'APPROVED_QUOTATION'
          ? `${p.unitPrice} → ${p.lineTotal}`
          : `(${p.source})`;
      return `- ${l.label}: ${l.quantity || '?'} ${l.unit || ''} ${money}`;
    })
    .join('\n');
  const missing = (assessment.messages || []).map((m) => `* ${m.en}`).join('\n');
  return [
    `${company?.name || 'Demo Co'} — ${title}`,
    `Sector: ${assessment.sectorId}`,
    `Destination: ${assessment.destination || 'n/a'}`,
    lines,
    assessment.total ? `TOTAL: ${assessment.total}` : 'TOTAL: absent (not an approved sell quote)',
    missing ? `Gaps:\n${missing}` : 'Gaps: none listed',
    'Freight/customs excluded. Market reference is never today\'s sell price.'
  ].join('\n');
}

module.exports = { buildAssessment, renderQuoteText };
