import React, {useState, useContext} from 'react';
import {View} from 'react-native';

import {
    MeasurementUnits,
    EmptySpaceDivider,
    SettingsSection,
    PickerItem,
    ValueInput,
} from '../../../../../common';
import BCContext from '../../../../../data/BCContext';

export const LaserlineViewfinderSettings = () => {
    const appContext = useContext(BCContext);

    const [laserlineEnabledColorSettings, setLvfEnabledColorSettings] = useState(appContext.viewfinderSettings['laserlinesettings.color.enabled'])
    const [laserlineDisabledColorSettings, setLvfDisabledColorSettings] = useState(appContext.viewfinderSettings['laserlinesettings.color.disabled'])

    const onEnabledColorValueChange = (colorValue) => {
        setLvfEnabledColorSettings(colorValue);
        appContext.viewfinderSettings['laserlinesettings.color.enabled'] = colorValue;
    }

    const onDisabledColorValueChange = (colorValue) => {
        setLvfDisabledColorSettings(colorValue);
        appContext.viewfinderSettings['laserlinesettings.color.disabled'] = colorValue;
    }

    const onValueInputUpdate = (itemTitle, value) => appContext.viewfinderSettings[`laserlinesettings.size.${itemTitle}`] = value

    return (
        <View>
            <EmptySpaceDivider height={25}/>

            <SettingsSection>
                <PickerItem
                    title={'Enabled Color'}
                    onValueChange={onEnabledColorValueChange}
                    selectedValue={laserlineEnabledColorSettings}
                    options={[
                        {label: 'Default', value: '#000000'},
                        {label: 'Red', value: '#ff0000'},
                        {label: 'White', value: '#ffffff'},
                    ]}
                />
            </SettingsSection>

            <EmptySpaceDivider height={25}/>

            <SettingsSection>
                <PickerItem
                    title={'Disabled Color'}
                    onValueChange={onDisabledColorValueChange}
                    selectedValue={laserlineDisabledColorSettings}
                    options={[
                        {label: 'Default', value: '#ffffff'},
                        {label: 'Blue (Scandit Blue)', value: '#2ec1ce'},
                        {label: 'Red', value: '#ff0000'},
                    ]}
                />
            </SettingsSection>

            <EmptySpaceDivider height={25}/>

            <SettingsSection>
                <ValueInput
                    title={'Width'}
                    defaultValue={{
                        inputBoxValue: (appContext.viewfinderSettings[`laserlinesettings.size.width`] || {}).inputBoxValue,
                        measurementUnitValue: (appContext.viewfinderSettings[`laserlinesettings.size.width`] || {}).measurementUnitValue,
                    }}
                    measurementUnits={[MeasurementUnits.DIP, MeasurementUnits.Fraction, MeasurementUnits.Pixel]}
                    onValueUpdate={(value) => onValueInputUpdate('width', value)}
                />
            </SettingsSection>
        </View>
    );
}
