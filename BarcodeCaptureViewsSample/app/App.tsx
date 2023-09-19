import React  from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { ListPage } from './ListPage';
import { FullScreenView } from './views/FullScreenView';
import { SplitScreenView } from './views/SplitScreenView';

export type RootStackParamList = {
  list: undefined;
  fs: undefined;
  sv: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export const App = () => {
    return (
        <NavigationContainer>
          <Stack.Navigator initialRouteName='list'>
            <Stack.Screen name='list' component={ListPage} options={{ title: 'Barcode Capture Views' }} />
            <Stack.Screen name='fs' component={FullScreenView} options={{ title: 'Full Screen' }} />
            <Stack.Screen name='sv' component={SplitScreenView} options={{ title: 'Split View' }} />
          </Stack.Navigator>
        </NavigationContainer>
    );
}
