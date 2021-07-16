import React, { Component } from 'react';
import { Image, SafeAreaView, Text, TouchableOpacity } from 'react-native';

import { Mode, SettingsContext } from './SettingsContext';
import { styles } from './styles';

export class SettingsPage extends Component {
  render() {
    const checkmark = () => <Image style={{ width: 16, height: 16 }} source={require('./checkmark.png')}></Image>

    
    return (
      <SettingsContext.Consumer>
        {({settings, setMode, setPosition}) => (
          <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Mode</Text>
            <TouchableOpacity style={styles.item} onPress={() => setMode(Mode.GS1)}>
              <Text>GS1</Text>
              {settings.mode == Mode.GS1 ? checkmark() : null}
            </TouchableOpacity>
            <TouchableOpacity style={styles.item} onPress={() => setMode(Mode.LOT)}>
              <Text>LOT</Text>
              {settings.mode == Mode.LOT ? checkmark() : null}
            </TouchableOpacity>

            <Text style={styles.header}>Scan Position</Text>
            <TouchableOpacity style={styles.item} onPress={() => setPosition(0.25)}>
              <Text>Top</Text>
              {settings.position == 0.25 ? checkmark() : null}
            </TouchableOpacity>
            <TouchableOpacity style={styles.item} onPress={() => setPosition(0.5)}>
              <Text>Center</Text>
              {settings.position == 0.5 ? checkmark() : null}
            </TouchableOpacity>
            <TouchableOpacity style={styles.item} onPress={() => setPosition(0.75)}>
              <Text>Bottom</Text>
              {settings.position == 0.75 ? checkmark() : null}
            </TouchableOpacity>
          </SafeAreaView>
        )}
      </SettingsContext.Consumer>
    );
  }
}
