import { type ConfigPlugin, withAndroidManifest } from '@expo/config-plugins';

export const withReclaimAndroidManifest: ConfigPlugin = (config) => {
    return withAndroidManifest(config, (config) => {
        let androidManifest = config.modResults.manifest;
        const cannotInstallMessage = 'cannot install reclaim inapp android sdk';

        if (!androidManifest) {
            throw new Error(`No AndroidManifest found, ${cannotInstallMessage}`);
        }


        let application = androidManifest.application![0];

        // Add the tools to apply permission remove
        // Let the consumer app apply the permission on their app. All permissions are optional for this Reclaim InApp SDK.
        // androidManifest.$ = {
        //   ...androidManifest.$,
        //   'xmlns:tools': 'http://schemas.android.com/tools',
        // };

        if (!application) {
            throw new Error(`No base application found, ${cannotInstallMessage}`);
        }

        application.activity = application.activity!.filter(
            (act) =>
                act.$['android:name'] !=
                'org.reclaimprotocol.inapp_sdk.ReclaimActivity'
        );

        application.activity.push({
            $: {
                'android:name': 'org.reclaimprotocol.inapp_sdk.ReclaimActivity',
                'android:theme': '@style/Theme.ReclaimInAppSdk.LaunchTheme',
                'android:configChanges': 'orientation|keyboardHidden|keyboard|screenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode',
                'android:hardwareAccelerated': 'true',
                'android:windowSoftInputMode': 'adjustResize',
            },
        });

        return config;
    });
};