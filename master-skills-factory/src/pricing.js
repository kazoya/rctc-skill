'use strict';

/**
 * Pricing guardrails.
 * Market / list references are NEVER sell prices until an approval overlay exists.
 * Message-embedded prices are rejected (Saqr: PRICE_FROM_MESSAGE_REJECTED).
 */

function resolveLinePrice(productId, book, approvals, now = new Date()) {
  const approval = [...(approvals || [])]
    .reverse()
    .find((a) => a.productId === productId && a.adminId);
  if (approval) {
    if (approval.expiresAt && now.getTime() > Date.parse(approval.expiresAt)) {
      return {
        source: 'EXPIRED_APPROVED_PRICE',
        unitPrice: null,
        sellable: false
      };
    }
    return {
      source: 'APPROVED_PRICE',
      unitPrice: approval.unitPrice,
      sellable: true,
      approvedBy: approval.adminId
    };
  }
  const row = (book || []).find((b) => b.productId === productId);
  if (row && row.marketMin != null) {
    return {
      source: 'MARKET_REFERENCE',
      unitPrice: null,
      marketMin: row.marketMin,
      marketMax: row.marketMax ?? row.marketMin,
      sellable: false
    };
  }
  return { source: 'PRICE_UNAVAILABLE', unitPrice: null, sellable: false };
}

function priceInquiry(parsed, sector, opts = {}) {
  const book = opts.book || sector.priceBook || [];
  const approvals = opts.approvals || [];
  const now = opts.now || new Date();
  const prices = (parsed.lines || []).map((line) => {
    const resolved = resolveLinePrice(line.productId, book, approvals, now);
    let lineTotal = null;
    if (resolved.sellable && resolved.unitPrice != null && line.quantity) {
      lineTotal = (Number(resolved.unitPrice) * Number(line.quantity)).toFixed(3);
    }
    return {
      productId: line.productId,
      ...resolved,
      lineTotal
    };
  });
  const allSellable = prices.length > 0 && prices.every((p) => p.sellable);
  return { prices, allSellable, marketUsedAsTodaysPrice: false };
}

module.exports = { resolveLinePrice, priceInquiry };
