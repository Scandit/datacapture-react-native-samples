import React, { useRef, useEffect } from 'react';
import {
  Alert,
  AppState,
  AppStateStatus,
  View,
} from 'react-native';
import {
  Camera,
  CameraSettings,
  DataCaptureView,
  FrameSourceState,
  VideoResolution,
} from 'scandit-react-native-datacapture-core';
import {
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
  IdCaptureScanner,
} from 'scandit-react-native-datacapture-id';

import { styles } from './styles';

import dataCaptureContext from './CaptureContext';

export const ScanPage = () => {
  const viewRef = useRef<DataCaptureView | null>(null);
  const camera = useRef<Camera | null>(null);

  const idCapture = useRef<IdCapture>(null!);
  if (!idCapture.current) {
    idCapture.current = setupCapture();
  }

  const overlay = useRef<IdCaptureOverlay>(null!);
  if (!overlay.current) {
    overlay.current = setupOverlay();
  }

  useEffect(() => {
    const initCamera = async () => {
      if (!camera.current) {
        camera.current = await setupCamera();
      }
    };

    initCamera();

    const handleAppStateChangeSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    return () => {
      handleAppStateChangeSubscription.remove();
      dataCaptureContext.removeMode(idCapture.current);
    };
  }, []);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState.match(/inactive|background/)) {
      stopCapture();
    } else {
      startCapture();
    }
  }

  const startCapture = () => {
    startCamera();
    idCapture.current.isEnabled = true;
  };

  const stopCapture = () => {
    idCapture.current.isEnabled = false;
    if (camera.current) {
      camera.current.switchToDesiredState(FrameSourceState.Off);
    }
  };

  const startCamera = () => {
    if (camera.current) {
      camera.current.switchToDesiredState(FrameSourceState.On);
    }
  };

  async function setupCamera(): Promise<Camera> {
      // Use the world-facing (back) camera and set it as the frame source of the context. The camera is off by
      // default and must be turned on to start streaming frames to the data capture context for recognition.
      const cameraSettings = new CameraSettings();
      cameraSettings.preferredResolution = VideoResolution.UHD4K;

      const camera = Camera.withSettings(cameraSettings);

      // Camera is null if the camera is not available on the device.
      if (!camera) {
        throw new Error('Failed to initialize camera - camera not available on device');
      }

      // Switch the camera on to start streaming frames and enable the id capture mode.
      await camera.switchToDesiredState(FrameSourceState.On);
      // Set the camera as the frame source of the data capture context.
      await dataCaptureContext.setFrameSource(camera);

      return camera;
  }

  function setupOverlay(): IdCaptureOverlay {
    if (!idCapture.current) {
      throw new Error('Failed to initialize overlay');
    }

    const overlay = new IdCaptureOverlay(idCapture.current);
    overlay.idLayoutStyle = IdLayoutStyle.Square;
    // Add the overlay to the data capture view.
    return overlay;
  }

  function setupCapture(): IdCapture {
    // The Id capturing process is configured through id capture settings
    // and are then applied to the id capture instance that manages id recognition.
    const settings = new IdCaptureSettings();

    // Configure different documents you are interested to scan
    settings.acceptedDocuments.push(new DriverLicense(IdCaptureRegion.Us));

    // We are interested in both front and back sides of US DL.
    settings.scanner = new IdCaptureScanner(new FullDocumentScanner());

    // Reject forged AAMVA barcodes.
    settings.rejectForgedAamvaBarcodes = true;

    // Create new Id capture mode with the settings from above.
    const idCapture = new IdCapture(settings);

    // Register a listener to get informed whenever a new id got recognized.
    const idCaptureListener = {
      didCaptureId: (_: IdCapture, capturedId: CapturedId) => {
        // The `alert` call blocks execution until it's dismissed by the user. As no further frames would be processed
        // until the alert dialog is dismissed, we're showing the alert through a timeout and disabling the Id
        // capture mode until the dialog is dismissed, as you should not block the IdCaptureListener callbacks for
        // longer periods of time. See the documentation to learn more about this.
        idCapture.isEnabled = false;

        Alert.alert(
          'Result',
          descriptionForCapturedId(capturedId),
          [
            {
              text: 'OK',
              onPress: () => {
                idCapture.reset();
                idCapture.isEnabled = true;
              },
            },
          ],
          { cancelable: false },
        );
      },
      didRejectId: (mode: IdCapture, rejectedId: CapturedId | null, reason: RejectionReason) => {
        idCapture.isEnabled = false;

        Alert.alert(
          'Error',
          getRejectionReasonMessage(rejectedId, reason),
          [
            {
              text: 'OK',
              onPress: () => {
                idCapture.isEnabled = true;
              },
            },
          ],
          { cancelable: false },
        );
      },
    };

    idCapture.addListener(idCaptureListener);

    // Set the id capture mode to the data capture context.
    dataCaptureContext.setMode(idCapture);

    return idCapture;
  };

  const getDateAsString = (dateObject: DateResult | null) => {
    return `${
      (dateObject &&
        new Date(Date.UTC(dateObject.year, dateObject.month - 1, dateObject.day)).toLocaleDateString('en-GB', {
          timeZone: 'UTC',
        })) ||
      'empty'
    }`;
  };

  const getRejectionReasonMessage = (rejectedId: CapturedId | null, reason: RejectionReason) => {
    switch (reason) {
      case RejectionReason.NotAcceptedDocumentType:
        return 'Document not supported. Try scanning another document.';
      case RejectionReason.ForgedAamvaBarcode:
        if (
          rejectedId?.verificationResult.aamvaBarcodeVerification?.status ===
          AamvaBarcodeVerificationStatus.LikelyForged
        ) {
          return 'Document barcode is likely forged.';
        } else {
          return 'Document barcode is forged.';
        }
      case RejectionReason.Timeout:
        return 'Document capture failed. Make sure the document is well lit and free of glare. Alternatively, try scanning another document';
      default:
        return `Document capture was rejected. Reason=${reason}`;
    }
  };

  const descriptionForCapturedId = (capturedId: CapturedId | null) => {
    if (!capturedId) {
      return;
    }
    let verificationStatusString = '';

    if (capturedId.isExpired === false) {
      verificationStatusString += 'Document barcode is authentic.';
    }

    return `
        ${capturedId.isExpired === true ? 'Document is expired.' : 'Document is not expired.'}
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
          ref={(view) => {
            if (view && !viewRef.current) {
              view.addOverlay(overlay.current);
              viewRef.current = view;
            }
          }}
        />
      </View>
    </>
  );
};
