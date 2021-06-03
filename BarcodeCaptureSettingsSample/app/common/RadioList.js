import React, {useState} from 'react';
import {
    TouchableOpacity,
    Text,
    View,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import {styles} from '../settings/style';

export const RadioList = ({
                       items = [],
                       initialSelectedValue = '',
                       onSelectedValue,
                       selectedIcon = 'checkmark-outline'
                   }) => {

    const [selectedValue, setSelectedValue] = useState(initialSelectedValue)

    const onItemSelect = (itemValue) => {
        setSelectedValue(itemValue);
        onSelectedValue(itemValue);
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
                                selectedValue === item.value ?
                                    <Icon name={selectedIcon} size={25}
                                          onPress={() => onItemSelect(item.value)}/> : null
                            }
                        </TouchableOpacity>
                )
            }
        </View>
    )
};
