import React, {useContext} from 'react';
import {SafeAreaView} from 'react-native';

import {
    MeasurementUnits,
    EmptySpaceDivider,
    SettingsSection,
    ValueInput,
} from '../../../common';
import BCContext from '../../../data/BCContext';
import {NumberWithUnit, PointWithUnit} from 'scandit-react-native-datacapture-core';

export const PointOfInterest = () => {
    const appContext = useContext(BCContext);

    const onValueInputUpdate = (item, updatedValues) => {
        const poi = Object.assign({}, appContext.viewRef.current.pointOfInterest);
        poi[item] = {
            value: parseFloat(updatedValues.inputBoxValue),
            unit: updatedValues.measurementUnitValue,
        }

        appContext.viewRef.current.pointOfInterest = new PointWithUnit(
            new NumberWithUnit(poi._x.value || 0, poi._x.unit),
            new NumberWithUnit(poi._y.value || 0, poi._y.unit),
        );
    }

    return (
        <SafeAreaView>
            <EmptySpaceDivider height={25}/>

            <SettingsSection>
                <ValueInput
                    title={'X'}
                    defaultValue={{
                        inputBoxValue: appContext.viewRef.current.pointOfInterest.x.value.toString(),
                        measurementUnitValue: appContext.viewRef.current.pointOfInterest.x.unit,
                    }}
                    measurementUnits={[MeasurementUnits.DIP, MeasurementUnits.Fraction, MeasurementUnits.Pixel]}
                    onValueUpdate={(value) => onValueInputUpdate('_x', value)}
                />
                <ValueInput
                    title={'Y'}
                    defaultValue={{
                        inputBoxValue: appContext.viewRef.current.pointOfInterest.y.value.toString(),
                        measurementUnitValue: appContext.viewRef.current.pointOfInterest.y.unit,
                    }}
                    measurementUnits={[MeasurementUnits.DIP, MeasurementUnits.Fraction, MeasurementUnits.Pixel]}
                    onValueUpdate={(value) => onValueInputUpdate('_y', value)}
                />
            </SettingsSection>
        </SafeAreaView>
    );
}
