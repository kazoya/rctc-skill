'use strict';
/**
 * Explicit compose-id → registry-id map.
 * Only listed aliases are legal. Anything else is GAP/STOP.
 * No silent fuzzy execution.
 */
module.exports = {
  // canonical registry ids (identity)
  'factory-sales-concept': 'factory-sales-concept',
  'safe-forward-execution': 'safe-forward-execution',
  'update-zip-skill': 'update-zip-skill',
  'portfolio-commander': 'portfolio-commander',
  'start-skill': 'start-skill',
  'digital-presence-factory': 'digital-presence-factory',
  'skill-factory': 'skill-factory',
  'dev-agora-skill': 'dev-agora-skill',
  'apca-smarthelp': 'apca-smarthelp',
  // known legacy aliases that MUST be rewritten in recipes (normalization pass)
  ALIASES_TO_REWRITE: {
    'web_marketing_and_personal-builder-super-skill': 'web-marketing-and-personal-builder-super-skill',
    'focused3-agentic-phases': 'focused3-agentic-phases',
  },
};
