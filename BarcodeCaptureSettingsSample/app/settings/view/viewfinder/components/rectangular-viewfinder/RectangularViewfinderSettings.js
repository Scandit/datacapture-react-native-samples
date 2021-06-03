import React, {useState, useContext, useEffect} from 'react';
import {View} from 'react-native';

import {
    RectangularViewfinder,
    RectangularViewfinderStyle,
    RectangularViewfinderLineStyle,
    RectangularViewfinderAnimation,
} from 'scandit-react-native-datacapture-core';

import {
    EmptySpaceDivider,
    MeasurementUnits,
    PickerItem,
    SettingsSection,
    ToggleItem,
    ValueInput,
} from '../../../../../common';
import BCContext from '../../../../../data/BCContext';

export const RectangularViewfinderSettings = () => {
    const appContext = useContext(BCContext);

    appContext.viewfinderSettings['rectangularsettings.style'] = appContext.viewfinderSettings['rectangularsettings.style'] || {};
    appContext.viewfinderSettings['rectangularsettings.size'] = appContext.viewfinderSettings['rectangularsettings.size'] || {};

    const [colorSettings, setColorSettings] = useState(appContext.viewfinderSettings['rectangularsettings.color'])
    const [styleSettings, setStyleSettings] = useState(appContext.viewfinderSettings['rectangularsettings.style']['styleName'])
    const [lineStyleSettings, setLineStyleSettings] = useState(appContext.viewfinderSettings['rectangularsettings.style']['lineStyle'])
    const [dimmingSettings, setDimmingSettings] = useState(appContext.viewfinderSettings['rectangularsettings.style']['dimming'] || 0)
    const [animationSettings, setAnimationSettings] = useState(appContext.viewfinderSettings['rectangularsettings.style']['animation'] || false)
    const [loopingSettings, setLoopingSettings] = useState(appContext.viewfinderSettings['rectangularsettings.style']['isLooping'] || false)

    const setDefaultsForStyle = (style) => {
        const styledViewfinder = new RectangularViewfinder(style);
        const isAnimated = styledViewfinder.animation instanceof RectangularViewfinderAnimation;

        onColorValueChange(`#${styledViewfinder.color.hexadecimalString.slice(2).toLowerCase()}`); // ignore transparency information.
        onLineStyleValueChange(styledViewfinder.lineStyle);
        onDimmingInputUpdate(styledViewfinder.dimming);
        toggleAnimationSettings(isAnimated);
        toggleLoopingSettings(isAnimated ? styledViewfinder.animation.isLooping : false); // looping can only be true if there is an animation on the style.
    }

    useEffect(() => {
        // If the style has never been set, load the default parameters for Rectangular viewfinder.
        if (!styleSettings) {
            const defaultViewfinder = new RectangularViewfinder();
            onStyleValueChange(defaultViewfinder.style);
        }
    }, []);

    const setViewfinderStyleValue = (key, value) => {
        appContext.viewfinderSettings['rectangularsettings.style'][key] = value;
    }

    const onColorValueChange = (colorValue) => {
        setColorSettings(colorValue);
        appContext.viewfinderSettings['rectangularsettings.color'] = colorValue;
    }

    const onStyleValueChange = (styleValue) => {
        setStyleSettings(styleValue);
        setDefaultsForStyle(styleValue); // reset all other parameters for the viewfinder if the style changes.
        setViewfinderStyleValue('styleName', styleValue);
    }

    const onLineStyleValueChange = (lineStyleValue) => {
        setLineStyleSettings(lineStyleValue);
        setViewfinderStyleValue('lineStyle', lineStyleValue);
    }

    const onDimmingInputUpdate = (dimmingValue) => {
        setDimmingSettings(dimmingValue);
        setViewfinderStyleValue('dimming', dimmingValue);
    }

    const toggleAnimationSettings = (isAnimationEnabled) => {
        setAnimationSettings(isAnimationEnabled);
        setViewfinderStyleValue('animation', isAnimationEnabled);
    }

    const toggleLoopingSettings = (isLoopingEnabled) => {
        setLoopingSettings(isLoopingEnabled);
        setViewfinderStyleValue('isLooping', isLoopingEnabled);
    }

    const onValueInputUpdate = (itemTitle, value) => {
        appContext.viewfinderSettings['rectangularsettings.size'][itemTitle] = value;
    }

    return (
        <View>
            <EmptySpaceDivider height={25}/>

            <SettingsSection>
                <PickerItem
                    title={'Color'}
                    onValueChange={onColorValueChange}
                    selectedValue={colorSettings}
                    options={[
                        {label: 'Default', value: '#ffffff'},
                        {label: 'Blue (Scandit Blue)', value: '#2ec1ce'},
                        {label: 'Black', value: '#000000'},
                    ]}
                />
            </SettingsSection>

            <EmptySpaceDivider height={25}/>

            <SettingsSection>
                <PickerItem
                    title={'Style'}
                    onValueChange={onStyleValueChange}
                    selectedValue={styleSettings}
                    options={Object.entries(RectangularViewfinderStyle).map(([key, value]) => ({label: key, value}))}
                />
                <PickerItem
                    title={'Line Style'}
                    onValueChange={onLineStyleValueChange}
                    selectedValue={lineStyleSettings}
                    options={Object.entries(RectangularViewfinderLineStyle).map(([key, value]) => ({label: key, value}))}
                />
                <ValueInput
                    title={'Dimming'}
                    defaultValue={dimmingSettings}
                    onValueUpdate={onDimmingInputUpdate}
                />
            </SettingsSection>

            <EmptySpaceDivider height={25}/>

            <SettingsSection>
                <ToggleItem
                    title={'Animation'}
                    isEnabledInitially={animationSettings}
                    onValueChange={toggleAnimationSettings}
                />
                {
                    animationSettings &&
                    <ToggleItem
                        title={'Looping'}
                        isEnabledInitially={loopingSettings}
                        onValueChange={toggleLoopingSettings}
                    />
                }
            </SettingsSection>

            <EmptySpaceDivider height={25}/>

            <SettingsSection>
                <ValueInput
                    title={'Width'}
                    defaultValue={{
                        inputBoxValue: (appContext.viewfinderSettings['rectangularsettings.size']['width'] || {}).inputBoxValue,
                        measurementUnitValue: (appContext.viewfinderSettings['rectangularsettings.size']['width'] || {}).measurementUnitValue,
                    }}
                    measurementUnits={[MeasurementUnits.DIP, MeasurementUnits.Fraction, MeasurementUnits.Pixel]}
                    onValueUpdate={(value) => onValueInputUpdate('width', value)}
                />
                <ValueInput
                    title={'Height'}
                    defaultValue={{
                        inputBoxValue: (appContext.viewfinderSettings['rectangularsettings.size']['height'] || {}).inputBoxValue,
                        measurementUnitValue: (appContext.viewfinderSettings['rectangularsettings.size']['height'] || {}).measurementUnitValue,
                    }}
                    measurementUnits={[MeasurementUnits.DIP, MeasurementUnits.Fraction, MeasurementUnits.Pixel]}
                    onValueUpdate={(value) => onValueInputUpdate('height', value)}
                />
                <ValueInput
                    title={'Height to width aspect ratio'}
                    defaultValue={{
                        inputBoxValue: (appContext.viewfinderSettings['rectangularsettings.size']['Height to width aspect ratio'] || {}).inputBoxValue,
                        measurementUnitValue: (appContext.viewfinderSettings['rectangularsettings.size']['Height to width aspect ratio'] || {}).measurementUnitValue,
                    }}
                    onValueUpdate={(value) => onValueInputUpdate('Height to width aspect ratio', value)}
                />
                <ValueInput
                    title={'Width to height aspect ratio'}
                    defaultValue={{
                        inputBoxValue: (appContext.viewfinderSettings['rectangularsettings.size']['Width to height aspect ratio'] || {}).inputBoxValue,
                        measurementUnitValue: (appContext.viewfinderSettings['rectangularsettings.size']['Width to height aspect ratio'] || {}).measurementUnitValue,
                    }}
                    onValueUpdate={(value) => onValueInputUpdate('Width to height aspect ratio', value)}
                />
            </SettingsSection>
        </View>
    );
}
