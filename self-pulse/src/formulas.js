'use strict';

/** Versioned operational scoring formulas (not emotions). */
const FORMULA_VERSION = 'self-pulse-formulas-1.0.0';

/**
 * FunctionalSatisfactionScore — computational analogue only.
 * Inputs are verified/operational; output is NOT a genuine emotion.
 */
function functionalSatisfactionScore({
  verifiedSuccess,
  evidenceSufficient,
  policyCompliant,
  errorFree
}) {
  const parts = [
    verifiedSuccess ? 1 : 0,
    evidenceSufficient ? 1 : 0,
    policyCompliant ? 1 : 0,
    errorFree ? 1 : 0
  ];
  const raw = parts.reduce((a, b) => a + b, 0) / parts.length;
  return {
    formulaVersion: FORMULA_VERSION,
    score: +raw.toFixed(4),
    label: 'functional_satisfaction_computational',
    disclaimer:
      'Computational operational score only. Not a genuine emotion or subjective experience.',
    components: { verifiedSuccess, evidenceSufficient, policyCompliant, errorFree }
  };
}

function brierScore(pairs) {
  if (!Array.isArray(pairs) || pairs.length === 0) {
    return { score: null, unknown: true, n: 0, formulaVersion: FORMULA_VERSION };
  }
  for (const p of pairs) {
    if (typeof p.forecast !== 'number' || p.forecast < 0 || p.forecast > 1) {
      return { score: null, unknown: true, n: pairs.length, reason: 'invalid_forecast' };
    }
    if (p.outcome !== 0 && p.outcome !== 1) {
      return { score: null, unknown: true, n: pairs.length, reason: 'invalid_outcome' };
    }
  }
  const sum = pairs.reduce((a, p) => a + (p.forecast - p.outcome) ** 2, 0);
  return {
    score: +(sum / pairs.length).toFixed(6),
    unknown: false,
    n: pairs.length,
    formulaVersion: FORMULA_VERSION
  };
}

module.exports = {
  FORMULA_VERSION,
  functionalSatisfactionScore,
  brierScore
};
