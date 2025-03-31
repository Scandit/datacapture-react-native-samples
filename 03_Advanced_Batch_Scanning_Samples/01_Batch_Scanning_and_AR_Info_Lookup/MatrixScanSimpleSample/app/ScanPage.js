import { createStackNavigator } from '@react-navigation/stack';
import React, { Component } from 'react';
import { AppState, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BarcodeBatch,
  BarcodeBatchBasicOverlay,
  BarcodeBatchBasicOverlayStyle,
  BarcodeBatchSettings,
  Symbology,
} from 'scandit-react-native-datacapture-barcode';
import {
  Camera,
  DataCaptureContext,
  DataCaptureView,
  FrameSourceState,
  VideoResolution,
} from 'scandit-react-native-datacapture-core';

import { Button } from './Button';
import { requestCameraPermissionsIfNeeded } from './camera-permission-handler';
import { styles } from './styles';

const Stack = createStackNavigator();

export class ScanPage extends Component {

  constructor() {
    super();

    // Enter your Scandit License key here.
    // Your Scandit License key is available via your Scandit SDK web account.
    this.dataCaptureContext = DataCaptureContext.forLicenseKey('-- ENTER YOUR SCANDIT LICENSE KEY HERE --');
    this.viewRef = React.createRef();

    this.results = {};
  }

  componentDidMount() {
    this.handleAppStateChangeSubscription = AppState.addEventListener('change', this.handleAppStateChange);
    this.setupScanning();
    this.startCamera();

    this.unsubscribeFocus = this.props.navigation.addListener('focus', () => {
      this.results = {};
    });
  }

  componentWillUnmount() {
    this.handleAppStateChangeSubscription.remove();
    this.dataCaptureContext.dispose();
    this.unsubscribeFocus();
  }

  handleAppStateChange = async (nextAppState) => {
    if (nextAppState.match(/inactive|background/)) {
      this.stopCapture();
    } else {
      this.startCapture();
    }
  }

  startCapture() {
    this.startCamera();
    this.barcodeBatch.isEnabled = true;
  }

  stopCapture() {
    this.barcodeBatch.isEnabled = false;
    this.stopCamera();
  }

  goToResults() {
    this.props?.navigation?.navigate('results', { results: this.results });
  }

  stopCamera() {
    if (this.camera) {
      this.camera.switchToDesiredState(FrameSourceState.Off);
    }
  }

  startCamera() {
    if (!this.camera) {
      // Use the world-facing (back) camera and set it as the frame source of the context. The camera is off by
      // default and must be turned on to start streaming frames to the data capture context for recognition.
      const cameraSettings = BarcodeBatch.recommendedCameraSettings;
      cameraSettings.preferredResolution = VideoResolution.FullHD;

      this.camera = Camera.withSettings(cameraSettings);
      this.dataCaptureContext.setFrameSource(this.camera);
    }

    // Switch camera on to start streaming frames and enable the barcode batch mode.
    // The camera is started asynchronously and will take some time to completely turn on.
    requestCameraPermissionsIfNeeded()
      .then(() => this.camera.switchToDesiredState(FrameSourceState.On))
      .catch(() => BackHandler.exitApp());
  }

  setupScanning() {
    // The barcode batch process is configured through barcode batch settings
    // which are then applied to the barcode batch instance that manages barcode batch.
    const settings = new BarcodeBatchSettings();

    // The settings instance initially has all types of barcodes (symbologies) disabled. For the purpose of this
    // sample we enable a very generous set of symbologies. In your own app ensure that you only enable the
    // symbologies that your app requires as every additional enabled symbology has an impact on processing times.
    settings.enableSymbologies([
      Symbology.EAN13UPCA,
      Symbology.EAN8,
      Symbology.UPCE,
      Symbology.Code39,
      Symbology.Code128,
    ]);

    // Create new barcode batch mode with the settings from above.
    this.barcodeBatch = BarcodeBatch.forContext(this.dataCaptureContext, settings);

    // Register a listener to get informed whenever a new barcode is tracked.
    this.barcodeBatchListener = {
      didUpdateSession: async (_, session) => {
        Object.values(session.trackedBarcodes).forEach(trackedBarcode => {
          const { data, symbology } = trackedBarcode.barcode;
          this.results[data] = { data, symbology };
        });
      }
    };

    this.barcodeBatch.addListener(this.barcodeBatchListener);

    // Add a barcode batch overlay to the data capture view to render the location of captured barcodes on top of
    // the video preview. This is optional, but recommended for better visual feedback.
    BarcodeBatchBasicOverlay.withBarcodeBatchForViewWithStyle(
        this.barcodeBatch,
        this.viewRef.current,
        BarcodeBatchBasicOverlayStyle.Frame
    );
  }

  render() {
    return (
      <>
        <DataCaptureView style={{ flex: 1 }} context={this.dataCaptureContext} ref={this.viewRef} />
        <SafeAreaView style={styles.buttonContainer}>
          <Button styles={styles.button} textStyles={styles.buttonText} title='Done' onPress={() => this.goToResults()} />
        </SafeAreaView>
      </>
    );
  };
}
