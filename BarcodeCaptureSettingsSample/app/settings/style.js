import {StyleSheet, StatusBar, Platform, PlatformColor} from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: StatusBar.currentHeight || 0,
    },
    iOSPickerButton: {
        width: 90,
        height: 35,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    iOSPickerButtonText: {
        textAlign: 'center',
        fontSize: 18,
        ...Platform.select({
            ios: {
                color: PlatformColor('systemBlueColor'),
            },
        }) ,
    },
    item: {
        backgroundColor: '#fff',
        padding: 15,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sliderItemContainer: {
        flex: 1,
    },
    sliderItemText: {
        flex: 1,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sectionTitle: {
        fontSize: 16,
        padding: 10,
        backgroundColor: '#fff',
        color: '#7a7a7a',
        marginTop: 20,
    },
    title: {
        fontSize: 16,
        alignSelf: 'center',
        color: '#000',
        height: 25,
    },
    singlePickerContainer: {
        height: 55,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    valueInput: {
        height: 40,
        width: 100,
        padding: 0,
        textAlign: 'right',
        fontSize: 16,
        marginRight: 5,
        borderBottomWidth: 1,
        borderBottomColor: 'lightgrey',
    },
    valueInputContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 65,
    },
    valueInputs: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
    },
    settingsSectionContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: '100%',
        backgroundColor: '#fff',
    },
    settingsSectionTitle: {
        fontSize: 16,
        padding: 10,
        alignSelf: 'flex-start',
        color: '#838282',
    },
    settingsSectionContent: {
        padding: 10,
        width: '100%',
    },
    singleToggleContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 55,
    },
    singleToggleSwitch: {
        zIndex: 1,
        marginRight: 10,
    },
    listContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: '100%',
        backgroundColor: '#fff',
        padding: 10,
    },
    radioButton: {
        flexDirection: 'row',
        height: 55,
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        width: '100%',
    },
    symbologyMasterButtonContainer: {
        flexDirection: 'row',
        height: 55,
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
    },
    symbologyMasterButton: {
        height: 55,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        padding: 15,
    },
    symbologyMasterButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
