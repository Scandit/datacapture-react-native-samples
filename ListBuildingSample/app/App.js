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

    // Create data capture context using your license key.
    this.dataCaptureContext = DataCaptureContext.forLicenseKey('-- ENTER YOUR SCANDIT LICENSE KEY HERE --');
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
    const viewSettings = new SparkScanViewSettings();

    // Create the sparkScanView component to render
    this.sparkScanComponent = <SparkScanView
      style={styles.sparkScanView}
      context={this.dataCaptureContext}
      sparkScan={this.sparkScan}
      sparkScanViewSettings={viewSettings}
      ref={view => {
        this.sparkScanView = view;
      }} />;
  }

  isValidBarcode = (barcode) => {
    return barcode.data != null && barcode.data !== '123456789';
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.scanCount}>{this.state.codes.length} {this.state.codes.length === 0 || this.state.codes.length > 1 ? 'items' : 'item'}</Text>
        <ScrollView style={styles.splitViewResults}>
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
        {/* Need to be placed with absolute position to overlay on top of other views */}
        {this.state.cameraPermissions && this.sparkScanComponent}
        <Pressable style={styles.clearButton} onPressOut={() => {
          this.setState({ codes: [] });
        }
        }>
          <Text style={styles.clearButtonText}>CLEAR LIST</Text>
        </Pressable>
      </SafeAreaView>
    );
  }
}
