'use strict';
/**
 * Smoke test — runs the whole stack against a temporary copy:
 *   init from seed → CLI → store ops → reports (html/md/xlsx/json) → HTTP API → MCP stdio.
 * Usage: node test/smoke.test.js   (no network, no dependencies)
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');
const { spawnSync, spawn } = require('child_process');
const http = require('http');

const SRC = path.resolve(__dirname, '..');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'mb-smoke-'));
const HOME = path.join(TMP, 'platform');
const ROOT = path.join(TMP, 'projects');
fs.cpSync(SRC, HOME, { recursive: true, filter: p => !/[\\/](data|node_modules|\.git)([\\/]|$)/.test(p) || p === SRC });
if (fs.existsSync(path.join(HOME, 'config.json'))) fs.rmSync(path.join(HOME, 'config.json'));
fs.rmSync(path.join(HOME, 'data'), { recursive: true, force: true });
const env = { ...process.env, MB_HOME: HOME, MB_PROJECTS_ROOT: ROOT };
const seedPath = fs.existsSync(path.join(HOME, 'seed', 'initial-projects.json')) ? path.join(HOME, 'seed', 'initial-projects.json') : path.join(HOME, 'seed', 'example-projects.json');

function mb(...args) {
  const r = spawnSync(process.execPath, [path.join(HOME, 'bin', 'mb.js'), ...args], { env, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`mb ${args.join(' ')} failed: ${r.stderr || r.stdout}`);
  return r.stdout;
}
let step = 0; const ok = m => console.log(`  ✔ ${++step}. ${m}`);

(async () => {
  console.log('smoke test in', TMP);
  // --- init
  let out = mb('init', '--root', ROOT, '--seed', seedPath);
  assert(/seeded:/.test(out), out); ok('init from seed');
  const list = JSON.parse(mb('list', '--json'));
  assert(list.length >= 1); ok(`list → ${list.length} projects`);
  const pid = list[0].id;
  assert(fs.existsSync(path.join(list[0].path, 'BRAIN.md')) && fs.existsSync(path.join(list[0].path, 'CLAUDE.md'))); ok('BRAIN.md + CLAUDE.md rendered');

  // --- CLI ops
  mb('new', 'smoke-project', '--ar', 'مشروع الاختبار', '--en', 'Smoke Project', '--status', 'active', '--priority', '2', '--tags', 'test,smoke');
  const sp = JSON.parse(mb('show', 'smoke-project', '--json'));
  assert.strictEqual(sp.name.en, 'Smoke Project'); ok('new + show');
  out = mb('log', 'smoke-project', '--title', 'First step: done', '--type', 'milestone', '--progress', '40', '--model', 'fable', '--body', 'evidence: tests pass');
  assert(/logged/.test(out)); ok('log entry');
  mb('brain', 'smoke-project', 'add', 'current', 'Working on the API', '--by', 'opus');
  mb('suggest', 'smoke-project', 'Add caching', '--by', 'fable');
  let p = JSON.parse(mb('show', 'smoke-project', '--json'));
  assert.strictEqual(p.progress, 40); assert.strictEqual(p.brain.sections.current.length, 1); assert.strictEqual(p.brain.sections.suggestions[0].by, 'fable'); ok('brain add + suggest + progress from log');
  const itemId = p.brain.sections.current[0].id;
  mb('brain', 'smoke-project', 'move', 'current', itemId, 'done');
  mb('brain', 'smoke-project', 'status', 'suggestions', p.brain.sections.suggestions[0].id, 'accepted');
  p = JSON.parse(mb('show', 'smoke-project', '--json'));
  assert.strictEqual(p.brain.sections.current.length, 0); assert.strictEqual(p.brain.sections.done.length, 1); assert.strictEqual(p.brain.sections.suggestions[0].status, 'accepted'); ok('brain move + suggestion status');
  mb('set', 'smoke-project', '--status', 'blocked', '--priority', '1');
  p = JSON.parse(mb('show', 'smoke-project', '--json')); assert.strictEqual(p.status, 'blocked'); ok('set status/priority');
  out = mb('context', 'smoke-project', '--lang', 'en'); assert(/Smoke Project/.test(out)); ok('context block');
  mb('learn', 'skills', 'Test skill', '--name', 'smoke-skill', '--status', 'installed', '--by', 'fable');
  mb('request-tool', 'n8n-test', '--reason', 'automation', '--by', 'fable');
  const pb = JSON.parse(mb('brain-platform', '--json'));
  assert(pb.skills.some(s => s.name === 'smoke-skill')); const req = pb.requests.find(r => r.name === 'n8n-test'); assert(req && req.status === 'pending'); ok('platform brain: learn + request-tool');
  mb('approve', req.id); assert(JSON.parse(mb('brain-platform', '--json')).requests.find(r => r.id === req.id).status === 'approved'); ok('approve request');
  mb('task', 'add', 'Review the smoke project', '--project', 'smoke-project', '--priority', '2');
  const tasks = JSON.parse(mb('tasks', '--json')); assert(tasks.length >= 1); mb('task', 'done', tasks[0].id, '--result', 'ok'); ok('task inbox');
  mb('scan'); mb('sync'); ok('scan + sync');

  // --- reports
  out = mb('report', '--from', '2026-09-01', '--to', '2030-12-31', '--format', 'all', '--group', 'status', '--platform', '--lang', 'ar');
  assert(/\.html/.test(out) && /\.md/.test(out) && /\.xlsx/.test(out) && /\.json/.test(out)); ok('report all formats (ar)');
  out = mb('report', '--project', 'smoke-project', '--format', 'xlsx', '--lang', 'en', '--types', 'milestone');
  const xlsx = out.match(/→ (.*\.xlsx)/)[1];
  const buf = fs.readFileSync(xlsx);
  assert.strictEqual(buf.readUInt32LE(0), 0x04034b50); ok('xlsx is a valid zip (local header)');
  // unzip check via python if available
  const py = spawnSync('python3', ['-c', `import zipfile,sys; z=zipfile.ZipFile(sys.argv[1]); assert z.testzip() is None; print(len(z.namelist()))`, xlsx], { encoding: 'utf8' });
  if (py.status === 0) ok(`xlsx zip verified by python (${py.stdout.trim()} parts)`); else console.log('  • python zip check skipped');
  const htmlFile = fs.readdirSync(path.join(HOME, 'data', 'reports')).find(f => f.endsWith('.html'));
  const html = fs.readFileSync(path.join(HOME, 'data', 'reports', htmlFile), 'utf8');
  assert(/dir="rtl"/.test(html) && /Smoke Project|مشروع الاختبار/.test(html)); ok('html report has RTL + project');

  // --- HTTP API
  const { startServer } = require(path.join(HOME, 'bin', 'server.js'));
  process.env.MB_HOME = HOME; process.env.MB_PROJECTS_ROOT = ROOT;
  const srv = await startServer({ port: 0, host: '127.0.0.1' });
  const base = `http://127.0.0.1:${srv.port}`;
  const req2 = (method, p, body) => new Promise((resolve, reject) => {
    const r = http.request(base + p, { method, headers: body ? { 'Content-Type': 'application/json' } : {} }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d, json: () => JSON.parse(d) })); });
    r.on('error', reject); if (body) r.write(JSON.stringify(body)); r.end();
  });
  let r = await req2('GET', '/'); assert(r.status === 200 && /Master Brain/.test(r.body)); ok('GET / dashboard html');
  r = await req2('GET', '/api/meta'); assert(r.json().vocab.sections.length === 9); ok('GET /api/meta');
  r = await req2('GET', '/api/projects'); assert(r.json().some(x => x.id === 'smoke-project')); ok('GET /api/projects');
  r = await req2('POST', '/api/projects/smoke-project/journal', { title: 'via API', type: 'progress', progress: 55, model: 'sonnet' }); assert(r.status === 200); ok('POST journal via API');
  r = await req2('GET', '/api/projects/smoke-project'); assert(r.json().progress === 55); ok('progress updated through API');
  r = await req2('POST', '/api/projects/smoke-project/brain/next', { text: 'ship it', by: 'human' }); const item = r.json(); assert(item.id);
  r = await req2('PATCH', `/api/projects/smoke-project/brain/next/${item.id}`, { moveTo: 'done' }); assert(r.status === 200); ok('brain item via API + move');
  r = await req2('POST', '/api/report', { from: '2026-09-01', format: 'md', lang: 'en', projects: ['smoke-project'] }); assert(r.json().files[0].format === 'md'); ok('POST /api/report');
  r = await req2('GET', '/api/reports'); assert(r.json().length >= 3); ok('GET /api/reports');
  r = await req2('GET', '/reports/' + encodeURIComponent(r.json()[0].file)); assert(r.status === 200); ok('GET /reports/<file>');
  r = await req2('POST', '/api/requests', { task: 'from api', priority: 1 }); assert(r.json().status === 'pending'); ok('POST /api/requests');
  r = await req2('GET', '/api/context?id=all&lang=en'); assert(/Master Brain context/.test(r.json().context)); ok('GET /api/context');
  r = await req2('POST', '/api/op/get_stats', {}); assert(typeof r.json().projects === 'number'); ok('POST /api/op/get_stats');
  r = await req2('GET', '/api/projects/nope'); assert(r.status === 404); ok('404 for unknown project');
  srv.server.close();

  // --- MCP stdio
  const mcp = spawn(process.execPath, [path.join(HOME, 'bin', 'mcp.js')], { env, stdio: ['pipe', 'pipe', 'pipe'] });
  const responses = [];
  let buffer = '';
  mcp.stdout.on('data', d => { buffer += d; let i; while ((i = buffer.indexOf('\n')) >= 0) { const line = buffer.slice(0, i); buffer = buffer.slice(i + 1); if (line.trim()) responses.push(JSON.parse(line)); } });
  const send = o => mcp.stdin.write(JSON.stringify(o) + '\n');
  send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'smoke', version: '1' } } });
  send({ jsonrpc: '2.0', method: 'notifications/initialized' });
  send({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
  send({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'get_project', arguments: { id: 'smoke-project', journal_limit: 2 } } });
  send({ jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'add_suggestion', arguments: { id: 'smoke-project', text: 'via mcp', by: 'opus' } } });
  send({ jsonrpc: '2.0', id: 5, method: 'resources/list' });
  send({ jsonrpc: '2.0', id: 6, method: 'resources/read', params: { uri: 'masterbrain://project/smoke-project' } });
  send({ jsonrpc: '2.0', id: 7, method: 'prompts/get', params: { name: 'start_work', arguments: { project: 'smoke-project', task: 'test' } } });
  send({ jsonrpc: '2.0', id: 8, method: 'tools/call', params: { name: 'generate_report', arguments: { format: 'json', projects: ['smoke-project'] } } });
  send({ jsonrpc: '2.0', id: 9, method: 'nope/method' });
  send({ jsonrpc: '2.0', id: 10, method: 'ping' });
  await new Promise(res => setTimeout(res, 1500));
  mcp.stdin.end();
  await new Promise(res => mcp.on('close', res));
  const by = id => responses.find(r => r.id === id);
  assert(by(1).result.protocolVersion === '2025-06-18' && by(1).result.serverInfo.name === 'master-brain'); ok('MCP initialize');
  assert(by(2).result.tools.length >= 15 && by(2).result.tools.every(t => t.inputSchema.type === 'object')); ok(`MCP tools/list → ${by(2).result.tools.length} tools`);
  assert(by(3).result.isError === false && /smoke-project/.test(by(3).result.content[0].text)); ok('MCP tools/call get_project');
  assert(by(4).result.isError === false && JSON.parse(by(4).result.content[0].text).by === 'opus'); ok('MCP tools/call add_suggestion (attributed to opus)');
  assert(by(5).result.resources.some(x => x.uri === 'masterbrain://project/smoke-project')); ok('MCP resources/list');
  assert(/Engineering Mind|العقل الهندسي/.test(by(6).result.contents[0].text)); ok('MCP resources/read');
  assert(by(7).result.messages[0].content.text.includes('Task: test')); ok('MCP prompts/get');
  assert(JSON.parse(by(8).result.content[0].text).files[0].format === 'json'); ok('MCP generate_report');
  assert(by(9).error && by(9).error.code === -32601); ok('MCP unknown method → -32601');
  assert(by(10).result && Object.keys(by(10).result).length === 0); ok('MCP ping');
  // stdout must contain only JSON lines
  assert(responses.length === 10); ok('stdout clean (10 JSON responses, no stray output)');

  fs.rmSync(TMP, { recursive: true, force: true });
  console.log('\nsmoke.test.js OK');
})().catch(e => { console.error('\n✖ SMOKE FAILED:', e); process.exit(1); });
