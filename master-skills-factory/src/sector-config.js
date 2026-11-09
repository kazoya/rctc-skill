'use strict';

const fs = require('fs');
const path = require('path');
const { loadSector } = require('./catalog');
const builtin = require('./sectors');

/**
 * Configuration-driven sector switch.
 * Core workflow stays unchanged; only the config object changes.
 */

const REQUIRED = [
  'id',
  'businessIdentity',
  'sectorType',
  'catalog',
  'units',
  'pricing',
  'messaging',
  'approvals',
  'escalation',
  'dashboard'
];

function compilePatterns(patterns) {
  if (!patterns) return undefined;
  return patterns.map((p) => {
    if (p.re instanceof RegExp) return p;
    return { re: new RegExp(p.re, p.flags || 'i'), unit: p.unit };
  });
}

function validateSectorConfig(cfg) {
  const missing = REQUIRED.filter((k) => cfg[k] == null);
  if (missing.length) {
    return { ok: false, code: 'CONFIG_INCOMPLETE', missing };
  }
  if (!cfg.catalog || !Array.isArray(cfg.catalog.products)) {
    return { ok: false, code: 'CATALOG_REQUIRED' };
  }
  if (cfg.clinicalDecisionsEnabled === true) {
    return { ok: false, code: 'CLINICAL_DECISIONS_FORBIDDEN' };
  }
  return { ok: true };
}

function configToSector(cfg) {
  const check = validateSectorConfig(cfg);
  if (!check.ok) {
    throw Object.assign(new Error(check.code), check);
  }
  return {
    id: cfg.id,
    label: cfg.businessIdentity.name,
    companyName: cfg.businessIdentity.name,
    requireDestination: !!cfg.catalog.requireDestination,
    destinations: cfg.catalog.destinations || [],
    products: cfg.catalog.products,
    priceBook: cfg.pricing.priceBook || [],
    currency: cfg.pricing.currency || 'JOD',
    taxBps: cfg.pricing.taxBps || 0,
    discountBps: cfg.pricing.discountBps || 0,
    deliveryMinor: cfg.pricing.deliveryMinor || 0,
    quantityPatterns: compilePatterns(cfg.units.quantityPatterns),
    administrativeOnly: cfg.administrativeOnly !== false &&
      (cfg.sectorType === 'clinic_reception' || cfg.sectorType === 'pharmacy_inquiries'
        ? true
        : !!cfg.administrativeOnly),
    messaging: cfg.messaging,
    approvalsRequired: cfg.approvals,
    escalation: cfg.escalation,
    dashboard: cfg.dashboard,
    inventory: cfg.inventory || { mode: 'none' },
    aiKnowledgeSources: cfg.aiKnowledgeSources || [],
    customFields: cfg.customFields || []
  };
}

function loadSectorConfig(source) {
  if (typeof source === 'string') {
    if (builtin[source]) {
      // Adapt built-in pack into config contract then back (stable switch API)
      return fromBuiltin(source);
    }
    const abs = path.isAbsolute(source) ? source : path.join(process.cwd(), source);
    const cfg = JSON.parse(fs.readFileSync(abs, 'utf8'));
    return configToSector(cfg);
  }
  return configToSector(source);
}

function fromBuiltin(sectorId) {
  const s = builtin[sectorId];
  if (!s) throw Object.assign(new Error('UNKNOWN_SECTOR'), { code: 'UNKNOWN_SECTOR' });
  const cfg = {
    id: sectorId,
    businessIdentity: { name: s.companyName || s.label, locale: 'ar-JO' },
    sectorType: sectorId,
    administrativeOnly:
      sectorId === 'clinic_reception' || sectorId === 'pharmacy_inquiries',
    catalog: {
      requireDestination: !!s.requireDestination,
      destinations: s.destinations || [],
      products: s.products
    },
    customFields: [],
    units: { quantityPatterns: s.quantityPatterns || null },
    pricing: {
      currency: s.currency || 'JOD',
      taxBps: s.taxBps || 0,
      discountBps: s.discountBps || 0,
      deliveryMinor: s.deliveryMinor || 0,
      priceBook: s.priceBook || []
    },
    inventory: { mode: 'manual_availability' },
    approvals: { requireExplicitIssueActor: true, marketIsNotSellPrice: true },
    messaging: {
      channels: ['whatsapp_preview'],
      sendImplemented: false
    },
    aiKnowledgeSources: ['synthetic_catalog_only'],
    escalation: { onIncompleteRfq: 'human_merchant', onPriceInjection: 'refuse' },
    dashboard: { roles: ['merchant', 'observer'], permissions: ['read_own_tenant'] },
    clinicalDecisionsEnabled: false
  };
  return configToSector(cfg);
}

function switchSector(sectorIdOrConfig) {
  const sector = loadSectorConfig(sectorIdOrConfig);
  // Ensure catalog alias index
  return loadSector(sector.id, { [sector.id]: sector });
}

module.exports = {
  validateSectorConfig,
  configToSector,
  loadSectorConfig,
  fromBuiltin,
  switchSector,
  REQUIRED
};
