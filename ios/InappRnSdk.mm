#import "InappRnSdk.h"

/*
 This condition is needed to support use_frameworks.
 https://github.com/callstack/react-native-builder-bob/discussions/412#discussioncomment-6352402
 */
#if __has_include("InappRnSdk-Swift.h")
#import "InappRnSdk-Swift.h"
#else
#import "InappRnSdk/InappRnSdk-Swift.h"
#endif

@implementation InappRnSdk
RCT_EXPORT_MODULE()

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeInappRnSdkSpecJSI>(params);
}

Api *api = [[Api alloc] init];

- (void)ping:(nonnull RCTPromiseResolveBlock)resolve
      reject:(nonnull RCTPromiseRejectBlock)reject {

  BOOL pingResult = [api ping];
  if (pingResult) {
    resolve(@true);
  } else {
    resolve(@false);
  }
}

- (void)reply:(nonnull NSString *)replyId reply:(BOOL)reply {
  [api replyWithReplyId:replyId reply:reply];
}

- (void)replyWithString:(nonnull NSString *)replyId
                  value:(nonnull NSString *)value {
  [api replyWithStringWithReplyId:replyId value:value];
}

- (void)startVerification:(JS::NativeInappRnSdk::Request &)request
                  resolve:(nonnull RCTPromiseResolveBlock)resolve
                   reject:(nonnull RCTPromiseRejectBlock)reject {
  NSLog(@"[InappRnSdk] starting verification");

  NSMutableDictionary<NSString *, NSString *> *providerVersion =
      [NSMutableDictionary dictionary];
  if (request.providerVersion().has_value()) {
    providerVersion[@"resolvedVersion"] =
        request.providerVersion().value().resolvedVersion();
    providerVersion[@"versionExpression"] =
        request.providerVersion().value().versionExpression();
  }

  NSString *sessionId = nil;
  NSString *timestamp = nil;
  NSString *signature = nil;
  if (request.session().has_value()) {
    sessionId = request.session().value().sessionId();
    timestamp = request.session().value().timestamp();
    signature = request.session().value().signature();
  }

  NSDictionary<NSString *, NSString *> *parameters = @{};
  if (request.parameters() != nil) {
    id potentialParameters = request.parameters();
    if ([potentialParameters isKindOfClass:[NSDictionary class]]) {
      // just verifying because cannot trust JS
      NSDictionary *tempDictionary = (NSDictionary *)potentialParameters;
      BOOL allStrings = YES;
      for (id key in tempDictionary) {
        if (![key isKindOfClass:[NSString class]] ||
            ![tempDictionary[key] isKindOfClass:[NSString class]]) {
          allStrings = NO;
          break;
        }
      }
      if (allStrings) {
        // should always be the case
        parameters =
            (NSDictionary<NSString *, NSString *> *)potentialParameters;
      } else {
        NSLog(@"[InappRnSdk] request.parameters() contains non string key or "
              @"value");
      }
    } else {
      NSLog(@"[InappRnSdk] request.parameters() is not a dictionary.");
    }
  }

  NSLog(@"[InappRnSdk] starting verification now");
  [api startVerificationWithAppId:request.appId()
                           secret:request.secret()
                       providerId:request.providerId()
                 sessionTimestamp:timestamp
                 sessionSessionId:sessionId
                 sessionSignature:signature
                          context:request.contextString()
                       parameters:parameters
                  providerVersion:providerVersion
                completionHandler:^(
                    NSDictionary<NSString *, id> *_Nullable result,
                    NSError *_Nullable error) {
                  if (error != nil) {
                    NSLog(@"[InappRnSdk] Api Error: %@", error);
                    reject(@"VERIFICATION_ERROR", @"Verification Error", error);
                  } else {
                    resolve(result);
                  }
                }];
}

- (void)startVerificationFromUrl:(nonnull NSString *)requestUrl
                         resolve:(nonnull RCTPromiseResolveBlock)resolve
                          reject:(nonnull RCTPromiseRejectBlock)reject {
  NSLog(@"[InappRnSdk] starting verification");

  NSLog(@"[InappRnSdk] starting verification now");
  [api startVerificationFromUrlWithUrl:requestUrl
                     completionHandler:^(
                         NSDictionary<NSString *, id> *_Nullable result,
                         NSError *_Nullable error) {
                       if (error != nil) {
                         NSLog(@"[InappRnSdk] Api Error: %@", error);
                         reject(@"VERIFICATION_ERROR", @"Verification Error",
                                error);
                       } else {
                         resolve(result);
                       }
                     }];
}

- (void)startVerificationFromJson:(nonnull NSString *)templateJsonString resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject {
  NSLog(@"[InappRnSdk] starting verification");

  NSLog(@"[InappRnSdk] starting verification now");
  [api startVerificationFromJsonWithTemplate:templateJsonString
                     completionHandler:^(
                         NSDictionary<NSString *, id> *_Nullable result,
                         NSError *_Nullable error) {
                       if (error != nil) {
                         NSLog(@"[InappRnSdk] Api Error: %@", error);
                         reject(@"VERIFICATION_ERROR", @"Verification Error",
                                error);
                       } else {
                         resolve(result);
                       }
                     }];
}

- (void)setOverrides:(JS::NativeInappRnSdk::Overrides &)overrides
             resolve:(nonnull RCTPromiseResolveBlock)resolve
              reject:(nonnull RCTPromiseRejectBlock)reject {

  OverridenProviderInformation *_Nullable overridenProvider = nil;
  if (overrides.provider().has_value()) {
    JS::NativeInappRnSdk::ProviderInformation provider =
        overrides.provider().value();
    if (provider.url() != nil && provider.url().length > 0) {
      overridenProvider =
          [[OverridenProviderInformation alloc] initWithUrl:provider.url()
                                                 jsonString:nil
                                                   callback:nil];
    } else if (provider.jsonString() != nil &&
               provider.jsonString().length > 0) {
      overridenProvider = [[OverridenProviderInformation alloc]
          initWithUrl:nil
           jsonString:provider.jsonString()
             callback:nil];
    } else if (provider.canFetchProviderInformationFromHost()) {
      OverridenProviderCallbackHandler *callback =
          [[OverridenProviderCallbackHandler alloc]
              initWith_fetchProviderInformation:^(
                  NSString *_Nonnull appId, NSString *_Nonnull providerId,
                  NSString *_Nonnull sessionId, NSString *_Nonnull signature,
                  NSString *_Nonnull timestamp, NSString *_Nonnull resolvedVersion, NSString *_Nonnull replyId) {
                [self emitOnProviderInformationRequest:@{
                  @"appId" : appId,
                  @"providerId" : providerId,
                  @"sessionId" : sessionId,
                  @"signature" : signature,
                  @"timestamp" : timestamp,
                  @"resolvedVersion": resolvedVersion,
                  @"replyId" : replyId
                }];
              }];
      overridenProvider =
          [[OverridenProviderInformation alloc] initWithUrl:nil
                                                 jsonString:nil
                                                   callback:callback];
    }
  }

  OverridenFeatureOptions *_Nullable overridenFeatureOptions = nil;
  if (overrides.featureOptions().has_value()) {
    JS::NativeInappRnSdk::FeatureOptions featureOptions =
        overrides.featureOptions().value();
    overridenFeatureOptions =
        [[OverridenFeatureOptions alloc] initWithCookiePersist:nil
                                          singleReclaimRequest:nil
                 idleTimeThresholdForManualVerificationTrigger:nil
                    sessionTimeoutForManualVerificationTrigger:nil
                                         attestorBrowserRpcUrl:nil
                                               isAIFlowEnabled:nil
                                           manualReviewMessage:nil
                                            loginPromptMessage:nil];

    if (featureOptions.cookiePersist().has_value()) {
      overridenFeatureOptions.cookiePersist =
          [NSNumber numberWithBool:featureOptions.cookiePersist().value()];
    }
    if (featureOptions.singleReclaimRequest().has_value()) {
      overridenFeatureOptions.singleReclaimRequest = [NSNumber
          numberWithBool:featureOptions.singleReclaimRequest().value()];
    }
    if (featureOptions.idleTimeThresholdForManualVerificationTrigger()
            .has_value()) {
      overridenFeatureOptions
          .idleTimeThresholdForManualVerificationTrigger = [NSNumber
          numberWithDouble:featureOptions
                               .idleTimeThresholdForManualVerificationTrigger()
                               .value()];
    }
    if (featureOptions.sessionTimeoutForManualVerificationTrigger()
            .has_value()) {
      overridenFeatureOptions.sessionTimeoutForManualVerificationTrigger =
          [NSNumber
              numberWithDouble:featureOptions
                                   .sessionTimeoutForManualVerificationTrigger()
                                   .value()];
    }
    if (featureOptions.attestorBrowserRpcUrl() != nil &&
        featureOptions.attestorBrowserRpcUrl().length > 0) {
      overridenFeatureOptions.attestorBrowserRpcUrl =
          featureOptions.attestorBrowserRpcUrl();
    }
    if (featureOptions.isAIFlowEnabled().has_value()) {
      overridenFeatureOptions.isAIFlowEnabled =
          [NSNumber numberWithBool:featureOptions.isAIFlowEnabled().value()];
    }
  }

  OverridenLogConsumer *_Nullable overridenLogConsumer = nil;
  if (overrides.logConsumer().has_value()) {
    BOOL canSDKCollectTelemetry = true;
    if (overrides.logConsumer().value().canSdkCollectTelemetry().has_value()) {
      canSDKCollectTelemetry =
          overrides.logConsumer().value().canSdkCollectTelemetry().value();
    }
    NSNumber *_Nullable canSdkPrintLogs = nil;
    if (overrides.logConsumer().value().canSdkPrintLogs().has_value()) {
      canSdkPrintLogs = [NSNumber numberWithBool:overrides.logConsumer()
                                                     .value()
                                                     .canSdkPrintLogs()
                                                     .value()];
    }
    OverridenLogHandler *_Nullable logHandler;
    if (overrides.logConsumer().value().enableLogHandler()) {
      logHandler = [[OverridenLogHandler alloc]
          initOnLogs:^(NSString *_Nonnull logJsonString) {
            [self emitOnLogs:logJsonString];
          }];
    }
    overridenLogConsumer =
        [[OverridenLogConsumer alloc] initWithLogHandler:logHandler
                                  canSdkCollectTelemetry:canSDKCollectTelemetry
                                         canSdkPrintLogs:canSdkPrintLogs];
  }

  OverridenSessionManagement *_Nullable sessionManagement;
  if (overrides.sessionManagement().has_value()) {
    sessionManagement = [[OverridenSessionManagement alloc]
        initWithHandler:[[OverridenSessionHandler alloc]
                            initWith_createSession:^(
                                NSString *_Nonnull appId,
                                NSString *_Nonnull providerId,
                                NSString *_Nonnull timestamp,
                                NSString *_Nonnull signature,
                                NSString *_Nonnull providerVersion,
                                NSString *_Nonnull replyId) {
                              [self emitOnSessionCreateRequest:@{
                                @"appId" : appId,
                                @"providerId" : providerId,
                                @"timestamp" : timestamp,
                                @"signature" : signature,
                                @"providerVersion": providerVersion,
                                @"replyId" : replyId
                              }];
                            }
                            _updateSession:^(NSString *_Nonnull sessionId,
                                             NSString *_Nonnull status,
                                             NSString *_Nonnull replyId) {
                              [self emitOnSessionUpdateRequest:@{
                                @"sessionId" : sessionId,
                                @"status" : status,
                                @"replyId" : replyId
                              }];
                            }
                            _logSession:^(NSString *_Nonnull appId,
                                          NSString *_Nonnull providerId,
                                          NSString *_Nonnull sessionId,
                                          NSString *_Nonnull logType) {
                              [self emitOnSessionLogs:@{
                                @"appId" : appId,
                                @"providerId" : providerId,
                                @"sessionId" : sessionId,
                                @"logType" : logType
                              }];
                            }]];
  }

  OverridenReclaimAppInfo *_Nullable overridenAppInfo = nil;
  if (overrides.appInfo().has_value()) {
    JS::NativeInappRnSdk::ReclaimAppInfo appInfo = overrides.appInfo().value();
    NSNumber *_Nullable isRecurring = nil;
    if (appInfo.isRecurring().has_value()) {
      isRecurring = [NSNumber numberWithBool:appInfo.isRecurring().value()];
    }
    overridenAppInfo =
        [[OverridenReclaimAppInfo alloc] initWithAppName:appInfo.appName()
                                             appImageUrl:appInfo.appImageUrl()
                                             isRecurring:isRecurring];
  }

  NSString *_Nullable capabilityAccessToken = nil;
  if (overrides.capabilityAccessToken() != nil) {
    capabilityAccessToken = overrides.capabilityAccessToken();
  }

  [api setOverridesWithProvider:overridenProvider
                 featureOptions:overridenFeatureOptions
                    logConsumer:overridenLogConsumer
              sessionManagement:sessionManagement
                        appInfo:overridenAppInfo
          capabilityAccessToken:capabilityAccessToken
              completionHandler:^(NSError *_Nullable error) {
                if (error != nil) {
                  reject(@"OVERRIDE_ERROR", @"Error on override", error);
                } else {
                  resolve(nil);
                }
              }];
}

- (void)clearAllOverrides:(nonnull RCTPromiseResolveBlock)resolve
                   reject:(nonnull RCTPromiseRejectBlock)reject {
  [api clearAllOverridesWithCompletionHandler:^(NSError *_Nullable error) {
    if (error != nil) {
      reject(@"OVERRIDE_ERROR", @"Error on clearing overrides", error);
    } else {
      resolve(nil);
    }
  }];
}

- (void)setVerificationOptions:
            (JS::NativeInappRnSdk::VerificationOptionsOptional &)args
                       resolve:(nonnull RCTPromiseResolveBlock)resolve
                        reject:(nonnull RCTPromiseRejectBlock)reject {
  ReclaimApiVerificationOptions *_Nullable options = nil;
  if (args.options().has_value()) {
    JS::NativeInappRnSdk::VerificationOptions inputOptions =
        args.options().value();

    if (inputOptions.canUseAttestorAuthenticationRequest()) {
      options = [[ReclaimApiVerificationOptions alloc]
          initWithCanDeleteCookiesBeforeVerificationStarts:
              inputOptions.canDeleteCookiesBeforeVerificationStarts()
                        fetchAttestorAuthenticationRequest:^(
                            NSString *_Nonnull reclaimHttpProviderJsonString,
                            NSString *_Nonnull replyId) {
                          [self emitOnReclaimAttestorAuthRequest:@{
                            @"reclaimHttpProviderJsonString" :
                                reclaimHttpProviderJsonString,
                            @"replyId" : replyId
                          }];
                        }
                                         claimCreationType:
                                             inputOptions.claimCreationType()
                                             canAutoSubmit:inputOptions
                                                               .canAutoSubmit()
                                      isCloseButtonVisible:
                                          inputOptions.isCloseButtonVisible()];
    } else {
      options = [[ReclaimApiVerificationOptions alloc]
          initWithCanDeleteCookiesBeforeVerificationStarts:
              inputOptions.canDeleteCookiesBeforeVerificationStarts()
                        fetchAttestorAuthenticationRequest:nil
                                         claimCreationType:
                                             inputOptions.claimCreationType()
                                             canAutoSubmit:inputOptions
                                                               .canAutoSubmit()
                                      isCloseButtonVisible:
                                          inputOptions.isCloseButtonVisible()];
    }
  }
  [api setVerificationOptionsWithOptions:options
                       completionHandler:^(NSError *_Nullable error) {
                         if (error != nil) {
                           reject(@"VERIFICATION_OPTIONS_ERROR",
                                  @"Error on setting verification options",
                                  error);
                         } else {
                           resolve(nil);
                         }
                       }];
}

@end
