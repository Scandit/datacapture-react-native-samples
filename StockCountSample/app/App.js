import React, { Component } from 'react';
import 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { ScanPage } from './ScanPage';

const Stack = createStackNavigator();

export class App extends Component {

  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="scan">
          <Stack.Screen name="scan" component={ScanPage} options={{ title: 'Stock Count' }} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}
