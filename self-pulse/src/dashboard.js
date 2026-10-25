'use strict';

/**
 * AgentPerformanceDashboard — JSON dashboard-ready aggregate (free edition).
 */
function buildDashboard({
  selfState,
  calibration,
  satisfaction,
  customer,
  memory,
  errors,
  evidence,
  revisions
}) {
  return {
    product: 'self-pulse',
    edition: 'free',
    generatedAt: new Date().toISOString(),
    disclaimer:
      'Operational metrics only. Not consciousness. CSAT is never manufactured.',
    agent: selfState,
    calibration,
    functionalSatisfaction: satisfaction,
    customer: customer
      ? {
          customerId: customer.customerId,
          interactionCount: customer.interactionCount,
          verifiedResolution: customer.verifiedResolution,
          escalationState: customer.escalationState,
          csat: customer.csat
        }
      : null,
    memoryContinuity: memory,
    errors,
    evidence,
    selfModelRevisions: revisions
  };
}

module.exports = { buildDashboard };
