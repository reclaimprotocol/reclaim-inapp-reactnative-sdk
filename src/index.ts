import { type ReclaimVerificationApi, ReclaimVerificationPlatformChannel, ReclaimVerificationPlatformChannelImpl } from './ReclaimVerificationPlatformChannel';
export { ReclaimVerificationPlatformChannel, ReclaimVerificationApi, ReclaimVerificationPlatformChannelImpl } from './ReclaimVerificationPlatformChannel';
export type { ReclaimVerificationApi as ReclaimVerificationApiType, ReclaimResult } from './ReclaimVerificationPlatformChannel';

export class ReclaimVerification {
  public channel: ReclaimVerificationPlatformChannel;

  private static defaultChannel: ReclaimVerificationPlatformChannel | null = null;

  public constructor(channel?: ReclaimVerificationPlatformChannel) {
    if (channel) {
      this.channel = channel;
    } else {
      if (ReclaimVerification.defaultChannel == null) {
        ReclaimVerification.defaultChannel = new ReclaimVerificationPlatformChannelImpl();
      }
      this.channel = ReclaimVerification.defaultChannel;
    }
  }

  public async startVerification(request: ReclaimVerificationApi.Request): Promise<ReclaimVerificationApi.Response> {
    return this.channel.startVerification(request);
  }

  public async ping(): Promise<boolean> {
    return this.channel.ping();
  }

  public setOverrides(overrides: ReclaimVerificationApi.OverrideConfig) {
    return this.channel.setOverrides(overrides);
  }

  public clearAllOverrides() {
    return this.channel.clearAllOverrides();
  }
}