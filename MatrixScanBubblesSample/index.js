/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { App } from './app/App';
import { ARView } from './app/ARView';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerComponent(ARView.moduleName, () => ARView);
