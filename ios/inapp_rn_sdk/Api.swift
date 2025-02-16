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
    appId: String,
    secret: String?,
    providerId: String,
    sessionTimeestamp: String?,
    sessionSessionId: String?,
    sessionSignature: String?,
    context: String?,
    parameters: [String: String]?,
    hideLanding: Bool,
    autoSubmit: Bool,
    acceptAiProviders: Bool,
    webhookUrl: String
  ) async throws -> [String: Any] {
    NSLog("[Api] starting verification");
      return try await withCheckedThrowingContinuation { continuation in
        NSLog("[Api] starting verification going");
        Task { @MainActor in
          NSLog("[Api] starting verification doing");
          do {
            let result = try await ReclaimVerification.startVerification(.params(.init(
              appId: appId,
              secret: secret ?? "",
              providerId: providerId
            )))
            let map: [String: Any] = [
              "sessionId": result.sessionId,
              "didSubmitManualVerification": result.didSubmitManualVerification,
              "proofs": result.proofs
            ]
            continuation.resume(returning: map)
          } catch {
            NSLog("[Api] failed verification \(error)");
            continuation.resume(throwing: error)
          }
        }
      }
    }
}
