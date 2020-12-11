import React, { Component } from 'react';
import { AppState, BackHandler } from 'react-native';
import {
  BarcodeTracking,
  BarcodeTrackingBasicOverlay,
  BarcodeTrackingSettings,
  Symbology,
} from 'scandit-react-native-datacapture-barcode';
import {
  Camera,
  CameraSettings,
  DataCaptureContext,
  DataCaptureView,
  FrameSourceState,
  VideoResolution,
  Brush,
  Color,
  Anchor,
  PointWithUnit,
  NumberWithUnit,
  MeasureUnit,
  Feedback,
} from 'scandit-react-native-datacapture-core';

import { requestCameraPermissionsIfNeeded } from './camera-permission-handler';
import { BarcodeListView } from './BarcodeListView';
import { styles, values } from './styles';

export class ScanPage extends Component {

  constructor() {
    super();

    // Create data capture context using your license key.
    this.dataCaptureContext = DataCaptureContext.forLicenseKey('-- ENTER YOUR SCANDIT LICENSE KEY HERE --');
    this.viewRef = React.createRef();

    this.onCaptureResults = this.onCaptureResults.bind(this);
    this.onCardPress = this.onCardPress.bind(this);
    this.onClearPress = this.onClearPress.bind(this);

    // Store results that the barcode scanner is capturing.
    this.results = {};

    this.state = {
      show: false,
      capturedResults: {} // The scan results that will be passed to the barcode list view.
    };
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
    this.setupScanning();

    // Keep Scandit logo visible on screen when scanning.
    this.viewRef.current.logoAnchor = Anchor.BottomRight;
    this.viewRef.current.logoOffset = this.logoOffset();

    this.props.navigation.addListener('focus', () => {
      this.results = {};
    });
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
    this.barcodeTracking.isEnabled = true;
  }

  stopCapture() {
    this.barcodeTracking.isEnabled = false;
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

    // Switch camera on to start streaming frames and enable the barcode tracking mode.
    // The camera is started asynchronously and will take some time to completely turn on.
    requestCameraPermissionsIfNeeded()
      .then(() => this.camera.switchToDesiredState(FrameSourceState.On))
      .catch(() => BackHandler.exitApp());
  }

  setupScanning() {
    // The barcode tracking process is configured through barcode tracking settings
    // which are then applied to the barcode tracking instance that manages barcode tracking.
    const settings = new BarcodeTrackingSettings();

    // The settings instance initially has all types of barcodes (symbologies) disabled. For the purpose of this
    // sample we enable a very generous set of symbologies. In your own app ensure that you only enable the
    // symbologies that your app requires as every additional enabled symbology has an impact on processing times.
    settings.enableSymbologies([
      Symbology.EAN13UPCA,
      Symbology.EAN8,
      Symbology.UPCE,
      Symbology.Code39,
      Symbology.Code128,
      Symbology.DataMatrix,
    ]);

    // Create new barcode tracking mode with the settings from above.
    this.barcodeTracking = BarcodeTracking.forContext(this.dataCaptureContext, settings);

    // Register a listener to get informed whenever a new barcode is tracked.
    this.barcodeTrackingListener = {
      didUpdateSession: (_, session) => {
        this.results = {};
        Object.values(session.trackedBarcodes).forEach(trackedBarcode => {
          const { data, symbology } = trackedBarcode.barcode;
          this.results[data] = { data, symbology };
        });
      }
    };

    this.barcodeTracking.addListener(this.barcodeTrackingListener);

    // Add a barcode tracking overlay to the data capture view to render the location of captured barcodes on top of
    // the video preview. This is optional, but recommended for better visual feedback.
    const overlay = BarcodeTrackingBasicOverlay.withBarcodeTrackingForView(this.barcodeTracking, this.viewRef.current);

    // Implement the BarcodeTrackingBasicOverlayListener interface. 
    // The method BarcodeTrackingBasicOverlayListener.brushForTrackedBarcode() is invoked every time a new tracked 
    // barcode appears and it can be used to set a brush that will highlight that specific barcode in the overlay.
    overlay.listener = {
      brushForTrackedBarcode: (overlay, trackedBarcode) => new Brush(
        Color.fromRGBA(255, 255, 255, 0.4),
        Color.fromRGBA(255, 255, 255, 1),
        2
      )
    };
  }

  logoOffset() {
    return new PointWithUnit(
        new NumberWithUnit(0, MeasureUnit.Pixel),
        new NumberWithUnit(-values.cardMinHeight * 2, MeasureUnit.Pixel)
    );
  }

  onCaptureResults() {
    // Do nothing when the card is expanded.
    if (this.state.show) {
      return;
    }

    if (Object.keys(this.results).length !== 0) {
      Feedback.defaultFeedback.emit();
    }

    this.setState({
      capturedResults: Object.assign({}, this.results)
    })
    this.results = {};
  }

  onCardPress() {
    if (this.state.show) {
      this.startCapture();
    } else {
      this.stopCapture();
    }

    this.setState({
      show: !this.state.show
    })
  }

  onClearPress() {
    this.startCapture();
    this.setState({
      show: false
    })
  }

  render() {
    const { show, capturedResults } = this.state;
    return (
      <>
        <DataCaptureView style={styles.scanContainer} context={this.dataCaptureContext} ref={this.viewRef} />
        <BarcodeListView
          show={show}
          results={capturedResults}
          onCaptureResults={this.onCaptureResults}
          onClearPress={this.onClearPress}
          onCardPress={this.onCardPress}
        />
      </>
    );
  };
}
