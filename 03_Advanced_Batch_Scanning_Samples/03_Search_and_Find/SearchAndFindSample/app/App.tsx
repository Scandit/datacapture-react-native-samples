import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Search } from './Search';
import { Find } from './Find';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Barcode } from 'scandit-react-native-datacapture-barcode';
import { HomePage } from './HomePage';

export type RootStackParamList = {
  Home: undefined;
  Search: undefined;
  Find: { itemToFind: Barcode };
};

const Stack = createStackNavigator<RootStackParamList>();

export function App() {

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName='Home'>
              <Stack.Screen
                name='Home'
                component={HomePage}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name='Search'
                component={Search}
                options={{
                  title: 'Search',
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
                  title: 'Find',
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
