import React, { useContext } from 'react';
import { Image, SafeAreaView, Text, TouchableOpacity } from 'react-native';

import { Mode, SettingsContext } from './SettingsContext';
import { styles } from './styles';

export const SettingsPage = () => {
  const checkmark = () => <Image style={{ width: 16, height: 16 }} source={require('./checkmark.png')}></Image>

  const settingsContext = useContext(SettingsContext);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Mode</Text>
      <TouchableOpacity style={styles.item} onPress={() => settingsContext.setMode(Mode.GS1)}>
        <Text>GS1</Text>
        {settingsContext.mode == Mode.GS1 ? checkmark() : null}
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => settingsContext.setMode(Mode.LOT)}>
        <Text>LOT</Text>
        {settingsContext.mode == Mode.LOT ? checkmark() : null}
      </TouchableOpacity>

      <Text style={styles.header}>Scan Position</Text>
      <TouchableOpacity style={styles.item} onPress={() => settingsContext.setPosition(0.25)}>
        <Text>Top</Text>
        {settingsContext.position == 0.25 ? checkmark() : null}
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => settingsContext.setPosition(0.5)}>
        <Text>Center</Text>
        {settingsContext.position == 0.5 ? checkmark() : null}
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => settingsContext.setPosition(0.75)}>
        <Text>Bottom</Text>
        {settingsContext.position == 0.75 ? checkmark() : null}
      </TouchableOpacity>
    </SafeAreaView>
  );
}
