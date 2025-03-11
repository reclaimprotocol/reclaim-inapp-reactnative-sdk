import { AppRegistry } from 'react-native';
import App from './src/App.overrides';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
