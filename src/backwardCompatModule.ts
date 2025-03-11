import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import type { Overrides, Request, Response, Spec, VerificationOptionsOptional } from './specs/NativeInappRnSdk';

const LINKING_ERROR =
    `The package '@reclaimprotocol/inapp-rn-sdk' doesn't seem to be linked. Make sure: \n\n` +
    Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
    '- You rebuilt the app after installing the package\n' +
    '- You are not using Expo Go\n';

// @ts-expect-error
const isTurboModuleEnabled = global.__turboModuleProxy != null;

const Module = isTurboModuleEnabled
    ? require('./specs/NativeInappRnSdk').default
    : NativeModules.InappRnSdk;

const InAppRnSdkModule: Spec = Module
    ? Module
    : new Proxy(
        {},
        {
            get() {
                throw new Error(LINKING_ERROR);
            },
        }
    );

const ModuleEventEmitter = new NativeEventEmitter(Module);

/**
 * @description Handles the event emitter for the new arch and the legacy event emitter
 * @param name - The name of the event to listen to
 * @param {EventEmitter<any> | null} eventEmitter - A EventEmitter from react native codegen 
 * @returns 
 */
const EventEmittingHandle = <T extends (event: any) => void>(name: string, eventEmitter?: any | null) => {
    return (handler: T) => {
        console.info(`Registering with legacy event handler for ${name}`);
        let legacyListener = ModuleEventEmitter?.addListener(name, handler);
        let cancelNewArchListener: (() => void) | null = null;
        if (eventEmitter) {
            console.info(`Registering with new arch event handler for ${name}`);
            let listener = eventEmitter(handler)
            cancelNewArchListener = () => {
                listener.remove();
            }
        }
        return {
            remove: () => {
                if (legacyListener) {
                    legacyListener.remove();
                }
                if (cancelNewArchListener) {
                    cancelNewArchListener();
                }
            }
        } as any;
    }
}

export const ModuleWrapper: Spec = {
    startVerification: function (request: Request): Promise<Response> {
        return InAppRnSdkModule.startVerification(request);
    },
    startVerificationFromUrl: function (requestUrl: string): Promise<Response> {
        return InAppRnSdkModule.startVerificationFromUrl(requestUrl);
    },
    setOverrides: function (overrides: Overrides): Promise<void> {
        return InAppRnSdkModule.setOverrides(overrides);
    },
    clearAllOverrides: function (): Promise<void> {
        return InAppRnSdkModule.clearAllOverrides();
    },
    setVerificationOptions: function (args: VerificationOptionsOptional): Promise<void> {
        return InAppRnSdkModule.setVerificationOptions(args);
    },
    reply: function (replyId: string, reply: boolean): void {
        return InAppRnSdkModule.reply(replyId, reply);
    },
    replyWithString: function (replyId: string, value: string): void {
        return InAppRnSdkModule.replyWithString(replyId, value);
    },
    ping: function (): Promise<boolean> {
        return InAppRnSdkModule.ping();
    },
    ...(
        {
            onLogs: EventEmittingHandle('onLogs', InAppRnSdkModule.onLogs),
            onSessionLogs: EventEmittingHandle('onSessionLogs', InAppRnSdkModule.onSessionLogs),
            onSessionCreateRequest: EventEmittingHandle('onSessionCreateRequest', InAppRnSdkModule.onSessionCreateRequest),
            onSessionUpdateRequest: EventEmittingHandle('onSessionUpdateRequest', InAppRnSdkModule.onSessionUpdateRequest),
            onProviderInformationRequest: EventEmittingHandle('onProviderInformationRequest', InAppRnSdkModule.onProviderInformationRequest),
            onReclaimAttestorAuthRequest: EventEmittingHandle('onReclaimAttestorAuthRequest', InAppRnSdkModule.onReclaimAttestorAuthRequest),
            onSessionIdentityUpdate: EventEmittingHandle('onSessionIdentityUpdate', InAppRnSdkModule.onSessionIdentityUpdate)
        }
    ),
    addListener: function (eventType: string): void {
        return InAppRnSdkModule.addListener(eventType);
    },
    removeListeners: function (count: number): void {
        return InAppRnSdkModule.removeListeners(count);
    },
}

export default ModuleWrapper;
