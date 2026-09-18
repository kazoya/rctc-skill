#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
function run(cmd) {
  console.log('>>', cmd);
  execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
}
run('node skill-factory/scripts/build-registry.js');
const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'registry', 'skills.json'), 'utf8'));
if (!reg.count || !reg.skills.length) throw new Error('registry empty');
run('node skill-factory/scripts/sf.js draft "Next.js accessibility review skill"');
run('node skill-factory/scripts/sf.js validate next-js-accessibility-review-skill');
run('node skill-factory/scripts/sf.js review next-js-accessibility-review-skill');
run('node skill-factory/scripts/sf.js package next-js-accessibility-review-skill');
run('node skill-factory/scripts/sf.js repo-ready next-js-accessibility-review-skill');
console.log('SMOKE OK');
