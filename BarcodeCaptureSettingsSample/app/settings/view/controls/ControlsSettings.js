import React, {useContext} from 'react';
import {SafeAreaView} from 'react-native';

import {EmptySpaceDivider, SettingsSection, ToggleItem,} from '../../../common';

import BCContext from '../../../data/BCContext';
import {TorchSwitchControl, ZoomSwitchControl} from 'scandit-react-native-datacapture-core';
import { styles } from '../../style';

const torchSwitchControl = new TorchSwitchControl();
const zoomSwitchControl = new ZoomSwitchControl();

export const Controls = () => {
    const appContext = useContext(BCContext);

    const controls = appContext.viewRef.current?.view?.controls;

    const toggleTorchSwitch = (isEnabled) => {
        if (isEnabled) {
            appContext.viewRef.current.addControl(torchSwitchControl);
        } else {
            appContext.viewRef.current.removeControl(torchSwitchControl);
        }
    }

    const toggleZoomSwitch = (isEnabled) => {
        if (isEnabled) {
            appContext.viewRef.current.addControl(zoomSwitchControl);
        } else {
            appContext.viewRef.current.removeControl(zoomSwitchControl);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <EmptySpaceDivider height={25}/>

            <SettingsSection>
                <ToggleItem
                    title={'Torch Button'}
                    isEnabledInitially={controls.includes(torchSwitchControl)}
                    onValueChange={toggleTorchSwitch}
                />
                <ToggleItem
                    title={'Zoom Switch Button'}
                    isEnabledInitially={controls.includes(zoomSwitchControl)}
                    onValueChange={toggleZoomSwitch}
                />
            </SettingsSection>
        </SafeAreaView>
    );
}
