"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReclaimVerification = void 0;
Object.defineProperty(exports, "ReclaimVerificationApi", {
  enumerable: true,
  get: function () {
    return _ReclaimVerificationPlatformChannel.ReclaimVerificationApi;
  }
});
Object.defineProperty(exports, "ReclaimVerificationPlatformChannel", {
  enumerable: true,
  get: function () {
    return _ReclaimVerificationPlatformChannel.ReclaimVerificationPlatformChannel;
  }
});
Object.defineProperty(exports, "ReclaimVerificationPlatformChannelImpl", {
  enumerable: true,
  get: function () {
    return _ReclaimVerificationPlatformChannel.ReclaimVerificationPlatformChannelImpl;
  }
});
var _ReclaimVerificationPlatformChannel = require("./ReclaimVerificationPlatformChannel.js");
class ReclaimVerification {
  static defaultChannel = null;
  constructor(channel) {
    if (channel) {
      this.channel = channel;
    } else {
      if (ReclaimVerification.defaultChannel == null) {
        ReclaimVerification.defaultChannel = new _ReclaimVerificationPlatformChannel.ReclaimVerificationPlatformChannelImpl();
      }
      this.channel = ReclaimVerification.defaultChannel;
    }
  }
  async startVerification(request) {
    return this.channel.startVerification(request);
  }
  async ping() {
    return this.channel.ping();
  }
  setOverrides(overrides) {
    return this.channel.setOverrides(overrides);
  }
  clearAllOverrides() {
    return this.channel.clearAllOverrides();
  }
}
exports.ReclaimVerification = ReclaimVerification;
//# sourceMappingURL=index.js.map