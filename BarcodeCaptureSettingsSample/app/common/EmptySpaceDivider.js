import React from 'react';
import {View} from 'react-native';

export const EmptySpaceDivider = ({height, bgColor}) => {
    return (
        <View style={{height, backgroundColor: bgColor}}/>
    )
}
