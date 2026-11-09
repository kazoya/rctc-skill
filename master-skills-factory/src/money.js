'use strict';

/**
 * Integer minor-unit money (fils/cents). Avoid float sell math.
 * Display strings are derived; storage/compute uses BigInt minors.
 */

function parseToMinor(value, scale = 3) {
  const s = String(value ?? '').trim();
  if (!/^\d+(\.\d+)?$/.test(s)) {
    throw Object.assign(new Error(`invalid money: ${value}`), { code: 'INVALID_MONEY' });
  }
  const [whole, frac = ''] = s.split('.');
  const padded = (frac + '0'.repeat(scale)).slice(0, scale);
  return BigInt(whole) * 10n ** BigInt(scale) + BigInt(padded || '0');
}

function formatMinor(minor, scale = 3) {
  const neg = minor < 0n;
  const v = neg ? -minor : minor;
  const base = 10n ** BigInt(scale);
  const whole = v / base;
  const frac = (v % base).toString().padStart(scale, '0');
  return `${neg ? '-' : ''}${whole}.${frac}`;
}

function mulQty(unitMinor, quantity, qtyScale = 3) {
  const q = parseToMinor(quantity, qtyScale);
  // unitMinor * quantity / 10^qtyScale
  return (unitMinor * q) / 10n ** BigInt(qtyScale);
}

function applyTax(netMinor, taxBps) {
  const bps = BigInt(taxBps || 0);
  return (netMinor * bps) / 10000n;
}

function applyDiscount(netMinor, discountBps) {
  const bps = BigInt(discountBps || 0);
  return (netMinor * bps) / 10000n;
}

function buildMoneyBreakdown({
  unitPrice,
  quantity,
  currency = 'JOD',
  scale = 3,
  taxBps = 0,
  discountBps = 0,
  deliveryMinor = 0n
}) {
  const unitMinor = parseToMinor(unitPrice, scale);
  const lineNet = mulQty(unitMinor, quantity, scale);
  const discount = applyDiscount(lineNet, discountBps);
  const afterDiscount = lineNet - discount;
  const tax = applyTax(afterDiscount, taxBps);
  const total = afterDiscount + tax + BigInt(deliveryMinor);
  return {
    currency,
    scale,
    unitPriceMinor: unitMinor.toString(),
    lineNetMinor: lineNet.toString(),
    discountMinor: discount.toString(),
    taxMinor: tax.toString(),
    deliveryMinor: BigInt(deliveryMinor).toString(),
    totalMinor: total.toString(),
    unitPrice: formatMinor(unitMinor, scale),
    lineNet: formatMinor(lineNet, scale),
    discount: formatMinor(discount, scale),
    tax: formatMinor(tax, scale),
    delivery: formatMinor(BigInt(deliveryMinor), scale),
    total: formatMinor(total, scale),
    taxBps,
    discountBps
  };
}

module.exports = {
  parseToMinor,
  formatMinor,
  mulQty,
  applyTax,
  applyDiscount,
  buildMoneyBreakdown
};
