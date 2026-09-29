#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const requiredFiles = [
  'en/00-ethics-authorization-and-scope.md',
  'en/01-safe-recon-and-scope-analysis.md',
  'en/02-vulnerability-reasoning-labs.md',
  'en/03-report-writing.md',
  'en/04-triage-and-responsible-disclosure.md',
  'en/05-platform-workflows.md',
  'ar/00-ethics-authorization-and-scope.md',
  'ar/01-safe-recon-and-scope-analysis.md',
  'ar/02-vulnerability-reasoning-labs.md',
  'ar/03-report-writing.md',
  'ar/04-triage-and-responsible-disclosure.md',
  'ar/05-platform-workflows.md',
  'SAFETY_MODEL.md',
  'README.md',
  'pro/README.md',
];

const forbidden = [
  new RegExp(['how to bypass waf', ' on production'].join(''), 'i'),
  new RegExp(['credential theft', ' tutorial'].join(''), 'i'),
  new RegExp(['phishing', ' kit'].join(''), 'i'),
  new RegExp(['persistence', ' implant'].join(''), 'i'),
  new RegExp(['ddos', ' script'].join(''), 'i'),
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN (RSA |OPENSSH )?PRIVATE KEY-----/,
  new RegExp(['api', '[_-]?', 'key', '\\s*=\\s*[\'\"][a-zA-Z0-9]{20,}'].join(''), 'i'),
];

const claimAuth = [
  new RegExp(['we tested on hackerone', ' and confirmed payout'].join(''), 'i'),
  new RegExp(['authorized on yeswehack production', ' without evidence'].join(''), 'i'),
];

let failed = 0;
function fail(msg) {
  console.error('FAIL', msg);
  failed++;
}

for (const rel of requiredFiles) {
  if (!fs.existsSync(path.join(ROOT, rel))) fail('missing ' + rel);
}

// Pro lesson bodies must NOT be in the public MIT tree
for (const banned of [
  'pro/mentor-presubmit-checklist.md',
  'pro/annotated-report-sample.md',
  'pro/expanded-lab-narratives.md',
]) {
  if (fs.existsSync(path.join(ROOT, banned))) fail('supporter-only Pro lesson body must not be public: ' + banned);
}

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = path.relative(ROOT, full).replace(/\\/g, '/');
    if (fs.statSync(full).isDirectory()) {
      if (name === 'node_modules') continue;
      walk(full, out);
    } else if (/\.(md|json|html)$/i.test(name)) {
      out.push(full);
    } else if (/\.js$/i.test(name) && !rel.endsWith('scripts/validate-track.js')) {
      out.push(full);
    }
  }
  return out;
}

const files = walk(ROOT);
let authHits = 0;
let scopeHits = 0;
let discHits = 0;
for (const f of files) {
  const text = fs.readFileSync(f, 'utf8');
  if (/authoriz|تفويض|مصرّح/i.test(text)) authHits++;
  if (/scope|نطاق/i.test(text)) scopeHits++;
  if (/responsible disclosure|إفصاح مسؤول/i.test(text)) discHits++;
  if (/AUTHORIZED_FOR_DECLARED_ACTIVITY/.test(text)) {
    fail('legacy decision name still present in ' + path.relative(ROOT, f));
  }
  for (const re of forbidden) {
    if (re.test(text)) fail('forbidden pattern in ' + path.relative(ROOT, f));
  }
  for (const re of claimAuth) {
    if (re.test(text)) fail('unsupported authorization claim in ' + path.relative(ROOT, f));
  }
}

if (authHits < 3) fail('insufficient authorization language across track');
if (scopeHits < 3) fail('insufficient scope guidance');
if (discHits < 1) fail('missing responsible disclosure language');

const { decide } = require('../scope-guard/scope-guard.js');
const badJ = JSON.parse(fs.readFileSync(path.join(ROOT, 'fixtures/invalid/uncertain-live-target.json'), 'utf8'));
if (badJ.uncertainty !== true) fail('invalid fixture must set uncertainty true');
const invalidDecision = decide(badJ);
if (invalidDecision.decision === 'DECLARED_SCOPE_CONTEXT_ACCEPTED') {
  fail('scope guard must not accept uncertain live target declaration');
}
if (
  invalidDecision.decision !== 'INSUFFICIENT_SCOPE_EVIDENCE' &&
  invalidDecision.decision !== 'OUT_OF_SCOPE'
) {
  fail('uncertain live target should be INSUFFICIENT or OUT_OF_SCOPE, got ' + invalidDecision.decision);
}
if (invalidDecision.authorization_verified_by_rctc !== false) {
  fail('uncertain fixture must keep authorization_verified_by_rctc=false');
}

const good = decide(
  JSON.parse(fs.readFileSync(path.join(ROOT, 'fixtures/valid/local-lab-context.json'), 'utf8'))
);
if (good.decision !== 'USE_LOCAL_LAB') fail('local lab fixture expected USE_LOCAL_LAB');
if (good.authorization_verified_by_rctc !== false) fail('local lab must not claim RCTC authorization verification');

const oos = decide(
  JSON.parse(fs.readFileSync(path.join(ROOT, 'fixtures/invalid/out-of-scope-claim.json'), 'utf8'))
);
if (oos.decision !== 'OUT_OF_SCOPE') fail('out-of-scope fixture expected OUT_OF_SCOPE');

const declared = decide(
  JSON.parse(fs.readFileSync(path.join(ROOT, 'fixtures/valid/declared-program-context.json'), 'utf8'))
);
if (declared.decision !== 'DECLARED_SCOPE_CONTEXT_ACCEPTED') {
  fail('declared live-target fixture expected DECLARED_SCOPE_CONTEXT_ACCEPTED, got ' + declared.decision);
}
if (declared.authorization_verified_by_rctc !== false) {
  fail('declared fixture must set authorization_verified_by_rctc=false');
}
if (declared.human_confirmation_required_for_live_target !== true) {
  fail('declared fixture must require human confirmation for live target');
}
if (!/validates the supplied declaration only/i.test(String(declared.note || ''))) {
  fail('declared fixture note must state declaration-only validation');
}

if (failed) {
  console.error('VALIDATOR_FAILED', failed);
  process.exit(1);
}
console.log('TRACK_VALIDATOR_PASS', {
  files: files.length,
  authHits,
  scopeHits,
  discHits,
  declared_decision: declared.decision,
  authorization_verified_by_rctc: declared.authorization_verified_by_rctc,
});
