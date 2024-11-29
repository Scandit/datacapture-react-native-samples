import React, { Component } from 'react';
import { Alert, AppState, BackHandler } from 'react-native';
import {
  Camera,
  DataCaptureContext,
  DataCaptureView,
  FrameSourceState,
} from 'scandit-react-native-datacapture-core';
import {
  IdCapture,
  IdCaptureOverlay,
  IdCaptureSettings,
  IdLayoutStyle,
  IdCard,
  IdCaptureRegion,
  DriverLicense,
  Passport,
  FullDocumentScanner,
  RejectionReason,
} from 'scandit-react-native-datacapture-id';

import { requestCameraPermissionsIfNeeded } from './camera-permission-handler';

export class App extends Component {

  constructor() {
    super();

    // Create data capture context using your license key.
    this.dataCaptureContext = DataCaptureContext.forLicenseKey('-- ENTER YOUR SCANDIT LICENSE KEY HERE --');
    this.viewRef = React.createRef();
  }

  componentDidMount() {
    this.handleAppStateChangeSubscription = AppState.addEventListener('change', this.handleAppStateChange);
    this.setupCapture();
    this.startCapture();
  }

  componentWillUnmount() {
    this.handleAppStateChangeSubscription.remove();
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
    this.idCapture.isEnabled = true;
  }

  stopCapture() {
    this.idCapture.isEnabled = false;
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
    }

    // Switch camera on to start streaming frames and enable the id capture mode.
    // The camera is started asynchronously and will take some time to completely turn on.
    requestCameraPermissionsIfNeeded()
      .then(() => this.camera.switchToDesiredState(FrameSourceState.On))
      .catch(() => BackHandler.exitApp());
  }

  setupCapture() {
    // The Id capturing process is configured through id capture settings
    // and are then applied to the id capture instance that manages id recognition.
    const settings = new IdCaptureSettings();

    // Recognize national ID cards, driver's licenses and passports.
    settings.acceptedDocuments.push(
      new IdCard(IdCaptureRegion.Any),
      new DriverLicense(IdCaptureRegion.Any),
      new Passport(IdCaptureRegion.Any)
    );
    settings.scannerType = new FullDocumentScanner();

    // Create new Id capture mode with the settings from above.
    this.idCapture = IdCapture.forContext(this.dataCaptureContext, settings);

    // Register a listener to get informed whenever a new id got recognized.
    this.idCaptureListener = {
      didCaptureId: (_, capturedId) => {
        // The `alert` call blocks execution until it's dismissed by the user. As no further frames would be processed
        // until the alert dialog is dismissed, we're showing the alert through a timeout and disabling the Id
        // capture mode until the dialog is dismissed, as you should not block the IdCaptureListener callbacks for
        // longer periods of time. See the documentation to learn more about this.
        this.idCapture.isEnabled = false;

        const result = this.descriptionForCapturedId(capturedId);

        Alert.alert(
          'Result',
          result,
          [{ text: 'OK', onPress: () => this.idCapture.isEnabled = true }],
          { cancelable: false }
        );
      },
      didRejectId: (_, rejectedId, reason) => {
        this.idCapture.isEnabled = false;
        
        Alert.alert(
          'Error',
          this.getRejectionReasonMessage(reason),
          [{ text: 'OK', onPress: () => this.idCapture.isEnabled = true }],
          { cancelable: false }
        );
      }
    };

    this.idCapture.addListener(this.idCaptureListener);

    // Add a Id capture overlay to the data capture view to render the location of captured ids on top of
    // the video preview. This is optional, but recommended for better visual feedback.
    this.overlay = IdCaptureOverlay.withIdCaptureForView(this.idCapture, this.viewRef.current);

    this.overlay.idLayoutStyle = IdLayoutStyle.Square;
  }

  descriptionForCapturedId(result) {
    return `
    Full Name: ${result.fullName}
    Date of Birth: ${this.getDateAsString(result.dateOfBirth)}
    Date of Expiry: ${this.getDateAsString(result.dateOfExpiry)}
    Document Number: ${result.documentNumber || "empty"}
    Nationality: ${result.nationality || "empty"}`
  }

  getRejectionReasonMessage(reason) {
    switch (reason) {
      case  RejectionReason.NotAcceptedDocumentType:
        return 'Document not supported. Try scanning another document.';
      case RejectionReason.Timeout:
        return 'Document capture failed. Make sure the document is well lit and free of glare. Alternatively, try scanning another document';
      default:
        return `Document capture was rejected. Reason=${reason}`;
    }
  }

  getDateAsString(dateObject) {
    return dateObject && dateObject.localDate ? dateObject.localDate
      .toLocaleDateString("en-GB") : "empty";
  }

  render() {
    return (
      <DataCaptureView style={{ flex: 1 }} context={this.dataCaptureContext} ref={this.viewRef} />
    );
  };
}
