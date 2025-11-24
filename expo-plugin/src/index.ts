import { type ConfigPlugin, withPlugins } from '@expo/config-plugins';
import {
    withReclaimAndroidManifest,
    withReclaimProjectBuildGradle,
} from './android';

const withReclaimInAppSdk: ConfigPlugin = (config) => {
    return withPlugins(config, [
        withReclaimAndroidManifest,
        withReclaimProjectBuildGradle,
    ]);
};

export default withReclaimInAppSdk;
