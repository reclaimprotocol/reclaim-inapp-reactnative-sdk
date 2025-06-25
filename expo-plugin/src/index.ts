import { type ConfigPlugin, withPlugins } from '@expo/config-plugins';
import {
    installReclaimAndroidManifest,
    installReclaimProjectBuildGradle,
} from './android';

const withReclaimInAppSdk: ConfigPlugin = (config) => {
    return withPlugins(config, [
        installReclaimAndroidManifest,
        installReclaimProjectBuildGradle,
    ]);
};

export default withReclaimInAppSdk;
