"use strict";

export let ReclaimResult;
(function (_ReclaimResult) {
  const isProof = _ReclaimResult.isProof = value => {
    return typeof value === 'object' && value !== null && 'identifier' in value && 'signatures' in value && 'witnesses' in value;
  };
  const asProofs = _ReclaimResult.asProofs = proofs => {
    return proofs.filter(isProof);
  };
})(ReclaimResult || (ReclaimResult = {}));
//# sourceMappingURL=proof.js.map