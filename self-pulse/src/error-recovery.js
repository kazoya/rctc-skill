'use strict';

class ErrorAndRecoveryTracker {
  constructor() {
    this.errors = [];
    this.corrections = [];
  }

  recordError({ taskId, code, message }) {
    const row = { taskId, code, message, at: new Date().toISOString() };
    this.errors = [...this.errors, row];
    return row;
  }

  recordCorrection({ taskId, verifiedFixed }) {
    const row = {
      taskId,
      verifiedFixed: !!verifiedFixed,
      at: new Date().toISOString()
    };
    this.corrections = [...this.corrections, row];
    return row;
  }

  effectiveness() {
    const nErr = this.errors.length;
    const fixed = this.corrections.filter((c) => c.verifiedFixed).length;
    return {
      errorFrequency: nErr,
      corrections: this.corrections.length,
      verifiedFixes: fixed,
      correctionEffectiveness: nErr === 0 ? null : +(fixed / nErr).toFixed(4)
    };
  }
}

module.exports = { ErrorAndRecoveryTracker };
