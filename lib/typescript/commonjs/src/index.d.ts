import * as NativeReclaimInappModuleTypes from "./specs/NativeInappRnSdk";
/**
 * [ReclaimVerification] is the main class for interacting with the Reclaim verification system.
 * It provides methods to start verification processes, manage platform configurations,
 * and handle verification options.
 *
 * The class can be instantiated with a custom platform implementation, or will use
 * the default [PlatformImpl] if none is provided.
 */
export declare class ReclaimVerification {
    platform: ReclaimVerification.Platform;
    private static defaultPlatform;
    constructor(platform?: ReclaimVerification.Platform);
    startVerification(request: ReclaimVerification.Request): Promise<ReclaimVerification.Response>;
    ping(): Promise<boolean>;
    setOverrides(overrides: ReclaimVerification.OverrideConfig): Promise<void>;
    clearAllOverrides(): Promise<void>;
    setVerificationOptions(options?: ReclaimVerification.VerificationOptions | null): Promise<void>;
}
/**
 * This namespace provides types involved in initiating and managing the verification process
 * for proving claims about user data through various providers.
 */
export declare namespace ReclaimVerification {
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
    interface Response extends NativeReclaimInappModuleTypes.Response {
        proofs: ReclaimResult.Proof[];
    }
    namespace ReclaimResult {
        interface Proof {
            identifier: string;
            signatures: string[];
            /**
             * A data associated with this [Proof].
             * The data type of this object is dynamic and can be any JSON serializable Javascript object.
             */
            publicData?: any | null;
            witnesses: WitnessData[];
            claimData: ProviderClaimData;
        }
        const isProof: (value: Record<string, any>) => value is Proof;
        const asProofs: (proofs: Record<string, any>[]) => Proof[];
        interface ProviderClaimData {
            owner: string;
            provider: string;
            timestampS: number;
            epoch: number;
            context: string;
            identifier: string;
            parameters: string;
        }
        interface WitnessData {
            id: string;
            url: string;
        }
    }
    interface VerificationOptions {
        canDeleteCookiesBeforeVerificationStarts: boolean;
        fetchAttestorAuthenticationRequest: (reclaimHttpProviderJsonString: string) => Promise<string>;
    }
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
        capabilityAccessToken?: string | null;
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
    abstract class Platform {
        abstract startVerification(request: ReclaimVerification.Request): Promise<ReclaimVerification.Response>;
        abstract startVerificationFromUrl(requestUrl: string): Promise<ReclaimVerification.Response>;
        abstract ping(): Promise<boolean>;
        abstract setOverrides(config: ReclaimVerification.OverrideConfig): Promise<void>;
        abstract clearAllOverrides(): Promise<void>;
        abstract setVerificationOptions(options?: ReclaimVerification.VerificationOptions | null): Promise<void>;
    }
}
//# sourceMappingURL=index.d.ts.map