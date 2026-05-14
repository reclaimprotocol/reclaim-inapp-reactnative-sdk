import { ReclaimVerification } from '../index';

jest.mock('../NativeInappRnSdk', () => {
  const noopSubscription = () => ({ remove: jest.fn() });
  return {
    __esModule: true,
    default: {
      startVerification: jest.fn().mockResolvedValue({
        sessionId: '',
        didSubmitManualVerification: false,
        proofs: [],
      }),
      startVerificationFromUrl: jest.fn().mockResolvedValue({
        sessionId: '',
        didSubmitManualVerification: false,
        proofs: [],
      }),
      startVerificationFromJson: jest.fn().mockResolvedValue({
        sessionId: '',
        didSubmitManualVerification: false,
        proofs: [],
      }),
      setOverrides: jest.fn().mockResolvedValue(undefined),
      clearAllOverrides: jest.fn().mockResolvedValue(undefined),
      setVerificationOptions: jest.fn().mockResolvedValue(undefined),
      setConsoleLogging: jest.fn().mockResolvedValue(undefined),
      reply: jest.fn(),
      replyWithString: jest.fn(),
      startEventSubscription: jest.fn(),
      removeEventSubscription: jest.fn(),
      ping: jest.fn().mockResolvedValue(true),
      onLogs: jest.fn(noopSubscription),
      onSessionLogs: jest.fn(noopSubscription),
      onSessionCreateRequest: jest.fn(noopSubscription),
      onSessionUpdateRequest: jest.fn(noopSubscription),
      onProviderInformationRequest: jest.fn(noopSubscription),
      onReclaimAttestorAuthRequest: jest.fn(noopSubscription),
      onSessionIdentityUpdate: jest.fn(noopSubscription),
    },
  };
});

class MockPlatform extends ReclaimVerification.Platform {
  startVerificationCount = 0;
  startVerificationFromUrlCount = 0;
  startVerificationFromJsonCount = 0;

  async startVerification(
    _request: ReclaimVerification.Request
  ): Promise<ReclaimVerification.Response> {
    this.startVerificationCount++;
    return {
      sessionId: 'mock',
      didSubmitManualVerification: false,
      proofs: [],
    };
  }
  async startVerificationFromUrl(
    _url: string
  ): Promise<ReclaimVerification.Response> {
    this.startVerificationFromUrlCount++;
    return {
      sessionId: 'mock',
      didSubmitManualVerification: false,
      proofs: [],
    };
  }
  async startVerificationFromJson(
    _template: Record<string, any>
  ): Promise<ReclaimVerification.Response> {
    this.startVerificationFromJsonCount++;
    return {
      sessionId: 'mock',
      didSubmitManualVerification: false,
      proofs: [],
    };
  }
  async ping(): Promise<boolean> {
    return true;
  }
  async setOverrides(
    _config: ReclaimVerification.OverrideConfig
  ): Promise<void> {}
  async clearAllOverrides(): Promise<void> {}
  async setVerificationOptions(
    _options?: ReclaimVerification.VerificationOptions | null
  ): Promise<void> {}
  parseLog(_log: string): ReclaimVerification.LogEntry {
    return {} as ReclaimVerification.LogEntry;
  }
  async setConsoleLogging(): Promise<void> {}
  addEventListener<T extends keyof ReclaimVerification.EventListener.EventMap>(
    _type: T,
    _listener: ReclaimVerification.EventListener.EventListener<T>
  ): ReclaimVerification.EventListener.CancelEventSubscription {
    return () => {};
  }
}

const sampleRequest: ReclaimVerification.Request = {
  appId: 'app',
  secret: 'secret',
  providerId: 'provider',
};

const fullOverrides: ReclaimVerification.OverrideConfig = {
  provider: { url: 'https://example.com' },
  featureOptions: {},
  logConsumer: {},
  sessionManagement: {
    onLog: () => {},
    onSessionCreateRequest: async () => ({
      sessionId: 'id',
      resolvedProviderVersion: 'v',
    }),
    onSessionUpdateRequest: async () => true,
  },
  appInfo: { appName: 'Test', appImageUrl: '' },
  capabilityAccessToken: null,
};

const fullVerificationOptions: ReclaimVerification.VerificationOptions = {
  canDeleteCookiesBeforeVerificationStarts: true,
  fetchAttestorAuthenticationRequest: async () => '',
  claimCreationType: 'standalone',
  canAutoSubmit: true,
  isCloseButtonVisible: true,
  locale: null,
  useTeeOperator: null,
};

describe('ReclaimVerification strict config check', () => {
  let platform: MockPlatform;
  let reclaim: ReclaimVerification;

  beforeEach(async () => {
    platform = new MockPlatform();
    reclaim = new ReclaimVerification(platform);
    // Reset shared static state between tests.
    reclaim.setStrictConfigCheck(false);
    await reclaim.clearAllOverrides();
    await reclaim.setVerificationOptions(null);
  });

  describe('when disabled (default)', () => {
    it('startVerification does not throw without prior setOverrides/setVerificationOptions', async () => {
      await expect(
        reclaim.startVerification(sampleRequest)
      ).resolves.toBeDefined();
      expect(platform.startVerificationCount).toBe(1);
    });

    it('startVerificationFromUrl does not throw', async () => {
      await expect(
        reclaim.startVerificationFromUrl('https://x')
      ).resolves.toBeDefined();
      expect(platform.startVerificationFromUrlCount).toBe(1);
    });

    it('startVerificationFromJson does not throw', async () => {
      await expect(
        reclaim.startVerificationFromJson({})
      ).resolves.toBeDefined();
      expect(platform.startVerificationFromJsonCount).toBe(1);
    });
  });

  describe('when enabled', () => {
    beforeEach(() => {
      reclaim.setStrictConfigCheck(true);
    });

    it('throws on startVerification when neither setOverrides nor setVerificationOptions was called', async () => {
      await expect(reclaim.startVerification(sampleRequest)).rejects.toThrow(
        /setOverrides was not called/
      );
      expect(platform.startVerificationCount).toBe(0);
    });

    it('throws on startVerificationFromUrl when nothing has been configured', async () => {
      await expect(
        reclaim.startVerificationFromUrl('https://x')
      ).rejects.toThrow(/setOverrides was not called/);
      expect(platform.startVerificationFromUrlCount).toBe(0);
    });

    it('throws on startVerificationFromJson when nothing has been configured', async () => {
      await expect(reclaim.startVerificationFromJson({})).rejects.toThrow(
        /setOverrides was not called/
      );
      expect(platform.startVerificationFromJsonCount).toBe(0);
    });

    it('lists every missing OverrideConfig field when nothing is set', async () => {
      try {
        await reclaim.startVerification(sampleRequest);
        throw new Error('expected to throw');
      } catch (e: any) {
        expect(e.message).toContain('provider');
        expect(e.message).toContain('featureOptions');
        expect(e.message).toContain('logConsumer');
        expect(e.message).toContain('sessionManagement');
        expect(e.message).toContain('appInfo');
        expect(e.message).toContain('capabilityAccessToken');
      }
    });

    it('lists only the missing OverrideConfig fields when partially set', async () => {
      await reclaim.setOverrides({
        provider: fullOverrides.provider,
        featureOptions: fullOverrides.featureOptions,
        logConsumer: fullOverrides.logConsumer,
      });
      await expect(reclaim.startVerification(sampleRequest)).rejects.toThrow(
        /setOverrides was called without.*sessionManagement.*appInfo.*capabilityAccessToken/s
      );
    });

    it('throws naming missing VerificationOptions when overrides are complete but options are not set', async () => {
      await reclaim.setOverrides(fullOverrides);
      await expect(reclaim.startVerification(sampleRequest)).rejects.toThrow(
        /setVerificationOptions was not called/
      );
    });

    it('lists only the missing VerificationOptions fields when partially set', async () => {
      await reclaim.setOverrides(fullOverrides);
      await reclaim.setVerificationOptions({
        canDeleteCookiesBeforeVerificationStarts: true,
        claimCreationType: 'standalone',
        canAutoSubmit: true,
      } as ReclaimVerification.VerificationOptions);
      await expect(reclaim.startVerification(sampleRequest)).rejects.toThrow(
        /setVerificationOptions was called without.*fetchAttestorAuthenticationRequest.*isCloseButtonVisible.*locale.*useTeeOperator/s
      );
    });

    it('passes through when both setOverrides and setVerificationOptions are fully populated', async () => {
      await reclaim.setOverrides(fullOverrides);
      await reclaim.setVerificationOptions(fullVerificationOptions);
      await expect(
        reclaim.startVerification(sampleRequest)
      ).resolves.toBeDefined();
      await expect(
        reclaim.startVerificationFromUrl('https://x')
      ).resolves.toBeDefined();
      await expect(
        reclaim.startVerificationFromJson({})
      ).resolves.toBeDefined();
      expect(platform.startVerificationCount).toBe(1);
      expect(platform.startVerificationFromUrlCount).toBe(1);
      expect(platform.startVerificationFromJsonCount).toBe(1);
    });

    it('clearAllOverrides invalidates the cached overrides and re-engages the guard', async () => {
      await reclaim.setOverrides(fullOverrides);
      await reclaim.setVerificationOptions(fullVerificationOptions);
      await expect(
        reclaim.startVerification(sampleRequest)
      ).resolves.toBeDefined();

      await reclaim.clearAllOverrides();
      await expect(reclaim.startVerification(sampleRequest)).rejects.toThrow(
        /setOverrides was not called/
      );
    });

    it('setVerificationOptions(null) invalidates cached options', async () => {
      await reclaim.setOverrides(fullOverrides);
      await reclaim.setVerificationOptions(fullVerificationOptions);
      await reclaim.setVerificationOptions(null);
      await expect(reclaim.startVerification(sampleRequest)).rejects.toThrow(
        /setVerificationOptions was not called/
      );
    });

    it('can be disabled again at runtime', async () => {
      reclaim.setStrictConfigCheck(false);
      await expect(
        reclaim.startVerification(sampleRequest)
      ).resolves.toBeDefined();
    });
  });
});
