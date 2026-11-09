'use strict';

const { normalizeText, findProduct } = require('./catalog');

function splitClauses(text) {
  return text
    .split(/[،,\n؛;]+/)
    .flatMap((part) => part.split(/\s+(?:and|و)\s+/i))
    .map((part) => part.trim())
    .filter(Boolean);
}

function readQuantity(clause, quantityPatterns) {
  const patterns = quantityPatterns || [
    { re: /(\d+(?:[.,]\d+)?)\s*(طن|اطنان|tonnes?)/i, unit: 'tonne' },
    { re: /(\d+(?:[.,]\d+)?)\s*(كغ|كيلو|كغم|kg)/i, unit: 'kg' },
    { re: /(\d+(?:[.,]\d+)?)\s*(قطعه|قطعة|pcs?|units?)/i, unit: 'unit' },
    { re: /(\d+(?:[.,]\d+)?)\s*(علبه|علبة|box(?:es)?)/i, unit: 'box' },
    { re: /(\d+(?:[.,]\d+)?)\s*(كاميرا|cameras?)/i, unit: 'camera' },
    { re: /(\d+(?:[.,]\d+)?)\s*(موعد|جلسه|جلسة|visits?)/i, unit: 'visit' }
  ];
  for (const p of patterns) {
    const m = clause.match(p.re);
    if (m) {
      const quantity = m[1].replace(',', '.');
      const amount = Number(quantity);
      if (!Number.isFinite(amount) || amount <= 0) return { code: 'INVALID_QUANTITY' };
      return { quantity, unit: p.unit };
    }
  }
  if (/شاحن|truck|container/i.test(clause)) return { code: 'UNIT_CONVERSION_REQUIRED' };
  return { code: 'MISSING_QUANTITY' };
}

/**
 * Parse a free-text inquiry against a configured sector catalog.
 */
function parseInquiry(raw, sector) {
  const text = normalizeText(raw);
  const issues = [];
  if (/ignore previous|تجاهل التعليمات|تجاوز السياسه/i.test(String(raw))) {
    issues.push({
      code: 'PROMPT_IGNORED',
      ar: 'تعليمات داخل الرسالة لا تغيّر السعر ولا الصلاحيات.',
      en: 'Instructions inside the message do not change price or permissions.'
    });
  }
  if (/ضع السعر|set price|السعر\s*\d/i.test(String(raw))) {
    issues.push({
      code: 'PRICE_FROM_MESSAGE_REJECTED',
      ar: 'السعر المكتوب داخل الرسالة لا يُعتمد.',
      en: 'A price written inside the message is not approved.'
    });
  }

  const lines = [];
  for (const clause of splitClauses(String(raw))) {
    const product = findProduct(sector, clause);
    if (!product) continue;
    const qty = readQuantity(clause, sector.quantityPatterns);
    const line = {
      productId: product.id,
      label: product.label,
      family: product.family || sector.id,
      complete: product.complete !== false,
      requiredAttrs: product.requiredAttrs || [],
      quantity: 'quantity' in qty ? qty.quantity : null,
      unit: 'quantity' in qty ? qty.unit : null,
      attrs: detectAttrs(clause, product)
    };
    lines.push(line);
    if ('code' in qty) {
      issues.push({
        code: qty.code,
        ar:
          qty.code === 'UNIT_CONVERSION_REQUIRED'
            ? 'وحدة القياس لا تتحول تلقائياً.'
            : qty.code === 'INVALID_QUANTITY'
              ? 'الكمية غير صالحة.'
              : 'الكمية غير مذكورة.',
        en: qty.code
      });
    }
  }

  if (lines.length === 0) {
    issues.push({
      code: 'PRODUCT_UNRECOGNIZED',
      ar: 'لم أتعرف على منتج من الكتالوج.',
      en: 'No catalog product was recognized.'
    });
  }

  return {
    raw: String(raw),
    sectorId: sector.id,
    destination: detectDestination(String(raw), sector.destinations || []),
    lines,
    issues
  };
}

function detectAttrs(clause, product) {
  const attrs = {};
  for (const attr of product.attrHints || []) {
    if (normalizeText(clause).includes(normalizeText(attr.value))) {
      attrs[attr.key] = attr.value;
    }
  }
  return attrs;
}

function detectDestination(raw, destinations) {
  const text = normalizeText(raw);
  for (const d of destinations) {
    if (text.includes(normalizeText(d.match))) return d.label;
  }
  return null;
}

module.exports = { parseInquiry, readQuantity, splitClauses };
