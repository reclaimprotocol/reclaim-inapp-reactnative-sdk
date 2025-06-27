# Reclaim InApp SDK

This guide explains how to install and set up the Reclaim InApp SDK for React Native projects that don't use a framework like Expo.

## Prerequisites

- A [Reclaim account](https://dev.reclaimprotocol.org/explore) where you've created an app and have the app id, app secret.
- A provider id that you've added to your app in [Reclaim Devtools](https://dev.reclaimprotocol.org/explore).

## Example

- See the [Reclaim Example - React Native](https://github.com/reclaimprotocol/reclaim-inapp-reactnative-sdk/tree/main/samples/example_new_arch) for a complete example of how to use the SDK in a React Native application.

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

2. Run `pod install` inside the `ios/` directory of your project.

```sh
cd ios/
pod install
```

#### Fixing performance issues on IOS physical devices

Your app performance will be severely impacted when you run debug executable on a physical device. Fixing this requires a simple change in your Xcode project xcscheme.

##### Update Environment Variables for XCScheme (Recommended) 
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

Now your React Native project is ready to use the Reclaim InApp SDK. You can follow the [usage documentation](https://github.com/reclaimprotocol/reclaim-inapp-reactnative-sdk/blob/main/README.md#usage) to learn how to integrate the SDK into your application.

### Advanced iOS Setup

#### Overriding SDK dependency in `Podfile` (Optional):

- You can override the version of dependency when you wish to use a specific version of the SDK.
- You can add a declaration in your `Podfile` to install the SDK from cocoapods, or from a specific git tag, head, commit, or branch.

##### From cocoapods (recommended)

```ruby
# Cocoapods is the recommended way to install the SDK.
pod 'ReclaimInAppSdk', '~> 0.9.2'
```

##### From a specific tag

```ruby
pod 'ReclaimInAppSdk', :git => 'https://github.com/reclaimprotocol/reclaim-inapp-ios-sdk.git', :tag => '0.9.2'
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
  pod 'ReclaimInAppSdk', '~> 0.9.2'

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
