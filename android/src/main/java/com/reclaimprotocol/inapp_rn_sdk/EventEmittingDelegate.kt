package com.reclaimprotocol.inapp_rn_sdk

import com.facebook.react.bridge.ReadableMap

public interface EventEmittingDelegate {
  fun sendEvent(eventName: String, params: ReadableMap?)
  fun sendEvent(eventName: String, params: String?)
}
