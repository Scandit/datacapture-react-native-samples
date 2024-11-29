import React from 'react';
import {
  Image,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { BarcodeBatchAdvancedOverlayView } from 'scandit-react-native-datacapture-barcode';

import { styles } from './styles';

// The component must be registered and must either have a static and instance property `moduleName` by
// which it's registered, or must inherit from `BarcodeBatchAdvancedOverlayView`.
// See: `AppRegistry.registerComponent(ARView.moduleName, () => ARView)` in index.js
export class ARView extends BarcodeBatchAdvancedOverlayView {
  state = { showBarcodeData: false };

  render() {
    const { stock } = this.props;
    const { showBarcodeData } = this.state;

    // The text content of the bubble, switching between stock information and the barcode data.
    const stockInfo = (
      <>
        <Text style={styles.arBubbleHeader}>Report Stock Count</Text>
        <Text style={styles.arBubbleInfo}>Shelf: {stock.shelf} Back Room: {stock.backRoom}</Text>
      </>
    );

    return (
      <TouchableWithoutFeedback onPress={() => this.setState({ showBarcodeData: !showBarcodeData })}>
        <View style={styles.arBubbleContainer}>
          <View style={styles.arBubbleImageContainer}>
            <Image source={require('./StockCountIcon.png')} style={styles.arBubbleImage} />
          </View>
          <View style={styles.arBubbleContent}>
            {showBarcodeData ? <Text style={styles.arBubbleHeader}>{this.props.barcodeData}</Text> : stockInfo}
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}
