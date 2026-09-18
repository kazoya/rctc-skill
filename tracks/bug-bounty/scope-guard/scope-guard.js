#!/usr/bin/env node
'use strict';
/**
 * bug-bounty-scope-guard
 * Validates learner-DECLARED authorization context only.
 * Does NOT independently verify HackerOne / YesWeHack / Intigriti (or any) authorization.
 * Does NOT scan targets.
 * Default when uncertain: INSUFFICIENT_SCOPE_EVIDENCE
 */
const fs = require('fs');
const path = require('path');

const DECISIONS = [
  'DECLARED_SCOPE_CONTEXT_ACCEPTED',
  'INSUFFICIENT_SCOPE_EVIDENCE',
  'OUT_OF_SCOPE',
  'USE_LOCAL_LAB',
];

const INTRUSIVE = [
  'exploit',
  'payload chain',
  'brute',
  'credential stuffing',
  'phishing',
  'dos',
  'denial of service',
  'persistence',
  'malware',
  'evasion',
  'stealth',
  'mass scan',
  'sqli attack',
  'rce against production',
];

const DECLARATION_DISCLAIMER =
  'This decision validates the supplied declaration only. It does not create or independently verify legal authorization. Official program scope and rules remain authoritative.';

function loadInput(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function decide(input) {
  const reasons = [];
  const program = String(input.program_platform || '').trim();
  const url = String(input.program_url || '').trim();
  const asset = String(input.asset || '').trim();
  const claimed = String(input.claimed_scope || '').trim();
  const activity = String(input.intended_activity || '').trim().toLowerCase();
  const evidence = String(input.authorization_evidence || '').trim();
  const env = String(input.environment || '').trim().toLowerCase();

  if (['localhost', 'local_lab', 'synthetic', 'ctf_demo', 'intentionally_vulnerable_lab'].includes(env)) {
    if (activity.includes('third-party production') || activity.includes('out of scope')) {
      return result('OUT_OF_SCOPE', ['Activity references production/out-of-scope'], input);
    }
    return result('USE_LOCAL_LAB', ['Environment is local/synthetic/CTF lab — proceed only in-lab'], input);
  }

  if (INTRUSIVE.some((k) => activity.includes(k))) {
    if (!evidence || evidence.length < 20) {
      return result('INSUFFICIENT_SCOPE_EVIDENCE', ['Intrusive activity without strong authorization evidence'], input);
    }
  }

  if (!program || !asset || !activity) {
    return result('INSUFFICIENT_SCOPE_EVIDENCE', ['Missing program_platform, asset, or intended_activity'], input);
  }

  if (!evidence || evidence.length < 24) {
    return result('INSUFFICIENT_SCOPE_EVIDENCE', ['authorization_evidence too weak or empty — default deny'], input);
  }

  if (!url && !String(input.written_engagement || '').trim()) {
    return result('INSUFFICIENT_SCOPE_EVIDENCE', ['Need program_url or written_engagement'], input);
  }

  if (claimed.toLowerCase().includes('out of scope') || claimed.toLowerCase().includes('out-of-scope')) {
    return result('OUT_OF_SCOPE', ['claimed_scope indicates out of scope'], input);
  }

  if (String(input.asset_explicitly_listed || '').toLowerCase() === 'false') {
    return result('OUT_OF_SCOPE', ['asset_explicitly_listed=false'], input);
  }

  if (String(input.asset_explicitly_listed || '').toLowerCase() !== 'true') {
    return result('INSUFFICIENT_SCOPE_EVIDENCE', ['asset_explicitly_listed must be true|false — unset means uncertain'], input);
  }

  if (String(input.activity_explicitly_permitted || '').toLowerCase() !== 'true') {
    return result('INSUFFICIENT_SCOPE_EVIDENCE', ['activity_explicitly_permitted not true'], input);
  }

  if (input.uncertainty === true || String(input.uncertainty || '').toLowerCase() === 'true') {
    return result('INSUFFICIENT_SCOPE_EVIDENCE', ['Caller set uncertainty=true → STOP/GAP'], input);
  }

  reasons.push('Supplied declaration is internally consistent (asset listed + activity permitted + evidence text present)');
  reasons.push('RCTC did not independently verify program authorization');
  return result('DECLARED_SCOPE_CONTEXT_ACCEPTED', reasons, input);
}

function result(decision, reasons, input) {
  const stop = decision !== 'DECLARED_SCOPE_CONTEXT_ACCEPTED' && decision !== 'USE_LOCAL_LAB';
  const isDeclared = decision === 'DECLARED_SCOPE_CONTEXT_ACCEPTED';
  return {
    component: 'bug-bounty-scope-guard',
    decision,
    action: stop
      ? 'STOP'
      : decision === 'USE_LOCAL_LAB'
        ? 'PROCEED_IN_LAB_ONLY'
        : 'PROCEED_ONLY_IF_HUMAN_CONFIRMS_LIVE_SCOPE',
    status: stop ? 'GAP' : 'OK',
    reasons,
    authorization_verified_by_rctc: false,
    human_confirmation_required_for_live_target: isDeclared ? true : decision === 'USE_LOCAL_LAB' ? false : true,
    side_effect_level: 'none',
    network: false,
    scanned: false,
    note: DECLARATION_DISCLAIMER,
    echo: {
      program_platform: input.program_platform || null,
      asset: input.asset || null,
      intended_activity: input.intended_activity || null,
    },
  };
}

function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node scope-guard.js <authorization-context.json>');
    process.exit(2);
  }
  const out = decide(loadInput(path.resolve(file)));
  console.log(JSON.stringify(out, null, 2));
  if (out.status === 'GAP') process.exit(1);
  process.exit(0);
}

if (require.main === module) main();
module.exports = { decide, DECISIONS, DECLARATION_DISCLAIMER };
