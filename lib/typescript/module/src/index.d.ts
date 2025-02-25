import { ReclaimVerificationPlatformChannel, type ReclaimVerificationApi } from './ReclaimVerificationPlatformChannel';
export { ReclaimVerificationPlatformChannel, ReclaimVerificationApi } from './ReclaimVerificationPlatformChannel';
export type { ReclaimVerificationApi as ReclaimVerificationApiType, ReclaimResult } from './ReclaimVerificationPlatformChannel';
export declare class ReclaimVerification {
    channel: ReclaimVerificationPlatformChannel;
    private static defaultChannel;
    constructor(channel?: ReclaimVerificationPlatformChannel);
    startVerification(request: ReclaimVerificationApi.Request): Promise<ReclaimVerificationApi.Response>;
    ping(): Promise<boolean>;
    setOverrides(overrides: ReclaimVerificationApi.OverrideConfig): void;
}
//# sourceMappingURL=index.d.ts.map