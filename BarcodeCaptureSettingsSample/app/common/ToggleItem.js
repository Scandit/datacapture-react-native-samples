import React, {useState, useEffect} from 'react';
import {Switch, Text, View} from 'react-native';
import {styles} from '../settings/style';

export const ToggleItem = ({title, isEnabledInitially, onValueChange}) => {

    const [isEnabled, setIsEnabled] = useState(!!isEnabledInitially);

    useEffect(() => {
        setIsEnabled(isEnabledInitially);
        onValueChange(isEnabledInitially);
    }, [isEnabledInitially]);

    const onToggle = () => {
        const newValue = !isEnabled;
        setIsEnabled(newValue);
        onValueChange(newValue);
    }

    return (
        <View style={styles.singleToggleContainer}>
            <Text style={styles.title}>{title}</Text>
            <Switch
                style={styles.singleToggleSwitch}
                trackColor={{false: '#767577', true: '#81b0ff'}}
                thumbColor={'#f4f3f4'}
                ios_backgroundColor='#3e3e3e'
                onValueChange={onToggle}
                value={isEnabled}
            />
        </View>
    )
};
