import React, {useContext} from 'react';
import {SafeAreaView} from 'react-native';

import {
    EmptySpaceDivider,
    SettingsSection,
    ToggleItem,
} from '../../common';
import BCContext from '../../data/BCContext';

export const Result = () => {
    const appContext = useContext(BCContext);

    const toggleSwitch = (isEnabled) => {
        appContext.isContinuousScanningEnabled = isEnabled;
    }

    return (
        <SafeAreaView>
            <EmptySpaceDivider height={25}/>

            <SettingsSection>
                <ToggleItem
                    title={'Continuous Scanning'}
                    isEnabledInitially={appContext.isContinuousScanningEnabled}
                    onValueChange={toggleSwitch}
                />
            </SettingsSection>
        </SafeAreaView>
    );
}
