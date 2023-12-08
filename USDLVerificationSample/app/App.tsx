import React, {useMemo, useRef, useState, useEffect} from 'react';
import {Alert, AppState, AppStateStatus, BackHandler, View} from 'react-native';
import {
    Camera, CameraSettings, DataCaptureContext, DataCaptureView, FrameSourceState, VideoResolution,
} from 'scandit-react-native-datacapture-core';
import {
    AamvaBarcodeVerificationResult,
    AamvaBarcodeVerifier,
    AamvaVizBarcodeComparisonResult,
    AamvaVizBarcodeComparisonVerifier,
    CapturedId,
    ComparisonCheckResult,
    DateResult,
    DocumentType,
    IdCapture,
    IdCaptureError,
    IdCaptureOverlay,
    IdCaptureSession,
    IdCaptureSettings,
    IdDocumentType,
    IdLayoutStyle,
    SupportedSides,
} from 'scandit-react-native-datacapture-id';

import {styles} from './styles';

import {requestCameraPermissionsIfNeeded} from './camera-permission-handler';

export const App = () => {
    const viewRef = useRef<DataCaptureView | null>(null);
    const isScanningBackside = useRef(false);

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

    const [idCaptureMode, setIdCaptureMode] = useState<IdCapture | null>(null);
    const idCaptureRef = useRef<IdCapture | null>(null);
    const [camera, setCamera] = useState<Camera | null>(null);
    const [isIdCaptureEnabled, setIsIdCaptureEnabled] = useState(false);
    const [cameraState, setCameraState] = useState(FrameSourceState.Off);

    const [notification, setNotification] = useState('Align front of document');

    // Due to a React Native issue with firing the AppState 'change' event on iOS, we want to avoid triggering
    // a startCapture/stopCapture on the scanner twice in a row. We work around this by keeping track of the
    // latest command that was run, and skipping a repeated call for starting or stopping scanning.
    const lastCommand = useRef<string | null>(null);

    useEffect(() => {
        const handleAppStateChangeSubscription = AppState.addEventListener('change', handleAppStateChange);
        startCapture();
        setupCapture();
        return () => {
            handleAppStateChangeSubscription.remove();
            dataCaptureContext.dispose()
        }
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
        if (!nextAppState.match(/inactive|background/)) {
            startCapture();
        } else {
            stopCapture();
        }
    };

    const startCapture = () => {
        if (lastCommand.current == 'startCapture') {
            return;
        }
        lastCommand.current = 'startCapture';
        startCamera();
        setIsIdCaptureEnabled(true);
    }

    const stopCapture = () => {
        if (lastCommand.current == 'stopCapture') {
            return;
        }
        lastCommand.current = 'stopCapture';
        setIsIdCaptureEnabled(false);
        setCameraState(FrameSourceState.Off);
    }

    const startCamera = () => {
        if (!camera) {
            // Use the world-facing (back) camera and set it as the frame source of the context. The camera is off by
            // default and must be turned on to start streaming frames to the data capture context for recognition.
            const camera = Camera.default;
            dataCaptureContext.setFrameSource(camera);

            const cameraSettings = new CameraSettings();
            cameraSettings.preferredResolution = VideoResolution.UHD4K;
            camera?.applySettings(cameraSettings);
            setCamera(camera);
        }

        // Switch camera on to start streaming frames and enable the barcode capture mode.
        // The camera is started asynchronously and will take some time to completely turn on.
        requestCameraPermissionsIfNeeded()
            .then(() => setCameraState(FrameSourceState.On))
            .catch(() => BackHandler.exitApp());
    }

    const setupCapture = () => {
        // The Id capturing process is configured through id capture settings
        // and are then applied to the id capture instance that manages id recognition.
        const settings = new IdCaptureSettings();

        // We are interested in both front and back sides of US DL.
        settings.supportedDocuments = [IdDocumentType.DLVIZ, IdDocumentType.IdCardVIZ];
        settings.supportedSides = SupportedSides.FrontAndBack;

        // Create new Id capture mode with the settings from above.
        const idCapture = IdCapture.forContext(dataCaptureContext, settings);

        // Create Aamva viz barcode comparison verifier
        const vizBarcodeComparisonVerifier = AamvaVizBarcodeComparisonVerifier.create();

        // Register a listener to get informed whenever a new id got recognized.
        const idCaptureListener = {
            didCaptureId: (_: IdCapture, session: IdCaptureSession) => {
                if (session.newlyCapturedId == null) {
                    return
                }

                // The `alert` call blocks execution until it's dismissed by the user. As no further frames would be processed
                // until the alert dialog is dismissed, we're showing the alert through a timeout and disabling the Id
                // capture mode until the dialog is dismissed, as you should not block the IdCaptureListener callbacks for
                // longer periods of time. See the documentation to learn more about this.
                setIsIdCaptureEnabled(false);

                if (
                    (
                        session.newlyCapturedId.documentType === DocumentType.DrivingLicense
                        && session.newlyCapturedId.issuingCountryIso === 'USA'
                        && session.newlyCapturedId.vizResult?.isBackSideCaptureSupported
                    ) || isScanningBackside.current === true) {

                    if (!isScanningBackside.current === true) {
                        // Scan the back side of the document.
                        isScanningBackside.current = !isScanningBackside.current;
                        setNotification('Align back of document');
                        setIsIdCaptureEnabled(true);
                    } else {
                        const capturedId = session.newlyCapturedId;

                        if (capturedId == null)  {
                            return;
                        }
                        
                        // Front and back were scanned; perform a verification of the captured ID.
                        vizBarcodeComparisonVerifier.verify(session.newlyCapturedId)
                            .then((result: AamvaVizBarcodeComparisonResult) => {
                                // If front and back match AND ID is not expired, run verification
                                if (!session.newlyCapturedId?.isExpired && result.checksPassed) {
                                    AamvaBarcodeVerifier.create(dataCaptureContext).then((verifier) => {
                                        verifier.verify(capturedId).then(verificationResult => {
                                            Alert.alert(
                                                'Result',
                                                descriptionForCapturedId(session.newlyCapturedId, result, verificationResult),
                                                [{
                                                    text: 'OK',
                                                    onPress: () => {
                                                        setNotification('Align front of document');
                                                        idCaptureRef.current?.reset();
                                                        isScanningBackside.current = false;
                                                        setIsIdCaptureEnabled(true);
                                                    }
                                                }], {cancelable: false});
                                        })
                                    });
                                } else {
                                    Alert.alert(
                                        'Result',
                                        descriptionForCapturedId(session.newlyCapturedId, result, null),
                                        [{
                                            text: 'OK',
                                            onPress: () => {
                                                setNotification('Align front of document');
                                                idCaptureRef.current?.reset();
                                                isScanningBackside.current = false;
                                                setIsIdCaptureEnabled(true);
                                            }
                                        }], {cancelable: false});
                                }
                                
                            })
                    }

                } else {

                    Alert.alert(
                        'Note',
                        'Document is not a US driver’s license.',
                        [{
                            text: 'OK',
                            onPress: () => {
                                idCaptureRef.current?.reset();
                                setIsIdCaptureEnabled(true);
                            }
                        }], {cancelable: false});

                }
            }, didFailWithError: (_: IdCapture, error: IdCaptureError, session: IdCaptureSession) => {
                Alert.alert('Error', error.message, undefined, {cancelable: false});
            }
        };

        idCapture.addListener(idCaptureListener);

        // Add a Id capture overlay to the data capture view to render the location of captured ids on top of
        // the video preview. This is optional, but recommended for better visual feedback.
        const overlay = IdCaptureOverlay.withIdCaptureForView(idCapture, null);
        overlay.idLayoutStyle = IdLayoutStyle.Square;

        viewRef.current?.addOverlay(overlay);
        setIdCaptureMode(idCapture);
        idCaptureRef.current = idCapture;
    }

    const getDateAsString = (dateObject: DateResult | null) => {
        return `${(dateObject && new Date(Date.UTC(
            dateObject.year,
            dateObject.month - 1,
            dateObject.day
        )).toLocaleDateString("en-GB", {timeZone: "UTC"})) || "empty"}`
    }

    const descriptionForCapturedId = (capturedId: CapturedId | null, verificationResult: AamvaVizBarcodeComparisonResult, barcodeVerificationResult: AamvaBarcodeVerificationResult | null) => {
        if (!capturedId) {
            return
        }

        return `
        ${verificationResult.datesOfExpiryMatch.checkResult === ComparisonCheckResult.Passed ? "Document is not expired." : "Document is expired."}
        ${verificationResult.checksPassed ? "Information on front and back match." : "Information on front and back do not match."}
        ${barcodeVerificationResult?.allChecksPassed == true ? "Verification checks passed." : "Verification checks failed"}

        Name: ${capturedId.firstName || "empty"}
        Last Name: ${capturedId.lastName || "empty"}
        Full Name: ${capturedId.fullName}
        Sex: ${capturedId.sex || "empty"}
        Date of Birth: ${getDateAsString(capturedId.dateOfBirth)}
        Nationality: ${capturedId.nationality || "empty"}
        Address: ${capturedId.address || "empty"}
        Document Type: ${capturedId.documentType}
        Captured Result Type: ${capturedId.capturedResultType}
        Issuing Country: ${capturedId.issuingCountry || "empty"}
        Issuing Country ISO: ${capturedId.issuingCountryIso || "empty"}
        Document Number: ${capturedId.documentNumber || "empty"}
        Date of Expiry: ${getDateAsString(capturedId.dateOfExpiry)}
        Date of Issue: ${getDateAsString(capturedId.dateOfIssue)}`
    }

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
}
