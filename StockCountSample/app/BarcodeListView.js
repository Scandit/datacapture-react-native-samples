import React, { useLayoutEffect, useState, useEffect } from 'react';
import {
    Text,
    View,
    ScrollView,
    Animated,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ImageBackground,
    Easing,
} from 'react-native';

import { SymbologyDescription } from 'scandit-react-native-datacapture-barcode';

import { BarcodeRow } from './BarcodeRow';

import { styles } from './styles';

export const BarcodeListView = ({ show = false, results = {}, style = {}, ...propsSansStyle }) => {

    // Keep a state of consolidated barcode results.
    const [consolidatedResults, setConsolidatedResults] = useState({});

    // Update the results when new scans are received via props.
    useEffect(() => {
        const updatedResults = Object.assign({}, consolidatedResults);

        Object
            .entries(results)
            .map(([key, value]) => {
                if (!updatedResults[key]) {
                    updatedResults[key] = {
                        ...value,
                        symbology: SymbologyDescription(value.symbology)?.readableName,
                        itemCount: 1
                    };
                } else {
                    updatedResults[key].itemCount += 1;
                }
            })

        setConsolidatedResults(updatedResults);
    }, [results]);

    // Animated value for height.
    const [animatedHeight, setAnimatedHeight] = useState(new Animated.Value(0))

    // Interpolation for height from animatedHeight=0 to animatedHeight=screen_height.
    const interpolatedHeight = animatedHeight.interpolate({
        inputRange: [0, 100],
        outputRange: ["0%", "100%"]
    })

    // useLayoutEffect ensures this is run right after we obtain the animatedHeight value.
    useLayoutEffect(() => {
        if (show) {
            // If the show property is true, this means we want to show the card, so run the animateIn() function.
            animateIn();
        } else {
            // Else, we want to close it.
            animateOut();
        }
    }, [show]);

    const animateIn = () => {
        Animated.timing(animatedHeight, {
            toValue: 100, // the height value we're going towards
            useNativeDriver: false,
            duration: 250,
            easing: Easing.linear
        }).start()
    }

    const animateOut = () => {
        let valueToReach = 0;

        if (Object.keys(consolidatedResults).length > 0) {
            valueToReach = 0.3;
        }

        Animated.timing(animatedHeight, {
            toValue: valueToReach, // the height value we're going towards
            useNativeDriver: false,
            duration: 250,
            easing: Easing.linear
        }).start();
    }

    const title = (numberOfItems) => {
        if (numberOfItems === 0) {
            return <Text style={styles.title}> Add items to your list</Text>
        } else {
            return <Text style={styles.title}> {numberOfItems} items</Text>
        }
    }

    const clearButton = (numberOfItems) => {
        if (numberOfItems !== 0) {
            return <TouchableOpacity
                activeOpacity={.67}
                style={styles.clearButton}
                onPress={e => onClearPress(e)}
            ><Text>Clear</Text></TouchableOpacity>
        }
        return
    }

    const header = (numberOfItems) =>
        <TouchableWithoutFeedback onPress={e => onCardPress(e)}>
            <View style={styles.headerContainer}>
                <View style={styles.title}>
                    {title(numberOfItems)}
                </View>
                <View style={styles.clearButton}>
                    {clearButton(numberOfItems)}
                </View>
            </View>
        </TouchableWithoutFeedback>

    const addBarcodesButton = () =>
        <TouchableOpacity
            activeOpacity={.67}
            style={styles.addBarcodesButton}
            onPress={propsSansStyle.onCaptureResults}>
            <ImageBackground source={require('./images/fab_add_to_list.png')} style={styles.addBarcodesButtonImage} />
        </TouchableOpacity>

    const onClearPress = (e) => {
        setConsolidatedResults({});
        propsSansStyle.onClearPress();
    }

    const onCardPress = (e) => {
        e.stopPropagation();
        propsSansStyle.onCardPress(e);
    }

    return (
        <View style={{ ...styles.containerStyle, ...style }} >
            <View style={styles.overlayStyle}>
                <Animated.View style={[styles.cardStyle, { height: interpolatedHeight }]}>
                    {header(Object.values(consolidatedResults).length)}
                    <ScrollView style={styles.resultsContainer}>
                        {Object.values(consolidatedResults).map(entry => <BarcodeRow key={entry.data} result={entry} />)}
                    </ScrollView>
                </Animated.View>
            </View>
            {addBarcodesButton()}
        </View >
    );
}
