import type { TurboModule, CodegenTypes } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

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
   * If not provided, the appId will be fetched from:
   * - the `AndroidManifest.xml` metadata along with secret on android:
   * 
   * ```xml
   * <meta-data android:name="org.reclaimprotocol.inapp_sdk.APP_ID"
   *            android:value="YOUR_RECLAIM_APP_ID" />
   * ```
   * 
   * - the `ReclaimInAppSDKParam.ReclaimAppId` in Info.plist along with secret on iOS:
   * 
   * ```xml
   * <key>ReclaimInAppSDKParam</key>
   * <dict>
   *    <key>ReclaimAppId</key>
   *    <string>YOUR_RECLAIM_APP_ID</string>
   *    <key>ReclaimAppSecret</key>
   *    <string>YOUR_RECLAIM_APP_SECRET</string>
   * </dict>
   * ```
   */
  appId: string;

  /**
   * The Reclaim application secret for the verification process.
   * If not provided, the secret will be fetched from:
   * - the `AndroidManifest.xml` metadata along with appId on android:
   * 
   * ```xml
   * <meta-data android:name="org.reclaimprotocol.inapp_sdk.APP_SECRET"
   *            android:value="YOUR_RECLAIM_APP_SECRET" />
   * ```
   * 
   * - the `ReclaimInAppSDKParam.ReclaimAppSecret` in Info.plist along with appId on iOS:
   * 
   * ```xml
   * <key>ReclaimInAppSDKParam</key>
   * <dict>
   *    <key>ReclaimAppId</key>
   *    <string>YOUR_RECLAIM_APP_ID</string>
   *    <key>ReclaimAppSecret</key>
   *    <string>YOUR_RECLAIM_APP_SECRET</string>
   * </dict>
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
   * The version of the provider to use in verification
   */
  providerVersion?: ProviderVersion | null; // Optional
}

export interface ProviderVersion {
  resolvedVersion: string;
  versionExpression: string;
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
}

export interface ProviderInformation {
  url?: string;
  jsonString?: string;
  canFetchProviderInformationFromHost: boolean;
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
   * Whether AI flow is enabled.
   * Optional, defaults to null.
   * 
   * @deprecated Removed.
   */
  isAIFlowEnabled?: boolean | null;

  /**
   * Message to display when the user submitting a verification session for manual review.
   * Optional, defaults to null.
   */
  manualReviewMessage?: string | null;

  /**
   * Message to display when the user is logging in.
   */
  loginPromptMessage?: string | null;
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

/// Identification information of a session.
export interface ReclaimSessionIdentityUpdate {
  /// The application id.
  appId: string;

  /// The provider id.
  providerId: string;

  /// The session id.
  sessionId: string;
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
   * The session timestamp for the verification attempt
   */
  timestamp: string;
  /**
   * The session signature for the verification attempt
   */
  signature: string;
  /**
   * The provider version for the verification attempt
   */
  providerVersion: string;
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
   * session update metadata as JSON string
   */
  metadata: string;
  /**
   * internal
   */
  readonly replyId: string;
}

export interface Overrides {
  provider?: ProviderInformation | null,
  featureOptions?: FeatureOptions | null,
  logConsumer?: LogConsumer | null,
  sessionManagement?: SessionManagement | null,
  appInfo?: ReclaimAppInfo | null,
  capabilityAccessToken?: string | null;
}

export interface ProviderInformationRequest {
  appId: string;
  providerId: string;
  sessionId: string;
  signature: string;
  timestamp: string;
  resolvedVersion: string;
  /**
   * internal
   */
  readonly replyId: string;
}

export interface VerificationOptions {
  canDeleteCookiesBeforeVerificationStarts: boolean;
  canUseAttestorAuthenticationRequest: boolean;

  /**
   * The type of claim creation to use. Defaults to 'standalone'.
   */
  claimCreationType: 'standalone' | 'meChain';

  /**
   * Whether to automatically submit the proof after generation. Defaults to true.
   */
  canAutoSubmit: boolean;

  /**
   * Whether the close button is visible. Defaults to true.
   */
  isCloseButtonVisible: boolean;
}

export interface VerificationOptionsOptional {
  options?: VerificationOptions | null;
}

export interface SetConsoleLoggingOptions {
  enabled: boolean
}

export interface ReclaimAttestorAuthRequest {
  reclaimHttpProviderJsonString: string;
  /**
   * internal
   */
  readonly replyId: string;
}

export interface Spec extends TurboModule {
  startVerification(request: Request): Promise<Response>;
  startVerificationFromUrl(requestUrl: string): Promise<Response>;
  startVerificationFromJson(templateJsonString: string): Promise<Response>;
  setOverrides(overrides: Overrides): Promise<void>;
  clearAllOverrides(): Promise<void>;
  setVerificationOptions(args: VerificationOptionsOptional): Promise<void>;
  setConsoleLogging(args: SetConsoleLoggingOptions): Promise<void>;
  reply(replyId: string, reply: boolean): void;
  replyWithString(replyId: string, value: string): void;
  startEventSubscription(event: string): void;
  removeEventSubscription(event: string): void;
  ping(): Promise<boolean>;

  readonly onLogs: CodegenTypes.EventEmitter<string>
  readonly onSessionLogs: CodegenTypes.EventEmitter<SessionLogEvent>
  readonly onSessionCreateRequest: CodegenTypes.EventEmitter<SessionCreateRequestEvent>
  readonly onSessionUpdateRequest: CodegenTypes.EventEmitter<SessionUpdateRequestEvent>
  readonly onProviderInformationRequest: CodegenTypes.EventEmitter<ProviderInformationRequest>
  readonly onReclaimAttestorAuthRequest: CodegenTypes.EventEmitter<ReclaimAttestorAuthRequest>
  // unimplemented
  readonly onSessionIdentityUpdate: CodegenTypes.EventEmitter<ReclaimSessionIdentityUpdate>
}

export default TurboModuleRegistry.getEnforcing<Spec>('InappRnSdk');
