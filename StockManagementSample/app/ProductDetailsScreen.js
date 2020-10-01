import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

export function ProductDetailsScreen({ route }) {
  const { barcodeData } = route.params;

  return (
    <SafeAreaView style={{ flex: 1, margin: 20 }}>
      <Text style={{ fontWeight: 'bold' }}>Barcode Data</Text>
      <Text>{barcodeData}</Text>
      <View style={{ flexDirection: "row", marginTop: 20 }}>
        <View>
          <Text style={{ fontWeight: 'bold' }}>Shelf Stock Level</Text>
          <Text>11</Text>
        </View>
        <View style={{ marginLeft: 20 }}>
          <Text style={{ fontWeight: 'bold' }}>Back Room Stock Level</Text>
          <Text>24</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
