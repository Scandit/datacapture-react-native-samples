import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { ScanPage } from './ScanPage';
import { ResultsPage } from './ResultsPage';
import CodesContext from './AppContext';
import { HomePage } from './HomePage';

const Stack = createStackNavigator();

export type RootStackParamList = {
  Scanner: { onGoBack?: (resetCodes: boolean) => void } | undefined;
  Results: undefined;
  Home: undefined;
};

export default function App() {
  const [allCodes, setAllCodes] = useState<string[]>([]);
  const [pickedCodes, setPickedCodes] = useState<string[]>([]);

  return (
    <CodesContext.Provider value={{ pickedCodes, allCodes, setPickedCodes, setAllCodes }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: { backgroundColor: '#000' },
            headerShadowVisible: false,
            headerTintColor: '#fff',
          }}>
          <Stack.Screen
            name="Scanner"
            component={ScanPage}
            options={{
              title: 'Scan',
            }}
          />
          <Stack.Screen
            name="Results"
            component={ResultsPage}
            options={{
              title: 'Scan Results',
              headerTitleStyle: {
                fontSize: 16,
                fontWeight: 'bold',
              },
              headerLeftContainerStyle: {
                paddingLeft: 16,
              },
            }}
          />
          <Stack.Screen
            name="Home"
            component={HomePage}
            options={{
              headerShown: false,
              headerTitle: 'RestockingSample',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </CodesContext.Provider>
  );
}
