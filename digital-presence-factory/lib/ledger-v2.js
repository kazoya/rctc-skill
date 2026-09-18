'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

function sha256File(p) {
  try {
    if (!fs.existsSync(p) || !fs.statSync(p).isFile()) return null;
    const h = crypto.createHash('sha256');
    h.update(fs.readFileSync(p));
    return h.digest('hex');
  } catch {
    return null;
  }
}

function sha256String(s) {
  return crypto.createHash('sha256').update(String(s)).digest('hex');
}

function gitSnap(repo) {
  try {
    const commit = execSync('git -C "' + repo + '" rev-parse HEAD', { encoding: 'utf8' }).trim();
    const dirty = execSync('git -C "' + repo + '" status --porcelain', { encoding: 'utf8' });
    return { commit, dirty: dirty.trim() !== '', dirty_summary: dirty.trim().split(/\n/).filter(Boolean).slice(0, 40) };
  } catch {
    return { commit: null, dirty: null, dirty_summary: [], unknown: true };
  }
}

function nowIso() {
  return new Date().toISOString();
}

function createLedgerV2(meta) {
  return {
    schema: 'rctc.execution-ledger.v2',
    created_at: nowIso(),
    engine_version: meta.engine_version || 'rctc-trust-kernel-v1',
    engine_hash: meta.engine_hash || null,
    meta: meta || {},
    provenance: {
      repository_root: meta.repository_root || null,
      commit_before: meta.commit_before || null,
      dirty_before: meta.dirty_before,
      commit_after: null,
      dirty_after: null,
    },
    steps: [],
    status: 'open',
    verified_claim: 'UNKNOWN',
    recipe_candidate: null,
  };
}

function appendStepV2(ledger, step) {
  const entry = {
    canonical_capability_id: step.canonical_capability_id || null,
    physical_adapter_id: step.physical_adapter_id || null,
    adapter_hash: step.adapter_hash || null,
    adapter_version: step.adapter_version || null,
    recipe_id: step.recipe_id || null,
    recipe_hash: step.recipe_hash || null,
    engine_version: ledger.engine_version,
    engine_hash: ledger.engine_hash,
    repository_root: step.repository_root || ledger.provenance.repository_root,
    stage: step.stage || null,
    input: step.input ?? null,
    output: step.output ?? null,
    duration_ms: step.duration_ms ?? null,
    status: step.status || 'unknown',
    evidence: step.evidence || [],
    files_changed: step.files_changed || [],
    artifact_hashes: step.artifact_hashes || {},
    permissions_granted: step.permissions_granted || null,
    owner_gates_invoked: step.owner_gates_invoked || [],
    verification: step.verification || null,
    verification_command: step.verification_command || null,
    verification_exit_code: step.verification_exit_code ?? null,
    next_step: step.next_step || null,
    side_effect_classification: step.side_effect_classification || null,
    started_at: step.started_at || null,
    ended_at: step.ended_at || nowIso(),
    notes: step.notes || null,
  };
  ledger.steps.push(entry);
  return entry;
}

function finalizeLedgerV2(ledger, repo) {
  const after = gitSnap(repo);
  ledger.provenance.commit_after = after.commit;
  ledger.provenance.dirty_after = after.dirty;
  ledger.provenance.dirty_after_summary = after.dirty_summary;
  const allOk = ledger.steps.every((s) => s.status === 'ok');
  ledger.status = allOk ? 'success' : 'stopped';
  // verified claim only if verify step passed with command+exit 0
  const verifySteps = ledger.steps.filter((s) => s.stage === 'verify');
  if (
    allOk &&
    verifySteps.length &&
    verifySteps.every((s) => s.verification && s.verification.ok === true)
  ) {
    ledger.verified_claim = 'EVIDENCE_PRESENT';
  } else if (allOk) {
    ledger.verified_claim = 'OK_WITHOUT_FULL_VERIFY_TRACE';
  } else {
    ledger.verified_claim = 'UNKNOWN';
  }
  ledger.closed_at = nowIso();
  return ledger;
}

function writeLedger(ledger, outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(ledger, null, 2));
  return outPath;
}

function hashFileOrNull(p) {
  return sha256File(p);
}

module.exports = {
  createLedgerV2,
  appendStepV2,
  finalizeLedgerV2,
  writeLedger,
  gitSnap,
  sha256File,
  sha256String,
  hashFileOrNull,
  nowIso,
};
