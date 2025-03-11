package com.reclaimprotocol.inapp_rn_sdk

import com.facebook.react.bridge.BaseJavaModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.modules.core.DeviceEventManagerModule

public abstract class EventEmittingModule(private val reactContext: ReactApplicationContext): BaseJavaModule(reactContext) {
  protected final fun emitOnLogs(value: String) {
    mEventEmitterCallback?.invoke("onLogs", value);
  }

  protected final fun emitOnSessionLogs(value: ReadableMap) {
    mEventEmitterCallback?.invoke("onSessionLogs", value);
  }

  protected final fun emitOnSessionCreateRequest(value: ReadableMap) {
    mEventEmitterCallback?.invoke("onSessionCreateRequest", value);
  }

  protected final fun emitOnSessionUpdateRequest(value: ReadableMap) {
    mEventEmitterCallback?.invoke("onSessionUpdateRequest", value);
  }

  protected final fun emitOnProviderInformationRequest(value: ReadableMap) {
    mEventEmitterCallback?.invoke("onProviderInformationRequest", value);
  }

  protected final fun emitOnReclaimAttestorAuthRequest(value: ReadableMap) {
    mEventEmitterCallback?.invoke("onReclaimAttestorAuthRequest", value);
  }

  protected final fun emitOnSessionIdentityUpdate(value: ReadableMap) {
    mEventEmitterCallback?.invoke("onSessionIdentityUpdate", value);
  }

//  private fun sendEvent(eventName: String, params: WritableMap?) {
//    reactContext
//      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
//      .emit(eventName.name, params)
//  }
}
