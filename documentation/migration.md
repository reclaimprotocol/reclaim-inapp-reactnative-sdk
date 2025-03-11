# Migration

## 0.3.1

- [BREAKING] Exports `ReclaimVerificationApi` & `ReclaimVerificationApiType` have been removed. You can rename any usage of `ReclaimVerificationApi`, or `ReclaimVerificationApiType` to just `ReclaimVerification`.
- This version uses `0.3.0` version of Reclaim's InApp Android, and iOS SDKs. No changes required in native `android/` or `ios/` directory.

## 0.3.0

### Android

#### Update repository URL

- Update the version in `reclaimStorageUrl` to `0.3.0`
- With this change, repositories in your build.gradle or settings.gradle may look like this:

```diff
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)
    String flutterStorageUrl = System.env.FLUTTER_STORAGE_BASE_URL ?: "https://storage.googleapis.com"
-    String reclaimStorageUrl = System.env.RECLAIM_STORAGE_BASE_URL ?: "https://reclaim-inapp-sdk.s3.ap-south-1.amazonaws.com/android/0.2.1/repo"
+    String reclaimStorageUrl = System.env.RECLAIM_STORAGE_BASE_URL ?: "https://reclaim-inapp-sdk.s3.ap-south-1.amazonaws.com/android/0.3.0/repo"
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

- Build your android project again
- Refer: https://github.com/reclaimprotocol/reclaim-inapp-reactnative-sdk/blob/main/README.md#android-setup

### iOS

- Make sure if you are using the latest versions of `ReclaimInAppSdk` cocoapod if you have overriden this dependency in your `Podfile`. Latest version on [cocoapods.org is 0.3.0](https://cocoapods.org/pods/ReclaimInAppSdk).
- Run a `pod install --repo-update`. If this fails for reasons related to the `ReclaimInAppSdk`, try running `pod update ReclaimInAppSdk`.
- Refer: https://github.com/reclaimprotocol/reclaim-inapp-reactnative-sdk/blob/main/README.md#ios-setup

## 0.2.1

- Some overrides now require a valid `capabilityAccessToken`. Provide this when calling the `setOverrides` method.

### Android

#### Update repository URL

- Update the version in `reclaimStorageUrl` to `0.2.1`
- With this change, repositories in your build.gradle or settings.gradle may look like this:

```groovy
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)
    String flutterStorageUrl = System.env.FLUTTER_STORAGE_BASE_URL ?: "https://storage.googleapis.com"
-    String reclaimStorageUrl = System.env.RECLAIM_STORAGE_BASE_URL ?: "https://reclaim-inapp-sdk.s3.ap-south-1.amazonaws.com/android/0.1.2/repo"
+    String reclaimStorageUrl = System.env.RECLAIM_STORAGE_BASE_URL ?: "https://reclaim-inapp-sdk.s3.ap-south-1.amazonaws.com/android/0.2.1/repo"
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

- Build your android project again
- Refer: https://github.com/reclaimprotocol/reclaim-inapp-reactnative-sdk/blob/main/README.md#android-setup

### iOS

- Make sure if you are using the `0.2.0` version of `ReclaimInAppSdk` cocoapod if you have overriden this dependency in your `Podfile`. Latest version on [cocoapods.org is 0.3.0](https://cocoapods.org/pods/ReclaimInAppSdk).
- Run a `pod install --repo-update`. If this fails for reasons related to the `ReclaimInAppSdk`, try running `pod update ReclaimInAppSdk`.
- Refer: https://github.com/reclaimprotocol/reclaim-inapp-reactnative-sdk/blob/main/README.md#ios-setup