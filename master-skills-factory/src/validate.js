'use strict';

/**
 * Validation / readiness gates — Saqr review patterns without private rules IP.
 */

function validateParsed(parsed, sector, opts = {}) {
  const codes = [];
  const messages = [...(parsed.issues || [])];
  const push = (code, ar, en) => {
    if (codes.includes(code) && messages.some((m) => m.code === code)) return;
    codes.push(code);
    messages.push({ code, ar, en });
  };

  for (const line of parsed.lines || []) {
    if (!line.complete) {
      push('PRODUCT_INCOMPLETE', 'الصنف غير مكتمل المواصفات.', 'Product specification is incomplete.');
    }
    for (const req of line.requiredAttrs || []) {
      if (!line.attrs || line.attrs[req] == null) {
        push(
          `ATTR_MISSING_${req.toUpperCase()}`,
          `خاصية مطلوبة ناقصة: ${req}`,
          `Required attribute missing: ${req}`
        );
      }
    }
    if (!line.quantity || !line.unit) {
      push('INVALID_QUANTITY', 'الكمية غير صالحة.', 'Quantity is invalid.');
    }
  }

  if (sector.requireDestination && !parsed.destination && !opts.destination) {
    push('DESTINATION_MISSING', 'الوجهة غير مذكورة.', 'Destination is missing.');
  }

  // Quantity reconciliation when stated total disagrees with line sum (dates-style)
  if (opts.statedTotal != null && parsed.lines.length) {
    const sum = parsed.lines.reduce((acc, l) => acc + Number(l.quantity || 0), 0);
    if (Math.abs(sum - Number(opts.statedTotal)) > 1e-6) {
      push(
        'QUANTITY_RECONCILIATION_REQUIRED',
        'هناك اختلاف بين الكمية الإجمالية وتفاصيل الأصناف.',
        'Stated total disagrees with line quantities.'
      );
    }
  }

  const blocking = messages.filter((m) => m.code !== 'PROMPT_IGNORED');
  return {
    ok: blocking.every((m) => !isHardBlock(m.code)),
    readyForMerchantReview: parsed.lines.length > 0,
    codes: [...new Set(messages.map((m) => m.code))],
    messages
  };
}

function isHardBlock(code) {
  return [
    'PRODUCT_UNRECOGNIZED',
    'INVALID_QUANTITY',
    'UNIT_CONVERSION_REQUIRED',
    'QUANTITY_RECONCILIATION_REQUIRED',
    'DESTINATION_MISSING',
    'PRODUCT_INCOMPLETE'
  ].some((c) => code === c || code.startsWith('ATTR_MISSING_'));
}

module.exports = { validateParsed, isHardBlock };
