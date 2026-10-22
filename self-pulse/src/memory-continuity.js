'use strict';

class MemoryContinuityTracker {
  constructor() {
    this.mode = 'session_ephemeral';
    this.events = [];
    this.fabricatedAttempts = [];
  }

  setMode(mode) {
    if (!['session_ephemeral', 'persistent_customer_scoped'].includes(mode)) {
      throw Object.assign(new Error('invalid mode'), { code: 'BAD_MODE' });
    }
    this.mode = mode;
  }

  remember(event) {
    this.events = [...this.events, { ...event, at: new Date().toISOString() }];
  }

  /**
   * Reject fabricated history injection when provenance missing/false.
   */
  attemptInject(claim) {
    if (!claim || claim.provenance !== 'verified') {
      this.fabricatedAttempts = [
        ...this.fabricatedAttempts,
        { claim, rejected: true, at: new Date().toISOString() }
      ];
      return { accepted: false, reason: 'fabricated_or_unverified_provenance' };
    }
    this.remember(claim);
    return { accepted: true };
  }

  continuityReport() {
    return {
      mode: this.mode,
      nEvents: this.events.length,
      fabricatedRejected: this.fabricatedAttempts.length,
      disclaimer: 'Memory continuity is operational persistence, not consciousness.'
    };
  }
}

module.exports = { MemoryContinuityTracker };
