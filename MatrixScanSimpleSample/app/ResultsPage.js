import React, { Component } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbologyDescription } from 'scandit-react-native-datacapture-barcode';

import { Button } from './Button';
import { styles } from './styles';

export class Result extends Component {
  render() {
    const { data, symbology } = this.props.result;

    return (
      <View style={styles.result}>
        <Text style={styles.resultData}>{data}</Text>
        <Text style={styles.resultSymbology}>{symbology}</Text>
      </View>
    );
  }
}

export class ResultsPage extends Component {

  goBack() {
    this.props?.navigation?.goBack();
  }

  render() {
    const results = Object
      .values(this.props?.route?.params?.results)
      .map(({ data, symbology }) => ({ data, symbology: SymbologyDescription(symbology)?.readableName }));

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.listContainer}>
          {results.map(result => <Result key={result.data} result={result}/>)}
        </ScrollView>

        <Button styles={{ ...styles.button }} textStyles={styles.buttonText} title='Scan Again' onPress={() => this.goBack()}/>
      </SafeAreaView>
    );
  }
}
