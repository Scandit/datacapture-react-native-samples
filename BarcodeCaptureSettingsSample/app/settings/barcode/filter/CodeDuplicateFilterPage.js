import React, {useContext} from 'react';
import {SafeAreaView, ScrollView} from 'react-native';

import {
    EmptySpaceDivider,
    SettingsSection,
    ValueInput,
} from '../../../common';
import BCContext from '../../../data/BCContext';


export const CodeDuplicateFilterPage = () => {
    const appContext = useContext(BCContext);

    const savedFilterValueInSeconds = {
        inputBoxValue: (appContext.barcodeCaptureSettings.codeDuplicateFilter || 0 / 1000).toString()
    }

    const updateCodeDuplicateFilterValue = (valueInSeconds) => {
        // The value needs to be provided in milliseconds, while the input accepts seconds for ease of usage.
        appContext.barcodeCaptureSettings.codeDuplicateFilter = valueInSeconds * 1000;
    }

    return (
        <SafeAreaView style={styles.container}>
            <EmptySpaceDivider height={25}/>

            <ScrollView>
                <SettingsSection>
                    <ValueInput
                        title={'Code Duplicate Filter (s)'}
                        defaultValue={savedFilterValueInSeconds}
                        onValueUpdate={value => updateCodeDuplicateFilterValue(parseInt(value.inputBoxValue))}
                    />
                </SettingsSection>
            </ScrollView>
        </SafeAreaView>
    );
}
