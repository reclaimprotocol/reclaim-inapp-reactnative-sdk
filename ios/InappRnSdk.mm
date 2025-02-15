#import "InappRnSdk.h"

@implementation InappRnSdk
RCT_EXPORT_MODULE()

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeInappRnSdkSpecJSI>(params);
}

- (void)ping:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
  resolve(@true);
}

- (void)reply:(nonnull NSString *)replyId reply:(BOOL)reply { 
  
}

- (void)setOverrides:(JS::NativeInappRnSdk::ProviderInformation &)provider featureOptions:(JS::NativeInappRnSdk::FeatureOptions &)featureOptions logConsumer:(JS::NativeInappRnSdk::LogConsumer &)logConsumer sessionManagement:(JS::NativeInappRnSdk::SessionManagement &)sessionManagement appInfo:(JS::NativeInappRnSdk::ReclaimAppInfo &)appInfo resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
  reject(@"UNIMPLEMENTED", @"Method unimplemented", nil);
}

- (void)startVerification:(JS::NativeInappRnSdk::Request &)request resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
  reject(@"UNIMPLEMENTED", @"Method unimplemented", nil);
}

- (void)startVerificationFromUrl:(nonnull NSString *)requestUrl resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
  reject(@"UNIMPLEMENTED", @"Method unimplemented", nil);
}

@end
