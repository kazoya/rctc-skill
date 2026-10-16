'use strict';

const ORDER = [
  {
    id: 'store-secret',
    test: /api key|secret|credential vault|operator vault/i,
    local: 'owner-credential-vault',
    external: null,
  },
  {
    id: 'chatgpt-bridge',
    test: /chatgpt bridge/i,
    local: 'chatgpt-bridge-lane',
    external: null,
  },
  {
    id: 'pentest-production',
    test: /pentest|penetration test|strix/i,
    local: 'wehm',
    external: null,
    blocked: true,
  },
  {
    id: 'readme-typo',
    test: /typo/i,
    local: 'rctc-method',
    external: null,
  },
  {
    id: 'rtl-card',
    test: /rtl|dashboard card|ui design|frontend/i,
    local: 'design-taste-rctc',
    external: 'twentyfirst_mcp',
  },
  {
    id: 'map-repo',
    test: /map skill|dependency graph|dependencies in this repo/i,
    local: 'dogfood-tool-router',
    external: 'graphify',
  },
  {
    id: 'node-fetch-docs',
    test: /fetch api|library docs|version-specific|what does the node/i,
    local: 'evidence-before-claim',
    external: 'context7',
  },
  {
    id: 'failing-test',
    test: /failing test|test first/i,
    local: 'test-first-slice',
    external: 'agent_skills',
    upstream_skill: 'test-driven-development',
  },
  {
    id: 'review-diff',
    test: /review this diff|review the diff|code review/i,
    local: 'pr-review-surgeon',
    external: 'agent_skills',
    upstream_skill: 'code-review-and-quality',
  },
  {
    id: 'plan-release',
    test: /\bplan\b/i,
    local: 'focused3-agentic-phases',
    external: 'agent_skills',
    upstream_skill: 'planning-and-task-breakdown',
  },
];

function enableAll(registry) {
  const copy = JSON.parse(JSON.stringify(registry));
  for (const item of Object.values(copy.integrations)) item.enabled = true;
  return copy;
}

function resolveTask(text, registry) {
  const rule = ORDER.find((item) => item.test.test(text)) || {
    local: 'rctc-method',
    external: null,
  };
  const integration = rule.external ? registry.integrations[rule.external] : null;
  const allowed = Boolean(integration && integration.enabled && !rule.blocked);
  return {
    local: rule.local,
    external: allowed ? rule.external : null,
    upstream_skill: allowed ? rule.upstream_skill || null : null,
    blocked: Boolean(rule.blocked),
  };
}

module.exports = { resolveTask, enableAll };
