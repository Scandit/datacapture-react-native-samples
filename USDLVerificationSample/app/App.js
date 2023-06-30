import React, {useRef, useState, useEffect} from 'react';
import {Alert, AppState, BackHandler, View} from 'react-native';
import {
    Camera, CameraSettings, DataCaptureContext, DataCaptureView, FrameSourceState, VideoResolution,
} from 'scandit-react-native-datacapture-core';
import {
    AamvaVizBarcodeComparisonVerifier,
    ComparisonCheckResult,
    DocumentType,
    IdCapture,
    IdCaptureOverlay,
    IdCaptureSettings,
    IdDocumentType,
    IdLayoutStyle,
    SupportedSides,
} from 'scandit-react-native-datacapture-id';

import {styles} from './styles';

import {requestCameraPermissionsIfNeeded} from './camera-permission-handler';

export const App = () => {
    const viewRef = useRef(null);
    const isScanningBackside = useRef(false);

    // Create data capture context using your license key.
    const [dataCaptureContext, setDataCaptureContext] = useState(DataCaptureContext.forLicenseKey(
        '-- ENTER YOUR SCANDIT LICENSE KEY HERE --',
    ))
    const [idCaptureMode, setIdCaptureMode] = useState(null);
    const idCaptureRef = useRef(null);
    const [camera, setCamera] = useState(null);
    const [isIdCaptureEnabled, setIsIdCaptureEnabled] = useState(false);
    const [cameraState, setCameraState] = useState(FrameSourceState.Off);

    useEffect(() => {
        handleAppStateChangeSubscription = AppState.addEventListener('change', handleAppStateChange);
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

    const handleAppStateChange = async (nextAppState) => {
        if (!nextAppState.match(/inactive|background/)) {
            startCapture();
        } else {
            stopCapture();
        }
    };

    const startCapture = () => {
        startCamera();
        setIsIdCaptureEnabled(true);
    }

    const stopCapture = () => {
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
            camera.applySettings(cameraSettings);
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
        settings.supportedDocuments = [IdDocumentType.DLVIZ];
        settings.supportedSides = SupportedSides.FrontAndBack;

        // Create new Id capture mode with the settings from above.
        const idCapture = IdCapture.forContext(dataCaptureContext, settings);

        // Register a listener to get informed whenever a new id got recognized.
        const idCaptureListener = {
            didCaptureId: (_, session) => {
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
                        && session.newlyCapturedId.vizResult.isBackSideCaptureSupported
                    ) || isScanningBackside.current === true) {

                    if (!isScanningBackside.current === true) {
                        // Scan the back side of the document.
                        isScanningBackside.current = !isScanningBackside.current;
                        setIsIdCaptureEnabled(true);
                    } else {
                        // Front and back were scanned; perform a verification of the captured ID.
                        AamvaVizBarcodeComparisonVerifier
                            .create()
                            .verify(session.newlyCapturedId)
                            .then(result => {
                                Alert.alert(
                                    'Result',
                                    descriptionForCapturedId(session.newlyCapturedId, result),
                                    [{
                                        text: 'OK',
                                        onPress: () => {
                                            idCaptureRef.current.reset();
                                            isScanningBackside.current = false;
                                            setIsIdCaptureEnabled(true);
                                        }
                                    }], {cancelable: false});
                            })
                    }

                } else {

                    Alert.alert(
                        'Note',
                        'Document is not a US driver’s license.',
                        [{
                            text: 'OK',
                            onPress: () => {
                                idCaptureRef.current.reset();
                                setIsIdCaptureEnabled(true);
                            }
                        }], {cancelable: false});

                }
            }, didFailWithError: (_, error, session) => {
                Alert.alert('Error', error.message, {cancelable: false});
            }
        };

        idCapture.addListener(idCaptureListener);

        // Add a Id capture overlay to the data capture view to render the location of captured ids on top of
        // the video preview. This is optional, but recommended for better visual feedback.
        const overlay = IdCaptureOverlay.withIdCaptureForView(idCapture, null);
        overlay.idLayoutStyle = IdLayoutStyle.Square;

        viewRef.current.addOverlay(overlay);
        setIdCaptureMode(idCapture);
        idCaptureRef.current = idCapture;
    }

    const getDateAsString = (dateObject) => {
        return `${(dateObject && new Date(Date.UTC(
            dateObject.year,
            dateObject.month - 1,
            dateObject.day
        )).toLocaleDateString("en-GB", {timeZone: "UTC"})) || "empty"}`
    }

    const descriptionForCapturedId = (capturedId, verificationResult) => {
        return `
        ${verificationResult.datesOfExpiryMatch.checkResult === ComparisonCheckResult.Passed ? "Document is not expired." : "Document is expired."}
        ${verificationResult.checksPassed ? "Information on front and back match." : "Information on front and back do not match."}

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
        Issuing Country ISO: ${capturedId.issuingCountryISO || "empty"}
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
