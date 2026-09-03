'use strict';
/**
 * Master Brain — HTTP server (dashboard + JSON API). Zero dependencies.
 *   node bin/server.js            or   node bin/mb.js serve --open
 */
const http = require('http');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const u = require('../src/util');
const I = require('../src/i18n');
const { loadConfig, PLATFORM_ROOT, VERSION } = require('../src/config');
const { Store } = require('../src/store');
const { OPS } = require('../src/ops');

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.pdf': 'application/pdf', '.txt': 'text/plain; charset=utf-8' };

function send(res, status, body, headers = {}) {
  const isBuf = Buffer.isBuffer(body);
  const data = isBuf ? body : (typeof body === 'string' ? body : JSON.stringify(body));
  res.writeHead(status, { 'Content-Type': isBuf ? 'application/octet-stream' : (typeof body === 'string' ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8'), 'Cache-Control': 'no-store', ...headers });
  res.end(data);
}
function readBody(req, limit = 2 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0;
    req.on('data', c => { size += c.length; if (size > limit) { reject(new Error('Body too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { const t = Buffer.concat(chunks).toString('utf8'); if (!t.trim()) return resolve({}); try { resolve(JSON.parse(t)); } catch { reject(new Error('Invalid JSON body')); } });
    req.on('error', reject);
  });
}
function serveFile(res, file, download = false) {
  if (!u.exists(file) || u.isDir(file)) return send(res, 404, { error: 'Not found' });
  const ext = path.extname(file).toLowerCase();
  const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' };
  if (download) headers['Content-Disposition'] = `attachment; filename*=UTF-8''${encodeURIComponent(path.basename(file))}`;
  res.writeHead(200, headers);
  fs.createReadStream(file).pipe(res);
}

function buildRoutes(store) {
  const cfg = store.cfg;
  const R = [];
  const route = (method, pattern, handler) => R.push({ method, re: new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '/?$'), handler });

  route('GET', '/api/meta', () => ({
    version: VERSION, platformRoot: PLATFORM_ROOT, projectsRoot: cfg.projectsRoot, platformName: cfg.platformName, defaultLang: cfg.defaultLang, timezone: cfg.timezone,
    vocab: { sections: I.BRAIN_SECTIONS, statuses: I.STATUSES, types: I.ENTRY_TYPES, models: I.MODELS, priorities: I.PRIORITIES, kinds: I.PLATFORM_KINDS, ui: I.UI },
    stats: store.stats(), ops: Object.keys(OPS),
    mcp: { command: 'node', args: [path.join(PLATFORM_ROOT, 'bin', 'mcp.js')] },
  }));
  route('GET', '/api/stats', () => store.stats());
  route('GET', '/api/projects', () => store.listProjects());
  route('POST', '/api/projects', (p, q, body) => OPS.create_project.handler(store, body));
  route('GET', '/api/projects/:id', p => { const x = store.getProject(p.id); if (!x) throw Object.assign(new Error('Not found'), { status: 404 }); return x; });
  route('PATCH', '/api/projects/:id', (p, q, body) => OPS.update_project.handler(store, { ...body, id: p.id }));
  route('POST', '/api/projects/:id/journal', (p, q, body) => store.addJournal(p.id, { ...body, source: body.source || 'dashboard' }));
  route('POST', '/api/projects/:id/brain/:section', (p, q, body) => store.addBrainItem(p.id, p.section, { ...body, source: body.source || 'dashboard' }));
  route('PATCH', '/api/projects/:id/brain/:section/:item', (p, q, body) => store.updateBrainItem(p.id, p.section, p.item, body));
  route('DELETE', '/api/projects/:id/brain/:section/:item', p => ({ removed: store.removeBrainItem(p.id, p.section, p.item) }));
  route('GET', '/api/context', (p, q) => ({ context: store.contextBlock(q.get('id') || 'all', q.get('lang') || cfg.defaultLang) }));
  route('GET', '/api/platform', () => store.getPlatformBrain());
  route('POST', '/api/platform/:kind', (p, q, body) => store.addPlatformItem(p.kind, body));
  route('PATCH', '/api/platform/:kind/:id', (p, q, body) => store.updatePlatformItem(p.kind, p.id, body));
  route('DELETE', '/api/platform/:kind/:id', p => ({ removed: store.removePlatformItem(p.kind, p.id) }));
  route('GET', '/api/requests', (p, q) => store.listRequests({ status: q.get('status') || undefined }));
  route('POST', '/api/requests', (p, q, body) => store.addRequest({ ...body, from: body.from || 'dashboard' }));
  route('PATCH', '/api/requests/:id', (p, q, body) => store.updateRequest(p.id, body));
  route('POST', '/api/report', (p, q, body) => OPS.generate_report.handler(store, body));
  route('GET', '/api/reports', () => u.listFiles(cfg.reportsDirAbs).filter(f => /\.(html|md|xlsx|json|pdf)$/i.test(f)).map(f => { const st = fs.statSync(path.join(cfg.reportsDirAbs, f)); return { file: f, bytes: st.size, modified: st.mtime.toISOString(), url: '/reports/' + encodeURIComponent(f) }; }).sort((a, b) => b.modified.localeCompare(a.modified)));
  route('POST', '/api/scan', () => OPS.scan_projects.handler(store, {}));
  route('POST', '/api/op/:name', (p, q, body) => { const op = OPS[p.name]; if (!op) throw Object.assign(new Error(`Unknown op ${p.name}`), { status: 404 }); return op.handler(store, body || {}); });
  route('GET', '/api/ops', () => Object.entries(OPS).map(([name, o]) => ({ name, description: o.description, input: o.input })));
  return R;
}

function startServer({ port, host, open } = {}) {
  const cfg = loadConfig();
  const store = new Store(cfg);
  const routes = buildRoutes(store);
  const publicDir = path.join(PLATFORM_ROOT, 'public');
  port = port || cfg.port; host = host || cfg.host;

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const p = decodeURIComponent(url.pathname);
      if (p === '/' || p === '/index.html') return serveFile(res, path.join(publicDir, 'index.html'));
      if (p.startsWith('/public/')) { const f = path.normalize(path.join(publicDir, p.slice(8))); if (!f.startsWith(publicDir)) return send(res, 403, { error: 'Forbidden' }); return serveFile(res, f); }
      if (p.startsWith('/reports/')) { const f = path.normalize(path.join(cfg.reportsDirAbs, p.slice(9))); if (!f.startsWith(path.normalize(cfg.reportsDirAbs))) return send(res, 403, { error: 'Forbidden' }); return serveFile(res, f, url.searchParams.get('download') === '1'); }
      if (p.startsWith('/api/')) {
        for (const r of routes) {
          if (r.method !== req.method) continue;
          const m = p.match(r.re);
          if (!m) continue;
          const body = ['POST', 'PATCH', 'PUT'].includes(req.method) ? await readBody(req) : null;
          const result = await r.handler(m.groups || {}, url.searchParams, body);
          return send(res, 200, result ?? {});
        }
        return send(res, 404, { error: `No route ${req.method} ${p}` });
      }
      return send(res, 404, { error: 'Not found' });
    } catch (e) {
      const status = e.status || 400;
      if (status >= 500) process.stderr.write(`[master-brain] ${e.stack}\n`);
      return send(res, status, { error: e.message });
    }
  });

  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(port, host, () => {
      const actual = server.address().port;
      if (open) {
        const url = `http://${host}:${actual}`;
        const cmd = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]] : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
        try { spawn(cmd[0], cmd[1], { detached: true, stdio: 'ignore' }).unref(); } catch { /* ignore */ }
      }
      resolve({ server, port: actual, host, store });
    });
  });
}

if (require.main === module) {
  const args = u.parseArgs(process.argv.slice(2));
  startServer({ port: args.port ? parseInt(args.port, 10) : undefined, open: !!args.open })
    .then(s => process.stdout.write(`Master Brain dashboard → http://${s.host}:${s.port}\n`))
    .catch(e => { process.stderr.write(`✖ ${e.message}\n`); process.exit(1); });
}

module.exports = { startServer, buildRoutes };
