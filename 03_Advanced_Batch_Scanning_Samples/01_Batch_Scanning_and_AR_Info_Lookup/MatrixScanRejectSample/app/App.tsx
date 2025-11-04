import React from 'react'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { ScanPage } from './ScanPage';
import { HomePage } from './HomePage';
import { ResultsPage } from './ResultsPage';
import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName='home'>
            <Stack.Screen name='home' component={HomePage} options={{ headerShown: false }} />
            <Stack.Screen name='scan' component={ScanPage} options={{ title: 'Scan' }} />
            <Stack.Screen name='results' component={ResultsPage} options={{ title: 'Scan Results' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

export default App
