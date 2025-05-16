import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  AppState,
  AppStateStatus,
  BackHandler,
  Image,
  Text,
  Pressable,
  View,
} from 'react-native';
import {
  Barcode,
  BarcodeCapture,
  BarcodeCaptureOverlay,
  BarcodeCaptureOverlayStyle,
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
  DataCaptureContext,
} from 'scandit-react-native-datacapture-core';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';

import { RootStackParamList } from './App';
import { styles } from './styles'
import { requestCameraPermissionsIfNeeded } from './camera-permission-handler'

type Props = StackScreenProps<RootStackParamList, 'Search'>;

const scannedBrush = Color.fromRGBA(40, 211, 128, 0.5);

export const Search = ({ navigation }: Props) => {
  const viewRef = useRef<DataCaptureView | null>(null);

  const [appStateVisible, setAppStateVisible] = useState(AppState.currentState);

  const [camera, setCamera] = useState<Camera | null>(null);
  const [code, setCode] = useState<Barcode | null>(null);
  const [barcodeCaptureMode, setBarcodeCaptureMode] = useState<BarcodeCapture | null>(null);
  const [isBarcodeCaptureEnabled, setIsBarcodeCaptureEnabled] = useState(false);
  const [cameraState, setCameraState] = useState(FrameSourceState.Off);
  const [isModalVisible, setModalVisible] = useState(false);

  // Due to a React Native issue with firing the AppState 'change' event on iOS, we want to avoid triggering
  // a startCapture/stopCapture on the scanner twice in a row. We work around this by keeping track of the
  // latest command that was run, and skipping a repeated call for starting or stopping scanning.
  const lastCommand = useRef<string | null>(null);

  // Due to the on-focus behaviour of the @react-navigation useFocusEffect, we will avoid calling setupScanning() twice.
  const setupFlagRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      // Screen is focused.
      const handleAppStateChangeSubscription = AppState.addEventListener('change', handleAppStateChange);

      if (!setupFlagRef.current) {
        DataCaptureContext.sharedInstance.removeAllModes();
        setupScanning();
        startCapture();
      }

      return () => {
        // Screen is unfocused.
        handleAppStateChangeSubscription.remove();
        setupFlagRef.current = false;
        stopCapture();
        DataCaptureContext.sharedInstance.setFrameSource(null);
      };
    }, [])
  );

  useEffect(() => {
    setupScanning();
    startCapture();

    return () => {
      stopCapture();
      DataCaptureContext.sharedInstance.dispose()
    }
  }, []);

  useEffect(() => {
    if (camera) {
      camera.switchToDesiredState(cameraState);
    }
    return () => {
      if (camera) {
        camera.switchToDesiredState(FrameSourceState.Off);
      }
    }
  }, [cameraState]);

  useEffect(() => {
    if (barcodeCaptureMode) {
      barcodeCaptureMode.isEnabled = isBarcodeCaptureEnabled;
    }
  }, [isBarcodeCaptureEnabled]);

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

  const setupScanning = () => {
    if (setupFlagRef.current) {
      return
    }
    // Use the world-facing (back) camera and set it as the frame source of the context. The camera is off by
    // default and must be turned on to start streaming frames to the data capture context for recognition.
    const cameraSettings = BarcodeCapture.recommendedCameraSettings;
    cameraSettings.preferredResolution = VideoResolution.FullHD;

    const camera = Camera.withSettings(cameraSettings);
    DataCaptureContext.sharedInstance.setFrameSource(camera);
    setCamera(camera);

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
    const barcodeCapture = BarcodeCapture.forContext(DataCaptureContext.sharedInstance, barcodeCaptureSettings);

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

    // Add a barcode capture overlay to the data capture view to render the location of captured barcodes on top of
    // the video preview, using the Frame overlay style. This is optional, but recommended for better visual feedback.
    const overlay = BarcodeCaptureOverlay.withBarcodeCaptureForViewWithStyle(
        barcodeCapture,
        null,
        BarcodeCaptureOverlayStyle.Frame
    );
    overlay.viewfinder = new AimerViewfinder();

    overlay.brush = new Brush(
      scannedBrush,
      scannedBrush,
      2
    );

    viewRef.current?.addOverlay(overlay);

    setBarcodeCaptureMode(barcodeCapture);

    setupFlagRef.current = true;
  };

  const startCapture = async () => {
    if (lastCommand.current === 'startCapture') {
      return;
    }
    lastCommand.current = 'startCapture';
    startCamera();
    setIsBarcodeCaptureEnabled(true);
  };

  const stopCapture = () => {
    if (lastCommand.current === 'stopCapture') {
      return;
    }
    lastCommand.current = 'stopCapture';
    setIsBarcodeCaptureEnabled(false);
    stopCamera();
  };

  const startCamera = () => {
    // Switch camera on to start streaming frames and enable the barcode capture mode.
    // The camera is started asynchronously and will take some time to completely turn on.
    requestCameraPermissionsIfNeeded()
      .then(() => setCameraState(FrameSourceState.On))
      .catch(() => BackHandler.exitApp());
  }

  const stopCamera = () => {
    if (camera) {
      setCameraState(FrameSourceState.Off);
    }
  }

  return (
    <>
      <DataCaptureView style={{ flex: 1 }} context={DataCaptureContext.sharedInstance} ref={viewRef} />
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
