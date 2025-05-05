import { PlatformImpl } from "./platform";
import { ReclaimVerification as ReclaimVerificationTypes } from "./types";

/**
 * [ReclaimVerification] is the main class for interacting with the Reclaim verification system.
 * It provides methods to start verification processes, manage platform configurations,
 * and handle verification options.
 * 
 * The class can be instantiated with a custom platform implementation, or will use
 * the default [PlatformImpl] if none is provided.
 */
export class ReclaimVerification {
  public platform: ReclaimVerificationTypes.Platform;

  private static defaultPlatform: ReclaimVerificationTypes.Platform | null = null;

  public constructor(platform?: ReclaimVerificationTypes.Platform) {
    if (platform) {
      this.platform = platform;
    } else {
      if (ReclaimVerification.defaultPlatform == null) {
        ReclaimVerification.defaultPlatform = new PlatformImpl();
      }
      this.platform = ReclaimVerification.defaultPlatform;
    }
  }

  public async startVerification(request: ReclaimVerificationTypes.Request): Promise<ReclaimVerificationTypes.Response> {
    return this.platform.startVerification(request);
  }

  public async ping(): Promise<boolean> {
    return this.platform.ping();
  }

  public setOverrides(overrides: ReclaimVerificationTypes.OverrideConfig) {
    return this.platform.setOverrides(overrides);
  }

  public clearAllOverrides() {
    return this.platform.clearAllOverrides();
  }

  public setVerificationOptions(options?: ReclaimVerificationTypes.VerificationOptions | null) {
    return this.platform.setVerificationOptions(options);
  }
}

// Re-export all the types from the types file
export namespace ReclaimVerification {
  export type SessionInformation = ReclaimVerificationTypes.SessionInformation;
  export type Request = ReclaimVerificationTypes.Request;
  export type Response = ReclaimVerificationTypes.Response;
  export namespace ReclaimResult {
    export type Proof = ReclaimVerificationTypes.ReclaimResult.Proof;
    export type ProviderClaimData = ReclaimVerificationTypes.ReclaimResult.ProviderClaimData;
    export type WitnessData = ReclaimVerificationTypes.ReclaimResult.WitnessData;
    export const isProof = ReclaimVerificationTypes.ReclaimResult.isProof;
    export const asProofs = ReclaimVerificationTypes.ReclaimResult.asProofs;
  }
  export type VerificationOptions = ReclaimVerificationTypes.VerificationOptions;
  export namespace Overrides {
    export type ProviderInformation = ReclaimVerificationTypes.Overrides.ProviderInformation;
    export type FeatureOptions = ReclaimVerificationTypes.Overrides.FeatureOptions;
    export type LogConsumer = ReclaimVerificationTypes.Overrides.LogConsumer;
    export type SessionManagement = ReclaimVerificationTypes.Overrides.SessionManagement;
    export type ReclaimAppInfo = ReclaimVerificationTypes.Overrides.ReclaimAppInfo;
  }
  export type OverrideConfig = ReclaimVerificationTypes.OverrideConfig;
  export const ExceptionType = ReclaimVerificationTypes.ExceptionType;
  export type ExceptionType = ReclaimVerificationTypes.ExceptionType;
  export const ReclaimPlatformException = ReclaimVerificationTypes.ReclaimPlatformException;
  export type ReclaimPlatformException = ReclaimVerificationTypes.ReclaimPlatformException;
  export const ReclaimVerificationException = ReclaimVerificationTypes.ReclaimVerificationException;
  export type ReclaimVerificationException = ReclaimVerificationTypes.ReclaimVerificationException;
  export const Platform = ReclaimVerificationTypes.Platform;
  export type Platform = ReclaimVerificationTypes.Platform;
}
