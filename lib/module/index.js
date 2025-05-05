"use strict";

import { PlatformImpl } from "./platform.js";
import { ReclaimVerification as ReclaimVerificationTypes } from "./types.js";

/**
 * [ReclaimVerification] is the main class for interacting with the Reclaim verification system.
 * It provides methods to start verification processes, manage platform configurations,
 * and handle verification options.
 * 
 * The class can be instantiated with a custom platform implementation, or will use
 * the default [PlatformImpl] if none is provided.
 */
export class ReclaimVerification {
  static defaultPlatform = null;
  constructor(platform) {
    if (platform) {
      this.platform = platform;
    } else {
      if (ReclaimVerification.defaultPlatform == null) {
        ReclaimVerification.defaultPlatform = new PlatformImpl();
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
(function (_ReclaimVerification) {
  let ReclaimResult;
  (function (_ReclaimResult) {
    const isProof = _ReclaimResult.isProof = ReclaimVerificationTypes.ReclaimResult.isProof;
    const asProofs = _ReclaimResult.asProofs = ReclaimVerificationTypes.ReclaimResult.asProofs;
  })(ReclaimResult || (ReclaimResult = _ReclaimVerification.ReclaimResult || (_ReclaimVerification.ReclaimResult = {})));
  const ExceptionType = _ReclaimVerification.ExceptionType = ReclaimVerificationTypes.ExceptionType;
  const ReclaimPlatformException = _ReclaimVerification.ReclaimPlatformException = ReclaimVerificationTypes.ReclaimPlatformException;
  const ReclaimVerificationException = _ReclaimVerification.ReclaimVerificationException = ReclaimVerificationTypes.ReclaimVerificationException;
  const Platform = _ReclaimVerification.Platform = ReclaimVerificationTypes.Platform;
})(ReclaimVerification || (ReclaimVerification = {}));
//# sourceMappingURL=index.js.map