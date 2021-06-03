import React, {useState} from 'react';
import {styles} from '../settings/style';
import {Text, TextInput, View} from 'react-native';
import {MeasurementUnitPicker} from './MeasurementUnitPicker';

export const ValueInput = ({title = '', defaultValue = {}, onValueUpdate, measurementUnits = []}) => {

    const [inputValue, setInputValue] = useState(defaultValue);

    const onMeasurementUnitUpdate = (muValue) => {
        const update = {...inputValue, measurementUnitValue: (muValue || '').toLowerCase()};
        setInputValue(update);
        onValueUpdate(update);
    }

    const onEndEditing = (value) => {
        const update = {...inputValue, inputBoxValue: value};
        setInputValue(update);
        onValueUpdate(update);
    }

    return (
        <View style={styles.valueInputContainer}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.valueInputs}>
                <TextInput
                    style={styles.valueInput}
                    placeholder='0'
                    onEndEditing={e => onEndEditing(e.nativeEvent.text)}
                    keyboardType='numeric'
                    returnKeyLabel='Update'
                    maxLength={5}
                    defaultValue={inputValue.inputBoxValue}
                />
                {
                    measurementUnits.length > 0 &&
                    <MeasurementUnitPicker
                        measurementUnits={measurementUnits}
                        defaultValue={(inputValue.measurementUnitValue || '').toLowerCase()}
                        onChange={onMeasurementUnitUpdate}
                    />
                }
            </View>
        </View>
    )
}
