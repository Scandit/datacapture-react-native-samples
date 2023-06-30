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
});
