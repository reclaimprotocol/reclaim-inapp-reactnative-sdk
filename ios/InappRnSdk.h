#import <React/RCTEventEmitter.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "generated/RNInappRnSdkSpec/RNInappRnSdkSpec.h"

NS_ASSUME_NONNULL_BEGIN

@interface InappRnSdk : RCTEventEmitter <NativeInappRnSdkSpec>

NS_ASSUME_NONNULL_END

#else
#import <React/RCTBridgeModule.h>

@interface InappRnSdk : RCTEventEmitter <RCTBridgeModule>
#endif

@property (nonatomic, assign) BOOL isJsListening;

@end
