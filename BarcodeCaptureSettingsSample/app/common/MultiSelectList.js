import React, {useState} from 'react';
import {
    TouchableOpacity,
    Text,
    View,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import {styles} from '../settings/style';

export const MultiSelectList = ({
                                    items = [],
                                    initialSelectedValues = [],
                                    onSelectedValue,
                                    selectedIcon = 'checkmark-outline'
                                }) => {

    const [selectedValues, setSelectedValues] = useState(initialSelectedValues);

    const onItemSelect = (itemValue) => {
        let updatedValues = [...selectedValues];

        if (updatedValues.includes(itemValue)) {
            updatedValues = updatedValues.filter(value => value !== itemValue);
        } else {
            updatedValues.push(itemValue);
        }
        setSelectedValues(updatedValues);
        onSelectedValue(updatedValues);
    }

    return (
        <View style={styles.listContainer}>
            {
                items.map(
                    (item, index) =>
                        <TouchableOpacity
                            key={index}
                            style={styles.radioButton}
                            onPress={() => onItemSelect(item.value)}
                        >
                            <Text>{item.label}</Text>
                            {
                                selectedValues.includes(item.value) ?
                                    <Icon name={selectedIcon} size={25}
                                          onPress={() => onItemSelect(item.value)}/> : null
                            }
                        </TouchableOpacity>
                )
            }
        </View>
    )
};
