import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    listPage: {
        flex: 1,
        flexDirection: 'column',
    },
    listContainer: {
        flex: 1,
        paddingTop: 15,
    },
    item: {
        flex: 1,
        height: 55,
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingLeft: 25,
        paddingRight: 25,
    },
    fullScreenView: {
        flex: 1,
    },
    splitView: {
        flex: 2,
        flexDirection: 'column',
    },
    splitViewDataCapture: {
        flex: 1,
    },
    splitViewResults: {
        flex: 1,
        flexDirection: 'column',
    },
    splitViewResult: {
        flex: 1,
        flexDirection: 'column',
        padding: 10,
        paddingLeft: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#dadada',
    },
    splitViewResultData: {
        flex: 1,
        color: '#000',
    },
    splitViewResultSymbology: {
        flex: 1,
        color: '#2ec1ce',
    },
    modalView: {
        flex: 1,
        flexDirection: 'column',
    },
});
