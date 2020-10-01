import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import { MainScreen } from './MainScreen';
import { ProductDetailsScreen } from './ProductDetailsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Scanning" component={MainScreen} />
        <Stack.Screen name="Product Details" component={ProductDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
