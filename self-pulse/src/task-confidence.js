'use strict';

const { brierScore, FORMULA_VERSION } = require('./formulas');

class TaskConfidenceEvaluator {
  constructor() {
    this.pairs = [];
  }

  /**
   * Record prediction BEFORE verified outcome is known.
   */
  recordPrediction({ taskId, pSuccess, at }) {
    if (typeof pSuccess !== 'number' || pSuccess < 0 || pSuccess > 1) {
      throw Object.assign(new Error('invalid pSuccess'), { code: 'INVALID_P' });
    }
    this.pairs = [
      ...this.pairs,
      {
        taskId,
        forecast: pSuccess,
        outcome: null,
        predictedAt: at || new Date().toISOString(),
        verifiedAt: null
      }
    ];
    return { ok: true, pending: true };
  }

  attachVerifiedOutcome(taskId, success) {
    const idx = this.pairs.findIndex((p) => p.taskId === taskId && p.outcome === null);
    if (idx < 0) {
      throw Object.assign(new Error('no pending prediction for task'), { code: 'NO_PENDING' });
    }
    const next = [...this.pairs];
    next[idx] = {
      ...next[idx],
      outcome: success ? 1 : 0,
      verifiedAt: new Date().toISOString()
    };
    this.pairs = next;
    return this.calibration();
  }

  calibration() {
    const closed = this.pairs.filter((p) => p.outcome === 0 || p.outcome === 1);
    const brier = brierScore(closed.map((p) => ({ forecast: p.forecast, outcome: p.outcome })));
    const miscalibrated = closed.filter(
      (p) => (p.forecast >= 0.7 && p.outcome === 0) || (p.forecast <= 0.3 && p.outcome === 1)
    );
    return {
      formulaVersion: FORMULA_VERSION,
      brier,
      nClosed: closed.length,
      nPending: this.pairs.length - closed.length,
      incorrectHighConfidenceCount: miscalibrated.length,
      pairs: closed
    };
  }
}

module.exports = { TaskConfidenceEvaluator };
