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
  NSLog(@"[InappRnSdk] starting verification");
  
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
              if (![key isKindOfClass:[NSString class]] || ![tempDictionary[key] isKindOfClass:[NSString class]]) {
                  allStrings = NO;
                  break;
              }
          }
          if (allStrings){
              // should always be the case
              parameters = (NSDictionary<NSString *, NSString *> *)potentialParameters;
          } else {
              NSLog(@"[InappRnSdk] request.parameters() contains non string key or value");
          }
      } else {
          NSLog(@"[InappRnSdk] request.parameters() is not a dictionary.");
      }
  }

  NSLog(@"[InappRnSdk] starting verification now");
  [api startVerificationWithAppId:request.appId() secret:request.secret() providerId:request.providerId() sessionTimestamp:timestamp sessionSessionId:sessionId sessionSignature:signature context:request.contextString() parameters:parameters hideLanding:hideLanding autoSubmit:autoSubmit acceptAiProviders:acceptAiProviders webhookUrl:request.webhookUrl() completionHandler:^(NSDictionary<NSString *,id> * _Nullable result, NSError * _Nullable error) {
    if (error != nil) {
      NSLog(@"[InappRnSdk] Api Error: %@", error);
      reject(@"VERIFICATION_ERROR", @"Verification Error", error);
    } else {
      resolve(result);
    }
  }];
}

- (void)startVerificationFromUrl:(nonnull NSString *)requestUrl resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject {
  NSLog(@"[InappRnSdk] starting verification");
  
  NSLog(@"[InappRnSdk] starting verification now");
  [api startVerificationFromUrlWithUrl:requestUrl completionHandler:^(NSDictionary<NSString *,id> * _Nullable result, NSError * _Nullable error) {
    if (error != nil) {
      NSLog(@"[InappRnSdk] Api Error: %@", error);
      reject(@"VERIFICATION_ERROR", @"Verification Error", error);
    } else {
      resolve(result);
    }
  }];
}

@end
