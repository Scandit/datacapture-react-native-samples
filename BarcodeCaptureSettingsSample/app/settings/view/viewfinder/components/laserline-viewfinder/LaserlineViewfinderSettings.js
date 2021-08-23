import React, {useState, useContext, useEffect} from 'react';
import {View} from 'react-native';

import {
    MeasurementUnits,
    EmptySpaceDivider,
    SettingsSection,
    PickerItem,
    ValueInput,
} from '../../../../../common';
import BCContext from '../../../../../data/BCContext';

import {
    LaserlineViewfinder,
    LaserlineViewfinderStyle,
} from 'scandit-react-native-datacapture-core';

export const LaserlineViewfinderSettings = () => {
    const appContext = useContext(BCContext);

    appContext.viewfinderSettings['laserlinesettings.style'] = appContext.viewfinderSettings['laserlinesettings.style'] || {};

    const [styleSettings, setStyleSettings] = useState(appContext.viewfinderSettings['laserlinesettings.style']['styleName'])
    const [laserlineEnabledColorSettings, setLvfEnabledColorSettings] = useState(appContext.viewfinderSettings['laserlinesettings.color.enabled'])
    const [laserlineDisabledColorSettings, setLvfDisabledColorSettings] = useState(appContext.viewfinderSettings['laserlinesettings.color.disabled'])

    useEffect(() => {
        // If the style has never been set, load the default parameters for Laserline viewfinder.
        if (!styleSettings) {
            const defaultViewfinder = new LaserlineViewfinder();
            onStyleValueChange(defaultViewfinder.style);
        }
    }, []);

    const setViewfinderStyleValue = (key, value) => {
        appContext.viewfinderSettings['laserlinesettings.style'][key] = value;
    }

    const onStyleValueChange = (styleValue) => {
        setStyleSettings(styleValue);
        setDefaultsForStyle(styleValue); // reset all other parameters for the viewfinder if the style changes.
        setViewfinderStyleValue('styleName', styleValue);
    }

    const setDefaultsForStyle = (style) => {
        const styledViewfinder = new LaserlineViewfinder(style);

        onEnabledColorValueChange(`#${styledViewfinder.enabledColor.hexadecimalString.slice(2).toLowerCase()}`);
        onDisabledColorValueChange(`#${styledViewfinder.disabledColor.hexadecimalString.slice(2).toLowerCase()}`);
    }

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
                    title={'Style'}
                    onValueChange={onStyleValueChange}
                    selectedValue={styleSettings}
                    options={Object.entries(LaserlineViewfinderStyle).map(([key, value]) => ({label: key, value}))}
                />

                <ValueInput
                    title={'Width'}
                    defaultValue={{
                        inputBoxValue: (appContext.viewfinderSettings[`laserlinesettings.size.width`] || {}).inputBoxValue,
                        measurementUnitValue: (appContext.viewfinderSettings[`laserlinesettings.size.width`] || {}).measurementUnitValue,
                    }}
                    measurementUnits={[MeasurementUnits.DIP, MeasurementUnits.Fraction, MeasurementUnits.Pixel]}
                    onValueUpdate={(value) => onValueInputUpdate('width', value)}
                />

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
        </View>
    );
}
