'use strict';
const path = require('path');
const fs = require('fs');
const { writeLedger, finalizeLedgerV2 } = require('../lib/ledger-v2');

function ledgerToRecipeCandidate(ledger) {
  const skills = [];
  for (const s of ledger.steps || []) {
    if (s.canonical_capability_id && s.status === 'ok' && !skills.includes(s.canonical_capability_id)) {
      skills.push(s.canonical_capability_id);
    }
  }
  return {
    kind: 'recipe_candidate',
    status: 'draft',
    derived_from_ledger: true,
    ledger_schema: ledger.schema,
    compose_canonical: skills,
    stages_observed: (ledger.steps || []).map((s) => s.stage).filter(Boolean),
    promotion_gate: ['Validate', 'Review', 'Test', 'Owner approval', 'Publish'],
    note: 'Pattern must recur before Candidate Skill. Never auto-publish.',
  };
}

function run(input) {
  const started = Date.now();
  const ledger = input.ledger;
  const outDir = input.out_dir;
  fs.mkdirSync(outDir, { recursive: true });
  finalizeLedgerV2(ledger, input.source || ledger.provenance.repository_root);
  const ledgerPath = path.join(outDir, 'execution-ledger.v2.json');
  writeLedger(ledger, ledgerPath);
  const candidate = ledgerToRecipeCandidate(ledger);
  const candPath = path.join(outDir, 'recipe-candidate.json');
  fs.writeFileSync(candPath, JSON.stringify(candidate, null, 2));
  ledger.recipe_candidate = candidate;
  writeLedger(ledger, ledgerPath);
  return {
    status: 'ok',
    duration_ms: Date.now() - started,
    output: { ledgerPath, candPath, verified_claim: ledger.verified_claim },
    evidence: [{ kind: 'artifact', path: ledgerPath }],
    files_changed: [ledgerPath, candPath],
    side_effect_classification: 'local-artifact',
    verification: { ok: true, checks: ['ledger v2 written'] },
    next_step: 'Owner review before any public verified claim',
  };
}

module.exports = { id: 'adapter.package-ledger', run };
