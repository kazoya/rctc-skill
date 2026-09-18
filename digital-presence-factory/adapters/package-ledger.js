'use strict';
const path = require('path');
const { writeLedger, ledgerToRecipeCandidate } = require('../lib/ledger');

function run(input) {
  const started = Date.now();
  const ledger = input.ledger;
  const outDir = input.out_dir;
  const ledgerPath = path.join(outDir, 'execution-ledger.json');
  writeLedger(ledger, ledgerPath);
  const candidate = ledgerToRecipeCandidate(ledger);
  const candPath = path.join(outDir, 'recipe-candidate.json');
  require('fs').writeFileSync(candPath, JSON.stringify(candidate, null, 2));
  ledger.recipe_candidate = candidate;
  writeLedger(ledger, ledgerPath);
  return {
    status: 'ok',
    duration_ms: Date.now() - started,
    output: { ledgerPath, candPath, candidate },
    evidence: [{ kind: 'artifact', path: ledgerPath }, { kind: 'artifact', path: candPath }],
    files_changed: [ledgerPath, candPath],
    side_effect_classification: 'local-artifact',
    verification: { ok: true, checks: ['ledger written', 'recipe candidate drafted'] },
    next_step: 'Owner review; promote only after Validate→Review→Test→approval',
  };
}

module.exports = { id: 'adapter.package-ledger', run };
