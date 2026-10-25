'use strict';

/**
 * SelfModelRevisionTracker — evidence-gated belief updates (commercial analogue of SELF store).
 */
class SelfModelRevisionTracker {
  constructor({ minEvidence = 2 } = {}) {
    this.minEvidence = minEvidence;
    this.beliefs = [];
    this.revisions = [];
  }

  proposeRevision({ statement, evidenceIds }) {
    const ids = evidenceIds || [];
    if (ids.length < this.minEvidence) {
      return {
        applied: false,
        reason: 'insufficient_independent_evidence',
        required: this.minEvidence,
        got: ids.length
      };
    }
    if (/conscious|feel emotion|subjective experience/i.test(statement)) {
      return { applied: false, reason: 'consciousness_claim_forbidden' };
    }
    const belief = {
      id: `bel-${this.beliefs.length + 1}`,
      statement,
      evidenceIds: ids,
      at: new Date().toISOString()
    };
    this.beliefs = [...this.beliefs, belief];
    this.revisions = [...this.revisions, { ...belief, kind: 'major' }];
    return { applied: true, belief };
  }

  snapshot() {
    return { beliefs: this.beliefs, revisionCount: this.revisions.length };
  }
}

module.exports = { SelfModelRevisionTracker };
