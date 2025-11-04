import React from 'react';
import { Text, View, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

import { Symbology, SymbologyDescription } from 'scandit-react-native-datacapture-barcode';

import { Button } from './Button';
import { styles } from './styles';
import { RootStackParamList } from './types';

type ResultProps = {
  result: {
    data: string;
    symbology: Symbology;
  };
};

export const Result = ({ result }: ResultProps) => {
  const { data, symbology } = result;

  return (
    <View style={styles.result}>
      <Text style={styles.resultData}>{data}</Text>
      <Text style={styles.resultSymbology}>{SymbologyDescription.forIdentifier(symbology)?.readableName}</Text>
    </View>
  );
};

type ResultsPageProps = {
  route: RouteProp<RootStackParamList, 'results'>;
  navigation: NavigationProp<RootStackParamList, 'results'>;
};

export const ResultsPage = ({ route, navigation }: ResultsPageProps) => {
  const goBack = () => {
    navigation.goBack();
  };

  const resultsData = route?.params?.results || {};
  const results = Object.values(resultsData).map((result) => ({
    data: (result as any).data,
    symbology: (result as any).symbology
  }));

  return (
    <View style={styles.container}>
      <ScrollView style={styles.listContainer}>
        {results.map(result => <Result key={result.data} result={result} />)}
      </ScrollView>

      <Button
        styles={styles.button}
        textStyles={styles.buttonText}
        title='Scan Again'
        onPress={goBack}
      />
    </View>
  );
};
