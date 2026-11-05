import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCameraPermission } from 'scandit-react-native-datacapture-core';
import { RootStackParamList } from './App';
import { ScanIcon } from './components/icons/ScanIcon';
import { LogoIcon } from './components/icons/LogoIcon';

type HomePageNavigationProp = StackNavigationProp<RootStackParamList, 'home'>;

export const HomePage = () => {
  const navigation = useNavigation<HomePageNavigationProp>();
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const handleNavigateToScan = async () => {
    setIsRequestingPermission(true);
    try {
      if (hasPermission || (await requestPermission())) {
        navigation.navigate('scan');
      } else {
        Alert.alert('Camera Permission Required', 'Please grant camera permission to scan IDs.', [{ text: 'OK' }]);
      }
    } finally {
      setIsRequestingPermission(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <LogoIcon width={96} height={14} color="#16191C" />
        <Text style={styles.title}>IdCaptureAio</Text>
        <Text style={styles.subtitle}>Test the most advanced ID scanning software</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleNavigateToScan} disabled={isRequestingPermission}>
        <ScanIcon width={20} height={20} color="white" />
        <Text style={styles.buttonText}>{isRequestingPermission ? 'Requesting permission...' : 'Start new scan'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 60,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 350,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 24,
  },
  title: {
    color: '#077F8A',
    fontFamily: 'Inter',
    fontSize: 32,
    fontStyle: 'normal',
    fontWeight: '700',
    lineHeight: 38,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#16191C',
    fontFamily: 'Inter',
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 24,
  },
  button: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#16191C',
    borderRadius: 8,
    width: '100%',
    maxWidth: 350,
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'Roboto',
    fontSize: 18,
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.5,
  },
});
