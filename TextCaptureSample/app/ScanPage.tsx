import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AppState, AppStateStatus, BackHandler } from 'react-native';
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
import { TextCapture, TextCaptureOverlay, TextCaptureSession, TextCaptureSettings } from 'scandit-react-native-datacapture-text';

import { requestCameraPermissionsIfNeeded } from './camera-permission-handler';
import { Mode, SettingsContext } from './SettingsContext';
import { NavigationProps } from './App';

export const ScanPage = ({ navigation }: NavigationProps) => {
  const settingsContext = useContext(SettingsContext);

  const viewRef = useRef<DataCaptureView>(null);
  // Create data capture context using your license key.
  const dataCaptureContext = useMemo(() => {
    // Enter your Scandit License key here.
    // Your Scandit License key is available via your Scandit SDK web account.
    return DataCaptureContext.forLicenseKey(
      '-- ENTER YOUR SCANDIT LICENSE KEY HERE --'
    );
  }, []);

  const [camera, setCamera] = useState<Camera | null>(null);
  const parserRef = useRef<Parser | null>(null);
  const textCaptureRef = useRef<TextCapture | null>(null);
  const [cameraState, setCameraState] = useState(FrameSourceState.Off);
  const overlayRef = useRef<TextCaptureOverlay | null>(null);

  const setIsTextCaptureEnabled = (value: boolean) => {
    textCaptureRef.current.isEnabled = value;
  }

  // Settings for GS1 mode.
  const gs1Viewfinder = (() => {
    const viewfinder = new RectangularViewfinder(
      RectangularViewfinderStyle.Square,
      RectangularViewfinderLineStyle.Light,
    );
    viewfinder.dimming = 0.2;
    viewfinder.setWidthAndAspectRatio(new NumberWithUnit(0.9, MeasureUnit.Fraction), 0.2);

    viewfinder.disabledDimming = viewfinder.disabledDimming;
    viewfinder.disabledColor = viewfinder.disabledColor;

    viewfinder.disabledDimming = viewfinder.dimming;
    viewfinder.disabledColor = viewfinder.color;

    return viewfinder;
  })()
  const gs1Settings: TextCaptureSettings = (() => {
    const settings = TextCaptureSettings.fromJSON({ regex: "((\\\(\\\d+\\\)[\\\dA-Z]+)+)" })
    settings!.locationSelection = RectangularLocationSelection
      .withWidthAndAspectRatio(new NumberWithUnit(0.9, MeasureUnit.Fraction), 0.2);
    return settings!!;
  })()

  // Settings for LOT mode.
  const lotViewfinder = (() => {
    const viewfinder = new RectangularViewfinder(
      RectangularViewfinderStyle.Square,
      RectangularViewfinderLineStyle.Light,
    );
    viewfinder.dimming = 0.2;
    viewfinder.setWidthAndAspectRatio(new NumberWithUnit(0.6, MeasureUnit.Fraction), 0.2);
    return viewfinder;
  })()
  const lotSettings = (() => {
    const settings = TextCaptureSettings.fromJSON({ regex: "([A-Z0-9]{6,8})" });
    settings!.locationSelection = RectangularLocationSelection
      .withWidthAndAspectRatio(new NumberWithUnit(0.6, MeasureUnit.Fraction), 0.2);
    return settings;
  })()

  useEffect(() => {
    const handleAppStateChangeSubscription = AppState.addEventListener('change', handleAppStateChange);
    setupScanning();

    const unsubscribeFocus = navigation.addListener('focus', () => {
      startCapture();
    });

    const unsubscribeBlur = navigation.addListener('blur', () => {
      stopCapture();
    });

    return () => {
      handleAppStateChangeSubscription.remove();
      dataCaptureContext.dispose();
      unsubscribeFocus();
      unsubscribeBlur();
    }
  }, [])

  useEffect(() => {
    updateSettings();
  }, [settingsContext]);

  useEffect(() => {
    if (camera) {
        camera.switchToDesiredState(cameraState);
    }
  }, [cameraState]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState.match(/inactive|background/)) {
      stopCapture();
    } else {
      startCapture();
    }
  }

  const startCapture = () => {
    startCamera();
    setIsTextCaptureEnabled(true);
  }

  const stopCapture = () => {
    setIsTextCaptureEnabled(false);
    stopCamera();
  }

  const stopCamera = () => {
    setCameraState(FrameSourceState.Off);
  }

  const startCamera = () => {
    if (!camera) {
      // Use the world-facing (back) camera and set it as the frame source of the context. The camera is off by
      // default and must be turned on to start streaming frames to the data capture context for recognition.
      const cameraSettings = new CameraSettings();
      cameraSettings.preferredResolution = VideoResolution.FullHD;

      const defaultCamera = Camera.withSettings(cameraSettings);
      dataCaptureContext.setFrameSource(defaultCamera);

      setCamera(defaultCamera);
    }

    // Switch camera on to start streaming frames and enable the barcode tracking mode.
    // The camera is started asynchronously and will take some time to completely turn on.
    requestCameraPermissionsIfNeeded()
      .then(() => setCameraState(FrameSourceState.On))
      .catch(() => BackHandler.exitApp());
  }

  const setupScanning = () => {
    // Create a new text capture instance that manages text recognition.
    const textCapture = TextCapture.forContext(dataCaptureContext, gs1Settings);

    // Add a barcode tracking overlay to the data capture view to render the location of captured barcodes on top of
    // the video preview. This is optional, but recommended for better visual feedback.
    // BarcodeTrackingBasicOverlay.withBarcodeTrackingForView(this.textCapture, this.viewRef.current);
    const overlay = TextCaptureOverlay.withTextCaptureForView(textCapture, viewRef.current);

    // Create a new parser instance that manages parsing when in GS1 mode.
    Parser.forContextAndFormat(dataCaptureContext, ParserDataFormat.GS1AI)
      .then(parser => {
        const defaultParser = parser;
        defaultParser.setOptions({ allowHumanReadableCodes: true });
        parserRef.current = defaultParser;
      });

    // Register a listener to get informed whenever new text got recognized.
    textCapture.addListener({
      didCaptureText: (_: TextCapture, session: TextCaptureSession) => {
        const text = session.newlyCapturedTexts[0];

        if (settingsContext.mode == Mode.GS1 && parserRef.current) {
          // Parse GS1 results with the parser instance previously created.
          parserRef.current.parseString(text.value)
            .then(parsedData => showResult(parsedData.fields
              .map(field => `${field.name}: ${JSON.stringify(field.parsed)}`).join('\n')))
            .catch(err => {
              showResult(err.message)
            });
        } else {
          showResult(text.value);
        }

        setIsTextCaptureEnabled(false);
      }
    });

    overlayRef.current = overlay;
    textCaptureRef.current = textCapture;
  };

  const updateSettings = () => {
    // Set the point of interest of the capture view, which will automatically move the center of the viewfinder
    // and the location selection area to this point.
    viewRef.current!.pointOfInterest = new PointWithUnit(
      new NumberWithUnit(0.5, MeasureUnit.Fraction),
      new NumberWithUnit(settingsContext.position, MeasureUnit.Fraction),
    )

    // Apply settings for the given mode.
    textCaptureRef.current?.applySettings(settingsContext.mode === Mode.LOT ? lotSettings! : gs1Settings!);
    if (overlayRef.current) {
      overlayRef.current.viewfinder = settingsContext.mode === Mode.LOT ? lotViewfinder : gs1Viewfinder;
    }
  }

  const showResult = (result: string) => {
    gs1Viewfinder.disabledDimming = gs1Viewfinder.disabledDimming;
    gs1Viewfinder.disabledColor = gs1Viewfinder.disabledColor;

    setIsTextCaptureEnabled(false);

    Alert.alert(
      '', result,
      [{
        text: 'OK', onPress: () => {
          gs1Viewfinder.disabledDimming = gs1Viewfinder.dimming;
          gs1Viewfinder.disabledColor = gs1Viewfinder.color;

          setIsTextCaptureEnabled(true);
        }
      }],
      { cancelable: false }
    );
  }

  return <DataCaptureView style={{ flex: 1 }} context={dataCaptureContext} ref={viewRef} />;
}
