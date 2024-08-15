import React, {Component, useState} from 'react';
import {Alert, AppState, BackHandler, View} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import {
    BarcodeCapture,
    BarcodeCaptureOverlay,
    BarcodeCaptureOverlayStyle,
    BarcodeCaptureSettings,
    BarcodeCaptureFeedback,
    SymbologyDescription,
    CompositeFlag,
} from 'scandit-react-native-datacapture-barcode';
import {
    CameraSettings,
    DataCaptureView,
    Feedback,
    Sound,
    Vibration,
    FrameSourceState,
    VideoResolution,
} from 'scandit-react-native-datacapture-core';

import BCContext from './data/BCContext';

import {requestCameraPermissionsIfNeeded} from './camera-permission-handler';

function FocusComponent({ currentFocusState, handleFocusChange }) {
    const [oldFocustState, setOldFocusState] = useState(true);

    if (oldFocustState !== currentFocusState) {
        setOldFocusState(currentFocusState);
        handleFocusChange(currentFocusState);
    }

    return null;
}

export default function(props) {
    const isFocused = useIsFocused();

    return <ScanPage {...props} isFocused={isFocused} />;
}

class ScanPage extends Component {

    constructor(props) {
        super(props);

        this.startCapture = this.startCapture.bind(this);
        this.stopCapture = this.stopCapture.bind(this);
        this.onFocusChange = this.onFocusChange.bind(this);
    }

    componentDidMount() {
        this.handleAppStateChangeSubscription = AppState.addEventListener('change', this.handleAppStateChange);
        this.setupScanningWithSettings = this.setupScanningWithSettings.bind(this);
        this._unsubscribe = this.props.navigation.addListener('focus', this.setupScanningWithSettings);
        this.startCapture();
    }

    componentWillUnmount() {
        this.handleAppStateChangeSubscription.remove();
        this.stopCapture();
        this.context.dataCaptureContext.dispose();
        this._unsubscribe();
    }

    setupScanningWithSettings() {
        this.setupScanning();
    }

    handleAppStateChange = async (nextAppState) => {
        if (nextAppState.match(/inactive|background/)) {
            this.stopCapture();
        } else {
            this.startCapture();
        }
    }

    startCapture() {
        this.startCamera();
        if ( this.context.barcodeCaptureMode){
            this.context.barcodeCaptureMode.isEnabled = true;
        }
    }

    stopCapture() {
        this.context.barcodeCaptureMode.isEnabled = false;
        this.stopCamera();
    }

    stopCamera() {
        if (this.context.camera) {
            this.context.camera.switchToDesiredState(FrameSourceState.Off);
        }
    }

    startCamera() {
        // Use the world-facing (back) camera and set it as the frame source of the context. The camera is off by
        // default and must be turned on to start streaming frames to the data capture context for recognition.
        this.context.dataCaptureContext.setFrameSource(this.context.camera);

        if (!this.context.camera.settings) {
            const cameraSettings = new CameraSettings();
            cameraSettings.preferredResolution = VideoResolution.FullHD;
            this.context.camera.applySettings(cameraSettings);
        }

        // Switch camera on to start streaming frames and enable the barcode capture mode.
        // The camera is started asynchronously and will take some time to completely turn on.
        requestCameraPermissionsIfNeeded()
            .then(() => this.context.camera.switchToDesiredState(FrameSourceState.On))
            .catch(() => BackHandler.exitApp());
    }

    setupScanning() {
        const barcodeCaptureListener = {
            didScan: (_, session) => {
                const barcode = session.newlyRecognizedBarcode;
                if (barcode == null) return;
                
                const symbology = new SymbologyDescription(barcode.symbology);

                // The `alert` call blocks execution until it's dismissed by the user. As no further frames would be processed
                // until the alert dialog is dismissed, we're showing the alert through a timeout and disabling the barcode
                // capture mode until the dialog is dismissed, as you should not block the BarcodeCaptureListener callbacks for
                // longer periods of time. See the documentation to learn more about this.
                this.context.barcodeCaptureMode.isEnabled = false;

                let alertText = `Scanned: ${barcode.data} (${symbology.readableName})`;

                // Show data scanned for Composite Codes.
                if (barcode.compositeFlag && barcode.compositeFlag !== CompositeFlag.Unknown) {
                    let compositeCodeType = '';

                    switch (barcode.compositeFlag) {
                        case CompositeFlag.GS1TypeA:
                            compositeCodeType = "CC Type A";
                            break;
                        case CompositeFlag.GS1TypeB:
                            compositeCodeType = "CC Type B";
                            break;
                        case CompositeFlag.GS1TypeC:
                            compositeCodeType = "CC Type C";
                            break;
                        default:
                            break;
                    }

                    alertText = `${compositeCodeType}\n${symbology.readableName}:\n${barcode.data}\n${barcode.compositeData}\nSymbol Count: ${barcode.symbolCount}`;
                }

                // Show data scanned for Add-on Codes.
                if (barcode.addOnData) {
                    alertText = `${symbology.readableName}:\n${barcode.data} ${barcode.addOnData}\nSymbol Count: ${barcode.symbolCount}`;
                }

                Alert.alert(
                    'Scan Results',
                    alertText,
                    [{ text: 'OK', onPress: () => this.context.barcodeCaptureMode.isEnabled = true }],
                    { cancelable: false }
                );
            }
        }

        // The barcode capturing process is configured through barcode capture settings
        // and are then applied to the barcode capture instance that manages barcode recognition.
        if (!this.context.barcodeCaptureSettings) {
            this.context.barcodeCaptureSettings = new BarcodeCaptureSettings();
        }

        // Create new barcode capture mode with the settings from above.
        if (!this.context.barcodeCaptureMode) {
            this.context.barcodeCaptureMode = BarcodeCapture.forContext(this.context.dataCaptureContext, this.context.barcodeCaptureSettings);

            const barcodeCaptureFeedback = new BarcodeCaptureFeedback();
            barcodeCaptureFeedback.success = new Feedback(Vibration.defaultVibration, Sound.defaultSound);

            this.context.barcodeCaptureMode.feedback = barcodeCaptureFeedback;

            this.context.barcodeCaptureMode.addListener(barcodeCaptureListener);
        } else {
            this.context.barcodeCaptureMode.listeners.forEach(listener => this.context.barcodeCaptureMode.removeListener(listener));

            if (!this.context.isContinuousScanningEnabled) {
                this.context.barcodeCaptureMode.addListener(barcodeCaptureListener);
            }

            this.context.barcodeCaptureMode.applySettings(this.context.barcodeCaptureSettings);
        }

        // Add a barcode capture overlay to the data capture view to render the location of captured barcodes on top of
        // the video preview. This is optional, but recommended for better visual feedback.
        if (!this.context.overlay) {
            this.context.overlay = BarcodeCaptureOverlay.withBarcodeCaptureForViewWithStyle(
                this.context.barcodeCaptureMode,
                this.context.viewRef.current,
                BarcodeCaptureOverlayStyle.Frame,
            );
        }
    }

    onFocusChange(focusValue) {
        if (focusValue === true) {
            this.startCapture();
        } else {
            this.stopCapture();
        }
    }

    render() {
        const { isFocused } = this.props;

        return (
            <View style={{flex: 1}}>
                <FocusComponent currentFocusState={isFocused} handleFocusChange={this.onFocusChange}/>
                <DataCaptureView style={{flex: 1, zIndex: 2}} context={this.context.dataCaptureContext} ref={this.context.viewRef}/>
            </View>
        );
    }
}

ScanPage.contextType = BCContext;
