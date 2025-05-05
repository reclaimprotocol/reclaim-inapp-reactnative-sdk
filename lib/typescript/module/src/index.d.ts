import { ReclaimVerification as ReclaimVerificationTypes } from "./types";
/**
 * [ReclaimVerification] is the main class for interacting with the Reclaim verification system.
 * It provides methods to start verification processes, manage platform configurations,
 * and handle verification options.
 *
 * The class can be instantiated with a custom platform implementation, or will use
 * the default [PlatformImpl] if none is provided.
 */
export declare class ReclaimVerification {
    platform: ReclaimVerificationTypes.Platform;
    private static defaultPlatform;
    constructor(platform?: ReclaimVerificationTypes.Platform);
    startVerification(request: ReclaimVerificationTypes.Request): Promise<ReclaimVerificationTypes.Response>;
    ping(): Promise<boolean>;
    setOverrides(overrides: ReclaimVerificationTypes.OverrideConfig): Promise<void>;
    clearAllOverrides(): Promise<void>;
    setVerificationOptions(options?: ReclaimVerificationTypes.VerificationOptions | null): Promise<void>;
}
export declare namespace ReclaimVerification {
    type SessionInformation = ReclaimVerificationTypes.SessionInformation;
    type Request = ReclaimVerificationTypes.Request;
    type Response = ReclaimVerificationTypes.Response;
    namespace ReclaimResult {
        type Proof = ReclaimVerificationTypes.ReclaimResult.Proof;
        type ProviderClaimData = ReclaimVerificationTypes.ReclaimResult.ProviderClaimData;
        type WitnessData = ReclaimVerificationTypes.ReclaimResult.WitnessData;
        const isProof: (value: Record<string, any>) => value is ReclaimVerificationTypes.ReclaimResult.Proof;
        const asProofs: (proofs: Record<string, any>[]) => ReclaimVerificationTypes.ReclaimResult.Proof[];
    }
    type VerificationOptions = ReclaimVerificationTypes.VerificationOptions;
    namespace Overrides {
        type ProviderInformation = ReclaimVerificationTypes.Overrides.ProviderInformation;
        type FeatureOptions = ReclaimVerificationTypes.Overrides.FeatureOptions;
        type LogConsumer = ReclaimVerificationTypes.Overrides.LogConsumer;
        type SessionManagement = ReclaimVerificationTypes.Overrides.SessionManagement;
        type ReclaimAppInfo = ReclaimVerificationTypes.Overrides.ReclaimAppInfo;
    }
    type OverrideConfig = ReclaimVerificationTypes.OverrideConfig;
    const ExceptionType: typeof ReclaimVerificationTypes.ExceptionType;
    type ExceptionType = ReclaimVerificationTypes.ExceptionType;
    const ReclaimPlatformException: typeof ReclaimVerificationTypes.ReclaimPlatformException;
    type ReclaimPlatformException = ReclaimVerificationTypes.ReclaimPlatformException;
    const ReclaimVerificationException: typeof ReclaimVerificationTypes.ReclaimVerificationException;
    type ReclaimVerificationException = ReclaimVerificationTypes.ReclaimVerificationException;
    const Platform: typeof ReclaimVerificationTypes.Platform;
    type Platform = ReclaimVerificationTypes.Platform;
}
//# sourceMappingURL=index.d.ts.map