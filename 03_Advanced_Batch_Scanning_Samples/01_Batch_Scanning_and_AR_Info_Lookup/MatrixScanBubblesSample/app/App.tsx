import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AppState, AppStateStatus, BackHandler, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BarcodeBatch,
  BarcodeBatchAdvancedOverlay,
  BarcodeBatchBasicOverlay,
  BarcodeBatchBasicOverlayStyle,
  BarcodeBatchListener,
  BarcodeBatchSettings,
  Symbology,
  TrackedBarcode,
} from 'scandit-react-native-datacapture-barcode';
import {
  Anchor,
  Camera,
  DataCaptureContext,
  DataCaptureView,
  FrameSourceState,
  MeasureUnit,
  NumberWithUnit,
  PointWithUnit,
  Quadrilateral,
} from 'scandit-react-native-datacapture-core';

import { ARView } from './ARView';
import { requestCameraPermissionsIfNeeded } from './camera-permission-handler';
import Freeze from './Freeze.svg';
import { styles } from './styles';
import Unfreeze from './Unfreeze.svg';


export const App = () => {
  const viewRef = useRef<DataCaptureView>(null);

  const dataCaptureContext = useMemo(() => {
    // Enter your Scandit License key here.
    // Your Scandit License key is available via your Scandit SDK web account.
    return DataCaptureContext.initialize('-- ENTER YOUR SCANDIT LICENSE KEY HERE --');
  }, []);

  const [appStateVisible, setAppStateVisible] = useState(AppState.currentState);

  const [barcodeBatch, setBarcodeBatch] = useState<BarcodeBatch | null>(null);

  const scanningRef = useRef(true);
  const trackedBarcodesRef = useRef<Record<string, any>>({});
  const [camera, setCamera] = useState<Camera | null>(null);
  const [cameraState, setCameraState] = useState(FrameSourceState.Off);
  const advancedOverlayRef = useRef<BarcodeBatchAdvancedOverlay | null>(null);


  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      setAppStateVisible(nextAppState);
    };

    const handleAppStateChangeSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    setupScanning();
    startCapture();
    return () => {
      handleAppStateChangeSubscription.remove();
      dataCaptureContext.dispose();
    };
  }, []);

  useEffect(() => {
    if (appStateVisible.match(/inactive|background/)) {
      stopCapture();
    } else if (scanningRef.current) {
      startCapture();
    }
  }, [appStateVisible]);

  useEffect(() => {
    if (camera) {
      camera.switchToDesiredState(cameraState);
    }

    return () => {
      if (camera) {
        camera.switchToDesiredState(FrameSourceState.Off);
      }
    };
  }, [camera, cameraState]);

  const startCapture = () => {
    startCamera();
    if (barcodeBatch) {
      barcodeBatch.isEnabled = true;
    }
  };

  const stopCapture = () => {
    if (barcodeBatch) {
      barcodeBatch.isEnabled = false;
    }
    stopCamera();
  };

  const stopCamera = () => {
    if (camera) {
        setCameraState(FrameSourceState.Off);
      }
  };

  const startCamera = () => {
    requestCameraPermissionsIfNeeded()
    .then(() => setCameraState(FrameSourceState.On))
    .catch(() => BackHandler.exitApp());
  };

  const setupScanning = () => {
    // Use BarcodeBatch recommended camera seettings
    const cameraSettings = BarcodeBatch.recommendedCameraSettings;
    const newCamera = Camera.withSettings(cameraSettings);
    dataCaptureContext.setFrameSource(newCamera);
    setCamera(newCamera);

    // We create a barcode batch settings to enable the symbologies we want to track.
    const settings = new BarcodeBatchSettings();
    settings.enableSymbologies([
      Symbology.EAN13UPCA,
      Symbology.EAN8,
      Symbology.UPCE,
      Symbology.Code39,
      Symbology.Code128,
    ]);

    const batch = BarcodeBatch.forContext(
      dataCaptureContext,
      settings,
    );

    batch.addListener(barcodeBatchListener);
    batch.isEnabled = scanningRef.current;
    setBarcodeBatch(batch);

     // We create an overlay to highlight the barcodes.
    BarcodeBatchBasicOverlay.withBarcodeBatchForViewWithStyle(
      batch,
      viewRef.current,
      BarcodeBatchBasicOverlayStyle.Dot,
    );

    // We create an overlay for the bubbles.
    const overlay = BarcodeBatchAdvancedOverlay.withBarcodeBatchForView(
      batch,
      viewRef.current,
    );

    overlay.listener = {
      anchorForTrackedBarcode: () => Anchor.TopCenter,
      offsetForTrackedBarcode: () =>
        new PointWithUnit(
          new NumberWithUnit(0, MeasureUnit.Fraction),
          new NumberWithUnit(-1, MeasureUnit.Fraction),
        ),
    };

    advancedOverlayRef.current = overlay;
  };

  const barcodeBatchListener: BarcodeBatchListener = {
    didUpdateSession: async (_, session) => {
      const updatedTrackedBarcodes = {...trackedBarcodesRef.current};
      session.removedTrackedBarcodes.forEach(identifier => {
        updatedTrackedBarcodes[identifier] = null;
      });

      Object.values(session.trackedBarcodes).forEach(trackedBarcode => {
        viewRef
          .current?.viewQuadrilateralForFrameQuadrilateral(
            trackedBarcode.location,
          )
          .then(location => {
            if (advancedOverlayRef.current) {
              updateView(trackedBarcode, location, advancedOverlayRef.current);
            }
          });
      });

      trackedBarcodesRef.current = updatedTrackedBarcodes;
    },
  };

  const getQuadrilateralWidth = (quadrilateral: Quadrilateral): number => {
    return Math.max(
      Math.abs(quadrilateral.topRight.x - quadrilateral.topLeft.x),
      Math.abs(quadrilateral.bottomRight.x - quadrilateral.bottomLeft.x),
    );
  };

  const updateView = (
    trackedBarcode: TrackedBarcode,
    viewLocation: Quadrilateral,
    overlay: BarcodeBatchAdvancedOverlay,
  ) => {
    const shouldBeShown =
      getQuadrilateralWidth(viewLocation) >
      Dimensions.get('window').width * 0.1;

    if (!shouldBeShown) {
      trackedBarcodesRef.current = {
        ...trackedBarcodesRef.current,
        [trackedBarcode.identifier]: null,
      };
      return;
    }

    const barcodeData = trackedBarcode.barcode.data;

    if (!barcodeData) {
      return;
    }
    
    const didViewChange = JSON.stringify(trackedBarcodesRef.current[trackedBarcode.identifier]) !== JSON.stringify(barcodeData);

    if (didViewChange) {
      trackedBarcodesRef.current = {
        ...trackedBarcodesRef.current,
        [trackedBarcode.identifier]: barcodeData,
      };

      const props = {
        barcodeData,
        stock: {shelf: 4, backRoom: 8},
      };

      overlay.setViewForTrackedBarcode(new ARView(props), trackedBarcode)
        .catch(console.warn);
    }
  };

  const toggleScan = () => {
    const isScanning = barcodeBatch?.isEnabled === true;
    const newScanningState = !isScanning;
    scanningRef.current = newScanningState;
    
    // Update barcodeBatch immediately
    if (barcodeBatch) {
      barcodeBatch.isEnabled = newScanningState;
    }
    
    // Update camera state immediately
    if (newScanningState) {
      setCameraState(FrameSourceState.On);
    } else {
      setCameraState(FrameSourceState.Off);
    }
  };

  useEffect(() => {
    return () => {
      if (barcodeBatch) {
        barcodeBatch.isEnabled = false;
      }
    };
  }, [barcodeBatch]);

  return (
    <>
      <DataCaptureView
        style={styles.dataCaptureView}
        context={dataCaptureContext}
        ref={viewRef}
      />
      <SafeAreaView style={styles.toggleContainer}>
        {scanningRef.current ? (
          <Freeze onPress={toggleScan} />
        ) : (
          <Unfreeze onPress={toggleScan} />
        )}
      </SafeAreaView>
    </>
  );
};
