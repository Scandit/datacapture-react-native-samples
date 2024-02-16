import React, { Component } from 'react';
import { AppState, BackHandler, Dimensions, SafeAreaView } from 'react-native';
import {
  BarcodeTracking,
  BarcodeTrackingAdvancedOverlay,
  BarcodeTrackingBasicOverlay,
  BarcodeTrackingBasicOverlayStyle,
  BarcodeTrackingScenario,
  BarcodeTrackingSettings,
  Symbology,
} from 'scandit-react-native-datacapture-barcode';
import {
  Anchor,
  Camera,
  DataCaptureContext,
  DataCaptureView,
  FrameSourceState,
  MeasureUnit,
  NumberWithUnit,
  PointWithUnit,
  Quadrilateral,
  VideoResolution,
} from 'scandit-react-native-datacapture-core';

import { ARView } from './ARView';
import { requestCameraPermissionsIfNeeded } from './camera-permission-handler';
import Freeze from './Freeze.svg';
import { styles } from './styles';
import Unfreeze from './Unfreeze.svg';

// Calculate the width of a quadrilateral (barcode location) based on it's corners.
Quadrilateral.prototype.width = function () {
  return Math.max(
    Math.abs(this.topRight.x - this.topLeft.x),
    Math.abs(this.bottomRight.x - this.bottomLeft.x),
  );
};

export class App extends Component {
  constructor() {
    super();

    // There is a Scandit sample license key set below here.
    // This license key is enabled for sample evaluation only.
    // If you want to build your own application, get your license key by signing up for a trial at https://ssl.scandit.com/dashboard/sign-up?p=test
    this.dataCaptureContext = DataCaptureContext.forLicenseKey('AfUkdmKlRiP5FdlOFQnOhu4V3j5LFKttPGTWXFd7CkuRaTAstDqq78RrBm2ZG9LRu1T8CNgP6oLScGrUoEwfmP1TUXonIGCl2g9Fo5NYtmK/aEV8FX/YcdRKfWS5bJrTcWGDHdcsJxT6Me5C3RMdWZkdqeR5GEjDzT6dO4ZPWOBbNLjpkgZ0/MjtYQPKqSV+bSZC7+ekFaXovSKWfXV89BXtta/6sZHFJOMKxyvzh6zw5yA+NDR67OXoWKCrrNq4AOuBlt1ZelIHCqjQgTy/SZG110eJr5e4pth38Bx0fXE8FGX92BoxwJr1EG+P5CEJF8EFMy2zf87aJQYuzHmg0nM7czcNqLUd9F23uxntZYjKlwgWmmSzev/ozaumEvbW9RVW1bUQmV8pQ1SWILBuzQPeAw8iWOWgnTH18tH7cT+fUJumvM2rn7LWx9JYLAKBKRuwe2sDh3l5eqobZKdarIRsKVgXa4pw+gkYKuplzTo+Bzh70rbmtgq3IJ8hSpdoZITzfUQSwXkrgdQa5Cmrpxz9gXManBRt01h3eFXG7znZU9w0+uzzV/b5e6MQcPncODrCQOq0kfEBYgRoLAwVCOKnxyWQkqRbUpsTN2wy2MTg10flYhR/zf1eXdiUjgPUhWj8LtmgxJELYky7uMu46abfCkAw73e+12iJmlf9/tmTFk34La9ZQiF/BYps5h327ZW8qobay+Esx1i9dsaFKYt/nCN8jZdUYD/df+/vApyK4PMbph9EPRe5u0alg8BqpEExnkQsy1W7r85yngO/rxSXsY6rTMoTXb/87ul8uQnsrD41ZLtFdzo0OlbNTeNOI1mJz/E6/SOLbRRK');

    this.viewRef = React.createRef();

    this.trackedBarcodes = {};
    this.state = { scanning: true };
  }

  componentDidMount() {
    this.handleAppStateChangeSubscription = AppState.addEventListener('change', this.handleAppStateChange);
    this.setupScanning();
    this.startCapture();
  }

  componentWillUnmount() {
    this.handleAppStateChangeSubscription.remove();
    this.dataCaptureContext.dispose();
  }

  handleAppStateChange = async (nextAppState) => {
    if (nextAppState.match(/inactive|background/)) {
      this.stopCapture();
    } else if (this.state.scanning) {
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

      const cameraSettings = BarcodeTracking.recommendedCameraSettings;
      cameraSettings.preferredResolution = VideoResolution.UHD4K;
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
    const settings = BarcodeTrackingSettings.forScenario(BarcodeTrackingScenario.A);

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

    // Create new barcode tracking mode with the settings from above.
    this.barcodeTracking = BarcodeTracking.forContext(this.dataCaptureContext, settings);

    // Register a listener to get informed whenever a new barcode is tracked.
    this.barcodeTrackingListener = {
      // This function is called whenever objects are updated and it's the right place to react to the tracking results.
      didUpdateSession: (barcodeTracking, session) => {
        // Remove information about tracked barcodes that are no longer tracked.
        session.removedTrackedBarcodes.forEach((identifier) => {
          this.trackedBarcodes[identifier] = null;
        });

        // Update AR views
        Object.values(session.trackedBarcodes).forEach((trackedBarcode) => {
          this.viewRef.current.viewQuadrilateralForFrameQuadrilateral(trackedBarcode.location)
            .then((location) => this.updateView(trackedBarcode, location));
        });
      },
    };

    this.barcodeTracking.addListener(this.barcodeTrackingListener);

    // Add a barcode tracking overlay to the data capture view to render the tracked barcodes on top of the video
    // preview. This is optional, but recommended for better visual feedback. The overlay is automatically added
    // to the view.
    BarcodeTrackingBasicOverlay.withBarcodeTrackingForViewWithStyle(
        this.barcodeTracking,
        this.viewRef.current,
        BarcodeTrackingBasicOverlayStyle.Dot
    );

    // Add an advanced barcode tracking overlay to the data capture view to render AR visualization on top of
    // the camera preview.
    this.advancedOverlay = BarcodeTrackingAdvancedOverlay.withBarcodeTrackingForView(
      this.barcodeTracking,
      this.viewRef.current,
    );

    this.advancedOverlay.listener = {
      // The offset of our overlay will be calculated from the center anchoring point.
      anchorForTrackedBarcode: () => Anchor.TopCenter,
      // We set the offset's height to be equal of the 100 percent of our overlay.
      // The minus sign means that the overlay will be above the barcode.
      offsetForTrackedBarcode: () => new PointWithUnit(
        new NumberWithUnit(0, MeasureUnit.Fraction),
        new NumberWithUnit(-1, MeasureUnit.Fraction),
      ),
    };
  }

  updateView(trackedBarcode, viewLocation) {
    // If the barcode is wider than the desired percent of the data capture view's width, show it to the user.
    const shouldBeShown = viewLocation.width() > Dimensions.get('window').width * 0.1;

    if (!shouldBeShown) {
      this.trackedBarcodes[trackedBarcode.identifier] = null;
      return;
    }

    const barcodeData = trackedBarcode.barcode.data;

    // The AR view associated with the tracked barcode should only be set again if it was changed,
    // to avoid unnecessarily recreating it.
    const didViewChange = JSON.stringify(this.trackedBarcodes[trackedBarcode.identifier]) !== JSON.stringify(barcodeData);

    if (didViewChange) {
      this.trackedBarcodes[trackedBarcode.identifier] = barcodeData;

      const props = {
        barcodeData,
        // Get the information you want to show from your back end system/database.
        stock: { shelf: 4, backRoom: 8 }
      };

      this.advancedOverlay
        .setViewForTrackedBarcode(new ARView(props), trackedBarcode)
        .catch(console.warn);
    }
  }

  toggleScan = () => {
    const isScanning = this.barcodeTracking.isEnabled;

    // Toggle barcode tracking to stop or start processing frames.
    this.barcodeTracking.isEnabled = !isScanning;
    // Switch the camera on or off to toggle streaming frames. The camera is stopped asynchronously.
    this.camera.switchToDesiredState(isScanning ? FrameSourceState.Off : FrameSourceState.On);
    this.setState({ scanning: this.barcodeTracking.isEnabled });
  };

  render() {
    return (
      <>
        <DataCaptureView style={styles.dataCaptureView} context={this.dataCaptureContext} ref={this.viewRef} />
        <SafeAreaView style={styles.toggleContainer}>
          {this.state.scanning ? <Freeze onPress={this.toggleScan} /> : <Unfreeze onPress={this.toggleScan} />}
        </SafeAreaView>
      </>
    );
  }
}
