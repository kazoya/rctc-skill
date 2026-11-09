'use strict';

const { buildMoneyBreakdown, parseToMinor, formatMinor } = require('./money');

/**
 * Pricing guardrails.
 * Market / list references are NEVER sell prices until an approval overlay exists.
 * Message-embedded prices are rejected (Saqr: PRICE_FROM_MESSAGE_REJECTED).
 * Sell totals use integer minor units.
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
        unitPriceMinor: null,
        sellable: false
      };
    }
    const minor = parseToMinor(approval.unitPrice, approval.scale ?? 3);
    return {
      source: 'APPROVED_PRICE',
      unitPrice: formatMinor(minor, approval.scale ?? 3),
      unitPriceMinor: minor.toString(),
      sellable: true,
      approvedBy: approval.adminId,
      scale: approval.scale ?? 3
    };
  }
  const row = (book || []).find((b) => b.productId === productId);
  if (row && row.marketMin != null) {
    return {
      source: 'MARKET_REFERENCE',
      unitPrice: null,
      unitPriceMinor: null,
      marketMin: row.marketMin,
      marketMax: row.marketMax ?? row.marketMin,
      sellable: false
    };
  }
  return { source: 'PRICE_UNAVAILABLE', unitPrice: null, unitPriceMinor: null, sellable: false };
}

function priceInquiry(parsed, sector, opts = {}) {
  const book = opts.book || sector.priceBook || [];
  const approvals = opts.approvals || [];
  const now = opts.now || new Date();
  const currency = opts.currency || sector.currency || 'JOD';
  const taxBps = opts.taxBps ?? sector.taxBps ?? 0;
  const discountBps = opts.discountBps ?? sector.discountBps ?? 0;
  const deliveryMinor = BigInt(opts.deliveryMinor ?? sector.deliveryMinor ?? 0);

  const prices = (parsed.lines || []).map((line, index) => {
    const resolved = resolveLinePrice(line.productId, book, approvals, now);
    if (!(resolved.sellable && resolved.unitPrice != null && line.quantity)) {
      return {
        productId: line.productId,
        ...resolved,
        lineTotal: null,
        lineTotalMinor: null,
        money: null
      };
    }
    const deliveryShare = index === 0 ? deliveryMinor : 0n;
    const money = buildMoneyBreakdown({
      unitPrice: resolved.unitPrice,
      quantity: line.quantity,
      currency,
      scale: resolved.scale ?? 3,
      taxBps,
      discountBps,
      deliveryMinor: deliveryShare
    });
    return {
      productId: line.productId,
      ...resolved,
      lineTotal: money.total,
      lineTotalMinor: money.totalMinor,
      money
    };
  });
  const allSellable = prices.length > 0 && prices.every((p) => p.sellable);
  return {
    prices,
    allSellable,
    marketUsedAsTodaysPrice: false,
    currency,
    taxBps,
    discountBps,
    deliveryMinor: deliveryMinor.toString()
  };
}

module.exports = { resolveLinePrice, priceInquiry };
