import React from 'react';
import {SafeAreaView, TouchableOpacity, Text} from 'react-native';

import { styles } from '../style';

import {
    EmptySpaceDivider,
    SettingsSection,
} from '../../common';

const SettingsItem = ({ label, onPress, style }) => (
    <TouchableOpacity onPress={onPress} style={[styles.item, style]}>
        <Text style={styles.title}>{label}</Text>
    </TouchableOpacity>
);

export const BarcodeCapturePage = ({ navigation }) => {

    return (
        <SafeAreaView>
            <EmptySpaceDivider height={25}/>

            <SettingsSection>
                <SettingsItem
                    label={'Symbologies'}
                    onPress={() => navigation.push('symbologies', { name: 'Symbologies' })}
                />
            </SettingsSection>
            <SettingsSection>
                <SettingsItem
                    label={'Composite Types'}
                    onPress={() => navigation.push('composite.types', { name: 'Composite Types' })}
                />
            </SettingsSection>
            <SettingsSection>
                <SettingsItem
                    label={'Location Selection'}
                    onPress={() => navigation.push('location', { name: 'Location Selection' })}
                />
            </SettingsSection>
            <SettingsSection>
                <SettingsItem
                    label={'Feedback'}
                    onPress={() => navigation.push('feedback', { name: 'Feedback' })}
                />
            </SettingsSection>
            <SettingsSection>
                <SettingsItem
                    label={'Code Duplicate Filter'}
                    onPress={() => navigation.push('code.duplicate.filter', { name: 'Code Duplicate Filter' })}
                />
            </SettingsSection>
        </SafeAreaView>
    );
}
