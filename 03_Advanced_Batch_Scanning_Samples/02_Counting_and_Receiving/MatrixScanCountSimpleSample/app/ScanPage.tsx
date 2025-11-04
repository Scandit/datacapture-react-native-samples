import React, { useCallback, useContext, useEffect, useRef } from 'react';
import {
  BarcodeCount,
  BarcodeCountSession,
  BarcodeCountSettings,
  BarcodeCountView,
  BarcodeCountViewListener,
  BarcodeCountViewStyle,
  BarcodeCountViewUiListener,
  Symbology,
  TrackedBarcode,
} from 'scandit-react-native-datacapture-barcode';
import {
  Camera,
  FrameSourceState,
} from 'scandit-react-native-datacapture-core';
import { RootStackParamList } from './App';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AppContext from './AppContext';
import dataCaptureContext from './CaptureContext';

type ScanPageNavigationProp = StackNavigationProp<RootStackParamList>;

export const ScanPage = () => {
  const navigation = useNavigation<ScanPageNavigationProp>();

  const cameraRef = useRef<Camera>(null!);
  if (!cameraRef.current) {
    cameraRef.current = setupCamera();
  }

  const barcodeCountMode = useRef<BarcodeCount>(null!);
  if (!barcodeCountMode.current) {
    barcodeCountMode.current = setupScanning();
  }

  const viewListenerRef = useRef<BarcodeCountViewListener |null>(null);
  if (!viewListenerRef.current) {
    viewListenerRef.current = {
      didTapRecognizedBarcode: (_, trackedBarcode: TrackedBarcode) => {
        console.log(
          `Tapped recognized barcode with data ${trackedBarcode.barcode.data}`,
        );
      },
      didTapFilteredBarcode: (_, filteredBarcode: TrackedBarcode) => {
        console.log(
          `Tapped on filtered barcode with data ${filteredBarcode.barcode.data}`,
        );
      },
      didTapRecognizedBarcodeNotInList: (_, trackedBarcode: TrackedBarcode) => {
        console.log(
          `Tapped on recognized barcode not in list with data ${trackedBarcode.barcode.data}`,
        );
      },
      didCompleteCaptureList: _ => {
        console.log('Completed capture list');
      },
    };
  }

  const viewUiListenerRef = useRef<BarcodeCountViewUiListener | null>(null);
  if (!viewUiListenerRef.current) {
    // The UI includes two icons (buttons) named “List” and “Exit”.
    // The SDK provides the callbacks so you can add the desired action when those icons are tapped by the user.
    viewUiListenerRef.current = {
      didTapListButton: (_: BarcodeCountView) => {
        // Show the current progress but the order is not completed
        navigation.navigate('Results', { source: 'listButton' });
      },
      didTapExitButton: (_: BarcodeCountView) => {
        // The order is completed
        cameraRef.current.switchToDesiredState(FrameSourceState.Off);
        navigation.navigate('Results', { source: 'finishButton' });
      },
    };
  }

  const { codes, flags, setCodes, setFlags } = useContext(AppContext);

  useFocusEffect(
    useCallback(() => {
      if (flags.shouldClearBarcodes) {
        barcodeCountMode.current.clearAdditionalBarcodes().then(() => {
          barcodeCountMode.current.reset();
        });
        setCodes([]);
        setFlags({ ...flags, shouldClearBarcodes: false });
      }

      if (flags.shouldResetBarcodeCount && barcodeCountMode.current) {
        barcodeCountMode.current.clearAdditionalBarcodes().then(() => {
          barcodeCountMode.current.reset().then(() => {
            barcodeCountMode.current.isEnabled = true;
            cameraRef.current.switchToDesiredState(FrameSourceState.On);
          });
        });
        setCodes([]);
        setFlags({ ...flags, shouldResetBarcodeCount: false });
      }
    }, [flags]),
  );

  useEffect(() => {
    setupScanning();
    startCamera();

    return () => {
      dataCaptureContext.dispose();
    };
  }, []);

  useEffect(() => {
    console.log('codes changed:', codes);
  }, [codes]);

  function setupScanning(): BarcodeCount {
    // The barcode capturing process is configured through barcode count settings
    // and are then applied to the barcode count instance that manages barcode recognition.
    const settings = new BarcodeCountSettings();

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

    // Create new barcode count mode with the settings from above.
    const barcodeCount = new BarcodeCount(settings);

    // Register a listener to get informed whenever a new barcode is tracked.
    const barcodeCountListener = {
      didScan: async (_: BarcodeCount, session: BarcodeCountSession) => {
        setCodes(
          Object.values(session.recognizedBarcodes).map(barcode => ({
            data: barcode.data,
            symbology: barcode.symbology,
          })),
        );
      },
    };

    barcodeCount.addListener(barcodeCountListener);

    return barcodeCount;
  }

  function setupCamera(): Camera {
      // Use the recommended camera settings for the BarcodeCount mode.
      const defaultCamera = Camera.withSettings(BarcodeCount.createRecommendedCameraSettings());

      if (!defaultCamera) {
        throw new Error('Failed to create camera');
      }

      dataCaptureContext.setFrameSource(defaultCamera);
      return defaultCamera;
  }

  function startCamera() {
    cameraRef.current.switchToDesiredState(FrameSourceState.On);
  };
  return (
    barcodeCountMode && (
      <BarcodeCountView
        style={{ flex: 1 }}
        barcodeCount={barcodeCountMode.current}
        context={dataCaptureContext}
        viewStyle={BarcodeCountViewStyle.Icon}
        ref={view => {
          if (view) {
            view.uiListener = viewUiListenerRef.current;
            view.listener = viewListenerRef.current;
          }
        }}
      />
    )
  );
};
