import React, {useState} from 'react';
import {Text, View} from 'react-native';
import {styles} from '../settings/style';
import Slider from '@react-native-community/slider';

export const SliderItem = ({
                                     title = '',
                                     initialSliderValue = 1,
                                     minValue = 1,
                                     maxValue = 10,
                                     step = 1,
                                     onValueChange
                                 }) => {

    const [sliderValue, setSliderValue] = useState(initialSliderValue || 1)

    const onSlidingComplete = (value) => {
        setSliderValue(value);
        onValueChange(value);
    }

    return (
        <View style={styles.sliderItemContainer}>
            <View style={styles.sliderItemText}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.title}>{sliderValue}</Text>
            </View>
            <View>
                <Slider
                    style={{width: '100%', height: 40}}
                    minimumValue={minValue}
                    maximumValue={maxValue}
                    value={sliderValue}
                    step={step}
                    maximumTrackTintColor='#000000'
                    onSlidingComplete={onSlidingComplete}
                />
            </View>
        </View>
    )
}
