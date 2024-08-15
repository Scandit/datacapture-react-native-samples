import React, {useContext} from 'react';
import {SafeAreaView, ScrollView} from 'react-native';

import {CompositeType} from 'scandit-react-native-datacapture-barcode';

import {
    EmptySpaceDivider,
    SettingsSection,
    MultiSelectList,
} from '../../../common';
import BCContext from '../../../data/BCContext';
import { styles } from '../../style';

export const CompositeTypesPage = ({navigation}) => {
    const appContext = useContext(BCContext);

    const onSelectedCompositeTypes = (types) => {
        // Disable all symbologies first.
        appContext.barcodeCaptureSettings.enabledSymbologies
            .forEach(item => appContext.barcodeCaptureSettings.enableSymbology(item, false));

        // Then enable the selected composite types, which in turn enable the corresponding symbologies.
        appContext.barcodeCaptureSettings.enabledCompositeTypes = types;
        appContext.barcodeCaptureSettings.enableSymbologiesForCompositeTypes(types);
    }

    return (
        <SafeAreaView style={styles.container}>
            <EmptySpaceDivider height={25}/>

            <ScrollView>
                <SettingsSection>
                    <MultiSelectList
                        items={Object.entries(CompositeType).map(([key, value]) => ({label: key, value}))}
                        onSelectedValue={onSelectedCompositeTypes}
                        initialSelectedValues={appContext.barcodeCaptureSettings.enabledCompositeTypes}
                    />
                </SettingsSection>
            </ScrollView>
        </SafeAreaView>
    );
}
