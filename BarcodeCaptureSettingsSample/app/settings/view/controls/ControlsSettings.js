import React, {useContext} from 'react';
import {SafeAreaView} from 'react-native';

import {EmptySpaceDivider, SettingsSection, ToggleItem,} from '../../../common';

import BCContext from '../../../data/BCContext';
import {TorchSwitchControl} from 'scandit-react-native-datacapture-core';

const control = new TorchSwitchControl();

export const Controls = () => {
    const appContext = useContext(BCContext);

    const controls = appContext.viewRef.current?.view?.controls;

    const toggleSwitch = (isEnabled) => {
        if (isEnabled) {
            appContext.viewRef.current.addControl(control);
        } else {
            appContext.viewRef.current.removeControl(control);
        }
    }

    return (
        <SafeAreaView>
            <EmptySpaceDivider height={25}/>

            <SettingsSection>
                <ToggleItem
                    title={'Torch Button'}
                    isEnabledInitially={controls.includes(control)}
                    onValueChange={toggleSwitch}
                />
            </SettingsSection>
        </SafeAreaView>
    );
}
