import React, { Component } from 'react';
import { Alert, AppState, BackHandler } from 'react-native';
import {
  Camera,
  CameraSettings,
  DataCaptureContext,
  DataCaptureView,
  FrameSourceState,
  MeasureUnit,
  NumberWithUnit,
  PointWithUnit,
  RectangularLocationSelection,
  RectangularViewfinder,
  RectangularViewfinderLineStyle,
  RectangularViewfinderStyle,
  VideoResolution,
} from 'scandit-react-native-datacapture-core';
import { Parser, ParserDataFormat } from 'scandit-react-native-datacapture-parser';
import { TextCapture, TextCaptureOverlay, TextCaptureSettings } from 'scandit-react-native-datacapture-text';

import { requestCameraPermissionsIfNeeded } from './camera-permission-handler';
import { Mode, SettingsContext } from './SettingsContext';

export class ScanPage extends Component {
  static contextType = SettingsContext;

  // Settings for GS1 mode.
  gs1Viewfinder = (() => {
    const viewfinder = new RectangularViewfinder(
      RectangularViewfinderStyle.Square,
      RectangularViewfinderLineStyle.Light,
    );
    viewfinder.dimming = 0.2;
    viewfinder.setWidthAndAspectRatio(new NumberWithUnit(0.9, MeasureUnit.Fraction), 0.2);

    viewfinder.defaultDisabledDimming = viewfinder.disabledDimming;
    viewfinder.defaultDisabledColor = viewfinder.disabledColor;

    viewfinder.disabledDimming = viewfinder.dimming;
    viewfinder.disabledColor = viewfinder.color;

    return viewfinder;
  })()
  gs1Settings = (() => {
    const settings = TextCaptureSettings.fromJSON({ regex: "((\\\(\\\d+\\\)[\\\dA-Z]+)+)" })
    settings.locationSelection = RectangularLocationSelection
      .withWidthAndAspectRatio(new NumberWithUnit(0.9, MeasureUnit.Fraction), 0.2);
    return settings;
  })()

  // Settings for LOT mode.
  lotViewfinder = (() => {
    const viewfinder = new RectangularViewfinder(
      RectangularViewfinderStyle.Square,
      RectangularViewfinderLineStyle.Light,
    );
    viewfinder.dimming = 0.2;
    viewfinder.setWidthAndAspectRatio(new NumberWithUnit(0.6, MeasureUnit.Fraction), 0.2);
    return viewfinder;
  })()
  lotSettings = (() => {
    const settings = TextCaptureSettings.fromJSON({ regex: "([A-Z0-9]{6,8})" });
    settings.locationSelection = RectangularLocationSelection
      .withWidthAndAspectRatio(new NumberWithUnit(0.6, MeasureUnit.Fraction), 0.2);
    return settings;
  })()

  constructor() {
    super();

    // Create data capture context using your license key.
    this.dataCaptureContext = DataCaptureContext.forLicenseKey('-- ENTER YOUR SCANDIT LICENSE KEY HERE --');
    this.viewRef = React.createRef();
  }

  componentDidMount() {
    this.handleAppStateChangeSubscription = AppState.addEventListener('change', this.handleAppStateChange);
    this.setupScanning();
    this.startCapture();

    this.unsubscribeFocus = this.props.navigation.addListener('focus', () => {
      this.updateSettings();
      this.startCapture();
    });

    this.unsubscribeBlur = this.props.navigation.addListener('blur', () => {
      this.stopCapture();
    });
  }

  componentWillUnmount() {
    this.handleAppStateChangeSubscription.remove();
    this.dataCaptureContext.dispose();
    this.unsubscribeFocus();
    this.unsubscribeBlur();
  }

  handleAppStateChange = async (nextAppState) => {
    console.log('state change')
    if (nextAppState.match(/inactive|background/)) {
      this.stopCapture();
    } else {
      this.startCapture();
    }
  }

  startCapture() {
    this.startCamera();
    this.textCapture.isEnabled = true;
  }

  stopCapture() {
    this.textCapture.isEnabled = false;
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
    // Create a new text capture instance that manages text recognition.
    this.textCapture = TextCapture.forContext(this.dataCaptureContext);

    // Add a barcode tracking overlay to the data capture view to render the location of captured barcodes on top of
    // the video preview. This is optional, but recommended for better visual feedback.
    // BarcodeTrackingBasicOverlay.withBarcodeTrackingForView(this.textCapture, this.viewRef.current);
    this.overlay = TextCaptureOverlay.withTextCaptureForView(this.textCapture, this.viewRef.current);

    this.updateSettings();

    // Create a new parser instance that manages parsing when in GS1 mode.
    Parser.forContextAndFormat(this.dataCaptureContext, ParserDataFormat.GS1AI)
      .then(parser => {
        this.parser = parser;
        parser.setOptions({ allowHumanReadableCodes: true });
      });

    // Register a listener to get informed whenever new text got recognized.
    this.textCapture.addListener({
      didCaptureText: (textCapture, session) => {
        const text = session.newlyCapturedTexts[0];

        if (this.context.settings.mode == Mode.GS1) {
          // Parse GS1 results with the parser instance previously created.
          this.parser.parseString(text.value)
            .then(parsedData => this.showResult(parsedData.fields
              .map(field => `${field.name}: ${JSON.stringify(field.parsed)}`).join('\n')))
            .catch(error => this.textCapture.isEnabled = true);
        } else {
          this.showResult(text.value);
        }

        this.textCapture.isEnabled = false;
      }
    });
  }

  updateSettings() {
    // Set the point of interest of the capture view, which will automatically move the center of the viewfinder
    // and the location selection area to this point.
    this.viewRef.current.pointOfInterest = new PointWithUnit(
      new NumberWithUnit(0.5, MeasureUnit.Fraction),
      new NumberWithUnit(this.context.settings.position, MeasureUnit.Fraction),
    )

    // Apply settings for the given mode.
    this.textCapture.applySettings(this.context.settings.mode === Mode.LOT ? this.lotSettings : this.gs1Settings);
    this.overlay.viewfinder = this.context.settings.mode === Mode.LOT ? this.lotViewfinder : this.gs1Viewfinder;
  }

  showResult(result) {
    this.gs1Viewfinder.disabledDimming = this.gs1Viewfinder.defaultDisabledDimming;
    this.gs1Viewfinder.disabledColor = this.gs1Viewfinder.defaultDisabledColor;

    this.textCapture.isEnabled = false;

    Alert.alert(
      null, result,
      [{
        text: 'OK', onPress: () => {
          this.gs1Viewfinder.disabledDimming = this.gs1Viewfinder.dimming;
          this.gs1Viewfinder.disabledColor = this.gs1Viewfinder.color;

          this.textCapture.isEnabled = true;
        }
      }],
      { cancelable: false }
    );
  }

  render() {
    return <DataCaptureView style={{ flex: 1 }} context={this.dataCaptureContext} ref={this.viewRef} />;
  };
}
