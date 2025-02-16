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
(const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeInappRnSdkSpecJSI>(params);
}

Api *api = [[Api alloc] init];

- (void)ping:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject {
  
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

- (void)setOverrides:(JS::NativeInappRnSdk::ProviderInformation &)provider featureOptions:(JS::NativeInappRnSdk::FeatureOptions &)featureOptions logConsumer:(JS::NativeInappRnSdk::LogConsumer &)logConsumer sessionManagement:(JS::NativeInappRnSdk::SessionManagement &)sessionManagement appInfo:(JS::NativeInappRnSdk::ReclaimAppInfo &)appInfo resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject {
  reject(@"UNIMPLEMENTED", @"Method unimplemented", nil);
}

- (void)startVerification:(JS::NativeInappRnSdk::Request &)request resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject {
  NSLog(@"starting verification");
  bool hideLanding = true;
  if (request.hideLanding().has_value()) {
    hideLanding = request.hideLanding().value();
  }
  bool autoSubmit = false;
  if (request.autoSubmit().has_value()) {
    autoSubmit = request.autoSubmit().value();
  }
  bool acceptAiProviders = false;
  if (request.acceptAiProviders().has_value()) {
    acceptAiProviders = request.acceptAiProviders().value();
  }
  NSLog(@"starting verification now");
  [api startVerificationWithAppId:request.appId() secret:request.secret() providerId:request.providerId() sessionTimeestamp:request.session().value().timestamp() sessionSessionId:request.session().value().sessionId() sessionSignature:request.session().value().signature() context:request.contextString() parameters:(NSDictionary<NSString *, NSString *> *)request.parameters() hideLanding:hideLanding autoSubmit:autoSubmit acceptAiProviders:acceptAiProviders webhookUrl:request.webhookUrl() completionHandler:^(NSDictionary<NSString *,id> * _Nullable result, NSError * _Nullable error) {
    if (error) {
      NSLog(@"Api Error: %@", error);
      
      NSString *message = [NSString stringWithFormat:@"code: %ld, userInfo: %@, domain: %@, name: %@", static_cast<long>(error.code), error.userInfo, error.domain, NSStringFromClass([error class])];
      reject(@"VERIFICATION", @"Verification Error", error);
    } else {
      resolve(result);
    }
  }];
}

- (void)startVerificationFromUrl:(nonnull NSString *)requestUrl resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject {
  reject(@"UNIMPLEMENTED", @"Method unimplemented", nil);
}

@end
