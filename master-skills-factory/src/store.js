'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const SCHEMA_VERSION = 2;

function emptyDesk() {
  return { schemaVersion: SCHEMA_VERSION, cases: [], availability: [], approvals: [] };
}

function contentHash(raw) {
  return crypto.createHash('sha256').update(String(raw).trim()).digest('hex');
}

function migrateDesk(data) {
  const current = data && typeof data === 'object' ? data : emptyDesk();
  const from = current.schemaVersion || 1;
  const steps = [];
  let next = { ...current };
  if (!next.cases) next.cases = [];
  if (!next.availability) next.availability = [];
  if (!next.approvals) next.approvals = [];
  if (from < 2) {
    steps.push({ from: 1, to: 2, change: 'add schemaVersion field' });
    next = { ...next, schemaVersion: 2 };
  }
  next.schemaVersion = SCHEMA_VERSION;
  return {
    data: next,
    migratedFrom: from,
    steps,
    reversible: true,
    reverseNote: 'Drop schemaVersion to restore v1 shape; cases/approvals/availability unchanged.'
  };
}

function openStore(dir) {
  if (!dir) return { persisted: false, code: 'PERSISTENCE_UNAVAILABLE', data: emptyDesk() };
  try {
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, 'store.json');
    if (!fs.existsSync(file)) return { persisted: true, code: null, data: emptyDesk() };
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    const migrated = migrateDesk(raw);
    return { persisted: true, code: null, data: migrated.data, migration: migrated };
  } catch {
    return { persisted: false, code: 'PERSISTENCE_UNAVAILABLE', data: emptyDesk() };
  }
}

function saveStore(dir, data) {
  if (!dir) return { persisted: false, code: 'PERSISTENCE_UNAVAILABLE' };
  try {
    fs.mkdirSync(dir, { recursive: true });
    const payload = { ...data, schemaVersion: SCHEMA_VERSION };
    fs.writeFileSync(path.join(dir, 'store.json'), JSON.stringify(payload, null, 2));
    return { persisted: true, code: null };
  } catch {
    return { persisted: false, code: 'PERSISTENCE_UNAVAILABLE' };
  }
}

function assertActor(actorTenant, tenantId) {
  if (!actorTenant || actorTenant !== tenantId) {
    return { ok: false, code: 'FORBIDDEN' };
  }
  return { ok: true };
}

function readCase(data, tenantId, reference, actorTenant) {
  const auth = assertActor(actorTenant, tenantId);
  if (!auth.ok) return auth;
  const found = data.cases.find((c) => c.tenantId === tenantId && c.reference === reference);
  if (!found) return { ok: false, code: 'NOT_FOUND' };
  return { ok: true, data: found };
}

/**
 * Idempotent submit: same tenant + content hash returns existing record without rewrite.
 */
function submitCase(data, input) {
  const auth = assertActor(input.actorTenant || input.tenantId, input.tenantId);
  if (!auth.ok) return { ok: false, code: 'FORBIDDEN' };

  const hash = contentHash(input.raw);
  const existing = data.cases.find((c) => c.tenantId === input.tenantId && c.hash === hash);
  if (existing && !input.forceNew) {
    return { data, record: existing, duplicate: true, idempotentReplay: true };
  }

  const reference = input.reference || `RFQ-${hash.slice(0, 8).toUpperCase()}`;
  const record = {
    tenantId: input.tenantId,
    reference,
    hash,
    raw: input.raw,
    assessment: input.assessment,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const next = {
    ...data,
    schemaVersion: SCHEMA_VERSION,
    cases: [...data.cases.filter((c) => !(c.tenantId === input.tenantId && c.reference === reference)), record]
  };
  return { data: next, record, duplicate: false, idempotentReplay: false };
}

module.exports = {
  SCHEMA_VERSION,
  emptyDesk,
  contentHash,
  migrateDesk,
  openStore,
  saveStore,
  readCase,
  submitCase,
  assertActor
};
