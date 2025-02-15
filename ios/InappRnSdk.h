#ifdef RCT_NEW_ARCH_ENABLED
#import "generated/RNInappRnSdkSpec/RNInappRnSdkSpec.h"

NS_ASSUME_NONNULL_BEGIN

@interface InappRnSdk : NSObject <NativeInappRnSdkSpec>

NS_ASSUME_NONNULL_END

#else
#import <React/RCTBridgeModule.h>

@interface InappRnSdk : NSObject <RCTBridgeModule>
#endif


@end
