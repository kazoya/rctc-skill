#!/usr/bin/env node
/**
 * Fixture tests for repo integrity gates.
 * Uses temporary git repos under scripts/integrity/_tmp/ — never mutates the real tree.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '../..');
const VALIDATE = path.join(REPO_ROOT, 'scripts', 'validate-repo.js');
const GENERATE = path.join(REPO_ROOT, 'scripts', 'generate-canonical-registry.js');
const TMP_ROOT = path.join(__dirname, '_tmp');

function rmrf(p) {
  fs.rmSync(p, { recursive: true, force: true });
}

function write(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}

function git(cwd, args) {
  execSync(`git ${args}`, { cwd, stdio: 'pipe' });
}

function initRepo(name) {
  const dir = path.join(TMP_ROOT, name);
  rmrf(dir);
  fs.mkdirSync(dir, { recursive: true });
  git(dir, 'init');
  git(dir, 'config user.email test@example.com');
  git(dir, 'config user.name test');
  // copy scripts + package scaffolding
  fs.mkdirSync(path.join(dir, 'scripts'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'registry'), { recursive: true });
  fs.copyFileSync(VALIDATE, path.join(dir, 'scripts', 'validate-repo.js'));
  fs.copyFileSync(GENERATE, path.join(dir, 'scripts', 'generate-canonical-registry.js'));
  write(
    path.join(dir, 'package.json'),
    JSON.stringify(
      {
        name: 'fixture',
        private: true,
        scripts: {
          'validate:repo': 'node scripts/validate-repo.js',
          'registry:generate': 'node scripts/generate-canonical-registry.js',
        },
      },
      null,
      2
    )
  );
  write(
    path.join(dir, 'registry', 'TRACKED_OUTPUT_ALLOWLIST.txt'),
    '# empty allowlist for fixtures\n'
  );
  return dir;
}

function skillMd(name, desc, body) {
  return `---\nname: ${name}\ndescription: ${desc}\n---\n\n${body}\n`;
}

function runNode(cwd, script, args = []) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd,
    encoding: 'utf8',
  });
}

function expectFail(label, result, needle) {
  if (result.status === 0) {
    throw new Error(`${label}: expected failure, got PASS\n${result.stdout}\n${result.stderr}`);
  }
  const blob = `${result.stdout}\n${result.stderr}`;
  if (needle && !blob.includes(needle)) {
    throw new Error(`${label}: expected output to include ${needle}\n${blob}`);
  }
  console.log(`PASS ${label} (failed as expected)`);
}

function expectPass(label, result) {
  if (result.status !== 0) {
    throw new Error(`${label}: expected PASS\n${result.stdout}\n${result.stderr}`);
  }
  console.log(`PASS ${label}`);
}

function commitAll(dir, msg) {
  git(dir, 'add -A');
  git(dir, `commit -m "${msg}"`);
}

// --- cases ---

function case1_conflict() {
  const dir = initRepo('01-conflict');
  write(path.join(dir, 'demo-skill', 'SKILL.md'), skillMd('demo-skill', 'demo', 'ok'));
  write(
    path.join(dir, 'demo-skill', 'NOTES.md'),
    '<<<<<<< HEAD\nold\n=======\nnew\n>>>>>>> branch\n'
  );
  write(path.join(dir, 'registry', 'canonical.json'), JSON.stringify({ schema: 'rctc.canonical-registry.v1', capabilities: [] }));
  commitAll(dir, 'init');
  // generate proper registry then inject conflict and re-validate without regenerating conflict file
  runNode(dir, path.join(dir, 'scripts', 'generate-canonical-registry.js'));
  git(dir, 'add -A');
  git(dir, 'commit -m "reg" || true');
  const r = runNode(dir, path.join(dir, 'scripts', 'validate-repo.js'));
  expectFail('1 conflict marker', r, 'conflict_markers');
}

function case2_broken_ref() {
  const dir = initRepo('02-broken-ref');
  write(
    path.join(dir, 'demo-skill', 'SKILL.md'),
    skillMd('demo-skill', 'demo', 'See [missing](REQUIRED_SIBLING.md) for protocol.')
  );
  commitAll(dir, 'init');
  runNode(dir, path.join(dir, 'scripts', 'generate-canonical-registry.js'));
  git(dir, 'add registry');
  git(dir, 'commit -m "reg"');
  const r = runNode(dir, path.join(dir, 'scripts', 'validate-repo.js'));
  expectFail('2 broken referenced file', r, 'missing_referenced_file');
}

function case3_dead_registry_path() {
  const dir = initRepo('03-dead-path');
  write(path.join(dir, 'demo-skill', 'SKILL.md'), skillMd('demo-skill', 'demo', 'body'));
  commitAll(dir, 'init');
  runNode(dir, path.join(dir, 'scripts', 'generate-canonical-registry.js'));
  const reg = JSON.parse(fs.readFileSync(path.join(dir, 'registry', 'canonical.json'), 'utf8'));
  reg.capabilities[0].installations.push({
    installation_id: 'demo-skill::99',
    path: '.cursor/skills/demo-skill/SKILL.md',
    folder: '.cursor/skills/demo-skill',
    kind: 'host_install',
    description_snippet: 'fake',
  });
  reg.capabilities[0].installation_count = reg.capabilities[0].installations.length;
  fs.writeFileSync(path.join(dir, 'registry', 'canonical.json'), JSON.stringify(reg, null, 2));
  git(dir, 'add registry');
  git(dir, 'commit -m "poison"');
  const r = runNode(dir, path.join(dir, 'scripts', 'validate-repo.js'));
  expectFail('3 dead registry path', r, 'dead_registry_path');
}

function case4_unregistered() {
  const dir = initRepo('04-unregistered');
  write(path.join(dir, 'demo-skill', 'SKILL.md'), skillMd('demo-skill', 'demo', 'body'));
  write(path.join(dir, 'other-skill', 'SKILL.md'), skillMd('other-skill', 'other', 'body'));
  commitAll(dir, 'init');
  runNode(dir, path.join(dir, 'scripts', 'generate-canonical-registry.js'));
  const reg = JSON.parse(fs.readFileSync(path.join(dir, 'registry', 'canonical.json'), 'utf8'));
  reg.capabilities = reg.capabilities.filter((c) => c.canonical_id !== 'other-skill');
  fs.writeFileSync(path.join(dir, 'registry', 'canonical.json'), JSON.stringify(reg, null, 2));
  git(dir, 'add registry');
  git(dir, 'commit -m "drop"');
  const r = runNode(dir, path.join(dir, 'scripts', 'validate-repo.js'));
  expectFail('4 unregistered tracked skill', r, 'unregistered_tracked_skill');
}

function case5_duplicate() {
  const dir = initRepo('05-duplicate');
  const body = skillMd('dup-skill', 'same body', 'identical content here');
  write(path.join(dir, 'dup-skill', 'SKILL.md'), body);
  write(path.join(dir, 'dup_skill', 'SKILL.md'), body.replace('name: dup-skill', 'name: dup_skill'));
  // make bodies byte-identical
  const identical = skillMd('dup-skill', 'same body', 'identical content here');
  write(path.join(dir, 'dup-skill', 'SKILL.md'), identical);
  write(path.join(dir, 'nested', 'skills', 'dup-skill', 'SKILL.md'), identical);
  commitAll(dir, 'init');
  runNode(dir, path.join(dir, 'scripts', 'generate-canonical-registry.js'));
  git(dir, 'add registry');
  git(dir, 'commit -m "reg"');
  const r = runNode(dir, path.join(dir, 'scripts', 'validate-repo.js'));
  // duplicates are warnings — validate may PASS; check warning present
  const blob = `${r.stdout}\n${r.stderr}`;
  if (!blob.includes('exact_duplicate_skill_bodies')) {
    throw new Error(`5 duplicate: expected warning exact_duplicate_skill_bodies\n${blob}`);
  }
  console.log('PASS 5 byte-identical duplicate detected (warning)');
}

function case6_slug_mismatch() {
  const dir = initRepo('06-slug');
  write(
    path.join(dir, 'folder-a', 'SKILL.md'),
    skillMd('totally-different-slug', 'desc', 'body only')
  );
  commitAll(dir, 'init');
  runNode(dir, path.join(dir, 'scripts', 'generate-canonical-registry.js'));
  git(dir, 'add registry');
  git(dir, 'commit -m "reg"');
  const r = runNode(dir, path.join(dir, 'scripts', 'validate-repo.js'));
  const blob = `${r.stdout}\n${r.stderr}`;
  if (!blob.includes('slug_folder_mismatch')) {
    throw new Error(`6 slug mismatch: expected warning\n${blob}`);
  }
  console.log('PASS 6 slug/path mismatch reported (warning)');
}

function case7_unexpected_generated() {
  const dir = initRepo('07-generated');
  write(path.join(dir, 'demo-skill', 'SKILL.md'), skillMd('demo-skill', 'demo', 'body'));
  write(path.join(dir, 'out', 'junk.txt'), 'should not be tracked');
  commitAll(dir, 'init');
  runNode(dir, path.join(dir, 'scripts', 'generate-canonical-registry.js'));
  git(dir, 'add registry');
  git(dir, 'commit -m "reg"');
  const r = runNode(dir, path.join(dir, 'scripts', 'validate-repo.js'));
  expectFail('7 unexpected tracked generated', r, 'unexpected_tracked_generated');
}

function case8_clean() {
  const dir = initRepo('08-clean');
  write(
    path.join(dir, 'demo-skill', 'SKILL.md'),
    skillMd('demo-skill', 'a clean skill', 'No broken refs.')
  );
  write(path.join(dir, 'demo-skill', 'HELPER.md'), 'helper');
  // optional intentional ref
  write(
    path.join(dir, 'demo-skill', 'SKILL.md'),
    skillMd('demo-skill', 'a clean skill', 'See [helper](HELPER.md).')
  );
  commitAll(dir, 'init');
  const gen = runNode(dir, path.join(dir, 'scripts', 'generate-canonical-registry.js'));
  expectPass('8a generate', gen);
  git(dir, 'add registry');
  git(dir, 'commit -m "reg"');
  const r = runNode(dir, path.join(dir, 'scripts', 'validate-repo.js'));
  expectPass('8 clean repository passes', r);
  const chk = runNode(dir, path.join(dir, 'scripts', 'generate-canonical-registry.js'), ['--check']);
  expectPass('8b registry:check', chk);
}

function main() {
  rmrf(TMP_ROOT);
  fs.mkdirSync(TMP_ROOT, { recursive: true });
  const cases = [
    case1_conflict,
    case2_broken_ref,
    case3_dead_registry_path,
    case4_unregistered,
    case5_duplicate,
    case6_slug_mismatch,
    case7_unexpected_generated,
    case8_clean,
  ];
  let failed = 0;
  for (const fn of cases) {
    try {
      fn();
    } catch (e) {
      failed++;
      console.error(`FAIL ${fn.name}: ${e.message}`);
    }
  }
  console.log(`\nFixture summary: ${cases.length - failed}/${cases.length} passed`);
  if (failed) process.exit(1);
}

main();
