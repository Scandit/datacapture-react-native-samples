import React, {useContext, useState} from 'react';
import {SafeAreaView, ScrollView} from 'react-native';

import {
    EmptySpaceDivider,
    MultiSelectList,
    PickerItem,
    SettingsSection,
    ToggleItem,
} from '../../../common';
import BCContext from '../../../data/BCContext';

export const SymbologyDetailPage = (props) => {
    const appContext = useContext(BCContext);

    const payload = props.route.params.symbology;

    const symbologySettings = appContext.barcodeCaptureSettings.settingsForSymbology(payload.symbology);

    // Range defaults
    const min = payload.data._defaultSymbolCountRange._minimum;
    const max = payload.data._defaultSymbolCountRange._maximum;
    const step = payload.data._defaultSymbolCountRange._step;
    const symbolRange = Array(max - min + 1).fill().map((_, index) => min + index * step);

    // Range active values
    const activeMin = payload.data._activeSymbolCountRange._minimum;
    const activeMax = payload.data._activeSymbolCountRange._maximum;

    const [minimumRangeLimit, setMinimumRangeLimit] = useState(activeMin.toString());
    const [maximumRangeLimit, setMaximumRangeLimit] = useState(activeMax.toString());

    const onExtensionUpdate = (enabledExtensions) => {
        payload.data._supportedExtensions.forEach(item => {
            symbologySettings.setExtensionEnabled(item, enabledExtensions.includes(item))
        })
    }

    const onEnableToggled = (isEnabled) => {
        appContext.barcodeCaptureSettings.enableSymbology(payload.symbology, isEnabled);
    }

    const onColorInvertedToggled = (isEnabled) => {
        symbologySettings.isColorInvertedEnabled = isEnabled;
    }

    const onRangeValueChange = (value, isMinimum) => {
        if (isMinimum) {
            setMinimumRangeLimit(value <= parseInt(maximumRangeLimit) ? value.toString() : maximumRangeLimit);
        } else {
            setMaximumRangeLimit(value >= parseInt(minimumRangeLimit) ? value.toString() : minimumRangeLimit);
        }
    }

    return (
        <SafeAreaView>
            <ScrollView>
                <EmptySpaceDivider height={25}/>

                <SettingsSection>
                    <ToggleItem
                        title={'Enabled'}
                        isEnabledInitially={symbologySettings.isEnabled}
                        onValueChange={onEnableToggled}
                    />
                    <ToggleItem
                        title={'Color Inverted'}
                        isEnabledInitially={symbologySettings.isColorInvertedEnabled}
                        onValueChange={onColorInvertedToggled}
                    />
                </SettingsSection>

                {
                    symbolRange.length > 1 &&
                    <EmptySpaceDivider height={25}/>
                }

                {
                    symbolRange.length > 1 &&
                    <SettingsSection title={'Range'}>
                        <PickerItem
                            title={'Minimum'}
                            options={symbolRange.map(value => ({label: value.toString(), value: value.toString()}))}
                            selectedValue={minimumRangeLimit}
                            onValueChange={value => onRangeValueChange(value, true)}
                        />
                        <PickerItem
                            title={'Maximum'}
                            options={symbolRange.map(value => ({label: value.toString(), value: value.toString()}))}
                            selectedValue={maximumRangeLimit}
                            onValueChange={value => onRangeValueChange(value, false)}
                        />
                    </SettingsSection>
                }

                <EmptySpaceDivider height={25}/>

                {
                    payload.data._supportedExtensions.length > 0 &&
                    <SettingsSection title={'Extensions'}>
                        <MultiSelectList
                            items={payload.data._supportedExtensions.map(extension => ({
                                value: extension,
                                label: extension
                            }))}
                            onSelectedValue={onExtensionUpdate}
                            initialSelectedValues={symbologySettings.extensions}
                        />
                    </SettingsSection>
                }
            </ScrollView>
        </SafeAreaView>
    );
}
