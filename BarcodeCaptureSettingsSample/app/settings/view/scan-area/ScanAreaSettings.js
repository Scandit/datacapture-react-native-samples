import React, {useContext} from 'react';
import {SafeAreaView} from 'react-native';

import {
    EmptySpaceDivider,
    MeasurementUnits,
    SettingsSection,
    ToggleItem,
    ValueInput,
} from '../../../common';
import BCContext from '../../../data/BCContext';
import {MarginsWithUnit, NumberWithUnit} from 'scandit-react-native-datacapture-core';

export const ScanArea = () => {
    const appContext = useContext(BCContext);

    const toggleSwitch = (value) => {
        appContext.overlay.shouldShowScanAreaGuides = value;
    }

    const onValueInputUpdate = (item, updatedValues) => {
        const margins = Object.assign({}, appContext.viewRef.current.scanAreaMargins);
        margins[item] = {
            value: parseFloat(updatedValues.inputBoxValue),
            unit: updatedValues.measurementUnitValue,
        }

        appContext.viewRef.current.scanAreaMargins = new MarginsWithUnit(
            new NumberWithUnit(margins._left.value || 0, margins._left.unit),
            new NumberWithUnit(margins._right.value || 0, margins._right.unit),
            new NumberWithUnit(margins._top.value || 0, margins._top.unit),
            new NumberWithUnit(margins._bottom.value || 0, margins._bottom.unit)
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <EmptySpaceDivider height={25}/>

            <SettingsSection title={'Margins'}>
                <ValueInput
                    title={'Top'}
                    defaultValue={{
                        inputBoxValue: appContext.viewRef.current.scanAreaMargins.top.value.toString(),
                        measurementUnitValue: appContext.viewRef.current.scanAreaMargins.top.unit,
                    }}
                    measurementUnits={[MeasurementUnits.DIP, MeasurementUnits.Fraction, MeasurementUnits.Pixel]}
                    onValueUpdate={(value) => onValueInputUpdate('_top', value)}
                />
                <ValueInput
                    title={'Right'}
                    defaultValue={{
                        inputBoxValue: appContext.viewRef.current.scanAreaMargins.right.value.toString(),
                        measurementUnitValue: appContext.viewRef.current.scanAreaMargins.right.unit,
                    }}
                    measurementUnits={[MeasurementUnits.DIP, MeasurementUnits.Fraction, MeasurementUnits.Pixel]}
                    onValueUpdate={(value) => onValueInputUpdate('_right', value)}
                />
                <ValueInput
                    title={'Bottom'}
                    defaultValue={{
                        inputBoxValue: appContext.viewRef.current.scanAreaMargins.bottom.value.toString(),
                        measurementUnitValue: appContext.viewRef.current.scanAreaMargins.bottom.unit,
                    }}
                    measurementUnits={[MeasurementUnits.DIP, MeasurementUnits.Fraction, MeasurementUnits.Pixel]}
                    onValueUpdate={(value) => onValueInputUpdate('_bottom', value)}
                />
                <ValueInput
                    title={'Left'}
                    defaultValue={{
                        inputBoxValue: appContext.viewRef.current.scanAreaMargins.left.value.toString(),
                        measurementUnitValue: appContext.viewRef.current.scanAreaMargins.left.unit,
                    }}
                    measurementUnits={[MeasurementUnits.DIP, MeasurementUnits.Fraction, MeasurementUnits.Pixel]}
                    onValueUpdate={(value) => onValueInputUpdate('_left', value)}
                />
            </SettingsSection>

            <EmptySpaceDivider height={25}/>

            <SettingsSection>
                <ToggleItem
                    title={'Should Show Scan Area Guides'}
                    isEnabledInitially={appContext.overlay.shouldShowScanAreaGuides}
                    onValueChange={toggleSwitch}
                />
            </SettingsSection>
        </SafeAreaView>
    );
}
