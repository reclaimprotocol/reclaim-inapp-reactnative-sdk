import {
    type ConfigPlugin,
    withProjectBuildGradle,
} from '@expo/config-plugins';

export const installReclaimProjectBuildGradle: ConfigPlugin = (config) => {
    return withProjectBuildGradle(config, async (config) => {
        const flutterStorageUrl = process.env.EXPO_PUBLIC_FLUTTER_STORAGE_BASE_URL || config.android['FLUTTER_STORAGE_BASE_URL'] || "https://storage.googleapis.com"
        const reclaimStorageUrl = process.env.EXPO_PUBLIC_RECLAIM_STORAGE_BASE_URL || config.android['RECLAIM_STORAGE_BASE_URL'] || "https://reclaim-inapp-sdk.s3.ap-south-1.amazonaws.com/android/repo"

        if (!config.modResults.contents.match('reclaim-inapp-sdk')) {
            config.modResults.contents = config.modResults.contents.replace(
                /mavenCentral\(\)/g,
                `
          mavenCentral()
          maven { url "${reclaimStorageUrl}" }
          maven { url "${flutterStorageUrl}/download.flutter.io" }`
            );
        }
        return config;
    });
};