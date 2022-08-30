import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    absolute: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },

    // Scanner view.
    scanContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    cameraView: {
        flex: 1,
    },

    // Notifications.
    notificationContainer: {
        position: 'absolute',
        top: 100,
        left: '50%',
        transform: [
            {
                translateX: -100
            }
        ],
        backgroundColor: '#FFF',
        height: 40,
        width: 200,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    notificationText: {
        color: '#000',
        fontSize: 14,
    },
});
