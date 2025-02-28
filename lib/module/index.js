"use strict";

import { ReclaimVerificationPlatformChannelImpl } from "./ReclaimVerificationPlatformChannel.js";
export { ReclaimVerificationPlatformChannel, ReclaimVerificationApi, ReclaimVerificationPlatformChannelImpl } from "./ReclaimVerificationPlatformChannel.js";
export class ReclaimVerification {
  static defaultChannel = null;
  constructor(channel) {
    if (channel) {
      this.channel = channel;
    } else {
      if (ReclaimVerification.defaultChannel == null) {
        ReclaimVerification.defaultChannel = new ReclaimVerificationPlatformChannelImpl();
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
//# sourceMappingURL=index.js.map