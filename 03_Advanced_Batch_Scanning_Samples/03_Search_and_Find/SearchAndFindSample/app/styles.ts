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
    closeButton: {
        padding: 15,
        position: 'absolute',
    },
    modal: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
        backgroundColor: 'white',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    textContainer: {
        marginTop: 30,
        flex: 1,
        flexDirection: "row",
        padding: 15,
        alignItems: 'center',
        justifyContent: "space-between",
    },
    textData: {
        color: '#000',
        fontSize: 14,
        fontWeight: '600',
    },
    imageButton: {
        alignItems: 'center',
        justifyContent: 'center',
    }
});
