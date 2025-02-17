import ReclaimInAppSdk

@objc(Api) public class Api: NSObject {
  @objc public func ping() -> Bool {
    return true
  }
  
  @MainActor
  static private var replyHandlers: [String: (Result<Bool, Error>) -> Void] = [:]
  
  @objc public func reply(replyId: String?, reply: Bool) {
    if (replyId == nil) {
      NSLog("[Api.reply] Missing arg replyId")
      return
    }
    Task { @MainActor in
      let callback = Api.replyHandlers[replyId!]
      if let callback = callback {
        Api.replyHandlers[replyId!] = nil
        callback(.success(reply))
      } else {
        NSLog("[Api.reply] No callback found for replyId \(replyId!)")
      }
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
    hideLanding: Bool,
    autoSubmit: Bool,
    acceptAiProviders: Bool,
    webhookUrl: String
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
        hideLanding: hideLanding,
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
        hideLanding: hideLanding,
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
    appInfo: OverridenReclaimAppInfo?
  ) async throws {
    let providerOverrides: ReclaimOverrides.ProviderInformation? = if let url = provider?.url {
      .url(url: url)
    } else if let jsonString = provider?.jsonString {
      .jsonString(jsonString: jsonString)
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
    
    let logConsumerOverrides: ReclaimOverrides.LogConsumer? = nil
    let sessionManagementOverrides: ReclaimOverrides.SessionManagement? = nil
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
      appInfo: appInfoOverrides
    )
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

@objc(OverridenProviderInformation) public class OverridenProviderInformation: NSObject {
  @objc public var url: String?
  @objc public var jsonString: String?
  
  @objc public init(
    url: String? = nil,
    jsonString: String? = nil
  ) {
    self.url = url
    self.jsonString = jsonString
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
