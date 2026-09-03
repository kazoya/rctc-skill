'use strict';
/**
 * Master Brain — configuration.
 * Platform root = folder containing package.json (or MB_HOME env var).
 * config.json lives there; config.example.json documents every key.
 */
const path = require('path');
const os = require('os');
const u = require('./util');

const PLATFORM_ROOT = process.env.MB_HOME ? path.resolve(process.env.MB_HOME) : path.resolve(__dirname, '..');
const VERSION = (u.readJson(path.join(path.resolve(__dirname, '..'), 'package.json'), {}) || {}).version || '1.0.0';

const DEFAULTS = {
  platformName: { ar: 'ماستر برين — منصة المتابعة والعقل الهندسي', en: 'Master Brain — Portfolio Tracker & Engineering Mind' },
  owner: { name: '', email: '' },
  projectsRoot: process.platform === 'win32' ? 'D:\\projects' : path.join(os.homedir(), 'projects'),
  host: '127.0.0.1',
  port: 4545,
  defaultLang: 'ar',
  timezone: 'Asia/Riyadh',
  dormantAfterDays: 45,
  reportsDir: 'data/reports',
  openBrowserOnServe: false,
  // Which model is answering by default when an entry has no explicit --model (Claude Code sets this itself)
  defaultModel: 'claude',
};

function loadConfig(overrides = {}) {
  const cfgPath = path.join(PLATFORM_ROOT, 'config.json');
  const file = u.readJson(cfgPath, null) || {};
  const cfg = { ...DEFAULTS, ...file, ...overrides };
  if (process.env.MB_PROJECTS_ROOT) cfg.projectsRoot = process.env.MB_PROJECTS_ROOT;
  if (process.env.MB_PORT) cfg.port = parseInt(process.env.MB_PORT, 10) || cfg.port;
  cfg.platformRoot = PLATFORM_ROOT;
  cfg.configPath = cfgPath;
  cfg.configExists = !!u.readText(cfgPath);
  cfg.projectsRoot = path.resolve(cfg.projectsRoot);
  cfg.dataDir = path.join(PLATFORM_ROOT, 'data');
  cfg.reportsDirAbs = path.isAbsolute(cfg.reportsDir) ? cfg.reportsDir : path.join(PLATFORM_ROOT, cfg.reportsDir);
  cfg.version = VERSION;
  return cfg;
}

function saveConfig(cfg) {
  const keep = ['platformName', 'owner', 'projectsRoot', 'host', 'port', 'defaultLang', 'timezone', 'dormantAfterDays', 'reportsDir', 'openBrowserOnServe', 'defaultModel'];
  const out = {};
  for (const k of keep) if (cfg[k] !== undefined) out[k] = cfg[k];
  u.writeJson(path.join(PLATFORM_ROOT, 'config.json'), out);
  return out;
}

module.exports = { PLATFORM_ROOT, VERSION, DEFAULTS, loadConfig, saveConfig };
