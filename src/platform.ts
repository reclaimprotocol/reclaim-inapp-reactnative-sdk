import type { EventSubscription } from "react-native";
import NativeReclaimInappModule from "./specs/NativeInappRnSdk";
import * as NativeReclaimInappModuleTypes from "./specs/NativeInappRnSdk";
import { ReclaimVerification } from "./index";

export class PlatformImpl extends ReclaimVerification.Platform {
    override async startVerification(request: ReclaimVerification.Request): Promise<ReclaimVerification.Response> {
        try {
            const response = await NativeReclaimInappModule.startVerification(request);
            return {
                ...response,
                proofs: ReclaimVerification.ReclaimResult.asProofs(response.proofs),
            }
        } catch (error) {
            console.info({
                error
            })
            if (error instanceof Error) {
                throw ReclaimVerification.ReclaimVerificationException.fromError(error, request.session?.sessionId ?? "");
            }
            throw error
        }
    }

    override async startVerificationFromUrl(requestUrl: string): Promise<ReclaimVerification.Response> {
        try {
            const response = await NativeReclaimInappModule.startVerificationFromUrl(requestUrl);
            return {
                ...response,
                proofs: ReclaimVerification.ReclaimResult.asProofs(response.proofs),
            }
        } catch (error) {
            console.info({
                error
            })
            if (error instanceof Error) {
                throw ReclaimVerification.ReclaimVerificationException.fromError(error, "");
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
    }: ReclaimVerification.OverrideConfig) {
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
                    NativeReclaimInappModule.replyWithString(event.replyId, result);
                } catch (error) {
                    console.error(error);
                    NativeReclaimInappModule.replyWithString(event.replyId, "");
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
            throw new ReclaimVerification.ReclaimPlatformException("Failed to set overrides", error as Error);
        }
    }

    override async clearAllOverrides() {
        this.disposeProviderRequestListener();
        this.disposeLogListener();
        this.disposeSessionManagement();
        return NativeReclaimInappModule.clearAllOverrides();
    }

    private previousAttestorAuthRequestCancelCallback: null | (() => void) = null;
    disposeAttestorAuthRequestListener() {
        let callback = this.previousAttestorAuthRequestCancelCallback;
        if (callback != null && callback != undefined) {
            callback();
        }
        this.previousAttestorAuthRequestCancelCallback = null;
    }

    override async setVerificationOptions(options?: ReclaimVerification.VerificationOptions | null): Promise<void> {
        let args: NativeReclaimInappModuleTypes.VerificationOptions | null = null
        if (options) {
            let canUseAttestorAuthenticationRequest = options.fetchAttestorAuthenticationRequest != null
            args = {
                canDeleteCookiesBeforeVerificationStarts: options.canDeleteCookiesBeforeVerificationStarts,
                canUseAttestorAuthenticationRequest: canUseAttestorAuthenticationRequest,
            }
            if (canUseAttestorAuthenticationRequest) {
                this.disposeAttestorAuthRequestListener();
                let attestorAuthRequestSubscription = NativeReclaimInappModule.onReclaimAttestorAuthRequest(async (event) => {
                    let result = await options.fetchAttestorAuthenticationRequest(event.reclaimHttpProviderJsonString);
                    NativeReclaimInappModule.replyWithString(event.replyId, result);
                });
                const cancel = () => {
                    attestorAuthRequestSubscription.remove();
                }
                this.previousAttestorAuthRequestCancelCallback = cancel;
            }
        }
        try {
            return await NativeReclaimInappModule.setVerificationOptions({
                options: args
            });
        } catch (error) {
            throw new ReclaimVerification.ReclaimPlatformException("Failed to set verification options", error as Error);
        }
    }
}