import * as NativeReclaimInappModuleTypes from "./specs/NativeInappRnSdk";
import { type ReclaimVerificationResponse } from "./types/proof";
export type { ReclaimVerificationResponse, ReclaimResult } from "./types/proof";
/**
 * This namespace provides types involved in initiating and managing the verification process
 * for proving claims about user data through various providers.
 */
export declare namespace ReclaimVerificationApi {
    /**
     * Represents user's session information for a verification attempt.
     * This data class contains the necessary data to identify and validate a verification session.
     */
    type SessionInformation = NativeReclaimInappModuleTypes.SessionInformation;
    /**
     * Represents a request for a verification attempt.
     *
     * You can create a request using the [ReclaimVerification.Request] constructor or the [ReclaimVerification.Request.fromManifestMetaData] factory method.
     */
    type Request = NativeReclaimInappModuleTypes.Request;
    /**
     * Contains the proof and response data after verification
     */
    type Response = ReclaimVerificationResponse;
    namespace Overrides {
        interface ProviderInformation {
            url?: string;
            jsonString?: string;
            callback?: (request: NativeReclaimInappModuleTypes.ProviderInformationRequest) => Promise<string>;
        }
        type FeatureOptions = NativeReclaimInappModuleTypes.FeatureOptions;
        interface LogConsumer {
            /**
             * Handler for consuming logs exported from the SDK.
             * Defaults to false.
             */
            onLogs?: (logJsonString: String, cancel: () => void) => void;
            /**
             * When enabled, logs are sent to reclaim that can be used to help you.
             * Defaults to true.
             */
            canSdkCollectTelemetry?: boolean;
            /**
             * Defaults to enabled when not in release mode.
             */
            canSdkPrintLogs?: boolean;
        }
        interface SessionManagement {
            onLog: (event: NativeReclaimInappModuleTypes.SessionLogEvent) => void;
            onSessionCreateRequest: (event: NativeReclaimInappModuleTypes.SessionCreateRequestEvent) => Promise<boolean>;
            onSessionUpdateRequest: (event: NativeReclaimInappModuleTypes.SessionUpdateRequestEvent) => Promise<boolean>;
        }
        type ReclaimAppInfo = NativeReclaimInappModuleTypes.ReclaimAppInfo;
    }
    type OverrideConfig = {
        provider?: Overrides.ProviderInformation;
        featureOptions?: Overrides.FeatureOptions;
        logConsumer?: Overrides.LogConsumer;
        sessionManagement?: Overrides.SessionManagement;
        appInfo?: Overrides.ReclaimAppInfo;
        capabilityAccessToken?: string;
    };
    enum ExceptionType {
        Cancelled = "Cancelled",
        Dismissed = "Dismissed",
        SessionExpired = "SessionExpired",
        Failed = "Failed"
    }
    class ReclaimPlatformException extends Error {
        readonly innerError: Error;
        readonly reason?: string;
        readonly details?: any;
        constructor(message: string, innerError: Error);
        static isReclaimPlatformException(error: Error): error is ReclaimPlatformException;
    }
    class ReclaimVerificationException extends Error {
        readonly innerError: Error;
        readonly type: ExceptionType;
        readonly sessionId: string;
        readonly "didSubmitManualVerification": boolean;
        readonly "reason": string;
        constructor(message: string, innerError: Error, type: ExceptionType, sessionId: string, didSubmitManualVerification: boolean, reason: string);
        private static fromTypeName;
        static fromError(error: Error, sessionIdHint: string): ReclaimVerificationException;
        static isReclaimVerificationException(error: Error): error is ReclaimVerificationException;
    }
}
export declare abstract class ReclaimVerificationPlatformChannel {
    abstract startVerification(request: ReclaimVerificationApi.Request): Promise<ReclaimVerificationApi.Response>;
    abstract startVerificationFromUrl(requestUrl: string): Promise<ReclaimVerificationApi.Response>;
    abstract ping(): Promise<boolean>;
    abstract setOverrides(config: ReclaimVerificationApi.OverrideConfig): Promise<void>;
    abstract clearAllOverrides(): Promise<void>;
}
export declare class ReclaimVerificationPlatformChannelImpl extends ReclaimVerificationPlatformChannel {
    startVerification(request: ReclaimVerificationApi.Request): Promise<ReclaimVerificationApi.Response>;
    startVerificationFromUrl(requestUrl: string): Promise<ReclaimVerificationApi.Response>;
    ping(): Promise<boolean>;
    private previousSessionManagementCancelCallback;
    disposeSessionManagement(): void;
    private previousLogSubscription;
    disposeLogListener(): void;
    private previousProviderRequestCancelCallback;
    private disposeProviderRequestListener;
    setOverrides({ provider, featureOptions, logConsumer, sessionManagement, appInfo, capabilityAccessToken }: ReclaimVerificationApi.OverrideConfig): Promise<void>;
    clearAllOverrides(): Promise<void>;
}
//# sourceMappingURL=ReclaimVerificationPlatformChannel.d.ts.map