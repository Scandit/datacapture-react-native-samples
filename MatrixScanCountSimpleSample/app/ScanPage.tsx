import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler } from 'react-native';
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
  CameraSettings,
  DataCaptureContext,
  FrameSourceState,
  VideoResolution,
} from 'scandit-react-native-datacapture-core';
import { requestCameraPermissionsIfNeeded } from './camera-permission-handler';
import { RootStackParamList } from './App';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AppContext from './AppContext';

type ScanPageNavigationProp = StackNavigationProp<RootStackParamList>;

export const ScanPage = () => {
  const navigation = useNavigation<ScanPageNavigationProp>();
  // Create data capture context using your license key.
  const dataCaptureContext = useMemo(() => {
    return DataCaptureContext.forLicenseKey('AW7z5wVbIbJtEL1x2i7B3/cet/ClBNVHZTfPtvJ2n3L/LY6/FDbqtzYItFO0DmhIJ2JP1Vxu7po1f74HqF9UTtRB/1DHY+CJdTiq/6dQ8vFgd9rzwlVfSYFgWPp9fK5nVUmnHyt9W5oRMcXObjYeC7Q/FO0NA0yRHUEtt/aBpnv/AxYTKG8wyVNqZKMJn+bhz/CFbH5pjtdj2aE85TlPGfQK4sBP/K2ONcx2ndbmY82SOquLlcZ55uAFuj4yCuQEI6iuokblpDVsql+vDiw3XMOmqwbmuGnAuCtGbtjyyWyQCKeiKWtZzdy+Cz7NnW/yRdwKY1xBjkaMA+A+NWeBxp9O2Ou6dBCPsRPg0Nqfv92sbv050dQc/+xccvEXWSi8UnD+AQoKp5V3gR/Yae/5+4fII9X3Tqjf/aNvXDw3m7YDQ+b+IJnkzLN5EgwGnzUmI8z3qMx9xcqhkWwBE/SSuIP47tBp5xwz02kN6qb+vZc/1p5EUQ/VtGVBfD1e+5Dii56BHsfPId/JpKpGUX1FFAYuT1uEbf7xLREDtFobn05tDxYPLrCa0hciRwCdWxHbUnYR1BF3zQQHih5Dd5qGyA5yKsgCsg7Na+9gC8O6hxpWlB4SbIFMEDluvJ+0v0ww5nnP2PWAO7v4k+Sgn7cQa7gDhQNee+pfuDvUlprUufio+dUmOUYNbn2TVwRVATmPx4U+p8Acg+Ohj85bSwPk+cNoq3Te6N0Ts5JnwrjCvVq6yrfbqyGFbgIhJiSxtgiZOfMZu8KoCvBfIUFE2A5WlNNaMZmQAtPozR31iX/Z2LuCIBhkFXGdd9CW/YPKhs8m25jlbOKnl0DWiBnM');
  }, []);
  const [barcodeCountMode, setBarcodeCountMode] = useState<BarcodeCount | null>(
    null,
  );
  const [camera, setCamera] = useState<Camera | null>(null);
  const [cameraState, setCameraState] = useState(FrameSourceState.Off);

  let viewListenerRef = useRef<BarcodeCountViewListener |null>(null);
  let viewUiListenerRef = useRef<BarcodeCountViewUiListener | null>(null);

  const { codes, flags, setCodes, setFlags } = useContext(AppContext);

  useFocusEffect(
    useCallback(() => {
      if (flags.shouldClearBarcodes) {
        barcodeCountMode?.clearAdditionalBarcodes().then(() => {
          barcodeCountMode?.reset();
        });
        setCodes([]);
        setFlags({ ...flags, shouldClearBarcodes: false });
      }

      if (flags.shouldResetBarcodeCount && barcodeCountMode) {
        barcodeCountMode.clearAdditionalBarcodes().then(() => {
          barcodeCountMode.reset().then(() => {
            barcodeCountMode.isEnabled = true;
            setCameraState(FrameSourceState.On);
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

  useEffect(() => {
    if (camera) {
      camera.switchToDesiredState(cameraState);
    }
    return () => {
      // Turn of the camera only when the component is unmounting, which means
      // the current view is no longer available.
      if (camera) {
        camera.switchToDesiredState(FrameSourceState.Off);
      }
    };
  }, [cameraState]);

  const setupScanning = () => {
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
    const barcodeCount = BarcodeCount.forContext(dataCaptureContext, settings);

    // Register a listener to get informed whenever a new barcode is tracked.
    const barcodeCountListener = {
      didScan: (_: BarcodeCount, session: BarcodeCountSession) => {
        setCodes(
          Object.values(session.recognizedBarcodes).map(t => ({
            data: t.barcode.data,
            symbology: t.barcode.symbology,
          })),
        );
      },
    };

    barcodeCount.addListener(barcodeCountListener);

    // The UI includes two icons (buttons) named “List” and “Exit”.
    // The SDK provides the callbacks so you can add the desired action when those icons are tapped by the user.
    viewUiListenerRef.current = {
      didTapListButton: (_: BarcodeCountView) => {
        // Show the current progress but the order is not completed
        navigation.navigate('Results', { source: 'listButton' });
      },
      didTapExitButton: (_: BarcodeCountView) => {
        // The order is completed
        setCameraState(FrameSourceState.Off);
        navigation.navigate('Results', { source: 'finishButton' });
      },
    };

    viewListenerRef.current = {
      didTapRecognizedBarcode: (_, trackedBarcode: TrackedBarcode) => {
        console.log(
          `Tapped recognized barcode with data ${trackedBarcode.barcode.data}`,
        );
      },
      didTapUnrecognizedBarcode: (_, trackedBarcode: TrackedBarcode) => {
        console.log(
          `Tapped unrecognized barcode with data ${trackedBarcode.barcode.data}`,
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

    setBarcodeCountMode(barcodeCount);
  };

  const startCamera = () => {
    if (!camera) {
      // Use the world-facing (back) camera and set it as the frame source of the context. The camera is off by
      // default and must be turned on to start streaming frames to the data capture context for recognition.
      const defaultCamera = Camera.default;
      dataCaptureContext.setFrameSource(defaultCamera);

      const cameraSettings = BarcodeCount.recommendedCameraSettings;
      defaultCamera?.applySettings(cameraSettings);
      setCamera(defaultCamera);
    }

    // Switch camera on to start streaming frames and enable the barcode capture mode.
    // The camera is started asynchronously and will take some time to completely turn on.
    requestCameraPermissionsIfNeeded()
      .then(() => setCameraState(FrameSourceState.On))
      .catch(() => BackHandler.exitApp());
  };
  return (
    barcodeCountMode && (
      <BarcodeCountView
        style={{ flex: 1 }}
        barcodeCount={barcodeCountMode}
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
