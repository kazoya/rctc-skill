'use strict';

/**
 * Sector catalog configuration — transferable from Saqr trade-desk SPECS pattern.
 * Public RCTC catalogs are synthetic. Never embed live customer price books here.
 */

function normalizeText(value) {
  return String(value || '')
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[ً-ْـ]/g, '')
    .replace(/[^\S\n]+/g, ' ')
    .trim()
    .toLowerCase();
}

function loadSector(sectorId, sectors) {
  const sector = sectors[sectorId];
  if (!sector) {
    throw Object.assign(new Error(`unknown sector: ${sectorId}`), { code: 'UNKNOWN_SECTOR' });
  }
  return {
    id: sectorId,
    ...sector,
    aliasIndex: buildAliasIndex(sector.products || [])
  };
}

function buildAliasIndex(products) {
  const rows = [];
  for (const product of products) {
    for (const alias of product.aliases || [product.id]) {
      rows.push({ alias: normalizeText(alias), product });
    }
  }
  return rows.sort((a, b) => b.alias.length - a.alias.length);
}

function findProduct(sector, clause) {
  const text = normalizeText(clause);
  const hit = sector.aliasIndex.find((row) => text.includes(row.alias));
  return hit ? hit.product : null;
}

module.exports = {
  normalizeText,
  loadSector,
  buildAliasIndex,
  findProduct
};
