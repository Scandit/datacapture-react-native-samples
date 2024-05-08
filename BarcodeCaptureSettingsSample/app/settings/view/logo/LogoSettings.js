import React, {useState, useContext} from 'react';
import {SafeAreaView} from 'react-native';

import {
    Anchor,
    NumberWithUnit,
    PointWithUnit,
} from 'scandit-react-native-datacapture-core';

import {
    MeasurementUnits,
    ValueInput,
    PickerItem,
    SettingsSection,
    EmptySpaceDivider,
} from '../../../common';
import BCContext from '../../../data/BCContext';

export const Logo = () => {
    const appContext = useContext(BCContext);

    const [pickerValue, setPickerValue] = useState(appContext.viewRef.current.logoAnchor)

    const onValueChange = (anchorValue) => {
        setPickerValue(anchorValue);
        appContext.viewRef.current.logoAnchor = anchorValue;
    }

    const onValueInputUpdate = (item, updatedValues) => {
        const offset = Object.assign({}, appContext.viewRef.current.logoOffset);
        offset[item] = {
            value: parseFloat(updatedValues.inputBoxValue),
            unit: updatedValues.measurementUnitValue,
        }

        appContext.viewRef.current.logoOffset = new PointWithUnit(
            new NumberWithUnit(offset._x.value, offset._x.unit),
            new NumberWithUnit(offset._y.value, offset._y.unit)
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <EmptySpaceDivider height={25}/>

            <SettingsSection>
                <PickerItem
                    title={'Anchor'}
                    onValueChange={onValueChange}
                    selectedValue={pickerValue}
                    options={Object.entries(Anchor).map(([key, value]) => ({label: key, value}))}
                />
            </SettingsSection>

            <EmptySpaceDivider height={25}/>

            <SettingsSection title={'Offset'}>
                <ValueInput
                    title={'X'}
                    defaultValue={{
                        inputBoxValue: appContext.viewRef.current.logoOffset.x.value.toString(),
                        measurementUnitValue: appContext.viewRef.current.logoOffset.x.unit,
                    }}
                    measurementUnits={[MeasurementUnits.DIP, MeasurementUnits.Fraction, MeasurementUnits.Pixel]}
                    onValueUpdate={(value) => onValueInputUpdate('_x', value)}
                />
                <ValueInput
                    title={'Y'}
                    defaultValue={{
                        inputBoxValue: appContext.viewRef.current.logoOffset.y.value.toString(),
                        measurementUnitValue: appContext.viewRef.current.logoOffset.y.unit,
                    }}
                    measurementUnits={[MeasurementUnits.DIP, MeasurementUnits.Fraction, MeasurementUnits.Pixel]}
                    onValueUpdate={(value) => onValueInputUpdate('_y', value)}
                />
            </SettingsSection>
        </SafeAreaView>
    );
}
