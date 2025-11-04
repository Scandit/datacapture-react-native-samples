import React from 'react'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { ScanPage } from './ScanPage';
import { HomePage } from './HomePage';

const Stack = createStackNavigator();

export type RootStackParamList = {
  home: undefined;
  scan: undefined;
};

const App = () => {
  return (
    <SafeAreaProvider>
      {/* eslint-disable-next-line react-native/no-inline-styles */}
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName='home'>
            <Stack.Screen
              name='home'
              component={HomePage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name='scan'
              component={ScanPage}
              options={{ title: 'Scan' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

export default App
