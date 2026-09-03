#!/usr/bin/env node
'use strict';
/**
 * Master Brain — MCP server over stdio (Model Context Protocol, newline-delimited JSON-RPC 2.0).
 * Zero dependencies. Used by Claude Code (.mcp.json) and Claude Desktop (claude_desktop_config.json).
 *
 *   { "mcpServers": { "master-brain": { "command": "node", "args": ["<platformRoot>/bin/mcp.js"] } } }
 *
 * Exposes: tools (every operation in src/ops.js), resources (project brains, platform brain, context),
 * prompts (start-work, daily-review). Logs go to stderr only — stdout is reserved for protocol messages.
 */
const readline = require('readline');
const path = require('path');
const u = require('../src/util');
const I = require('../src/i18n');
const { loadConfig, PLATFORM_ROOT, VERSION } = require('../src/config');
const { Store } = require('../src/store');
const { OPS } = require('../src/ops');

const SUPPORTED = ['2025-06-18', '2025-03-26', '2024-11-05'];
const cfg = loadConfig();
const store = new Store(cfg);
const log = (...a) => process.stderr.write('[master-brain mcp] ' + a.join(' ') + '\n');

const INSTRUCTIONS = `Master Brain — portfolio tracker & engineering mind for the owner's projects (projects root: ${cfg.projectsRoot}).
Rules for every session:
1) Call list_projects, then get_project(id) BEFORE working on a project — the brain holds what is done, findings, current work, next steps, improvements, suggestions (attributed per model), decisions, blockers and constraints.
2) After meaningful work call add_journal_entry (type progress|milestone|decision|blocker, set progress 0-100 when it changed, and model = the model doing the work).
3) Record conclusions with add_brain_item; record improvement ideas with add_suggestion and ALWAYS set "by" to yourself (opus | sonnet | fable | haiku).
4) Before installing or enabling any external tool, call request_tool — the owner approves on the dashboard.
5) Check list_requests(status=pending) for tasks the owner queued for you; mark them in_progress/done with update_request.
6) Record new skills, tools or lessons with add_learning so the platform brain stays current.`;

function toolList() {
  return Object.entries(OPS).map(([name, op]) => ({ name, description: op.description, inputSchema: op.input }));
}
function resourceList() {
  const list = [
    { uri: 'masterbrain://context/all', name: 'Portfolio context (all projects)', description: 'Compact Markdown context of every project', mimeType: 'text/markdown' },
    { uri: 'masterbrain://platform-brain', name: 'Platform brain', description: 'Lessons, skills, tools, capabilities, tool requests', mimeType: 'application/json' },
    { uri: 'masterbrain://registry', name: 'Projects registry', description: 'All projects with paths and status', mimeType: 'application/json' },
  ];
  for (const p of store.listProjects()) {
    list.push({ uri: `masterbrain://project/${p.id}`, name: `BRAIN.md — ${u.localized(p.name, 'en')}`, description: `${u.localized(p.name, 'ar')} · ${p.status} · ${p.progress}%`, mimeType: 'text/markdown' });
  }
  return list;
}
function readResource(uri) {
  if (uri === 'masterbrain://context/all') return { uri, mimeType: 'text/markdown', text: store.contextBlock('all', cfg.defaultLang) };
  if (uri === 'masterbrain://platform-brain') return { uri, mimeType: 'application/json', text: JSON.stringify(store.getPlatformBrain(), null, 2) };
  if (uri === 'masterbrain://registry') return { uri, mimeType: 'application/json', text: JSON.stringify(store.listProjects(), null, 2) };
  const m = uri.match(/^masterbrain:\/\/project\/([^/]+)$/);
  if (m) { const p = store.getProject(m[1]); if (!p) throw new Error(`Project "${m[1]}" not found`); return { uri, mimeType: 'text/markdown', text: store.renderBrainMd(p, cfg.defaultLang) }; }
  throw new Error(`Unknown resource ${uri}`);
}
const PROMPTS = {
  start_work: {
    description: 'Load a project brain and the working rules before starting a task on it.',
    arguments: [{ name: 'project', description: 'Project id', required: true }, { name: 'task', description: 'What the owner wants done', required: false }],
    build: a => { const p = store.getProject(a.project); if (!p) throw new Error(`Project "${a.project}" not found`); return `${store.renderBrainMd(p, cfg.defaultLang)}\n\n---\nTask: ${a.task || '(ask the owner)'}\n\nWork on this project now. When done: add_journal_entry (with progress + model), add_brain_item for conclusions, add_suggestion for improvement ideas attributed to you.`; },
  },
  daily_review: {
    description: 'Review the whole portfolio: what moved, what is blocked, what to do next; then log a report entry.',
    arguments: [{ name: 'lang', description: 'ar | en', required: false }],
    build: a => `${store.contextBlock('all', a.lang || cfg.defaultLang)}\n\n---\nReview every project above: 1) what progressed, 2) blockers needing the owner, 3) top 3 next actions per active project, 4) improvement suggestions (attribute them to yourself with add_suggestion). Finish by calling generate_report(format="all") for the last 7 days.`,
  },
};

function handle(msg) {
  const { id, method, params = {} } = msg;
  switch (method) {
    case 'initialize': {
      const pv = SUPPORTED.includes(params.protocolVersion) ? params.protocolVersion : SUPPORTED[SUPPORTED.length - 1];
      return { protocolVersion: pv, capabilities: { tools: { listChanged: false }, resources: { subscribe: false, listChanged: false }, prompts: { listChanged: false } }, serverInfo: { name: 'master-brain', version: VERSION }, instructions: INSTRUCTIONS };
    }
    case 'ping': return {};
    case 'tools/list': return { tools: toolList() };
    case 'tools/call': {
      const op = OPS[params.name];
      if (!op) throw Object.assign(new Error(`Unknown tool ${params.name}`), { code: -32602 });
      try {
        const result = op.handler(store, params.arguments || {});
        const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
        return { content: [{ type: 'text', text }], structuredContent: typeof result === 'object' && result && !Array.isArray(result) ? result : undefined, isError: false };
      } catch (e) {
        return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true };
      }
    }
    case 'resources/list': return { resources: resourceList() };
    case 'resources/templates/list': return { resourceTemplates: [{ uriTemplate: 'masterbrain://project/{id}', name: 'Project brain', description: 'BRAIN.md of a project', mimeType: 'text/markdown' }] };
    case 'resources/read': return { contents: [readResource(params.uri)] };
    case 'prompts/list': return { prompts: Object.entries(PROMPTS).map(([name, p]) => ({ name, description: p.description, arguments: p.arguments })) };
    case 'prompts/get': {
      const p = PROMPTS[params.name];
      if (!p) throw Object.assign(new Error(`Unknown prompt ${params.name}`), { code: -32602 });
      return { description: p.description, messages: [{ role: 'user', content: { type: 'text', text: p.build(params.arguments || {}) } }] };
    }
    case 'completion/complete': return { completion: { values: [], hasMore: false } };
    case 'logging/setLevel': return {};
    default:
      if (method && method.startsWith('notifications/')) return undefined; // notifications: no response
      throw Object.assign(new Error(`Method not found: ${method}`), { code: -32601 });
  }
}

function write(obj) { process.stdout.write(JSON.stringify(obj) + '\n'); }

function onLine(line) {
  const t = line.trim();
  if (!t) return;
  let msg;
  try { msg = JSON.parse(t); } catch { return write({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }); }
  const batch = Array.isArray(msg) ? msg : [msg];
  const responses = [];
  for (const m of batch) {
    if (m.id === undefined || m.id === null) { try { handle(m); } catch (e) { log(e.message); } continue; } // notification
    if (m.method === undefined) continue; // response to our request — none expected
    try {
      const result = handle(m);
      responses.push({ jsonrpc: '2.0', id: m.id, result: result === undefined ? {} : result });
    } catch (e) {
      responses.push({ jsonrpc: '2.0', id: m.id, error: { code: e.code || -32603, message: e.message } });
    }
  }
  if (Array.isArray(msg)) { if (responses.length) write(responses); } else for (const r of responses) write(r);
}

if (require.main === module || process.argv[1] && /mb\.js$/.test(process.argv[1])) {
  const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
  rl.on('line', onLine);
  rl.on('close', () => process.exit(0));
  process.stdin.on('error', () => process.exit(0));
  log(`ready · root=${PLATFORM_ROOT} · projects=${cfg.projectsRoot}`);
}

module.exports = { handle, toolList, resourceList, readResource };
