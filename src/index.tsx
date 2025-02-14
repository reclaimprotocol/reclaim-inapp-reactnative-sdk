import { ReclaimVerificationPlatformChannel, type ReclaimVerificationApi } from './ReclaimVerificationPlatformChannel';
export { ReclaimVerificationPlatformChannel, type ReclaimVerificationApi } from './ReclaimVerificationPlatformChannel';

export class ReclaimVerification {
  public channel: ReclaimVerificationPlatformChannel;

  private static defaultChannel: ReclaimVerificationPlatformChannel | null = null;

  public constructor(channel?: ReclaimVerificationPlatformChannel) {
    if (channel) {
      this.channel = channel;
    } else {
      if (ReclaimVerification.defaultChannel == null) {
        ReclaimVerification.defaultChannel = new ReclaimVerificationPlatformChannel();
      }
      this.channel = ReclaimVerification.defaultChannel;
    }
  }

  public async startVerification(request: ReclaimVerificationApi.Request): Promise<ReclaimVerificationApi.Response> {
    console.info('startVerification', request);
    return this.channel.startVerification(request);
  }

  public async ping(): Promise<boolean> {
    console.info('ping');
    return this.channel.ping();
  }

  public setOverrides(overrides: ReclaimVerificationApi.OverrideConfig) {
    this.channel.setOverrides(overrides);
  }
}