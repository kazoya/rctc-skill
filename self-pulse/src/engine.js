'use strict';

const { AgentSelfState } = require('./agent-self-state');
const { TaskConfidenceEvaluator } = require('./task-confidence');
const { functionalSatisfactionScore } = require('./formulas');
const { CustomerStore } = require('./customer-state');
const { MemoryContinuityTracker } = require('./memory-continuity');
const { EvidenceQualityEvaluator } = require('./evidence-quality');
const { ErrorAndRecoveryTracker } = require('./error-recovery');
const { SelfModelRevisionTracker } = require('./self-model-revision');
const { InteractionEventJournal } = require('./journal');
const { buildDashboard } = require('./dashboard');

/**
 * Orchestrates free-edition self-pulse evaluation for one or more tasks.
 */
class SelfPulseEngine {
  constructor(opts = {}) {
    this.selfState = new AgentSelfState({ agentId: opts.agentId });
    this.confidence = new TaskConfidenceEvaluator();
    this.customers = new CustomerStore();
    this.memory = new MemoryContinuityTracker();
    this.evidence = new EvidenceQualityEvaluator();
    this.errors = new ErrorAndRecoveryTracker();
    this.revisions = new SelfModelRevisionTracker({ minEvidence: opts.minEvidence || 2 });
    this.journal = new InteractionEventJournal();
  }

  /**
   * Full task cycle: predict → (external verify) → record.
   * Caller supplies verifiedSuccess from outside the model.
   */
  runTaskCycle({
    taskId,
    customerId,
    pSuccess,
    verifiedSuccess,
    evidenceIds,
    policyCompliant = true,
    consent = true
  }) {
    this.selfState.setPreExecutionConfidence(pSuccess);
    this.confidence.recordPrediction({ taskId, pSuccess });

    const eq = this.evidence.evaluate({
      evidenceIds,
      modelSelfPraise: false
    });

    this.confidence.attachVerifiedOutcome(taskId, verifiedSuccess);
    this.selfState.recordVerifiedOutcome({
      success: verifiedSuccess,
      evidenceIds,
      policyCompliant,
      evidenceSufficient: eq.evidenceSufficient
    });

    const sat = functionalSatisfactionScore({
      verifiedSuccess,
      evidenceSufficient: eq.evidenceSufficient,
      policyCompliant,
      errorFree: verifiedSuccess
    });

    if (!verifiedSuccess) {
      this.errors.recordError({ taskId, code: 'TASK_FAIL', message: 'verified failure' });
    }

    let customerSnap = null;
    if (customerId) {
      const c = this.customers.getOrCreate(customerId, { consent });
      c.addInteraction(customerId, {
        taskId,
        progress: verifiedSuccess ? 'done' : 'failed',
        failure: !verifiedSuccess,
        agentConfidence: pSuccess,
        evidenceQuality: eq.score
      });
      c.setVerifiedResolution(
        customerId,
        verifiedSuccess ? 'resolved' : 'unresolved'
      );
      customerSnap = c.snapshot(customerId);
    }

    this.journal.append({
      customerId: customerId || null,
      type: 'task_cycle',
      modelReported: { pSuccess },
      verified: { success: verifiedSuccess, evidenceIds },
      evidenceIds
    });

    const dashboard = buildDashboard({
      selfState: this.selfState.snapshot(),
      calibration: this.confidence.calibration(),
      satisfaction: sat,
      customer: customerSnap,
      memory: this.memory.continuityReport(),
      errors: this.errors.effectiveness(),
      evidence: eq,
      revisions: this.revisions.snapshot()
    });

    return { dashboard, satisfaction: sat, evidence: eq };
  }
}

module.exports = { SelfPulseEngine };
