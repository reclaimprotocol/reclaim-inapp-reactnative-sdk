"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReclaimVerification = void 0;
var _platform = require("./platform.js");
var _types = require("./types.js");
/**
 * [ReclaimVerification] is the main class for interacting with the Reclaim verification system.
 * It provides methods to start verification processes, manage platform configurations,
 * and handle verification options.
 * 
 * The class can be instantiated with a custom platform implementation, or will use
 * the default [PlatformImpl] if none is provided.
 */
class ReclaimVerification {
  static defaultPlatform = null;
  constructor(platform) {
    if (platform) {
      this.platform = platform;
    } else {
      if (ReclaimVerification.defaultPlatform == null) {
        ReclaimVerification.defaultPlatform = new _platform.PlatformImpl();
      }
      this.platform = ReclaimVerification.defaultPlatform;
    }
  }
  async startVerification(request) {
    return this.platform.startVerification(request);
  }
  async ping() {
    return this.platform.ping();
  }
  setOverrides(overrides) {
    return this.platform.setOverrides(overrides);
  }
  clearAllOverrides() {
    return this.platform.clearAllOverrides();
  }
  setVerificationOptions(options) {
    return this.platform.setVerificationOptions(options);
  }
}

// Re-export all the types from the types file
exports.ReclaimVerification = ReclaimVerification;
(function (_ReclaimVerification) {
  let ReclaimResult;
  (function (_ReclaimResult) {
    const isProof = _ReclaimResult.isProof = _types.ReclaimVerification.ReclaimResult.isProof;
    const asProofs = _ReclaimResult.asProofs = _types.ReclaimVerification.ReclaimResult.asProofs;
  })(ReclaimResult || (ReclaimResult = _ReclaimVerification.ReclaimResult || (_ReclaimVerification.ReclaimResult = {})));
  const ExceptionType = _ReclaimVerification.ExceptionType = _types.ReclaimVerification.ExceptionType;
  const ReclaimPlatformException = _ReclaimVerification.ReclaimPlatformException = _types.ReclaimVerification.ReclaimPlatformException;
  const ReclaimVerificationException = _ReclaimVerification.ReclaimVerificationException = _types.ReclaimVerification.ReclaimVerificationException;
  const Platform = _ReclaimVerification.Platform = _types.ReclaimVerification.Platform;
})(ReclaimVerification || (exports.ReclaimVerification = ReclaimVerification = {}));
//# sourceMappingURL=index.js.map