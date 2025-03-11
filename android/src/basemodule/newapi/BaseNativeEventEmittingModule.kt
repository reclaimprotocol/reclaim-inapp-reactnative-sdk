package com.reclaimprotocol.inapp_rn_sdk

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap

abstract class BaseNativeEventEmittingModule(private val reactContext: ReactApplicationContext) :
  NativeInappRnSdkSpec(reactContext), EventEmittingDelegate {

  override fun sendEvent(eventName: String, params: ReadableMap?) {
    mEventEmitterCallback?.invoke(eventName, params);
  }
  override fun sendEvent(eventName: String, params: String?) {
    mEventEmitterCallback?.invoke(eventName, params);
  }
}

