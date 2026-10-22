'use strict';

const crypto = require('node:crypto');

/**
 * InteractionEventJournal — append-only in-memory / serializable journal.
 * Separates verifiedOutcome from modelReported fields.
 */
class InteractionEventJournal {
  constructor() {
    this.events = [];
    this._prevHash = null;
  }

  append(event) {
    const payload = {
      eventId: event.eventId || crypto.randomUUID(),
      at: event.at || new Date().toISOString(),
      customerId: event.customerId || null,
      type: event.type,
      // Layer separation
      modelReported: event.modelReported || null,
      verified: event.verified || null,
      evidenceIds: event.evidenceIds || [],
      meta: event.meta || {}
    };
    const body = JSON.stringify(payload);
    const eventHash = crypto
      .createHash('sha256')
      .update(String(this._prevHash || '') + body)
      .digest('hex');
    const row = { ...payload, previousEventHash: this._prevHash, eventHash };
    this.events = [...this.events, row];
    this._prevHash = eventHash;
    return row;
  }

  forCustomer(customerId) {
    return this.events.filter((e) => e.customerId === customerId);
  }

  toJSON() {
    return { events: this.events };
  }
}

module.exports = { InteractionEventJournal };
