'use strict';
/**
 * Master Brain — file-based store.
 *
 * Every project is a folder (default: <projectsRoot>/<id>) containing:
 *   project.json   metadata (name ar/en, status, priority, progress, tags, sessions, links)
 *   brain.json     the engineering mind: done / findings / current / next / improvements /
 *                  suggestions (attributed to a model) / decisions / blockers / constraints
 *   journal/       one Markdown file per progress entry (frontmatter + body)
 *   files/         working files of the project (free)
 *   BRAIN.md       rendered, human/Claude-readable view of brain.json + latest journal (generated)
 *   CLAUDE.md      instructions for Claude Code when opened inside the project folder (generated once)
 *
 * Platform-level data lives in <platformRoot>/data:
 *   registry.json        index of project folders (+ projects outside projectsRoot)
 *   platform-brain.json  what Claude learned, acquired skills, tools, capabilities, tool requests
 *   requests.json        task inbox: requests for Claude from the dashboard / owner
 */
const path = require('path');
const fs = require('fs');
const u = require('./util');
const I = require('./i18n');

class Store {
  constructor(cfg) {
    this.cfg = cfg;
    this.dataDir = cfg.dataDir;
    this.registryPath = path.join(cfg.dataDir, 'registry.json');
    this.platformBrainPath = path.join(cfg.dataDir, 'platform-brain.json');
    this.requestsPath = path.join(cfg.dataDir, 'requests.json');
  }

  // ------------------------------------------------------------------ registry
  loadRegistry() {
    const reg = u.readJson(this.registryPath, null) || { version: 1, updated: null, projects: [], sessions: [] };
    reg.projects = reg.projects || [];
    reg.sessions = reg.sessions || [];
    return reg;
  }
  saveRegistry(reg) {
    reg.updated = u.nowIso();
    u.writeJson(this.registryPath, reg);
    return reg;
  }
  /** Scan projectsRoot for folders with project.json; keep external entries; flag missing folders. */
  scan() {
    const reg = this.loadRegistry();
    const byId = new Map(reg.projects.map(p => [p.id, p]));
    const root = this.cfg.projectsRoot;
    for (const dir of u.listDirs(root)) {
      const full = path.join(root, dir);
      const pj = u.readJson(path.join(full, 'project.json'), null);
      if (!pj || !pj.id) continue;
      const entry = byId.get(pj.id) || { id: pj.id };
      entry.path = full;
      entry.missing = false;
      byId.set(pj.id, entry);
    }
    for (const entry of byId.values()) {
      entry.missing = !u.exists(path.join(entry.path || '', 'project.json'));
    }
    reg.projects = [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
    return this.saveRegistry(reg);
  }
  projectDir(id) {
    const reg = this.loadRegistry();
    const e = reg.projects.find(p => p.id === id);
    if (e && e.path) return e.path;
    const guess = path.join(this.cfg.projectsRoot, id);
    return u.exists(path.join(guess, 'project.json')) ? guess : null;
  }

  // ------------------------------------------------------------------ projects
  static emptyBrain() {
    const sections = {};
    for (const k of I.SECTION_KEYS) sections[k] = [];
    return { version: 1, updated: u.nowIso(), sections };
  }
  loadProjectJson(dir) { return u.readJson(path.join(dir, 'project.json'), null); }
  loadBrain(dir) {
    const b = u.readJson(path.join(dir, 'brain.json'), null) || Store.emptyBrain();
    b.sections = b.sections || {};
    for (const k of I.SECTION_KEYS) b.sections[k] = b.sections[k] || [];
    return b;
  }
  saveBrain(dir, brain) { brain.updated = u.nowIso(); u.writeJson(path.join(dir, 'brain.json'), brain); return brain; }
  saveProjectJson(dir, pj) { pj.updated = u.nowIso(); u.writeJson(path.join(dir, 'project.json'), pj); return pj; }

  listProjects({ includeMissing = false } = {}) {
    let reg = this.loadRegistry();
    if (!reg.projects.length && u.isDir(this.cfg.projectsRoot)) reg = this.scan();
    const out = [];
    for (const e of reg.projects) {
      if (e.missing && !includeMissing) continue;
      const pj = e.missing ? null : this.loadProjectJson(e.path);
      if (!pj) { if (includeMissing) out.push({ id: e.id, path: e.path, missing: true }); continue; }
      const journal = this.listJournal(e.path);
      const brain = this.loadBrain(e.path);
      const last = journal[0] ? journal[0].date : pj.updated;
      const counts = {};
      for (const k of I.SECTION_KEYS) counts[k] = brain.sections[k].length;
      out.push({
        ...pj, path: e.path, missing: false,
        lastActivity: last,
        journalCount: journal.length,
        brainCounts: counts,
        dormantSuggested: this.isDormant(last),
      });
    }
    return out.sort(Store.sortProjects);
  }
  static sortProjects(a, b) {
    const pa = a.priority > 0 ? a.priority : 99, pb = b.priority > 0 ? b.priority : 99;
    if (pa !== pb) return pa - pb;
    return String(b.lastActivity || '').localeCompare(String(a.lastActivity || ''));
  }
  isDormant(lastIso) {
    const days = u.daysBetween(lastIso, new Date());
    return days == null ? false : days >= (this.cfg.dormantAfterDays || 45);
  }
  getProject(id, { journalLimit = 0 } = {}) {
    const dir = this.projectDir(id);
    if (!dir) return null;
    const pj = this.loadProjectJson(dir);
    if (!pj) return null;
    const journal = this.listJournal(dir);
    return {
      ...pj, path: dir,
      brain: this.loadBrain(dir),
      journal: journalLimit ? journal.slice(0, journalLimit) : journal,
      journalCount: journal.length,
      lastActivity: journal[0] ? journal[0].date : pj.updated,
    };
  }
  createProject(input) {
    const id = input.id ? String(input.id).trim() : u.slugify(input.nameEn || (input.name && input.name.en) || input.nameAr || (input.name && input.name.ar));
    if (!u.isSafeId(id)) throw new Error(`Invalid project id "${id}" — use latin letters, digits, dash`);
    if (this.projectDir(id)) throw new Error(`Project "${id}" already exists`);
    const dir = input.path ? path.resolve(input.path) : path.join(this.cfg.projectsRoot, id);
    const now = u.nowIso();
    const pj = {
      id,
      name: { ar: input.nameAr || (input.name && input.name.ar) || id, en: input.nameEn || (input.name && input.name.en) || id },
      description: { ar: input.descAr || (input.description && input.description.ar) || '', en: input.descEn || (input.description && input.description.en) || '' },
      status: I.STATUS_KEYS.includes(input.status) ? input.status : 'planning',
      priority: u.clampInt(input.priority, 0, 5, 0),
      revenue: ['yes', 'no', 'unknown'].includes(input.revenue) ? input.revenue : 'unknown',
      progress: u.clampInt(input.progress, 0, 100, 0),
      tags: Array.isArray(input.tags) ? input.tags : u.csv(input.tags),
      sessions: Array.isArray(input.sessions) ? input.sessions : u.csv(input.sessions),
      links: Array.isArray(input.links) ? input.links : [],
      owner: input.owner || this.cfg.owner?.name || '',
      created: input.created || now,
      updated: now,
    };
    u.ensureDir(path.join(dir, 'journal'));
    u.ensureDir(path.join(dir, 'files'));
    u.writeJson(path.join(dir, 'project.json'), pj);
    const brain = Store.emptyBrain();
    if (input.brain && input.brain.sections) {
      for (const k of I.SECTION_KEYS) {
        for (const item of (input.brain.sections[k] || [])) brain.sections[k].push(Store.normalizeItem(item, k, this.cfg));
      }
    }
    this.saveBrain(dir, brain);
    const reg = this.loadRegistry();
    reg.projects = reg.projects.filter(p => p.id !== id);
    reg.projects.push({ id, path: dir, missing: false });
    reg.projects.sort((a, b) => a.id.localeCompare(b.id));
    this.saveRegistry(reg);
    for (const j of (input.journal || [])) this.addJournal(id, j, { silent: true });
    this.renderProjectFiles(id);
    return this.getProject(id);
  }
  updateProject(id, patch) {
    const dir = this.projectDir(id);
    if (!dir) throw new Error(`Project "${id}" not found`);
    const pj = this.loadProjectJson(dir);
    if (patch.nameAr || patch.nameEn) pj.name = { ar: patch.nameAr || pj.name.ar, en: patch.nameEn || pj.name.en };
    if (patch.name && typeof patch.name === 'object') pj.name = { ...pj.name, ...patch.name };
    if (patch.descAr !== undefined || patch.descEn !== undefined) pj.description = { ar: patch.descAr ?? pj.description.ar, en: patch.descEn ?? pj.description.en };
    if (patch.description && typeof patch.description === 'object') pj.description = { ...pj.description, ...patch.description };
    if (patch.status !== undefined) { if (!I.STATUS_KEYS.includes(patch.status)) throw new Error(`Invalid status "${patch.status}" (${I.STATUS_KEYS.join('|')})`); pj.status = patch.status; }
    if (patch.priority !== undefined) pj.priority = u.clampInt(patch.priority, 0, 5, pj.priority);
    if (patch.progress !== undefined) pj.progress = u.clampInt(patch.progress, 0, 100, pj.progress);
    if (patch.revenue !== undefined) pj.revenue = patch.revenue;
    if (patch.tags !== undefined) pj.tags = Array.isArray(patch.tags) ? patch.tags : u.csv(patch.tags);
    if (patch.sessions !== undefined) pj.sessions = Array.isArray(patch.sessions) ? patch.sessions : u.csv(patch.sessions);
    if (patch.links !== undefined) pj.links = patch.links;
    if (patch.owner !== undefined) pj.owner = patch.owner;
    this.saveProjectJson(dir, pj);
    this.renderProjectFiles(id);
    return this.getProject(id);
  }

  // ------------------------------------------------------------------ journal
  listJournal(dir, filter = {}) {
    const jdir = path.join(dir, 'journal');
    const entries = [];
    for (const f of u.listFiles(jdir, '.md')) {
      const { meta, body } = u.parseFrontmatter(u.readText(path.join(jdir, f), ''));
      const e = {
        id: meta.id || f.replace(/\.md$/, ''),
        file: f,
        date: meta.date || null,
        type: I.TYPE_KEYS.includes(meta.type) ? meta.type : 'note',
        title: meta.title || f,
        progress: meta.progress !== undefined && meta.progress !== '' ? u.clampInt(meta.progress, 0, 100, null) : null,
        model: meta.model || 'claude',
        source: meta.source || '',
        tags: u.csv(meta.tags),
        body,
      };
      entries.push(e);
    }
    entries.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')) || b.file.localeCompare(a.file));
    return Store.filterJournal(entries, filter);
  }
  static filterJournal(entries, { from, to, types, models } = {}) {
    const f = u.toDate(from), t = u.endOfDay(to);
    const ty = types && types.length ? new Set(types) : null;
    const mo = models && models.length ? new Set(models) : null;
    return entries.filter(e => {
      const d = u.toDate(e.date);
      if (f && (!d || d < f)) return false;
      if (t && (!d || d > t)) return false;
      if (ty && !ty.has(e.type)) return false;
      if (mo && !mo.has(e.model)) return false;
      return true;
    });
  }
  addJournal(id, entry, { silent = false } = {}) {
    const dir = this.projectDir(id);
    if (!dir) throw new Error(`Project "${id}" not found`);
    const date = u.toDate(entry.date) || new Date();
    const type = I.TYPE_KEYS.includes(entry.type) ? entry.type : 'note';
    const model = I.MODEL_KEYS.includes(entry.model) ? entry.model : (this.cfg.defaultModel || 'claude');
    const title = String(entry.title || '').trim();
    if (!title) throw new Error('Journal entry needs a title');
    const stamp = u.dateStamp(date, this.cfg.timezone);
    const eid = entry.id || `j-${stamp}-${u.shortId()}`;
    const fname = `${stamp.slice(0, 8)}-${stamp.slice(8)}-${u.slugify(title).slice(0, 40) || 'entry'}-${eid.slice(-4)}.md`;
    const meta = {
      id: eid, date: date.toISOString(), type, title,
      progress: entry.progress !== undefined && entry.progress !== null && entry.progress !== '' ? u.clampInt(entry.progress, 0, 100, '') : '',
      model, source: entry.source || 'cli', tags: Array.isArray(entry.tags) ? entry.tags : u.csv(entry.tags),
    };
    u.writeText(path.join(dir, 'journal', fname), u.buildFrontmatter(meta, entry.body || ''));
    const pj = this.loadProjectJson(dir);
    if (meta.progress !== '') pj.progress = meta.progress;
    if (entry.status && I.STATUS_KEYS.includes(entry.status)) pj.status = entry.status;
    this.saveProjectJson(dir, pj);
    if (!silent) this.renderProjectFiles(id);
    return { ...meta, file: fname, body: entry.body || '' };
  }

  // ------------------------------------------------------------------ brain items
  static normalizeItem(item, section, cfg) {
    const text = typeof item === 'string' ? item : item.text;
    if (!text || !String(text).trim()) throw new Error('Brain item needs text');
    const o = typeof item === 'string' ? {} : item;
    const out = {
      id: o.id || u.shortId('b'),
      text: String(text).trim(),
      date: (u.toDate(o.date) || new Date()).toISOString(),
      by: I.MODEL_KEYS.includes(o.by) ? o.by : (o.by ? 'other' : (section === 'suggestions' ? (cfg?.defaultModel || 'claude') : 'human')),
      source: o.source || 'cli',
    };
    if (o.byLabel) out.byLabel = o.byLabel;
    if (o.project) out.project = o.project;
    if (section === 'suggestions') out.status = ['proposed', 'accepted', 'rejected', 'done'].includes(o.status) ? o.status : 'proposed';
    if (o.evidence) out.evidence = o.evidence;
    return out;
  }
  addBrainItem(id, section, item) {
    if (!I.SECTION_KEYS.includes(section)) throw new Error(`Unknown section "${section}" (${I.SECTION_KEYS.join('|')})`);
    const dir = this.projectDir(id);
    if (!dir) throw new Error(`Project "${id}" not found`);
    const brain = this.loadBrain(dir);
    const it = Store.normalizeItem(item, section, this.cfg);
    brain.sections[section].push(it);
    this.saveBrain(dir, brain);
    this.renderProjectFiles(id);
    return it;
  }
  updateBrainItem(id, section, itemId, patch) {
    const dir = this.projectDir(id);
    if (!dir) throw new Error(`Project "${id}" not found`);
    const brain = this.loadBrain(dir);
    const list = brain.sections[section];
    if (!list) throw new Error(`Unknown section "${section}"`);
    const idx = list.findIndex(x => x.id === itemId);
    if (idx < 0) throw new Error(`Item "${itemId}" not found in ${section}`);
    const it = list[idx];
    if (patch.text !== undefined) it.text = String(patch.text).trim();
    if (patch.status !== undefined) it.status = patch.status;
    if (patch.by !== undefined) it.by = patch.by;
    if (patch.evidence !== undefined) it.evidence = patch.evidence;
    it.updated = u.nowIso();
    if (patch.moveTo && patch.moveTo !== section) {
      if (!brain.sections[patch.moveTo]) throw new Error(`Unknown target section "${patch.moveTo}"`);
      list.splice(idx, 1);
      it.movedFrom = section;
      brain.sections[patch.moveTo].push(it);
    }
    this.saveBrain(dir, brain);
    this.renderProjectFiles(id);
    return it;
  }
  removeBrainItem(id, section, itemId) {
    const dir = this.projectDir(id);
    if (!dir) throw new Error(`Project "${id}" not found`);
    const brain = this.loadBrain(dir);
    const list = brain.sections[section];
    if (!list) throw new Error(`Unknown section "${section}"`);
    const before = list.length;
    brain.sections[section] = list.filter(x => x.id !== itemId);
    if (brain.sections[section].length === before) throw new Error(`Item "${itemId}" not found`);
    this.saveBrain(dir, brain);
    this.renderProjectFiles(id);
    return true;
  }

  // ------------------------------------------------------------------ rendered files
  renderProjectFiles(id) {
    const p = this.getProject(id);
    if (!p) return;
    u.writeText(path.join(p.path, 'BRAIN.md'), this.renderBrainMd(p));
    const claudeMd = path.join(p.path, 'CLAUDE.md');
    if (!u.exists(claudeMd)) u.writeText(claudeMd, this.renderClaudeMd(p));
  }
  renderBrainMd(p, lang = 'ar') {
    const tz = this.cfg.timezone;
    const L = lang === 'ar';
    const lines = [];
    lines.push(`# ${L ? 'العقل الهندسي' : 'Engineering Mind'} — ${u.localized(p.name, 'ar')} / ${u.localized(p.name, 'en')}`);
    lines.push('');
    lines.push(`> ${L ? 'ملف مُولَّد تلقائياً من' : 'Generated from'} \`brain.json\` + \`journal/\` — ${L ? 'لا تعدّله يدوياً؛ استخدم' : 'do not edit by hand; use'} \`mb brain\` / \`mb log\` ${L ? 'أو أدوات MCP' : 'or the MCP tools'}.`);
    lines.push('');
    lines.push(`- **ID:** \`${p.id}\`  |  **${L ? 'الحالة' : 'Status'}:** ${I.statusLabel(p.status, 'ar')} / ${I.statusLabel(p.status, 'en')}  |  **${L ? 'التقدّم' : 'Progress'}:** ${p.progress}%  |  **${L ? 'الأولوية' : 'Priority'}:** ${p.priority || 'auto'}`);
    if (p.description && (p.description.ar || p.description.en)) lines.push(`- ${u.localized(p.description, 'ar')}${p.description.en ? '  \n  ' + p.description.en : ''}`);
    if (p.tags && p.tags.length) lines.push(`- **${L ? 'الوسوم' : 'Tags'}:** ${p.tags.join(', ')}`);
    if (p.sessions && p.sessions.length) lines.push(`- **${L ? 'الجلسات المرتبطة' : 'Related sessions'}:** ${p.sessions.join(', ')}`);
    if (p.links && p.links.length) lines.push(`- **${L ? 'روابط' : 'Links'}:** ${p.links.map(l => `[${l.label || l.url}](${l.url})`).join(' · ')}`);
    lines.push(`- **${L ? 'آخر تحديث' : 'Updated'}:** ${u.fmtDate(p.brain.updated || p.updated, tz)}`);
    lines.push('');
    for (const s of I.BRAIN_SECTIONS) {
      const items = p.brain.sections[s.key] || [];
      lines.push(`## ${s.icon} ${s.ar} / ${s.en}`);
      lines.push('');
      if (!items.length) { lines.push(L ? '_لا شيء بعد._' : '_Nothing yet._'); lines.push(''); continue; }
      for (const it of items) {
        const who = s.key === 'suggestions' || it.by !== 'human' ? ` — _${I.modelLabel(it.by, 'en')}${it.byLabel ? ' (' + it.byLabel + ')' : ''}_` : '';
        const st = it.status && s.key === 'suggestions' ? ` [${it.status}]` : '';
        lines.push(`- ${it.text}${who}${st} <sub>${u.fmtDate(it.date, tz, false)} · \`${it.id}\`</sub>`);
      }
      lines.push('');
    }
    lines.push(`## 🗓️ ${L ? 'آخر مدخلات سجل التقدّم' : 'Latest journal entries'}`);
    lines.push('');
    if (!p.journal.length) lines.push(L ? '_لا مدخلات بعد._' : '_No entries yet._');
    for (const e of p.journal.slice(0, 15)) {
      const t = I.ENTRY_TYPES.find(x => x.key === e.type) || {};
      lines.push(`- ${t.icon || ''} **${u.fmtDate(e.date, tz)}** — ${e.title}${e.progress != null ? ` (${e.progress}%)` : ''} — _${I.modelLabel(e.model, 'en')}_ · \`journal/${e.file}\``);
    }
    lines.push('');
    return lines.join('\n');
  }
  renderClaudeMd(p) {
    const root = this.cfg.platformRoot;
    return [
      `# ${u.localized(p.name, 'ar')} — ${u.localized(p.name, 'en')}`,
      '',
      `هذا المجلد مشروع مسجَّل في منصة **Master Brain** (${root}). اقرأ \`BRAIN.md\` أولاً قبل أي عمل — هو العقل الهندسي للمشروع (المنجز، النتائج، الجاري، التالي، التحسينات، المقترحات).`,
      '',
      `This folder is a project registered in the **Master Brain** platform (${root}). Read \`BRAIN.md\` first — it is the project's engineering mind.`,
      '',
      '## قواعد العمل / Working rules',
      '',
      `1. قبل التنفيذ: اقرأ \`BRAIN.md\` (أو أداة MCP \`get_project\` بمعرّف \`${p.id}\`).`,
      `2. بعد أي تقدّم ملموس: سجّله — \`mb log ${p.id} --title "..." --type progress --progress <0-100> --model <opus|sonnet|fable|haiku>\` أو أداة MCP \`add_journal_entry\`.`,
      `3. القرارات والنتائج والعوائق تُضاف إلى العقل: \`mb brain ${p.id} add <done|findings|current|next|improvements|decisions|blockers|constraints> "..."\`.`,
      `4. أي مقترح تحسين تقدّمه يُنسب للنموذج الذي قدّمه: \`mb suggest ${p.id} "..." --by <opus|sonnet|fable|haiku>\`.`,
      '5. لا تعدّل `BRAIN.md` يدوياً — يُولَّد من `brain.json` و`journal/`.',
      '6. ملفات العمل الخاصة بالمشروع توضع في `files/`.',
      '',
      '## CLI',
      '',
      '```',
      `node "${path.join(root, 'bin', 'mb.js')}" show ${p.id}`,
      `node "${path.join(root, 'bin', 'mb.js')}" context ${p.id}`,
      '```',
      '',
    ].join('\n');
  }
  syncAll() {
    const ids = this.listProjects().map(p => p.id);
    for (const id of ids) this.renderProjectFiles(id);
    return ids;
  }

  // ------------------------------------------------------------------ platform brain
  static emptyPlatformBrain() {
    const o = { version: 1, updated: u.nowIso() };
    for (const k of I.KIND_KEYS) o[k] = [];
    return o;
  }
  getPlatformBrain() {
    const b = u.readJson(this.platformBrainPath, null) || Store.emptyPlatformBrain();
    for (const k of I.KIND_KEYS) b[k] = b[k] || [];
    return b;
  }
  savePlatformBrain(b) { b.updated = u.nowIso(); u.writeJson(this.platformBrainPath, b); return b; }
  addPlatformItem(kind, item) {
    if (!I.KIND_KEYS.includes(kind)) throw new Error(`Unknown kind "${kind}" (${I.KIND_KEYS.join('|')})`);
    const b = this.getPlatformBrain();
    const text = typeof item === 'string' ? item : (item.text || item.name);
    if (!text) throw new Error('Item needs text/name');
    const o = typeof item === 'string' ? {} : item;
    const it = {
      id: o.id || u.shortId(kind.slice(0, 2)),
      text: String(text).trim(),
      date: (u.toDate(o.date) || new Date()).toISOString(),
      by: I.MODEL_KEYS.includes(o.by) ? o.by : (o.by ? 'other' : 'claude'),
    };
    for (const k of ['name', 'source', 'url', 'install', 'status', 'notes', 'kind', 'project', 'reason', 'decision', 'command', 'version']) if (o[k] !== undefined) it[k] = o[k];
    if (kind === 'requests') it.status = it.status || 'pending';
    if (kind === 'skills') it.status = it.status || 'available';
    if (kind === 'tools') it.status = it.status || 'available';
    b[kind].push(it);
    this.savePlatformBrain(b);
    return it;
  }
  updatePlatformItem(kind, id, patch) {
    const b = this.getPlatformBrain();
    const it = (b[kind] || []).find(x => x.id === id);
    if (!it) throw new Error(`Item "${id}" not found in ${kind}`);
    Object.assign(it, patch, { updated: u.nowIso() });
    this.savePlatformBrain(b);
    return it;
  }
  removePlatformItem(kind, id) {
    const b = this.getPlatformBrain();
    const before = (b[kind] || []).length;
    b[kind] = (b[kind] || []).filter(x => x.id !== id);
    if (b[kind].length === before) throw new Error(`Item "${id}" not found in ${kind}`);
    this.savePlatformBrain(b);
    return true;
  }

  // ------------------------------------------------------------------ requests inbox (owner → Claude)
  listRequests(filter = {}) {
    const list = u.readJson(this.requestsPath, null) || [];
    return list.filter(r => !filter.status || r.status === filter.status).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }
  addRequest({ project, task, from = 'dashboard', priority = 3, by = 'human' }) {
    if (!task || !String(task).trim()) throw new Error('Request needs a task');
    const list = u.readJson(this.requestsPath, null) || [];
    const r = { id: u.shortId('req'), project: project || '', task: String(task).trim(), from, by, priority: u.clampInt(priority, 1, 5, 3), status: 'pending', date: u.nowIso(), result: '' };
    list.push(r);
    u.writeJson(this.requestsPath, list);
    return r;
  }
  updateRequest(id, patch) {
    const list = u.readJson(this.requestsPath, null) || [];
    const r = list.find(x => x.id === id);
    if (!r) throw new Error(`Request "${id}" not found`);
    if (patch.status && !['pending', 'in_progress', 'done', 'rejected'].includes(patch.status)) throw new Error('Invalid request status');
    Object.assign(r, patch, { updated: u.nowIso() });
    u.writeJson(this.requestsPath, list);
    return r;
  }

  // ------------------------------------------------------------------ context for chat (Claude Desktop paste channel)
  contextBlock(idOrAll = 'all', lang = 'ar', { maxItems = 8, maxJournal = 5 } = {}) {
    const tz = this.cfg.timezone;
    const L = lang === 'ar';
    const projects = idOrAll === 'all' ? this.listProjects().map(p => this.getProject(p.id)) : [this.getProject(idOrAll)].filter(Boolean);
    if (!projects.length) return L ? 'لا مشاريع.' : 'No projects.';
    const out = [];
    out.push(`### ${L ? 'سياق Master Brain' : 'Master Brain context'} — ${u.fmtDate(new Date(), tz)}`);
    for (const p of projects) {
      out.push('');
      out.push(`## ${u.localized(p.name, lang)} (\`${p.id}\`) — ${I.statusLabel(p.status, lang)} · ${p.progress}% · ${L ? 'أولوية' : 'P'}${p.priority || '-'}`);
      if (p.description && u.localized(p.description, lang)) out.push(u.localized(p.description, lang));
      for (const s of I.BRAIN_SECTIONS) {
        const items = p.brain.sections[s.key] || [];
        if (!items.length) continue;
        out.push(`**${lang === 'ar' ? s.ar : s.en}:**`);
        for (const it of items.slice(-maxItems)) out.push(`- ${it.text}${s.key === 'suggestions' ? ` (${I.modelLabel(it.by, lang)}${it.status ? ', ' + it.status : ''})` : ''}`);
      }
      if (p.journal.length) {
        out.push(`**${L ? 'آخر السجل' : 'Latest journal'}:**`);
        for (const e of p.journal.slice(0, maxJournal)) out.push(`- ${u.fmtDate(e.date, tz, false)} · ${e.title}${e.progress != null ? ` (${e.progress}%)` : ''}`);
      }
    }
    out.push('');
    out.push(L
      ? '_قواعد: اقرأ السياق أعلاه قبل العمل. بعد أي تقدّم سجّله في Master Brain (mb log / add_journal_entry) وانسب أي مقترح إلى النموذج الذي قدّمه._'
      : '_Rules: read the context above before working. Log any progress back into Master Brain (mb log / add_journal_entry) and attribute suggestions to the model that made them._');
    return out.join('\n');
  }

  // ------------------------------------------------------------------ stats
  stats() {
    const projects = this.listProjects();
    const byStatus = {};
    for (const s of I.STATUS_KEYS) byStatus[s] = 0;
    let totalEntries = 0, suggestions = 0;
    const byModel = {};
    for (const p of projects) {
      byStatus[p.status] = (byStatus[p.status] || 0) + 1;
      totalEntries += p.journalCount;
      suggestions += p.brainCounts.suggestions;
      const full = this.getProject(p.id);
      for (const it of full.brain.sections.suggestions) byModel[it.by] = (byModel[it.by] || 0) + 1;
    }
    const avg = projects.length ? Math.round(projects.reduce((a, p) => a + (p.progress || 0), 0) / projects.length) : 0;
    const pending = this.listRequests({ status: 'pending' }).length;
    const pb = this.getPlatformBrain();
    return {
      projects: projects.length, byStatus, avgProgress: avg, journalEntries: totalEntries, suggestions, suggestionsByModel: byModel,
      pendingRequests: pending, learned: pb.learned.length, skills: pb.skills.length, tools: pb.tools.length, capabilities: pb.capabilities.length,
      toolRequestsPending: pb.requests.filter(r => r.status === 'pending').length,
    };
  }
}

module.exports = { Store };
