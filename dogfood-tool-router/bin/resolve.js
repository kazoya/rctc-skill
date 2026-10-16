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

function empty(status, reason) {
  return {
    local: status === 'invalid_registry' ? null : 'rctc-method',
    external: null,
    upstream_skill: null,
    blocked: false,
    status,
    refused: null,
    reason,
  };
}

function enableAll(registry) {
  const copy = JSON.parse(JSON.stringify(registry));
  for (const item of Object.values(copy.integrations)) {
    item.enabled = true;
    item.available = true;
  }
  return copy;
}

function resolveTask(text, registry) {
  if (!registry || typeof registry !== 'object' || !registry.integrations || typeof registry.integrations !== 'object' || Array.isArray(registry.integrations)) {
    return empty('invalid_registry', 'invalid_registry');
  }
  const rule = ORDER.find((item) => item.test.test(String(text || '')));
  if (!rule) return empty('unmatched', 'no_rule');
  if (rule.blocked) {
    return {
      local: rule.local,
      external: null,
      upstream_skill: null,
      blocked: true,
      status: 'blocked',
      refused: null,
      reason: 'blocked',
    };
  }
  if (!rule.external) {
    return {
      local: rule.local,
      external: null,
      upstream_skill: null,
      blocked: false,
      status: 'matched',
      refused: null,
      reason: null,
    };
  }
  const integration = registry.integrations[rule.external];
  if (!integration || integration.enabled !== true) {
    return {
      local: rule.local,
      external: null,
      upstream_skill: null,
      blocked: false,
      status: 'refused',
      refused: rule.external,
      reason: 'disabled',
    };
  }
  if (integration.available === false) {
    return {
      local: rule.local,
      external: null,
      upstream_skill: null,
      blocked: false,
      status: 'refused',
      refused: rule.external,
      reason: 'unavailable',
    };
  }
  return {
    local: rule.local,
    external: rule.external,
    upstream_skill: rule.upstream_skill || null,
    blocked: false,
    status: 'matched',
    refused: null,
    reason: null,
  };
}

function callExternal(route) {
  if (!route || route.external == null) {
    return { called: false, tool_calls: 0, reason: route && route.reason ? route.reason : 'no_external' };
  }
  return { called: false, tool_calls: 0, reason: 'adapter_does_not_spawn' };
}

module.exports = { resolveTask, enableAll, callExternal };
