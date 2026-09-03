#!/usr/bin/env node
'use strict';
/**
 * mb — Master Brain CLI (terminal channel for humans, Claude Code and Claude Desktop).
 *   node bin/mb.js help
 */
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const u = require('../src/util');
const I = require('../src/i18n');
const { loadConfig, saveConfig, PLATFORM_ROOT, VERSION } = require('../src/config');
const { Store } = require('../src/store');
const { OPS } = require('../src/ops');

const HELP = `
Master Brain v${VERSION} — منصة المتابعة والعقل الهندسي / Portfolio tracker & engineering mind
Platform root: ${PLATFORM_ROOT}

USAGE  node bin/mb.js <command> [options]      (or just:  mb <command>  after install)

SETUP
  init [--root <projectsRoot>] [--seed <file.json>] [--force]   إنشاء config.json والمجلدات وتهيئة المشاريع من ملف seed
  doctor                                                        فحص البيئة والروابط مع Claude
  serve [--port 4545] [--open]                                  تشغيل لوحة التحكم (HTTP)
  mcp                                                           تشغيل خادم MCP عبر stdio (تستخدمه Claude Code / Claude Desktop)
  open                                                          فتح اللوحة في المتصفح

PROJECTS
  list [--json]                                                 قائمة المشاريع
  new <id> --ar "الاسم" --en "Name" [--desc-ar ..] [--desc-en ..] [--status active] [--priority 1] [--tags a,b] [--path ..]
  show <id> [--json]                                            عرض مشروع مع عقله الهندسي وسجله
  set <id> [--status ..] [--priority n] [--progress n] [--revenue yes|no|unknown] [--ar ..] [--en ..] [--tags ..]
  context <id|all> [--lang ar|en]                               كتلة سياق جاهزة للّصق في Claude Desktop
  scan                                                          إعادة مسح مجلد المشاريع وتحديث السجل
  sync                                                          إعادة توليد BRAIN.md / CLAUDE.md لكل المشاريع

BRAIN / JOURNAL
  log <id> --title ".." [--body ".."|--file f.md] [--type progress|milestone|decision|blocker|suggestion|note|report]
           [--progress n] [--model opus|sonnet|fable|haiku|claude|human] [--status ..] [--tags a,b] [--date ISO]
  brain <id> add <section> "text" [--by model] [--evidence ..]  sections: ${I.SECTION_KEYS.join('|')}
  brain <id> move <section> <itemId> <targetSection>            نقل بند (مثلاً current → done)
  brain <id> status <section> <itemId> <proposed|accepted|rejected|done>
  brain <id> rm <section> <itemId>
  suggest <id> "text" --by <opus|sonnet|fable|haiku> [--evidence ..]   مقترح تحسين منسوب للنموذج

REPORTS
  report [--from YYYY-MM-DD] [--to YYYY-MM-DD] [--project a,b|all] [--status active,blocked] [--types progress,milestone]
         [--models opus,fable] [--min-progress n] [--max-progress n] [--group status|priority|none]
         [--format html|md|xlsx|json|pdf|all] [--lang ar|en] [--title ".."] [--platform] [--only-active] [--open]

PLATFORM BRAIN (what Claude learned / skills / tools / capabilities)
  learn <learned|skills|tools|capabilities> "text" [--name ..] [--source ..] [--url ..] [--install ..] [--status ..] [--by model]
  brain-platform [--json]                                       عرض العقل العام
  request-tool <name> --reason ".." [--command ..] [--url ..] [--by model]   طلب تثبيت أداة (يظهر للمالك للموافقة)
  approve <requestId> | reject <requestId> [--note ..]          قرار المالك على طلب أداة

INBOX (owner → Claude)
  task add "task text" [--project id] [--priority 1-5]          إضافة مهمة لكلود
  tasks [--status pending|in_progress|done]                     عرض المهام
  task done <id> [--result ".."] | task start <id> | task reject <id>

  ops                                                           قائمة عمليات MCP/API المتاحة
  version | help
`;

function out(x) { process.stdout.write((typeof x === 'string' ? x : JSON.stringify(x, null, 2)) + '\n'); }
function fail(msg) { process.stderr.write(`✖ ${msg}\n`); process.exit(1); }

function openInBrowser(url) {
  const cmd = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]] : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
  try { spawn(cmd[0], cmd[1], { detached: true, stdio: 'ignore' }).unref(); } catch { /* ignore */ }
}

function seedProjects(store, seedPath, { force = false } = {}) {
  const seed = u.readJson(seedPath, null);
  if (!seed) throw new Error(`Seed file not found: ${seedPath}`);
  const created = [], skipped = [];
  for (const p of seed.projects || []) {
    if (store.projectDir(p.id)) {
      if (!force) { skipped.push(p.id); continue; }
    }
    const input = { ...p, path: p.path ? p.path.replace('{platformRoot}', store.cfg.platformRoot) : undefined };
    if (store.projectDir(p.id)) {
      // force: merge brain items & journal into existing project (no duplicates by text)
      const existing = store.getProject(p.id);
      for (const k of I.SECTION_KEYS) for (const it of ((p.brain && p.brain.sections && p.brain.sections[k]) || [])) {
        if (!existing.brain.sections[k].some(x => x.text === (it.text || it))) store.addBrainItem(p.id, k, it);
      }
      for (const j of (p.journal || [])) if (!existing.journal.some(x => x.title === j.title)) store.addJournal(p.id, j, { silent: true });
      store.renderProjectFiles(p.id);
      created.push(p.id + ' (merged)');
      continue;
    }
    store.createProject(input);
    created.push(p.id);
  }
  if (seed.platformBrain) {
    const pb = store.getPlatformBrain();
    for (const k of I.KIND_KEYS) for (const it of (seed.platformBrain[k] || [])) {
      const key = it.name || it.text;
      if (!pb[k].some(x => (x.name || x.text) === key)) store.addPlatformItem(k, it);
    }
  }
  if (seed.sessions) {
    const reg = store.loadRegistry();
    reg.sessions = seed.sessions;
    store.saveRegistry(reg);
  }
  return { created, skipped };
}

function fmtProjectLine(p, lang) {
  const name = u.localized(p.name, lang);
  return `${(p.priority ? 'P' + p.priority : 'P-').padEnd(3)} ${String(p.progress).padStart(3)}%  ${I.statusLabel(p.status, lang).padEnd(10)} ${p.id.padEnd(26)} ${name}  (${u.fmtDate(p.lastActivity, undefined, false)})`;
}

async function main() {
  const args = u.parseArgs(process.argv.slice(2));
  const [cmd, ...rest] = args._;
  const cfg = loadConfig();
  const store = new Store(cfg);
  const lang = args.lang === 'en' ? 'en' : (args.lang === 'ar' ? 'ar' : cfg.defaultLang);

  try {
    switch (cmd) {
      case undefined: case 'help': case '--help': case '-h': out(HELP); break;
      case 'version': out(VERSION); break;

      case 'init': {
        if (args.root) cfg.projectsRoot = path.resolve(String(args.root));
        if (!cfg.configExists || args.force) saveConfig(cfg);
        u.ensureDir(cfg.projectsRoot);
        u.ensureDir(cfg.dataDir);
        u.ensureDir(cfg.reportsDirAbs);
        if (!u.exists(store.platformBrainPath)) store.savePlatformBrain(Store.emptyPlatformBrain());
        if (!u.exists(store.requestsPath)) u.writeJson(store.requestsPath, []);
        store.scan();
        const seedPath = args.seed ? path.resolve(String(args.seed)) : path.join(PLATFORM_ROOT, 'seed', 'initial-projects.json');
        let seeded = { created: [], skipped: [] };
        if (u.exists(seedPath)) seeded = seedProjects(store, seedPath, { force: !!args.force });
        store.syncAll();
        out(`✔ config: ${cfg.configPath}\n✔ projects root: ${cfg.projectsRoot}\n✔ data: ${cfg.dataDir}\n✔ seeded: ${seeded.created.join(', ') || '—'}${seeded.skipped.length ? `\n• already existed (skipped): ${seeded.skipped.join(', ')}` : ''}\n\nNext:  node bin/mb.js serve --open`);
        break;
      }
      case 'doctor': {
        const lines = [];
        lines.push(`Node ${process.version} ${parseInt(process.versions.node) >= 18 ? '✔' : '✖ (need ≥ 18)'}`);
        lines.push(`Platform root: ${PLATFORM_ROOT}`);
        lines.push(`config.json: ${cfg.configExists ? '✔' : '✖ (run: mb init)'}  → projectsRoot=${cfg.projectsRoot} ${u.isDir(cfg.projectsRoot) ? '✔' : '✖ missing'}`);
        lines.push(`registry: ${u.exists(store.registryPath) ? '✔ ' + store.listProjects().length + ' projects' : '✖ (run: mb init / mb scan)'}`);
        lines.push(`.mcp.json (Claude Code): ${u.exists(path.join(PLATFORM_ROOT, '.mcp.json')) ? '✔' : '✖'}`);
        const desktopCfg = process.platform === 'win32' ? path.join(process.env.APPDATA || '', 'Claude', 'claude_desktop_config.json') : process.platform === 'darwin' ? path.join(process.env.HOME || '', 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json') : path.join(process.env.HOME || '', '.config', 'Claude', 'claude_desktop_config.json');
        const dc = u.readJson(desktopCfg, null);
        lines.push(`Claude Desktop config: ${dc ? (dc.mcpServers && dc.mcpServers['master-brain'] ? '✔ master-brain registered' : '• found, master-brain NOT registered (run scripts/install.ps1)') : '• not found: ' + desktopCfg}`);
        const skillsDir = path.join(process.env.USERPROFILE || process.env.HOME || '', '.claude', 'skills');
        lines.push(`Claude Code skills: ${['start-skill', 'master-brain'].map(s => `${s} ${u.exists(path.join(skillsDir, s, 'SKILL.md')) ? '✔' : '✖'}`).join(', ')}  (${skillsDir})`);
        const { findBrowser } = require('../src/reports');
        lines.push(`PDF engine (headless Edge/Chrome): ${findBrowser() || '✖ not found — HTML reports print to PDF from the browser'}`);
        out(lines.join('\n'));
        break;
      }
      case 'serve': {
        process.env.MB_PORT = String(args.port || cfg.port);
        const { startServer } = require('./server');
        const srv = await startServer({ port: parseInt(process.env.MB_PORT, 10), host: cfg.host, open: !!args.open || cfg.openBrowserOnServe });
        out(`Master Brain dashboard → http://${cfg.host}:${srv.port}   (Ctrl+C to stop)`);
        break;
      }
      case 'mcp': { require('./mcp'); break; }
      case 'open': { openInBrowser(`http://${cfg.host}:${cfg.port}`); out('opening…'); break; }

      case 'list': {
        const list = store.listProjects();
        if (args.json) return out(list);
        out(list.map(p => fmtProjectLine(p, lang)).join('\n') || '(no projects — run: mb init)');
        break;
      }
      case 'new': {
        const id = rest[0];
        if (!id) fail('usage: mb new <id> --ar "..." --en "..."');
        const p = store.createProject({ id, nameAr: args.ar, nameEn: args.en, descAr: args['desc-ar'], descEn: args['desc-en'], status: args.status, priority: args.priority, revenue: args.revenue, progress: args.progress, tags: args.tags, sessions: args.sessions, path: args.path });
        out(`✔ created ${p.id} → ${p.path}`);
        break;
      }
      case 'show': {
        const p = store.getProject(rest[0]);
        if (!p) fail(`project "${rest[0]}" not found`);
        if (args.json) return out(p);
        out(store.renderBrainMd(p, lang));
        break;
      }
      case 'set': {
        const p = store.updateProject(rest[0], { status: args.status, priority: args.priority, progress: args.progress, revenue: args.revenue, nameAr: args.ar, nameEn: args.en, descAr: args['desc-ar'], descEn: args['desc-en'], tags: args.tags, sessions: args.sessions });
        out(fmtProjectLine(p, lang));
        break;
      }
      case 'context': out(store.contextBlock(rest[0] || 'all', lang)); break;
      case 'scan': { const reg = store.scan(); out(`✔ ${reg.projects.filter(p => !p.missing).length} projects (${reg.projects.filter(p => p.missing).length} missing) → ${store.registryPath}`); break; }
      case 'sync': { const ids = store.syncAll(); out(`✔ regenerated BRAIN.md for: ${ids.join(', ')}`); break; }

      case 'log': {
        const id = rest[0];
        if (!id || !args.title) fail('usage: mb log <id> --title "..." [--body ".."] [--type ..] [--progress n] [--model ..]');
        const body = args.file ? u.readText(path.resolve(String(args.file)), '') : (args.body || '');
        const e = store.addJournal(id, { title: args.title, body, type: args.type, progress: args.progress, model: args.model, status: args.status, tags: args.tags, date: args.date, source: args.source || 'cli' });
        out(`✔ logged ${e.id} → journal/${e.file}`);
        break;
      }
      case 'brain': {
        const [id, sub, section, a, b] = rest;
        if (!id || !sub) fail('usage: mb brain <id> add|move|status|rm ...');
        if (sub === 'add') { const it = store.addBrainItem(id, section, { text: a, by: args.by, evidence: args.evidence, date: args.date, source: 'cli' }); out(`✔ ${section} += ${it.id}`); }
        else if (sub === 'move') { const it = store.updateBrainItem(id, section, a, { moveTo: b }); out(`✔ moved ${it.id} → ${b}`); }
        else if (sub === 'status') { const it = store.updateBrainItem(id, section, a, { status: b }); out(`✔ ${it.id} status=${b}`); }
        else if (sub === 'rm') { store.removeBrainItem(id, section, a); out(`✔ removed ${a}`); }
        else if (sub === 'show') { out(store.renderBrainMd(store.getProject(id), lang)); }
        else fail(`unknown brain sub-command "${sub}"`);
        break;
      }
      case 'suggest': {
        const [id, text] = rest;
        if (!id || !text || !args.by) fail('usage: mb suggest <id> "text" --by <opus|sonnet|fable|haiku>');
        const it = store.addBrainItem(id, 'suggestions', { text, by: args.by, evidence: args.evidence, source: 'cli' });
        out(`✔ suggestion ${it.id} by ${it.by}`);
        break;
      }

      case 'report': {
        const res = OPS.generate_report.handler(store, {
          from: args.from, to: args.to, projects: args.project ? u.csv(args.project) : undefined, statuses: args.status ? u.csv(args.status) : undefined,
          types: args.types ? u.csv(args.types) : undefined, models: args.models ? u.csv(args.models) : undefined,
          min_progress: args['min-progress'], max_progress: args['max-progress'], group: args.group, lang, format: args.format || 'html', title: args.title,
          include_platform: !!args.platform, only_active_in_period: !!args['only-active'],
        });
        out(`✔ ${res.summary.projects} projects · ${res.summary.entries} entries · avg ${res.summary.avgProgress}%`);
        for (const f of res.files) out(`  → ${f.path} (${f.bytes} bytes)`);
        if (res.pdf && res.pdf.error) out(`  • PDF: ${res.pdf.error}`);
        if (args.open) { const html = res.files.find(f => f.format === 'html') || res.files[0]; openInBrowser('file:///' + html.path.replace(/\\/g, '/')); }
        break;
      }

      case 'learn': {
        const [kind, text] = rest;
        if (!kind || !text) fail('usage: mb learn <learned|skills|tools|capabilities> "text" [--name ..] [--source ..] [--url ..] [--install ..] [--status ..]');
        const it = store.addPlatformItem(kind, { text, name: args.name, source: args.source, url: args.url, install: args.install, status: args.status, notes: args.notes, by: args.by, project: args.project });
        out(`✔ ${kind} += ${it.id}`);
        break;
      }
      case 'brain-platform': {
        const b = store.getPlatformBrain();
        if (args.json) return out(b);
        for (const k of I.PLATFORM_KINDS) {
          out(`\n## ${lang === 'ar' ? k.ar : k.en} (${b[k.key].length})`);
          for (const it of b[k.key]) out(`- ${it.name ? it.name + ' — ' : ''}${it.text}${it.status ? ` [${it.status}]` : ''}${it.url ? ` <${it.url}>` : ''} (${I.modelLabel(it.by, lang)}, ${u.fmtDate(it.date, cfg.timezone, false)})`);
        }
        break;
      }
      case 'request-tool': {
        const name = rest[0];
        if (!name || !args.reason) fail('usage: mb request-tool <name> --reason "..."');
        const it = store.addPlatformItem('requests', { name, text: args.reason, command: args.command, url: args.url, by: args.by, project: args.project, status: 'pending' });
        out(`✔ request ${it.id} pending owner approval`);
        break;
      }
      case 'approve': case 'reject': {
        const it = store.updatePlatformItem('requests', rest[0], { status: cmd === 'approve' ? 'approved' : 'rejected', decision: args.note || '' });
        out(`✔ ${it.name}: ${it.status}`);
        break;
      }

      case 'task': {
        const [sub, a] = rest;
        if (sub === 'add') { const r = store.addRequest({ task: a, project: args.project, priority: args.priority, from: 'cli' }); out(`✔ task ${r.id} queued`); }
        else if (sub === 'done') { out(store.updateRequest(a, { status: 'done', result: args.result || '' })); }
        else if (sub === 'start') { out(store.updateRequest(a, { status: 'in_progress' })); }
        else if (sub === 'reject') { out(store.updateRequest(a, { status: 'rejected', result: args.result || '' })); }
        else fail('usage: mb task add "text" | done <id> | start <id> | reject <id>');
        break;
      }
      case 'tasks': {
        const list = store.listRequests({ status: args.status });
        if (args.json) return out(list);
        out(list.map(r => `${r.status.padEnd(12)} ${r.id}  P${r.priority}  ${r.project ? '[' + r.project + '] ' : ''}${r.task}${r.result ? ' → ' + r.result : ''}`).join('\n') || '(inbox empty)');
        break;
      }
      case 'ops': out(Object.entries(OPS).map(([k, v]) => `${k.padEnd(20)} ${v.description.split('.')[0]}`).join('\n')); break;
      default: fail(`unknown command "${cmd}" — run: mb help`);
    }
  } catch (e) {
    fail(e.message);
  }
}

main();
