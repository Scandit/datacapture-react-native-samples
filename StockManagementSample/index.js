import { AppRegistry } from 'react-native';

import { name as appName } from './app.json';
import App from './app/App';
import { ARView } from './app/MainScreen';

AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerComponent(ARView.moduleName, () => ARView)
