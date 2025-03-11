package com.reclaimprotocol.inapp_rn_sdk

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.proguard.annotations.DoNotStrip

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
  @DoNotStrip()
  fun startVerification(request: ReadableMap?, promise: Promise?) {
    return delegate.startVerification(request, promise)
  }

  @ReactMethod()
  @DoNotStrip()
  fun startVerificationFromUrl(requestUrl: String?, promise: Promise?) {
    return delegate.startVerificationFromUrl(requestUrl, promise)
  }

  @ReactMethod()
  @DoNotStrip()
  fun setOverrides(overrides: ReadableMap?, promise: Promise?) {
    return delegate.setOverrides(overrides, promise)
  }

  @ReactMethod()
  @DoNotStrip()
  fun clearAllOverrides(promise: Promise?) {
    return delegate.clearAllOverrides(promise)
  }

  @ReactMethod()
  @DoNotStrip()
  fun setVerificationOptions(args: ReadableMap?, promise: Promise?) {
    return delegate.setVerificationOptions(args, promise)
  }

  @ReactMethod()
  @DoNotStrip()
  fun reply(replyId: String?, reply: Boolean) {
    return delegate.reply(replyId, reply)
  }

  @ReactMethod()
  @DoNotStrip()
  fun replyWithString(replyId: String?, value: String?) {
    return delegate.replyWithString(replyId, value)
  }

  @ReactMethod()
  @DoNotStrip()
  fun ping(promise: Promise?) {
    return delegate.ping(promise)
  }

  @ReactMethod()
  @DoNotStrip()
  fun addListener(eventName: String?) {}

  @ReactMethod()
  @DoNotStrip()
  fun removeListeners(count: Double) {}
}
