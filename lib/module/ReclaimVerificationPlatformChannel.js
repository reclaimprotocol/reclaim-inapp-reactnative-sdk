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
  _ReclaimVerificationApi.ReclaimPlatformException = ReclaimPlatformException;
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
          let type = ReclaimVerificationApi.ReclaimVerificationException.fromTypeName(userInfo.errorType);
          let maybeSessionId = userInfo?.sessionId;
          return new ReclaimVerificationException(error.message, error, type, typeof maybeSessionId === 'string' && maybeSessionId ? maybeSessionId : sessionIdHint, userInfo?.didSubmitManualVerification ?? false, userInfo?.reason ?? "");
        }
      }
      return new ReclaimVerificationException(error.message, error, ReclaimVerificationApi.ExceptionType.Failed, sessionIdHint, false, "");
    }
    static isReclaimVerificationException(error) {
      return error instanceof ReclaimVerificationException;
    }
  }
  _ReclaimVerificationApi.ReclaimVerificationException = ReclaimVerificationException;
})(ReclaimVerificationApi || (ReclaimVerificationApi = {}));
export class ReclaimVerificationPlatformChannel {}
export class ReclaimVerificationPlatformChannelImpl extends ReclaimVerificationPlatformChannel {
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
  previousSessionManagementCancelCallback = null;
  disposeSessionManagement() {
    let callback = this.previousSessionManagementCancelCallback;
    if (callback != null && callback != undefined) {
      callback();
    }
    this.previousSessionManagementCancelCallback = null;
  }
  previousLogSubscription = null;
  disposeLogListener() {
    this.previousLogSubscription?.remove();
    this.previousLogSubscription = null;
  }
  previousProviderRequestCancelCallback = null;
  disposeProviderRequestListener() {
    let callback = this.previousProviderRequestCancelCallback;
    if (callback != null && callback != undefined) {
      callback();
    }
    this.previousProviderRequestCancelCallback = null;
  }
  async setOverrides({
    provider,
    featureOptions,
    logConsumer,
    sessionManagement,
    appInfo,
    capabilityAccessToken
  }) {
    let providerCallback = provider?.callback;
    let providerOverride = !provider ? null : {
      url: provider?.url,
      jsonString: provider?.jsonString,
      canFetchProviderInformationFromHost: !!providerCallback
    };
    if (providerCallback) {
      this.disposeProviderRequestListener();
      let providerRequestSubscription = NativeReclaimInappModule.onProviderInformationRequest(async event => {
        try {
          let result = await providerCallback(event);
          NativeReclaimInappModule.replyWithString(event.replyId, result);
        } catch (error) {
          console.error(error);
          NativeReclaimInappModule.replyWithString(event.replyId, "");
        }
      });
      const cancel = () => {
        providerRequestSubscription.remove();
      };
      this.previousProviderRequestCancelCallback = cancel;
    }
    const onLogsListener = logConsumer?.onLogs;
    let logConsumerRequest = !logConsumer ? undefined : {
      enableLogHandler: !!onLogsListener,
      canSdkCollectTelemetry: logConsumer?.canSdkCollectTelemetry,
      canSdkPrintLogs: logConsumer?.canSdkPrintLogs
    };
    if (onLogsListener) {
      this.disposeLogListener();
      const cancel = () => {
        this.previousLogSubscription?.remove();
        this.previousLogSubscription = null;
      };
      this.previousLogSubscription = NativeReclaimInappModule.onLogs(arg => {
        onLogsListener(arg, cancel);
      });
    }
    let sessionManagementRequest = !sessionManagement ? undefined : {
      // A handler is provided, so we don't let SDK manage sessions
      enableSdkSessionManagement: false
    };
    if (sessionManagement) {
      this.disposeSessionManagement();
      let sessionCreateSubscription = NativeReclaimInappModule.onSessionCreateRequest(async event => {
        const replyId = event.replyId;
        try {
          let result = await sessionManagement.onSessionCreateRequest(event);
          NativeReclaimInappModule.reply(replyId, result);
        } catch (error) {
          console.error(error);
          NativeReclaimInappModule.reply(replyId, false);
        }
      });
      let sessionUpdateSubscription = NativeReclaimInappModule.onSessionUpdateRequest(async event => {
        const replyId = event.replyId;
        try {
          let result = await sessionManagement.onSessionUpdateRequest(event);
          NativeReclaimInappModule.reply(replyId, result);
        } catch (error) {
          console.error(error);
          NativeReclaimInappModule.reply(replyId, false);
        }
      });
      let sessionLogsSubscription = NativeReclaimInappModule.onSessionLogs(event => {
        try {
          sessionManagement.onLog(event);
        } catch (error) {
          console.error(error);
        }
      });
      const cancel = () => {
        sessionCreateSubscription.remove();
        sessionUpdateSubscription.remove();
        sessionLogsSubscription.remove();
      };
      this.previousSessionManagementCancelCallback = cancel;
    }
    try {
      return await NativeReclaimInappModule.setOverrides({
        provider: providerOverride,
        featureOptions,
        logConsumer: logConsumerRequest,
        sessionManagement: sessionManagementRequest,
        appInfo,
        capabilityAccessToken
      });
    } catch (error) {
      throw new ReclaimVerificationApi.ReclaimPlatformException("Failed to set overrides", error);
    }
  }
  async clearAllOverrides() {
    this.disposeProviderRequestListener();
    this.disposeLogListener();
    this.disposeSessionManagement();
    return NativeReclaimInappModule.clearAllOverrides();
  }
  previousAttestorAuthRequestCancelCallback = null;
  disposeAttestorAuthRequestListener() {
    let callback = this.previousAttestorAuthRequestCancelCallback;
    if (callback != null && callback != undefined) {
      callback();
    }
    this.previousAttestorAuthRequestCancelCallback = null;
  }
  async setVerificationOptions(options) {
    let args = null;
    if (options) {
      let canUseAttestorAuthenticationRequest = options.fetchAttestorAuthenticationRequest != null;
      args = {
        canDeleteCookiesBeforeVerificationStarts: options.canDeleteCookiesBeforeVerificationStarts,
        canUseAttestorAuthenticationRequest: canUseAttestorAuthenticationRequest
      };
      if (canUseAttestorAuthenticationRequest) {
        this.disposeAttestorAuthRequestListener();
        let attestorAuthRequestSubscription = NativeReclaimInappModule.onReclaimAttestorAuthRequest(async event => {
          let result = await options.fetchAttestorAuthenticationRequest(event.reclaimHttpProviderJsonString);
          NativeReclaimInappModule.replyWithString(event.replyId, result);
        });
        const cancel = () => {
          attestorAuthRequestSubscription.remove();
        };
        this.previousAttestorAuthRequestCancelCallback = cancel;
      }
    }
    try {
      return await NativeReclaimInappModule.setVerificationOptions({
        options: args
      });
    } catch (error) {
      throw new ReclaimVerificationApi.ReclaimPlatformException("Failed to set verification options", error);
    }
  }
}
//# sourceMappingURL=ReclaimVerificationPlatformChannel.js.map