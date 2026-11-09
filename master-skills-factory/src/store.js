'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function emptyDesk() {
  return { cases: [], availability: [], approvals: [] };
}

function contentHash(raw) {
  return crypto.createHash('sha256').update(String(raw).trim()).digest('hex');
}

function openStore(dir) {
  if (!dir) return { persisted: false, code: 'PERSISTENCE_UNAVAILABLE', data: emptyDesk() };
  try {
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, 'store.json');
    if (!fs.existsSync(file)) return { persisted: true, code: null, data: emptyDesk() };
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    return { persisted: true, code: null, data };
  } catch {
    return { persisted: false, code: 'PERSISTENCE_UNAVAILABLE', data: emptyDesk() };
  }
}

function saveStore(dir, data) {
  if (!dir) return { persisted: false, code: 'PERSISTENCE_UNAVAILABLE' };
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'store.json'), JSON.stringify(data, null, 2));
    return { persisted: true, code: null };
  } catch {
    return { persisted: false, code: 'PERSISTENCE_UNAVAILABLE' };
  }
}

function readCase(data, tenantId, reference, actorTenant) {
  if (actorTenant !== tenantId) return { ok: false, code: 'FORBIDDEN' };
  const found = data.cases.find((c) => c.tenantId === tenantId && c.reference === reference);
  if (!found) return { ok: false, code: 'NOT_FOUND' };
  return { ok: true, data: found };
}

function submitCase(data, input) {
  const hash = contentHash(input.raw);
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
    cases: [...data.cases.filter((c) => !(c.tenantId === input.tenantId && c.reference === reference)), record]
  };
  return { data: next, record };
}

module.exports = { emptyDesk, contentHash, openStore, saveStore, readCase, submitCase };
