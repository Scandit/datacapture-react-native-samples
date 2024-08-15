import React, {useContext, useState, useEffect} from 'react';
import {SafeAreaView, ScrollView} from 'react-native';

import {
    SizeWithUnit,
    MeasureUnit,
    NumberWithUnit,
    RadiusLocationSelection,
    RectangularLocationSelection,
    SizeWithAspect,
} from 'scandit-react-native-datacapture-core';

import {
    EmptySpaceDivider, MeasurementUnits, PickerItem,
    RadioList,
    SettingsSection, ValueInput,
} from '../../../common';

import { styles } from '../../style';
import BCContext from '../../../data/BCContext';

const locations = ['None', 'Radius', 'Rectangular'];
const sizeSpecificationsForRectangular = ['Width and Height', 'Width and Height Aspect', 'Height and Width Aspect'];

const getCurrentSizeSpecification = (size) => {
    const selectedSize = Object
        .entries(size)
        .filter(([key, value]) => value !== null)
        .map(([key, value]) => ({key, value}))
        .reduce((acc, curr) => {
            acc = curr;
            return acc;
        }, {});

    if (!selectedSize) return sizeSpecificationsForRectangular[0];

    if (selectedSize.value instanceof SizeWithUnit) {
        // Width and height
        return sizeSpecificationsForRectangular[0];
    } else if (selectedSize.value instanceof SizeWithAspect) {
        if (selectedSize.key.includes('_width')) {
            // Width and aspect ratio.
            return sizeSpecificationsForRectangular[1];
        } else {
            // Height and aspect ratio.
            return sizeSpecificationsForRectangular[2];
        }
    } else {
        // Nothing is selected.
        return sizeSpecificationsForRectangular[0];
    }
}

export const LocationSelectionPage = ({navigation}) => {
    const appContext = useContext(BCContext);

    const locationSettings = appContext.barcodeCaptureSettings.locationSelection || {type: 'none'};

    const [selectedLocation, setSelectedLocation] = useState(locationSettings.type);
    const [selectedRectangularSizeSpecification, setSelectedRectangularSizeSpecification] = useState(
        getCurrentSizeSpecification(locationSettings._sizeWithUnitAndAspect || {})
    );

    // Rectangular location size state
    const [rectangularWidth, setRectangularWidth] = useState({
        inputBoxValue: locationSettings._sizeWithUnitAndAspect?.toJSON()?.width?.value?.toString(),
        measurementUnitValue: locationSettings._sizeWithUnitAndAspect?.toJSON()?.width?.unit?.toString() || MeasureUnit.DIP
    });
    const [rectangularHeight, setRectangularHeight] = useState({
        inputBoxValue: locationSettings._sizeWithUnitAndAspect?.toJSON()?.height?.value?.toString(),
        measurementUnitValue: locationSettings._sizeWithUnitAndAspect?.toJSON()?.height?.unit?.toString() || MeasureUnit.DIP
    });
    const [rectangularWidthAspect, setRectangularWidthAspect] = useState({
        inputBoxValue: locationSettings._sizeWithUnitAndAspect?.toJSON()?.aspect?.toString()
    });
    const [rectangularHeightAspect, setRectangularHeightAspect] = useState({
        inputBoxValue: locationSettings._sizeWithUnitAndAspect?.toJSON()?.aspect?.toString()
    });

    useEffect(() => {
        if (selectedLocation === locations[0].toLowerCase()) {
            // 'None' was selected
            appContext.barcodeCaptureSettings.locationSelection = null;
        } else if (selectedLocation === locations[1].toLowerCase()) {
            appContext.barcodeCaptureSettings.locationSelection = new RadiusLocationSelection(
                new NumberWithUnit(0, MeasurementUnits.DIP)
            );
        } else if (selectedLocation === locations[2].toLowerCase()) {
            const size = new SizeWithUnit(
                new NumberWithUnit(0, MeasurementUnits.DIP),
                new NumberWithUnit(0, MeasurementUnits.DIP)
            )
            appContext.barcodeCaptureSettings.locationSelection = RectangularLocationSelection.withSize(size);
        }
    }, [selectedLocation])

    useEffect(() => {
        if (selectedRectangularSizeSpecification === sizeSpecificationsForRectangular[0]) {
            // Width and Height specification
            const size = new SizeWithUnit(
                new NumberWithUnit(parseFloat(rectangularWidth.inputBoxValue), rectangularWidth.measurementUnitValue),
                new NumberWithUnit(parseFloat(rectangularHeight.inputBoxValue), rectangularHeight.measurementUnitValue)
            )
            appContext.barcodeCaptureSettings.locationSelection = RectangularLocationSelection.withSize(size);
        }

        if (selectedRectangularSizeSpecification === sizeSpecificationsForRectangular[1]) {
            // Width and Height Aspect specification
            const width = new NumberWithUnit(parseFloat(rectangularWidth.inputBoxValue), rectangularWidth.measurementUnitValue);
            appContext.barcodeCaptureSettings.locationSelection = RectangularLocationSelection.withWidthAndAspectRatio(width, parseFloat(rectangularHeightAspect.inputBoxValue));
        }

        if (selectedRectangularSizeSpecification === sizeSpecificationsForRectangular[2]) {
            // Height and Width Aspect specification
            const height = new NumberWithUnit(parseFloat(rectangularHeight.inputBoxValue), rectangularHeight.measurementUnitValue);
            appContext.barcodeCaptureSettings.locationSelection = RectangularLocationSelection.withHeightAndAspectRatio(height, parseFloat(rectangularWidthAspect.inputBoxValue));
        }
    }, [
        selectedRectangularSizeSpecification,
        rectangularWidth,
        rectangularHeight,
        rectangularWidthAspect,
        rectangularHeightAspect
    ]);

    const onRadiusValueUpdate = (value) => {
        appContext.barcodeCaptureSettings.locationSelection = new RadiusLocationSelection(
            new NumberWithUnit(parseFloat(value.inputBoxValue), value.measurementUnitValue)
        );
    }

    const renderRadiusSizeSpecification = () => (
        <SettingsSection title={'Radius'}>
            <ValueInput
                title={'Size'}
                defaultValue={{
                    inputBoxValue: locationSettings.radius?.value?.toString(),
                    measurementUnitValue: locationSettings.radius?.unit || MeasurementUnits.DIP,
                }}
                measurementUnits={[MeasurementUnits.DIP, MeasurementUnits.Fraction, MeasurementUnits.Pixel]}
                onValueUpdate={(value) => onRadiusValueUpdate(value)}
            />
        </SettingsSection>
    )

    const renderRectangularSizeSpecification = () => (
        <SettingsSection title={'Rectangular'}>
            {
                selectedRectangularSizeSpecification !== sizeSpecificationsForRectangular[2] &&
                <ValueInput
                    title={'Width'}
                    defaultValue={{
                        inputBoxValue: (locationSettings._sizeWithUnitAndAspect?.toJSON()?.width?.value || '').toString(),
                        measurementUnitValue: locationSettings._sizeWithUnitAndAspect?.toJSON()?.width?.unit || MeasurementUnits.DIP,
                    }}
                    measurementUnits={[MeasurementUnits.DIP, MeasurementUnits.Fraction, MeasurementUnits.Pixel]}
                    onValueUpdate={value => setRectangularWidth(value)}
                />
            }
            {
                selectedRectangularSizeSpecification !== sizeSpecificationsForRectangular[1] &&
                <ValueInput
                    title={'Height'}
                    defaultValue={{
                        inputBoxValue: (locationSettings._sizeWithUnitAndAspect?.toJSON()?.height?.value || '').toString(),
                        measurementUnitValue: locationSettings._sizeWithUnitAndAspect?.toJSON()?.height?.unit || MeasurementUnits.DIP,
                    }}
                    measurementUnits={[MeasurementUnits.DIP, MeasurementUnits.Fraction, MeasurementUnits.Pixel]}
                    onValueUpdate={value => setRectangularHeight(value)}
                />
            }
            {
                selectedRectangularSizeSpecification === sizeSpecificationsForRectangular[1] &&
                <ValueInput
                    title={'Height Aspect'}
                    defaultValue={{
                        inputBoxValue: (locationSettings._sizeWithUnitAndAspect?.toJSON()?.aspect || '').toString(),
                        measurementUnitValue: '',
                    }}
                    measurementUnits={[]}
                    onValueUpdate={value => setRectangularHeightAspect(value)}
                />
            }
            {
                selectedRectangularSizeSpecification === sizeSpecificationsForRectangular[2] &&
                <ValueInput
                    title={'Width Aspect'}
                    defaultValue={{
                        inputBoxValue: (locationSettings._sizeWithUnitAndAspect?.toJSON()?.aspect || '').toString(),
                        measurementUnitValue: '',
                    }}
                    measurementUnits={[]}
                    onValueUpdate={value => setRectangularWidthAspect(value)}
                />
            }
        </SettingsSection>
    )

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <EmptySpaceDivider height={25}/>

                <SettingsSection>
                    <RadioList
                        items={locations.map(location => ({label: location, value: location.toLowerCase()}))}
                        initialSelectedValue={selectedLocation}
                        onSelectedValue={location => setSelectedLocation(location)}
                    />
                </SettingsSection>

                <EmptySpaceDivider height={25}/>

                {
                    selectedLocation === 'radius' && renderRadiusSizeSpecification()
                }
                {
                    selectedLocation === 'rectangular' &&
                    <SettingsSection>
                        <PickerItem
                            title={'Size Specification'}
                            options={sizeSpecificationsForRectangular.map(item => ({label: item, value: item}))}
                            selectedValue={selectedRectangularSizeSpecification}
                            onValueChange={value => setSelectedRectangularSizeSpecification(value)}
                        />
                    </SettingsSection>
                }
                {
                    selectedLocation === 'rectangular' && <EmptySpaceDivider height={25}/>
                }
                {
                    selectedLocation === 'rectangular' && renderRectangularSizeSpecification()
                }
            </ScrollView>
        </SafeAreaView>
    );
}
