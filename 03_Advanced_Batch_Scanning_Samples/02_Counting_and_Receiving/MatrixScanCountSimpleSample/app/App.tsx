import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { ScanPage } from './ScanPage';
import { ResultsPage } from './ResultsPage';
import CodesContext, { Code, Flag } from './AppContext';

const Stack = createStackNavigator();

export type RootStackParamList = {
  Scanner: undefined;
  Results: {
    source: 'listButton' | 'finishButton';
  };
};

export default function App() {
  const [codes, setCodes] = useState<Code[]>([]);
  const [flags, setFlags] = useState<Flag>({
    shouldClearBarcodes: false,
    shouldResetBarcodeCount: false,
  });

  return (
    <CodesContext.Provider value={{ codes, flags, setCodes, setFlags }}>
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
              headerShown: false,
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
              headerBackTitleVisible: false,
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
