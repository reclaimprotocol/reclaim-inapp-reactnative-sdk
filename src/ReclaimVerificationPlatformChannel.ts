import type { EventSubscription } from "react-native";
import NativeReclaimInappModule from "./specs/NativeInappRnSdk";
import * as NativeReclaimInappModuleTypes from "./specs/NativeInappRnSdk";

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
    export type Response = NativeReclaimInappModuleTypes.Response;

    export namespace Overrides {
        export type ProviderInformation = NativeReclaimInappModuleTypes.ProviderInformation;
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
        appInfo?: Overrides.ReclaimAppInfo
    }

    export enum ExceptionType {
        Cancelled = "Cancelled",
        Dismissed = "Dismissed",
        SessionExpired = "SessionExpired",
        Failed = "Failed",
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
            if (Object.hasOwn(error, 'userInfo')) {
                // From native, we send information about error in userInfo
                let unTypedError = (error as unknown as any);
                let userInfo = unTypedError.userInfo;
                if (userInfo) {
                    let type = ReclaimVerificationApi.ReclaimVerificationException.fromTypeName(unTypedError.userInfo.errorType);
                    let maybeSessionId = unTypedError?.userInfo?.sessionId
                    return new ReclaimVerificationException(
                        error.message,
                        error,
                        type,
                        (typeof maybeSessionId === 'string' && maybeSessionId)
                            ? maybeSessionId : sessionIdHint,
                        unTypedError?.userInfo?.didSubmitManualVerification ?? false,
                        unTypedError?.userInfo?.reason ?? ""
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
    }
}

export class ReclaimVerificationPlatformChannel {
    async startVerification(request: ReclaimVerificationApi.Request): Promise<ReclaimVerificationApi.Response> {
        try {
            return await NativeReclaimInappModule.startVerification(request);
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

    async startVerificationFromUrl(requestUrl: string): Promise<ReclaimVerificationApi.Response> {
        try {
            return await NativeReclaimInappModule.startVerificationFromUrl(requestUrl);
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

    async ping(): Promise<boolean> {
        return await NativeReclaimInappModule.ping();
    }

    private previousLogSubscription: EventSubscription | null = null;
    private previousSessionManagementCancelCallback: null | (() => void) = null;

    setOverrides({
        provider,
        featureOptions,
        logConsumer,
        sessionManagement,
        appInfo
    }: ReclaimVerificationApi.OverrideConfig) {
        this.previousLogSubscription?.remove()
        this.previousLogSubscription = null;
        let callback = this.previousSessionManagementCancelCallback;
        if (callback != null) {
            callback();
        }
        this.previousSessionManagementCancelCallback = null;

        let logConsumerRequest = logConsumer == null ? undefined : {
            enableLogHandler: logConsumer?.onLogs != null,
            canSdkCollectTelemetry: logConsumer?.canSdkCollectTelemetry,
            canSdkPrintLogs: logConsumer?.canSdkPrintLogs
        }
        const onLogsListener = logConsumer?.onLogs;
        if (onLogsListener != null) {
            const cancel = () => {
                this.previousLogSubscription?.remove();
                this.previousLogSubscription = null;
            };
            this.previousLogSubscription = NativeReclaimInappModule.onLogs((arg) => {
                onLogsListener(arg, cancel);
            })
        }

        let sessionManagementRequest = sessionManagement == null ? undefined : {
            // A handler is provided, so we don't let SDK manage sessions
            enableSdkSessionManagement: false
        }
        if (sessionManagement != null) {
            let sessionCreateSubscription = NativeReclaimInappModule.onSessionCreateRequest(async (event) => {
                const replyId = event.replyId;
                let result = await sessionManagement.onSessionCreateRequest(event);
                NativeReclaimInappModule.reply(replyId, result);
            });
            let sessionUpdateSubscription = NativeReclaimInappModule.onSessionUpdateRequest(async (event) => {
                const replyId = event.replyId;
                let result = await sessionManagement.onSessionUpdateRequest(event);
                NativeReclaimInappModule.reply(replyId, result);
            });
            let sessionLogsSubscription = NativeReclaimInappModule.onSessionLogs((event) => {
                sessionManagement.onLog(event);
            });
            const cancel = () => {
                sessionCreateSubscription.remove()
                sessionUpdateSubscription.remove()
                sessionLogsSubscription.remove()
            }
            this.previousSessionManagementCancelCallback = cancel;
        }

        NativeReclaimInappModule.setOverrides(
            provider,
            featureOptions,
            logConsumerRequest,
            sessionManagementRequest,
            appInfo
        );
    }
}