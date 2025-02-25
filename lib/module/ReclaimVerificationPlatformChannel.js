"use strict";

import NativeReclaimInappModule from "./specs/NativeInappRnSdk.js";
import { ReclaimResult } from "./types/proof.js";
/**
 * This namespace provides types involved in initiating and managing the verification process
 * for proving claims about user data through various providers.
 */
export let ReclaimVerificationApi;
(function (_ReclaimVerificationApi) {
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
  let Overrides;
  (function (_Overrides) {
    ;
  })(Overrides || (Overrides = _ReclaimVerificationApi.Overrides || (_ReclaimVerificationApi.Overrides = {})));
  let ExceptionType = /*#__PURE__*/function (ExceptionType) {
    ExceptionType["Cancelled"] = "Cancelled";
    ExceptionType["Dismissed"] = "Dismissed";
    ExceptionType["SessionExpired"] = "SessionExpired";
    ExceptionType["Failed"] = "Failed";
    return ExceptionType;
  }({});
  _ReclaimVerificationApi.ExceptionType = ExceptionType;
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
      if (Object.hasOwn(error, 'userInfo')) {
        // From native, we send information about error in userInfo
        let unTypedError = error;
        let userInfo = unTypedError.userInfo;
        if (userInfo) {
          let type = ReclaimVerificationApi.ReclaimVerificationException.fromTypeName(unTypedError.userInfo.errorType);
          let maybeSessionId = unTypedError?.userInfo?.sessionId;
          return new ReclaimVerificationException(error.message, error, type, typeof maybeSessionId === 'string' && maybeSessionId ? maybeSessionId : sessionIdHint, unTypedError?.userInfo?.didSubmitManualVerification ?? false, unTypedError?.userInfo?.reason ?? "");
        }
      }
      return new ReclaimVerificationException(error.message, error, ReclaimVerificationApi.ExceptionType.Failed, sessionIdHint, false, "");
    }
  }
  _ReclaimVerificationApi.ReclaimVerificationException = ReclaimVerificationException;
})(ReclaimVerificationApi || (ReclaimVerificationApi = {}));
export class ReclaimVerificationPlatformChannel {
  async startVerification(request) {
    try {
      const response = await NativeReclaimInappModule.startVerification(request);
      return {
        ...response,
        proofs: ReclaimResult.asProofs(response.proofs)
      };
    } catch (error) {
      console.info({
        error
      });
      if (error instanceof Error) {
        throw ReclaimVerificationApi.ReclaimVerificationException.fromError(error, request.session?.sessionId ?? "");
      }
      throw error;
    }
  }
  async startVerificationFromUrl(requestUrl) {
    try {
      const response = await NativeReclaimInappModule.startVerificationFromUrl(requestUrl);
      return {
        ...response,
        proofs: ReclaimResult.asProofs(response.proofs)
      };
    } catch (error) {
      console.info({
        error
      });
      if (error instanceof Error) {
        throw ReclaimVerificationApi.ReclaimVerificationException.fromError(error, "");
      }
      throw error;
    }
  }
  async ping() {
    return await NativeReclaimInappModule.ping();
  }
  previousLogSubscription = null;
  previousSessionManagementCancelCallback = null;
  setOverrides({
    provider,
    featureOptions,
    logConsumer,
    sessionManagement,
    appInfo
  }) {
    this.previousLogSubscription?.remove();
    this.previousLogSubscription = null;
    let callback = this.previousSessionManagementCancelCallback;
    if (callback != null) {
      callback();
    }
    this.previousSessionManagementCancelCallback = null;
    let logConsumerRequest = logConsumer == null ? undefined : {
      enableLogHandler: logConsumer?.onLogs != null,
      canSdkCollectTelemetry: logConsumer?.canSdkCollectTelemetry,
      canSdkPrintLogs: logConsumer?.canSdkPrintLogs
    };
    const onLogsListener = logConsumer?.onLogs;
    if (onLogsListener != null) {
      const cancel = () => {
        this.previousLogSubscription?.remove();
        this.previousLogSubscription = null;
      };
      this.previousLogSubscription = NativeReclaimInappModule.onLogs(arg => {
        onLogsListener(arg, cancel);
      });
    }
    let sessionManagementRequest = sessionManagement == null ? undefined : {
      // A handler is provided, so we don't let SDK manage sessions
      enableSdkSessionManagement: false
    };
    if (sessionManagement != null) {
      let sessionCreateSubscription = NativeReclaimInappModule.onSessionCreateRequest(async event => {
        const replyId = event.replyId;
        let result = await sessionManagement.onSessionCreateRequest(event);
        NativeReclaimInappModule.reply(replyId, result);
      });
      let sessionUpdateSubscription = NativeReclaimInappModule.onSessionUpdateRequest(async event => {
        const replyId = event.replyId;
        let result = await sessionManagement.onSessionUpdateRequest(event);
        NativeReclaimInappModule.reply(replyId, result);
      });
      let sessionLogsSubscription = NativeReclaimInappModule.onSessionLogs(event => {
        sessionManagement.onLog(event);
      });
      const cancel = () => {
        sessionCreateSubscription.remove();
        sessionUpdateSubscription.remove();
        sessionLogsSubscription.remove();
      };
      this.previousSessionManagementCancelCallback = cancel;
    }
    NativeReclaimInappModule.setOverrides({
      provider,
      featureOptions,
      logConsumer: logConsumerRequest,
      sessionManagement: sessionManagementRequest,
      appInfo
    });
  }
}
//# sourceMappingURL=ReclaimVerificationPlatformChannel.js.map