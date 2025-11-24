# Reclaim InApp SDK

This guide explains how to install and set up the Reclaim InApp SDK for React Native **Expo** projects.

## Prerequisites

- A [Reclaim account](https://dev.reclaimprotocol.org/explore) where you've created an app and have the app id, app secret.
- A provider id that you've added to your app in [Reclaim Devtools](https://dev.reclaimprotocol.org/explore).

## Example

- See the [Reclaim Example - React Native Expo](https://github.com/reclaimprotocol/reclaim-inapp-reactnative-sdk/tree/main/samples/example_expo) for a complete example of how to use the SDK in a React Native Expo application.

## Installation

```sh
npx expo install @reclaimprotocol/inapp-rn-sdk
```

## Setup

Expo users can skip the native configuration changes by adding the Reclaim InApp Config Plugin. To do so merge the following code to the plugins section of your `app.json`, `app.config.js`, or `app.config.ts` file:

```diff
{
  // .. other plugin options (removed for brevity)
  "plugins": [
    "expo-router",
    // Add the following in the plugins section:
+   "@reclaimprotocol/inapp-rn-sdk",
    [
      "expo-splash-screen",
      {
        "image": "./assets/images/splash-icon.png",
        "imageWidth": 200,
        "resizeMode": "contain",
        "backgroundColor": "#ffffff"
      }
    ]
    // ... other plugins (removed for brevity)
  ],
  // .. other options (removed for brevity)
}
```

Note: This module contains custom native code which is NOT supported by Expo Go

If you're using Expo without EAS, run the following commands:

```
# For iOS
npx expo prebuild
npx expo run:ios

# For Android
npx expo prebuild
npx expo run:android
```

If you're using Expo with EAS, create a new build:

```
# For online builds
npx eas-cli build --profile development

# For local builds
npx eas-cli build --profile development --local
```

### IOS XCScheme Configuration

Update Environment Variables for XCScheme

1. Open your iOS project (*.xcworkspace) in Xcode.
2. Click on the project target.
3. Click on the **Scheme** dropdown.

<img src="https://github.com/reclaimprotocol/reclaim-inapp-ios-sdk/blob/83f23570a47828d011b713679852053acdba89c1/Screenshots/Install/10.png?raw=true" alt="Edit current xcscheme in Xcode" width="500">

4. Click on the **Edit Scheme** button.
5. Click on the **Run** tab.
6. Click on the **Arguments** tab and check the **Environment Variables** section.

<img src="https://github.com/reclaimprotocol/reclaim-inapp-ios-sdk/blob/83f23570a47828d011b713679852053acdba89c1/Screenshots/Install/12.png?raw=true" alt="Enable Debug executable in Xcode" width="500">

7. Add the following environment variable:
    - Key: `GODEBUG`
    - Value: `asyncpreemptoff=1`
8. Click on the **Close** button in the dialog and build the project.
9. Run the app on a physical device.

Now your React Native Expo project is ready to use the Reclaim InApp SDK. You can follow the [usage documentation](https://github.com/reclaimprotocol/reclaim-inapp-reactnative-sdk/blob/main/README.md#usage) to learn how to integrate the SDK into your application.

## Troubleshooting

### Compatibility Notice: expo-dev-client on iOS

Please be aware of a known incompatibility between ReclaimInAppSdk and the [`expo-dev-client`](https://www.npmjs.com/package/expo-dev-client) package on the iOS platform.

When both packages are present in your iOS application, critical network requests from ReclaimInAppSdk may fail with a request timeout error (i.e `Http failed. Checking if we can retry..\nNSErrorClientException: The request timed out.`).

Our team is investigating this issue to find a solution. In the meantime, we recommend temporarily removing expo-dev-client from your project when you need to test or use ReclaimInAppSdk functionality on iOS.

### Cronet errors on android without play services

On android devices which don't have play services, you may get following errors in Android logs: `java.lang.RuntimeException: All available Cronet providers are disabled. A provider should be enabled before it can be used.`, `Google-Play-Services-Cronet-Provider is unavailable.`. This is because the Reclaim InApp SDK depends on cronet for making http requests.

To fix this, you need to use embedded cronet in your android app by adding the following dependency in your build.gradle dependencies block: 

```gradle
dependencies {
    // ... other dependencies (not shown for brevity)
    // Use embedded cronet
    implementation("org.chromium.net:cronet-embedded:141.7340.3")
}
```

### iOS build issues

Incase you get errors which say `CocoaPods could not find compatible versions for pod "ReclaimInAppSdk"`, run the following in your project's `ios/` directory:

```sh
bundle exec pod update ReclaimInAppSdk
# or
pod update ReclaimInAppSdk
```
