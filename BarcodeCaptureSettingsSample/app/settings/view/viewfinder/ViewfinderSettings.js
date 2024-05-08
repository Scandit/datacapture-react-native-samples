import React, {useContext, useEffect, useState} from 'react';
import {SafeAreaView, ScrollView} from 'react-native';

import {EmptySpaceDivider, SettingsSection, PickerItem,} from '../../../common';

import {RectangularViewfinderSettings} from './components/rectangular-viewfinder/RectangularViewfinderSettings';
import {LaserlineViewfinderSettings} from './components/laserline-viewfinder/LaserlineViewfinderSettings';
import {AimerViewfinderSettings} from './components/aimer-viewfinder/AimerViewfinderSettings';
import ViewfinderFactory from './ViewfinderFactory';
import BCContext from '../../../data/BCContext';

const VIEWFINDERS = [
    {
        label: 'None',
        value: 'none',
        component: null,
    }, {
        label: 'Rectangular',
        value: 'rectangular',
        component: <RectangularViewfinderSettings/>,
    }, {
        label: 'Laserline',
        value: 'laserline',
        component: <LaserlineViewfinderSettings/>,
    }, {
        label: 'Aimer',
        value: 'aimer',
        component: <AimerViewfinderSettings/>,
    },
];

export const Viewfinder = () => {
    const appContext = useContext(BCContext);

    const [viewfinderTypePickerValue, setViewfinderTypePickerValue] = useState(
        (appContext.overlay.viewfinder || {type: 'none'}).type
    )

    useEffect(() => {
        return function updateViewfinder() {
            const newViewfinder = new ViewfinderFactory(appContext.viewfinderType, appContext.viewfinderSettings);

            if (Object.keys(newViewfinder).length === 0) {
                appContext.overlay.viewfinder = null;
            } else {
                appContext.overlay.viewfinder = newViewfinder;
            }
        };
    }, []);

    const onValueChange = (viewfinderType) => {
        setViewfinderTypePickerValue(viewfinderType);
        appContext.viewfinderType = viewfinderType;
    }

    const renderViewfinderSettings = () => VIEWFINDERS.filter(viewfinder => viewfinder.value === viewfinderTypePickerValue)[0].component

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <EmptySpaceDivider height={25}/>

                <SettingsSection>
                    <PickerItem
                        title={'Type'}
                        onValueChange={onValueChange}
                        selectedValue={viewfinderTypePickerValue}
                        options={VIEWFINDERS}
                    />
                </SettingsSection>

                {renderViewfinderSettings()}
            </ScrollView>
        </SafeAreaView>
    );
}
