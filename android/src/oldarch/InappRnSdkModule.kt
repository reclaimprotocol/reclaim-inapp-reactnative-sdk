package com.reclaimprotocol.inapp_rn_sdk

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = InappRnSdkModule.NAME)
class InappRnSdkModule(private val reactContext: ReactApplicationContext) :
  BaseNativeEventEmittingModule(reactContext) {
  private var delegate = InappRnSdkModuleDelegate(reactContext, this)

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
    return delegate.setVerificationOptions(args, promise)
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

  @ReactMethod()
  fun addListener(eventName: String) {}

  @ReactMethod()
  fun removeListeners(count: Double) {}
}
