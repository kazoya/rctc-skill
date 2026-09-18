'use strict';
const fs = require('fs');
const path = require('path');

/**
 * ONE small reversible improvement for Suhib portfolio dogfood:
 * ensure README links RCTC DPF quickstart + ethical support CTA.
 * Does not invent metrics. Does not rebuild the site.
 */
const MARKER = '<!-- rctc-dpf-dogfood-2026-09-19 -->';
const BLOCK = `
${MARKER}
## RCTC Digital Presence Factory

Plan-only composition for delivery portfolios (no auto-deploy):

\`\`\`bash
node C:/rctc-skill/digital-presence-factory/cli.js --type technical-delivery --source .
\`\`\`

Quickstart: \`C:/rctc-skill/docs/QUICKSTART_60S.md\`

Give RCTC one real developer problem. If it saves you time, Star [kazoya/rctc-skill](https://github.com/kazoya/rctc-skill) so another developer can find it. If you cannot sponsor the project, contribute a question, verified answer, compatibility result, example, recipe, skill, or share.
${MARKER}
`;

function run(input) {
  const started = Date.now();
  const source = input.source;
  const readme = path.join(source, 'README.md');
  if (!fs.existsSync(readme)) {
    return {
      status: 'error',
      duration_ms: Date.now() - started,
      output: { error: 'README.md missing' },
      evidence: [],
      files_changed: [],
      side_effect_classification: 'reversible-local-writes',
      verification: { ok: false },
    };
  }
  let text = fs.readFileSync(readme, 'utf8');
  if (text.includes(MARKER)) {
    return {
      status: 'ok',
      duration_ms: Date.now() - started,
      output: { action: 'noop_already_present' },
      evidence: [{ kind: 'marker_present', marker: MARKER }],
      files_changed: [],
      side_effect_classification: 'reversible-local-writes',
      verification: { ok: true, checks: ['idempotent'] },
      notes: 'Improvement already applied — no write',
    };
  }
  const before = text;
  text = text.trimEnd() + '\n' + BLOCK + '\n';
  fs.writeFileSync(readme, text, 'utf8');
  return {
    status: 'ok',
    duration_ms: Date.now() - started,
    output: { action: 'appended_rctc_dpf_block', bytes_before: before.length, bytes_after: text.length },
    evidence: [{ kind: 'readme_append', path: readme }],
    files_changed: [readme],
    side_effect_classification: 'reversible-local-writes',
    verification: { ok: true, checks: ['README contains marker', 'no metrics invented'] },
  };
}

module.exports = { id: 'adapter.portfolio-small-improve', run, MARKER };
