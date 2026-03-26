import React, { useCallback, useEffect, useRef } from 'react';
import { Alert, AppState } from 'react-native';
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
  DataCaptureView,
  FrameSourceState,
  RectangularViewfinder,
  RectangularViewfinderStyle,
  RectangularViewfinderLineStyle,
  VideoResolution,
} from 'scandit-react-native-datacapture-core';

import dataCaptureContext from '../utils/dataCaptureContext';
import { Stack } from 'expo-router';

export default function ScanPage() {
  const viewRef = useRef<DataCaptureView>(null);
  const cameraRef = useRef<Camera>(null!);
  const barcodeCaptureModeRef = useRef<BarcodeCapture>(null!);
  if (!barcodeCaptureModeRef.current) {
    setupScanning();
  }

  const overlayRef = useRef<BarcodeCaptureOverlay>(null!);
  if (!overlayRef.current) {
    overlayRef.current = setupOverlay();
  }

  const startCamera = useCallback(async () => {
    await cameraRef.current?.switchToDesiredState(FrameSourceState.On);
  }, []);

  const stopCamera = useCallback(async () => {
    await cameraRef.current?.switchToDesiredState(FrameSourceState.Off);
  }, []);

  const startCapture = useCallback(async () => {
    await startCamera();
    barcodeCaptureModeRef.current.isEnabled = true;
  }, [startCamera]);

  const stopCapture = useCallback(async () => {
    barcodeCaptureModeRef.current.isEnabled = false;
    await stopCamera();
  }, [stopCamera]);

  useEffect(() => {
    const localBarcodeCaptureMode = barcodeCaptureModeRef.current;
    return () => {
      // Clean up the data capture context by removing the barcode capture mode from it and removing the view from the context. This is necessary as the data capture context is a singleton and is shared across multiple screens.
      // The addition of the mode is done in the `setupScanning` function, which is called when the component is mounted.
      dataCaptureContext.removeMode(localBarcodeCaptureMode);
    };
  }, []);

  useEffect(() => {
    // Stop capture when the app goes to background, as the camera is not allowed to run in the background. Start it again when the app comes back to foreground.
    const handleAppStateChangeSubscription = AppState.addEventListener('change', () => {
      if (AppState.currentState.match(/inactive|background/)) {
        stopCapture();
      } else {
        startCapture();
      }
    });

    return () => {
      handleAppStateChangeSubscription.remove();
    };
  }, [startCapture, stopCapture]);

  async function setupCamera() {
    // Use the world-facing (back) camera and set it as the frame source of the context. The camera is off by
    // default and must be turned on to start streaming frames to the data capture context for recognition.
    const cameraSettings = BarcodeCapture.createRecommendedCameraSettings();
    cameraSettings.preferredResolution = VideoResolution.FullHD;
    const camera = Camera.withSettings(cameraSettings);

    // Camera is null if the camera is not available on the device.
    if (!camera) {
      throw new Error('Failed to initialize camera - camera not available on device');
    }

    cameraRef.current = camera;

    // Set the camera as the frame source of the data capture context.
    await dataCaptureContext.setFrameSource(camera);

    // Switch the camera on to start streaming frames and enable the barcode capture mode.
    await camera.switchToDesiredState(FrameSourceState.On);
  }

  function setupScanning() {
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
    barcodeCaptureModeRef.current = barcodeCapture;

    setupCamera();

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
          [{ text: 'OK', onPress: () => (barcodeCapture.isEnabled = true) }],
          { cancelable: false }
        );
      },
    };

    // Add the listener to the barcode capture context.
    barcodeCapture.addListener(barcodeCaptureListener);

    // Set the barcode capture mode to the data capture context.
    dataCaptureContext.setMode(barcodeCapture);
  }

  function setupOverlay(): BarcodeCaptureOverlay {
    if (!barcodeCaptureModeRef.current) {
      throw new Error('Cannot setup overlay - BarcodeCapture');
    }
    // Add a barcode capture overlay to the data capture view to render the location of captured barcodes on top of
    // the video preview, using the Frame overlay style. This is optional, but recommended for better visual feedback.
    const overlay = new BarcodeCaptureOverlay(barcodeCaptureModeRef.current);

    overlay.viewfinder = new RectangularViewfinder(
      RectangularViewfinderStyle.Square,
      RectangularViewfinderLineStyle.Light
    );

    return overlay;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Scan' }} />
      <DataCaptureView
        style={{ flex: 1 }}
        context={dataCaptureContext}
        ref={view => {
          if (view && !viewRef.current) {
            view.addOverlay(overlayRef.current);
            viewRef.current = view;
          }
        }}
      />
    </>
  );
}
