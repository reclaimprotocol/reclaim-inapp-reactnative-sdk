package com.reclaimprotocol.inapp_rn_sdk

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import org.json.JSONObject
import org.reclaimprotocol.inapp_sdk.ReclaimOverrides
import org.reclaimprotocol.inapp_sdk.ReclaimSessionStatus
import org.reclaimprotocol.inapp_sdk.ReclaimVerification
import java.util.UUID

@ReactModule(name = InappRnSdkModule.NAME)
class InappRnSdkModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {
  private var delegate = InappRnSdkModuleDelegate(context)

  override fun getName(): String {
    return NAME
  }

  companion object {
    const val NAME = "InappRnSdk"
  }

  @ReactMethod()
  fun startVerification(request: ReadableMap?, promise: Promise?) {
    return delegate.startVerification(request, promise)
  }

  @ReactMethod()
  fun startVerificationFromUrl(requestUrl: String?, promise: Promise?) {
    return delegate.startVerificationFromUrl(requestUrl, promise)
  }

  @ReactMethod()
  fun setOverrides(overrides: ReadableMap?, promise: Promise?) {
    return delegate.setOverrides(overrides, promise)
  }

  @ReactMethod()
  fun clearAllOverrides(promise: Promise?) {
    return delegate.clearAllOverrides(promise)
  }

  @ReactMethod()
  fun setVerificationOptions(args: ReadableMap?, promise: Promise?) {
    return delegate.setVerificationOptions(promise)
  }

  @ReactMethod()
  fun reply(replyId: String?, reply: Boolean) {
    return delegate.reply(replyId, reply)
  }

  @ReactMethod()
  fun replyWithString(replyId: String?, value: String?) {
    return delegate.replyWithString(replyId, value)
  }

  @ReactMethod()
  fun ping(promise: Promise?) {
    return delegate.ping(promise)
  }
}
