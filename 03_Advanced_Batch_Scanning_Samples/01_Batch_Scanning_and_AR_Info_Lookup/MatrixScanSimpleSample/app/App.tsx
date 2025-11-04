import 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import { ResultsPage } from './ResultsPage';
import { ScanPage } from './ScanPage';
import { HomePage } from './HomePage';
import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

export const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="home">
        <Stack.Screen name="scan" component={ScanPage} options={{ title: 'Scan' }} />
        <Stack.Screen name="results" component={ResultsPage} options={{ title: 'Scan Results' }} />
        <Stack.Screen name="home" component={HomePage} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
