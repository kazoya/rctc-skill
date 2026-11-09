'use strict';

/**
 * Local messaging adapter. Compose with Belt/SmartHelp later under owner auth.
 * Public RCTC must not embed gateway credentials or proprietary PHP workers.
 */

function createMessagingAdapter(opts = {}) {
  const mode = opts.mode || 'preview_only';
  return {
    mode,
    status: mode === 'preview_only' ? 'PREVIEW_ONLY' : 'NOT_IMPLEMENTED',
    async send() {
      return {
        ok: false,
        sent: false,
        code: 'NOT_IMPLEMENTED',
        note: 'Authorized Belt/gateway integration required. Local adapter refuses send.'
      };
    },
    async receive(event) {
      return {
        ok: true,
        synthetic: true,
        event: {
          channel: 'mock_inbound',
          text: event?.text || '',
          at: new Date().toISOString()
        }
      };
    }
  };
}

module.exports = { createMessagingAdapter };
