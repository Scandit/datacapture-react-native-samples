import React, { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Text, TouchableWithoutFeedback, View } from 'react-native';
import {
  BarcodeSelection,
  BarcodeSelectionAimerSelection,
  BarcodeSelectionBasicOverlay,
  BarcodeSelectionSettings,
  BarcodeSelectionTapSelection,
  Symbology,
  SymbologyDescription,
} from 'scandit-react-native-datacapture-barcode';
import { Camera, DataCaptureView, FrameSourceState } from 'scandit-react-native-datacapture-core';

import dataCaptureContext from './CaptureContext';

const SelectionType = {
  tap: 'tap',
  aim: 'aim',
}

export const ScanPage = () => {
  const [selectionType, setSelectionType] = useState(SelectionType.tap);
  const [result, setResult] = useState<string | null>(null);

  const cameraRef = useRef<Camera | null>(null);

  const barcodeSelectionSettings = useRef<BarcodeSelectionSettings>(null!);
  if (!barcodeSelectionSettings.current) {
    barcodeSelectionSettings.current = new BarcodeSelectionSettings();
  }

  const barcodeSelectionMode = useRef<BarcodeSelection>(null!);
  if (!barcodeSelectionMode.current) {
    barcodeSelectionMode.current = setupScanning();
  }

  const overlayRef = useRef<BarcodeSelectionBasicOverlay>(null!);
  if (!overlayRef.current) {
    overlayRef.current = setupOverlay();
  }

  const viewRef = useRef<DataCaptureView>(null);

  useEffect(() => {
    const initCamera = async () => {
      if (!cameraRef.current) {
        cameraRef.current = await setupCamera();
      }
    };

    initCamera();

    const handleAppStateChangeSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      handleAppStateChangeSubscription.remove();
      stopCapture();
      dataCaptureContext.removeMode(barcodeSelectionMode.current);
    };
  }, []);

  useEffect(() => {
    // Update selection type when it changes
    if (selectionType === SelectionType.tap) {
      barcodeSelectionSettings.current.selectionType = BarcodeSelectionTapSelection.tapSelection;
    } else if (selectionType === SelectionType.aim) {
      barcodeSelectionSettings.current.selectionType = BarcodeSelectionAimerSelection.aimerSelection;
    }
    barcodeSelectionMode.current.applySettings(barcodeSelectionSettings.current);
  }, [selectionType]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState.match(/inactive|background/)) {
      stopCapture();
    } else {
      startCapture();
    }
  };

  const startCapture = () => {
    startCamera();
    barcodeSelectionMode.current.isEnabled = true;
  };

  const stopCapture = () => {
    stopCamera();
    barcodeSelectionMode.current.isEnabled = false;
  };

  const stopCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.switchToDesiredState(FrameSourceState.Off);
    }
  };

  const startCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.switchToDesiredState(FrameSourceState.On);
    }
  };

  async function setupCamera(): Promise<Camera> {
    const camera = Camera.withSettings(BarcodeSelection.createRecommendedCameraSettings());
    // Camera is null if the camera is not available on the device.
    if (!camera) {
      throw new Error('Failed to initialize camera - camera not available on device');
    }
    // Switch the camera on to start streaming frames and enable the barcode selection mode.
    await camera.switchToDesiredState(FrameSourceState.On);
    // Set the camera as the frame source of the data capture context.
    await dataCaptureContext.setFrameSource(camera);
    return camera;
  }

  // Add a barcode selection overlay to the data capture view to render the location of captured barcodes on top of
  // the video preview. This is optional, but recommended for better visual feedback.
  function setupOverlay(): BarcodeSelectionBasicOverlay {
    if (!barcodeSelectionMode.current) {
      throw new Error('Cannot setup overlay - BarcodeSelection not initialized');
    }
    // Add a barcode selection overlay to the data capture view to render the location of captured barcodes on top of
    // the video preview. This is optional, but recommended for better visual feedback.
    const overlay = new BarcodeSelectionBasicOverlay(barcodeSelectionMode.current);
    return overlay;
  }

  function setupScanning(): BarcodeSelection {
    if (!barcodeSelectionSettings.current) {
      throw new Error('Cannot setup scanning - BarcodeSelectionSettings not initialized');
    }

    // The settings instance initially has all types of barcodes (symbologies) disabled. For the purpose of this
    // sample we enable a very generous set of symbologies. In your own app ensure that you only enable the
    // symbologies that your app requires as every additional enabled symbology has an impact on processing times.
    barcodeSelectionSettings.current.enableSymbologies([
      Symbology.EAN13UPCA,
      Symbology.EAN8,
      Symbology.UPCE,
      Symbology.QR,
      Symbology.DataMatrix,
      Symbology.Code39,
      Symbology.Code128,
    ]);

    // Create new barcode selection mode with the settings from above.
    const barcodeSelection = new BarcodeSelection(barcodeSelectionSettings.current);

    // Register a listener to get informed whenever a new barcode got recognized.
    barcodeSelection.addListener({
      didUpdateSelection: async (_, session, __) => {
        const barcode = session.newlySelectedBarcodes[0];

        if (!barcode) { return }

        const symbology = new SymbologyDescription(barcode.symbology);

        session.getCount(barcode).then(count => {
          const result = `Scan Results\n${symbology.readableName}: ${barcode.data}\nTimes: ${count}`;
          setResult(result);
          setTimeout(() => {
            setResult(null);
          }, 500);
        });
      }
    });

    // Set the barcode selection mode to the data capture context.
    dataCaptureContext.setMode(barcodeSelection);

    return barcodeSelection;
  }

  return (
    <>
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

      <View style={{ width: '100%', backgroundColor: "black", flexDirection: "row", justifyContent: "space-around", alignItems: 'center' }}>
        <TouchableWithoutFeedback onPress={() => setSelectionType(SelectionType.tap)}>
          <Text style={{ padding: 15, color: selectionType == SelectionType.tap ? 'white' : 'grey' }}>Tap to Select</Text>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => setSelectionType(SelectionType.aim)}>
          <Text style={{ padding: 15, color: selectionType == SelectionType.aim ? 'white' : 'grey' }}>Aim to Select</Text>
        </TouchableWithoutFeedback>
      </View>

      {result &&
        <Text style={{
          position: 'absolute', top: 100, width: '100%', textAlign: 'center', backgroundColor: '#FFFC', padding: 20,
        }}>{result}</Text>}
    </>
  );
}
