import React, {useContext, useState, useEffect} from 'react';
import {Platform, SafeAreaView, ScrollView} from 'react-native';

import {BarcodeCaptureFeedback} from 'scandit-react-native-datacapture-barcode';
import {Feedback, Vibration, Sound} from 'scandit-react-native-datacapture-core';

import {
    EmptySpaceDivider,
    SettingsSection,
    ToggleItem,
    PickerItem,
} from '../../../common';
import BCContext from '../../../data/BCContext';

const vibrationTypesForiOS = [
    {
        label: 'No Vibration',
        value: 'none',
        vibration: null,
    },
    {
        label: 'Default Vibration',
        value: 'default',
        vibration: Vibration.defaultVibration,
    },
    {
        label: 'Selection Haptic Feedback',
        value: 'selectionHaptic',
        vibration: Vibration.selectionHapticFeedback,
    },
    {
        label: 'Success Haptic Feedback',
        value: 'successHaptic',
        vibration: Vibration.successHapticFeedback,
    },
]

export const FeedbackPage = ({navigation}) => {
    const appContext = useContext(BCContext);

    const feedbackSettings = appContext.barcodeCaptureMode.feedback;

    const [isSoundOn, setIsSoundOn] = useState(feedbackSettings.success.sound instanceof Sound);
    const [isVibrationOn, setIsVibrationOn] = useState(feedbackSettings.success.vibration instanceof Vibration);
    const [iosVibrationType, setIosVibrationType] = useState(feedbackSettings.success.vibration?.type || 'none');

    if (Platform.OS === 'android') {
        useEffect(() => {
            const vibration = isVibrationOn ? Vibration.defaultVibration : null;
            const sound = isSoundOn ? Sound.defaultSound : null;

            const barcodeCaptureFeedback = new BarcodeCaptureFeedback();
            barcodeCaptureFeedback.success = new Feedback(vibration, sound);

            appContext.barcodeCaptureMode.feedback = barcodeCaptureFeedback;
        }, [isSoundOn, isVibrationOn]);
    }

    if (Platform.OS === 'ios') {
        useEffect(() => {
            const vibration = vibrationTypesForiOS.filter(type => type.value === iosVibrationType)[0].vibration;
            const sound = isSoundOn ? Sound.defaultSound : null;

            const barcodeCaptureFeedback = new BarcodeCaptureFeedback();
            barcodeCaptureFeedback.success = new Feedback(vibration, sound);

            appContext.barcodeCaptureMode.feedback = barcodeCaptureFeedback;
        }, [isSoundOn, iosVibrationType]);
    }


    return (
        <SafeAreaView styles={{ flex: 1 }} >
            <EmptySpaceDivider height={25}/>

            <ScrollView>
                <SettingsSection>
                    <ToggleItem
                        title={'Sound'}
                        isEnabledInitially={isSoundOn}
                        onValueChange={value => setIsSoundOn(value)}
                    />
                    {
                        Platform.OS === 'android' &&
                        <ToggleItem
                            title={'Vibration'}
                            isEnabledInitially={isVibrationOn}
                            onValueChange={value => setIsVibrationOn(value)}
                        />
                    }
                    {
                        Platform.OS === 'ios' &&
                        <PickerItem
                            title={'Vibration'}
                            options={vibrationTypesForiOS}
                            selectedValue={iosVibrationType}
                            onValueChange={value => setIosVibrationType(value)}
                        />
                    }
                </SettingsSection>
            </ScrollView>
        </SafeAreaView>
    );
}
