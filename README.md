# Reclaim InApp React Native SDK

## @reclaimprotocol/inapp-rn-sdk

[![Reclaim React Native SDK](https://img.shields.io/github/v/tag/reclaimprotocol/reclaim-inapp-reactnative-sdk.svg)](https://github.com/reclaimprotocol/reclaim-inapp-reactnative-sdk)
[![Documentation](https://img.shields.io/badge/read_the-docs-blue.svg)](https://docs.reclaimprotocol.org/inapp-sdks/react-native)
[![NPM Version](https://img.shields.io/npm/v/%40reclaimprotocol%2Finapp-rn-sdk.svg)](https://www.npmjs.com/package/@reclaimprotocol/inapp-rn-sdk)

This SDK allows you to integrate Reclaim's in-app verification process into your React Native application.

[Refer Reclaim Protocol's official documentation for React Native SDK](https://docs.reclaimprotocol.org/inapp-sdks/react-native)

## Prerequisites

- A [Reclaim account](https://dev.reclaimprotocol.org/explore) where you've created an app and have the app id, app secret.
- A provider id that you've added to your app in [Reclaim Devtools](https://dev.reclaimprotocol.org/explore).

## Example

- See the [Reclaim Example - React Native](samples/example_new_arch/README.md) for a complete example of how to use the SDK in a React Native application.

## Installation

```sh
npm install @reclaimprotocol/inapp-rn-sdk
```

### Alternative: Install from git source

#### NPM

```sh
npm install git+https://github.com/reclaimprotocol/reclaim-inapp-reactnative-sdk.git
```

#### Yarn

```sh
yarn add git+https://github.com/reclaimprotocol/reclaim-inapp-reactnative-sdk.git
```

## Setup

### Android Setup

Add the following to your `android/app/src/main/AndroidManifest.xml` file under the `<application>` tag:

```xml
      <activity
        android:name="org.reclaimprotocol.inapp_sdk.ReclaimActivity"
        android:theme="@style/Theme.ReclaimInAppSdk.LaunchTheme"
        android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
        android:hardwareAccelerated="true"
        android:windowSoftInputMode="adjustResize"
        />
```

add the following to the end of settings.gradle:

```groovy
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)
    String flutterStorageUrl = System.env.FLUTTER_STORAGE_BASE_URL ?: "https://storage.googleapis.com"
    String reclaimStorageUrl = System.env.RECLAIM_STORAGE_BASE_URL ?: "https://reclaim-inapp-sdk.s3.ap-south-1.amazonaws.com/android/repo"
    repositories {
        google()
        mavenCentral()
        maven {
            url "$reclaimStorageUrl"
        }
        maven {
            url "$flutterStorageUrl/download.flutter.io"
        }
    }
}
```

(Ignore if already added in settings.gradle from above)
or alternatively add the following repositories to the relevant repositories block:

```groovy
String flutterStorageUrl = System.env.FLUTTER_STORAGE_BASE_URL ?: "https://storage.googleapis.com"
String reclaimStorageUrl = System.env.RECLAIM_STORAGE_BASE_URL ?: "https://reclaim-inapp-sdk.s3.ap-south-1.amazonaws.com/android/repo"
maven {
    url "$reclaimStorageUrl"
}
maven {
    url "$flutterStorageUrl/download.flutter.io"
}
```

Some projects may require you to add the repositories to the root `build.gradle` file or your app-level `build.gradle` file's allprojects section.

### iOS Setup

1. Make sure to define a global platform for your project in your `Podfile` with version 13.0 or higher.

```
platform :ios, '13.0' # or platform :ios, min_ios_version_supported
```

Ignore if you already have this declaration in your `Podfile`.

2. Add the following to your `Podfile` to override SDK dependency:

- You can override the version of dependency when you wish to use a specific version of the SDK.
- You can add a declaration in your `Podfile` to install the SDK from cocoapods, or from a specific git tag, head, commit, or branch.

##### From cocoapods (recommended)

```ruby
# Cocoapods is the recommended way to install the SDK.
pod 'ReclaimInAppSdk', '~> 0.9.0'
```

##### From a specific tag

```ruby
pod 'ReclaimInAppSdk', :git => 'https://github.com/reclaimprotocol/reclaim-inapp-ios-sdk.git', :tag => '0.9.0'
```

##### From git HEAD

```ruby
pod 'ReclaimInAppSdk', :git => 'https://github.com/reclaimprotocol/reclaim-inapp-ios-sdk.git'
```

##### From a specific commit

```ruby
pod 'ReclaimInAppSdk', :git => 'https://github.com/reclaimprotocol/reclaim-inapp-ios-sdk.git', :commit => 'eeb5a5484a5927217065e5c988fab8201cb2db2e'
```

##### From a specific branch

```ruby
pod 'ReclaimInAppSdk', :git => 'https://github.com/reclaimprotocol/reclaim-inapp-ios-sdk.git', :branch => 'main'
```

- After adding the dependency, your podfile may look like this:

```ruby
platform :ios, '13.0'

# ... some podfile content (removed for brevity)

target 'InappRnSdkExample' do
  config = use_native_modules!

  use_react_native!(
    :path => config[:reactNativePath],
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )

  # This is the line that you may need to add in your podfile.
  pod 'ReclaimInAppSdk', '~> 0.9.0'

  pre_install do |installer|
    system("cd ../../ && npx bob build --target codegen")
  end

  # ... rest of the podfile. (removed for brevity)
```

3. Run `pod install` inside the `ios/` directory of your project.

```sh
cd ios/
pod install
```

#### Fixing performance issues on IOS physical devices

Your app performance will be severely impacted when you run debug executable on a physical device. Fixing this requires a simple change in your Xcode project xcscheme.

##### Method 1: Update Environment Variables for XCScheme (Recommended) 
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

##### Method 2: Disable "Debug executable"

This method is **not recommended** but could be useful if you don't want to add environment variables to the xcscheme.

1. Open your iOS project (*.xcworkspace) in Xcode.
2. Click on the project target.
3. Click on the **Scheme** dropdown.

<img src="https://github.com/reclaimprotocol/reclaim-inapp-ios-sdk/blob/83f23570a47828d011b713679852053acdba89c1/Screenshots/Install/10.png?raw=true" alt="Edit current xcscheme in Xcode" width="500">

4. Click on the **Edit Scheme** button.
5. Click on the **Run** tab.
6. Uncheck the **Debug executable** checkbox.

<img src="https://github.com/reclaimprotocol/reclaim-inapp-ios-sdk/blob/83f23570a47828d011b713679852053acdba89c1/Screenshots/Install/11.png?raw=true" alt="Enable Debug executable in Xcode" width="500">

## Usage

To use Reclaim InApp Sdk in your project, follow these steps:

1. Import the `@reclaimprotocol/inapp-rn-sdk` package in your project file.

```js
import { ReclaimVerification } from '@reclaimprotocol/inapp-rn-sdk';
```

2. Initialize the `ReclaimVerification` class to create an instance.

```js
const reclaimVerification = new ReclaimVerification();
```

3. Start the verification flow by providing the app id, secret and provider id.

```js
const verificationResult = await reclaimVerification.startVerification({
    appId: config.REACT_APP_RECLAIM_APP_ID ?? '',
    secret: config.REACT_APP_RECLAIM_APP_SECRET ?? '',
    providerId: providerId,
});
```

The returned result is a [ReclaimVerification.Response] object. This object contains a response that has proofs, exception, and the sessionId if the verification is successful.

### Exception Handling

If the verification ends with an exception, the exception is thrown as a [ReclaimVerification.ReclaimVerificationException] object.

Following is an example of how to handle the exception using [error.type]:

```js
try {
  // ... start verification
} catch (error) {
  if (error instanceof ReclaimVerification.ReclaimVerificationException) {
    switch (error.type) {
      case ReclaimVerification.ExceptionType.Cancelled:
        Snackbar.show({
          text: 'Verification cancelled',
          duration: Snackbar.LENGTH_LONG,
        });
        break;
      case ReclaimVerification.ExceptionType.Dismissed:
        Snackbar.show({
          text: 'Verification dismissed',
          duration: Snackbar.LENGTH_LONG,
        });
        break;
      case ReclaimVerification.ExceptionType.SessionExpired:
        Snackbar.show({
          text: 'Verification session expired',
          duration: Snackbar.LENGTH_LONG,
        });
        break;
      case ReclaimVerification.ExceptionType.Failed:
      default:
        Snackbar.show({
          text: 'Verification failed',
          duration: Snackbar.LENGTH_LONG,
        });
    }
  } else {
    Snackbar.show({
      text: error instanceof Error ? error.message : 'An unknown verification error occurred',
      duration: Snackbar.LENGTH_LONG,
    });
  }
}
```

This error also contains `sessionId`, `reason`, and `innerError` that can be used to get more details about the occurred error.

```js
error.sessionId
error.reason
error.innerError
```

## Troubleshooting

### Build failures for iOS in 0.7.x

- An accidental breaking change may cause 0.7.0, 0.7.1, 0.7.2 to fail with build failures for Android and iOS. Update 0.7.3 fixes this issue.

## Migration

- Migration steps for [0.9.0](https://github.com/reclaimprotocol/reclaim-inapp-reactnative-sdk/blob/main/documentation/migration.md#090)
- Migration steps for [0.8.3](https://github.com/reclaimprotocol/reclaim-inapp-reactnative-sdk/blob/main/documentation/migration.md#083)
- Migration steps for [0.7.3](https://github.com/reclaimprotocol/reclaim-inapp-reactnative-sdk/blob/main/documentation/migration.md#073)
- Migration steps for [0.6.0](https://github.com/reclaimprotocol/reclaim-inapp-reactnative-sdk/blob/main/documentation/migration.md#060)
- Migration steps for [0.3.1](https://github.com/reclaimprotocol/reclaim-inapp-reactnative-sdk/blob/main/documentation/migration.md#031)
- Migration steps for [0.3.0](https://github.com/reclaimprotocol/reclaim-inapp-reactnative-sdk/blob/main/documentation/migration.md#030)
- Migration steps for [0.2.1](https://github.com/reclaimprotocol/reclaim-inapp-reactnative-sdk/blob/main/documentation/migration.md#021)

## Advanced Usage

### Overriding SDK Config

```js
// Advanced Usage: Use ReclaimVerification.setOverrides for overriding sdk
reclaimVerification.setOverrides({
  appInfo: {
    appName: "Overriden Example",
    appImageUrl: "https://placehold.co/400x400/png"
  }
  // .. other overrides
})
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
