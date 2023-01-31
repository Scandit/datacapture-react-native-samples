import React, { Component } from 'react';
import { AppState, BackHandler, Image, SafeAreaView, Text, TouchableWithoutFeedback, View } from 'react-native';
import {
  BarcodeCapture,
  BarcodeCaptureOverlay,
  BarcodeCaptureSettings,
  BarcodeTracking,
  BarcodeTrackingAdvancedOverlay,
  BarcodeTrackingAdvancedOverlayView,
  BarcodeTrackingScenario,
  BarcodeTrackingSettings,
  Symbology,
} from 'scandit-react-native-datacapture-barcode';
import {
  Brush,
  Color,
  Anchor,
  Camera,
  CameraSettings,
  DataCaptureContext,
  DataCaptureView,
  FrameSourceState,
  MeasureUnit,
  NumberWithUnit,
  PointWithUnit,
  RectangularViewfinder,
  RectangularViewfinderStyle,
  RectangularViewfinderLineStyle,
  VideoResolution,
} from 'scandit-react-native-datacapture-core';

import { requestCameraPermissionsIfNeeded } from './camera-permission-handler';

const licenseKey = "-- ENTER YOUR SCANDIT LICENSE KEY HERE --"

const ScanningMode = {
  product: 'product',
  stock: 'stock',
}

// The component must be registered and must either have a static and instance property `moduleName` by
// which it's registered, or must inherit from `BarcodeTrackingAdvancedOverlayView`.
// See: `AppRegistry.registerComponent(ARView.moduleName, () => ARView)` in index.js
export class ARView extends BarcodeTrackingAdvancedOverlayView {
  state = { showBarcodeData: false }

  render() {
    // The text content of the bubble, switching between stock information and the barcode data.
    let bubbleContent;
    if (this.state.showBarcodeData) {
      bubbleContent = <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{this.props.barcodeData}</Text>
    } else {
      bubbleContent = <>
        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>Report Stock Count</Text>
        <Text style={{ fontSize: 12 }}>Shelf: {this.props.stock.shelf} Back Room: {this.props.stock.backRoom}</Text>
      </>
    }

    return (
      <TouchableWithoutFeedback onPress={() => this.setState({ showBarcodeData: !this.state.showBarcodeData })}>
        <View style={{ width: 200, height: 50, backgroundColor: '#FFFE', borderRadius: 25, flexDirection: 'row' }}>
          <View style={{ width: 50, height: 50, backgroundColor: '#52C2B6', borderRadius: 25 }}>
            <Image style={{ width: 50, height: 50 }} source={require('./StockCountIcon.png')}></Image>
          </View>
          <View style={{ width: 150, height: 50, justifyContent: 'center', paddingLeft: 10 }}>
            {bubbleContent}
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

export class MainScreen extends Component {
  state = {
    mode: ScanningMode.product,
  }

  constructor({ navigation }) {
    super();

    this.dataCaptureContext = DataCaptureContext.forLicenseKey(licenseKey);
    this.viewRef = React.createRef();
    this.navigation = navigation;
  }

  async componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
    this.unsubscribeFocusListener = this.navigation.addListener('focus', () => {
      this.startCamera();
      if (this.captureMode) {
        this.captureMode.isEnabled = true;
      }
    })
    this.unsubscribeBlurListener = this.navigation.addListener('blur', () => {
      this.stopCamera();
      if (this.captureMode) {
        this.captureMode.isEnabled = false;
      }
    })

    this.startCamera();
    this.setupScanningMode(this.state.mode);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
    this.unsubscribeFocusListener();
    this.unsubscribeBlurListener();
    this.dataCaptureContext.dispose();
  }

  handleAppStateChange = async (nextAppState) => {
    if (!this.navigation.isFocused()) { return }

    if (nextAppState.match(/inactive|background/)) {
      this.stopCamera();
    } else {
      this.startCamera();
    }
  }

  stopCamera() {
    if (this.camera) {
      this.camera.switchToDesiredState(FrameSourceState.Off);
    }
  }

  startCamera() {
    if (!this.camera) {
      this.camera = Camera.default;
      this.dataCaptureContext.setFrameSource(this.camera);

      const cameraSettings = new CameraSettings();
      cameraSettings.preferredResolution = VideoResolution.FullHD;
      this.camera.applySettings(cameraSettings);
    }

    requestCameraPermissionsIfNeeded()
      .then(() => this.camera.switchToDesiredState(FrameSourceState.On))
      .catch(() => BackHandler.exitApp());
  }

  componentDidUpdate(_, previousState) {
    if (previousState.mode == this.state.mode) { return }

    if (this.captureMode) {
      this.viewRef.current.removeOverlay(this.overlay);
      this.dataCaptureContext.removeMode(this.captureMode);
      this.captureMode.removeListener(this.listener);
    }

    this.setupScanningMode(this.state.mode);
  }

  setupScanningMode(mode) {
    if (mode == ScanningMode.product) {
      this.setupProductScanning();
    } else if (mode == ScanningMode.stock) {
      this.setupStockScanning();
    }
  }

  setupProductScanning() {
    const settings = new BarcodeCaptureSettings();
    settings.enableSymbologies([Symbology.EAN13UPCA, Symbology.Code128]);
    this.barcodeCaptureMode = BarcodeCapture.forContext(null, settings);

    this.barcodeCaptureOverlay = BarcodeCaptureOverlay.withBarcodeCaptureForView(this.barcodeCaptureMode, null);
    this.barcodeCaptureOverlay.viewfinder = new RectangularViewfinder(
        RectangularViewfinderStyle.Square,
        RectangularViewfinderLineStyle.Light,
    );

    this.barcodeCaptureListener = {
      didScan: (_, session) => {
        this.captureMode.isEnabled = false;
        this.showProductDetails(session.newlyRecognizedBarcodes[0]);
      }
    };

    this.captureMode = this.barcodeCaptureMode;
    this.overlay = this.barcodeCaptureOverlay;
    this.listener = this.barcodeCaptureListener;
    this.dataCaptureContext.addMode(this.captureMode);
    this.captureMode.addListener(this.listener);
    this.viewRef.current.addOverlay(this.overlay);
  }

  setupStockScanning() {
    const settings = BarcodeTrackingSettings.forScenario(BarcodeTrackingScenario.A);
    settings.enableSymbologies([Symbology.EAN13UPCA, Symbology.Code128]);

    this.barcodeTrackingMode = BarcodeTracking.forContext(null, settings);

    this.barcodeTrackingAdvancedOverlay = BarcodeTrackingAdvancedOverlay.withBarcodeTrackingForView(this.captureMode, null);
    this.barcodeTrackingAdvancedOverlay.listener = {
      viewForTrackedBarcode: (_, trackedBarcode) => new ARView({
        barcodeData: trackedBarcode.barcode.data,
        // Get the information you want to show from your back end system/database.
        stock: {
          shelf: 4,
          backRoom: 8,
        }
      }),

      anchorForTrackedBarcode: () => Anchor.TopCenter,
      offsetForTrackedBarcode: () => new PointWithUnit(
        new NumberWithUnit(0, MeasureUnit.Fraction),
        new NumberWithUnit(-1, MeasureUnit.Fraction)
      )
    };

    this.captureMode = this.barcodeTrackingMode;
    this.overlay = this.barcodeTrackingAdvancedOverlay;
    this.dataCaptureContext.addMode(this.captureMode);
    this.viewRef.current.addOverlay(this.overlay);
  }

  showProductDetails(barcode) {
    this.navigation.navigate('Product Details', { barcodeData: barcode.data });
  }

  render() {
    return (
      <>
        <DataCaptureView style={{ flex: 1 }} context={this.dataCaptureContext} ref={this.viewRef}>
        </DataCaptureView>

        <SafeAreaView style={{ width: '100%', backgroundColor: "black", flexDirection: "row", justifyContent: "space-around", alignItems: 'center' }}>
          <TouchableWithoutFeedback onPress={() => this.setState({ mode: ScanningMode.product })}>
            <Text style={{ padding: 15, color: this.state.mode == ScanningMode.product ? 'white' : 'grey' }}>Product</Text>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => this.setState({ mode: ScanningMode.stock })}>
            <Text style={{ padding: 15, color: this.state.mode == ScanningMode.stock ? 'white' : 'grey' }}>Stock</Text>
          </TouchableWithoutFeedback>
        </SafeAreaView>
      </>
    );
  };
}
