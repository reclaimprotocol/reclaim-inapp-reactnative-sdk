package com.reclaimprotocol.inapp_rn_sdk

import java.util.UUID
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import org.reclaimprotocol.inapp_sdk.ReclaimOverrides
import org.reclaimprotocol.inapp_sdk.ReclaimSessionStatus
import org.reclaimprotocol.inapp_sdk.ReclaimVerification

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
      promise?.reject(exception)
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
      ReclaimVerification.startVerification(
        context = reactContext.applicationContext, request = ReclaimVerification.Request(
          appId = request.getString("appId")!!,
          secret = request.getString("secret")!!,
          providerId = request.getString("providerId")!!,
        ), handler = handler
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

  private val replyHandlers: MutableMap<String, (Result<Boolean>) -> Unit> = mutableMapOf()

  override fun setOverrides(
    provider: ReadableMap?,
    featureOptions: ReadableMap?,
    logConsumer: ReadableMap?,
    sessionManagement: ReadableMap?,
    appInfo: ReadableMap?,
    promise: Promise?
  ) {
    reactContext.runOnUiQueueThread {
      ReclaimVerification.setOverrides(
        context = reactContext.applicationContext,
        provider = if (provider == null) null else (if (provider.isNull("url")) ReclaimOverrides.ProviderInformation.FromJsonString(
          requireString(
            provider, "jsonString"
          )
        )
        else ReclaimOverrides.ProviderInformation.FromUrl(requireString(provider, "url"))),
        featureOptions = if (featureOptions == null) null else ReclaimOverrides.FeatureOptions(
          cookiePersist = getBoolean(featureOptions, "cookiePersist"),
          singleReclaimRequest = getBoolean(featureOptions, "singleReclaimRequest"),
          idleTimeThresholdForManualVerificationTrigger = getLong(
            featureOptions, "idleTimeThresholdForManualVerificationTrigger"
          ),
          sessionTimeoutForManualVerificationTrigger = getLong(
            featureOptions, "sessionTimeoutForManualVerificationTrigger"
          ),
          attestorBrowserRpcUrl = getString(featureOptions, "attestorBrowserRpcUrl"),
          isResponseRedactionRegexEscapingEnabled = getBoolean(
            featureOptions, "isResponseRedactionRegexEscapingEnabled"
          ),
          isAIFlowEnabled = getBoolean(featureOptions, "isAIFlowEnabled")
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
            sessionId: String,
            callback: (Result<Boolean>) -> Unit
          ) {
            val args = Arguments.createMap()
            args.putString("appId", appId)
            args.putString("providerId", providerId)
            args.putString("sessionId", sessionId)
            val replyId = UUID.randomUUID().toString()
            args.putString("replyId", replyId)
            replyHandlers[replyId] = callback
            emitOnSessionCreateRequest(args)
          }

          override fun logSession(
            appId: String, providerId: String, sessionId: String, logType: String
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
      ) { result ->
        result.onSuccess {
            promise?.resolve(true)
          }.onFailure { error ->
            promise?.reject(error)
          }
      }
    }
  }

  override fun reply(replyId: String?, reply: Boolean) {
    if (replyId == null) {
      Log.w(NAME, "Missing arg replyId")
      return;
    }
    reactContext.runOnUiQueueThread {
      val callback = replyHandlers[replyId]
      if (callback != null) {
        callback(Result.success(reply))
      } else {
        Log.w(NAME, "Missing reply handler for id: $replyId")
      }
    }
  }

  private fun requireString(map: ReadableMap, key: String): String {
    val value = getString(map, key)
    if (value == null) {
      Log.w(NAME, "Missing value for key: $key")
      return ""
    }
    return value
  }

  private fun getLong(map: ReadableMap, key: String): Long? {
    return if (!map.hasKey(key) || map.isNull(key)) {
      null
    } else {
      map.getLong(key)
    }
  }

  private fun getString(map: ReadableMap, key: String): String? {
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
