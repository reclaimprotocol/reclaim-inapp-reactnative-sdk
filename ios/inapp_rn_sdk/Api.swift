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
          NSLog(
            "[Api.replyWithString] No callback found for replyId \(replyId)"
          )
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
    providerVersion: [String: String]?
  ) async throws -> [String: Any] {
    var session: ReclaimSessionInformation? = nil
    if let sessionTimestamp = sessionTimestamp,
      let sessionSessionId = sessionSessionId,
      let sessionSignature = sessionSignature
    {
      session = .init(
        timestamp: sessionTimestamp,
        sessionId: sessionSessionId,
        signature: sessionSignature
      )
    }
    let providerVersion = ReclaimVerification.Request.Params.ProviderVersion(
      exactVersion: providerVersion?["resolvedVersion"] ?? "",
      versionExpression: providerVersion?["versionExpression"]
        ?? providerVersion?["resolvedVersion"] ?? ""
    )
    var request: ReclaimVerification.Request? = nil
    if let appId = appId, let secret = secret,
      !appId.isEmpty && !secret.isEmpty
    {
      request = .params(
        .init(
          appId: appId,
          secret: secret,
          providerId: providerId,
          session: session,
          context: context ?? "",
          parameters: parameters ?? [String: String](),
          providerVersion: providerVersion
        )
      )
    } else {
      request = .params(
        try .init(
          providerId: providerId,
          session: session,
          context: context ?? "",
          parameters: parameters ?? [String: String](),
          providerVersion: providerVersion
        )
      )
    }
    return try await startVerificationWithRequest(request!)
  }

  @objc public func startVerificationFromUrl(
    url: String
  ) async throws -> [String: Any] {
    return try await startVerificationWithRequest(.url(url))
  }
  
  @objc public func startVerificationFromJson(
    template: String
  ) async throws -> [String: Any] {
    return try await startVerificationWithRequest(.json(JSONUtility.fromString(template) as? [AnyHashable?: Sendable?] ?? [:]))
  }
  
  @objc public func setOverrides(
    provider: OverridenProviderInformation?,
    featureOptions: OverridenFeatureOptions?,
    logConsumer: OverridenLogConsumer?,
    sessionManagement: OverridenSessionManagement?,
    appInfo: OverridenReclaimAppInfo?,
    capabilityAccessToken: String?
  ) async throws {
    var providerOverrides: ReclaimOverrides.ProviderInformation? = nil
    if let url = provider?.url {
      providerOverrides = .url(url: url)
    } else if let jsonString = provider?.jsonString {
      providerOverrides = .jsonString(jsonString: jsonString)
    } else if let callback = provider?.callback {
      providerOverrides = .callback(callbackHandler: callback)
    } else {
      providerOverrides = nil
    }

    var featureOptionsOverrides: ReclaimOverrides.FeatureOptions? = nil
    if let featureOptions {
      featureOptionsOverrides = .init(
        cookiePersist: featureOptions.cookiePersist?.boolValue,
        singleReclaimRequest: featureOptions.singleReclaimRequest?.boolValue,
        idleTimeThresholdForManualVerificationTrigger: featureOptions
          .idleTimeThresholdForManualVerificationTrigger?.int64Value,
        sessionTimeoutForManualVerificationTrigger: featureOptions
          .sessionTimeoutForManualVerificationTrigger?.int64Value,
        attestorBrowserRpcUrl: featureOptions.attestorBrowserRpcUrl,
        isAIFlowEnabled: featureOptions.isAIFlowEnabled?.boolValue,
        manualReviewMessage: featureOptions.manualReviewMessage,
        loginPromptMessage: featureOptions.loginPromptMessage,
        useTEE: featureOptions.useTEE?.boolValue,
        interceptorOptions: featureOptions.interceptorOptions,
        claimCreationTimeoutDurationInMins: featureOptions.claimCreationTimeoutDurationInMins?.int64Value,
        sessionNoActivityTimeoutDurationInMins: featureOptions.sessionNoActivityTimeoutDurationInMins?.int64Value,
        aiProviderNoActivityTimeoutDurationInSecs: featureOptions.aiProviderNoActivityTimeoutDurationInSecs?.int64Value,
        pageLoadedCompletedDebounceTimeoutMs: featureOptions.pageLoadedCompletedDebounceTimeoutMs?.int64Value,
        potentialLoginTimeoutS: featureOptions.potentialLoginTimeoutS?.int64Value,
        screenshotCaptureIntervalSeconds: featureOptions.screenshotCaptureIntervalSeconds?.int64Value,
        teeUrls: featureOptions.teeUrls
      )
    } else {
      featureOptionsOverrides = nil
    }

    var logConsumerOverrides: ReclaimOverrides.LogConsumer? = nil
    if let logConsumer = logConsumer {
      logConsumerOverrides = .init(
        logHandler: logConsumer.logHandler,
        canSdkCollectTelemetry: logConsumer.canSdkCollectTelemetry,
        canSdkPrintLogs: logConsumer.canSdkPrintLogs?.boolValue
      )
    } else {
      logConsumerOverrides = nil
    }

    var sessionManagementOverrides: ReclaimOverrides.SessionManagement? = nil
    if let sessionManagement = sessionManagement {
      sessionManagementOverrides = .init(handler: sessionManagement.handler)
    } else {
      sessionManagementOverrides = nil
    }

    var appInfoOverrides: ReclaimOverrides.ReclaimAppInfo? = nil
    if let appInfo {
      appInfoOverrides = .init(
        appName: appInfo.appName,
        appImageUrl: appInfo.appImageUrl,
        isRecurring: appInfo.isRecurring?.boolValue ?? false
      )
    } else {
      appInfoOverrides = nil
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
    return try await ReclaimVerification.setVerificationOptions(
      options: options?.toSdkOptions()
    )
  }
  
  @objc public func startSessionIdentityEventListener(listener: OverridenSessionIdentityUpdateHandler) async throws {
    return try await ReclaimVerification.setOverrides(
      provider: nil,
      featureOptions: nil,
      logConsumer: nil,
      sessionManagement: nil,
      appInfo: nil,
      sessionIdentityUpdateHandler: listener,
      capabilityAccessToken: nil,
    )
  }
  
  @objc public func setConsoleLogging(enabled: Bool) async throws {
    return try await ReclaimVerification.setConsoleLogging(enabled: enabled)
  }

  func startVerificationWithRequest(_ request: ReclaimVerification.Request)
    async throws -> [String: Any]
  {
    NSLog("[Api] starting verification")
    return try await withCheckedThrowingContinuation { continuation in
      NSLog("[Api] starting verification going")
      Task { @MainActor in
        NSLog("[Api] starting verification doing")
        do {
          let result = try await ReclaimVerification.startVerification(request)
          let map: [String: Any] = [
            "sessionId": result.sessionId,
            "didSubmitManualVerification": result.didSubmitManualVerification,
            "proofs": result.proofs,
          ]
          continuation.resume(returning: map)
        } catch {
          NSLog("[Api] failed verification \(error)")
          var apiError: ApiError? = nil
          if error is ReclaimVerificationError {
            switch error as! ReclaimVerificationError {
            case .cancelled(let sessionId, let didSubmitManualVerification):
              apiError = .init(
                errorType: "cancelled",
                sessionId: sessionId,
                didSubmitManualVerification: didSubmitManualVerification,
                reason: nil
              )
            case .dismissed(let sessionId, let didSubmitManualVerification):
              apiError = .init(
                errorType: "dismissed",
                sessionId: sessionId,
                didSubmitManualVerification: didSubmitManualVerification,
                reason: nil
              )
            case .sessionExpired(
              let sessionId,
              let didSubmitManualVerification
            ):
              apiError = .init(
                errorType: "sessionExpired",
                sessionId: sessionId,
                didSubmitManualVerification: didSubmitManualVerification,
                reason: nil
              )
            case .failed(
              let sessionId,
              let didSubmitManualVerification,
              let reason
            ):
              apiError = .init(
                errorType: "failed",
                sessionId: sessionId,
                didSubmitManualVerification: didSubmitManualVerification,
                reason: reason
              )
            }
          } else {
            apiError = ApiError(
              errorType: "failed",
              sessionId: request.maybeSessionId ?? "",
              didSubmitManualVerification: false,
              reason: "\(error)"
            )
          }
          continuation.resume(throwing: apiError!)
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

  public init(
    errorType: String,
    sessionId: String?,
    didSubmitManualVerification: Bool,
    reason: String?
  ) {
    self.errorType = errorType
    self.sessionId = sessionId
    self.didSubmitManualVerification = didSubmitManualVerification
    self.reason = reason
    super.init(
      domain: "ApiError",
      code: 1,
      userInfo: [
        "errorType": errorType,
        "sessionId": sessionId ?? "",
        "didSubmitManualVerification": didSubmitManualVerification,
        "reason": reason ?? "",
      ]
    )
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
  _ resolvedVersion: String,
  _ replyId: String
) -> Void

@objc(OverridenProviderCallbackHandler)
public class OverridenProviderCallbackHandler: NSObject, ReclaimOverrides
    .ProviderInformation.CallbackHandler
{
  @objc let _fetchProviderInformation: OverridenProviderCallback

  @objc public init(
    _fetchProviderInformation: @escaping OverridenProviderCallback
  ) {
    self._fetchProviderInformation = _fetchProviderInformation
  }

  public func fetchProviderInformation(
    appId: String,
    providerId: String,
    sessionId: String,
    signature: String,
    timestamp: String,
    resolvedVersion: String,
    completion: @escaping (Result<String, any Error>) -> Void
  ) {
    let replyId = Api.setReplyWithStringCallback(completion)
    self._fetchProviderInformation(
      appId,
      providerId,
      sessionId,
      signature,
      timestamp,
      resolvedVersion,
      replyId
    )
  }
}

@objc(OverridenProviderInformation)
public class OverridenProviderInformation: NSObject {
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
  @objc public var singleReclaimRequest: NSNumber?
  // int64 (long)
  @objc public var idleTimeThresholdForManualVerificationTrigger: NSNumber?
  // int64 (long)
  @objc public var sessionTimeoutForManualVerificationTrigger: NSNumber?
  @objc public var attestorBrowserRpcUrl: String?
  // bool
  @objc public var isAIFlowEnabled: NSNumber?
  @objc public var manualReviewMessage: String?
  @objc public var loginPromptMessage: String?
  // bool
  @objc public var useTEE: NSNumber?
  @objc public var interceptorOptions: String?
  // int64 (long)
  @objc public var claimCreationTimeoutDurationInMins: NSNumber?
  // int64 (long)
  @objc public var sessionNoActivityTimeoutDurationInMins: NSNumber?
  // int64 (long)
  @objc public var aiProviderNoActivityTimeoutDurationInSecs: NSNumber?
  // int64 (long)
  @objc public var pageLoadedCompletedDebounceTimeoutMs: NSNumber?
  // int64 (long)
  @objc public var potentialLoginTimeoutS: NSNumber?
  // int64 (long)
  @objc public var screenshotCaptureIntervalSeconds: NSNumber?
  @objc public var teeUrls: String?

  @objc public init(
    cookiePersist: NSNumber? = nil,
    singleReclaimRequest: NSNumber? = nil,
    idleTimeThresholdForManualVerificationTrigger: NSNumber? = nil,
    sessionTimeoutForManualVerificationTrigger: NSNumber? = nil,
    attestorBrowserRpcUrl: String? = nil,
    isAIFlowEnabled: NSNumber? = nil,
    manualReviewMessage: String? = nil,
    loginPromptMessage: String? = nil,
    useTEE: NSNumber? = nil,
    interceptorOptions: String? = nil,
    claimCreationTimeoutDurationInMins: NSNumber? = nil,
    sessionNoActivityTimeoutDurationInMins: NSNumber? = nil,
    aiProviderNoActivityTimeoutDurationInSecs: NSNumber? = nil,
    pageLoadedCompletedDebounceTimeoutMs: NSNumber? = nil,
    potentialLoginTimeoutS: NSNumber? = nil,
    screenshotCaptureIntervalSeconds: NSNumber? = nil,
    teeUrls: String? = nil
  ) {
    self.cookiePersist = cookiePersist
    self.singleReclaimRequest = singleReclaimRequest
    self.idleTimeThresholdForManualVerificationTrigger =
      idleTimeThresholdForManualVerificationTrigger
    self.sessionTimeoutForManualVerificationTrigger =
      sessionTimeoutForManualVerificationTrigger
    self.attestorBrowserRpcUrl = attestorBrowserRpcUrl
    self.isAIFlowEnabled = isAIFlowEnabled
    self.manualReviewMessage = manualReviewMessage
    self.loginPromptMessage = loginPromptMessage
    self.useTEE = useTEE
    self.interceptorOptions = interceptorOptions
    self.claimCreationTimeoutDurationInMins = claimCreationTimeoutDurationInMins
    self.sessionNoActivityTimeoutDurationInMins = sessionNoActivityTimeoutDurationInMins
    self.aiProviderNoActivityTimeoutDurationInSecs = aiProviderNoActivityTimeoutDurationInSecs
    self.pageLoadedCompletedDebounceTimeoutMs = pageLoadedCompletedDebounceTimeoutMs
    self.potentialLoginTimeoutS = potentialLoginTimeoutS
    self.screenshotCaptureIntervalSeconds = screenshotCaptureIntervalSeconds
    self.teeUrls = teeUrls
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

@objc(OverridenLogHandler)
public class OverridenLogHandler: NSObject, ReclaimOverrides.LogConsumer
    .LogHandler
{
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
  _ timestamp: String,
  _ signature: String,
  _ providerVersion: String,
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

@objc(OverridenSessionManagement)
public class OverridenSessionManagement: NSObject {
  @objc public let handler: OverridenSessionHandler

  @objc public init(handler: OverridenSessionHandler) {
    self.handler = handler
  }

  @objc(OverridenSessionHandler)
  public class OverridenSessionHandler: NSObject, ReclaimOverrides
      .SessionManagement.SessionHandler
  {
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
      appId: String,
      providerId: String,
      timestamp: String,
      signature: String,
      providerVersion: String,
      completion: @escaping (
        Result<
          ReclaimInAppSdk.ReclaimOverrides.SessionManagement.InitResponse,
          any Error
        >
      ) -> Void
    ) {
      let replyId = Api.setReplyWithStringCallback({ value in
        func process(value: String) {
          let data = JSONUtility.fromString(value)
          if let data = data as? [AnyHashable?: Any?] {
            completion(
              .success(
                ReclaimOverrides.SessionManagement.InitResponse(
                  sessionId: data["sessionId"] as? String ?? "",
                  resolvedProviderVersion: data["resolvedProviderVersion"]
                    as? String ?? ""
                )
              )
            )
          } else {
            print(
              "Error parsing session init response as Map. Type was: \(type(of: data)), data was: \(String(describing: data))"
            )
            completion(
              .success(
                ReclaimOverrides.SessionManagement.InitResponse(
                  sessionId: "-",
                  resolvedProviderVersion: ""
                )
              )
            )
          }
        }
      })
      self._createSession(
        appId,
        providerId,
        timestamp,
        signature,
        providerVersion,
        replyId
      )
    }

    public func updateSession(
      sessionId: String,
      status: ReclaimInAppSdk.ReclaimOverrides.SessionManagement.SessionStatus,
      metadata: [String : (any Sendable)?]?,
      completion: @escaping (Result<Bool, any Error>) -> Void
    ) {
      var statusString: String? = nil
      switch status {
      case .USER_STARTED_VERIFICATION:
        statusString = "USER_STARTED_VERIFICATION"
      case .USER_INIT_VERIFICATION:
        statusString = "USER_INIT_VERIFICATION"
      case .PROOF_GENERATION_STARTED:
        statusString = "PROOF_GENERATION_STARTED"
      case .PROOF_GENERATION_RETRY:
        statusString = "PROOF_GENERATION_RETRY"
      case .PROOF_GENERATION_SUCCESS:
        statusString = "PROOF_GENERATION_SUCCESS"
      case .PROOF_GENERATION_FAILED:
        statusString = "PROOF_GENERATION_FAILED"
      case .PROOF_SUBMITTED:
        statusString = "PROOF_SUBMITTED"
      case .PROOF_SUBMISSION_FAILED:
        statusString = "PROOF_SUBMISSION_FAILED"
      case .PROOF_MANUAL_VERIFICATION_SUBMITTED:
        statusString = "PROOF_MANUAL_VERIFICATION_SUBMITTED"
      case .AI_PROOF_SUBMITTED:
        statusString = "AI_PROOF_SUBMITTED"
      }
      let replyId = Api.setReplyCallback(completion)
      self._updateSession(sessionId, statusString!, replyId)
    }

    public func logSession(
      appId: String,
      providerId: String,
      sessionId: String,
      logType: String,
      metadata: [String: (any Sendable)?]?
    ) {
      self._logSession(appId, providerId, sessionId, logType)
    }
  }
}

public typealias OverridenOnSessionIdentityUpdateCallback = (
  _ appId: String?,
  _ providerId: String?,
  _ sessionId: String?
) -> Void

@objc(OverridenSessionIdentityUpdateHandler)
public class OverridenSessionIdentityUpdateHandler: NSObject, ReclaimOverrides
  .SessionIdentityUpdateHandler {
    @objc public let handler: OverridenOnSessionIdentityUpdateCallback
    
    @objc public init(handler: @escaping OverridenOnSessionIdentityUpdateCallback) {
      self.handler = handler
    }

    public func onSessionIdentityUpdate(identity: ReclaimInAppSdk.ReclaimVerification.ReclaimSessionIdentity?) {
      handler(
        identity?.appId,
        identity?.providerId,
        identity?.sessionId
      )
    }
}

public typealias ReclaimVerificationOptionFetchAttestorAuthRequestHandler = (
  _ reclaimHttpProviderJsonString: String,
  _ replyId: String
) -> Void

@objc(ReclaimApiVerificationOptions)
public class ReclaimApiVerificationOptions: NSObject {
  public let canDeleteCookiesBeforeVerificationStarts: Bool
  public let attestorAuthRequestProvider:
    ReclaimVerification.VerificationOptions.AttestorAuthRequestProvider?
  public let claimCreationType: String?
  public let canAutoSubmit: Bool
  public let isCloseButtonVisible: Bool
  public let locale: String?
  // bool
  public let useTeeOperator: NSNumber?

  @objc public init(
    canDeleteCookiesBeforeVerificationStarts: Bool,
    fetchAttestorAuthenticationRequest:
      ReclaimVerificationOptionFetchAttestorAuthRequestHandler?,
    claimCreationType: String?,
    canAutoSubmit: Bool,
    isCloseButtonVisible: Bool,
    locale: String? = nil,
    useTeeOperator: NSNumber? = nil
  ) {
    self.canDeleteCookiesBeforeVerificationStarts =
      canDeleteCookiesBeforeVerificationStarts
    if let fetchAttestorAuthenticationRequest {
      self.attestorAuthRequestProvider = _AttestorAuthRequestProvider(
        fetchAttestorAuthenticationRequest: fetchAttestorAuthenticationRequest
      )
    } else {
      self.attestorAuthRequestProvider = nil
    }
    self.claimCreationType = claimCreationType
    self.canAutoSubmit = canAutoSubmit
    self.isCloseButtonVisible = isCloseButtonVisible
    self.locale = locale
    self.useTeeOperator = useTeeOperator
  }

  func claimCreationTypeApi()
    -> ReclaimVerification.VerificationOptions.ClaimCreationType
  {
    switch claimCreationType {
    case "meChain": return .meChain
    case _: return .standalone
    }
  }

  func toSdkOptions() -> ReclaimVerification.VerificationOptions {
    return .init(
      canDeleteCookiesBeforeVerificationStarts:
        canDeleteCookiesBeforeVerificationStarts,
      attestorAuthRequestProvider: attestorAuthRequestProvider,
      claimCreationType: claimCreationTypeApi(),
      canAutoSubmit: canAutoSubmit,
      isCloseButtonVisible: isCloseButtonVisible,
      locale: locale,
      useTeeOperator: useTeeOperator?.boolValue
    )
  }

  class _AttestorAuthRequestProvider: ReclaimVerification.VerificationOptions
      .AttestorAuthRequestProvider
  {
    let fetchAttestorAuthenticationRequest: ReclaimVerificationOptionFetchAttestorAuthRequestHandler

    init(
      fetchAttestorAuthenticationRequest: @escaping
      ReclaimVerificationOptionFetchAttestorAuthRequestHandler
    ) {
      self.fetchAttestorAuthenticationRequest =
        fetchAttestorAuthenticationRequest
    }

    func fetchAttestorAuthenticationRequest(
      reclaimHttpProvider: [AnyHashable?: (any Sendable)?],
      completion: @escaping (Result<String, any Error>) -> Void
    ) {
      let replyId = Api.setReplyWithStringCallback(completion)
      let reclaimHttpProviderJsonString = JSONUtility.toString(
        reclaimHttpProvider
      )
      fetchAttestorAuthenticationRequest(reclaimHttpProviderJsonString, replyId)
    }
  }
}
