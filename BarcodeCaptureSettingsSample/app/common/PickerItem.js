import React, {useRef, useState, useEffect} from 'react';
import {Platform, Text, View, Button} from 'react-native';
import {styles} from '../settings/style';
import {Picker} from '@react-native-picker/picker';
import ActionSheet from 'react-native-actions-sheet';
import {RadioList} from './RadioList';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export const PickerItem = ({ title, selectedValue, options, onValueChange }) => {

    const insets = useSafeAreaInsets();
    const actionSheetRef = useRef(null);

    const getDisplayTitle = (value, options) => {
        if (!value) {
            return 'Select';
        }

        return options
            .filter(option => option.value === value)
            .map(option => option.label)
            .reduce((acc, curr) => curr, 'Select');
    }

    const [actionSheetButtonTitle, setActionSheetButtonTitle] = useState(getDisplayTitle(selectedValue, options));

    if (Platform.OS === 'ios') {
        useEffect(() => {
            setActionSheetButtonTitle(getDisplayTitle(selectedValue, options));
        }, [selectedValue]);
    }

    const openActionSheet = () => {
        actionSheetRef.current.setModalVisible();
    }

    const handleSelectedValue = (selection) => {
        actionSheetRef.current.setModalVisible(false);
        onValueChange(selection);
        setActionSheetButtonTitle(getDisplayTitle(selection, options));
    }

    return (
        <View style={styles.singlePickerContainer}>
            <Text style={styles.title}>{title}</Text>
            {
                Platform.OS === 'android' &&
                <Picker
                    selectedValue={selectedValue}
                    style={{ height: 55, width: 180 }}
                    itemStyle={{ height: 55, width: 180 }}
                    onValueChange={(itemValue, itemIndex) => onValueChange(itemValue)}
                >
                    {
                        options.map((option, index) => <Picker.Item key={index} label={option.label} value={option.value} />)
                    }
                </Picker>
            }
            {
                Platform.OS === 'ios' &&
                <>
                    <Button title={actionSheetButtonTitle} onPress={() => openActionSheet()}/>
                    <ActionSheet ref={actionSheetRef}>
                        <View style={{paddingBottom: insets.bottom}}>
                            <RadioList
                                items={options}
                                initialSelectedValue={selectedValue}
                                onSelectedValue={selection => handleSelectedValue(selection)}
                            />
                        </View>
                    </ActionSheet>
                </>
            }
        </View>
    )
};
