#!/usr/bin/env node
'use strict';
/**
 * bug-bounty-scope-guard
 * Validates declared authorization context. Does NOT scan targets.
 * Default when uncertain: INSUFFICIENT_SCOPE_EVIDENCE
 */
const fs = require('fs');
const path = require('path');

const DECISIONS = [
  'AUTHORIZED_FOR_DECLARED_ACTIVITY',
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

function loadInput(file) {
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  return raw;
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

  // Prefer local lab environments
  if (['localhost', 'local_lab', 'synthetic', 'ctf_demo', 'intentionally_vulnerable_lab'].includes(env)) {
    if (!activity || INTRUSIVE.some((k) => activity.includes(k) && !activity.includes('local'))) {
      // still allow local training if activity mentions local/lab
    }
    if (activity.includes('third-party production') || activity.includes('out of scope')) {
      return result('OUT_OF_SCOPE', ['Activity references production/out-of-scope'], input);
    }
    return result('USE_LOCAL_LAB', ['Environment is local/synthetic/CTF lab — proceed only in-lab'], input);
  }

  // Intrusive vocabulary without clear program evidence → stop
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

  // Ambiguity flags
  if (input.uncertainty === true || String(input.uncertainty || '').toLowerCase() === 'true') {
    return result('INSUFFICIENT_SCOPE_EVIDENCE', ['Caller set uncertainty=true → STOP/GAP'], input);
  }

  reasons.push('Declared fields assert asset listed and activity permitted with evidence present');
  return result('AUTHORIZED_FOR_DECLARED_ACTIVITY', reasons, input);
}

function result(decision, reasons, input) {
  const stop = decision !== 'AUTHORIZED_FOR_DECLARED_ACTIVITY' && decision !== 'USE_LOCAL_LAB';
  return {
    component: 'bug-bounty-scope-guard',
    decision,
    action: stop ? 'STOP' : decision === 'USE_LOCAL_LAB' ? 'PROCEED_IN_LAB_ONLY' : 'PROCEED_WITH_DECLARED_ACTIVITY_ONLY',
    status: stop ? 'GAP' : 'OK',
    reasons,
    side_effect_level: 'none',
    network: false,
    scanned: false,
    note: 'This guard does not scan targets. Official program policy overrides training material.',
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
  const input = loadInput(path.resolve(file));
  const out = decide(input);
  console.log(JSON.stringify(out, null, 2));
  if (out.status === 'GAP') process.exit(1);
  process.exit(0);
}

if (require.main === module) main();
module.exports = { decide, DECISIONS };
