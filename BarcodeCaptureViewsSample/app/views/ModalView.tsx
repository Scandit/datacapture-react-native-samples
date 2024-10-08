import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  Dispatch,
  SetStateAction,
} from 'react';
import {
  Alert,
  AppState,
  AppStateStatus,
  BackHandler,
  Modal,
  View,
} from 'react-native';
import {
  BarcodeCapture,
  BarcodeCaptureFeedback,
  BarcodeCaptureOverlay,
  BarcodeCaptureSession,
  BarcodeCaptureSettings,
  Symbology,
  SymbologyDescription,
} from 'scandit-react-native-datacapture-barcode';
import {
  Camera,
  CameraSettings,
  DataCaptureContext,
  DataCaptureView,
  Feedback,
  FrameSourceState,
  VideoResolution,
} from 'scandit-react-native-datacapture-core';

import { requestCameraPermissionsIfNeeded } from '../camera-permission-handler';

import { styles } from '../styles';

import licenseKey from '../license';

type Props = {
  modalVisible: boolean;
  setModalVisible: Dispatch<SetStateAction<boolean>>;
};

export const ModalView = ({ modalVisible, setModalVisible }: Props) => {
  const viewRef = useRef<DataCaptureView | null>(null);
  const barcodeCaptureRef = useRef<BarcodeCapture | null>(null);

  const dataCaptureContext = useMemo(() => {
    // There is a Scandit sample license key set below here.
    // This license key is enabled for sample evaluation only.
    // If you want to build your own application, get your license key
    // by signing up for a trial at https://ssl.scandit.com/dashboard/sign-up?p=test
    return DataCaptureContext.forLicenseKey(licenseKey);
  }, []);

  const [appStateVisible, setAppStateVisible] = useState(AppState.currentState);

  const [camera, setCamera] = useState<Camera | null>(null);
  const [isBarcodeCaptureEnabled, setIsBarcodeCaptureEnabled] = useState(false);

  const [cameraState, setCameraState] = useState(FrameSourceState.Off);

  useEffect(() => {
    const handleAppStateChangeSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );
    // Modals are included in a screen even when not visible. We want to perform the setup steps only
    // once the modal becomes visible to the user.
    if (modalVisible) {
      setupScanning();
      startCapture();
    }
    return () => {
      handleAppStateChangeSubscription.remove();
      dataCaptureContext.removeAllModes();
    };
  }, [modalVisible]);

  useEffect(() => {
    if (camera && modalVisible) {
      camera.switchToDesiredState(cameraState);
    }
    return () => {
      // Turn of the camera only when the component is unmounting, which means
      // the current view is no longer available.
      if (camera && !viewRef.current) {
        camera.switchToDesiredState(FrameSourceState.Off);
      }
    };
  }, [cameraState, modalVisible]);

  useEffect(() => {
    if (barcodeCaptureRef.current) {
      // Disable barcodeCaptureMode only when the component is unmounting, which means
      // the current view is no longer available.
      barcodeCaptureRef.current.isEnabled = isBarcodeCaptureEnabled;
    }
    return () => {
      // For modals it makes sense to also dispose of the context when turning off barcode capture,
      // once the component is unmounted. Note that this is handled differently than in the use-cases
      // where the DataCaptureView is rendered in a separate screen, and not a modal.
      if (barcodeCaptureRef.current && !viewRef.current) {
        barcodeCaptureRef.current.isEnabled = false;
        dataCaptureContext.dispose();
      }
    };
  }, [isBarcodeCaptureEnabled, modalVisible]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    setAppStateVisible(nextAppState);
  };

  useEffect(() => {
    if (!appStateVisible.match(/inactive|background/)) {
      startCapture();
    } else {
      stopCapture();
    }
  }, [appStateVisible]);

  const setupScanning = () => {
    // Barcode capture is configured through barcode capture settings which are then
    // applied to the barcode capture instance that manages barcode capture.
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

    // Set the time interval in which codes with the same symbology/data are filtered out as duplicates
    settings.codeDuplicateFilter = 1000;

    // Some linear/1d barcode symbologies allow you to encode variable-length data. By default, the Scandit
    // Data Capture SDK only scans barcodes in a certain length range. If your application requires scanning of one
    // of these symbologies, and the length is falling outside the default range, you may need to adjust the
    // 'active symbol counts' for this symbology. This is shown in the following few lines of code for one of the
    // variable-length symbologies.
    const symbologySettings = settings.settingsForSymbology(Symbology.Code39);
    symbologySettings.activeSymbolCounts = [
      7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ];

    // Create new barcode capture mode with the settings from above.
    const barcodeCapture = BarcodeCapture.forContext(
      dataCaptureContext,
      settings
    );

    // Register a listener to get informed whenever a new barcode is tracked.
    const barcodeCaptureListener = {
      didScan: (_: BarcodeCapture, session: BarcodeCaptureSession) => {
        const barcode = session.newlyRecognizedBarcode;
        if (barcode == null) return;

        const symbology = new SymbologyDescription(barcode.symbology);

        // The `alert` call blocks execution until it's dismissed by the user. As no further frames would be
        // processed until the alert dialog is dismissed, we're showing the alert through a timeout and
        // disabling the barcode capture mode until the dialog is dismissed, as you should not block the
        // BarcodeCaptureListener callbacks for longer periods of time. See the documentation to learn
        // more about this.
        setIsBarcodeCaptureEnabled(false);

        Alert.alert(
          '',
          `Scanned: ${barcode.data} (${symbology.readableName})`,
          [{ text: 'OK', onPress: () => setIsBarcodeCaptureEnabled(true) }],
          { cancelable: false }
        );
      },
    };

    // Add the listener to the barcode capture context.
    barcodeCapture.addListener(barcodeCaptureListener);

    // Remove feedback so we can create custom feedback later on.
    const feedback = BarcodeCaptureFeedback.default;
    feedback.success = new Feedback(null, null);
    barcodeCapture.feedback = feedback;

    // Add an overlay for the scanned barcodes.
    const barcodeCaptureOverlay =
      BarcodeCaptureOverlay.withBarcodeCaptureForView(barcodeCapture, null);
    viewRef.current?.addOverlay(barcodeCaptureOverlay);
    barcodeCaptureRef.current = barcodeCapture;
  };

  const startCapture = () => {
    startCamera();
    setIsBarcodeCaptureEnabled(true);
  };

  const stopCapture = () => {
    setIsBarcodeCaptureEnabled(false);
    stopCamera();    
  };

  const stopCamera = () => {
    setCameraState(FrameSourceState.Off);
  };

  const startCamera = () => {
    if (!camera) {
      // Use the world-facing (back) camera and set it as the frame source of the context. The camera is off by
      // default and must be turned on to start streaming frames to the data capture context for recognition.
      const cameraSettings = new CameraSettings();
      cameraSettings.preferredResolution = VideoResolution.UHD4K;

      const defaultCamera = Camera.withSettings(cameraSettings);
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
    <Modal
      animationType='slide'
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}
    >
      <View style={styles.modalView}>
        <DataCaptureView
          style={styles.modalView}
          context={dataCaptureContext}
          ref={viewRef}
        />
      </View>
    </Modal>
  );
};
