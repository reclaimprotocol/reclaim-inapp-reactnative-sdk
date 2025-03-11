package com.reclaimprotocol.inapp_rn_sdk

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
import java.util.UUID

@ReactModule(name = InappRnSdkModule.NAME)
class InappRnSdkModule(private val reactContext: ReactApplicationContext) :
  NativeInappRnSdkSpec(reactContext), EventEmittingDelegate {

  override fun sendEvent(eventName: String, params: ReadableMap?) {
    mEventEmitterCallback?.invoke(eventName, params);
  }
  override fun sendEvent(eventName: String, params: String?) {
    mEventEmitterCallback?.invoke(eventName, params);
  }

  private var delegate = InappRnSdkModuleDelegate(reactContext, this)

  override fun getName(): String {
    return NAME
  }

  companion object {
    const val NAME = "InappRnSdk"
  }

  override fun startVerification(request: ReadableMap?, promise: Promise?) {
    return delegate.startVerification(request, promise)
  }

  override fun startVerificationFromUrl(requestUrl: String?, promise: Promise?) {
    return delegate.startVerificationFromUrl(requestUrl, promise)
  }

  override fun setOverrides(overrides: ReadableMap?, promise: Promise?) {
    return delegate.setOverrides(overrides, promise)
  }

  override fun clearAllOverrides(promise: Promise?) {
    return delegate.clearAllOverrides(promise)
  }

  override fun setVerificationOptions(args: ReadableMap?, promise: Promise?) {
    return delegate.setVerificationOptions(args, promise)
  }

  override fun reply(replyId: String?, reply: Boolean) {
    return delegate.reply(replyId, reply)
  }

  override fun replyWithString(replyId: String?, value: String?) {
    return delegate.replyWithString(replyId, value)
  }

  override fun ping(promise: Promise?) {
    return delegate.ping(promise)
  }

  override fun addListener(eventType: String?) {}

  override fun removeListeners(count: Double) {}
}
