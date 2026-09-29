#!/usr/bin/env node
/**
 * Repository self-validation — npm run validate:repo
 *
 * Gates A–G (see sprint). Gate C is HEURISTIC:
 * - Hard-fail only on markdown relative links [text](rel) that resolve to a missing
 *   sibling/file (skill-dir relative, then repo-root).
 * - Backtick paths are reported as warnings (soft) unless they are a bare sibling
 *   filename with a known extension and missing.
 * This is intentionally imperfect; document false negatives/positives in output notes.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CANONICAL = path.join(ROOT, 'registry', 'canonical.json');
const ALLOWLIST_PATH = path.join(ROOT, 'registry', 'TRACKED_OUTPUT_ALLOWLIST.txt');

const BINARY_EXT = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.pdf', '.zip', '.gz', '.tgz',
  '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.mp3', '.wasm', '.exe', '.dll', '.so',
]);

function gitLsFiles() {
  const out = execSync('git ls-files -z', { cwd: ROOT, encoding: 'buffer' });
  return out
    .toString('utf8')
    .split('\0')
    .filter(Boolean)
    .map((p) => p.replace(/\\/g, '/'));
}

function isProbablyText(p) {
  return !BINARY_EXT.has(path.extname(p).toLowerCase());
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

function pathExists(rel, tracked, trackedSet) {
  const cleaned = rel.replace(/\/$/, '');
  const abs = path.join(ROOT, cleaned);
  if (fs.existsSync(abs)) return true;
  if (trackedSet.has(cleaned) || trackedSet.has(rel)) return true;
  const prefix = cleaned.endsWith('/') ? cleaned : cleaned + '/';
  return tracked.some((t) => t === cleaned || t.startsWith(prefix));
}

function readFrontmatter(abs) {
  const text = fs.readFileSync(abs, 'utf8');
  if (!text.startsWith('---')) return { ok: false, error: 'missing opening ---', text };
  const end = text.indexOf('\n---', 3);
  if (end < 0) return { ok: false, error: 'missing closing ---', text };
  const fm = text.slice(3, end).trim();
  const meta = {};
  let key = null;
  let buf = [];
  for (const line of fm.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (m) {
      if (key) meta[key] = buf.join('\n').trim();
      key = m[1];
      buf = [m[2]];
    } else if (key) buf.push(line);
  }
  if (key) meta[key] = buf.join('\n').trim();
  return { ok: true, meta, text, body: text.slice(end + 4) };
}

function folderSlug(skillPath) {
  if (skillPath === 'SKILL.md') return '';
  const parts = skillPath.split('/');
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

function extractMarkdownLocalLinks(skillMdRel, body) {
  const dir = path.posix.dirname(skillMdRel);
  const out = [];
  const linkRe = /\[[^\]]*\]\(([^)]+)\)/g;
  let m;
  while ((m = linkRe.exec(body))) {
    let target = m[1].trim().replace(/^<|>$/g, '').split(/\s+/)[0];
    if (!target) continue;
    if (/^(https?:|mailto:|#|\/)/i.test(target)) continue;
    target = target.split('#')[0];
    if (!target) continue;
    const cleaned = target.replace(/\\/g, '/');
    const candidates = [];
    const joined = path.posix.normalize(path.posix.join(dir === '.' ? '' : dir, cleaned)).replace(/^\.\//, '');
    candidates.push(joined);
    if (cleaned.includes('/')) candidates.push(path.posix.normalize(cleaned));
    // If link uses ../, also try from repo root after stripping leading ../
    if (cleaned.startsWith('../')) {
      candidates.push(path.posix.normalize(cleaned.replace(/^(\.\.\/)+/, '')));
    }
    out.push({
      raw: cleaned,
      candidates: [...new Set(candidates)].filter((c) => c && !c.startsWith('..')),
    });
  }
  return out;
}

function extractBareSiblingTicks(skillMdRel, body) {
  const dir = path.posix.dirname(skillMdRel);
  const out = [];
  const tickRe = /`([^`\n]+)`/g;
  let m;
  while ((m = tickRe.exec(body))) {
    const raw = m[1].trim().replace(/\\/g, '/');
    if (!/^[A-Za-z0-9_\-]+\.(md|ya?ml|json|ts|js|mjs|cjs|txt|ps1|sh)$/i.test(raw)) continue;
    const cand = path.posix.normalize(path.posix.join(dir === '.' ? '' : dir, raw)).replace(/^\.\//, '');
    out.push({ raw, candidates: [cand] });
  }
  return out;
}

function main() {
  const errors = [];
  const warnings = [];
  const tracked = gitLsFiles();
  const trackedSet = new Set(tracked);
  const skillPaths = tracked.filter((p) => /(^|\/)SKILL\.md$/i.test(p)).sort();
  const allowlist = loadAllowlist();

  // A
  const conflictRe = /^(<<<<<<<|=======|>>>>>>>)/m;
  for (const p of tracked) {
    if (!isProbablyText(p)) continue;
    let text;
    try {
      text = fs.readFileSync(path.join(ROOT, p), 'utf8');
    } catch {
      continue;
    }
    if (conflictRe.test(text)) errors.push({ gate: 'A', code: 'conflict_markers', path: p });
  }

  const hashToPaths = new Map();

  for (const sp of skillPaths) {
    const abs = path.join(ROOT, sp);
    const fm = readFrontmatter(abs);
    if (!fm.ok) {
      errors.push({ gate: 'B', code: 'invalid_frontmatter', path: sp, detail: fm.error });
      continue;
    }
    if (!fm.meta.name || !String(fm.meta.name).trim()) {
      errors.push({ gate: 'B', code: 'missing_name', path: sp });
    }
    if (!fm.meta.description || !String(fm.meta.description).trim()) {
      errors.push({ gate: 'B', code: 'missing_description', path: sp });
    }

    // C — markdown links hard; bare sibling ticks soft-as-hard for focused3 style
    for (const ref of extractMarkdownLocalLinks(sp, fm.body || '')) {
      const found = ref.candidates.some((c) => pathExists(c, tracked, trackedSet));
      if (!found) {
        const soft =
          sp.includes('/vendor/') ||
          sp.startsWith('.cursor/skills/') ||
          sp.includes('/.cursor/skills/');
        const payload = {
          gate: 'C',
          code: soft ? 'incomplete_vendored_or_host_skill' : 'missing_referenced_file',
          path: sp,
          referenced: ref.raw,
          tried: ref.candidates,
          note: soft
            ? 'heuristic: markdown link missing under vendor/host install (warning; primary tree still hard-fails)'
            : 'heuristic: markdown relative link',
        };
        if (soft) warnings.push(payload);
        else errors.push(payload);
      }
    }
    for (const ref of extractBareSiblingTicks(sp, fm.body || '')) {
      const found = ref.candidates.some((c) => pathExists(c, tracked, trackedSet));
      if (!found) {
        warnings.push({
          gate: 'C',
          code: 'missing_referenced_file_soft',
          path: sp,
          referenced: ref.raw,
          tried: ref.candidates,
          note: 'heuristic: bare sibling filename in backticks (warning only; markdown links hard-fail)',
        });
      }
    }

    const name = String(fm.meta.name || '').trim();
    const folder = folderSlug(sp);
    if (name && folder && normalizeSlug(name) !== normalizeSlug(folder)) {
      warnings.push({
        gate: 'G',
        code: 'slug_folder_mismatch',
        path: sp,
        frontmatter_name: name,
        folder,
      });
    }

    const hash = crypto.createHash('sha256').update(fm.text).digest('hex');
    if (!hashToPaths.has(hash)) hashToPaths.set(hash, []);
    hashToPaths.get(hash).push(sp);
  }

  // D
  if (!fs.existsSync(CANONICAL)) {
    errors.push({ gate: 'D', code: 'missing_canonical_registry', path: 'registry/canonical.json' });
  } else {
    const reg = JSON.parse(fs.readFileSync(CANONICAL, 'utf8'));
    const regPaths = [];
    for (const cap of reg.capabilities || []) {
      for (const inst of cap.installations || []) {
        regPaths.push(String(inst.path).replace(/\\/g, '/'));
      }
    }
    for (const rp of regPaths) {
      if (!trackedSet.has(rp)) errors.push({ gate: 'D', code: 'dead_registry_path', path: rp });
    }
    const registered = new Set(regPaths);
    for (const sp of skillPaths) {
      if (!registered.has(sp)) errors.push({ gate: 'D', code: 'unregistered_tracked_skill', path: sp });
    }
  }

  // E
  for (const [hash, paths] of hashToPaths) {
    if (paths.length > 1) {
      const sorted = [...paths].sort();
      warnings.push({
        gate: 'E',
        code: 'exact_duplicate_skill_bodies',
        paths: sorted,
        content_sha256: hash,
        canonical_candidate: sorted.find((p) => p.split('/').length === 2) || sorted[0],
      });
    }
  }

  // F
  const genRe = /(^|\/)(out|dist)\//i;
  for (const p of tracked) {
    const isGen = genRe.test(p) || /\.zip$/i.test(p);
    if (!isGen) continue;
    let allowed = allowlist.has(p);
    if (!allowed) {
      for (const a of allowlist) {
        const dir = a.replace(/\/SKILL\.md$/i, '/');
        if (p.startsWith(dir)) {
          allowed = true;
          break;
        }
      }
    }
    if (!allowed) errors.push({ gate: 'F', code: 'unexpected_tracked_generated', path: p });
  }

  const summary = {
    tracked_files: tracked.length,
    tracked_skills: skillPaths.length,
    errors: errors.length,
    warnings: warnings.length,
    status: errors.length ? 'FAIL' : 'PASS',
    notes: [
      'Gate C is heuristic (markdown relative links + bare sibling backticks = warnings; markdown links = hard-fail).',
      'Duplicates (E) and slug mismatches (G) are warnings only.',
    ],
  };

  console.log(JSON.stringify({ summary, errors, warnings }, null, 2));
  if (errors.length) {
    console.error(`\nvalidate:repo FAIL (${errors.length} error(s))`);
    process.exit(1);
  }
  console.error(`\nvalidate:repo PASS (${warnings.length} warning(s))`);
}

main();
