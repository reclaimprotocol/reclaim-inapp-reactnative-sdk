import type { EventSubscription } from "react-native";
import NativeReclaimInappModule from "./specs/NativeInappRnSdk";
import * as NativeReclaimInappModuleTypes from "./specs/NativeInappRnSdk";
import { ReclaimResult, type ReclaimVerificationResponse } from "./types/proof";
export type { ReclaimVerificationResponse, ReclaimResult } from "./types/proof";

/**
 * This namespace provides types involved in initiating and managing the verification process
 * for proving claims about user data through various providers.
 */
export namespace ReclaimVerificationApi {
    /**
     * Represents user's session information for a verification attempt.
     * This data class contains the necessary data to identify and validate a verification session.
     */
    export type SessionInformation = NativeReclaimInappModuleTypes.SessionInformation;

    /**
     * Represents a request for a verification attempt.
     *
     * You can create a request using the [ReclaimVerification.Request] constructor or the [ReclaimVerification.Request.fromManifestMetaData] factory method.
     */
    export type Request = NativeReclaimInappModuleTypes.Request;

    /**
     * Contains the proof and response data after verification
     */
    export type Response = ReclaimVerificationResponse;

    export namespace Overrides {
        export interface ProviderInformation {
            url?: string;
            jsonString?: string;
            callback?: (request: NativeReclaimInappModuleTypes.ProviderInformationRequest) => Promise<string>;
        }
        export type FeatureOptions = NativeReclaimInappModuleTypes.FeatureOptions;
        export interface LogConsumer {
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
        capabilityAccessToken?: string
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
                    let type = ReclaimVerificationApi.ReclaimVerificationException.fromTypeName(userInfo.errorType);
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
                ReclaimVerificationApi.ExceptionType.Failed,
                sessionIdHint,
                false,
                ""
            );
        }

        static isReclaimVerificationException(error: Error): error is ReclaimVerificationException {
            return error instanceof ReclaimVerificationException
        }
    }
}

export abstract class ReclaimVerificationPlatformChannel {
    abstract startVerification(request: ReclaimVerificationApi.Request): Promise<ReclaimVerificationApi.Response>

    abstract startVerificationFromUrl(requestUrl: string): Promise<ReclaimVerificationApi.Response>

    abstract ping(): Promise<boolean>

    abstract setOverrides(config: ReclaimVerificationApi.OverrideConfig): Promise<void>

    abstract clearAllOverrides(): Promise<void>
}

export class ReclaimVerificationPlatformChannelImpl extends ReclaimVerificationPlatformChannel {
    override async startVerification(request: ReclaimVerificationApi.Request): Promise<ReclaimVerificationApi.Response> {
        try {
            const response = await NativeReclaimInappModule.startVerification(request);
            return {
                ...response,
                proofs: ReclaimResult.asProofs(response.proofs),
            }
        } catch (error) {
            console.info({
                error
            })
            if (error instanceof Error) {
                throw ReclaimVerificationApi.ReclaimVerificationException.fromError(error, request.session?.sessionId ?? "");
            }
            throw error
        }
    }

    override async startVerificationFromUrl(requestUrl: string): Promise<ReclaimVerificationApi.Response> {
        try {
            const response = await NativeReclaimInappModule.startVerificationFromUrl(requestUrl);
            return {
                ...response,
                proofs: ReclaimResult.asProofs(response.proofs),
            }
        } catch (error) {
            console.info({
                error
            })
            if (error instanceof Error) {
                throw ReclaimVerificationApi.ReclaimVerificationException.fromError(error, "");
            }
            throw error
        }
    }

    override async ping(): Promise<boolean> {
        return await NativeReclaimInappModule.ping();
    }

    private previousSessionManagementCancelCallback: null | (() => void) = null;
    disposeSessionManagement() {
        let callback = this.previousSessionManagementCancelCallback;
        if (callback != null && callback != undefined) {
            callback();
        }
        this.previousSessionManagementCancelCallback = null;
    }

    private previousLogSubscription: EventSubscription | null = null;
    disposeLogListener() {
        this.previousLogSubscription?.remove()
        this.previousLogSubscription = null;
    }

    private previousProviderRequestCancelCallback: null | (() => void) = null;
    private disposeProviderRequestListener() {
        let callback = this.previousProviderRequestCancelCallback;
        if (callback != null && callback != undefined) {
            callback();
        }
        this.previousProviderRequestCancelCallback = null;
    }

    override async setOverrides({
        provider,
        featureOptions,
        logConsumer,
        sessionManagement,
        appInfo,
        capabilityAccessToken
    }: ReclaimVerificationApi.OverrideConfig) {
        let providerCallback = provider?.callback;
        let providerOverride = !provider ? null : {
            url: provider?.url,
            jsonString: provider?.jsonString,
            canFetchProviderInformationFromHost: !!providerCallback,
        }
        if (providerCallback) {
            this.disposeProviderRequestListener();
            let providerRequestSubscription = NativeReclaimInappModule.onProviderInformationRequest(async (event) => {
                try {
                    let result = await providerCallback(event);
                    NativeReclaimInappModule.replyWithProviderInformation(event.replyId, result);
                } catch (error) {
                    console.error(error);
                    NativeReclaimInappModule.replyWithProviderInformation(event.replyId, "");
                }
            });
            const cancel = () => {
                providerRequestSubscription.remove();
            }
            this.previousProviderRequestCancelCallback = cancel;
        }

        const onLogsListener = logConsumer?.onLogs;
        let logConsumerRequest = !logConsumer ? undefined : {
            enableLogHandler: !!onLogsListener,
            canSdkCollectTelemetry: logConsumer?.canSdkCollectTelemetry,
            canSdkPrintLogs: logConsumer?.canSdkPrintLogs
        }
        if (onLogsListener) {
            this.disposeLogListener();
            const cancel = () => {
                this.previousLogSubscription?.remove();
                this.previousLogSubscription = null;
            };
            this.previousLogSubscription = NativeReclaimInappModule.onLogs((arg) => {
                onLogsListener(arg, cancel);
            })
        }

        let sessionManagementRequest = !sessionManagement ? undefined : {
            // A handler is provided, so we don't let SDK manage sessions
            enableSdkSessionManagement: false
        }
        if (sessionManagement) {
            this.disposeSessionManagement();
            let sessionCreateSubscription = NativeReclaimInappModule.onSessionCreateRequest(async (event) => {
                const replyId = event.replyId;
                try {
                    let result = await sessionManagement.onSessionCreateRequest(event);
                    NativeReclaimInappModule.reply(replyId, result);
                } catch (error) {
                    console.error(error);
                    NativeReclaimInappModule.reply(replyId, false);
                }
            });
            let sessionUpdateSubscription = NativeReclaimInappModule.onSessionUpdateRequest(async (event) => {
                const replyId = event.replyId;
                try {
                    let result = await sessionManagement.onSessionUpdateRequest(event);
                    NativeReclaimInappModule.reply(replyId, result);
                } catch (error) {
                    console.error(error);
                    NativeReclaimInappModule.reply(replyId, false);
                }
            });
            let sessionLogsSubscription = NativeReclaimInappModule.onSessionLogs((event) => {
                try {
                    sessionManagement.onLog(event);
                } catch (error) {
                    console.error(error);
                }
            });
            const cancel = () => {
                sessionCreateSubscription.remove()
                sessionUpdateSubscription.remove()
                sessionLogsSubscription.remove()
            }
            this.previousSessionManagementCancelCallback = cancel;
        }

        try {
            return await NativeReclaimInappModule.setOverrides({
                provider: providerOverride,
                featureOptions,
                logConsumer: logConsumerRequest,
                sessionManagement: sessionManagementRequest,
                appInfo,
                capabilityAccessToken
            });
        } catch (error) {
            throw new ReclaimVerificationApi.ReclaimPlatformException("Failed to set overrides", error as Error);
        }
    }

    override async clearAllOverrides() {
        this.disposeProviderRequestListener();
        this.disposeLogListener();
        this.disposeSessionManagement();
        return NativeReclaimInappModule.clearAllOverrides();
    }
}
