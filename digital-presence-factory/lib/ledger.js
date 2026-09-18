'use strict';
const fs = require('fs');
const path = require('path');

function nowIso() {
  return new Date().toISOString();
}

function createLedger(meta) {
  return {
    schema: 'rctc.execution-ledger.v1',
    created_at: nowIso(),
    meta: meta || {},
    steps: [],
    status: 'open',
    recipe_candidate: null,
  };
}

function appendStep(ledger, step) {
  const entry = {
    skill_or_capability_id: step.skill_or_capability_id || step.id || null,
    input: step.input ?? null,
    output: step.output ?? null,
    duration_ms: step.duration_ms ?? null,
    status: step.status || 'unknown',
    evidence: step.evidence || [],
    files_changed: step.files_changed || [],
    side_effect_classification: step.side_effect_classification || 'none',
    verification: step.verification || null,
    next_step: step.next_step || null,
    stage: step.stage || null,
    started_at: step.started_at || null,
    ended_at: step.ended_at || nowIso(),
    notes: step.notes || null,
  };
  ledger.steps.push(entry);
  return entry;
}

function closeLedger(ledger, status) {
  ledger.status = status || 'closed';
  ledger.closed_at = nowIso();
  return ledger;
}

/**
 * After successful run: ledger → recipe candidate (not auto skill).
 */
function ledgerToRecipeCandidate(ledger) {
  const skills = [];
  for (const s of ledger.steps) {
    if (s.skill_or_capability_id && s.status === 'ok') {
      if (!skills.includes(s.skill_or_capability_id)) skills.push(s.skill_or_capability_id);
    }
  }
  return {
    kind: 'recipe_candidate',
    status: 'draft',
    derived_from_ledger: true,
    created_at: nowIso(),
    compose: skills,
    stages_observed: ledger.steps.map((s) => s.stage).filter(Boolean),
    promotion_gate: [
      'Validate',
      'Review',
      'Test',
      'Owner approval',
      'Publish',
    ],
    note: 'Pattern must recur before Candidate Skill. Never auto-publish.',
    source_meta: ledger.meta || {},
  };
}

function writeLedger(ledger, outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(ledger, null, 2), 'utf8');
  return outPath;
}

module.exports = {
  createLedger,
  appendStep,
  closeLedger,
  ledgerToRecipeCandidate,
  writeLedger,
  nowIso,
};
