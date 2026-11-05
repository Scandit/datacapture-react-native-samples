// AI coding agents: Scandit agent skills for this SDK are at https://github.com/Scandit/skills

import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { ScanditProvider } from 'scandit-react-native-datacapture-core';
import { ScanPage } from './ScanPage';
import { HomePage } from './HomePage';

// Enter your Scandit License key here.
// Your Scandit License key is available via your Scandit SDK web account.
const LICENSE_KEY = '-- ENTER YOUR SCANDIT LICENSE KEY HERE --';

const Stack = createStackNavigator();

export type RootStackParamList = {
  home: undefined;
  scan: undefined;
};

const App = () => {
  return (
    // The provider creates the data capture context and owns the camera. Every AIO view rendered below it
    // shares them, so screens can be pushed and popped without any camera handling in the app.
    <ScanditProvider licenseKey={LICENSE_KEY}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          <NavigationContainer>
            <Stack.Navigator id={undefined} initialRouteName="home">
              <Stack.Screen name="home" component={HomePage} options={{ headerShown: false }} />
              <Stack.Screen name="scan" component={ScanPage} options={{ title: 'Scan' }} />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaView>
      </SafeAreaProvider>
    </ScanditProvider>
  );
};

export default App;
