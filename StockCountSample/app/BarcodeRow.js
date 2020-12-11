import React from 'react';
import {
    ImageBackground,
    Text,
    View,
} from 'react-native';

import { styles } from './styles';

export const BarcodeRow = ({ result = {} }) => {
    const { data, symbology } = result;

    return (
        <View style={styles.result}>
            <ImageBackground source={require('./images/barcode_black.png')} style={styles.resultImage} />

            <View style={styles.resultDataContainer}>
                <Text style={styles.resultSymbology}>{symbology}</Text>
                <Text style={styles.resultData}>{data}</Text>

                <View style={styles.resultStockContainer}>
                    <View style={styles.resultStockCircle}>
                        <Text style={styles.resultStockCircleText}>-</Text>
                    </View>
                    <Text style={styles.resultStockCount}>{result.itemCount}</Text>
                    <View style={styles.resultStockCircle}>
                        <Text style={styles.resultStockCircleText}>+</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}