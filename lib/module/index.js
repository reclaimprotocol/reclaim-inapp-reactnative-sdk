"use strict";

import { ReclaimVerificationPlatformChannel } from "./ReclaimVerificationPlatformChannel.js";
export { ReclaimVerificationPlatformChannel, ReclaimVerificationApi } from "./ReclaimVerificationPlatformChannel.js";
export class ReclaimVerification {
  static defaultChannel = null;
  constructor(channel) {
    if (channel) {
      this.channel = channel;
    } else {
      if (ReclaimVerification.defaultChannel == null) {
        ReclaimVerification.defaultChannel = new ReclaimVerificationPlatformChannel();
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
    this.channel.setOverrides(overrides);
  }
}
//# sourceMappingURL=index.js.map