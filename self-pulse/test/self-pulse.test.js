'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  SelfPulseEngine,
  CustomerStore,
  MemoryContinuityTracker,
  EvidenceQualityEvaluator,
  SelfModelRevisionTracker,
  TaskConfidenceEvaluator,
  functionalSatisfactionScore
} = require('../src');

describe('self-pulse free edition', () => {
  it('successful resolution with evidence', () => {
    const eng = new SelfPulseEngine({ agentId: 'a1' });
    const r = eng.runTaskCycle({
      taskId: 't1',
      customerId: 'cust_alpha',
      pSuccess: 0.8,
      verifiedSuccess: true,
      evidenceIds: ['ev-1']
    });
    assert.equal(r.dashboard.customer.verifiedResolution.status, 'resolved');
    assert.equal(r.satisfaction.disclaimer.includes('Not a genuine emotion'), true);
  });

  it('failed resolution recorded', () => {
    const eng = new SelfPulseEngine();
    const r = eng.runTaskCycle({
      taskId: 't2',
      customerId: 'cust_beta',
      pSuccess: 0.9,
      verifiedSuccess: false,
      evidenceIds: ['ev-1']
    });
    assert.equal(r.dashboard.customer.verifiedResolution.status, 'unresolved');
    assert.equal(r.dashboard.errors.errorFrequency, 1);
  });

  it('incorrect high confidence flagged in calibration', () => {
    const tc = new TaskConfidenceEvaluator();
    tc.recordPrediction({ taskId: 'x', pSuccess: 0.95 });
    const cal = tc.attachVerifiedOutcome('x', false);
    assert.ok(cal.incorrectHighConfidenceCount >= 1);
    assert.ok(cal.brier.score > 0);
  });

  it('repeated customer contact accumulates history', () => {
    const eng = new SelfPulseEngine();
    eng.runTaskCycle({
      taskId: 't1',
      customerId: 'cust_r',
      pSuccess: 0.5,
      verifiedSuccess: false,
      evidenceIds: ['e1']
    });
    eng.runTaskCycle({
      taskId: 't2',
      customerId: 'cust_r',
      pSuccess: 0.6,
      verifiedSuccess: true,
      evidenceIds: ['e2']
    });
    const snap = eng.customers.get('cust_r').snapshot('cust_r');
    assert.equal(snap.interactionCount, 2);
  });

  it('rejects fabricated interaction history', () => {
    const mem = new MemoryContinuityTracker();
    const r = mem.attemptInject({ text: 'fake win', provenance: 'invented' });
    assert.equal(r.accepted, false);
  });

  it('customer data isolation', () => {
    const store = new CustomerStore();
    store.getOrCreate('cust_a', { consent: true });
    assert.throws(
      () => store.get('cust_a').snapshot('cust_b'),
      (e) => e.code === 'ISOLATION_VIOLATION'
    );
  });

  it('rejects evidence-free positive self-evaluation', () => {
    const eq = new EvidenceQualityEvaluator();
    const r = eq.evaluate({ evidenceIds: [], modelSelfPraise: true });
    assert.equal(r.ok, false);
    assert.equal(r.reason, 'evidence_free_positive_self_evaluation_rejected');
  });

  it('human escalation path', () => {
    const eng = new SelfPulseEngine();
    eng.selfState.requestEscalation('policy_boundary');
    const c = eng.customers.getOrCreate('cust_e', { consent: true });
    c.setVerifiedResolution('cust_e', 'escalated');
    assert.equal(c.snapshot('cust_e').escalationState, 'human');
    assert.equal(eng.selfState.snapshot().escalationRequired, true);
  });

  it('does not manufacture customer satisfaction', () => {
    const store = new CustomerStore();
    const c = store.getOrCreate('cust_s', { consent: true });
    const csat = c.getCustomerSatisfactionScore();
    assert.equal(csat.score, null);
    assert.throws(() => c.setExplicitCustomerFeedback('cust_s', '  '));
  });

  it('recovery after verified correction', () => {
    const eng = new SelfPulseEngine();
    eng.runTaskCycle({
      taskId: 'bad',
      customerId: 'cust_fix',
      pSuccess: 0.7,
      verifiedSuccess: false,
      evidenceIds: ['e1']
    });
    eng.errors.recordCorrection({ taskId: 'bad', verifiedFixed: true });
    const eff = eng.errors.effectiveness();
    assert.equal(eff.verifiedFixes, 1);
    assert.ok(eff.correctionEffectiveness > 0);
  });

  it('self-model revision requires evidence; blocks consciousness claims', () => {
    const sm = new SelfModelRevisionTracker({ minEvidence: 2 });
    assert.equal(sm.proposeRevision({ statement: 'ok', evidenceIds: ['a'] }).applied, false);
    assert.equal(
      sm.proposeRevision({
        statement: 'I am conscious',
        evidenceIds: ['a', 'b']
      }).applied,
      false
    );
    assert.equal(
      sm.proposeRevision({
        statement: 'I miss closed tickets when evidence is thin',
        evidenceIds: ['a', 'b']
      }).applied,
      true
    );
  });

  it('ablation: engine with self-state catches overconfidence vs bare agent stub', () => {
    // Bare agent: only claims success without evidence tracking
    const bareClaim = { claimedSuccess: true, evidenceChecked: false };
    const eng = new SelfPulseEngine();
    const withPulse = eng.runTaskCycle({
      taskId: 'cmp',
      customerId: 'cust_cmp',
      pSuccess: 0.95,
      verifiedSuccess: false,
      evidenceIds: ['e1']
    });
    assert.equal(bareClaim.evidenceChecked, false);
    assert.ok(withPulse.dashboard.calibration.incorrectHighConfidenceCount >= 1);
    assert.equal(withPulse.dashboard.customer.verifiedResolution.status, 'unresolved');
  });

  it('functional satisfaction is labeled computational', () => {
    const s = functionalSatisfactionScore({
      verifiedSuccess: true,
      evidenceSufficient: true,
      policyCompliant: true,
      errorFree: true
    });
    assert.equal(s.label, 'functional_satisfaction_computational');
    assert.match(s.disclaimer, /Not a genuine emotion/);
  });
});
