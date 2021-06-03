import React, {Component, useState} from 'react';
import 'react-native-gesture-handler';

import {Platform, PlatformColor, Button, Text, TouchableOpacity} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import BCContextProvider from './data/BCContextProvider';
import ScanPage from './ScanPage';
import {SettingsPage} from './settings/SettingsPage';

// Settings sections
import {ViewSettingsPage} from './settings/view/ViewSettingsPage';

// View Settings sub-sections
import {ScanArea} from './settings/view/scan-area/ScanAreaSettings';
import {PointOfInterest} from './settings/view/poi/PointOfInterestSettings';
import {Overlay} from './settings/view/overlay/OverlaySettings';
import {Gestures} from './settings/view/gestures/GestureSettings';
import {Controls} from './settings/view/controls/ControlsSettings';
import {Viewfinder} from './settings/view/viewfinder/ViewfinderSettings';
import {Logo} from './settings/view/logo/LogoSettings';

// Result settings
import {Result} from './settings/result/ResultSettings';

// Camera settings
import {CameraSettingsPage} from './settings/camera/CameraSettingsPage';

// Barcode Capture settings
import {BarcodeCapturePage} from './settings/barcode/BarcodeCapturePage';
import {SymbologiesPage} from './settings/barcode/symbologies/SymbologiesPage';
import {SymbologyDetailPage} from './settings/barcode/symbologies/SymbologyDetailPage';
import {LocationSelectionPage} from './settings/barcode/location/LocationSelectionPage';
import {FeedbackPage} from './settings/barcode/feedback/FeedbackPage';
import {CodeDuplicateFilterPage} from './settings/barcode/filter/CodeDuplicateFilterPage';
import {CompositeTypesPage} from './settings/barcode/composite-types/CompositeTypesPage';

import Icon from 'react-native-vector-icons/Ionicons';

const Stack = createStackNavigator();

const HeaderRightButton = ({navigation}) => {
    if (Platform.OS === 'ios') {
        return (
            <Button
                onPress={() => navigation.push('settings', {})}
                title='Settings'
                color={PlatformColor('systemBlue')}
            />
        )
    } else {
        return (
            <Icon name='settings-sharp' size={30} onPress={() => navigation.push('settings', {})}/>
        )
    }
}

const DoubleTapTitle = ({navigation, title}) => {

    const TAP_DELAY = 400; // in milliseconds.
    const [lastTapTime, setLastTapTime] = useState(null);

    const onTap = () => {
        let now = new Date().getTime();

        if (!lastTapTime) {
            return setLastTapTime(now);
        }

        if (now - lastTapTime <= TAP_DELAY) {
            setLastTapTime(now);
            try {
                if (navigation['navigation']) {
                    return navigation.navigation.popToTop();
                } else {
                    return navigation.popToTop();
                }
            } catch (err) {
                console.error(err);
            }
        } else {
            return setLastTapTime(now);
        }
    }

    return (
        <TouchableOpacity style={{alignSelf: 'center', transform: [{ translateX: Platform.OS === 'ios' ? 0:-25 }]}} onPress={onTap}>
            <Text style={{fontSize: 20}}>{title}</Text>
        </TouchableOpacity>
    )
}

export class App extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <BCContextProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName='scan'>
                        <Stack.Screen
                            name='scan'
                            component={ScanPage}
                            options={({navigation, route}) => ({
                                title: 'Barcode Settings Sample',
                                headerRight: (props) => <HeaderRightButton {...props} navigation={navigation}/>,
                            })}/>
                        <Stack.Screen name='settings'
                                      component={SettingsPage}
                                      options={(navigation, route) => ({
                                          headerBackTitle: 'Back',
                                          headerTitle: props => <DoubleTapTitle title={'Settings'} navigation={navigation} />,
                                      })}/>

                        {/* Settings list */}
                        <Stack.Screen name='barcodeCaptureSettings' component={BarcodeCapturePage}
                                      options={(navigation, route) => ({
                                          headerBackTitle: 'Back',
                                          headerTitle: props => <DoubleTapTitle title={'Barcode Capture'} navigation={navigation} />,
                                      })}/>
                        <Stack.Screen name='cameraSettings' component={CameraSettingsPage}
                                      options={({navigation, route}) => ({
                                          headerBackTitle: 'Back',
                                          headerTitle: props => <DoubleTapTitle title={route.params.name} navigation={navigation} />,
                                      })}/>
                        <Stack.Screen name='viewSettings' component={ViewSettingsPage}
                                      options={({navigation, route}) => ({
                                          headerBackTitle: 'Back',
                                          headerTitle: props => <DoubleTapTitle title={route.params.name} navigation={navigation} />,
                                      })}/>
                        <Stack.Screen name='resultSettings' component={Result}
                                      options={({navigation, route}) => ({
                                          headerBackTitle: 'Back',
                                          headerTitle: props => <DoubleTapTitle title={route.params.name} navigation={navigation} />,
                                      })}/>

                        {/* View settings list */}
                        <Stack.Screen name='scanAreaSettings' component={ScanArea}
                                      options={({navigation, route}) => ({
                                          headerBackTitle: 'Back',
                                          headerTitle: props => <DoubleTapTitle title={route.params.name} navigation={navigation} />,
                                      })}/>
                        <Stack.Screen name='poiSettings' component={PointOfInterest}
                                      options={({navigation, route}) => ({
                                          headerBackTitle: 'Back',
                                          headerTitle: props => <DoubleTapTitle title={route.params.name} navigation={navigation} />,
                                      })}/>
                        <Stack.Screen name='overlaySettings' component={Overlay}
                                      options={({navigation, route}) => ({
                                          headerBackTitle: 'Back',
                                          headerTitle: props => <DoubleTapTitle title={route.params.name} navigation={navigation} />,
                                      })}/>
                        <Stack.Screen name='gestureSettings' component={Gestures}
                                      options={({navigation, route}) => ({
                                          headerBackTitle: 'Back',
                                          headerTitle: props => <DoubleTapTitle title={route.params.name} navigation={navigation} />,
                                      })}/>
                        <Stack.Screen name='controlsSettings' component={Controls}
                                      options={({navigation, route}) => ({
                                          headerBackTitle: 'Back',
                                          headerTitle: props => <DoubleTapTitle title={route.params.name} navigation={navigation} />,
                                      })}/>
                        <Stack.Screen name='viewfinderSettings' component={Viewfinder}
                                      options={({navigation, route}) => ({
                                          headerBackTitle: 'Back',
                                          headerTitle: props => <DoubleTapTitle title={route.params.name} navigation={navigation} />,
                                      })}/>
                        <Stack.Screen name='logoSettings' component={Logo}
                                      options={({navigation, route}) => ({
                                          headerBackTitle: 'Back',
                                          headerTitle: props => <DoubleTapTitle title={route.params.name} navigation={navigation} />,
                                      })}/>

                        {/* Barcode Capture settings list */}
                        <Stack.Screen name='symbologies' component={SymbologiesPage}
                                      options={({navigation, route}) => ({
                                          headerBackTitle: 'Back',
                                          headerTitle: props => <DoubleTapTitle title={route.params.name} navigation={navigation} />,
                                      })}/>
                        <Stack.Screen name='symbology.detail' component={SymbologyDetailPage}
                                      options={({navigation, route}) => ({
                                          symbology: route.params.symbology,
                                          headerBackTitle: 'Back',
                                          headerTitle: props => <DoubleTapTitle title={route.params.name} navigation={navigation} />,
                                      })}/>
                        <Stack.Screen name='location' component={LocationSelectionPage}
                                      options={({navigation, route}) => ({
                                          headerBackTitle: 'Back',
                                          headerTitle: props => <DoubleTapTitle title={route.params.name} navigation={navigation} />,
                                      })}/>
                        <Stack.Screen name='feedback' component={FeedbackPage}
                                      options={({navigation, route}) => ({
                                          headerBackTitle: 'Back',
                                          headerTitle: props => <DoubleTapTitle title={route.params.name} navigation={navigation} />,
                                      })}/>
                        <Stack.Screen name='code.duplicate.filter' component={CodeDuplicateFilterPage}
                                      options={({navigation, route}) => ({
                                          headerBackTitle: 'Back',
                                          headerTitle: props => <DoubleTapTitle title={route.params.name} navigation={navigation} />,
                                      })}
                                      />
                        <Stack.Screen name='composite.types' component={CompositeTypesPage}
                                      options={({navigation, route}) => ({
                                          headerBackTitle: 'Back',
                                          headerTitle: props => <DoubleTapTitle title={route.params.name} navigation={navigation} />,
                                      })}/>
                    </Stack.Navigator>
                </NavigationContainer>
            </BCContextProvider>
        );
    }
}
