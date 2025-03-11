package com.reclaimprotocol.inapp_rn_sdk

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.bridge.ReactContextBaseJavaModule

abstract class BaseNativeEventEmittingModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), EventEmittingDelegate {
  override fun sendEvent(eventName: String, params: ReadableMap?) {
    // mEventEmitterCallback api not available before 0.76
    // mEventEmitterCallback?.invoke(eventName, params);
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, params)
  }

  override fun sendEvent(eventName: String, params: String?) {
    // mEventEmitterCallback api not available before 0.76
    // mEventEmitterCallback?.invoke(eventName, params);
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, params)
  }
}
