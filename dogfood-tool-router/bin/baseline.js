'use strict';

const RULES = [
  { test: /chatgpt bridge|chatgpt-bridge/i, local: 'chatgpt-bridge-lane' },
  { test: /continue safely|within the authority|safe-forward/i, local: 'safe-forward-execution' },
  { test: /prove implementation|think, execute, prove|focused3/i, local: 'focused3-agentic-phases' },
  { test: /marketing site/i, local: 'web_marketing_and_personal-builder-super-skill' },
  { test: /returned zip|update-zip/i, local: 'update-zip-skill' },
  { test: /scattered projects|one portfolio/i, local: 'start-skill' },
  { test: /repeated measured improvement/i, local: 'continuous-improving' },
];

function baselineRoute(text) {
  const rule = RULES.find((item) => item.test.test(text));
  return {
    local: rule ? rule.local : 'rctc-method',
    external: null,
    blocked: false,
    status: rule ? 'matched' : 'unmatched',
    tool_calls: 0,
  };
}

module.exports = { baselineRoute };
