package com.reclaimprotocol.inapp_rn_sdk

import com.facebook.react.bridge.ReadableMap

public abstract class EventEmittingModule(
  private val delegate: EventEmittingDelegate,
) {
  protected final fun emitOnLogs(value: String) {
    delegate.sendEvent("onLogs", value);
  }

  protected final fun emitOnSessionLogs(value: ReadableMap) {
    delegate.sendEvent("onSessionLogs", value);
  }

  protected final fun emitOnSessionCreateRequest(value: ReadableMap) {
    delegate.sendEvent("onSessionCreateRequest", value);
  }

  protected final fun emitOnSessionUpdateRequest(value: ReadableMap) {
    delegate.sendEvent("onSessionUpdateRequest", value);
  }

  protected final fun emitOnProviderInformationRequest(value: ReadableMap) {
    delegate.sendEvent("onProviderInformationRequest", value);
  }

  protected final fun emitOnReclaimAttestorAuthRequest(value: ReadableMap) {
    delegate.sendEvent("onReclaimAttestorAuthRequest", value);
  }

  protected final fun emitOnSessionIdentityUpdate(value: ReadableMap) {
    delegate.sendEvent("onSessionIdentityUpdate", value);
  }
}
