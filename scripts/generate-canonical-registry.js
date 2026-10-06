#!/usr/bin/env node
/**
 * Generate registry/canonical.json from git ls-files ONLY.
 * Authoritative input for shipped content: `git ls-files`.
 * Do not hand-edit registry/canonical.json — run: npm run registry:generate
 *
 * Flags:
 *   --check   generate in memory and compare to committed file; exit 1 on drift
 *   --stdout  print JSON to stdout instead of writing
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const OUT_CANONICAL = path.join(ROOT, 'registry', 'canonical.json');
const OUT_REPORT = path.join(ROOT, 'registry', 'CANONICAL_VALIDATION_REPORT.json');
const OUT_CATALOG = path.join(ROOT, 'skills', 'CATALOG.md');
const ALLOWLIST_PATH = path.join(ROOT, 'registry', 'TRACKED_OUTPUT_ALLOWLIST.txt');

const CHECK = process.argv.includes('--check');
const STDOUT = process.argv.includes('--stdout');

function gitLsFiles() {
  const out = execSync('git ls-files -z', { cwd: ROOT, encoding: 'buffer' });
  const parts = out.toString('utf8').split('\0').filter(Boolean);
  return parts.map((p) => p.replace(/\\/g, '/'));
}

function readFrontmatter(filePath) {
  const abs = path.join(ROOT, filePath);
  if (!fs.existsSync(abs)) return { ok: false, error: 'missing_file' };
  const text = fs.readFileSync(abs, 'utf8').replace(/\r\n/g, '\n');
  if (!text.startsWith('---')) return { ok: false, error: 'no_frontmatter', text };
  const end = text.indexOf('\n---', 3);
  if (end < 0) return { ok: false, error: 'unclosed_frontmatter', text };
  const fm = text.slice(3, end).trim();
  const body = text.slice(end + 4);
  const meta = {};
  let key = null;
  let buf = [];
  for (const line of fm.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (m) {
      if (key) meta[key] = buf.join('\n').trim().replace(/^>\s?/gm, '').trim();
      key = m[1];
      buf = [m[2]];
    } else if (key) {
      buf.push(line.replace(/^\s*>\s?/, ''));
    }
  }
  if (key) meta[key] = buf.join('\n').trim().replace(/^>\s?/gm, '').trim();
  return { ok: true, meta, body, text };
}

function folderSlug(skillPath) {
  const parts = skillPath.replace(/\\/g, '/').split('/');
  // .../SKILL.md → parent folder name
  return parts[parts.length - 2] || '';
}

function normalizeSlug(slug) {
  return String(slug || '')
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function classifyKind(skillPath) {
  const p = skillPath.replace(/\\/g, '/');
  if (p === 'SKILL.md') return 'primary_tree';
  if (p.startsWith('.cursor/skills/')) return 'host_install';
  if (p.includes('/.cursor/skills/')) return 'vendored_copy';
  if (p.includes('/vendor/')) return 'vendored_copy';
  if (p.startsWith('skill-factory/out/')) return 'nested_skill';
  const depth = p.split('/').length;
  if (depth === 2) return 'primary_tree';
  return 'nested_skill';
}

function pickPrimary(installations) {
  const rank = { primary_tree: 0, nested_skill: 1, host_install: 2, vendored_copy: 3 };
  const sorted = [...installations].sort((a, b) => {
    if (Boolean(a.pointer) !== Boolean(b.pointer)) return a.pointer ? 1 : -1;
    const ra = rank[a.kind] ?? 9;
    const rb = rank[b.kind] ?? 9;
    if (ra !== rb) return ra - rb;
    return a.path.localeCompare(b.path);
  });
  return sorted[0];
}

function renderCatalog(registry, pointers) {
  const lines = [
    '# Canonical skill catalog',
    '',
    'One entry per capability. Edit that path. Other installations are host copies, vendor snapshots, or pointers.',
    '',
  ];
  for (const cap of registry.capabilities) {
    lines.push(`- \`${cap.canonical_id}\` → \`${cap.executable_default}\``);
  }
  lines.push('', '## Pointers', '', 'These files are not a second copy. They name the canonical skill.', '');
  if (!pointers.length) lines.push('None.');
  else {
    for (const item of pointers) lines.push(`- \`${item.path}\` → \`${item.target}\``);
  }
  lines.push('');
  return lines.join('\n');
}

function contentHash(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function loadAllowlist() {
  if (!fs.existsSync(ALLOWLIST_PATH)) return new Set();
  return new Set(
    fs
      .readFileSync(ALLOWLIST_PATH, 'utf8')
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'))
  );
}

function build() {
  const tracked = gitLsFiles();
  const trackedSet = new Set(tracked);
  const skillPaths = tracked.filter((p) => /(^|\/)SKILL\.md$/i.test(p)).sort();
  const allowlist = loadAllowlist();

  const records = [];
  const pointers = [];
  const warnings = [];
  const slugInconsistencies = [];
  const hashGroups = new Map(); // hash -> paths

  for (const skillPath of skillPaths) {
    const fm = readFrontmatter(skillPath);
    const folder = path.posix.dirname(skillPath);
    const folderName = folderSlug(skillPath);
    const nameFromFm = fm.ok ? (fm.meta.name || '').trim() : '';
    const canonicalTarget = fm.ok && fm.meta.canonical ? String(fm.meta.canonical).trim().replace(/\\/g, '/') : '';
    const canonicalId = normalizeSlug(nameFromFm || folderName);
    if (canonicalTarget) pointers.push({ path: skillPath, target: canonicalTarget });
    const kind = classifyKind(skillPath);
    const bodyHash = contentHash(fm.text || '');
    if (!hashGroups.has(bodyHash)) hashGroups.set(bodyHash, []);
    hashGroups.get(bodyHash).push(skillPath);

    if (nameFromFm && normalizeSlug(nameFromFm) !== normalizeSlug(folderName)) {
      slugInconsistencies.push({
        path: skillPath,
        frontmatter_name: nameFromFm,
        folder: folderName,
        normalized_name: normalizeSlug(nameFromFm),
        normalized_folder: normalizeSlug(folderName),
      });
    }

    records.push({
      path: skillPath,
      folder,
      folderName,
      kind,
      canonicalId,
      title: nameFromFm || folderName,
      description: fm.ok ? fm.meta.description || '' : '',
      frontmatterOk: fm.ok,
      bodyHash,
      canonicalTarget,
    });
  }

  // Group by canonicalId
  const byId = new Map();
  for (const r of records) {
    if (!byId.has(r.canonicalId)) byId.set(r.canonicalId, []);
    byId.get(r.canonicalId).push(r);
  }

  const capabilities = [];
  for (const canonicalId of [...byId.keys()].sort()) {
    const group = byId.get(canonicalId);
    const installations = group.map((r, idx) => ({
      installation_id: `${canonicalId}::${idx}`,
      path: r.path,
      folder: r.folder,
      kind: r.kind,
      description_snippet: (r.description || '').replace(/\s+/g, ' ').slice(0, 120),
      content_sha256: r.bodyHash,
      pointer: Boolean(r.canonicalTarget),
    }));
    // re-number after sort by path for stability
    installations.sort((a, b) => a.path.localeCompare(b.path));
    installations.forEach((inst, idx) => {
      inst.installation_id = `${canonicalId}::${idx}`;
    });

    const primary = pickPrimary(installations);
    const primaryRec = group.find((g) => g.path === primary.path) || group[0];
    const ambiguity =
      installations.length === 1
        ? 'single'
        : new Set(group.map((g) => g.bodyHash)).size === 1
          ? 'multi_install_identical'
          : 'multi_install_divergent';

    if (ambiguity === 'multi_install_divergent') {
      warnings.push({
        type: 'divergent_installations',
        canonical_id: canonicalId,
        paths: installations.map((i) => i.path),
        note: 'Same canonical_id, different content hashes — not silently collapsed',
      });
    }

    capabilities.push({
      canonical_id: canonicalId,
      kind: 'canonical_capability',
      title: primaryRec.title,
      description: (primaryRec.description || '').replace(/\s+/g, ' ').trim(),
      primary_installation_id: primary.installation_id,
      installations,
      installation_count: installations.length,
      ambiguity,
      executable_default: primary.path,
    });
  }

  capabilities.sort((a, b) => a.canonical_id.localeCompare(b.canonical_id));

  const exactDuplicateGroups = [...hashGroups.entries()]
    .filter(([, paths]) => paths.length > 1)
    .map(([hash, paths]) => {
      const sorted = [...paths].sort();
      const kinds = sorted.map((p) => classifyKind(p));
      const primaryCandidate =
        sorted.find((p) => classifyKind(p) === 'primary_tree') ||
        sorted.find((p) => classifyKind(p) === 'nested_skill') ||
        sorted[0];
      return {
        content_sha256: hash,
        paths: sorted,
        slugs: sorted.map((p) => folderSlug(p)),
        kinds,
        canonical_candidate: primaryCandidate,
      };
    })
    .sort((a, b) => a.paths[0].localeCompare(b.paths[0]));

  // Generated-output hygiene scan (report into validation report)
  const generatedPatterns = [/\/out\//, /^out\//, /\/dist\//, /^dist\//, /\.zip$/i];
  const unexpectedTrackedOutputs = tracked.filter((p) => {
    if (!generatedPatterns.some((re) => re.test(p))) return false;
    if (allowlist.has(p)) return false;
    // allowlist may list only SKILL.md; also allow other files under same allowlisted skill dirs
    for (const a of allowlist) {
      const dir = a.replace(/\/SKILL\.md$/i, '/');
      if (p.startsWith(dir)) return false;
    }
    return true;
  });

  const registry = {
    schema: 'rctc.canonical-registry.v1',
    generated_at: new Date().toISOString(),
    generated_from: 'git ls-files',
    composition_law: 'Reuse -> Compose -> Extend -> Generate New',
    metrics: {
      discovered_skill_records: skillPaths.length,
      canonical_capabilities: capabilities.length,
      multi_install_capabilities: capabilities.filter((c) => c.installation_count > 1).length,
      public_claim: `${capabilities.length} canonical capabilities (${skillPaths.length} tracked SKILL.md installations — not independent product claims)`,
    },
    capabilities,
  };

  // Dead paths vs previous committed file (informational for report)
  let deadRegistryPaths = [];
  let unregistered = [];
  if (fs.existsSync(OUT_CANONICAL) && CHECK) {
    // during check we compare generated vs committed; dead paths of NEW registry should be empty by construction
  }
  // Unregistered: every tracked skill path must appear in new registry
  const registeredPaths = new Set();
  for (const cap of capabilities) {
    for (const inst of cap.installations) registeredPaths.add(inst.path);
  }
  unregistered = skillPaths.filter((p) => !registeredPaths.has(p));

  // If somehow old committed had paths — for BEFORE report we compute against NEW only
  deadRegistryPaths = [];
  for (const cap of capabilities) {
    for (const inst of cap.installations) {
      if (!trackedSet.has(inst.path)) deadRegistryPaths.push(inst.path);
    }
  }

  const status =
    deadRegistryPaths.length === 0 &&
    unregistered.length === 0 &&
    unexpectedTrackedOutputs.length === 0
      ? 'PASS'
      : 'FAIL';

  const report = {
    generated_at: registry.generated_at,
    tracked_skill_count: skillPaths.length,
    canonical_capability_count: capabilities.length,
    installation_count: skillPaths.length,
    unregistered_tracked_skills: unregistered,
    dead_registry_paths: deadRegistryPaths,
    exact_duplicate_groups: exactDuplicateGroups,
    slug_inconsistencies: slugInconsistencies,
    unexpected_tracked_outputs: unexpectedTrackedOutputs,
    warnings,
    status,
    notes: [
      'Authoritative input: git ls-files',
      'Local-only untracked skills are excluded by design',
      'Heuristic/frontmatter name used for canonical_id when present; else folder name',
      'Do not hand-edit registry/canonical.json',
    ],
  };

  pointers.sort((a, b) => a.path.localeCompare(b.path));
  const catalog = renderCatalog(registry, pointers);
  return { registry, report, catalog };
}

function stableStringify(obj) {
  return JSON.stringify(obj, null, 2) + '\n';
}

function stripVolatile(reg) {
  const clone = JSON.parse(JSON.stringify(reg));
  delete clone.generated_at;
  return clone;
}

function main() {
  const { registry, report, catalog } = build();

  if (CHECK) {
    if (!fs.existsSync(OUT_CANONICAL)) {
      console.error('FAIL registry:check — committed registry/canonical.json missing');
      process.exit(1);
    }
    const committed = JSON.parse(fs.readFileSync(OUT_CANONICAL, 'utf8'));
    const a = stableStringify(stripVolatile(registry));
    const b = stableStringify(stripVolatile(committed));
    if (a !== b) {
      console.error('FAIL registry:check — regenerated canonical.json differs from committed');
      console.error('Run: npm run registry:generate');
      process.exit(1);
    }
    // also require report status PASS for check mode? soft: compare only canonical
    if (!fs.existsSync(OUT_CATALOG) || fs.readFileSync(OUT_CATALOG, 'utf8') !== catalog) {
      console.error('FAIL registry:check — skills/CATALOG.md differs from git-generated output');
      console.error('Run: npm run registry:generate');
      process.exit(1);
    }
    console.log('PASS registry:check — committed canonical.json and skills/CATALOG.md match git-generated output');
    process.exit(0);
  }

  if (STDOUT) {
    process.stdout.write(stableStringify(registry));
    return;
  }

  fs.mkdirSync(path.dirname(OUT_CANONICAL), { recursive: true });
  fs.writeFileSync(OUT_CANONICAL, stableStringify(registry));
  fs.writeFileSync(OUT_REPORT, stableStringify(report));
  fs.mkdirSync(path.dirname(OUT_CATALOG), { recursive: true });
  fs.writeFileSync(OUT_CATALOG, catalog);
  console.log(
    `Wrote registry/canonical.json (${registry.metrics.canonical_capabilities} capabilities, ${registry.metrics.discovered_skill_records} installations)`
  );
  console.log(`Wrote registry/CANONICAL_VALIDATION_REPORT.json status=${report.status}`);
  if (report.status !== 'PASS') process.exit(1);
}

main();
