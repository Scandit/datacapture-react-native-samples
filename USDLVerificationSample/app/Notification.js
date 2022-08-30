import React from 'react';
import {
    Text,
    View,
    Image,
} from 'react-native';

import { styles } from './styles';

export const NotificationTypes = {
    success: 'success',
    error: 'error',
}

export const Notification = ({ notificationText }) => {

    if (!notificationText) return null;

    return (
        <View style={[styles.notificationContainer]}>
            <Text style={styles.notificationText}>
                {notificationText}
            </Text>
        </View>
    )
}
