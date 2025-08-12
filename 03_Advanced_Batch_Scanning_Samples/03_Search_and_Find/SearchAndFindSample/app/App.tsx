import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Search } from './Search';
import { Find } from './Find';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { DataCaptureContext } from 'scandit-react-native-datacapture-core';
import { Barcode } from 'scandit-react-native-datacapture-barcode';

export type RootStackParamList = {
  Search: undefined;
  Find: { itemToFind: Barcode };
};

const Stack = createStackNavigator<RootStackParamList>();

export function App() {
  // Create data capture context using your license key.
  // Enter your Scandit License key here.
  // Your Scandit License key is available via your Scandit SDK web account.
  DataCaptureContext.initialize('-- ENTER YOUR SCANDIT LICENSE KEY HERE --');

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName='Search'>
              <Stack.Screen
                name='Search'
                component={Search}
                options={{
                  title: 'SEARCH & FIND',
                  headerTitleAlign: 'center',
                  headerStyle: {
                    backgroundColor: 'black',
                  },
                  headerTintColor: 'white',
                  headerShadowVisible: false,
                }}
              />
              <Stack.Screen
                name='Find'
                component={Find}
                options={{
                  headerShown: false,
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
