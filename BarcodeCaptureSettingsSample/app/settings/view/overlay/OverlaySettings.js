import React, {useState, useContext} from 'react';
import {SafeAreaView} from 'react-native';

import {
    PickerItem,
    SettingsSection,
    EmptySpaceDivider,
} from '../../../common';

import BCContext from '../../../data/BCContext';
import {Brush, Color} from 'scandit-react-native-datacapture-core';

const availableBrushes = {
    'default': new Brush(),
    'red': new Brush(Color.fromRGBA(255, 0, 0, 0.2), Color.fromRGBA(255, 0, 0, 1), 1),
    'green': new Brush(Color.fromRGBA(0, 255, 0, 0.2), Color.fromRGBA(0, 255, 0, 1), 1)
}

const brushFillColorMapping = {
    'FF000033': 'red',
    '00FF0033': 'green',
}

export const Overlay = () => {
    const appContext = useContext(BCContext);

    const [pickerValue, setPickerValue] = useState(brushFillColorMapping[appContext.overlay.brush.fillColor.toJSON()] || 'default');

    const onValueChange = (pickerValue) => {
        setPickerValue(pickerValue);
        appContext.overlay.brush = availableBrushes[pickerValue];
    }

    return (
        <SafeAreaView>
            <EmptySpaceDivider height={25}/>

            <SettingsSection>
                <PickerItem
                    title={'Brush'}
                    onValueChange={onValueChange}
                    selectedValue={pickerValue}
                    options={[
                        {label: 'Default', value: 'default'},
                        {label: 'Red', value: 'red'},
                        {label: 'Green', value: 'green'},
                    ]}
                />
            </SettingsSection>
        </SafeAreaView>
    );
}
