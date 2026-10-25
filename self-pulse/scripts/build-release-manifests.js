'use strict';

/**
 * Builds file manifests + local ZIP checksums.
 * Premium archives are written ONLY under master/files (never into rctc-skill).
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execSync } = require('node:child_process');
const os = require('node:os');

const FREE_ROOT = path.resolve(__dirname, '..');
const PREM_ROOT = path.resolve('C:/master/files/self-pulse-agensi-premium');
const ARTIFACTS = path.resolve('C:/master/files/self-pulse-release-artifacts');

function walk(dir, base = dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === 'release' || ent.name === '.git') continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(full, base));
    else out.push(path.relative(base, full).replace(/\\/g, '/'));
  }
  return out.sort();
}

function sha256File(p) {
  return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}

function manifestFor(root, name) {
  const files = walk(root);
  return {
    package: name,
    generatedAt: new Date().toISOString(),
    root,
    fileCount: files.length,
    files: files.map((rel) => ({
      path: rel,
      sha256: sha256File(path.join(root, rel)),
      bytes: fs.statSync(path.join(root, rel)).size
    }))
  };
}

function stageCopy(srcRoot) {
  const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'sp-stage-'));
  for (const rel of walk(srcRoot)) {
    const dest = path.join(stage, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(srcRoot, rel), dest);
  }
  return stage;
}

fs.mkdirSync(ARTIFACTS, { recursive: true });

const freeMan = manifestFor(FREE_ROOT, 'self-pulse-free');
const premMan = manifestFor(PREM_ROOT, 'self-pulse-agensi-premium');
fs.writeFileSync(path.join(ARTIFACTS, 'FREE_ZIP_MANIFEST.json'), `${JSON.stringify(freeMan, null, 2)}\n`);
fs.writeFileSync(path.join(ARTIFACTS, 'PREMIUM_ZIP_MANIFEST.json'), `${JSON.stringify(premMan, null, 2)}\n`);

const freeZip = path.join(ARTIFACTS, 'self-pulse-free-0.1.0.zip');
const premZip = path.join(ARTIFACTS, 'self-pulse-agensi-premium-0.1.0-private.zip');
for (const z of [freeZip, premZip]) if (fs.existsSync(z)) fs.unlinkSync(z);

const freeStage = stageCopy(FREE_ROOT);
const premStage = stageCopy(PREM_ROOT);
execSync(
  `powershell -NoProfile -Command "Compress-Archive -Path '${freeStage}\\*' -DestinationPath '${freeZip}' -Force"`,
  { stdio: 'inherit' }
);
execSync(
  `powershell -NoProfile -Command "Compress-Archive -Path '${premStage}\\*' -DestinationPath '${premZip}' -Force"`,
  { stdio: 'inherit' }
);

const archiveChecksums = {
  generatedAt: new Date().toISOString(),
  artifactsRoot: ARTIFACTS,
  archives: [
    {
      file: 'self-pulse-free-0.1.0.zip',
      sha256: sha256File(freeZip),
      bytes: fs.statSync(freeZip).size,
      edition: 'free',
      fileManifest: 'FREE_ZIP_MANIFEST.json'
    },
    {
      file: 'self-pulse-agensi-premium-0.1.0-private.zip',
      sha256: sha256File(premZip),
      bytes: fs.statSync(premZip).size,
      edition: 'premium-private',
      fileManifest: 'PREMIUM_ZIP_MANIFEST.json',
      publishInMitRepo: false
    }
  ],
  suggestedLaunchPriceUsdMonthly: 29,
  priceStatus: 'pending_owner_approval'
};

fs.writeFileSync(
  path.join(ARTIFACTS, 'ARCHIVE_SHA256.json'),
  `${JSON.stringify(archiveChecksums, null, 2)}\n`
);
// Pointer only inside free skill (no binary)
fs.writeFileSync(
  path.join(FREE_ROOT, 'docs', 'RELEASE_ARTIFACTS_POINTER.md'),
  `# Release artifacts\n\nLocal checksums & ZIPs (not auto-published):\n\n\`${ARTIFACTS}\`\n\nSee \`ARCHIVE_SHA256.json\` there.\n`
);

console.log(JSON.stringify(archiveChecksums, null, 2));
