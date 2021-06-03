import React from 'react';
import {styles} from '../settings/style';
import {Text, View} from 'react-native';

export const SettingsSection = (props) => {
    return (
        <View style={styles.settingsSectionContainer}>
            {!!props.title && <Text style={styles.settingsSectionTitle}>{props.title}</Text>}
            <View style={styles.settingsSectionContent}>
                {props.children}
            </View>
        </View>
    )
}
