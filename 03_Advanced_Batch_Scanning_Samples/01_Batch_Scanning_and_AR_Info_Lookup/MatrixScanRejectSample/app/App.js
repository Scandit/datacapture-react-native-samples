import React, { Component } from 'react';
import 'react-native-gesture-handler';

import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { ScanPage } from './ScanPage';
import { ResultsPage } from './ResultsPage';

const Stack = createStackNavigator();

export class App extends Component {

  render() {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="scan">
              <Stack.Screen name="scan" component={ScanPage} options={{ title: 'MatrixScan Reject' }} />
              <Stack.Screen name="results" component={ResultsPage} options={{ title: 'Scan Results' }} />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }
}
