import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AppState, AppStateStatus, BackHandler } from 'react-native';
import {
  BarcodeCapture,
  BarcodeCaptureFeedback,
  BarcodeCaptureOverlay,
  BarcodeCaptureOverlayStyle,
  BarcodeCaptureSession,
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

export const App = () => {

  const viewRef = useRef<DataCaptureView>(null);
  // Create data capture context using your license key.
  const dataCaptureContext = useMemo(() => {
    // There is a Scandit sample license key set below here.
	  // This license key is enabled for sample evaluation only.
	  // If you want to build your own application, get your license key
    // by signing up for a trial at https://ssl.scandit.com/dashboard/sign-up?p=test
    return DataCaptureContext.forLicenseKey(
      'AZ707AsCLmJWHbYO4RjqcVAEgAxmNGYcF3Ytg4RiKa/lWTQ3IXkfVZhSSi0yOzuabn9STRdnzTLybIiJVkVZU2QK5jeqbn1HGCGXQ+9lqsN8VUaTw1IeuHJo+9mYVdv3I1DhedtSy89aKA4QugKI5d9ykKaXGohXjlI+PB5ju8Tyc80FPAC3WP9D8oKBcWyemTLQjoUu0Nl3T7mVyFIXMPshQeYddkjMQ1sVV9Jcuf1CbI9riUJWzbNUb4NcB4MoV0BHuyALUPtuM2+cBkX3bPN0AxjD9WC7KflL2UrsZeenvl/aDx2yU4t5vsa2BImNTyEqdVs+rmrGUzRdbYvSUFzKBeiBncLAASqnexTuSzh9KfEm/cKrVlWekP+zOkrilICkn3KVNY6g9RQd8FrsHTBI9OBbMpC79BTwuzHcnlFUG5S3ru/viJ2+f9JEEejxDbdJ7u4JohfBuUYBSEBQ/XzEPMdpqWcmxHGWF4j7jQy83B9Wlgrhd8xNWKjgAViI0bcebjnB7o6yuKacXICH/lo787RhnXSjqjQhJBCbEvwxHQZiEfWPdVKtY7EM+x8HFr6j3orKllKOMJ9asZ5bJYz9aIHlOWeRGm90guQn0KWiPwuKbUOQIMxFAOem2zcSTt4OfqS6Ci0Y6lk7FIrgpbaz8L1PW64kkjrZB6FtQ8OppmsyZ/QTvrHYFQFTH7MpamDviRjEKMyiD2ID6ypl+Meeme6cZYRJVujr6b4tweQCsfNEYhuDiMJaWQ57R0n2XdF0zkepLVc0yA2Q3wWhxSIASLnv6GTCYYVnDJnkrr6VaTv8RVUOp8h8U34wGDanamQ+39+rESMD59E288OKgFvZZWN9Ltu/VQCcjYCYT1RTDcA9co3Y18aGpDxvtLVEGJ8QDPv1E//IYAYEhXqu8r9xbsx/hTwZmLpNKyXGPRr9+hpufTAcAj908f2kuQ=='
    );
  }, []);

  const [camera, setCamera] = useState<Camera | null>(null);
  const [barcodeCaptureMode, setBarcodeCaptureMode] = useState<BarcodeCapture | null>(null);
  const [isBarcodeCaptureEnabled, setIsBarcodeCaptureEnabled] = useState(false);
  const [cameraState, setCameraState] = useState(FrameSourceState.Off);

  // Due to a React Native issue with firing the AppState 'change' event on iOS, we want to avoid triggering
  // a startCapture/stopCapture on the scanner twice in a row. We work around this by keeping track of the
  // latest command that was run, and skipping a repeated call for starting or stopping scanning.
  const lastCommand = useRef<string | null>(null);

  useEffect(() => {
    const handleAppStateChangeSubscription = AppState.addEventListener('change', handleAppStateChange);
    setupScanning();
    startCapture();
    return () => {
      handleAppStateChangeSubscription.remove();
      stopCapture();
      dataCaptureContext.dispose();
    }
  }, []);

  useEffect(() => {
    if (camera) {
      camera.switchToDesiredState(cameraState);
    }
  }, [cameraState]);

  useEffect(() => {
    if (barcodeCaptureMode) {
      barcodeCaptureMode.isEnabled = isBarcodeCaptureEnabled;
    }
  }, [isBarcodeCaptureEnabled]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState.match(/inactive|background/)) {
      stopCapture();
    } else {
      startCapture();
    }
  }

  const startCapture = () => {
    if (lastCommand.current === 'startCapture') {
      return;
    }
    lastCommand.current = 'startCapture';
    startCamera();
    setIsBarcodeCaptureEnabled(true);
  }

  const stopCapture = () => {
    if (lastCommand.current === 'stopCapture') {
      return;
    }
    lastCommand.current = 'stopCapture';
    setIsBarcodeCaptureEnabled(false);
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

    // Switch camera on to start streaming frames and enable the barcode capture mode.
    // The camera is started asynchronously and will take some time to completely turn on.
    requestCameraPermissionsIfNeeded()
      .then(() => setCameraState(FrameSourceState.On))
      .catch(() => BackHandler.exitApp());
  }

  const setupScanning = () => {
    // The barcode capturing process is configured through barcode capture settings
    // and are then applied to the barcode capture instance that manages barcode recognition.
    const settings = new BarcodeCaptureSettings();

    // The settings instance initially has all types of barcodes (symbologies) disabled. For the purpose of this
    // sample we enable the QR symbology. In your own app ensure that you only enable the symbologies that your app
    // requires as every additional enabled symbology has an impact on processing times.
    settings.enableSymbologies([Symbology.QR]);

    // Create new barcode capture mode with the settings from above.
    const barcodeCapture = BarcodeCapture.forContext(dataCaptureContext, settings);

    // By default, every time a barcode is scanned, a sound (if not in silent mode) and a vibration are played.
    // In the following we are setting a success feedback without sound and vibration.
    const feedback = BarcodeCaptureFeedback.default;
    feedback.success = new Feedback(null, null);
    barcodeCapture.feedback = feedback;

    // Register a listener to get informed whenever a new barcode got recognized.
    const barcodeCaptureListener = {
      didScan: (_: BarcodeCapture, session: BarcodeCaptureSession) => {
        const barcode = session.newlyRecognizedBarcodes[0];
        const symbology = new SymbologyDescription(barcode.symbology);

        // If the code scanned doesn't start with '09:', we will just ignore it and continue scanning.
        if (!barcode.data?.startsWith('09:')) {
          overlay.brush = Brush.transparent;
          return;
        }

        // Stop recognizing barcodes for as long as we are displaying the result. There won't be any
        // new results until the capture mode is enabled again. Note that disabling the capture mode
        // does not stop the camera, the camera continues to stream frames until it is turned off.
        setIsBarcodeCaptureEnabled(false);

        overlay.brush = new Brush(Color.fromHex('FFF0'), Color.fromHex('FFFF'), 3);

        Feedback.defaultFeedback.emit()

        Alert.alert(
          '',
          `Scanned: ${barcode.data} (${symbology.readableName})`,
          [{ text: 'OK', onPress: () => setIsBarcodeCaptureEnabled(true) }],
          { cancelable: false }
        );
      }
    };

    barcodeCapture.addListener(barcodeCaptureListener);

    // Add a barcode capture overlay to the data capture view to render the location of captured barcodes on top of
    // the video preview, using the Frame overlay style. This is optional, but recommended for better visual feedback.
    const overlay = BarcodeCaptureOverlay.withBarcodeCaptureForViewWithStyle(
        barcodeCapture,
        null,
        BarcodeCaptureOverlayStyle.Frame
    );

    overlay.brush = Brush.transparent;

    // Add a square viewfinder as we are only scanning square QR codes.
    overlay.viewfinder = new RectangularViewfinder(
        RectangularViewfinderStyle.Square,
        RectangularViewfinderLineStyle.Light,
    );

    viewRef.current?.addOverlay(overlay);

    setBarcodeCaptureMode(barcodeCapture);
  }

  return (
    <DataCaptureView style={{ flex: 1 }} context={dataCaptureContext} ref={viewRef} />
  );
}
