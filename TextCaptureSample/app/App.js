import 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { Component } from 'react';
import { Button, Platform, PlatformColor } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ScanPage } from './ScanPage';
import { Mode, SettingsContext } from './SettingsContext';
import { SettingsPage } from './SettingsPage';

import Icon from 'react-native-vector-icons/Ionicons';

const Stack = createStackNavigator();

const HeaderRightButton = ({ navigation }) => {
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

export class App extends Component {
  state = {
    settings: { mode: Mode.GS1, position: 0.5 },
    setMode: (mode) => this.setState(state => state.settings.mode = mode),
    setPosition: (position) => this.setState(state => state.settings.position = position),
  }

  render() {
    return (
      <SettingsContext.Provider value={this.state}>
        <SafeAreaProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="scan">
              <Stack.Screen name="scan" component={ScanPage} options={({ navigation, route }) => ({
                title: 'Text Capture',
                headerRight: (props) => <HeaderRightButton {...props} navigation={navigation} />,
              })} />
              <Stack.Screen name="settings" component={SettingsPage} options={{ title: 'Settings' }} />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </SettingsContext.Provider>
    );
  }
}
