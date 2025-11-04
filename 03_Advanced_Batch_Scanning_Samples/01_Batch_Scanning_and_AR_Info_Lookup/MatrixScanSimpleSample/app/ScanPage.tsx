import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { AppState, View } from 'react-native';
import {
  BarcodeBatch,
  BarcodeBatchBasicOverlay,
  BarcodeBatchBasicOverlayStyle,
  BarcodeBatchSession,
  BarcodeBatchSettings,
  Symbology,
} from 'scandit-react-native-datacapture-barcode';
import {
  Camera,
  DataCaptureView,
  FrameSourceState,
  VideoResolution,
} from 'scandit-react-native-datacapture-core';

import { Button } from './Button';
import { styles } from './styles';
import dataCaptureContext from './CaptureContext';
import { RootStackParamList } from './types';

export const ScanPage = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const viewRef = useRef<DataCaptureView>(null);

  const barcodeBatchRef = useRef<BarcodeBatch>(null!);
  if (!barcodeBatchRef.current) {
    barcodeBatchRef.current = setupScanning();
  }

  const cameraRef = useRef<Camera | null>(null);

  const overlay = useRef<BarcodeBatchBasicOverlay>(null!);
  if (!overlay.current) {
    overlay.current = setupOverlay();
  }

  const [results, setResults] = useState<Record<string, { data: string; symbology: Symbology }>>({});

  useEffect(() => {
    const initCamera = async () => {
      if (!cameraRef.current) {
        cameraRef.current = await setupCamera();
      }
    };

    initCamera();

    const handleAppStateChangeSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState.match(/inactive|background/)) {
        stopCapture();
      } else {
        startCapture();
      }
    });

    return () => {
      handleAppStateChangeSubscription.remove();
      dataCaptureContext.removeMode(barcodeBatchRef.current);
    };
  }, []);

  const startCapture = () => {
    startCamera();
    barcodeBatchRef.current.isEnabled = true;
  }

  const stopCapture = () => {
    barcodeBatchRef.current.isEnabled = false;
    stopCamera();
  }

  const goToResults = () => {
    navigation.navigate('results', { results: results });
  }

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
    // Use the world-facing (back) camera and set it as the frame source of the context. The camera is off by
    // default and must be turned on to start streaming frames to the data capture context for recognition.
    const cameraSettings = BarcodeBatch.createRecommendedCameraSettings()
    cameraSettings.preferredResolution = VideoResolution.FullHD;

    const camera = Camera.withSettings(cameraSettings);

    if (!camera) {
      throw new Error('No camera available');
    }

    // Switch the camera on to start streaming frames and enable the barcode batch mode.
    await camera.switchToDesiredState(FrameSourceState.On);
    // Set the camera as the frame source of the data capture context.
    await dataCaptureContext.setFrameSource(camera);

    return camera;
  }

  function setupOverlay(): BarcodeBatchBasicOverlay {
    if (!barcodeBatchRef.current) {
      throw new Error('Barcode batch not initialized');
    }

    // Add a barcode batch overlay to the data capture view to render the location of captured barcodes on top of
    // the video preview. This is optional, but recommended for better visual feedback.
    return new BarcodeBatchBasicOverlay(barcodeBatchRef.current, BarcodeBatchBasicOverlayStyle.Frame);
  }
  function setupScanning(): BarcodeBatch {
    // The barcode batch process is configured through barcode batch settings
    // which are then applied to the barcode batch instance that manages barcode batch.
    const settings = new BarcodeBatchSettings();

    // The settings instance initially has all types of barcodes (symbologies) disabled. For the purpose of this
    // sample we enable a very generous set of symbologies. In your own app ensure that you only enable the
    // symbologies that your app requires as every additional enabled symbology has an impact on processing times.
    settings.enableSymbologies([
      Symbology.EAN13UPCA,
      Symbology.EAN8,
      Symbology.UPCE,
      Symbology.Code39,
      Symbology.Code128,
    ]);

    // Create new barcode batch mode with the settings from above.
    const barcodeBatch = new BarcodeBatch(settings);

    // Register a listener to get informed whenever a new barcode is tracked.
    const barcodeBatchListener = {
      didUpdateSession: async (_: BarcodeBatch, session: BarcodeBatchSession) => {
        Object.values(session.trackedBarcodes).forEach(trackedBarcode => {
          const { data, symbology } = trackedBarcode.barcode;
          if (data) {
            setResults(prevResults => ({ ...prevResults, [data]: { data, symbology } }));
          }
        });
      }
    };

    barcodeBatch.addListener(barcodeBatchListener);

    // Set the barcode batch mode to the data capture context.
    dataCaptureContext.setMode(barcodeBatch);

    return barcodeBatch;
  }

  return (
    <>
      <DataCaptureView style={{ flex: 1 }} context={dataCaptureContext} ref={(view) => {
        if (view && !viewRef.current) {
          view.addOverlay(overlay.current)
          viewRef.current = view;
        }
      }} />
      <View style={styles.buttonContainer}>
        <Button
          styles={styles.button}
          textStyles={styles.buttonText}
          title='Done'
          onPress={() => goToResults()}
          disabled={false}
        />
      </View>
    </>
  );
}
