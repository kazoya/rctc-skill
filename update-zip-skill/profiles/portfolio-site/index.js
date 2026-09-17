'use strict';
/**
 * ملف تعريف «موقع المحفظة» — الدورة نفسها (حصاد → ضغط → استشارة → استيعاب) على مشروع
 * Next.js منشور: suhib-ai-delivery-portfolio.
 *
 * الحقائق هنا ليست مشاهدات، بل بوابات: روابط حيّة (HTTP)، Lighthouse، axe، الاختبارات،
 * سلامة الأصول، وحالة Git. والاستيعاب لا يكتب في main أبدًا: فرع مراجعة + `npm run verify`.
 */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync, spawnSync } = require('node:child_process');

const SKILL_ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(SKILL_ROOT, 'out');
const CACHE = path.join(OUT, 'portfolio-live-latest.json');
const REVIEW = path.join(SKILL_ROOT, 'review');
const HERE = __dirname;

const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'kit', 'test-results', 'playwright-report', '.vercel', 'files', 'out']);
const ROOT_ONLY_SKIP = new Set(['journal', 'docs']);
const ALLOWED_OVERLAY = ['app', 'components', 'lib', 'public', 'tests', 'scripts', 'styles', 'docs', 'package.json', 'playwright.config.ts', 'tsconfig.json', 'eslint.config.mjs', 'next.config.ts', 'postcss.config.mjs'];

function say(s = '') { process.stdout.write(s + '\n'); }
function stamp() { return new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-'); }

/** جذر المشروع: --root أو المجلد الحالي، ويجب أن يكون مشروع المحفظة لا أي مجلد. */
function projectRoot(opts = {}) {
  const root = path.resolve(opts.root || process.env.UZ_ROOT || process.cwd());
  const pkg = path.join(root, 'package.json');
  if (!fs.existsSync(pkg)) throw new Error(`لا package.json في ${root} — شغّل الأمر من جذر المحفظة أو مرّر --root`);
  const name = JSON.parse(fs.readFileSync(pkg, 'utf8')).name || '';
  if (!/portfolio/i.test(name)) throw new Error(`المجلد ${root} ليس مشروع المحفظة (name=${name})`);
  return root;
}

function git(root, args) {
  try { return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' }).trim(); } catch { return ''; }
}

function walk(dir, root, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      if (dir === root && ROOT_ONLY_SKIP.has(e.name)) continue;
      walk(p, root, acc);
    } else {
      if (/^\.env(?!\.example)/.test(e.name)) continue;
      if (fs.statSync(p).size > 15 * 1024 * 1024) continue;
      acc.push(p);
    }
  }
  return acc;
}

/* ------------------------------------------------------------------ harvest */

async function httpStatus(url, timeoutMs = 20000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { method: 'GET', redirect: 'follow', signal: ctl.signal, headers: { 'user-agent': 'Mozilla/5.0 uz-harvest' } });
    return r.status;
  } catch (e) { return `ERR ${e.name}`; } finally { clearTimeout(t); }
}

function deploymentUrls(root) {
  const src = fs.readFileSync(path.join(root, 'data', 'portfolio.ts'), 'utf8');
  const m = src.match(/export const deployments[\s\S]*?\n\];/);
  if (!m) return [];
  return [...m[0].matchAll(/url:\s*"(https?:\/\/[^"]+)"/g)].map(x => x[1]);
}

function latestJsonScores(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
    try {
      const r = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      if (!r.categories) continue;
      const c = r.categories;
      out.push({
        file: f, url: r.finalDisplayedUrl || r.requestedUrl,
        performance: Math.round(c.performance.score * 100), accessibility: Math.round(c.accessibility.score * 100),
        bestPractices: Math.round(c['best-practices'].score * 100), seo: Math.round(c.seo.score * 100),
        lcpMs: Math.round(r.audits['largest-contentful-paint'].numericValue), cls: +r.audits['cumulative-layout-shift'].numericValue.toFixed(3),
        fetchTime: r.fetchTime,
      });
    } catch { /* skip */ }
  }
  return out.sort((a, b) => String(b.fetchTime).localeCompare(String(a.fetchTime)));
}

function axeSummary(dir) {
  if (!fs.existsSync(dir)) return null;
  let pages = 0, serious = 0, minor = 0;
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
    pages++;
    for (const v of JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))) {
      if (v.impact === 'serious' || v.impact === 'critical') serious += v.nodes; else minor += v.nodes;
    }
  }
  return { pages, seriousOrCritical: serious, other: minor };
}

function lastTestRun(root) {
  const f = path.join(root, 'test-results', '.last-run.json');
  if (!fs.existsSync(f)) return { status: 'not run in this harvest' };
  try { const j = JSON.parse(fs.readFileSync(f, 'utf8')); return { status: j.status, failed: (j.failedTests || []).length, at: fs.statSync(f).mtime.toISOString() }; }
  catch { return { status: 'unreadable' }; }
}

async function harvest(opts = {}) {
  const root = projectRoot(opts);
  say('▸ حصاد حقائق المحفظة…');
  const urls = deploymentUrls(root);
  const site = 'https://suhib-ai-delivery-portfolio.vercel.app';
  const checks = [];
  for (const u of [site, site + '/journal', site + '/en/journal', site + '/projects', site + '/cv', ...urls]) {
    checks.push({ url: u, status: await httpStatus(u) });
  }
  const liveOk = checks.filter(c => c.status === 200).length;
  say(`  روابط: ${liveOk}/${checks.length} تستجيب 200`);

  const assets = spawnSync(process.execPath, [path.join(root, 'scripts', 'verify-public-assets.mjs')], { cwd: root, encoding: 'utf8' });
  const lighthouse = [
    ...latestJsonScores(path.join(root, 'docs', 'reports', 'lighthouse')),
    ...latestJsonScores(path.join(root, 'docs', 'reports', 'lighthouse-effects')),
  ];
  const live = {
    profile: 'portfolio-site',
    harvestedAt: new Date().toISOString(),
    root,
    git: { head: git(root, ['rev-parse', '--short', 'HEAD']), branch: git(root, ['rev-parse', '--abbrev-ref', 'HEAD']), dirty: git(root, ['status', '--porcelain']).split('\n').filter(Boolean).length, recent: git(root, ['log', '--oneline', '-10']).split('\n') },
    http: { ok: liveOk, total: checks.length, checks },
    assets: { ok: assets.status === 0, output: (assets.stdout + assets.stderr).trim() },
    lighthouse,
    axe: axeSummary(path.join(root, 'docs', 'reports', 'axe')),
    tests: lastTestRun(root),
  };
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(CACHE, JSON.stringify(live, null, 1), 'utf8');
  say(`  Lighthouse: ${lighthouse.length} تقريرًا · axe: ${live.axe ? live.axe.seriousOrCritical + ' مخالفة جسيمة' : '—'} · الأصول: ${live.assets.ok ? 'سليمة' : 'ناقصة'} · الاختبارات: ${live.tests.status}`);
  say(`  حُفظ: ${CACHE}`);
  return live;
}

/* --------------------------------------------------------------------- pack */

function summaryMd(live) {
  const lh = live.lighthouse.slice(0, 8).map(l => `| ${l.file} | ${l.performance} | ${l.accessibility} | ${l.bestPractices} | ${l.seo} | ${l.lcpMs} ms | ${l.cls} |`).join('\n');
  const bad = live.http.checks.filter(c => c.status !== 200).map(c => `- ${c.url} → ${c.status}`).join('\n') || '- لا شيء';
  return `# موجز حقائق المحفظة — ${live.harvestedAt.slice(0, 16)}

**المستودع:** kazoya/suhib-ai-delivery-portfolio @ \`${live.git.head}\` (${live.git.branch}, ${live.git.dirty} ملفًا غير ملتزم) · **الموقع:** https://suhib-ai-delivery-portfolio.vercel.app

## البوابات كما قيست
| البوابة | القيمة |
|---|---|
| روابط حيّة تستجيب 200 | ${live.http.ok} / ${live.http.total} |
| سلامة الأصول العامة | ${live.assets.ok ? 'ناجحة' : 'فاشلة'} — ${live.assets.output.split('\n')[0]} |
| axe (${live.axe ? live.axe.pages : 0} صفحة × وضعين) | ${live.axe ? live.axe.seriousOrCritical : '—'} مخالفة جسيمة/حرجة |
| آخر تشغيل Playwright | ${live.tests.status}${live.tests.failed != null ? ` · ${live.tests.failed} فشل` : ''}${live.tests.at ? ` · ${live.tests.at.slice(0, 16)}` : ''} |

## Lighthouse (أحدث التقارير المحفوظة)
| التقرير | الأداء | الوصول | الممارسات | SEO | LCP | CLS |
|---|---|---|---|---|---|---|
${lh}

## روابط لا تستجيب 200
${bad}

## آخر 10 commits
\`\`\`
${live.git.recent.join('\n')}
\`\`\`
`;
}

function pack(opts = {}) {
  const root = projectRoot(opts);
  let live = null;
  if (fs.existsSync(CACHE)) { live = JSON.parse(fs.readFileSync(CACHE, 'utf8')); say('  استُخدم حصاد محفوظ (' + live.harvestedAt.slice(0, 16) + ')'); }
  if (!live) throw new Error('لا حصاد — شغّل `harvest` أولًا حتى تحمل الحزمة أرقامًا لا انطباعات');

  const name = `portfolio-consult-${stamp()}`;
  const stage = path.join(os.tmpdir(), name);
  fs.rmSync(stage, { recursive: true, force: true });
  fs.mkdirSync(stage, { recursive: true });

  fs.writeFileSync(path.join(stage, 'SUMMARY.md'), summaryMd(live), 'utf8');
  fs.copyFileSync(path.join(HERE, 'CONSTRAINTS.md'), path.join(stage, 'CONSTRAINTS.md'));
  fs.copyFileSync(path.join(HERE, 'ASK.md'), path.join(stage, 'ASK.md'));
  fs.writeFileSync(path.join(stage, 'FACTS.json'), JSON.stringify(live, null, 1), 'utf8');
  for (const f of ['BRAIN.md', 'README.md']) if (fs.existsSync(path.join(root, f))) fs.copyFileSync(path.join(root, f), path.join(stage, f));
  const docs = path.join(root, 'docs');
  if (fs.existsSync(docs)) {
    fs.mkdirSync(path.join(stage, 'docs'));
    for (const f of fs.readdirSync(docs).filter(f => f.endsWith('.md'))) fs.copyFileSync(path.join(docs, f), path.join(stage, 'docs', f));
    const shots = path.join(docs, 'screenshots');
    if (fs.existsSync(shots)) {
      fs.mkdirSync(path.join(stage, 'screenshots'));
      const pick = fs.readdirSync(shots).filter(f => /-1440\.png$/.test(f)).sort().slice(-6);
      for (const f of pick) fs.copyFileSync(path.join(shots, f), path.join(stage, 'screenshots', f));
    }
  }
  for (const p of walk(root, root)) {
    const rel = path.relative(root, p);
    const dst = path.join(stage, 'source', rel);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(p, dst);
  }

  fs.mkdirSync(OUT, { recursive: true });
  const zip = path.join(OUT, name + '.zip');
  fs.rmSync(zip, { force: true });
  execFileSync('powershell', ['-NoProfile', '-Command', `Compress-Archive -Path '${stage}\\*' -DestinationPath '${zip}' -CompressionLevel Optimal`]);
  fs.rmSync(stage, { recursive: true, force: true });
  return { zip, bytes: fs.statSync(zip).size };
}

const REQUEST_TEXT = `«مرفق ملف مضغوط لموقع محفظة مهندس (Next.js 16، عربي RTL وإنجليزي LTR، منشور على Vercel).
اقرأ SUMMARY.md ثم CONSTRAINTS.md (وهي ملزمة)، ثم BRAIN.md، ونفّذ ما في ASK.md حرفيًا:
أعد مجلد IMPROVE بالملفات المذكورة بأسمائها. لا توصيات عامة، لا تغيير لأي رقم أو ادعاء
في data/، ولا شيء يخالف القيود. كل تغيير كود يأتي كملفات كاملة تحت IMPROVE/changed-files/.»`;

/* ------------------------------------------------------------------- ingest */

function expand(src) {
  if (fs.statSync(src).isDirectory()) return src;
  const dst = path.join(os.tmpdir(), 'uz-ingest-' + stamp());
  fs.rmSync(dst, { recursive: true, force: true });
  execFileSync('powershell', ['-NoProfile', '-Command', `Expand-Archive -Path '${src}' -DestinationPath '${dst}' -Force`]);
  return dst;
}

function findImprove(dir) {
  const direct = path.join(dir, 'changed-files');
  if (fs.existsSync(direct)) return dir;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const r = findImprove(path.join(dir, e.name));
    if (r) return r;
  }
  return null;
}

function ingest(input, opts = {}) {
  const root = projectRoot(opts);
  if (!input) throw new Error('حدّد ملف IMPROVE المضغوط أو مجلده');
  const lines = [];
  const dirty = git(root, ['status', '--porcelain']).split('\n').filter(Boolean).length;
  if (dirty) throw new Error(`الشجرة غير نظيفة (${dirty} ملفًا) — التزم أو خزّن التغييرات قبل الاستيعاب`);

  const dir = expand(path.resolve(input));
  const improve = findImprove(dir);
  if (!improve) throw new Error('لا مجلد changed-files داخل الحزمة — الحزمة لا تطابق ASK.md');

  const branch = `improve/${stamp()}`;
  execFileSync('git', ['-C', root, 'checkout', '-b', branch]);
  lines.push(`▸ فرع المراجعة: ${branch}`);

  fs.mkdirSync(REVIEW, { recursive: true });
  const applied = [], held = [], refused = [];
  const src = path.join(improve, 'changed-files');
  for (const p of walk(src, src)) {
    const rel = path.relative(src, p).replace(/\\/g, '/');
    const top = rel.split('/')[0];
    if (top === 'data' || rel.startsWith('OUT/')) {
      // محتوى المالك: لا يُطبَّق آليًا مهما بدا مقنعًا
      const h = path.join(REVIEW, branch.replace('/', '_'), rel);
      fs.mkdirSync(path.dirname(h), { recursive: true }); fs.copyFileSync(p, h); held.push(rel); continue;
    }
    if (!ALLOWED_OVERLAY.includes(top)) { refused.push(rel); continue; }
    const dst = path.join(root, rel);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(p, dst); applied.push(rel);
  }
  for (const f of ['REPORT.md', 'CHANGELOG.md']) {
    const p = path.join(improve, f);
    if (fs.existsSync(p)) fs.copyFileSync(p, path.join(REVIEW, `${branch.replace('/', '_')}-${f}`));
  }
  lines.push(`  طُبِّق ${applied.length} ملفًا · حُجز للمراجعة ${held.length} (data/ و OUT/) · رُفض ${refused.length} خارج المسارات المسموحة`);
  for (const r of refused) lines.push(`    ✗ ${r}`);

  lines.push('▸ npm run verify …');
  // npm عبر node نفسه: لا shell ولا تسلسل وسائط غير مهرَّبة
  const npmCli = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
  const v = spawnSync(process.execPath, [npmCli, 'run', 'verify'], { cwd: root, encoding: 'utf8' });
  const tail = (v.stdout + v.stderr).trim().split('\n').slice(-12).join('\n');
  lines.push(tail);
  const ok = v.status === 0;
  lines.push(ok ? `✔ البوابات خضراء على الفرع ${branch}. القرار للمالك: دمج، أو حذف الفرع.` : `✗ البوابات فشلت على الفرع ${branch}. لا دمج. راجع الأخطاء أعلاه أو احذف الفرع.`);
  lines.push(`  التراجع: git checkout main && git branch -D ${branch}`);
  return { ok, branch, applied, held, refused, report: lines.join('\n') };
}

module.exports = { harvest, pack, ingest, REQUEST_TEXT, projectRoot };
