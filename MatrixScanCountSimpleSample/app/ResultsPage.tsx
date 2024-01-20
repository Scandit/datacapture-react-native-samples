import React, { useContext } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { styles } from './styles';
import { RootStackParamList } from './App';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AppContext from './AppContext';

type ResultsPageProps = RouteProp<RootStackParamList, 'Results'>;
type ResultsPageNavigationProp = StackNavigationProp<RootStackParamList>;

export const ResultsPage = () => {
  const route = useRoute<ResultsPageProps>();
  const navigation = useNavigation<ResultsPageNavigationProp>();

  const { codes, flags, setFlags } = useContext(AppContext);

  const handleClearButtonClick = () => {
    route.params.source === 'listButton'
      ? setFlags({ ...flags, shouldClearBarcodes: true })
      : setFlags({ ...flags, shouldResetBarcodeCount: true });
    navigation.goBack();
  };

  const handleResumeScanningButtonClick = () => {
    navigation.goBack();
  };

  const handleStartNewScanningButtonClick = () => {
    setFlags({ ...flags, shouldResetBarcodeCount: true });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scanCountContainer}>
        <Text style={styles.scanCount}>
          {codes.length === 0 || codes.length > 1 ? 'Items ' : 'Item '}
          {'('}
          {codes.length}
          {')'}
        </Text>
      </View>
      <ScrollView style={styles.splitViewResults}>
        {codes.map((result, index) => (
          <View key={index} style={styles.splitViewResult}>
            <View style={styles.splitViewImage} />
            <View key={index} style={styles.splitViewResultBarcodeData}>
              <Text style={styles.splitViewResultData}>Item {index + 1}</Text>
              <Text style={styles.splitViewResultSymbology}>
                {result.symbology}
                {': '}
                {result.data}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <Pressable
          style={styles.blackButton}
          onPress={
            route.params.source === 'listButton'
              ? handleResumeScanningButtonClick
              : handleStartNewScanningButtonClick
          }>
          <Text style={styles.blackButtonText}>
            {route.params.source === 'listButton'
              ? 'RESUME SCANNING'
              : 'START NEW SCANNING'}
          </Text>
        </Pressable>

        <Pressable style={styles.clearButton} onPress={handleClearButtonClick}>
          <Text style={styles.clearButtonText}>CLEAR LIST</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};
