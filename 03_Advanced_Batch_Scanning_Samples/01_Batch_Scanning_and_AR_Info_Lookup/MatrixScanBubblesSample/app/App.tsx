import React, { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus, BackHandler, Dimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
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

const dataCaptureContext = DataCaptureContext.initialize('-- ENTER YOUR SCANDIT LICENSE KEY HERE --');

export const App = () => {
  const viewRef = useRef<DataCaptureView>(null);
  const cameraRef = useRef<Camera>(null!);
  if (!cameraRef.current) {
    cameraRef.current = setupCamera();
  }
  const barcodeBatchRef = useRef<BarcodeBatch>(null!);
  if (!barcodeBatchRef.current) {
    barcodeBatchRef.current = setupBarcodeBatch();
  }
  const trackedBarcodesRef = useRef<Record<string, any>>({});
  const advancedOverlayRef = useRef<BarcodeBatchAdvancedOverlay | null>(null);
  const barcodeBatchListenerRef = useRef<BarcodeBatchListener | null>(null);
  const isScanningRef = useRef(true);

  const [isScanning, setIsScanning] = useState(true);

  function setupBarcodeBatch() {
    // We create a barcode batch settings to enable the symbologies we want to track.
    const settings = new BarcodeBatchSettings();
    settings.enableSymbologies([
      Symbology.EAN13UPCA,
      Symbology.EAN8,
      Symbology.UPCE,
      Symbology.Code39,
      Symbology.Code128,
    ]);

    const batch = BarcodeBatch.forContext(dataCaptureContext, settings);
    batch.addListener({
      async didUpdateSession(...args) {
        if (!barcodeBatchListenerRef.current || !barcodeBatchListenerRef.current.didUpdateSession) {
          return;
        }
        // We have to call the listeners through the ref to ensure that the latest listener is used.
        return barcodeBatchListenerRef.current.didUpdateSession(...args);
      },
    });

    return batch;
  }

  function setupCamera() {
    const cameraSettings = BarcodeBatch.recommendedCameraSettings;
    const newCamera = Camera.withSettings(cameraSettings);
    if (!newCamera) {
      throw Error('No camera available');
    }
    dataCaptureContext.setFrameSource(newCamera);
    return newCamera;
  }

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // If the app is going to the background or inactive state, we stop the capture.
      if (nextAppState.match(/inactive|background/)) {
        stopCapture();
      } else if (nextAppState === 'active') {
        if (isScanningRef.current) {
          startCapture();
        }
      }
    };

    const handleAppStateChangeSubscription = AppState.addEventListener('change', handleAppStateChange);
    startCapture();
    return () => {
      handleAppStateChangeSubscription.remove();
      stopCapture();
    };
  }, []);

  const startCapture = () => {
    barcodeBatchRef.current.isEnabled = true;
    startCamera();
  };

  const stopCapture = () => {
    barcodeBatchRef.current.isEnabled = false;
    stopCamera();
  };

  const stopCamera = () => {
    cameraRef.current?.switchToDesiredState(FrameSourceState.Off);
  };

  const startCamera = () => {
    requestCameraPermissionsIfNeeded()
      .then(() => cameraRef.current?.switchToDesiredState(FrameSourceState.On))
      .catch(() => BackHandler.exitApp());
  };

  function setupOverlay() {
    // We create an overlay to highlight the barcodes.
    BarcodeBatchBasicOverlay.withBarcodeBatchForViewWithStyle(
      barcodeBatchRef.current,
      viewRef.current,
      BarcodeBatchBasicOverlayStyle.Dot,
    );
    // We create an overlay for the bubbles.
    const overlay = BarcodeBatchAdvancedOverlay.withBarcodeBatchForView(barcodeBatchRef.current, viewRef.current);

    overlay.listener = {
      anchorForTrackedBarcode: () => Anchor.TopCenter,
      offsetForTrackedBarcode: () =>
        new PointWithUnit(new NumberWithUnit(0, MeasureUnit.Fraction), new NumberWithUnit(-1, MeasureUnit.Fraction)),
    };
    return overlay;
  }

  const getQuadrilateralWidth = (quadrilateral: Quadrilateral): number => {
    return Math.max(
      Math.abs(quadrilateral.topRight.x - quadrilateral.topLeft.x),
      Math.abs(quadrilateral.bottomRight.x - quadrilateral.bottomLeft.x),
    );
  };

  const updateView = (trackedBarcode: TrackedBarcode, viewLocation: Quadrilateral) => {
    const shouldBeShown = getQuadrilateralWidth(viewLocation) > Dimensions.get('window').width * 0.1;

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

    const didViewChange =
      JSON.stringify(trackedBarcodesRef.current[trackedBarcode.identifier]) !== JSON.stringify(barcodeData);
    if (didViewChange) {
      trackedBarcodesRef.current = {
        ...trackedBarcodesRef.current,
        [trackedBarcode.identifier]: barcodeData,
      };

      const props = {
        barcodeData,
        stock: { shelf: 4, backRoom: 8 },
      };

      advancedOverlayRef.current?.setViewForTrackedBarcode(new ARView(props), trackedBarcode).catch(console.warn);
    }
  };

  const toggleScan = () => {
    const isScanning = barcodeBatchRef.current.isEnabled === true;
    const newState = !isScanning;
    setIsScanning(newState);
    isScanningRef.current = newState;
    barcodeBatchRef.current.isEnabled = newState;

    if (newState === true) {
      startCamera();
    } else {
      stopCamera();
    }
  };

  barcodeBatchListenerRef.current = {
    async didUpdateSession(_barcodeBatch, session, _getFrameData) {
      const updatedTrackedBarcodes = { ...trackedBarcodesRef.current };
      session.removedTrackedBarcodes.forEach(identifier => {
        updatedTrackedBarcodes[identifier] = null;
      });

      Object.values(session.trackedBarcodes).forEach(trackedBarcode => {
        viewRef.current?.viewQuadrilateralForFrameQuadrilateral(trackedBarcode.location).then(location => {
          updateView(trackedBarcode, location);
        });
      });
      trackedBarcodesRef.current = updatedTrackedBarcodes;
    },
  };

  return (
    <SafeAreaProvider>
      <DataCaptureView
        style={styles.dataCaptureView}
        context={dataCaptureContext}
        ref={view => {
          if (!viewRef.current && view) {
            viewRef.current = view;
            advancedOverlayRef.current = setupOverlay();
          }
        }}
      />
      <SafeAreaView style={styles.toggleContainer}>
        {isScanning ? <Freeze onPress={toggleScan} /> : <Unfreeze onPress={toggleScan} />}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};
