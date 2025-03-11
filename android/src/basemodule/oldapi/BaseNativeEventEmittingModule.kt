package com.reclaimprotocol.inapp_rn_sdk

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.proguard.annotations.DoNotStrip;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.turbomodule.core.interfaces.TurboModule;

abstract class BaseNativeEventEmittingModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), EventEmittingDelegate, TurboModule {
  override fun sendEvent(eventName: String, params: ReadableMap?) {
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, params)
  }

  override fun sendEvent(eventName: String, params: String?) {
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, params)
  }

  @ReactMethod()
  @DoNotStrip()
  abstract fun startVerification(request: ReadableMap?, promise: Promise?)

  @ReactMethod()
  @DoNotStrip()
  abstract fun startVerificationFromUrl(requestUrl: String?, promise: Promise?)

  @ReactMethod()
  @DoNotStrip()
  abstract fun setOverrides(overrides: ReadableMap?, promise: Promise?)

  @ReactMethod()
  @DoNotStrip()
  abstract fun clearAllOverrides(promise: Promise?)

  @ReactMethod()
  @DoNotStrip()
  abstract fun setVerificationOptions(args: ReadableMap?, promise: Promise?)

  @ReactMethod()
  @DoNotStrip()
  abstract fun reply(replyId: String?, reply: Boolean)

  @ReactMethod()
  @DoNotStrip()
  abstract fun replyWithString(replyId: String?, value: String?)

  @ReactMethod()
  @DoNotStrip()
  abstract fun ping(promise: Promise?)

  @ReactMethod()
  @DoNotStrip()
  abstract fun addListener(eventName: String?)

  @ReactMethod()
  @DoNotStrip()
  abstract fun removeListeners(count: Double)
}
