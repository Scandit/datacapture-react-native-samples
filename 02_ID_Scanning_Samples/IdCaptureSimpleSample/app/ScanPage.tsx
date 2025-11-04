import React, { useEffect, useRef } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import {
  Camera,
  DataCaptureView,
  FrameSourceState,
} from 'scandit-react-native-datacapture-core';
import {
  IdCapture,
  IdCaptureOverlay,
  IdCaptureSettings,
  IdLayoutStyle,
  IdCard,
  IdCaptureRegion,
  DriverLicense,
  Passport,
  FullDocumentScanner,
  RejectionReason,
  CapturedId,
  DateResult,
  IdCaptureScanner,
} from 'scandit-react-native-datacapture-id';

import dataCaptureContext from './CaptureContext';

export const ScanPage = () => {

  const viewRef = React.createRef();
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

    const handleAppStateChangeSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      handleAppStateChangeSubscription.remove();
      dataCaptureContext.removeMode(idCapture.current);
    }
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
  }

  const stopCapture = () => {
    idCapture.current.isEnabled = false;
    stopCamera();
  }

  const stopCamera = () => {
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
    const camera = Camera.default;

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

    // Add a Id capture overlay to the data capture view to render the location of captured ids on top of
    // the video preview. This is optional, but recommended for better visual feedback.
    const overlay = new IdCaptureOverlay(idCapture.current);

    overlay.idLayoutStyle = IdLayoutStyle.Square;

    return overlay;
  }

  function setupCapture(): IdCapture {
    // The Id capturing process is configured through id capture settings
    // and are then applied to the id capture instance that manages id recognition.
    const settings = new IdCaptureSettings();

    // Recognize national ID cards, driver's licenses and passports.
    settings.acceptedDocuments.push(
      new IdCard(IdCaptureRegion.Any),
      new DriverLicense(IdCaptureRegion.Any),
      new Passport(IdCaptureRegion.Any)
    );
    settings.scanner = new IdCaptureScanner(new FullDocumentScanner());

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

        const result = descriptionForCapturedId(capturedId);

        Alert.alert(
          'Result',
          result,
          [{ text: 'OK', onPress: () => idCapture.isEnabled = true }],
          { cancelable: false }
        );
      },
      didRejectId: (_: IdCapture, rejectedId: CapturedId, reason: RejectionReason) => {
        idCapture.isEnabled = false;

        Alert.alert(
          'Error',
          getRejectionReasonMessage(reason),
          [{ text: 'OK', onPress: () => idCapture.isEnabled = true }],
          { cancelable: false }
        );
      }
    };

    idCapture.addListener(idCaptureListener);

    // Set the id capture mode to the data capture context.
    dataCaptureContext.setMode(idCapture);

    return idCapture;
  }

  const descriptionForCapturedId = (result: CapturedId) => {
    return `
    Full Name: ${result.fullName}
    Date of Birth: ${getDateAsString(result.dateOfBirth)}
    Date of Expiry: ${getDateAsString(result.dateOfExpiry)}
    Document Number: ${result.documentNumber || "empty"}
    Nationality: ${result.nationality || "empty"}`
  }

  const getRejectionReasonMessage = (reason: RejectionReason) => {
    switch (reason) {
      case  RejectionReason.NotAcceptedDocumentType:
        return 'Document not supported. Try scanning another document.';
      case RejectionReason.Timeout:
        return 'Document capture failed. Make sure the document is well lit and free of glare. Alternatively, try scanning another document';
      default:
        return `Document capture was rejected. Reason=${reason}`;
    }
  }

  const getDateAsString = (dateObject: DateResult | null) => {
    return dateObject && dateObject.localDate ? dateObject.localDate
      .toLocaleDateString("en-GB") : "empty";
  }

  return (
    <DataCaptureView style={{ flex: 1 }} context={dataCaptureContext} ref={(view) => {
      if (view && !viewRef.current) {
        view.addOverlay(overlay.current);
        viewRef.current = view;
      }
    }} />
  );
}

