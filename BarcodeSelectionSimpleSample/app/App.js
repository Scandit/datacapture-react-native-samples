import React, { Component } from 'react';
import { AppState, BackHandler, SafeAreaView, Text, TouchableWithoutFeedback } from 'react-native';
import {
  BarcodeSelection,
  BarcodeSelectionAimerSelection,
  BarcodeSelectionBasicOverlay,
  BarcodeSelectionSettings,
  BarcodeSelectionTapSelection,
  Symbology,
  SymbologyDescription,
} from 'scandit-react-native-datacapture-barcode';
import { Camera, DataCaptureContext, DataCaptureView, FrameSourceState } from 'scandit-react-native-datacapture-core';

import { requestCameraPermissionsIfNeeded } from './camera-permission-handler';
// There is a Scandit sample license key set below here.
// This license key is enabled for sample evaluation only.
// If you want to build your own application, get your license key by signing up for a trial at https://ssl.scandit.com/dashboard/sign-up?p=test
const licenseKey = "AZ707AsCLmJWHbYO4RjqcVAEgAxmNGYcF3Ytg4RiKa/lWTQ3IXkfVZhSSi0yOzuabn9STRdnzTLybIiJVkVZU2QK5jeqbn1HGCGXQ+9lqsN8VUaTw1IeuHJo+9mYVdv3I1DhedtSy89aKA4QugKI5d9ykKaXGohXjlI+PB5ju8Tyc80FPAC3WP9D8oKBcWyemTLQjoUu0Nl3T7mVyFIXMPshQeYddkjMQ1sVV9Jcuf1CbI9riUJWzbNUb4NcB4MoV0BHuyALUPtuM2+cBkX3bPN0AxjD9WC7KflL2UrsZeenvl/aDx2yU4t5vsa2BImNTyEqdVs+rmrGUzRdbYvSUFzKBeiBncLAASqnexTuSzh9KfEm/cKrVlWekP+zOkrilICkn3KVNY6g9RQd8FrsHTBI9OBbMpC79BTwuzHcnlFUG5S3ru/viJ2+f9JEEejxDbdJ7u4JohfBuUYBSEBQ/XzEPMdpqWcmxHGWF4j7jQy83B9Wlgrhd8xNWKjgAViI0bcebjnB7o6yuKacXICH/lo787RhnXSjqjQhJBCbEvwxHQZiEfWPdVKtY7EM+x8HFr6j3orKllKOMJ9asZ5bJYz9aIHlOWeRGm90guQn0KWiPwuKbUOQIMxFAOem2zcSTt4OfqS6Ci0Y6lk7FIrgpbaz8L1PW64kkjrZB6FtQ8OppmsyZ/QTvrHYFQFTH7MpamDviRjEKMyiD2ID6ypl+Meeme6cZYRJVujr6b4tweQCsfNEYhuDiMJaWQ57R0n2XdF0zkepLVc0yA2Q3wWhxSIASLnv6GTCYYVnDJnkrr6VaTv8RVUOp8h8U34wGDanamQ+39+rESMD59E288OKgFvZZWN9Ltu/VQCcjYCYT1RTDcA9co3Y18aGpDxvtLVEGJ8QDPv1E//IYAYEhXqu8r9xbsx/hTwZmLpNKyXGPRr9+hpufTAcAj908f2kuQ=="

const SelectionType = {
  tap: 'tap',
  aim: 'aim',
}

export default class App extends Component {
  state = {
    selectionType: SelectionType.tap,
    result: null,
  }

  constructor() {
    super();

    this.dataCaptureContext = DataCaptureContext.forLicenseKey(licenseKey);
    this.viewRef = React.createRef();
  }

  async componentDidMount() {
    this.handleAppStateChangeSubscription = AppState.addEventListener('change', this.handleAppStateChange);

    this.startCamera();

    // The barcode selection process is configured through barcode selection settings
    // and are then applied to the barcode selection instance that manages barcode recognition.
    this.barcodeSelectionSettings = new BarcodeSelectionSettings();

    // The settings instance initially has all types of barcodes (symbologies) disabled. For the purpose of this
    // sample we enable a very generous set of symbologies. In your own app ensure that you only enable the
    // symbologies that your app requires as every additional enabled symbology has an impact on processing times.
    this.barcodeSelectionSettings.enableSymbologies([
      Symbology.EAN13UPCA,
      Symbology.EAN8,
      Symbology.UPCE,
      Symbology.QR,
      Symbology.DataMatrix,
      Symbology.Code39,
      Symbology.Code128,
    ]);

    // Create new barcode selection mode with the settings from above.
    this.barcodeSelection = BarcodeSelection.forContext(this.dataCaptureContext, this.barcodeSelectionSettings);

    // Register a listener to get informed whenever a new barcode got recognized.
    this.barcodeSelection.addListener({
      didUpdateSelection: (barcodeSelection, session, _) => {
        const barcode = session.newlySelectedBarcodes[0];

        if (!barcode) { return }

        const symbology = new SymbologyDescription(barcode.symbology);

        session.getCount(barcode).then(count => {
          const result = `Scan Results\n${symbology.readableName}: ${barcode.data}\nTimes: ${count}`;
          this.setState({ result: result })
          setTimeout(() => {
            this.setState({ result: null });
          }, 500);
        });
      }
    });

    // Add a barcode selection overlay to the data capture view to render the location of captured barcodes on top of
    // the video preview. This is optional, but recommended for better visual feedback.
    const overlay = BarcodeSelectionBasicOverlay.withBarcodeSelectionForView(this.barcodeSelection, this.viewRef.current);

    this.setupSelectionType(this.state.selectionType);
  }

  componentWillUnmount() {
    this.handleAppStateChangeSubscription.remove();
    this.dataCaptureContext.dispose();
  }

  handleAppStateChange = async (nextAppState) => {
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
      this.camera = Camera.withSettings(BarcodeSelection.recommendedCameraSettings);
      this.dataCaptureContext.setFrameSource(this.camera);
    }

    requestCameraPermissionsIfNeeded()
      .then(() => this.camera.switchToDesiredState(FrameSourceState.On))
      .catch(() => BackHandler.exitApp());
  }

  componentDidUpdate(_, previousState) {
    if (previousState.selectionType != this.state.selectionType) {
      this.setupSelectionType(this.state.selectionType);
    }
  }

  setupSelectionType(selectionType) {
    if (selectionType == SelectionType.tap) {
      this.barcodeSelectionSettings.selectionType = BarcodeSelectionTapSelection.tapSelection;
      this.barcodeSelection.applySettings(this.barcodeSelectionSettings);
    } else if (selectionType == SelectionType.aim) {
      this.barcodeSelectionSettings.selectionType = BarcodeSelectionAimerSelection.aimerSelection;
      this.barcodeSelection.applySettings(this.barcodeSelectionSettings);
    }
  }

  render() {
    return (
      <>
        <DataCaptureView style={{ flex: 1 }} context={this.dataCaptureContext} ref={this.viewRef}>
        </DataCaptureView>

        <SafeAreaView style={{ width: '100%', backgroundColor: "black", flexDirection: "row", justifyContent: "space-around", alignItems: 'center' }}>
          <TouchableWithoutFeedback onPress={() => this.setState({ selectionType: SelectionType.tap })}>
            <Text style={{ padding: 15, color: this.state.selectionType == SelectionType.tap ? 'white' : 'grey' }}>Tap to Select</Text>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => this.setState({ selectionType: SelectionType.aim })}>
            <Text style={{ padding: 15, color: this.state.selectionType == SelectionType.aim ? 'white' : 'grey' }}>Aim to Select</Text>
          </TouchableWithoutFeedback>
        </SafeAreaView>

        {this.state.result &&
          <Text style={{
            position: 'absolute', top: 100, width: '100%', textAlign: 'center', backgroundColor: '#FFFC', padding: 20,
          }}>{this.state.result}</Text>}
      </>
    );
  };
}
