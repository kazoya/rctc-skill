'use strict';
/**
 * ملف تعريف «web-project» — الدورة نفسها (حصاد → ضغط → استشارة → استيعاب) على **أي** مستودع
 * كود له package.json (Next.js، Node، …). أُنشئ وجُرِّب على World Cup Fintech Festival (2026-09-17).
 *
 * الفرق عن portfolio-site: لا افتراض عن اسم المشروع ولا عن مساراته؛ الحقائق تُقرأ مما هو
 * موجود فعلاً (git، سجلات verify/build/test، app/ routes، سجل الادعاءات في data/site.ts إن وُجد).
 * والاستيعاب **مراجعة فقط**: لا فرع ولا كتابة في المشروع؛ يُنتج DIFF-REPORT.md ونسخ الملفات
 * المتغيرة في review/ ثم يترك الدمج للمالك (الدرس الموثّق: الوكلاء الخارجيون يبالغون أحياناً
 * في وصف ما هو «مبني»؛ كل ادعاء يُعاد التحقق منه ضد مصادر المشروع قبل الدمج).
 */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');

const SKILL_ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(SKILL_ROOT, 'out');
const REVIEW = path.join(SKILL_ROOT, 'review');
const HERE = __dirname;

const SKIP_DIRS = new Set(['node_modules', '.next', '.git', '_in', 'out', 'review', 'test-results', 'playwright-report', '.vercel', '.handoff-stage', 'kit', 'files', 'journal']);
const SKIP_FILES = new Set(['build.log', 'test.log', 'tsconfig.tsbuildinfo', 'next-env.d.ts', 'project.json', 'brain.json', 'BRAIN.md']);
const SKIP_EXT = new Set(['.zip', '.docx', '.log', '.pem']);

function say(s = '') { process.stdout.write(s + '\n'); }
function stamp() { const d = new Date(), p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}-${p(d.getMinutes())}`; }
/** PowerShell يقبل الشرطة الأمامية؛ الشرطة الخلفية داخل -Command تُشوَّه (\r, \t…). */
const fwd = p => path.resolve(p).replace(/\\/g, '/');
function ps(cmd) { return execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', `$ErrorActionPreference='Stop'; ${cmd}`], { windowsHide: true, encoding: 'utf8' }); }
/* .NET ZipFile بدل Compress/Expand-Archive: أسرع، يتحمل الأسماء العربية والمسارات الطويلة، ولا «تراجع» فاشل عند تحذير. */
const NET = "Add-Type -AssemblyName System.IO.Compression.FileSystem; ";
function zipDir(stage, zip) {
  fs.rmSync(zip, { force: true });
  if (process.platform === 'win32') ps(`${NET}[System.IO.Compression.ZipFile]::CreateFromDirectory('${fwd(stage)}', '${fwd(zip)}', [System.IO.Compression.CompressionLevel]::Optimal, $false)`);
  else execFileSync('zip', ['-qr', zip, '.'], { cwd: stage });
}
function unzipTo(zip, dst) {
  fs.rmSync(dst, { recursive: true, force: true }); fs.mkdirSync(path.dirname(dst), { recursive: true });
  if (process.platform === 'win32') ps(`${NET}[System.IO.Compression.ZipFile]::ExtractToDirectory('${fwd(zip)}', '${fwd(dst)}')`);
  else { fs.mkdirSync(dst, { recursive: true }); execFileSync('unzip', ['-qo', zip, '-d', dst]); }
  return dst;
}

function projectRoot(opts = {}) {
  const root = path.resolve(opts.root || process.env.UZ_ROOT || process.cwd());
  if (!fs.existsSync(path.join(root, 'package.json'))) throw new Error(`لا package.json في ${root} — شغّل من جذر المشروع أو مرّر --root`);
  return root;
}
function projectName(root) { try { return JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).name || path.basename(root); } catch { return path.basename(root); } }
function cacheFor(root) { return path.join(OUT, `web-project-${projectName(root).replace(/[^a-z0-9._-]+/gi, '-')}-live-latest.json`); }
function git(root, args) { try { return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return ''; } }
function readIf(p, max = 400000) { try { return fs.readFileSync(p, 'utf8').slice(0, max); } catch { return null; } }

function walk(dir, root, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(p, root, acc); continue; }
    if (SKIP_FILES.has(e.name) || SKIP_EXT.has(path.extname(e.name).toLowerCase()) || /^\.env(?!\.example)/.test(e.name)) continue;
    if (fs.statSync(p).size > 15 * 1024 * 1024) continue;
    acc.push(p);
  }
  return acc;
}

/* ------------------------------------------------------------------ harvest */

function routesFromApp(root) {
  const app = path.join(root, 'app'); if (!fs.existsSync(app)) return [];
  const out = [];
  (function w(dir, rel) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) w(path.join(dir, e.name), /^\(.*\)$/.test(e.name) ? rel : `${rel}/${e.name}`);
      else if (/^(page|route)\.(tsx|ts|jsx|js)$/.test(e.name)) out.push(rel || '/');
    }
  })(app, '');
  return [...new Set(out)].sort();
}
function testsFromLog(root) {
  const log = readIf(path.join(root, 'test.log')) || '';
  if (!log) { const f = path.join(root, 'test-results', '.last-run.json'); if (fs.existsSync(f)) { try { const j = JSON.parse(fs.readFileSync(f, 'utf8')); return { status: j.status, failed: (j.failedTests || []).length, source: '.last-run.json' }; } catch { /* ignore */ } } return null; }
  const p = log.match(/(\d+)\s+passed/), f = log.match(/(\d+)\s+failed/);
  return { passed: p ? +p[1] : null, failed: f ? +f[1] : 0, status: f && +f[1] > 0 ? 'failed' : 'passed', source: 'test.log', at: fs.statSync(path.join(root, 'test.log')).mtime.toISOString() };
}
function buildFromLog(root) {
  const log = readIf(path.join(root, 'build.log')) || '';
  if (!log) return null;
  return { ok: !/Build error|Failed to compile/i.test(log), routes: (log.match(/[○●ƒ]\s+\/\S*/g) || []).length, source: 'build.log', at: fs.statSync(path.join(root, 'build.log')).mtime.toISOString() };
}
function claimsFrom(root) {
  const src = readIf(path.join(root, 'data', 'site.ts'), 600000); if (!src) return [];
  const out = []; const re = /\{\s*claim:\s*"([^"]+)",\s*status:\s*"([^"]+)"/g; let m;
  while ((m = re.exec(src))) out.push({ claim: m[1], status: m[2] });
  return out;
}
function axeSummary(dir) {
  if (!fs.existsSync(dir)) return null;
  let pages = 0, serious = 0, other = 0;
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) { pages++; try { for (const v of JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))) { if (v.impact === 'serious' || v.impact === 'critical') serious += v.nodes; else other += v.nodes; } } catch { /* skip */ } }
  return { pages, seriousOrCritical: serious, other };
}

async function harvest(opts = {}) {
  const root = projectRoot(opts);
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  say(`▸ حصاد حقائق المشروع ${pkg.name || path.basename(root)}…`);
  const live = {
    profile: 'web-project', harvestedAt: new Date().toISOString(), root,
    project: { name: pkg.name || null, version: pkg.version || null, scripts: pkg.scripts || {}, deps: Object.keys(pkg.dependencies || {}), devDeps: Object.keys(pkg.devDependencies || {}) },
    git: { head: git(root, ['rev-parse', '--short', 'HEAD']), branch: git(root, ['rev-parse', '--abbrev-ref', 'HEAD']), dirty: git(root, ['status', '--porcelain']).split('\n').filter(Boolean).length, recent: git(root, ['log', '--oneline', '-15']).split('\n').filter(Boolean), remote: git(root, ['remote', 'get-url', 'origin']) || null },
    routes: routesFromApp(root),
    tests: testsFromLog(root),
    build: buildFromLog(root),
    axe: axeSummary(path.join(root, 'docs', 'reports', 'axe')),
    claims: claimsFrom(root),
  };
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(cacheFor(root), JSON.stringify(live, null, 1), 'utf8');
  say(`  HEAD ${live.git.head || '—'} (${live.git.branch || '—'}) · ${live.git.dirty} غير ملتزم · ${live.routes.length} مساراً · اختبارات: ${live.tests ? `${live.tests.passed ?? live.tests.status} ناجح / ${live.tests.failed ?? '—'} فاشل` : 'لا سجل'} · بناء: ${live.build ? (live.build.ok ? 'ناجح' : 'فاشل') : 'لا سجل'} · ادعاءات: ${live.claims.length}`);
  say(`  حُفظ: ${cacheFor(root)}`);
  return live;
}

/* --------------------------------------------------------------------- pack */

function summaryMd(live, root) {
  const byStatus = live.claims.reduce((a, c) => (a[c.status] = (a[c.status] || 0) + 1, a), {});
  const prev = readIf(path.join(root, 'docs', 'HANDOFF_IMPROVEMENT_BRIEF.md'), 60000);
  return `# موجز حقائق المشروع — ${live.project.name || path.basename(root)}

أُنشئ: ${live.harvestedAt.slice(0, 16)} · **المستودع:** ${live.git.remote || 'محلي'} @ \`${live.git.head}\` (${live.git.branch}, ${live.git.dirty} ملفاً غير ملتزم)

## البوابات كما قيست
| البوابة | القيمة |
|---|---|
| الاختبارات | ${live.tests ? `${live.tests.passed ?? live.tests.status} ناجح · ${live.tests.failed ?? '—'} فاشل (${live.tests.source}${live.tests.at ? ' · ' + live.tests.at.slice(0, 16) : ''})` : 'لا سجل اختبارات مرفق'} |
| البناء | ${live.build ? (live.build.ok ? `ناجح · ${live.build.routes} مساراً` : 'فاشل') + ` (${live.build.source})` : 'لا سجل بناء مرفق'} |
| axe | ${live.axe ? `${live.axe.pages} تقريراً · ${live.axe.seriousOrCritical} مخالفة جسيمة/حرجة` : 'لا تقارير'} |
| التبعيات | ${live.project.deps.join(', ') || '—'} |

## المسارات (${live.routes.length})
${live.routes.map(r => `- \`${r}\``).join('\n') || '- (لا مجلد app/)'}

## سجل الادعاءات (${live.claims.length})
${Object.entries(byStatus).map(([s, n]) => `- ${s}: ${n}`).join('\n') || '- لا سجل ادعاءات في data/site.ts'}

> أي ادعاء بحالة غير \`safe\` **لا يُحوَّل** إلى ادعاء مبني في أي اقتراح.

## آخر الالتزامات
\`\`\`
${live.git.recent.join('\n')}
\`\`\`

## السكربتات
${Object.entries(live.project.scripts).map(([k, v]) => `- \`${k}\`: \`${v}\``).join('\n')}

## تقرير التحسين السابق (إن وُجد)
${prev || '(لا تقرير سابق — هذه أول دورة)'}
`;
}

function pack(opts = {}) {
  const root = projectRoot(opts);
  const cache = cacheFor(root);
  let live = null;
  if (fs.existsSync(cache)) { live = JSON.parse(fs.readFileSync(cache, 'utf8')); say('  استُخدم حصاد محفوظ (' + live.harvestedAt.slice(0, 16) + ')'); }
  if (!live) throw new Error('لا حصاد — شغّل `harvest` أولاً (أو `cycle`) حتى تحمل الحزمة أرقاماً لا انطباعات');

  const name = `${(live.project.name || path.basename(root)).replace(/[^a-z0-9._-]+/gi, '-')}-consult-${stamp()}`;
  const stage = path.join(os.tmpdir(), name);
  fs.rmSync(stage, { recursive: true, force: true });
  fs.mkdirSync(path.join(stage, 'source'), { recursive: true });

  fs.writeFileSync(path.join(stage, 'SUMMARY.md'), summaryMd(live, root), 'utf8');
  fs.copyFileSync(path.join(HERE, 'CONSTRAINTS.md'), path.join(stage, 'CONSTRAINTS.md'));
  fs.copyFileSync(path.join(HERE, 'ASK.md'), path.join(stage, 'ASK.md'));
  fs.writeFileSync(path.join(stage, 'FACTS.json'), JSON.stringify(live, null, 1), 'utf8');
  for (const f of ['README.md', 'CLAUDE.md']) if (fs.existsSync(path.join(root, f))) fs.copyFileSync(path.join(root, f), path.join(stage, f));
  const docs = path.join(root, 'docs');
  if (fs.existsSync(docs)) {
    fs.mkdirSync(path.join(stage, 'docs'), { recursive: true });
    for (const f of fs.readdirSync(docs).filter(f => f.endsWith('.md'))) fs.copyFileSync(path.join(docs, f), path.join(stage, 'docs', f));
    const shots = path.join(docs, 'screenshots');
    if (fs.existsSync(shots)) {
      fs.mkdirSync(path.join(stage, 'screenshots'), { recursive: true });
      for (const f of fs.readdirSync(shots).filter(f => /\.(png|webp|jpg)$/i.test(f)).sort().slice(-8)) fs.copyFileSync(path.join(shots, f), path.join(stage, 'screenshots', f));
    }
  }
  for (const p of walk(root, root)) {
    const dst = path.join(stage, 'source', path.relative(root, p));
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(p, dst);
  }
  // بصمة كل ملف: يعرف المستلم ما وصله بالضبط، ونعرف نحن ما عاد
  const lines = [];
  (function m(dir, rel) { for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) { const p = path.join(dir, e.name), r = path.posix.join(rel, e.name); if (e.isDirectory()) m(p, r); else lines.push(`${createHash('sha256').update(fs.readFileSync(p)).digest('hex')}  ./${r}`); } })(stage, '');
  fs.writeFileSync(path.join(stage, 'MANIFEST_SHA256.txt'), lines.join('\n') + '\n', 'utf8');

  fs.mkdirSync(OUT, { recursive: true });
  const zip = path.join(OUT, name + '.zip');
  zipDir(stage, zip);
  fs.rmSync(stage, { recursive: true, force: true });
  return { zip, bytes: fs.statSync(zip).size, files: lines.length };
}

const REQUEST_TEXT = `«مرفق ملف مضغوط لمشروع برمجي (source/ كاملاً بلا node_modules). اقرأ SUMMARY.md أولاً ثم
CONSTRAINTS.md (ملزمة)، ثم docs/ إن وُجد، ونفّذ ما في ASK.md حرفياً: أعد ZIP فيه IMPROVEMENT_REPORT.md
وsource/ بالملفات المتغيرة أو الجديدة فقط بمساراتها الأصلية. لا ادعاءات بلا دليل من الحزمة، لا نشر،
ولا تغيير للقواعد المحمية؛ وإن عجزت عن تشغيل شيء فقل ذلك ولا تسجّله نجاحاً.»`;

/* ------------------------------------------------------------------- ingest */

function findSource(dir) {
  for (const name of ['source', 'changed-files']) if (fs.existsSync(path.join(dir, name))) return path.join(dir, name);
  const subs = fs.readdirSync(dir, { withFileTypes: true }).filter(e => e.isDirectory());
  for (const s of subs) { const r = findSource(path.join(dir, s.name)); if (r) return r; }
  return null;
}
function listFiles(dir, rel = '', out = []) { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const r = path.posix.join(rel, e.name); if (e.isDirectory()) listFiles(path.join(dir, e.name), r, out); else out.push(r); } return out; }

/** مراجعة فقط: لا فرع ولا كتابة في المشروع. */
function ingest(input, opts = {}) {
  const root = projectRoot(opts);
  if (!input) throw new Error('حدّد ملف الحزمة المضغوط أو مجلدها');
  const abs = path.resolve(input);
  if (!fs.existsSync(abs)) throw new Error(`غير موجود: ${abs}`);
  const bucket = path.join(REVIEW, `${stamp()}-${path.basename(abs).replace(/\.zip$/i, '').slice(0, 48)}`);
  fs.mkdirSync(bucket, { recursive: true });
  // الفكّ في مجلد مؤقت قصير: .NET Framework يرفض المسارات فوق 260 حرفاً، وحزم المشاريع عميقة
  const dir = /\.zip$/i.test(abs) ? unzipTo(abs, path.join(os.tmpdir(), 'uz-' + stamp().slice(11))) : abs;
  const src = findSource(dir);
  const lines = [`# نتيجة استيعاب حزمة التحسين — ${stamp()}`, '', `المصدر: \`${abs}\``, `المشروع: ${projectName(root)} @ \`${git(root, ['rev-parse', '--short', 'HEAD'])}\``, ''];
  if (!src) { lines.push('✗ لا مجلد source/ ولا changed-files/ داخل الحزمة — لا يمكن حساب الفرق.'); const report = lines.join('\n'); fs.writeFileSync(path.join(bucket, 'INGEST-REPORT.md'), report, 'utf8'); return { ok: false, report, bucket }; }

  const changed = [], added = [], same = [];
  for (const rel of listFiles(src)) {
    if (rel.split('/').some(seg => SKIP_DIRS.has(seg))) continue;
    const mine = path.join(root, rel), theirs = path.join(src, rel);
    if (!fs.existsSync(mine)) added.push(rel);
    else if (!fs.readFileSync(mine).equals(fs.readFileSync(theirs))) changed.push(rel);
    else same.push(rel);
  }
  const stageDir = path.join(bucket, 'changed');
  const diffs = [];
  for (const rel of [...changed, ...added]) {
    const dst = path.join(stageDir, rel); fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(path.join(src, rel), dst);
    let d = '';
    if (changed.includes(rel)) { try { d = execFileSync('git', ['diff', '--no-index', '--', path.join(root, rel), path.join(src, rel)], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch (e) { d = e.stdout || ''; } }
    diffs.push(`\n\n## ${changed.includes(rel) ? 'تغيير' : 'ملف جديد'}: \`${rel}\`\n\n${d ? '```diff\n' + d.slice(0, 20000) + '\n```' : '(ملف جديد — انظر changed/)'}`);
  }
  fs.writeFileSync(path.join(bucket, 'DIFF-REPORT.md'), `# فرق حزمة التحسين مقابل الشجرة الحالية\n\nمتغيرة: ${changed.length} · جديدة: ${added.length} · مطابقة: ${same.length}` + diffs.join(''), 'utf8');
  const top = path.dirname(src);
  const reports = fs.readdirSync(top).filter(f => /\.md$/i.test(f));
  for (const f of reports) fs.copyFileSync(path.join(top, f), path.join(bucket, f));

  lines.push(`## الملفات المتغيرة (${changed.length})`, ...changed.map(f => `- ${f}`), '', `## الملفات الجديدة (${added.length})`, ...added.map(f => `- ${f}`), '', `## مطابقة: ${same.length}`, '',
    `## تقارير الوكيل المرفقة (نُسخت إلى المجلد)`, ...(reports.length ? reports.map(f => `- ${f}`) : ['- (لا تقرير مرفق)']), '',
    `الفرق التفصيلي: \`${path.join(bucket, 'DIFF-REPORT.md')}\` · النسخ المتغيرة: \`${stageDir}\``, '',
    '**لم يُكتب أي ملف في المشروع.** خطوات الدمج: راجع كل فرق، تحقق من كل ادعاء ضد مصادر المشروع، انسخ ما يمرّ، ثم شغّل بوابة القبول (`npm run verify`).');
  const report = lines.join('\n');
  fs.writeFileSync(path.join(bucket, 'INGEST-REPORT.md'), report, 'utf8');
  return { ok: true, report, bucket, changed, added };
}

module.exports = { harvest, pack, ingest, REQUEST_TEXT, projectRoot };
