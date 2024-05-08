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
    return DataCaptureContext.forLicenseKey('AZ707AsCLmJWHbYO4RjqcVAEgAxmNGYcF3Ytg4RiKa/lWTQ3IXkfVZhSSi0yOzuabn9STRdnzTLybIiJVkVZU2QK5jeqbn1HGCGXQ+9lqsN8VUaTw1IeuHJo+9mYVdv3I1DhedtSy89aKA4QugKI5d9ykKaXGohXjlI+PB5ju8Tyc80FPAC3WP9D8oKBcWyemTLQjoUu0Nl3T7mVyFIXMPshQeYddkjMQ1sVV9Jcuf1CbI9riUJWzbNUb4NcB4MoV0BHuyALUPtuM2+cBkX3bPN0AxjD9WC7KflL2UrsZeenvl/aDx2yU4t5vsa2BImNTyEqdVs+rmrGUzRdbYvSUFzKBeiBncLAASqnexTuSzh9KfEm/cKrVlWekP+zOkrilICkn3KVNY6g9RQd8FrsHTBI9OBbMpC79BTwuzHcnlFUG5S3ru/viJ2+f9JEEejxDbdJ7u4JohfBuUYBSEBQ/XzEPMdpqWcmxHGWF4j7jQy83B9Wlgrhd8xNWKjgAViI0bcebjnB7o6yuKacXICH/lo787RhnXSjqjQhJBCbEvwxHQZiEfWPdVKtY7EM+x8HFr6j3orKllKOMJ9asZ5bJYz9aIHlOWeRGm90guQn0KWiPwuKbUOQIMxFAOem2zcSTt4OfqS6Ci0Y6lk7FIrgpbaz8L1PW64kkjrZB6FtQ8OppmsyZ/QTvrHYFQFTH7MpamDviRjEKMyiD2ID6ypl+Meeme6cZYRJVujr6b4tweQCsfNEYhuDiMJaWQ57R0n2XdF0zkepLVc0yA2Q3wWhxSIASLnv6GTCYYVnDJnkrr6VaTv8RVUOp8h8U34wGDanamQ+39+rESMD59E288OKgFvZZWN9Ltu/VQCcjYCYT1RTDcA9co3Y18aGpDxvtLVEGJ8QDPv1E//IYAYEhXqu8r9xbsx/hTwZmLpNKyXGPRr9+hpufTAcAj908f2kuQ==');
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
      // Use the recommended camera settings for the BarcodeCount mode.
      const defaultCamera = Camera.withSettings(BarcodeCount.recommendedCameraSettings);
      dataCaptureContext.setFrameSource(defaultCamera);
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
