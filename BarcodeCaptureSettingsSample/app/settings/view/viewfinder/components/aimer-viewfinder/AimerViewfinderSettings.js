import React, {useState, useContext} from 'react';
import {View} from 'react-native';

import {
    EmptySpaceDivider,
    SettingsSection,
    PickerItem,
} from '../../../../../common';
import BCContext from '../../../../../data/BCContext';

export const AimerViewfinderSettings = () => {
    const appContext = useContext(BCContext);

    const [aimerFrameColorSettings, setAvfFrameColorSettings] = useState(appContext.viewfinderSettings['aimersettings.color.frame'])
    const [aimerDotColorSettings, setAvfDotColorSettings] = useState(appContext.viewfinderSettings['aimersettings.color.dot'])

    const onFrameColorValueChange = (colorValue) => {
        setAvfFrameColorSettings(colorValue);
        appContext.viewfinderSettings['aimersettings.color.frame'] = colorValue;
    }

    const onDotColorValueChange = (colorValue) => {
        setAvfDotColorSettings(colorValue);
        appContext.viewfinderSettings['aimersettings.color.dot'] = colorValue;
    }

    return (
        <View>
            <EmptySpaceDivider height={25}/>

            <SettingsSection>
                <PickerItem
                    title={'Frame Color'}
                    onValueChange={onFrameColorValueChange}
                    selectedValue={aimerFrameColorSettings}
                    options={[
                        {label: 'Default', value: '#ffffff'},
                        {label: 'Blue (Scandit Blue)', value: '#2ec1ce'},
                        {label: 'Red', value: '#ff0000'},
                    ]}
                />
            </SettingsSection>

            <EmptySpaceDivider height={25}/>

            <SettingsSection>
                <PickerItem
                    title={'Dot Color'}
                    onValueChange={onDotColorValueChange}
                    selectedValue={aimerDotColorSettings}
                    options={[
                        {label: 'Default', value: '#ffffff'},
                        {label: 'Blue (Scandit Blue)', value: '#2ec1ce'},
                        {label: 'Red', value: '#ff0000'},
                    ]}
                />
            </SettingsSection>
        </View>
    );
}
