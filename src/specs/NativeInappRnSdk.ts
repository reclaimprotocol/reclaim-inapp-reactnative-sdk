import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import type { EventEmitter } from 'react-native/Libraries/Types/CodegenTypes';

export interface SessionInformation {
  /**
   * The timestamp of the session creation.
   *
   * Represented as a string from number of milliseconds since
   * the "Unix epoch" 1970-01-01T00:00:00Z (UTC).
   *
   * This value is independent of the time zone.
   *
   * This value is at most 8,640,000,000,000,000ms (100,000,000 days) from the Unix epoch.
   */
  timestamp: string;

  /**
   * Unique identifier for the verification session
   */
  sessionId: string;

  /**
   * Cryptographic signature to validate the session
   */
  signature: string;
}
/**
   * Represents a request for a verification attempt.
   *
   * You can create a request using the [ReclaimVerification.Request] constructor or the [ReclaimVerification.Request.fromManifestMetaData] factory method.
   */
export interface Request {
  /**
   * The Reclaim application ID for the verification process.
   * If not provided, the appId will be fetched from the AndroidManifest.xml metadata along with secret.
   * ```xml
   * <meta-data android:name="org.reclaimprotocol.inapp_sdk.APP_ID"
   *            android:value="<YOUR_RECLAIM_APP_ID>" />
   * ```
   */
  appId: string;

  /**
   * The Reclaim application secret for the verification process.
   * If not provided, the secret will be fetched from the AndroidManifest.xml metadata along with appId.
   * ```xml
   * <meta-data android:name="org.reclaimprotocol.inapp_sdk.APP_SECRET"
   *            android:value="<YOUR_RECLAIM_APP_SECRET>" />
   * ```
   */
  secret: string;

  /**
   * The identifier for the Reclaim data provider to use in verification
   */
  providerId: string;

  /**
   * Optional session information. If nil, SDK generates new session details.
   */
  session?: SessionInformation | null; // Allow null as well

  /**
   * Additional data to associate with the verification attempt
   */
  contextString?: string; // Optional

  /**
   * Key-value pairs for prefilling claim creation variables
   */
  parameters?: { [key: string]: string }; // Use index signature for Map

  /**
   * Whether to hide the landing page of the verification process. When false, shows an introductory page with claims to be proven.
   */
  hideLanding?: boolean; // Optional

  /**
   * Whether to automatically submit the proof after generation.
   */
  autoSubmit?: boolean; // Optional

  acceptAiProviders?: boolean; // Optional
  webhookUrl?: string | null; // Optional and nullable
}

/**
 * Contains the proof and response data after verification
 */
export interface Response {
  /**
   * The session ID for the verification attempt
   */
  sessionId: string;

  /**
   * Whether the proof was submitted manually
   */
  didSubmitManualVerification: boolean;

  /**
   * The list of proofs generated during the verification attempt
   */
  proofs: { [key: string]: any }[]; // Array of dictionaries
  // proofs: string[]; // Array of dictionaries
}

export interface ProviderInformation {
  url?: string;
  jsonString?: string;
}

/**
* Interface representing Feature Options.
*/
export interface FeatureOptions {
  /**
   * Whether to persist a cookie.
   * Optional, defaults to null.
   */
  cookiePersist?: boolean | null;

  /**
   * Whether to allow a single reclaim request.
   * Optional, defaults to null.
   */
  singleReclaimRequest?: boolean | null;

  /**
   * Idle time threshold (in milliseconds?) for triggering manual verification.
   * Optional, defaults to null.
   */
  idleTimeThresholdForManualVerificationTrigger?: number | null;

  /**
   * Session timeout (in milliseconds?) for triggering manual verification.
   * Optional, defaults to null.
   */
  sessionTimeoutForManualVerificationTrigger?: number | null;

  /**
   * URL for the Attestor Browser RPC.
   * Optional, defaults to null.
   */
  attestorBrowserRpcUrl?: string | null;

  /**
   * Whether response redaction regex escaping is enabled.
   * Optional, defaults to null.
   */
  isResponseRedactionRegexEscapingEnabled?: boolean | null;

  /**
   * Whether AI flow is enabled.
   * Optional, defaults to null.
   */
  isAIFlowEnabled?: boolean | null;
}

export interface LogConsumer {
  /**
   * Handler for consuming logs exported from the SDK.
   * Defaults to false.
   */
  enableLogHandler: boolean;

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

/**
 * Interface representing Reclaim App Information.
 */
export interface ReclaimAppInfo {
  /**
   * The name of the application.
   */
  appName: string;

  /**
   * The URL of the application's image.
   */
  appImageUrl: string;

  /**
   * Whether the reclaim is recurring.
   * Optional, defaults to false.
   */
  isRecurring?: boolean;
}

export interface SessionManagement {
  /**
   * Whether to enable SDK session management.
   * Optional, defaults to true.
   * 
   * When false, a handler must be provided. We'll not let SDK manage sessions in this case.
   */
  enableSdkSessionManagement?: boolean;
}

export interface SessionLogEvent {
  /**
   * The app ID for the verification attempt
   */
  appId: string;
  /**
   * The provider ID for the verification attempt
   */
  providerId: string;
  /**
   * The session ID for the verification attempt
   */
  sessionId: string;
  /**
   * The type of log event
   */
  logType: string;
}

export interface SessionCreateRequestEvent {
  /**
   * The app ID for the verification attempt
   */
  appId: string;
  /**
   * The provider ID for the verification attempt
   */
  providerId: string;
  /**
   * The session ID for the verification attempt
   */
  sessionId: string;
  /**
   * internal
   */
  readonly replyId: string;
}

export interface SessionUpdateRequestEvent {
  /**
   * The session ID for the verification attempt
  */
 sessionId: string;
 /**
  * The status type of this session event
  */
 status: string;
  /**
   * internal
   */
  readonly replyId: string;
}

export interface Spec extends TurboModule {
  startVerification(request: Request): Promise<Response>;
  startVerificationFromUrl(requestUrl: string): Promise<Response>;
  setOverrides(
    provider?: ProviderInformation,
    featureOptions?: FeatureOptions,
    logConsumer?: LogConsumer,
    sessionManagement?: SessionManagement,
    appInfo?: ReclaimAppInfo
  ): Promise<void>;
  reply(replyId: string, reply: boolean): void;
  ping(): Promise<boolean>;

  readonly onLogs: EventEmitter<string>
  readonly onSessionLogs: EventEmitter<SessionLogEvent>
  readonly onSessionCreateRequest: EventEmitter<SessionCreateRequestEvent>
  readonly onSessionUpdateRequest: EventEmitter<SessionUpdateRequestEvent>
}

export default TurboModuleRegistry.getEnforcing<Spec>('InappRnSdk');
