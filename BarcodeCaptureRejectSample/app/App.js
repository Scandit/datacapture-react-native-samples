import React, { Component } from 'react';
import { Alert, AppState, BackHandler } from 'react-native';
import {
  BarcodeCapture,
  BarcodeCaptureOverlay,
  BarcodeCaptureOverlayStyle,
  BarcodeCaptureSettings,
  Symbology,
  SymbologyDescription,
} from 'scandit-react-native-datacapture-barcode';
import {
  Brush,
  Camera,
  CameraSettings,
  Color,
  DataCaptureContext,
  DataCaptureView,
  Feedback,
  FrameSourceState,
  RectangularViewfinder,
  RectangularViewfinderLineStyle,
  RectangularViewfinderStyle,
  VideoResolution,
} from 'scandit-react-native-datacapture-core';

import { requestCameraPermissionsIfNeeded } from './camera-permission-handler';

export class App extends Component {

  constructor() {
    super();

    // Create data capture context using your license key.
    this.dataCaptureContext = DataCaptureContext.forLicenseKey('-- ENTER YOUR SCANDIT LICENSE KEY HERE --');
    this.viewRef = React.createRef();
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
    this.setupScanning();
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
    this.dataCaptureContext.dispose();
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
    this.barcodeCaptureMode.isEnabled = true;
  }

  stopCapture() {
    this.barcodeCaptureMode.isEnabled = false;
    this.stopCamera();
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
      this.camera = Camera.default;
      this.dataCaptureContext.setFrameSource(this.camera);

      const cameraSettings = new CameraSettings();
      cameraSettings.preferredResolution = VideoResolution.FullHD;
      this.camera.applySettings(cameraSettings);
    }

    // Switch camera on to start streaming frames and enable the barcode capture mode.
    // The camera is started asynchronously and will take some time to completely turn on.
    requestCameraPermissionsIfNeeded()
      .then(() => this.camera.switchToDesiredState(FrameSourceState.On))
      .catch(() => BackHandler.exitApp());
  }

  setupScanning() {
    // The barcode capturing process is configured through barcode capture settings
    // and are then applied to the barcode capture instance that manages barcode recognition.
    const settings = new BarcodeCaptureSettings();

    // The settings instance initially has all types of barcodes (symbologies) disabled. For the purpose of this
    // sample we enable the QR symbology. In your own app ensure that you only enable the symbologies that your app
    // requires as every additional enabled symbology has an impact on processing times.
    settings.enableSymbologies([Symbology.QR]);

    // Create new barcode capture mode with the settings from above.
    this.barcodeCaptureMode = BarcodeCapture.forContext(this.dataCaptureContext, settings);

    // By default, every time a barcode is scanned, a sound (if not in silent mode) and a vibration are played.
    // In the following we are setting a success feedback without sound and vibration.
    this.barcodeCaptureMode.feedback = { success: new Feedback(null, null) };

    // Register a listener to get informed whenever a new barcode got recognized.
    this.barcodeCaptureListener = {
      didScan: (_, session) => {
        const barcode = session.newlyRecognizedBarcodes[0];
        const symbology = new SymbologyDescription(barcode.symbology);

        // If the code scanned doesn't start with '09:', we will just ignore it and continue scanning.
        if (!barcode.data.startsWith('09:')) {
          this.overlay.brush = Brush.transparent;
          return;
        }

        // Stop recognizing barcodes for as long as we are displaying the result. There won't be any
        // new results until the capture mode is enabled again. Note that disabling the capture mode
        // does not stop the camera, the camera continues to stream frames until it is turned off.
        this.barcodeCaptureMode.isEnabled = false;

        this.overlay.brush = new Brush(Color.fromHex('FFF0'), Color.fromHex('FFFF'), 3);

        Feedback.defaultFeedback.emit()

        Alert.alert(
          null,
          `Scanned: ${barcode.data} (${symbology.readableName})`,
          [{ text: 'OK', onPress: () => this.barcodeCaptureMode.isEnabled = true }],
          { cancelable: false }
        );
      }
    };

    this.barcodeCaptureMode.addListener(this.barcodeCaptureListener);

    // Add a barcode capture overlay to the data capture view to render the location of captured barcodes on top of
    // the video preview, using the Frame overlay style. This is optional, but recommended for better visual feedback.
    this.overlay = BarcodeCaptureOverlay.withBarcodeCaptureForViewWithStyle(
        this.barcodeCaptureMode,
        this.viewRef.current,
        BarcodeCaptureOverlayStyle.Frame
    );

    // Add a square viewfinder as we are only scanning square QR codes.
    this.overlay.viewfinder = new RectangularViewfinder(
        RectangularViewfinderStyle.Square,
        RectangularViewfinderLineStyle.Light,
    );
  }

  render() {
    return (
      <DataCaptureView style={{ flex: 1 }} context={this.dataCaptureContext} ref={this.viewRef} />
    );
  };
}
