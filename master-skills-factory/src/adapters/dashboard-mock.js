'use strict';

/** Synthetic dashboard projection — not a production UI. */

function projectDashboard(assessment, persistence) {
  return {
    kind: 'merchant_desk_summary',
    mode: assessment.mode,
    sectorId: assessment.sectorId,
    total: assessment.total,
    totalMinor: assessment.totalMinor,
    readyToIssue: assessment.readyToIssue,
    reference: persistence?.reference || null,
    gaps: (assessment.messages || []).map((m) => m.code),
    evidence_class: 'synthetic_dashboard'
  };
}

module.exports = { projectDashboard };
