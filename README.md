# Reclaim InApp React Native SDK

## @reclaimprotocol/inapp-rn-sdk

This SDK allows you to integrate Reclaim's in-app verification process into your React Native application.

## Prerequisites

- A [Reclaim account](https://dev.reclaimprotocol.org/explore) where you've created an app and have the app id, app secret.
- A provider id that you've added to your app in [Reclaim Devtools](https://dev.reclaimprotocol.org/explore).

## Example

- See the [Reclaim Example - React Native](example/README.md) for a complete example of how to use the SDK in a React Native application.

## Installation

```sh
npm install @reclaimprotocol/inapp-rn-sdk
```

Note: This package is not published to npm registry. Will be published soon. For now, you can install it from git source.

### Install from git source (alternative)

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
    String reclaimStorageUrl = System.env.RECLAIM_STORAGE_BASE_URL ?: "https://reclaim-inapp-sdk.s3.ap-south-1.amazonaws.com/android/0.1.2/repo"
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
String reclaimStorageUrl = System.env.RECLAIM_STORAGE_BASE_URL ?: "https://reclaim-inapp-sdk.s3.ap-south-1.amazonaws.com/android/0.1.2/repo"
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
platform :ios, '13.0'
```
2. Add the following to your `Podfile`:

- From a specific tag (recommended):

```ruby
pod 'ReclaimInAppSdk', :git => 'https://github.com/reclaimprotocol/reclaim-inapp-ios-sdk.git', :tag => '0.1.2'
```

- or from git HEAD (Alternative):

```ruby
pod 'ReclaimInAppSdk', :git => 'https://github.com/reclaimprotocol/reclaim-inapp-ios-sdk.git'
```

- or from a specific commit (Alternative):

```ruby
pod 'ReclaimInAppSdk', :git => 'https://github.com/reclaimprotocol/reclaim-inapp-ios-sdk.git', :commit => '184d41628026768feb703dc7bb9a3d913c6b271e'
```

- or from a specific branch (Alternative):

```ruby
pod 'ReclaimInAppSdk', :git => 'https://github.com/reclaimprotocol/reclaim-inapp-ios-sdk.git', :branch => 'main'
```

2. After adding the dependency, your podfile may look like this:

```ruby
platform :ios, '13.0'

# ... some podfile content (removed for brevity)

target 'InappRnSdkExample' do
  config = use_native_modules!

  use_react_native!(
    :path => config[:reactNativePath],
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )

  # This is the line you need to add to your podfile.
  pod 'ReclaimInAppSdk', :git => 'https://github.com/reclaimprotocol/reclaim-inapp-ios-sdk.git', :tag => '0.1.2'

  pre_install do |installer|
    system("cd ../../ && npx bob build --target codegen")
  end

  # ... rest of the podfile. (removed for brevity)
```

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

The returned result is a [ReclaimVerificationApi.Response] object. This object contains a response that has proofs, exception, and the sessionId if the verification is successful.

### Exception Handling

If the verification ends with an exception, the exception is thrown as a [ReclaimVerificationApi.ReclaimVerificationException] object.

Following is an example of how to handle the exception using [error.type]:

```js
try {
  // ... start verification
} catch (error) {
  if (error instanceof ReclaimVerificationApi.ReclaimVerificationException) {
    switch (error.type) {
      case ReclaimVerificationApi.ExceptionType.Cancelled:
        Snackbar.show({
          text: 'Verification cancelled',
          duration: Snackbar.LENGTH_LONG,
        });
        break;
      case ReclaimVerificationApi.ExceptionType.Dismissed:
        Snackbar.show({
          text: 'Verification dismissed',
          duration: Snackbar.LENGTH_LONG,
        });
        break;
      case ReclaimVerificationApi.ExceptionType.SessionExpired:
        Snackbar.show({
          text: 'Verification session expired',
          duration: Snackbar.LENGTH_LONG,
        });
        break;
      case ReclaimVerificationApi.ExceptionType.Failed:
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

This exception also contains the inner error that can be used to get more details about the occurred exception.

```js
error.innerError
```

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

Note: Overriding again will clear previous overrides

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
