import React, {useContext} from 'react';
import {SafeAreaView} from 'react-native';

import {EmptySpaceDivider, SettingsSection, ToggleItem,} from '../../../common';

import BCContext from '../../../data/BCContext';
import {
    TapToFocus,
    SwipeToZoom,
} from 'scandit-react-native-datacapture-core';

export const Gestures = () => {
    const appContext = useContext(BCContext);

    const toggleTapToFocus = (isEnabled) => {
        appContext.viewRef.current.view.focusGesture = isEnabled ? new TapToFocus() : null;
    }

    const toggleSwipeToZoom = (isEnabled) => {
        appContext.viewRef.current.view.zoomGesture = isEnabled ? new SwipeToZoom() : null;
    }

    return (
        <SafeAreaView style={styles.container}>
            <EmptySpaceDivider height={25}/>

            <SettingsSection>
                <ToggleItem
                    title={'Tap to Focus'}
                    isEnabledInitially={appContext.viewRef.current.view.focusGesture instanceof TapToFocus}
                    onValueChange={toggleTapToFocus}
                />
                <ToggleItem
                    title={'Swipe to Zoom'}
                    isEnabledInitially={appContext.viewRef.current.view.zoomGesture instanceof SwipeToZoom}
                    onValueChange={toggleSwipeToZoom}
                />
            </SettingsSection>
        </SafeAreaView>
    );
}
