import 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Button, Platform, PlatformColor } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ScanPage } from './ScanPage';
import { Mode, SettingsContext } from './SettingsContext';
import { SettingsPage } from './SettingsPage';

import Icon from 'react-native-vector-icons/Ionicons';

type RootStackParamList = {
  scan: undefined;
  settings: {} | undefined;
}

export type NavigationProps = StackScreenProps<RootStackParamList, 'scan'>;

const Stack = createStackNavigator<RootStackParamList>();

const HeaderRightButton = ({ navigation }: NavigationProps) => {
  if (Platform.OS === 'ios') {
    return (
      <Button
        onPress={() => navigation.push('settings', {})}
        title='Settings'
        color={PlatformColor('systemBlue')}
      />
    )
  } else {
    return (
      <Icon name='settings-sharp' size={30} onPress={() => navigation.push('settings', {})} />
    )
  }
}

export const App = () => {
  const [mode, setMode] = useState(Mode.GS1);
  const [position, setPosition] = useState(0.5);

  return (
    <SettingsContext.Provider value={{mode, position, setMode, setPosition}}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="scan">
            <Stack.Screen name="scan" component={ScanPage} options={({ navigation, route }) => ({
              title: 'Text Capture',
              headerRight: (props) => <HeaderRightButton route={route} {...props} navigation={navigation} />,
            })} />
            <Stack.Screen name="settings" component={SettingsPage} options={{ title: 'Settings' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </SettingsContext.Provider>
  );
}
