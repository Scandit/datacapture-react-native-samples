import React, {useContext, useState} from 'react';
import {SafeAreaView, ScrollView, TouchableOpacity, Text, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

import {SymbologyDescription} from 'scandit-react-native-datacapture-barcode';

import {styles} from '../../style';

import {
    EmptySpaceDivider,
    SettingsSection,
} from '../../../common';
import BCContext from '../../../data/BCContext';

const SymbologyItem = ({label, isEnabled, onPress, style}) => (
    <TouchableOpacity onPress={onPress} style={[styles.item, style]}>
        <Text style={styles.title}>{label}</Text>
        <Text style={styles.title}>{isEnabled ? 'On' : 'Off'}</Text>
    </TouchableOpacity>
);

const MasterButtons = ({toggleAll}) => (
    <View style={styles.symbologyMasterButtonContainer}>
        <TouchableOpacity
            onPress={() => toggleAll(true)}
            style={[styles.symbologyMasterButton, {backgroundColor: '#3F51B5'}]}
        >
            <Text style={styles.symbologyMasterButtonText}>ENABLE ALL</Text>
        </TouchableOpacity>

        <TouchableOpacity
            onPress={() => toggleAll(false)}
            style={[styles.symbologyMasterButton, {backgroundColor: '#f44336'}]}
        >
            <Text style={styles.symbologyMasterButtonText}>DISABLE ALL</Text>
        </TouchableOpacity>
    </View>
)

export const SymbologiesPage = ({navigation}) => {
    const appContext = useContext(BCContext);

    const loadSymbologies = () => SymbologyDescription.all.map(item => {
        let isEnabled = appContext.barcodeCaptureSettings.enabledSymbologies.indexOf(item._identifier) > -1;
        return {name: item._readableName, isEnabled, symbology: item.symbology, data: item};
    })

    const [symbologies, setSymbologies] = useState(loadSymbologies());

    useFocusEffect(
        React.useCallback(() => {
            setSymbologies(loadSymbologies());
        }, [])
    );

    const onToggleAll = (enableAll) => {
        if (enableAll) {
            appContext.barcodeCaptureSettings.enableSymbologies(symbologies.map(item => item.symbology));
        } else {
            symbologies.forEach(item => appContext.barcodeCaptureSettings.enableSymbology(item.symbology, false));
        }
        setSymbologies(loadSymbologies());
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <EmptySpaceDivider height={25}/>

            <MasterButtons toggleAll={onToggleAll}/>

            <EmptySpaceDivider height={25}/>

            <ScrollView>
                <SettingsSection>
                    {
                        symbologies.map((symbology, index) =>
                            <SymbologyItem
                                key={index}
                                label={symbology.name}
                                isEnabled={symbology.isEnabled}
                                onPress={() => navigation.push('symbology.detail', {name: symbology.name, symbology})}
                            />)
                    }
                </SettingsSection>
            </ScrollView>
        </SafeAreaView>
    );
}
