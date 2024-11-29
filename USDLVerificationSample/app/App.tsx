import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  Alert,
  AppState,
  AppStateStatus,
  BackHandler,
  View,
} from 'react-native';
import {
  Camera,
  CameraSettings,
  DataCaptureContext,
  DataCaptureView,
  FrameSourceState,
  VideoResolution,
} from 'scandit-react-native-datacapture-core';
import {
  AamvaBarcodeVerificationResult,
  AamvaBarcodeVerifier,
  CapturedId,
  DateResult,
  IdCapture,
  IdCaptureOverlay,
  RejectionReason,
  IdCaptureSettings,
  IdLayoutStyle,
  AamvaBarcodeVerificationStatus,
  DriverLicense,
  IdCaptureRegion,
  FullDocumentScanner,
} from 'scandit-react-native-datacapture-id';

import { styles } from './styles';

import { requestCameraPermissionsIfNeeded } from './camera-permission-handler';

export const App = () => {
  const viewRef = useRef<DataCaptureView | null>(null);

  // Create data capture context using your license key.
  const dataCaptureContext = useMemo(() => {
    // There is a Scandit sample license key set below here.
    // This license key is enabled for sample evaluation only.
    // If you want to build your own application, get your license key
    // by signing up for a trial at https://ssl.scandit.com/dashboard/sign-up?p=test
    return DataCaptureContext.forLicenseKey(
      '-- ENTER YOUR SCANDIT LICENSE KEY HERE --'
    );
  }, []);

  const [appStateVisible, setAppStateVisible] = useState(AppState.currentState);

  const [idCaptureMode, setIdCaptureMode] = useState<IdCapture | null>(null);
  const idCaptureRef = useRef<IdCapture | null>(null);
  const [camera, setCamera] = useState<Camera | null>(null);
  const [isIdCaptureEnabled, setIsIdCaptureEnabled] = useState(false);
  const [cameraState, setCameraState] = useState(FrameSourceState.Off);

  // Due to a React Native issue with firing the AppState 'change' event on iOS, we want to avoid triggering
  // a startCapture/stopCapture on the scanner twice in a row. We work around this by keeping track of the
  // latest command that was run, and skipping a repeated call for starting or stopping scanning.
  const lastCommand = useRef<string | null>(null);

  useEffect(() => {
    const handleAppStateChangeSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );
    startCapture();
    setupCapture();
    return () => {
      handleAppStateChangeSubscription.remove();
      dataCaptureContext.dispose();
    };
  }, []);

  useEffect(() => {
    if (idCaptureMode) {
      idCaptureMode.isEnabled = isIdCaptureEnabled;
    }
  }, [isIdCaptureEnabled]);

  useEffect(() => {
    if (camera) {
      camera.switchToDesiredState(cameraState);
    }
  }, [cameraState]);

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

  const startCapture = () => {
    if (lastCommand.current == 'startCapture') {
      return;
    }
    lastCommand.current = 'startCapture';
    startCamera();
    setIsIdCaptureEnabled(true);
  };

  const stopCapture = () => {
    if (lastCommand.current == 'stopCapture') {
      return;
    }
    lastCommand.current = 'stopCapture';
    setIsIdCaptureEnabled(false);
    setCameraState(FrameSourceState.Off);
  };

  const startCamera = () => {
    if (!camera) {
      // Use the world-facing (back) camera and set it as the frame source of the context. The camera is off by
      // default and must be turned on to start streaming frames to the data capture context for recognition.
      const cameraSettings = new CameraSettings();
      cameraSettings.preferredResolution = VideoResolution.UHD4K;

      const camera = Camera.withSettings(cameraSettings);
      dataCaptureContext.setFrameSource(camera);
      setCamera(camera);
    }

    // Switch camera on to start streaming frames and enable the barcode capture mode.
    // The camera is started asynchronously and will take some time to completely turn on.
    requestCameraPermissionsIfNeeded()
      .then(() => setCameraState(FrameSourceState.On))
      .catch(() => BackHandler.exitApp());
  };

  const setupCapture = () => {
    // The Id capturing process is configured through id capture settings
    // and are then applied to the id capture instance that manages id recognition.
    const settings = new IdCaptureSettings();

    // Configure different documents you are interested to scan
    settings.acceptedDocuments.push(new DriverLicense(IdCaptureRegion.Us));

    // We are interested in both front and back sides of US DL.
    settings.scannerType = new FullDocumentScanner();

    // Create new Id capture mode with the settings from above.
    const idCapture = IdCapture.forContext(dataCaptureContext, settings);

    // Register a listener to get informed whenever a new id got recognized.
    const idCaptureListener = {
      didCaptureId: (_: IdCapture, capturedId: CapturedId) => {
        // The `alert` call blocks execution until it's dismissed by the user. As no further frames would be processed
        // until the alert dialog is dismissed, we're showing the alert through a timeout and disabling the Id
        // capture mode until the dialog is dismissed, as you should not block the IdCaptureListener callbacks for
        // longer periods of time. See the documentation to learn more about this.
        setIsIdCaptureEnabled(false);

        if (capturedId.isExpired === true) {
          Alert.alert(
            'Error',
            descriptionForCapturedId(capturedId, null),
            [
              {
                text: 'OK',
                onPress: () => {
                  idCaptureRef.current?.reset();
                  setIsIdCaptureEnabled(true);
                },
              },
            ],
            { cancelable: false }
          );
          return;
        }

        AamvaBarcodeVerifier.create(dataCaptureContext).then((verifier) => {
          verifier
            .verify(capturedId)
            .then((verificationResult) => {
              Alert.alert(
                'Result',
                descriptionForCapturedId(capturedId, verificationResult),
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      idCaptureRef.current?.reset();
                      setIsIdCaptureEnabled(true);
                    },
                  },
                ],
                { cancelable: false }
              );
            })
            .catch((reason) => {
              Alert.alert(
                'Error',
                reason['message'],
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      idCaptureRef.current?.reset();
                      setIsIdCaptureEnabled(true);
                    },
                  },
                ],
                { cancelable: false }
              );
            });
        });
      },
      didRejectId: (
        mode: IdCapture,
        rejectedId: CapturedId | null,
        reason: RejectionReason
      ) => {
        setIsIdCaptureEnabled(false);

        Alert.alert(
          'Error',
          getRejectionReasonMessage(reason),
          [
            {
              text: 'OK',
              onPress: () => {
                setIsIdCaptureEnabled(true);
              },
            },
          ],
          { cancelable: false }
        );
      },
    };

    idCapture.addListener(idCaptureListener);

    // Add a Id capture overlay to the data capture view to render the location of captured ids on top of
    // the video preview. This is optional, but recommended for better visual feedback.
    const overlay = IdCaptureOverlay.withIdCaptureForView(idCapture, null);
    overlay.idLayoutStyle = IdLayoutStyle.Square;

    viewRef.current?.addOverlay(overlay);
    setIdCaptureMode(idCapture);
    idCaptureRef.current = idCapture;
  };

  const getDateAsString = (dateObject: DateResult | null) => {
    return `${
      (dateObject &&
        new Date(
          Date.UTC(dateObject.year, dateObject.month - 1, dateObject.day)
        ).toLocaleDateString('en-GB', { timeZone: 'UTC' })) ||
      'empty'
    }`;
  };

  const getRejectionReasonMessage = (reason: RejectionReason) => {
    switch (reason) {
      case RejectionReason.NotAcceptedDocumentType:
        return 'Document not supported. Try scanning another document.';
      case RejectionReason.Timeout:
        return 'Document capture failed. Make sure the document is well lit and free of glare. Alternatively, try scanning another document';
      default:
        return `Document capture was rejected. Reason=${reason}`;
    }
  };

  const descriptionForCapturedId = (
    capturedId: CapturedId | null,
    barcodeVerificationResult: AamvaBarcodeVerificationResult | null
  ) => {
    if (!capturedId) {
      return;
    }
    let verificationStatusString = '';

    if (capturedId.isExpired === false) {
      verificationStatusString += barcodeVerificationResult?.allChecksPassed
        ? 'Verification checks passed.'
        : 'Verification checks failed.';

      if (barcodeVerificationResult != null) {
        switch (barcodeVerificationResult.status) {
          case AamvaBarcodeVerificationStatus.Authentic:
            verificationStatusString += ' Document barcode is authentic.';
            break;
          case AamvaBarcodeVerificationStatus.LikelyForged:
            verificationStatusString += ' Document barcode is likely forged.';
            break;
          case AamvaBarcodeVerificationStatus.Forged:
            verificationStatusString += ' Document barcode is forged.';
            break;
        }
      }
    }

    return `
        ${
          capturedId.isExpired === true
            ? 'Document is expired.'
            : 'Document is not expired.'
        }
        ${verificationStatusString}

        Full Name: ${capturedId.fullName}
        Date of Birth: ${getDateAsString(capturedId.dateOfBirth)}
        Date of Expiry: ${getDateAsString(capturedId.dateOfExpiry)}
        Document Number: ${capturedId.documentNumber || 'empty'}
        Nationality: ${capturedId.nationality || 'empty'}`;
  };

  return (
    <>
      <View style={styles.scanContainer}>
        <DataCaptureView
          style={styles.cameraView}
          context={dataCaptureContext}
          ref={viewRef}
        />
      </View>
    </>
  );
};
