import { createStackNavigator } from '@react-navigation/stack';
import React, { Component } from 'react';
import { AppState, SafeAreaView, BackHandler } from 'react-native';
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
  Brush,
  Color,
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

  is_rejected = (value) => {
    return value.startsWith('7') || value.startsWith('07');
  }

  componentDidMount() {
    this.handleAppStateChangeSubscription = AppState.addEventListener('change', this.handleAppStateChange);
    this.setupScanning();
    this.unsubscribeFocus = this.props.navigation.addListener('focus', () => {
      this.results = {};
    });
  }

  componentWillUnmount() {
    this.handleAppStateChangeSubscription.remove();
    this.stopCamera();
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
    this.barcodeBatch = BarcodeBatch.forContext(null, settings);

    // Register a listener to get informed whenever a new barcode is tracked.
    this.barcodeBatchListener = {
      didUpdateSession: async (_, session) => {
        this.results = {};

        Object.values(session.trackedBarcodes).forEach(trackedBarcode => {
          const { data, symbology } = trackedBarcode.barcode;

          // Keep track of all non-rejected barcodes.
          if (!this.is_rejected(data)) {
            this.results[data] = { data, symbology };
          }
        });
      }
    };

    this.barcodeBatch.addListener(this.barcodeBatchListener);

    this.dataCaptureContext.addMode(this.barcodeBatch);

    // Add a barcode batch overlay to the data capture view to render the location of captured barcodes on top of
    // the video preview. This is optional, but recommended for better visual feedback.
    const overlay = new BarcodeBatchBasicOverlay(
      this.barcodeBatch,
      BarcodeBatchBasicOverlayStyle.Frame
    );

    // Implement the BarcodeBatchBasicOverlayListener interface.
    // The method BarcodeBatchBasicOverlayListener.brushForTrackedBarcode() is invoked every time a new tracked
    // barcode appears and it can be used to set a brush that will highlight that specific barcode in the overlay.
    overlay.listener = {
      brushForTrackedBarcode: (overlay, trackedBarcode) => {
        // Return a custom Brush based on the tracked barcode.
        const { barcode } = trackedBarcode;

        if (this.is_rejected(barcode.data)) {
          return new Brush(Color.fromRGBA(255, 255, 255, 0), Color.fromHex('#FF3939FF'), 3);
        } else {
          return new Brush(Color.fromRGBA(255, 255, 255, 0), Color.fromHex('#39FF39FF'), 3);
        }
      },
    };

    this.viewRef.current?.addOverlay(overlay);
  }

  render() {
    return (
      <>
        <DataCaptureView style={{ flex: 1 }} context={this.dataCaptureContext} ref={this.viewRef} />
        <SafeAreaView style={styles.buttonContainer}>
          <Button styles={styles.button} textStyles={styles.buttonText} title='Done' onPress={() => this.goToResults()} />
        </SafeAreaView>
      </>
    )
  };
}
