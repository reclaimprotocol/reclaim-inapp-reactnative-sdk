"use strict";

import { PlatformImpl } from "./platform.js";

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

/**
 * This namespace provides types involved in initiating and managing the verification process
 * for proving claims about user data through various providers.
 */
(function (_ReclaimVerification) {
  /**
   * Represents user's session information for a verification attempt.
   * This data class contains the necessary data to identify and validate a verification session.
   */
  /**
   * Represents a request for a verification attempt.
   *
   * You can create a request using the [ReclaimVerification.Request] constructor or the [ReclaimVerification.Request.fromManifestMetaData] factory method.
   */
  /**
   * Contains the proof and response data after verification
   */
  let ReclaimResult;
  (function (_ReclaimResult) {
    const isProof = _ReclaimResult.isProof = value => {
      return typeof value === 'object' && value !== null && 'identifier' in value && 'signatures' in value && 'witnesses' in value;
    };
    const asProofs = _ReclaimResult.asProofs = proofs => {
      return proofs.filter(isProof);
    };
  })(ReclaimResult || (ReclaimResult = _ReclaimVerification.ReclaimResult || (_ReclaimVerification.ReclaimResult = {})));
  let Overrides;
  (function (_Overrides) {
    ;
  })(Overrides || (Overrides = _ReclaimVerification.Overrides || (_ReclaimVerification.Overrides = {})));
  let ExceptionType = /*#__PURE__*/function (ExceptionType) {
    ExceptionType["Cancelled"] = "Cancelled";
    ExceptionType["Dismissed"] = "Dismissed";
    ExceptionType["SessionExpired"] = "SessionExpired";
    ExceptionType["Failed"] = "Failed";
    return ExceptionType;
  }({});
  _ReclaimVerification.ExceptionType = ExceptionType;
  class ReclaimPlatformException extends Error {
    constructor(message, innerError) {
      super(message);
      this.innerError = innerError;
      this.reason = innerError.message;
      if ('userInfo' in innerError) {
        const details = innerError.userInfo;
        this.details = details;
        if ('message' in details) {
          this.reason = details.message || this.reason;
        }
      }
    }
    static isReclaimPlatformException(error) {
      return error instanceof ReclaimPlatformException;
    }
  }
  _ReclaimVerification.ReclaimPlatformException = ReclaimPlatformException;
  class ReclaimVerificationException extends Error {
    constructor(message, innerError, type, sessionId, didSubmitManualVerification, reason) {
      super(message);
      this.innerError = innerError;
      this.type = type;
      this.sessionId = sessionId;
      this.didSubmitManualVerification = didSubmitManualVerification;
      this.reason = reason;
    }
    static fromTypeName(name) {
      switch (name) {
        case "cancelled":
        case "org.reclaimprotocol.inapp_sdk.ReclaimVerification.ReclaimVerificationException.Cancelled":
          return ExceptionType.Cancelled;
        case "dismissed":
        case "org.reclaimprotocol.inapp_sdk.ReclaimVerification.ReclaimVerificationException.Dismissed":
          return ExceptionType.Dismissed;
        case "sessionExpired":
        case "org.reclaimprotocol.inapp_sdk.ReclaimVerification.ReclaimVerificationException.SessionExpired":
          return ExceptionType.SessionExpired;
        case "failed":
        case "org.reclaimprotocol.inapp_sdk.ReclaimVerification.ReclaimVerificationException.Failed":
          return ExceptionType.Failed;
      }
      return ExceptionType.Failed;
    }
    static fromError(error, sessionIdHint) {
      if ('userInfo' in error) {
        // From native, we send information about error in userInfo
        let userInfo = error.userInfo;
        if (userInfo) {
          let type = ReclaimVerification.ReclaimVerificationException.fromTypeName(userInfo.errorType);
          let maybeSessionId = userInfo?.sessionId;
          return new ReclaimVerificationException(error.message, error, type, typeof maybeSessionId === 'string' && maybeSessionId ? maybeSessionId : sessionIdHint, userInfo?.didSubmitManualVerification ?? false, userInfo?.reason ?? "");
        }
      }
      return new ReclaimVerificationException(error.message, error, ReclaimVerification.ExceptionType.Failed, sessionIdHint, false, "");
    }
    static isReclaimVerificationException(error) {
      return error instanceof ReclaimVerificationException;
    }
  }
  _ReclaimVerification.ReclaimVerificationException = ReclaimVerificationException;
  class Platform {}
  _ReclaimVerification.Platform = Platform;
})(ReclaimVerification || (ReclaimVerification = {}));
//# sourceMappingURL=index.js.map