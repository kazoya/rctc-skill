'use strict';
/**
 * Master Brain — operations catalogue.
 * One definition per operation: JSON-schema input + handler. Shared by the MCP server (tools),
 * the HTTP API (POST /api/op/<name>) and the CLI, so every channel behaves identically.
 */
const path = require('path');
const u = require('./util');
const I = require('./i18n');
const R = require('./reports');

const S = (props, required = []) => ({ type: 'object', properties: props, required, additionalProperties: false });
const str = (d, extra = {}) => ({ type: 'string', description: d, ...extra });
const int = (d, extra = {}) => ({ type: 'integer', description: d, ...extra });
const arr = (d, items = { type: 'string' }) => ({ type: 'array', description: d, items });
const bool = d => ({ type: 'boolean', description: d });

const OPS = {
  list_projects: {
    description: 'List all registered projects with status, priority, progress, last activity and brain counts. Call this first to discover project ids.',
    input: S({ include_missing: bool('Include projects whose folder is missing') }),
    handler: (store, a) => store.listProjects({ includeMissing: !!a.include_missing }).map(stripHeavy),
  },
  get_project: {
    description: 'Get one project in full: metadata, the engineering brain (done / findings / current / next / improvements / suggestions / decisions / blockers / constraints) and its journal entries. READ THIS BEFORE WORKING ON A PROJECT.',
    input: S({ id: str('Project id'), journal_limit: int('Max journal entries to return (0 = all)', { minimum: 0 }) }, ['id']),
    handler: (store, a) => { const p = store.getProject(a.id, { journalLimit: a.journal_limit || 0 }); if (!p) throw new Error(`Project "${a.id}" not found`); return p; },
  },
  get_context: {
    description: 'Compact Markdown context block for one project (or "all") — ideal to paste into a chat or to orient yourself quickly.',
    input: S({ id: str('Project id or "all"'), lang: str('ar | en', { enum: ['ar', 'en'] }) }),
    handler: (store, a) => ({ context: store.contextBlock(a.id || 'all', a.lang || store.cfg.defaultLang) }),
  },
  create_project: {
    description: 'Create a new project slot: creates the folder (<projectsRoot>/<id> unless path given), project.json, brain.json, journal/, files/, BRAIN.md and CLAUDE.md.',
    input: S({
      id: str('Slug id (latin letters, digits, dashes). Derived from name_en if omitted'),
      name_ar: str('Arabic name'), name_en: str('English name'),
      desc_ar: str('Arabic description'), desc_en: str('English description'),
      status: str('planning | active | paused | blocked | done | dormant', { enum: I.STATUS_KEYS }),
      priority: int('1 (critical) … 5 (someday), 0 = auto', { minimum: 0, maximum: 5 }),
      revenue: str('yes | no | unknown', { enum: ['yes', 'no', 'unknown'] }),
      progress: int('0–100', { minimum: 0, maximum: 100 }),
      tags: arr('Tags'), sessions: arr('Related chat/session ids'),
      path: str('Custom absolute folder path (optional)'),
    }, ['name_ar', 'name_en']),
    handler: (store, a) => store.createProject({ id: a.id, nameAr: a.name_ar, nameEn: a.name_en, descAr: a.desc_ar, descEn: a.desc_en, status: a.status, priority: a.priority, revenue: a.revenue, progress: a.progress, tags: a.tags, sessions: a.sessions, path: a.path }),
  },
  update_project: {
    description: 'Update project metadata: status, priority, progress, revenue flag, names, descriptions, tags, sessions.',
    input: S({
      id: str('Project id'), status: str('New status', { enum: I.STATUS_KEYS }), priority: int('0–5', { minimum: 0, maximum: 5 }), progress: int('0–100', { minimum: 0, maximum: 100 }),
      revenue: str('yes | no | unknown', { enum: ['yes', 'no', 'unknown'] }), name_ar: str('Arabic name'), name_en: str('English name'), desc_ar: str('Arabic description'), desc_en: str('English description'),
      tags: arr('Tags'), sessions: arr('Session ids'),
    }, ['id']),
    handler: (store, a) => stripHeavy(store.updateProject(a.id, { status: a.status, priority: a.priority, progress: a.progress, revenue: a.revenue, nameAr: a.name_ar, nameEn: a.name_en, descAr: a.desc_ar, descEn: a.desc_en, tags: a.tags, sessions: a.sessions })),
  },
  add_journal_entry: {
    description: 'Log progress for a project (creates journal/<date>-<title>.md). Use after any meaningful work. Set progress to update the project percentage; set model to the model that did the work (opus | sonnet | fable | haiku).',
    input: S({
      id: str('Project id'), title: str('Short title'), body: str('Markdown body: what was done, evidence, next step'),
      type: str('progress | milestone | decision | blocker | suggestion | note | report', { enum: I.TYPE_KEYS }),
      progress: int('New overall progress 0–100 (optional)', { minimum: 0, maximum: 100 }),
      model: str('Which model did this: claude | opus | sonnet | haiku | fable | human', { enum: I.MODEL_KEYS }),
      status: str('Optionally change project status at the same time', { enum: I.STATUS_KEYS }),
      tags: arr('Tags'), date: str('ISO date (defaults to now)'), source: str('cowork | claude-code | claude-desktop | cli | mcp | dashboard'),
    }, ['id', 'title']),
    handler: (store, a) => store.addJournal(a.id, { title: a.title, body: a.body, type: a.type, progress: a.progress, model: a.model, status: a.status, tags: a.tags, date: a.date, source: a.source || 'mcp' }),
  },
  list_journal: {
    description: 'List journal entries of a project, optionally filtered by period, entry types and models.',
    input: S({ id: str('Project id'), from: str('YYYY-MM-DD'), to: str('YYYY-MM-DD'), types: arr('Entry types'), models: arr('Models'), limit: int('Max entries', { minimum: 1 }) }, ['id']),
    handler: (store, a) => { const dir = store.projectDir(a.id); if (!dir) throw new Error(`Project "${a.id}" not found`); const l = store.listJournal(dir, { from: a.from, to: a.to, types: a.types, models: a.models }); return a.limit ? l.slice(0, a.limit) : l; },
  },
  add_brain_item: {
    description: 'Add an item to the project engineering brain. Sections: done, findings, current, next, improvements, suggestions, decisions, blockers, constraints. For suggestions ALWAYS set "by" to the model making the suggestion.',
    input: S({
      id: str('Project id'), section: str('Section', { enum: I.SECTION_KEYS }), text: str('Item text'),
      by: str('Who: claude | opus | sonnet | haiku | fable | human', { enum: I.MODEL_KEYS }), date: str('ISO date'), evidence: str('Evidence / link / file'), source: str('Channel'),
    }, ['id', 'section', 'text']),
    handler: (store, a) => store.addBrainItem(a.id, a.section, { text: a.text, by: a.by, date: a.date, evidence: a.evidence, source: a.source || 'mcp' }),
  },
  add_suggestion: {
    description: 'Shortcut: add an improvement suggestion attributed to a model (goes to brain section "suggestions").',
    input: S({ id: str('Project id'), text: str('Suggestion'), by: str('Model making it', { enum: I.MODEL_KEYS }), evidence: str('Why / evidence') }, ['id', 'text', 'by']),
    handler: (store, a) => store.addBrainItem(a.id, 'suggestions', { text: a.text, by: a.by, evidence: a.evidence, source: 'mcp' }),
  },
  update_brain_item: {
    description: 'Edit, re-status, or move a brain item (e.g. move from "current" to "done", mark a suggestion accepted/done).',
    input: S({ id: str('Project id'), section: str('Current section', { enum: I.SECTION_KEYS }), item_id: str('Item id'), text: str('New text'), status: str('proposed | accepted | rejected | done (suggestions)'), move_to: str('Target section', { enum: I.SECTION_KEYS }), evidence: str('Evidence') }, ['id', 'section', 'item_id']),
    handler: (store, a) => store.updateBrainItem(a.id, a.section, a.item_id, { text: a.text, status: a.status, moveTo: a.move_to, evidence: a.evidence }),
  },
  remove_brain_item: {
    description: 'Remove a brain item.',
    input: S({ id: str('Project id'), section: str('Section', { enum: I.SECTION_KEYS }), item_id: str('Item id') }, ['id', 'section', 'item_id']),
    handler: (store, a) => ({ removed: store.removeBrainItem(a.id, a.section, a.item_id) }),
  },
  generate_report: {
    description: 'Generate a professional report (html → printable PDF, md, xlsx, json, or "all"). Filter by period, projects, statuses, entry types, models, progress range; group by status or priority. Returns saved file paths.',
    input: S({
      from: str('YYYY-MM-DD'), to: str('YYYY-MM-DD'), projects: arr('Project ids (omit = all)'), statuses: arr('Statuses'), types: arr('Entry types'), models: arr('Models'),
      min_progress: int('Min progress', { minimum: 0, maximum: 100 }), max_progress: int('Max progress', { minimum: 0, maximum: 100 }),
      group: str('status | priority | none', { enum: ['status', 'priority', 'none'] }), lang: str('ar | en', { enum: ['ar', 'en'] }), format: str('html | md | xlsx | json | pdf | all', { enum: ['html', 'md', 'xlsx', 'json', 'pdf', 'all'] }),
      title: str('Report title'), include_platform: bool('Append the platform brain (skills/tools/lessons)'), only_active_in_period: bool('Drop projects with no entries in the period'),
    }),
    handler: (store, a) => generateReport(store, a),
  },
  get_platform_brain: {
    description: 'Read the platform-level brain: lessons learned, acquired skills, tools & integrations, capabilities, and pending tool-install requests.',
    input: S({ kind: str('Only one kind', { enum: I.KIND_KEYS }) }),
    handler: (store, a) => { const b = store.getPlatformBrain(); return a.kind ? { [a.kind]: b[a.kind] } : b; },
  },
  add_learning: {
    description: 'Record something into the platform brain: kind=learned (lesson), skills (acquired skill: name/source/url/install), tools (tool/integration + status), capabilities.',
    input: S({
      kind: str('learned | skills | tools | capabilities', { enum: ['learned', 'skills', 'tools', 'capabilities'] }), text: str('Description / lesson text'), name: str('Name (skills/tools)'),
      source: str('Origin (repo, session, vendor)'), url: str('URL'), install: str('Install command'), status: str('installed | available | recommended | requested | declined'), notes: str('Notes'), by: str('Model recording it', { enum: I.MODEL_KEYS }), project: str('Related project id'),
    }, ['kind', 'text']),
    handler: (store, a) => store.addPlatformItem(a.kind, { text: a.text, name: a.name, source: a.source, url: a.url, install: a.install, status: a.status, notes: a.notes, by: a.by, project: a.project }),
  },
  request_tool: {
    description: 'Ask the owner to approve installing/enabling a tool that would raise execution quality (n8n, Notion, a VM, XAMPP, an MCP server…). Creates a pending request visible on the dashboard; never install without approval.',
    input: S({ tool: str('Tool name'), reason: str('Why it helps, what it unblocks'), command: str('Proposed install command'), url: str('URL'), by: str('Model requesting', { enum: I.MODEL_KEYS }), project: str('Related project id') }, ['tool', 'reason']),
    handler: (store, a) => store.addPlatformItem('requests', { name: a.tool, text: a.reason, command: a.command, url: a.url, by: a.by, project: a.project, status: 'pending' }),
  },
  list_requests: {
    description: 'Owner → Claude task inbox. Lists tasks the owner queued from the dashboard for Claude to execute (status pending | in_progress | done | rejected).',
    input: S({ status: str('Filter by status', { enum: ['pending', 'in_progress', 'done', 'rejected'] }) }),
    handler: (store, a) => store.listRequests({ status: a.status }),
  },
  update_request: {
    description: 'Update a task from the inbox: set in_progress / done (with result) / rejected.',
    input: S({ request_id: str('Request id'), status: str('New status', { enum: ['pending', 'in_progress', 'done', 'rejected'] }), result: str('Result / summary') }, ['request_id']),
    handler: (store, a) => store.updateRequest(a.request_id, { status: a.status, result: a.result }),
  },
  get_stats: {
    description: 'Portfolio totals: projects by status, average progress, entries, suggestions by model, pending requests.',
    input: S({}),
    handler: (store) => store.stats(),
  },
  scan_projects: {
    description: 'Re-scan the projects root for folders containing project.json and refresh the registry; also regenerates BRAIN.md for every project.',
    input: S({}),
    handler: (store) => { const reg = store.scan(); store.syncAll(); return { projects: reg.projects.length, registry: store.registryPath }; },
  },
};

function stripHeavy(p) {
  if (!p) return p;
  const { brain, journal, ...rest } = p;
  return { ...rest, journalCount: p.journalCount };
}

function generateReport(store, a) {
  const opts = {
    from: a.from, to: a.to, projects: a.projects, statuses: a.statuses, types: a.types, models: a.models,
    minProgress: a.min_progress, maxProgress: a.max_progress, group: a.group, lang: a.lang || store.cfg.defaultLang, title: a.title,
    includePlatform: !!a.include_platform, onlyActiveInPeriod: !!a.only_active_in_period,
  };
  const data = R.buildReportData(store, opts);
  const fmt = String(a.format || 'html').toLowerCase();
  const formats = fmt === 'all' ? ['html', 'md', 'xlsx', 'json'] : [fmt === 'pdf' ? 'html' : fmt];
  const files = formats.map(f => R.saveReport(store, data, f));
  let pdf = null;
  if (fmt === 'pdf' || fmt === 'all') {
    const html = files.find(f => f.format === 'html');
    const pdfPath = html.path.replace(/\.html$/, '.pdf');
    pdf = R.htmlToPdf(html.path, pdfPath);
    if (pdf.ok) files.push({ file: path.basename(pdfPath), path: pdfPath, format: 'pdf', bytes: require('fs').statSync(pdfPath).size });
  }
  return { summary: data.summary, period: { from: a.from || null, to: a.to || null }, files, pdf: pdf && !pdf.ok ? { error: pdf.error } : undefined };
}

module.exports = { OPS, generateReport, stripHeavy };
