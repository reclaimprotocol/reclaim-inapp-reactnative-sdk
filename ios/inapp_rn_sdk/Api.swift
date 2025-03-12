import ReclaimInAppSdk

@objc(Api) public class Api: NSObject {
  @objc public func ping() -> Bool {
    return true
  }
  
  @MainActor
  static fileprivate var replyHandlers: [String: (Result<Bool, any Error>) -> Void] = [:]
  
  static fileprivate func setReplyCallback(
    _ callback: @escaping (Result<Bool, any Error>) -> Void
  ) -> String {
    let replyId = UUID().uuidString
    Task { @MainActor in
      Api.replyHandlers[replyId] = callback
    }
    return replyId
  }
  
  @objc public func reply(replyId: String?, reply: Bool) {
    if let replyId {
      Task { @MainActor in
        let callback = Api.replyHandlers[replyId]
        if let callback = callback {
          Api.replyHandlers.removeValue(forKey: replyId)
          callback(.success(reply))
        } else {
          NSLog("[Api.reply] No callback found for replyId \(replyId)")
        }
      }
    } else {
      NSLog("[Api.reply] Missing arg replyId")
    }
  }
  
  @MainActor
  static fileprivate var replyWithStringHandler: [String: (Result<String, any Error>) -> Void] = [:]
  
  static fileprivate func setReplyWithStringCallback(
    _ callback: @escaping (Result<String, any Error>) -> Void
  ) -> String {
    let replyId = UUID().uuidString
    Task { @MainActor in
      Api.replyWithStringHandler[replyId] = callback
    }
    return replyId
  }
  
  @objc public func replyWithString(replyId: String?, value: String?) {
    if let replyId {
      Task { @MainActor in
        let callback = Api.replyWithStringHandler[replyId]
        if let callback = callback {
          Api.replyWithStringHandler.removeValue(forKey: replyId)
          callback(.success(value ?? ""))
        } else {
          NSLog("[Api.replyWithString] No callback found for replyId \(replyId)")
        }
      }
    } else {
      NSLog("[Api.replyWithString] Missing arg replyId")
    }
  }
  
  @objc public func startVerification(
    appId: String?,
    secret: String?,
    providerId: String,
    sessionTimestamp: String?,
    sessionSessionId: String?,
    sessionSignature: String?,
    context: String?,
    parameters: [String: String]?,
    autoSubmit: Bool,
    acceptAiProviders: Bool,
    webhookUrl: String?
  ) async throws -> [String: Any] {
    var session: ReclaimSessionInformation? = nil
    if let sessionTimestamp = sessionTimestamp, let sessionSessionId = sessionSessionId, let sessionSignature = sessionSignature {
      session = .init(
        timestamp: sessionTimestamp,
        sessionId: sessionSessionId,
        signature: sessionSignature
      )
    }
    let request: ReclaimVerification.Request = if let appId = appId, let secret = secret, !appId.isEmpty && !secret.isEmpty {
      .params(.init(
        appId: appId,
        secret: secret,
        providerId: providerId,
        session: session,
        context: context ?? "",
        parameters: parameters ?? [String:String](),
        autoSubmit: autoSubmit,
        acceptAiProviders: acceptAiProviders,
        webhookUrl: webhookUrl
      ))
    } else {
      .params(try .init(
        providerId: providerId,
        session: session,
        context: context ?? "",
        parameters: parameters ?? [String:String](),
        autoSubmit: autoSubmit,
        acceptAiProviders: acceptAiProviders,
        webhookUrl: webhookUrl
      ))
    }
    return try await startVerificationWithRequest(request)
  }
  
  @objc public func startVerificationFromUrl(
    url: String
  ) async throws -> [String: Any] {
    return try await startVerificationWithRequest(.url(url))
  }
  
  @objc public func setOverrides(
    provider: OverridenProviderInformation?,
    featureOptions: OverridenFeatureOptions?,
    logConsumer: OverridenLogConsumer?,
    sessionManagement: OverridenSessionManagement?,
    appInfo: OverridenReclaimAppInfo?,
    capabilityAccessToken: String?
  ) async throws {
    let providerOverrides: ReclaimOverrides.ProviderInformation? = if let url = provider?.url {
      .url(url: url)
    } else if let jsonString = provider?.jsonString {
      .jsonString(jsonString: jsonString)
    } else if let callback = provider?.callback {
      .callback(callbackHandler: callback)
    } else {
      nil
    }
    
    var featureOptionsOverrides: ReclaimOverrides.FeatureOptions? = if let featureOptions {
      .init(
        cookiePersist: featureOptions.cookiePersist?.boolValue,
        singleReclaimRequest: featureOptions.singleReclaimRequest?.boolValue,
        idleTimeThresholdForManualVerificationTrigger: featureOptions.idleTimeThresholdForManualVerificationTrigger?.int64Value,
        sessionTimeoutForManualVerificationTrigger: featureOptions.sessionTimeoutForManualVerificationTrigger?.int64Value,
        attestorBrowserRpcUrl: featureOptions.attestorBrowserRpcUrl,
        isResponseRedactionRegexEscapingEnabled: featureOptions.isResponseRedactionRegexEscapingEnabled?.boolValue,
        isAIFlowEnabled: featureOptions.isAIFlowEnabled?.boolValue
      )
    } else {
      nil
    }
    
    let logConsumerOverrides: ReclaimOverrides.LogConsumer? = if let logConsumer = logConsumer {
      .init(
        logHandler: logConsumer.logHandler,
        canSdkCollectTelemetry: logConsumer.canSdkCollectTelemetry,
        canSdkPrintLogs: logConsumer.canSdkPrintLogs?.boolValue
      )
    } else {
      nil
    }
    
    let sessionManagementOverrides: ReclaimOverrides.SessionManagement? = if let sessionManagement = sessionManagement {
      .init(handler: sessionManagement.handler)
    } else {
      nil
    }
    
    let appInfoOverrides: ReclaimOverrides.ReclaimAppInfo? = if let appInfo {
      .init(
        appName: appInfo.appName,
        appImageUrl: appInfo.appImageUrl,
        isRecurring: appInfo.isRecurring?.boolValue ?? false
      )
    } else {
      nil
    }
    
    return try await ReclaimVerification.setOverrides(
      provider: providerOverrides,
      featureOptions: featureOptionsOverrides,
      logConsumer: logConsumerOverrides,
      sessionManagement: sessionManagementOverrides,
      appInfo: appInfoOverrides,
      capabilityAccessToken: capabilityAccessToken
    )
  }
  
  @objc public func clearAllOverrides() async throws {
    return try await ReclaimVerification.clearAllOverrides()
  }
  
  @objc public func setVerificationOptions(
    options: ReclaimApiVerificationOptions?
  ) async throws {
    return try await ReclaimVerification.setVerificationOptions(options: options?.toSdkOptions())
  }
  
  func startVerificationWithRequest(_ request: ReclaimVerification.Request) async throws -> [String: Any] {
    NSLog("[Api] starting verification");
    return try await withCheckedThrowingContinuation { continuation in
      NSLog("[Api] starting verification going");
      Task { @MainActor in
        NSLog("[Api] starting verification doing");
        do {
          let result = try await ReclaimVerification.startVerification(request)
          let map: [String: Any] = [
            "sessionId": result.sessionId,
            "didSubmitManualVerification": result.didSubmitManualVerification,
            "proofs": result.proofs
          ]
          continuation.resume(returning: map)
        } catch {
          NSLog("[Api] failed verification \(error)");
          let apiError: ApiError = if (error is ReclaimVerificationError) {
            switch (error as! ReclaimVerificationError) {
            case .cancelled(sessionId: let sessionId, didSubmitManualVerification: let didSubmitManualVerification):
                .init(errorType: "cancelled", sessionId: sessionId, didSubmitManualVerification: didSubmitManualVerification, reason: nil)
            case .dismissed(sessionId: let sessionId, didSubmitManualVerification: let didSubmitManualVerification):
                .init(errorType: "dismissed", sessionId: sessionId, didSubmitManualVerification: didSubmitManualVerification, reason: nil)
            case .sessionExpired(sessionId: let sessionId, didSubmitManualVerification: let didSubmitManualVerification):
                .init(errorType: "sessionExpired", sessionId: sessionId, didSubmitManualVerification: didSubmitManualVerification, reason: nil)
            case .failed(sessionId: let sessionId, didSubmitManualVerification: let didSubmitManualVerification, reason: let reason):
                .init(errorType: "failed", sessionId: sessionId, didSubmitManualVerification: didSubmitManualVerification, reason: reason)
            }
          } else {
            ApiError(errorType: "failed", sessionId: request.maybeSessionId ?? "", didSubmitManualVerification: false, reason: "\(error)")
          }
          continuation.resume(throwing: apiError)
        }
      }
    }
  }
}

@objc(ApiError) public class ApiError: NSError, @unchecked Sendable {
  @objc public let errorType: String
  @objc public let sessionId: String?
  @objc public let didSubmitManualVerification: Bool
  @objc public let reason: String?
  
  public init(errorType: String, sessionId: String?, didSubmitManualVerification: Bool, reason: String?) {
    self.errorType = errorType
    self.sessionId = sessionId
    self.didSubmitManualVerification = didSubmitManualVerification
    self.reason = reason
    super.init(domain: "ApiError", code: 1, userInfo: [
      "errorType": errorType,
      "sessionId": sessionId ?? "",
      "didSubmitManualVerification": didSubmitManualVerification,
      "reason": reason ?? ""
    ])
  }
  
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
}

public typealias OverridenProviderCallback = (
  _ appId: String,
  _ providerId: String,
  _ sessionId: String,
  _ signature: String,
  _ timestamp: String,
  _ replyId: String
) -> Void

@objc(OverridenProviderCallbackHandler) public class OverridenProviderCallbackHandler: NSObject, ReclaimOverrides.ProviderInformation.CallbackHandler {
  @objc let _fetchProviderInformation: OverridenProviderCallback
  
  @objc public init(_fetchProviderInformation: @escaping OverridenProviderCallback) {
    self._fetchProviderInformation = _fetchProviderInformation
  }
  
  public func fetchProviderInformation(
    appId: String,
    providerId: String,
    sessionId: String,
    signature: String,
    timestamp: String,
    completion: @escaping (Result<String, any Error>) -> Void
  ) {
    let replyId = Api.setReplyWithStringCallback(completion)
    self._fetchProviderInformation(appId, providerId, sessionId, signature, timestamp, replyId)
  }
}

@objc(OverridenProviderInformation) public class OverridenProviderInformation: NSObject {
  @objc public var url: String?
  @objc public var jsonString: String?
  @objc public var callback: OverridenProviderCallbackHandler?
  
  @objc public init(
    url: String? = nil,
    jsonString: String? = nil,
    callback: OverridenProviderCallbackHandler? = nil
  ) {
    self.url = url
    self.jsonString = jsonString
    self.callback = callback
  }
}

@objc(OverridenFeatureOptions) public class OverridenFeatureOptions: NSObject {
  // bool
  @objc public var cookiePersist: NSNumber?
  // bool
  @objc   public var singleReclaimRequest: NSNumber?
  // int64 (long)
  @objc  public var idleTimeThresholdForManualVerificationTrigger: NSNumber?
  // int64 (long)
  @objc  public var sessionTimeoutForManualVerificationTrigger: NSNumber?
  @objc  public var attestorBrowserRpcUrl: String?
  // bool
  @objc  public var isResponseRedactionRegexEscapingEnabled: NSNumber?
  // bool
  @objc  public var isAIFlowEnabled: NSNumber?
  
  @objc public init(
    cookiePersist: NSNumber? = nil,
    singleReclaimRequest: NSNumber? = nil,
    idleTimeThresholdForManualVerificationTrigger: NSNumber? = nil,
    sessionTimeoutForManualVerificationTrigger: NSNumber? = nil,
    attestorBrowserRpcUrl: String? = nil,
    isResponseRedactionRegexEscapingEnabled: NSNumber? = nil,
    isAIFlowEnabled: NSNumber? = nil
  ) {
    self.cookiePersist = cookiePersist
    self.singleReclaimRequest = singleReclaimRequest
    self.idleTimeThresholdForManualVerificationTrigger = idleTimeThresholdForManualVerificationTrigger
    self.sessionTimeoutForManualVerificationTrigger = sessionTimeoutForManualVerificationTrigger
    self.attestorBrowserRpcUrl = attestorBrowserRpcUrl
    self.isResponseRedactionRegexEscapingEnabled = isResponseRedactionRegexEscapingEnabled
    self.isAIFlowEnabled = isAIFlowEnabled
  }
}

@objc(OverridenReclaimAppInfo) public class OverridenReclaimAppInfo: NSObject {
  @objc public let appName: String
  @objc public let appImageUrl: String
  @objc public let isRecurring: NSNumber?
  
  @objc public init(
    appName: String,
    appImageUrl: String,
    isRecurring: NSNumber?
  ) {
    self.appName = appName
    self.appImageUrl = appImageUrl
    self.isRecurring = isRecurring
  }
}

@objc(OverridenLogConsumer) public class OverridenLogConsumer: NSObject {
  /**
   * Handler for consuming logs exported from the SDK.
   */
  @objc public let logHandler: OverridenLogHandler?
  /**
   * When enabled, logs are sent to reclaim that can be used to help you.
   * Defaults to true.
   */
  @objc public let canSdkCollectTelemetry: Bool
  /**
   * Defaults to enabled when not in release mode.
   * Type: Bool.
   */
  @objc public let canSdkPrintLogs: NSNumber?
  
  @objc public init(
    logHandler: OverridenLogHandler? = nil,
    canSdkCollectTelemetry: Bool = true,
    canSdkPrintLogs: NSNumber? = nil
  ) {
    self.logHandler = logHandler
    self.canSdkCollectTelemetry = canSdkCollectTelemetry
    self.canSdkPrintLogs = canSdkPrintLogs
  }
}

@objc(OverridenLogHandler) public class OverridenLogHandler: NSObject, ReclaimOverrides.LogConsumer.LogHandler {
  @objc let _onLogs: (String) -> Void
  
  @objc public init(onLogs: @escaping (String) -> Void) {
    self._onLogs = onLogs
  }
  
  @objc public func onLogs(logJsonString: String) {
    self._onLogs(logJsonString)
  }
}

public typealias OverridenCreateSessionCallback = (
  _ appId: String,
  _ providerId: String,
  _ sessionId: String,
  _ replyId: String
) -> Void
public typealias OverridenUpdateSessionCallback = (
  _ sessionId: String,
  /// `ReclaimOverrides.SessionManament.SessionStatus` enum
  _ status: String,
  _ replyId: String
) -> Void
public typealias OverridenLogSessionCallback = (
  _ appId: String,
  _ providerId: String,
  _ sessionId: String,
  _ logType: String
) -> Void

@objc(OverridenSessionManagement) public class OverridenSessionManagement: NSObject {
  @objc public let handler: OverridenSessionHandler
  
  @objc public init(handler: OverridenSessionHandler) {
    self.handler = handler
  }
  
  @objc(OverridenSessionHandler) public class OverridenSessionHandler: NSObject, ReclaimOverrides.SessionManagement.SessionHandler {
    
    @objc let _createSession: OverridenCreateSessionCallback
    @objc let _updateSession: OverridenUpdateSessionCallback
    @objc let _logSession: OverridenLogSessionCallback
    
    @objc public init(
      _createSession: @escaping OverridenCreateSessionCallback,
      _updateSession: @escaping OverridenUpdateSessionCallback,
      _logSession: @escaping OverridenLogSessionCallback
    ) {
      self._createSession = _createSession
      self._updateSession = _updateSession
      self._logSession = _logSession
    }
    
    public func createSession(
      appId: String, providerId: String, sessionId: String, completion: @escaping (Result<Bool, any Error>) -> Void
    ) {
      let replyId = Api.setReplyCallback(completion)
      self._createSession(appId, providerId, sessionId, replyId)
    }
    
    public func updateSession(
      sessionId: String, status: ReclaimInAppSdk.ReclaimOverrides.SessionManagement.SessionStatus, completion: @escaping (Result<Bool, any Error>) -> Void
    ) {
      let statusString = switch (status) {
      case .USER_STARTED_VERIFICATION:
        "USER_STARTED_VERIFICATION"
      case .USER_INIT_VERIFICATION:
        "USER_INIT_VERIFICATION"
      case .PROOF_GENERATION_STARTED:
        "PROOF_GENERATION_STARTED"
      case .PROOF_GENERATION_RETRY:
        "PROOF_GENERATION_RETRY"
      case .PROOF_GENERATION_SUCCESS:
        "PROOF_GENERATION_SUCCESS"
      case .PROOF_GENERATION_FAILED:
        "PROOF_GENERATION_FAILED"
      case .PROOF_SUBMITTED:
        "PROOF_SUBMITTED"
      case .PROOF_SUBMISSION_FAILED:
        "PROOF_SUBMISSION_FAILED"
      case .PROOF_MANUAL_VERIFICATION_SUBMITTED:
        "PROOF_MANUAL_VERIFICATION_SUBMITTED"
      }
      let replyId = Api.setReplyCallback(completion)
      self._updateSession(sessionId, statusString, replyId)
    }
    
    public func logSession(
      appId: String,
      providerId: String,
      sessionId: String,
      logType: String
    ) {
      self._logSession(appId, providerId, sessionId, logType)
    }
  }
}

public typealias ReclaimVerificationOptionFetchAttestorAuthRequestHandler = (
  _ reclaimHttpProviderJsonString: String,
  _ replyId: String
) -> Void

@objc(ReclaimApiVerificationOptions) public class ReclaimApiVerificationOptions: NSObject {
  public let canDeleteCookiesBeforeVerificationStarts: Bool
  public let attestorAuthRequestProvider: ReclaimVerification.VerificationOptions.AttestorAuthRequestProvider?
  
  @objc public init(
    canDeleteCookiesBeforeVerificationStarts: Bool,
    fetchAttestorAuthenticationRequest: ReclaimVerificationOptionFetchAttestorAuthRequestHandler?
  ) {
    self.canDeleteCookiesBeforeVerificationStarts = canDeleteCookiesBeforeVerificationStarts
    if let fetchAttestorAuthenticationRequest {
      self.attestorAuthRequestProvider = _AttestorAuthRequestProvider(
        fetchAttestorAuthenticationRequest: fetchAttestorAuthenticationRequest
      )
    } else {
      self.attestorAuthRequestProvider = nil
    }
  }
  
  func toSdkOptions() -> ReclaimVerification.VerificationOptions {
    return .init(
      canDeleteCookiesBeforeVerificationStarts: canDeleteCookiesBeforeVerificationStarts,
      attestorAuthRequestProvider: attestorAuthRequestProvider
    )
  }
  
  class _AttestorAuthRequestProvider: ReclaimVerification.VerificationOptions.AttestorAuthRequestProvider {
    let fetchAttestorAuthenticationRequest: ReclaimVerificationOptionFetchAttestorAuthRequestHandler
    
    init(fetchAttestorAuthenticationRequest: @escaping ReclaimVerificationOptionFetchAttestorAuthRequestHandler) {
      self.fetchAttestorAuthenticationRequest = fetchAttestorAuthenticationRequest
    }
    
    func fetchAttestorAuthenticationRequest(reclaimHttpProvider: [AnyHashable? : (any Sendable)?], completion: @escaping (Result<String, any Error>) -> Void) {
      let replyId = Api.setReplyWithStringCallback(completion)
      let reclaimHttpProviderJsonString = JSONUtility.toString(reclaimHttpProvider)
      fetchAttestorAuthenticationRequest(reclaimHttpProviderJsonString, replyId)
    }
  }
}
