"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReclaimVerification = exports.PlatformImpl = void 0;
var _NativeInappRnSdk = _interopRequireDefault(require("./specs/NativeInappRnSdk.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
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
        ReclaimVerification.defaultPlatform = new PlatformImpl();
      }
      this.platform = ReclaimVerification.defaultPlatform;
    }
  }
  async startVerification(request) {
    return this.platform.startVerification(request);
  }
  async startVerificationFromUrl(requestUrl) {
    return this.platform.startVerificationFromUrl(requestUrl);
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
exports.ReclaimVerification = ReclaimVerification;
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
    'constructor'(message, innerError, type, sessionId, didSubmitManualVerification, reason) {
      super(message);
      this.innerError = innerError;
      this.type = type;
      this.sessionId = sessionId;
      this.didSubmitManualVerification = didSubmitManualVerification;
      this.reason = reason;
    }
    static 'fromTypeName'(name) {
      switch (name) {
        case 'cancelled':
        case 'org.reclaimprotocol.inapp_sdk.ReclaimVerification.ReclaimVerificationException.Cancelled':
          return ExceptionType.Cancelled;
        case 'dismissed':
        case 'org.reclaimprotocol.inapp_sdk.ReclaimVerification.ReclaimVerificationException.Dismissed':
          return ExceptionType.Dismissed;
        case 'sessionExpired':
        case 'org.reclaimprotocol.inapp_sdk.ReclaimVerification.ReclaimVerificationException.SessionExpired':
          return ExceptionType.SessionExpired;
        case 'failed':
        case 'org.reclaimprotocol.inapp_sdk.ReclaimVerification.ReclaimVerificationException.Failed':
          return ExceptionType.Failed;
      }
      return ExceptionType.Failed;
    }
    static 'fromError'(error, sessionIdHint) {
      if ('userInfo' in error) {
        // From native, we send information about error in userInfo
        let userInfo = error.userInfo;
        if (userInfo) {
          let type = ReclaimVerification.ReclaimVerificationException.fromTypeName(userInfo.errorType);
          let maybeSessionId = userInfo?.sessionId;
          return new ReclaimVerificationException(error.message, error, type, typeof maybeSessionId === 'string' && maybeSessionId ? maybeSessionId : sessionIdHint, userInfo?.didSubmitManualVerification ?? false, userInfo?.reason ?? '');
        }
      }
      return new ReclaimVerificationException(error.message, error, ReclaimVerification.ExceptionType.Failed, sessionIdHint, false, '');
    }
    static 'isReclaimVerificationException'(error) {
      return error instanceof ReclaimVerificationException;
    }
  }
  _ReclaimVerification.ReclaimVerificationException = ReclaimVerificationException;
  class Platform {}
  _ReclaimVerification.Platform = Platform;
})(ReclaimVerification || (exports.ReclaimVerification = ReclaimVerification = {}));
class PlatformImpl extends ReclaimVerification.Platform {
  async startVerification(request) {
    try {
      const response = await _NativeInappRnSdk.default.startVerification(request);
      return {
        ...response,
        proofs: ReclaimVerification.ReclaimResult.asProofs(response.proofs)
      };
    } catch (error) {
      console.info({
        error
      });
      if (error instanceof Error) {
        throw ReclaimVerification.ReclaimVerificationException.fromError(error, request.session?.sessionId ?? '');
      }
      throw error;
    }
  }
  async startVerificationFromUrl(requestUrl) {
    try {
      const response = await _NativeInappRnSdk.default.startVerificationFromUrl(requestUrl);
      return {
        ...response,
        proofs: ReclaimVerification.ReclaimResult.asProofs(response.proofs)
      };
    } catch (error) {
      console.info({
        error
      });
      if (error instanceof Error) {
        throw ReclaimVerification.ReclaimVerificationException.fromError(error, '');
      }
      throw error;
    }
  }
  async ping() {
    return await _NativeInappRnSdk.default.ping();
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
      let providerRequestSubscription = _NativeInappRnSdk.default.onProviderInformationRequest(async event => {
        try {
          let result = await providerCallback(event);
          _NativeInappRnSdk.default.replyWithString(event.replyId, result);
        } catch (error) {
          console.error(error);
          _NativeInappRnSdk.default.replyWithString(event.replyId, '');
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
      this.previousLogSubscription = _NativeInappRnSdk.default.onLogs(arg => {
        onLogsListener(arg, cancel);
      });
    }
    let sessionManagementRequest = !sessionManagement ? undefined : {
      // A handler is provided, so we don't let SDK manage sessions
      enableSdkSessionManagement: false
    };
    if (sessionManagement) {
      this.disposeSessionManagement();
      let sessionCreateSubscription = _NativeInappRnSdk.default.onSessionCreateRequest(async event => {
        const replyId = event.replyId;
        try {
          let result = await sessionManagement.onSessionCreateRequest(event);
          _NativeInappRnSdk.default.replyWithString(replyId, result);
        } catch (error) {
          console.error(error);
          // Send an empty string to indicate failure
          _NativeInappRnSdk.default.replyWithString(replyId, '');
        }
      });
      let sessionUpdateSubscription = _NativeInappRnSdk.default.onSessionUpdateRequest(async event => {
        const replyId = event.replyId;
        try {
          let result = await sessionManagement.onSessionUpdateRequest(event);
          _NativeInappRnSdk.default.reply(replyId, result);
        } catch (error) {
          console.error(error);
          _NativeInappRnSdk.default.reply(replyId, false);
        }
      });
      let sessionLogsSubscription = _NativeInappRnSdk.default.onSessionLogs(event => {
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
      return await _NativeInappRnSdk.default.setOverrides({
        provider: providerOverride,
        featureOptions,
        logConsumer: logConsumerRequest,
        sessionManagement: sessionManagementRequest,
        appInfo,
        capabilityAccessToken
      });
    } catch (error) {
      throw new ReclaimVerification.ReclaimPlatformException('Failed to set overrides', error);
    }
  }
  async clearAllOverrides() {
    this.disposeProviderRequestListener();
    this.disposeLogListener();
    this.disposeSessionManagement();
    return _NativeInappRnSdk.default.clearAllOverrides();
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
        canUseAttestorAuthenticationRequest: canUseAttestorAuthenticationRequest,
        claimCreationType: options.claimCreationType ?? 'standalone',
        canAutoSubmit: options.canAutoSubmit ?? true,
        isCloseButtonVisible: options.isCloseButtonVisible ?? true
      };
      if (canUseAttestorAuthenticationRequest) {
        this.disposeAttestorAuthRequestListener();
        let attestorAuthRequestSubscription = _NativeInappRnSdk.default.onReclaimAttestorAuthRequest(async event => {
          let result = await options.fetchAttestorAuthenticationRequest(event.reclaimHttpProviderJsonString);
          _NativeInappRnSdk.default.replyWithString(event.replyId, result);
        });
        const cancel = () => {
          attestorAuthRequestSubscription.remove();
        };
        this.previousAttestorAuthRequestCancelCallback = cancel;
      }
    }
    try {
      return await _NativeInappRnSdk.default.setVerificationOptions({
        options: args
      });
    } catch (error) {
      throw new ReclaimVerification.ReclaimPlatformException('Failed to set verification options', error);
    }
  }
}
exports.PlatformImpl = PlatformImpl;
//# sourceMappingURL=index.js.map