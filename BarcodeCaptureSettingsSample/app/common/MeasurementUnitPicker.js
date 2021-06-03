import React, {useRef, useState} from 'react';
import {Platform, TouchableOpacity, Text, View} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {MeasureUnit} from 'scandit-react-native-datacapture-core';
import ActionSheet from 'react-native-actions-sheet';
import {RadioList} from './RadioList';
import {styles} from '../settings/style';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export const MeasurementUnits = MeasureUnit;

export const MeasurementUnitPicker = ({measurementUnits = [], defaultValue, onChange}) => {

    const insets = useSafeAreaInsets();
    const actionSheetRef = useRef(null);

    const [selectedValue, setSelectedValue] = useState(defaultValue);
    const [actionSheetButtonTitle, setActionSheetButtonTitle] = useState(selectedValue.toUpperCase() || MeasurementUnits.DIP.toUpperCase());

    const onValueChange = (value) => {
        setSelectedValue(value);
        onChange(value);
    }

    const openActionSheet = () => {
        actionSheetRef.current.setModalVisible();
    }

    const handleSelectedValue = (selection) => {
        actionSheetRef.current.setModalVisible(false);
        onValueChange(selection);
        setActionSheetButtonTitle(selection.toUpperCase());
    }

    const computeEnumValue = (stringUnitValue = '') => {
        return Object
            .entries(MeasurementUnits)
            .filter(([key, value]) => key.toLowerCase() === stringUnitValue.toLowerCase())
            .reduce((acc, curr) => {
                const [key, value] = curr;
                return value;
            }, -1)
    }

    return (
        <>
            {
                Platform.OS === 'android' &&
                <Picker
                    selectedValue={computeEnumValue(selectedValue)}
                    style={{height: 25, width: 140}}
                    itemStyle={{height: 45, width: 140, alignSelf: 'center', marginTop: -10}}
                    onValueChange={onValueChange}
                >
                    {
                        Object
                            .entries(MeasurementUnits)
                            .filter(([key, value]) => measurementUnits.includes(value))
                            .map(
                                ([key, value], index) =>
                                    <Picker.Item
                                        style={{fontSize: 14}}
                                        key={index}
                                        label={key}
                                        value={value}
                                    />
                            )
                    }
                </Picker>
            }
            {
                Platform.OS === 'ios' &&
                <>
                    <TouchableOpacity style={styles.iOSPickerButton} onPress={() => openActionSheet()}>
                        <Text style={styles.iOSPickerButtonText}>{actionSheetButtonTitle}</Text>
                    </TouchableOpacity>
                    <ActionSheet ref={actionSheetRef}>
                        <View style={{paddingBottom: insets.bottom}}>
                            <RadioList
                                items={
                                    measurementUnits.map(
                                            (unit, index) => {
                                                return { label: unit.toUpperCase(), value: unit };
                                            })
                                }
                                initialSelectedValue={selectedValue}
                                onSelectedValue={selection => handleSelectedValue(selection)}
                            />
                        </View>
                    </ActionSheet>
                </>
            }
        </>
    )
}
