import * as NativeReclaimInappModuleTypes from "./specs/NativeInappRnSdk";

/**
 * This namespace provides types involved in initiating and managing the verification process
 * for proving claims about user data through various providers.
 */
export namespace ReclaimVerification {
  /**
   * Represents user's session information for a verification attempt.
   * This data class contains the necessary data to identify and validate a verification session.
   */
  export type SessionInformation = NativeReclaimInappModuleTypes.SessionInformation;

  /**
   * Represents a request for a verification attempt.
   */
  export type Request = NativeReclaimInappModuleTypes.Request;

  /**
   * Contains the proof and response data after verification
   */
  export interface Response extends NativeReclaimInappModuleTypes.Response {
    proofs: ReclaimResult.Proof[];
  }

  export namespace ReclaimResult {
    export interface Proof {
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

    export const isProof = (value: Record<string, any>): value is Proof => {
      return typeof value === 'object' && value !== null && 'identifier' in value && 'signatures' in value && 'witnesses' in value;
    }

    export const asProofs = (proofs: Record<string, any>[]): Proof[] => {
      return proofs.filter(isProof);
    }

    export interface ProviderClaimData {
      owner: string;
      provider: string;
      timestampS: number;
      epoch: number;
      context: string;
      identifier: string;
      parameters: string;
    }

    export interface WitnessData {
      id: string;
      url: string;
    }
  }

  export interface VerificationOptions {
    canDeleteCookiesBeforeVerificationStarts: boolean;
    fetchAttestorAuthenticationRequest: (reclaimHttpProviderJsonString: string) => Promise<string>;
  }

  export namespace Overrides {
    export interface ProviderInformation {
      url?: string;
      jsonString?: string;
      callback?: (request: NativeReclaimInappModuleTypes.ProviderInformationRequest) => Promise<string>;
    }
    export type FeatureOptions = NativeReclaimInappModuleTypes.FeatureOptions;
    export interface LogConsumer {
      onLogs?: (logJsonString: String, cancel: () => void) => void;
      canSdkCollectTelemetry?: boolean;
      canSdkPrintLogs?: boolean;
    }
    export interface SessionManagement {
      onLog: (event: NativeReclaimInappModuleTypes.SessionLogEvent) => void;
      onSessionCreateRequest: (event: NativeReclaimInappModuleTypes.SessionCreateRequestEvent) => Promise<boolean>;
      onSessionUpdateRequest: (event: NativeReclaimInappModuleTypes.SessionUpdateRequestEvent) => Promise<boolean>;
    };
    export type ReclaimAppInfo = NativeReclaimInappModuleTypes.ReclaimAppInfo;
  }

  export type OverrideConfig = {
    provider?: Overrides.ProviderInformation,
    featureOptions?: Overrides.FeatureOptions,
    logConsumer?: Overrides.LogConsumer,
    sessionManagement?: Overrides.SessionManagement,
    appInfo?: Overrides.ReclaimAppInfo,
    capabilityAccessToken?: string | null,
  }

  export enum ExceptionType {
    Cancelled = "Cancelled",
    Dismissed = "Dismissed",
    SessionExpired = "SessionExpired",
    Failed = "Failed",
  }

  export class ReclaimPlatformException extends Error {
    readonly innerError: Error
    readonly reason?: string
    readonly details?: any

    constructor(message: string, innerError: Error) {
      super(message);
      this.innerError = innerError;
      this.reason = innerError.message;
      if ('userInfo' in innerError) {
        const details: any = innerError.userInfo
        this.details = details
        if ('message' in details) {
          this.reason = details.message || this.reason
        }
      }
    }

    static isReclaimPlatformException(error: Error): error is ReclaimPlatformException {
      return error instanceof ReclaimPlatformException
    }
  }

  export class ReclaimVerificationException extends Error {
    readonly innerError: Error
    readonly type: ExceptionType
    readonly sessionId: string
    readonly "didSubmitManualVerification": boolean
    readonly "reason": string

    constructor(
      message: string,
      innerError: Error,
      type: ExceptionType,
      sessionId: string,
      didSubmitManualVerification: boolean,
      reason: string
    ) {
      super(message);
      this.innerError = innerError;
      this.type = type;
      this.sessionId = sessionId;
      this.didSubmitManualVerification = didSubmitManualVerification;
      this.reason = reason;
    }

    private static fromTypeName(name: string): ExceptionType {
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

    static fromError(error: Error, sessionIdHint: string): ReclaimVerificationException {
      if ('userInfo' in error) {
        // From native, we send information about error in userInfo
        let userInfo = error.userInfo as any;
        if (userInfo) {
          let type = ReclaimVerificationException.fromTypeName(userInfo.errorType);
          let maybeSessionId = userInfo?.sessionId
          return new ReclaimVerificationException(
            error.message,
            error,
            type,
            (typeof maybeSessionId === 'string' && maybeSessionId)
              ? maybeSessionId : sessionIdHint,
            userInfo?.didSubmitManualVerification ?? false,
            userInfo?.reason ?? ""
          );
        }
      }
      return new ReclaimVerificationException(
        error.message,
        error,
        ExceptionType.Failed,
        sessionIdHint,
        false,
        ""
      );
    }

    static isReclaimVerificationException(error: Error): error is ReclaimVerificationException {
      return error instanceof ReclaimVerificationException
    }
  }

  export abstract class Platform {
    abstract startVerification(request: ReclaimVerification.Request): Promise<ReclaimVerification.Response>
    abstract startVerificationFromUrl(requestUrl: string): Promise<ReclaimVerification.Response>
    abstract ping(): Promise<boolean>
    abstract setOverrides(config: ReclaimVerification.OverrideConfig): Promise<void>
    abstract clearAllOverrides(): Promise<void>
    abstract setVerificationOptions(options?: ReclaimVerification.VerificationOptions | null): Promise<void>
  }
}
