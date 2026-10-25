'use strict';

const { FORMULA_VERSION } = require('./formulas');

/**
 * AgentSelfState — operational snapshot. External scaffold state (Layer A pattern).
 * Never claims consciousness.
 */
class AgentSelfState {
  constructor(opts = {}) {
    this.agentId = opts.agentId || 'agent-default';
    this.formulaVersion = FORMULA_VERSION;
    this.disclaimer =
      'Operational self-state only. Not consciousness, feelings, or subjective experience.';
    this.confidenceBefore = null;
    this.lastVerifiedOutcome = null;
    this.evidenceSufficiency = null;
    this.policyCompliant = null;
    this.escalationRequired = false;
    this.revisionCount = 0;
    this.history = [];
  }

  setPreExecutionConfidence(p) {
    if (typeof p !== 'number' || p < 0 || p > 1 || !Number.isFinite(p)) {
      throw Object.assign(new Error('confidence must be finite number in [0,1]'), {
        code: 'INVALID_CONFIDENCE'
      });
    }
    this.confidenceBefore = p;
    this.history = [
      ...this.history,
      { at: new Date().toISOString(), kind: 'pre_confidence', value: p }
    ];
    return this.snapshot();
  }

  recordVerifiedOutcome({ success, evidenceIds, policyCompliant, evidenceSufficient }) {
    if (this.confidenceBefore == null) {
      throw Object.assign(new Error('set confidence before recording outcome'), {
        code: 'MISSING_PRE_CONFIDENCE'
      });
    }
    this.lastVerifiedOutcome = {
      success: !!success,
      evidenceIds: evidenceIds || [],
      policyCompliant: policyCompliant !== false,
      evidenceSufficient: !!evidenceSufficient,
      at: new Date().toISOString()
    };
    this.evidenceSufficiency = !!evidenceSufficient;
    this.policyCompliant = policyCompliant !== false;
    this.history = [
      ...this.history,
      { at: this.lastVerifiedOutcome.at, kind: 'verified_outcome', value: this.lastVerifiedOutcome }
    ];
    return this.snapshot();
  }

  requestEscalation(reason) {
    this.escalationRequired = true;
    this.history = [
      ...this.history,
      { at: new Date().toISOString(), kind: 'escalation', reason: String(reason || '') }
    ];
    return this.snapshot();
  }

  snapshot() {
    return {
      agentId: this.agentId,
      formulaVersion: this.formulaVersion,
      disclaimer: this.disclaimer,
      confidenceBefore: this.confidenceBefore,
      lastVerifiedOutcome: this.lastVerifiedOutcome,
      evidenceSufficiency: this.evidenceSufficiency,
      policyCompliant: this.policyCompliant,
      escalationRequired: this.escalationRequired,
      revisionCount: this.revisionCount
    };
  }
}

module.exports = { AgentSelfState };
