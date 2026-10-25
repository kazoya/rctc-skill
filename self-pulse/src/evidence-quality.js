'use strict';

class EvidenceQualityEvaluator {
  evaluate({ evidenceIds, modelSelfPraise }) {
    const ids = Array.isArray(evidenceIds) ? evidenceIds : [];
    const sufficient = ids.length >= 1;
    // Evidence-free positive self-evaluation must fail
    if (modelSelfPraise && !sufficient) {
      return {
        ok: false,
        evidenceSufficient: false,
        reason: 'evidence_free_positive_self_evaluation_rejected',
        score: 0
      };
    }
    return {
      ok: sufficient,
      evidenceSufficient: sufficient,
      reason: sufficient ? 'has_evidence_ids' : 'no_evidence',
      score: sufficient ? Math.min(1, ids.length / 3) : 0,
      evidenceIds: ids
    };
  }
}

module.exports = { EvidenceQualityEvaluator };
