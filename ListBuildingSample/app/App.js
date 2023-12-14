import React from 'react';
import {
  View, ScrollView, Text, Pressable, AppState, BackHandler, SafeAreaView
} from 'react-native';

import { DataCaptureContext } from 'scandit-react-native-datacapture-core';
import {
  SparkScan,
  SparkScanSettings,
  SparkScanView,
  SparkScanViewSettings,
  SparkScanViewSuccessFeedback,
  SparkScanViewErrorFeedback,
  Symbology,
  SymbologyDescription
} from 'scandit-react-native-datacapture-barcode';

import { styles } from './styles';
import { requestCameraPermissionsIfNeeded } from './camera-permission-handler';

export class App extends React.Component {

  state = {
    codes: [],
    cameraPermissions: false,
  }

  constructor() {
    super();

    // There is a Scandit sample license key set below here.
    // This license key is enabled for sample evaluation only.
    // If you want to build your own application, get your license key by signing up for a trial at https://ssl.scandit.com/dashboard/sign-up?p=test
    this.dataCaptureContext = DataCaptureContext.forLicenseKey('AW7z5wVbIbJtEL1x2i7B3/cet/ClBNVHZTfPtvJ2n3L/LY6/FDbqtzYItFO0DmhIJ2JP1Vxu7po1f74HqF9UTtRB/1DHY+CJdTiq/6dQ8vFgd9rzwlVfSYFgWPp9fK5nVUmnHyt9W5oRMcXObjYeC7Q/FO0NA0yRHUEtt/aBpnv/AxYTKG8wyVNqZKMJn+bhz/CFbH5pjtdj2aE85TlPGfQK4sBP/K2ONcx2ndbmY82SOquLlcZ55uAFuj4yCuQEI6iuokblpDVsql+vDiw3XMOmqwbmuGnAuCtGbtjyyWyQCKeiKWtZzdy+Cz7NnW/yRdwKY1xBjkaMA+A+NWeBxp9O2Ou6dBCPsRPg0Nqfv92sbv050dQc/+xccvEXWSi8UnD+AQoKp5V3gR/Yae/5+4fII9X3Tqjf/aNvXDw3m7YDQ+b+IJnkzLN5EgwGnzUmI8z3qMx9xcqhkWwBE/SSuIP47tBp5xwz02kN6qb+vZc/1p5EUQ/VtGVBfD1e+5Dii56BHsfPId/JpKpGUX1FFAYuT1uEbf7xLREDtFobn05tDxYPLrCa0hciRwCdWxHbUnYR1BF3zQQHih5Dd5qGyA5yKsgCsg7Na+9gC8O6hxpWlB4SbIFMEDluvJ+0v0ww5nnP2PWAO7v4k+Sgn7cQa7gDhQNee+pfuDvUlprUufio+dUmOUYNbn2TVwRVATmPx4U+p8Acg+Ohj85bSwPk+cNoq3Te6N0Ts5JnwrjCvVq6yrfbqyGFbgIhJiSxtgiZOfMZu8KoCvBfIUFE2A5WlNNaMZmQAtPozR31iX/Z2LuCIBhkFXGdd9CW/YPKhs8m25jlbOKnl0DWiBnM');
  }

  componentDidMount() {
    this.handleAppStateChangeSubscription = AppState.addEventListener('change', this.handleAppStateChange);
    this.setupScanning();
  }

  componentWillUnmount() {
    this.handleAppStateChangeSubscription.remove();
    this.dataCaptureContext.dispose();
  }

  handleAppStateChange = async (nextAppState) => {
    if (nextAppState.match(/inactive|background/)) {
      if (this.sparkScanView) {
        this.sparkScanView.stopScanning();
      }
    } else {
      requestCameraPermissionsIfNeeded()
        .then(() => {
          this.setState({ cameraPermissions: true });
        })
        .catch(() => BackHandler.exitApp());
    }
  }


  setupScanning = () => {
    // The spark scan process is configured through SparkScan settings
    // which are then applied to the spark scan instance that manages the spark scan.
    const sparkScanSettings = new SparkScanSettings();

    // The settings instance initially has all types of barcodes (symbologies) disabled.
    // For the purpose of this sample we enable a very generous set of symbologies.
    // In your own app ensure that you only enable the symbologies that your app requires
    // as every additional enabled symbology has an impact on processing times.
    sparkScanSettings.enableSymbologies([
      Symbology.EAN13UPCA,
      Symbology.EAN8,
      Symbology.UPCE,
      Symbology.Code39,
      Symbology.Code128,
      Symbology.InterleavedTwoOfFive,
    ]);


    // Some linear/1d barcode symbologies allow you to encode variable-length data.
    // By default, the Scandit Data Capture SDK only scans barcodes in a certain length range.
    // If your application requires scanning of one of these symbologies, and the length is
    // falling outside the default range, you may need to adjust the "active symbol counts"
    // for this symbology. This is shown in the following few lines of code for one of the
    // variable-length symbologies.
    const symbologySettings =
      sparkScanSettings.settingsForSymbology(Symbology.Code39);

    symbologySettings.activeSymbolCounts = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

    // Create the spark scan instance.
    // Spark scan will automatically apply and maintain the optimal camera settings.
    this.sparkScan = SparkScan.forSettings(sparkScanSettings);

    // Register a listener to get informed whenever a new barcode is scanned.
    const sparkScanListener = {
      didScan: (_, session) => {
        const barcode = session.newlyRecognizedBarcodes[0];

        if (this.isValidBarcode(barcode)) {
          // Emit success feedback
          this.sparkScanView.emitFeedback(new SparkScanViewSuccessFeedback());

          const symbology = new SymbologyDescription(barcode.symbology);

          this.setState({
            codes: [...this.state.codes].concat([{
              data: barcode.data,
              symbology: symbology.readableName
            }]),
          })
        } else {
          // Show an error feedback and automatically resume scanning after 60 seconds
          this.sparkScanView.emitFeedback(new SparkScanViewErrorFeedback('This code should not have been scanned', 60 * 1000));
        }
      }
    };

    // Add the listener to the spark scan mode.
    this.sparkScan.addListener(sparkScanListener);

    // You can customize the SparkScanView using SparkScanViewSettings.
    this.viewSettings = new SparkScanViewSettings();
  }

  isValidBarcode = (barcode) => {
    return barcode.data != null && barcode.data !== '123456789';
  }

  handleClearButtonClick = () => {
    this.setState({ codes: [] });
  }

  render() {
    return (
      this.state.cameraPermissions && <SparkScanView
        style={styles.sparkScanView}
        context={this.dataCaptureContext}
        sparkScan={this.sparkScan}
        sparkScanViewSettings={this.viewSettings}
        ref={view => {
          this.sparkScanView = view;
        }} >

        <SafeAreaView style={styles.container}>

          <Text style={styles.scanCount}>{this.state.codes.length} {this.state.codes.length === 0 || this.state.codes.length > 1 ? 'items' : 'item'}</Text>
          <ScrollView style={styles.splitViewResults} >
            {
              this.state.codes.map((result, index) =>
                <View key={index} style={styles.splitViewResult}>
                  <View style={styles.splitViewImage} />
                  <View key={index} style={styles.splitViewResultBarcodeData}>
                    <Text style={styles.splitViewResultData}>{result.data}</Text>
                    <Text style={styles.splitViewResultSymbology}>{result.symbology}</Text>
                  </View>

                </View>)
            }
          </ScrollView>

          <Pressable style={styles.clearButton} onPress={this.handleClearButtonClick}>
            <Text style={styles.clearButtonText}>CLEAR LIST</Text>
          </Pressable>

        </SafeAreaView>
      </SparkScanView>


    );
  }
}
