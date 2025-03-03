# Migration

## 0.2.1

- Some overrides now require a valid `capabilityAccessToken`. Provide this when calling the `setOverrides` method.

### Android

#### Update repository URL

- Update the version in `RECLAIM_STORAGE_BASE_URL` to `0.2.1`
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

- Make sure if you are using the latest versions of `ReclaimInAppSdk` cocoapod if you have overriden this dependency in your `Podfile`. Latest version on [cocoapods.org is 0.2.1](https://cocoapods.org/pods/ReclaimInAppSdk).
- Run a `pod install --repo-update`. If this fails for reasons related to the `ReclaimInAppSdk`, try running `pod update ReclaimInAppSdk`.
- Refer: https://github.com/reclaimprotocol/reclaim-inapp-reactnative-sdk/blob/main/README.md#android-setup