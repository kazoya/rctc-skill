'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function classifyInstall(p) {
  const s = String(p || '').replace(/\\/g, '/');
  if (!s) return 'unknown';
  if (s.includes('/vendor/') || s.includes('master-brain/skills/vendor')) return 'vendored_copy';
  if (s.startsWith('.cursor/skills/') || s.startsWith('.agents/skills/')) return 'host_install';
  if (s.includes('master-brain/skills/')) return 'platform_install';
  if (s.includes('portfolio-commander/skills/')) return 'nested_skill';
  if (s.includes('apca-smarthelp/')) return 'vendored_copy';
  if (s === 'SKILL.md') return 'repo_root_skill';
  return 'primary_tree';
}

function preferPrimary(installs) {
  const score = (inst) => {
    const k = inst.kind;
    if (k === 'primary_tree') return 100;
    if (k === 'nested_skill') return 50;
    if (k === 'host_install') return 30;
    if (k === 'platform_install') return 20;
    if (k === 'vendored_copy') return 10;
    return 0;
  };
  return [...installs].sort((a, b) => score(b) - score(a) || a.path.localeCompare(b.path))[0];
}

function main() {
  const root = process.argv[2] || process.cwd();
  const skillsPath = path.join(root, 'registry', 'skills.json');
  const raw = JSON.parse(fs.readFileSync(skillsPath, 'utf8'));
  const list = Array.isArray(raw) ? raw : raw.skills || [];

  const byId = new Map();
  for (const item of list) {
    const id = typeof item === 'string' ? item : item.id || item.name || item.slug;
    const rec = typeof item === 'string' ? { id: item } : item;
    if (!byId.has(id)) byId.set(id, []);
    byId.get(id).push(rec);
  }

  const capabilities = [];
  for (const [id, records] of [...byId.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const installations = records.map((r, idx) => ({
      installation_id: id + '::' + idx,
      path: r.path || r.folder || null,
      folder: r.folder || null,
      kind: classifyInstall(r.path || r.folder),
      description_snippet: (r.description || '').slice(0, 120) || null,
    }));
    const primary = preferPrimary(installations);
    capabilities.push({
      canonical_id: id,
      kind: 'canonical_capability',
      title: id,
      description: (records[0] && records[0].description) || '',
      primary_installation_id: primary.installation_id,
      installations,
      installation_count: installations.length,
      ambiguity: installations.length > 1 ? 'multi_install_ok' : 'single',
      executable_default: primary.path,
    });
  }

  const out = {
    schema: 'rctc.canonical-registry.v1',
    generated_at: new Date().toISOString(),
    composition_law: raw.composition_law || 'Reuse → Compose → Extend → Generate New',
    metrics: {
      discovered_skill_records: list.length,
      canonical_capabilities: capabilities.length,
      multi_install_capabilities: capabilities.filter((c) => c.installation_count > 1).length,
      public_claim:
        capabilities.length +
        ' canonical capabilities (' +
        list.length +
        ' discovered installations/copies — not independent skills)',
    },
    capabilities,
  };

  const outPath = path.join(root, 'registry', 'canonical.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  const report = {
    before: { records: list.length, unique_ids: byId.size },
    after: out.metrics,
    note: 'Duplicates retained as installations under one canonical capability. No silent deletion.',
  };
  fs.writeFileSync(path.join(root, 'registry', 'CANONICAL_MIGRATION_REPORT.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  console.log('wrote', outPath);
}

main();
