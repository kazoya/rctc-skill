'use strict';

/**
 * CustomerInteractionState — customer-scoped, isolation-enforced.
 * Never manufactures customer satisfaction.
 */
class CustomerInteractionState {
  constructor({ customerId, consent = false }) {
    if (!customerId || typeof customerId !== 'string') {
      throw Object.assign(new Error('customerId required'), { code: 'NO_CUSTOMER' });
    }
    if (customerId.length > 64 || !/^[a-zA-Z0-9_-]+$/.test(customerId)) {
      throw Object.assign(new Error('customerId must be pseudonymous token'), {
        code: 'BAD_CUSTOMER_ID'
      });
    }
    this.customerId = customerId;
    this.consent = !!consent;
    this.interactions = [];
    this.escalationState = 'none';
    this.verifiedResolution = null;
    this.explicitFeedback = null; // only when customer provides
    this.retentionDays = 90;
  }

  assertAccess(requesterCustomerId) {
    if (requesterCustomerId !== this.customerId) {
      throw Object.assign(new Error('customer data isolation violation'), {
        code: 'ISOLATION_VIOLATION'
      });
    }
  }

  addInteraction(requesterCustomerId, entry) {
    this.assertAccess(requesterCustomerId);
    if (!this.consent && entry.requiresConsent) {
      throw Object.assign(new Error('consent required'), { code: 'NO_CONSENT' });
    }
    const row = {
      at: new Date().toISOString(),
      taskId: entry.taskId,
      progress: entry.progress || 'open',
      failure: !!entry.failure,
      agentConfidence: entry.agentConfidence,
      evidenceQuality: entry.evidenceQuality,
      note: entry.note || null
    };
    this.interactions = [...this.interactions, row];
    return row;
  }

  setVerifiedResolution(requesterCustomerId, status) {
    this.assertAccess(requesterCustomerId);
    if (!['resolved', 'unresolved', 'escalated'].includes(status)) {
      throw Object.assign(new Error('invalid resolution status'), { code: 'BAD_STATUS' });
    }
    this.verifiedResolution = { status, at: new Date().toISOString() };
    if (status === 'escalated') this.escalationState = 'human';
    return this.verifiedResolution;
  }

  /**
   * Only store feedback the customer explicitly provided. Never invent CSAT.
   */
  setExplicitCustomerFeedback(requesterCustomerId, text) {
    this.assertAccess(requesterCustomerId);
    if (text == null || String(text).trim() === '') {
      throw Object.assign(new Error('empty feedback not stored as satisfaction'), {
        code: 'NO_FABRICATED_CSAT'
      });
    }
    this.explicitFeedback = {
      text: String(text).slice(0, 2000),
      at: new Date().toISOString(),
      source: 'customer_explicit'
    };
    return this.explicitFeedback;
  }

  /** Refuse manufactured satisfaction scores. */
  getCustomerSatisfactionScore() {
    return {
      score: null,
      reason: 'satisfaction_not_inferred',
      note: 'Only explicit customer feedback is stored; no CSAT is manufactured.'
    };
  }

  snapshot(requesterCustomerId) {
    this.assertAccess(requesterCustomerId);
    return {
      customerId: this.customerId,
      consent: this.consent,
      interactionCount: this.interactions.length,
      interactions: this.interactions,
      verifiedResolution: this.verifiedResolution,
      escalationState: this.escalationState,
      explicitFeedback: this.explicitFeedback,
      retentionDays: this.retentionDays,
      csat: this.getCustomerSatisfactionScore()
    };
  }

  deleteAll(requesterCustomerId) {
    this.assertAccess(requesterCustomerId);
    this.interactions = [];
    this.verifiedResolution = null;
    this.explicitFeedback = null;
    this.escalationState = 'none';
    return { deleted: true, customerId: this.customerId };
  }
}

/** Multi-tenant store with hard isolation. */
class CustomerStore {
  constructor() {
    this._map = new Map();
  }

  getOrCreate(customerId, opts = {}) {
    if (!this._map.has(customerId)) {
      this._map.set(customerId, new CustomerInteractionState({ customerId, ...opts }));
    }
    return this._map.get(customerId);
  }

  get(customerId) {
    return this._map.get(customerId) || null;
  }
}

module.exports = { CustomerInteractionState, CustomerStore };
