import React from 'react';
import { SafeAreaView, TouchableOpacity, Text, FlatList } from 'react-native';

import data from './view-settings-page.json';
import { styles } from '../style';

const ViewSettingsItem = ({ item, onPress, style }) => (
    <TouchableOpacity onPress={onPress} style={[styles.item, style]}>
        <Text style={styles.title}>{item.displayLabel}</Text>
    </TouchableOpacity>
);

export const ViewSettingsPage = ({ navigation }) => {
    const renderItem = ({ item }) => (
        <ViewSettingsItem
            item={item}
            onPress={() => navigation.push(item.routeName, { name: item.displayLabel })}
        />
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />
        </SafeAreaView>
    );
}