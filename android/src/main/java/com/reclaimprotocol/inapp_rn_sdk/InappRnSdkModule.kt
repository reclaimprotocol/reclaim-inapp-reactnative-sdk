package com.reclaimprotocol.inapp_rn_sdk

import android.util.JsonReader
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import org.json.JSONObject
import org.reclaimprotocol.inapp_sdk.ReclaimOverrides
import org.reclaimprotocol.inapp_sdk.ReclaimSessionStatus
import org.reclaimprotocol.inapp_sdk.ReclaimVerification
import org.reclaimprotocol.inapp_sdk.ReclaimVerification.Request.ProviderVersion
import java.util.UUID

@ReactModule(name = InappRnSdkModule.NAME)
class InappRnSdkModule(private val reactContext: ReactApplicationContext) :
  NativeInappRnSdkSpec(reactContext) {

  override fun getName(): String {
    return NAME
  }

  companion object {
    const val NAME = "InappRnSdk"
  }

  class ReclaimVerificationResultHandlerImpl(val promise: Promise?) :
    ReclaimVerification.ResultHandler {
    override fun onException(exception: ReclaimVerification.ReclaimVerificationException) {
      Log.e(NAME, "reclaim exception", exception)
      val userInfoMap = Arguments.createMap()
      val errorType = when (exception) {
        is ReclaimVerification.ReclaimVerificationException.Cancelled -> "cancelled"
        is ReclaimVerification.ReclaimVerificationException.Dismissed -> "dismissed"
        is ReclaimVerification.ReclaimVerificationException.Failed -> "failed"
        is ReclaimVerification.ReclaimVerificationException.SessionExpired -> "sessionExpired"
      }
      userInfoMap.putString("errorType", errorType)
      userInfoMap.putString("sessionId", exception.sessionId)
      userInfoMap.putBoolean("didSubmitManualVerification", exception.didSubmitManualVerification)
      userInfoMap.putString(
        "reason",
        if (exception is ReclaimVerification.ReclaimVerificationException.Failed) exception.reason else null
      )
      promise?.reject("VERIFICATION_ERROR", "Verification Error", exception, userInfoMap)
    }

    override fun onResponse(response: ReclaimVerification.Response) {
      Log.d(NAME, "reclaim response")
      val returnResponse: WritableMap = Arguments.createMap()
      returnResponse.putString("sessionId", response.sessionId)
      returnResponse.putBoolean("didSubmitManualVerification", response.didSubmitManualVerification)
      val returnProofs: WritableArray = Arguments.createArray()
      for (proof in response.proofs) {
        val returnProof = Arguments.makeNativeMap(proof)
        returnProofs.pushMap(returnProof)
      }
      returnResponse.putArray("proofs", returnProofs)
      promise?.resolve(returnResponse)
    }
  }

  override fun startVerification(request: ReadableMap?, promise: Promise?) {
    Log.d(NAME, "startVerification")
    if (request == null) {
      Log.d(NAME, "no request. rejecting.")

      promise?.reject(IllegalArgumentException("Request is null"))
      return
    }
    val handler = ReclaimVerificationResultHandlerImpl(promise)
    reactContext.runOnUiQueueThread {
      val appId = getString(request, "appId")
      val secret = getString(request, "secret")
      val verificationRequest: ReclaimVerification.Request
      val session = request.getMap("session")
      val parametersRN = request.getMap("parameters")?.toHashMap()
      val parameters = mutableMapOf<String, String>()
      if (parametersRN != null) {
        for (key in parametersRN.keys) {
          val value = parametersRN[key]
          if (value is String) {
            parameters[key] = value
          }
        }
      }
      val providerVersion = request.getMap("providerVersion").let { providerVersion ->
        ProviderVersion(
          resolvedVersion = getString(providerVersion, "resolvedVersion") ?: "",
          versionExpression = getString(providerVersion, "versionExpression") ?: ""
        )
      }
      if (appId.isNullOrBlank() && secret.isNullOrBlank()) {
        verificationRequest = ReclaimVerification.Request.fromManifestMetaData(
          context = reactContext.applicationContext,
          providerId = getString(request, "providerId")!!,
          contextString = getString(request, "contextString") ?: "",
          session = if (session == null) null else ReclaimVerification.ReclaimSessionInformation(
            timestamp = getString(session, "timestamp") ?: "",
            sessionId = getString(session, "sessionId") ?: "",
            signature = getString(session, "signature") ?: "",
          ),
          parameters = parameters,
          providerVersion = providerVersion,
        )
      } else {
        verificationRequest = ReclaimVerification.Request(
          appId = appId!!,
          secret = secret!!,
          providerId = getString(request, "providerId")!!,
          contextString = getString(request, "contextString") ?: "",
          session = if (session == null) null else ReclaimVerification.ReclaimSessionInformation(
            timestamp = getString(session, "timestamp") ?: "",
            sessionId = getString(session, "sessionId") ?: "",
            signature = getString(session, "signature") ?: "",
          ),
          parameters = parameters,
          providerVersion = providerVersion,
        )
      }
      ReclaimVerification.startVerification(
        context = reactContext.applicationContext, request = verificationRequest, handler = handler
      )
    }
  }

  override fun startVerificationFromUrl(requestUrl: String?, promise: Promise?) {
    Log.d(NAME, "startVerificationFromUrl")
    if (requestUrl == null) {
      Log.d(NAME, "no request url. rejecting.")

      promise?.reject(IllegalArgumentException("Request url is null"))
      return
    }
    val handler = ReclaimVerificationResultHandlerImpl(promise)
    reactContext.runOnUiQueueThread {
      ReclaimVerification.startVerificationFromUrl(
        context = reactContext.applicationContext, requestUrl = requestUrl, handler = handler
      )
    }
  }

  override fun startVerificationFromJson(templateJsonString: String, promise: Promise?) {
    Log.d(NAME, "startVerificationFromJson")
    val templateJson = HashMap<Any?, Any?>()
    JSONObject(templateJsonString).toMap().forEach { (key, value) ->
      templateJson[key] = value
    }
    val handler = ReclaimVerificationResultHandlerImpl(promise)
    reactContext.runOnUiQueueThread {
      ReclaimVerification.startVerificationFromJson(
        context = reactContext.applicationContext, template = templateJson, handler = handler
      )
    }
  }

  override fun setOverrides(overrides: ReadableMap?, promise: Promise?) {
    return setOverrides(
      provider = getMap(overrides, "provider"),
      featureOptions = getMap(overrides, "featureOptions"),
      logConsumer = getMap(overrides, "logConsumer"),
      sessionManagement = getMap(overrides, "sessionManagement"),
      appInfo = getMap(overrides, "appInfo"),
      capabilityAccessToken = getString(overrides, "capabilityAccessToken"),
      promise,
    )
  }

  override fun clearAllOverrides(promise: Promise?) {
    reactContext.runOnUiQueueThread {
      ReclaimVerification.clearAllOverrides(
        context = reactContext.applicationContext,
      ) { result ->
        result.onSuccess {
          promise?.resolve(null)
        }.onFailure { error ->
          onPlatformException(promise, error)
        }
      }
    }
  }

  override fun setVerificationOptions(args: ReadableMap?, promise: Promise?) {
    val inputOptions = getMap(args, "options")
    var options:  ReclaimVerification.VerificationOptions? = null
    if (inputOptions != null) {
      val canUseAttestorAuthRequestProvider = getBoolean(inputOptions, "canUseAttestorAuthenticationRequest") == true;
      val claimCreationType: ReclaimVerification.VerificationOptions.ClaimCreationType = when (getString(inputOptions, "claimCreationType")) {
        "meChain" -> ReclaimVerification.VerificationOptions.ClaimCreationType.ME_CHAIN
          else  -> ReclaimVerification.VerificationOptions.ClaimCreationType.STANDALONE

      }
      val canAutoSubmit = getBoolean(inputOptions, "canAutoSubmit") ?: true
      val isCloseButtonVisible = getBoolean(inputOptions, "isCloseButtonVisible") ?: true
      options = ReclaimVerification.VerificationOptions(
        canDeleteCookiesBeforeVerificationStarts = getBoolean(inputOptions, "canDeleteCookiesBeforeVerificationStarts") ?: true,
        attestorAuthRequestProvider = if (canUseAttestorAuthRequestProvider) {
          object : ReclaimVerification.VerificationOptions.AttestorAuthRequestProvider {
            override fun fetchAttestorAuthenticationRequest(
              reclaimHttpProvider: Map<Any?, Any?>,
              callback: (Result<String>) -> Unit
            ) {
              val args = Arguments.createMap()
              args.putString("reclaimHttpProviderJsonString", JSONObject(reclaimHttpProvider).toString())
              val replyId = UUID.randomUUID().toString()
              args.putString("replyId", replyId)
              replyWithString[replyId] = callback
              emitOnReclaimAttestorAuthRequest(args)
            }
          }
        } else {
          null
        },
        claimCreationType = claimCreationType,
        canAutoSubmit = canAutoSubmit,
        isCloseButtonVisible = isCloseButtonVisible
      )
    }
    reactContext.runOnUiQueueThread {
      ReclaimVerification.setVerificationOptions(
        context = reactContext.applicationContext,
        options = options
      ) { result ->
        result.onSuccess {
          promise?.resolve(null)
        }.onFailure { error ->
          onPlatformException(promise, error)
        }
      }
    }
  }

  private fun setOverrides(
    provider: ReadableMap?,
    featureOptions: ReadableMap?,
    logConsumer: ReadableMap?,
    sessionManagement: ReadableMap?,
    appInfo: ReadableMap?,
    capabilityAccessToken: String?,
    promise: Promise?
  ) {
    reactContext.runOnUiQueueThread {
      ReclaimVerification.setOverrides(
        context = reactContext.applicationContext,
        provider = if (provider == null) null else (
          if (hasValue(provider, "jsonString"))
            ReclaimOverrides.ProviderInformation.FromJsonString(
              requireString(
                provider, "jsonString"
              )
            )
          else if (hasValue(provider, "url"))
            ReclaimOverrides.ProviderInformation.FromUrl(
              requireString(
                provider, "url"
              )
            )
          else if (getBoolean(provider, "canFetchProviderInformationFromHost") == true)
            ReclaimOverrides.ProviderInformation.FromCallback(object : ReclaimOverrides.ProviderInformation.FromCallback.Handler {
              override fun fetchProviderInformation(
                appId: String,
                providerId: String,
                sessionId: String,
                signature: String,
                timestamp: String,
                resolvedVersion: String,
                callback: (Result<String>) -> Unit
              ) {
                val args = Arguments.createMap()
                args.putString("appId", appId)
                args.putString("providerId", providerId)
                args.putString("sessionId", sessionId)
                args.putString("signature", signature)
                args.putString("timestamp", timestamp)
                args.putString("resolvedVersion", resolvedVersion)
                val replyId = UUID.randomUUID().toString()
                args.putString("replyId", replyId)
                replyWithString[replyId] = callback
                emitOnProviderInformationRequest(args)
              }
            })
          else
            (throw IllegalStateException("Invalid provider information. canFetchProviderInformationFromHost was not true and jsonString, url were also not provided."))
        ),
        featureOptions = if (featureOptions == null) null else ReclaimOverrides.FeatureOptions(
          cookiePersist = getBoolean(featureOptions, "cookiePersist"),
          singleReclaimRequest = getBoolean(featureOptions, "singleReclaimRequest"),
          idleTimeThresholdForManualVerificationTrigger = getNumber(
            featureOptions, "idleTimeThresholdForManualVerificationTrigger"
          )?.toLong(),
          sessionTimeoutForManualVerificationTrigger = getNumber(
            featureOptions, "sessionTimeoutForManualVerificationTrigger"
          )?.toLong(),
          attestorBrowserRpcUrl = getString(featureOptions, "attestorBrowserRpcUrl"),
          isAIFlowEnabled = getBoolean(featureOptions, "isAIFlowEnabled"),
          manualReviewMessage = getString(featureOptions, "manualReviewMessage"),
          loginPromptMessage = getString(featureOptions, "loginPromptMessage")
        ),
        logConsumer = if (logConsumer == null) null else ReclaimOverrides.LogConsumer(
          logHandler = if (getBoolean(logConsumer, "enableLogHandler") != true) null else object :
            ReclaimOverrides.LogConsumer.LogHandler {
            override fun onLogs(logJsonString: String) {
              emitOnLogs(logJsonString)
            }
          },
          canSdkCollectTelemetry = getBoolean(logConsumer, "canSdkCollectTelemetry") ?: true,
          canSdkPrintLogs = getBoolean(logConsumer, "canSdkPrintLogs")
        ),
        sessionManagement = if (sessionManagement == null || getBoolean(
            sessionManagement, "enableSdkSessionManagement"
          ) != false
        ) null else ReclaimOverrides.SessionManagement(handler = object :
          ReclaimOverrides.SessionManagement.SessionHandler {
          override fun createSession(
            appId: String,
            providerId: String,
            timestamp: String,
            signature: String,
            providerVersion: String,
            callback: (Result<ReclaimOverrides.SessionManagement.InitResponse>) -> Unit
          ) {
            val args = Arguments.createMap()
            args.putString("appId", appId)
            args.putString("providerId", providerId)
            args.putString("timestamp", timestamp)
            args.putString("signature", signature)
            args.putString("providerVersion", providerVersion)
            val replyId = UUID.randomUUID().toString()
            args.putString("replyId", replyId)
            replyWithString[replyId] = { it ->
              callback(it.fold(
                onSuccess = { value ->
                  val value = JSONObject(value)
                  Result.success(ReclaimOverrides.SessionManagement.InitResponse(
                    sessionId = value.getString("sessionId"),
                    resolvedProviderVersion = value.getString("resolvedProviderVersion")
                  ))
                },
                onFailure = { error ->
                  Result.failure(error)
                }
              ))
            }
            emitOnSessionCreateRequest(args)
          }

          override fun logSession(
            appId: String, providerId: String, sessionId: String, logType: String, metadata: Map<String, Any?>?
          ) {
            val args = Arguments.createMap()
            args.putString("appId", appId)
            args.putString("providerId", providerId)
            args.putString("sessionId", sessionId)
            args.putString("logType", logType)
            emitOnSessionLogs(args)
          }

          override fun updateSession(
            sessionId: String, status: ReclaimSessionStatus, callback: (Result<Boolean>) -> Unit
          ) {
            status.name
            val args = Arguments.createMap()
            args.putString("sessionId", sessionId)
            args.putString("status", status.name)
            val replyId = UUID.randomUUID().toString()
            args.putString("replyId", replyId)
            replyHandlers[replyId] = callback
            emitOnSessionUpdateRequest(args)
          }
        }),
        appInfo = if (appInfo == null) null else ReclaimOverrides.ReclaimAppInfo(
          appName = requireString(appInfo, "appName"),
          appImageUrl = requireString(appInfo, "appImageUrl"),
          isRecurring = getBoolean(appInfo, "isRecurring") ?: false,
        ),
        capabilityAccessToken = capabilityAccessToken
      ) { result ->
        result.onSuccess {
          try {
            Log.d(NAME, "(setOverrides) Success")
            promise?.resolve(null)
          } catch (e: Throwable) {
            Log.e(NAME, "(setOverrides) Error resolving promise")
          }

        }.onFailure { error ->
          try {
            Log.d(NAME, "(setOverrides) Failure")
            onPlatformException(promise, error)
          } catch (e: Throwable) {
            Log.e(NAME, "(setOverrides) Error rejecting promise", e)
          }
        }
      }
    }
  }

  private val replyHandlers: MutableMap<String, (Result<Boolean>) -> Unit> = mutableMapOf()
  override fun reply(replyId: String?, reply: Boolean) {
    if (replyId == null) {
      Log.w(NAME, "(reply) Missing arg replyId")
      return
    }
    reactContext.runOnUiQueueThread {
      val callback = replyHandlers[replyId]
      if (callback != null) {
        callback(Result.success(reply))
      } else {
        Log.w(NAME, "(reply) Missing reply handler for id: $replyId")
      }
    }
  }

  private val replyWithString: MutableMap<String, (Result<String>) -> Unit> =
    mutableMapOf()

  override fun replyWithString(replyId: String?, value: String?) {
    if (replyId == null) {
      Log.w(NAME, "(replyWithString) Missing arg replyId")
      return
    }
    reactContext.runOnUiQueueThread {
      val callback = replyWithString[replyId]
      if (callback != null) {
        callback(Result.success(value ?: ""))
      } else {
        Log.w(NAME, "(replyWithString) Missing reply handler for id: $replyId")
      }
    }
  }

  private fun onPlatformException(promise: Promise?, exception: Throwable) {
    if (exception is ReclaimVerification.ReclaimPlatformException) {
      val userInfoMap = Arguments.createMap()
      userInfoMap.putString("message", exception.internalErrorMessage)
      userInfoMap.putString("errorCode", exception.errorCode)
      promise?.reject("PLATFORM_ERROR", exception.message, exception, userInfoMap)
    } else {
      promise?.reject("PLATFORM_ERROR", "Unexpected Error", exception)
    }
  }

  @Suppress("SameParameterValue")
  private fun hasValue(map: ReadableMap, key: String): Boolean {
    return map.hasKey(key) && !map.isNull(key)
  }

  private fun requireString(map: ReadableMap, key: String): String {
    val value = getString(map, key)
    if (value == null) {
      Log.w(NAME, "Missing value for key: $key")
      return ""
    }
    return value
  }

  private fun getMap(map: ReadableMap?, key: String): ReadableMap? {
    return if (map == null || !map.hasKey(key) || map.isNull(key)) {
      null
    } else {
      map.getMap(key)
    }
  }

  private fun getNumber(map: ReadableMap, key: String): Number? {
    if (!map.hasKey(key) || map.isNull(key)) {
      return null
    }
    val value = map.toHashMap()[key]
    if (value is Number) {
      return value
    }
    throw TypeCastException("Value for key $key is not a Number")
  }

  private fun getString(map: ReadableMap?, key: String): String? {
    if (map == null) return null
    return if (!map.hasKey(key) || map.isNull(key)) {
      null
    } else {
      map.getString(key)
    }
  }

  private fun getBoolean(map: ReadableMap, key: String): Boolean? {
    return if (!map.hasKey(key) || map.isNull(key)) {
      null
    } else {
      map.getBoolean(key)
    }
  }

  override fun ping(promise: Promise?) {
    Log.d(NAME, "startVerification")
    fun submitPing() {
      promise?.resolve(true)
    }
    reactContext.runOnUiQueueThread {
      submitPing()
    }
  }
}
