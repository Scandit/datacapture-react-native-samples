import React, { useEffect, useRef } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import {
  BarcodeCapture,
  BarcodeCaptureOverlay,
  BarcodeCaptureSession,
  BarcodeCaptureSettings,
  Symbology,
  SymbologyDescription,
} from 'scandit-react-native-datacapture-barcode';
import {
  Camera,
  CameraSettings,
  DataCaptureView,
  FrameSourceState,
  RectangularViewfinder,
  RectangularViewfinderStyle,
  RectangularViewfinderLineStyle,
  VideoResolution,
} from 'scandit-react-native-datacapture-core';

import dataCaptureContext from './CaptureContext';

export const ScanPage = () => {

  const viewRef = useRef<DataCaptureView>(null);
  const barcodeCaptureMode = useRef<BarcodeCapture>(null!);
  if (!barcodeCaptureMode.current) {
    barcodeCaptureMode.current = setupScanning();
  }

  const camera = useRef<Camera | null>(null);

  const overlayRef = useRef<BarcodeCaptureOverlay>(null!);
  if (!overlayRef.current) {
    overlayRef.current = setupOverlay();
  }

  useEffect(() => {
    const initCamera = async () => {
      if (!camera.current) {
        camera.current = await setupCamera();
      }
    };

    initCamera();

    const handleAppStateChangeSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      handleAppStateChangeSubscription.remove();
      stopCapture();
      dataCaptureContext.removeMode(barcodeCaptureMode.current);
    }
  }, []);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState.match(/inactive|background/)) {
      stopCapture();
    } else {
      startCapture();
    }
  };

  async function setupCamera(): Promise<Camera> {
    // Use the world-facing (back) camera and set it as the frame source of the context. The camera is off by
    // default and must be turned on to start streaming frames to the data capture context for recognition.
    const cameraSettings = new CameraSettings();
    cameraSettings.preferredResolution = VideoResolution.FullHD;
    const camera = Camera.withSettings(cameraSettings);

    // Camera is null if the camera is not available on the device.
    if (!camera) {
      throw new Error('Failed to initialize camera - camera not available on device');
    }
    // Switch the camera on to start streaming frames and enable the barcode capture mode.
    await camera.switchToDesiredState(FrameSourceState.On);
    // Set the camera as the frame source of the data capture context.
    await dataCaptureContext.setFrameSource(camera);
    return camera;
  }

  function setupScanning(): BarcodeCapture {

    // The barcode capturing process is configured through barcode capture settings
    // and are then applied to the barcode capture instance that manages barcode recognition.
    const settings = new BarcodeCaptureSettings();

    // The settings instance initially has all types of barcodes (symbologies) disabled. For the purpose of this
    // sample we enable a very generous set of symbologies. In your own app ensure that you only enable the
    // symbologies that your app requires as every additional enabled symbology has an impact on processing times.
    settings.enableSymbologies([
      Symbology.EAN13UPCA,
      Symbology.EAN8,
      Symbology.UPCE,
      Symbology.QR,
      Symbology.DataMatrix,
      Symbology.Code39,
      Symbology.Code128,
      Symbology.InterleavedTwoOfFive,
    ]);

    // Some linear/1d barcode symbologies allow you to encode variable-length data. By default, the Scandit
    // Data Capture SDK only scans barcodes in a certain length range. If your application requires scanning of one
    // of these symbologies, and the length is falling outside the default range, you may need to adjust the "active
    // symbol counts" for this symbology. This is shown in the following few lines of code for one of the
    // variable-length symbologies.
    const symbologySettings = settings.settingsForSymbology(Symbology.Code39);
    symbologySettings.activeSymbolCounts = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

    // Create new barcode capture mode with the settings from above.
    const barcodeCapture = new BarcodeCapture(settings);

    // By default, every time a barcode is scanned, a sound (if not in silent mode) and a vibration are played.
    // Uncomment the following lines to set a success feedback without sound and vibration.
    // const feedback = BarcodeCaptureFeedback.default;
    // feedback.success = new Feedback(null, null);
    // barcodeCapture.feedback = feedback;
    // Uncomment the following line to set a success feedback without sound and vibration.
    // const defaultFeedback = Feedback.defaultFeedback;

    // Register a listener to get informed whenever a new barcode got recognized.
    const barcodeCaptureListener = {
      didScan: async (_: BarcodeCapture, session: BarcodeCaptureSession) => {
        const barcode = session.newlyRecognizedBarcode;
        if (barcode == null) return;

        const symbology = new SymbologyDescription(barcode.symbology);

        // The `alert` call blocks execution until it's dismissed by the user. As no further frames would be processed
        // until the alert dialog is dismissed, we're showing the alert through a timeout and disabling the barcode
        // capture mode until the dialog is dismissed, as you should not block the BarcodeCaptureListener callbacks for
        // longer periods of time. See the documentation to learn more about this.
        barcodeCapture.isEnabled = false;

        // Use the following code to reject barcodes.
        // By uncommenting the following lines, barcodes not starting with 09: are ignored.
        // if (!barcode.data?.startsWith('09:')) {
        //    // We temporarily change the brush, used to highlight recognized barcodes, to a transparent brush.
        //   overlay.brush = Brush.transparent;
        //   return;
        // }
        // Otherwise, if the barcode is of interest, we want to use a brush to highlight it.
        // overlay.brush = new Brush(
        //   Color.fromHex('FFF0'),
        //   Color.fromHex('FFFF'),
        //   3
        // );

        // We also want to emit a feedback (vibration and, if enabled, sound).
        // By default, every time a barcode is scanned, a sound (if not in silent mode) and a vibration are played.
        // To emit a feedback only when necessary, it is necessary to set a success feedback without sound and
        // vibration when setting up Barcode Capture (in this case in the `setupScanning`).
        // defaultFeedback.emit();

        Alert.alert(
          '',
          `Scanned: ${barcode.data} (${symbology.readableName})`,
          [{ text: 'OK', onPress: () => barcodeCapture.isEnabled = true }],
          { cancelable: false }
        );
      }
    };

    // Add the listener to the barcode capture context.
    barcodeCapture.addListener(barcodeCaptureListener);

    // Set the barcode capture mode to the data capture context.
    dataCaptureContext.setMode(barcodeCapture);
    return barcodeCapture;
  };

  const startCapture = async () => {
    startCamera();
    barcodeCaptureMode.current.isEnabled = true;
  };

  const stopCapture = () => {
    barcodeCaptureMode.current.isEnabled = false;
    stopCamera();
  };

  const stopCamera = () => {
    if (camera.current) {
      camera.current.switchToDesiredState(FrameSourceState.Off);
    }
  };

  const startCamera = () => {
    if (camera.current) {
      camera.current.switchToDesiredState(FrameSourceState.On);
    }
  };

  function setupOverlay(): BarcodeCaptureOverlay {
    if (!barcodeCaptureMode.current) {
      throw new Error('Cannot setup overlay - BarcodeCapture');
    }
    // Add a barcode capture overlay to the data capture view to render the location of captured barcodes on top of
    // the video preview, using the Frame overlay style. This is optional, but recommended for better visual feedback.
    const overlay = new BarcodeCaptureOverlay(
        barcodeCaptureMode.current
    );

    overlay.viewfinder = new RectangularViewfinder(
        RectangularViewfinderStyle.Square,
        RectangularViewfinderLineStyle.Light,
    );

    return overlay;
  }

  return (
    <DataCaptureView
      style={{ flex: 1 }}
      context={dataCaptureContext}
      ref={(view) => {
        if (view && !viewRef.current) {
          view.addOverlay(overlayRef.current);
          viewRef.current = view;
        }
      }}
    />
  );
}
