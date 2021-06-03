import React, {Component} from 'react';
import {Camera, DataCaptureContext} from 'scandit-react-native-datacapture-core';

import BCContext from './BCContext';
import {licenseKey} from './license';

class BCContextProvider extends Component {
    constructor(props) {
        super(props);
    }

    state = {
        dataCaptureContext: DataCaptureContext.forLicenseKey(licenseKey),
        camera: Camera.default,
        barcodeCaptureMode: null,
        barcodeCaptureSettings: null,
        overlay: null,
        viewRef: React.createRef(),
        isContinuousScanningEnabled: false,
        viewfinderType: 'none',
        viewfinderSettings: {},
    };
    render() {
        return (
            <BCContext.Provider
                value={{
                    dataCaptureContext: this.state.dataCaptureContext,
                    camera: this.state.camera,
                    overlay: this.state.overlay,
                    viewRef: this.state.viewRef,
                    isContinuousScanningEnabled: this.state.isContinuousScanningEnabled,
                    viewfinderType: this.state.viewfinderType,
                    viewfinderSettings: this.state.viewfinderSettings,
                    barcodeCaptureMode: this.state.barcodeCaptureMode,
                    barcodeCaptureSettings: this.state.barcodeCaptureSettings,
                }}
            >
                {this.props.children}
            </BCContext.Provider>
        );
    }
}

export default BCContextProvider;
