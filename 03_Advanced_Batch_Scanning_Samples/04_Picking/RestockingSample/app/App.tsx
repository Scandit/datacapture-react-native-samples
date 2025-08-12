import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { ScanPage } from './ScanPage';
import { ResultsPage } from './ResultsPage';
import CodesContext from './AppContext';

const Stack = createStackNavigator();

export type RootStackParamList = {
  Scanner: { onGoBack?: (resetCodes: boolean) => void } | undefined;
  Results: undefined;
};

export default function App() {
  const [allCodes, setAllCodes] = useState<string[]>([]);
  const [pickedCodes, setPickedCodes] = useState<string[]>([]);

  return (
    <CodesContext.Provider value={{ pickedCodes, allCodes, setPickedCodes, setAllCodes }}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#000' },
            headerShadowVisible: false,
            headerTintColor: '#fff',
          }}>
          <Stack.Screen
            name="Scanner"
            component={ScanPage}
            options={{
              headerShown: true,
              headerTitle: 'RestockingSample',
            }}
          />
          <Stack.Screen
            name="Results"
            component={ResultsPage}
            options={{
              title: 'Scanned Items',
              headerTitleStyle: {
                fontSize: 16,
                fontWeight: 'bold',
              },
              headerLeftContainerStyle: {
                paddingLeft: 16,
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </CodesContext.Provider>
  );
}
