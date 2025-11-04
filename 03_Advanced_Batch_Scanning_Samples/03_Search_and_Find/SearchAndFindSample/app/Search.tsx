import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  AppState,
  AppStateStatus,
  Image,
  Text,
  Pressable,
  View,
} from 'react-native';
import {
  Barcode,
  BarcodeCapture,
  BarcodeCaptureOverlay,
  BarcodeCaptureSession,
  BarcodeCaptureSettings,
  Symbology,
} from 'scandit-react-native-datacapture-barcode';
import {
  DataCaptureView,
  Camera,
  FrameSourceState,
  VideoResolution,
  AimerViewfinder,
  MeasureUnit,
  NumberWithUnit,
  RadiusLocationSelection,
  Brush,
  Color,
} from 'scandit-react-native-datacapture-core';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';

import { RootStackParamList } from './App';
import { styles } from './styles'
import dataCaptureContext from './CaptureContext'

type Props = StackScreenProps<RootStackParamList, 'Search'>;

const scannedBrush = Color.fromRGBA(40, 211, 128, 0.5);

export const Search = ({ navigation }: Props) => {
  const viewRef = useRef<DataCaptureView | null>(null);

  const [appStateVisible, setAppStateVisible] = useState(AppState.currentState);

  const camera = useRef<Camera | null>(null);

  const barcodeCaptureMode = useRef<BarcodeCapture>(null!);
  if (!barcodeCaptureMode.current) {
    barcodeCaptureMode.current = setupScanning();
  }

  const overlay = useRef<BarcodeCaptureOverlay>(null!);
  if (!overlay.current) {
    overlay.current = setupOverlay();
  }

  const [code, setCode] = useState<Barcode | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  // Due to a React Native issue with firing the AppState 'change' event on iOS, we want to avoid triggering
  // a startCapture/stopCapture on the scanner twice in a row. We work around this by keeping track of the
  // latest command that was run, and skipping a repeated call for starting or stopping scanning.
  const lastCommand = useRef<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      // Screen is focused.
      const handleAppStateChangeSubscription = AppState.addEventListener('change', handleAppStateChange);

      // Always re-setup when screen becomes focused to ensure listeners are attached and overlay is added to the view
      barcodeCaptureMode.current = setupScanning();
      overlay.current = setupOverlay();
      viewRef.current?.addOverlay(overlay.current);

      const initCamera = async () => {
        if (!camera.current) {
          camera.current = await setupCamera();
        }
      };

      initCamera();

      return () => {
        // Screen is unfocused, remove mode, overlay, and camera from the context
        handleAppStateChangeSubscription.remove();
        dataCaptureContext.removeMode(barcodeCaptureMode.current);
        camera.current = null;
        dataCaptureContext.setFrameSource(null);
        viewRef.current?.removeOverlay(overlay.current);
      };
    }, [])
  );

  useEffect(() => {
    return () => {
      stopCapture();
      dataCaptureContext.removeMode(barcodeCaptureMode.current);
    }
  }, []);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    setAppStateVisible(nextAppState);
  };

  useEffect(() => {
    if (appStateVisible.match(/inactive|background/)) {
      stopCapture();
    } else {
      startCapture();
    }
  }, [appStateVisible])

  async function setupCamera(): Promise<Camera> {
    // Use the world-facing (back) camera and set it as the frame source of the context. The camera is off by
    // default and must be turned on to start streaming frames to the data capture context for recognition.
    const cameraSettings = BarcodeCapture.createRecommendedCameraSettings();
    cameraSettings.preferredResolution = VideoResolution.FullHD;

    const camera = Camera.withSettings(cameraSettings);

    if (!camera) {
      throw new Error('Failed to setup camera');
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
    const barcodeCaptureSettings = new BarcodeCaptureSettings();

    // The settings instance initially has all types of barcodes (symbologies) disabled. For the purpose of this
    // sample we enable a very generous set of symbologies. In your own app ensure that you only enable the
    // symbologies that your app requires as every additional enabled symbology has an impact on processing times.
    barcodeCaptureSettings.enableSymbologies([
      Symbology.EAN13UPCA,
      Symbology.EAN8,
      Symbology.UPCE,
      Symbology.Code39,
      Symbology.Code128,
      Symbology.DataMatrix,
    ]);

    // By setting the radius to zero, the barcode's frame has to contain the point of interest.
    // The point of interest is at the center of the data capture view by default, as in this case.
    barcodeCaptureSettings.locationSelection = new RadiusLocationSelection(
      new NumberWithUnit(0, MeasureUnit.Fraction)
    );

    // Setting the code duplicate filter to one means that the scanner won't report the same code as recognized
    // for one second, once it's recognized.
    barcodeCaptureSettings.codeDuplicateFilter = 1000;

    // Some linear/1d barcode symbologies allow you to encode variable-length data. By default, the Scandit
    // Data Capture SDK only scans barcodes in a certain length range. If your application requires scanning of one
    // of these symbologies, and the length is falling outside the default range, you may need to adjust the "active
    // symbol counts" for this symbology. This is shown in the following few lines of code for one of the
    // variable-length symbologies.
    const symbologySettings = barcodeCaptureSettings.settingsForSymbology(Symbology.Code39);
    symbologySettings.activeSymbolCounts = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

    // Create new barcode capture mode with the settings from above.
    const barcodeCapture = new BarcodeCapture(barcodeCaptureSettings);

    // Register a listener to get informed whenever a new barcode got recognized.
    const barcodeCaptureListener = {
      didScan: async (_: BarcodeCapture, session: BarcodeCaptureSession) => {
        const barcode = session.newlyRecognizedBarcode;
        setCode(barcode);
        setModalVisible(true);
      }
    };

    // Add the listener to the barcode capture context.
    barcodeCapture.addListener(barcodeCaptureListener);

    // Add the barcode capture mode to the data capture context.
    dataCaptureContext.setMode(barcodeCapture);

    return barcodeCapture;
  };

  function setupOverlay(): BarcodeCaptureOverlay {
    // Add a barcode capture overlay to the data capture view to render the location of captured barcodes on top of
    // the video preview, using the Frame overlay style. This is optional, but recommended for better visual feedback.
    const overlay = new BarcodeCaptureOverlay(
        barcodeCaptureMode.current
    );
    overlay.viewfinder = new AimerViewfinder();

    overlay.brush = new Brush(
      scannedBrush,
      scannedBrush,
      2
    );

    return overlay;
  }

  const startCapture = async () => {
    if (lastCommand.current === 'startCapture') {
      return;
    }
    lastCommand.current = 'startCapture';
    startCamera();
    barcodeCaptureMode.current.isEnabled = true;
  };

  const stopCapture = () => {
    if (lastCommand.current === 'stopCapture') {
      return;
    }
    lastCommand.current = 'stopCapture';
    barcodeCaptureMode.current.isEnabled = false;
    stopCamera();
  };

  const startCamera = () => {
    if (camera.current) {
      camera.current.switchToDesiredState(FrameSourceState.On);
    }
  };

  const stopCamera = () => {
    if (camera.current) {
      camera.current.switchToDesiredState(FrameSourceState.Off);
    }
  };

  return (
    <>
      <DataCaptureView style={{ flex: 1 }} context={dataCaptureContext} ref={(view) => {
        if (view && !viewRef.current) {
          viewRef.current = view;
          viewRef.current.addOverlay(overlay.current);
        }
      }} />
      {isModalVisible &&
      <>
        <Pressable style={styles.closeButton} onPress={() => {
          setModalVisible(false);
          setCode(null);
        }}>
          <Image source={require('./closeButton.png')} style={{
            width: 24,
            height: 24
          }}></Image>
        </Pressable>
        <View style={styles.modal} >
          <View style={styles.textContainer} >
            <Text style={styles.textData}>{code ? code.data : 'No barcode scanned'}</Text>
            <Pressable style={styles.imageButton} onPress={() => {
              setModalVisible(false);
              navigation.navigate('Find', {
                itemToFind: code!
              })}
            }>
              <Image source={require('./Search.png')} style={{
                width: 50,
                height: 50,
              }}></Image>
            </Pressable>
          </View>
        </View>
      </>
      }
    </>
  );
}
