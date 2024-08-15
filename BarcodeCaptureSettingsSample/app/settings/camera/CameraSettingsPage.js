import React, {useContext} from 'react';
import {
    Platform,
    SafeAreaView,
    ScrollView,
} from 'react-native';

import BCContext from '../../data/BCContext';

import {
    VideoResolution,
    FocusGestureStrategy,
    Camera,
    CameraPosition,
    CameraSettings,
    TorchState,
} from 'scandit-react-native-datacapture-core';

import {
    EmptySpaceDivider,
    SettingsSection,
    RadioList,
    PickerItem,
    ToggleItem,
    SliderItem,
} from '../../common';

import { styles } from '../style';

export const CameraSettingsPage = () => {
    const appContext = useContext(BCContext);

    const onRadioItemClick = (position) => {
        appContext.camera = Camera.atPosition(position);

        const cameraSettings = appContext.camera.settings || new CameraSettings();
        cameraSettings.preferredResolution = VideoResolution.FullHD;
        appContext.camera.applySettings(cameraSettings);

        appContext.dataCaptureContext.setFrameSource(appContext.camera);
    }

    const onToggleDesiredTorchState = (isEnabled) => {
        let torchState = TorchState.Off;
        if (isEnabled) {
            torchState = TorchState.On;
        }
        appContext.camera.desiredTorchState = torchState;
    }

    const onZoomFactorValueChange = (value) => {
        const cameraSettings = appContext.camera.settings || new CameraSettings();
        cameraSettings.zoomFactor = parseInt(value);
        appContext.camera.applySettings(cameraSettings);
    }

    const onGestureFactorValueChange = (value) => {
        const cameraSettings = appContext.camera.settings || new CameraSettings();
        cameraSettings.zoomGestureZoomFactor = parseInt(value);
        appContext.camera.applySettings(cameraSettings);
    }

    const onResolutionValueChange = (resolution) => {
        const cameraSettings = appContext.camera.settings || new CameraSettings();
        cameraSettings.preferredResolution = resolution;
        appContext.camera.applySettings(cameraSettings);
    }

    const onGestureValueChange = (gesture) => {
        const cameraSettings = appContext.camera.settings || new CameraSettings();
        cameraSettings.focusGestureStrategy = gesture;
        appContext.camera.applySettings(cameraSettings);
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <EmptySpaceDivider height={25}/>

                <RadioList
                    selectedIcon={'checkmark-outline'}
                    initialSelectedValue={appContext.camera.position}
                    onSelectedValue={onRadioItemClick}
                    items={Object.entries(CameraPosition).filter(([key, value]) => value !== CameraPosition.Unspecified).map(([key, value]) => ({label: key, value}))}
                />

                <EmptySpaceDivider height={25}/>

                <SettingsSection>
                    <ToggleItem
                        title={'Desired Torch State'}
                        isEnabledInitially={appContext.camera.desiredTorchState === TorchState.On}
                        onValueChange={onToggleDesiredTorchState}
                    />
                </SettingsSection>

                <EmptySpaceDivider height={25}/>

                <SettingsSection title={'Camera Settings'}>
                    <PickerItem
                        title={'Preferred Resolution'}
                        onValueChange={onResolutionValueChange}
                        selectedValue={appContext.camera.settings.preferredResolution}
                        options={Platform.OS == 'android'
                            ? Object.entries(VideoResolution)
                                .filter(([_, value]) => value !== VideoResolution.UHD4K)
                                .map(([key, value]) => ({label: key, value}))
                            : Object.entries(VideoResolution)
                                .map(([key, value]) => ({label: key, value}))}
                    />

                    <EmptySpaceDivider height={20} bgColor={'#fff'}/>

                    <SliderItem
                        title={'Zoom Factor'}
                        minValue={1}
                        maxValue={20}
                        step={1}
                        initialSliderValue={appContext.camera.settings.zoomFactor}
                        onValueChange={onZoomFactorValueChange}
                    />

                    <EmptySpaceDivider height={20} bgColor={'#fff'}/>

                    <SliderItem
                        title={'Zoom Gesture Zoom Factor'}
                        minValue={1}
                        maxValue={20}
                        step={1}
                        initialSliderValue={appContext.camera.settings.zoomGestureZoomFactor}
                        onValueChange={onGestureFactorValueChange}
                    />
                    <EmptySpaceDivider height={20} bgColor={'#fff'}/>

                    <PickerItem
                        title={'Focus Gesture Strategy'}
                        onValueChange={onGestureValueChange}
                        selectedValue={appContext.camera.settings.focusGestureStrategy}
                        options={Object.entries(FocusGestureStrategy).map(([key, value]) => ({label: key, value}))}
                    />
                </SettingsSection>
            </ScrollView>
        </SafeAreaView>
    );
}
