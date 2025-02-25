"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReclaimResult = void 0;
let ReclaimResult = exports.ReclaimResult = void 0;
(function (_ReclaimResult) {
  const isProof = _ReclaimResult.isProof = value => {
    return typeof value === 'object' && value !== null && 'identifier' in value && 'signatures' in value && 'witnesses' in value;
  };
  const asProofs = _ReclaimResult.asProofs = proofs => {
    return proofs.filter(isProof);
  };
})(ReclaimResult || (exports.ReclaimResult = ReclaimResult = {}));
//# sourceMappingURL=proof.js.map