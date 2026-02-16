import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View, ScrollView, Text, Pressable} from 'react-native';

import {Color, Brush} from 'scandit-react-native-datacapture-core';
import {
  SparkScan,
  SparkScanSettings,
  SparkScanView,
  SparkScanViewSettings,
  Symbology,
  SymbologyDescription,
  SparkScanSession,
  Barcode,
  SparkScanBarcodeSuccessFeedback,
  SparkScanBarcodeErrorFeedback,
} from 'scandit-react-native-datacapture-barcode';

import {styles} from './styles';
import dataCaptureContext from './CaptureContext';

export const ScanPage = () => {
  const [codes, setCodes] = useState<
    {data: string | null; symbology: string}[]
  >([]);

  const sparkScanMode = useRef<SparkScan>(null!);
  if (!sparkScanMode.current) {
    sparkScanMode.current = setupScanning();
  }
  const sparkScanViewRef = useRef<SparkScanView | null>(null);

  useEffect(() => {
    return () => {
      dataCaptureContext.removeMode(sparkScanMode.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setupScanning(): SparkScan {
    // The spark scan process is configured through SparkScan settings
    // which are then applied to the spark scan instance that manages the spark scan.
    const sparkScanSettings = new SparkScanSettings();

    // The settings instance initially has all types of barcodes (symbologies) disabled.
    // For the purpose of this sample we enable a very generous set of symbologies.
    // In your own app ensure that you only enable the symbologies that your app requires
    // as every additional enabled symbology has an impact on processing times.
    sparkScanSettings.enableSymbologies([
      Symbology.EAN13UPCA,
      Symbology.EAN8,
      Symbology.UPCE,
      Symbology.Code39,
      Symbology.Code128,
      Symbology.InterleavedTwoOfFive,
    ]);

    // Some linear/1d barcode symbologies allow you to encode variable-length data.
    // By default, the Scandit Data Capture SDK only scans barcodes in a certain length range.
    // If your application requires scanning of one of these symbologies, and the length is
    // falling outside the default range, you may need to adjust the "active symbol counts"
    // for this symbology. This is shown in the following few lines of code for one of the
    // variable-length symbologies.
    const symbologySettings = sparkScanSettings.settingsForSymbology(
      Symbology.Code39,
    );

    symbologySettings.activeSymbolCounts = [
      7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ];

    // Create the spark scan instance.
    // Spark scan will automatically apply and maintain the optimal camera settings.
    const sparkScan = new SparkScan(sparkScanSettings);

    // Register a listener to get informed whenever a new barcode is scanned.
    const sparkScanListener = {
      didScan: async (_: any, session: SparkScanSession) => {
        const barcode = session.newlyRecognizedBarcode;
        if (barcode == null) {
          return;
        }

        if (isValidBarcode(barcode)) {
          const symbology = new SymbologyDescription(barcode.symbology);

          setCodes((prevCodes: any) => [
            ...prevCodes,
            {
              data: barcode.data,
              symbology: symbology.readableName,
            },
          ]);
        }
      },
    };

    // Add the listener to the spark scan mode.
    sparkScan.addListener(sparkScanListener);

    return sparkScan;
  };

  const isValidBarcode = useCallback((barcode: Barcode) => {
    return barcode.data != null && barcode.data !== '123456789';
  }, []);

  // Setup the feedback delegate in order to emit different feedback based on the scanned barcode
  const sparkScanFeedbackDelegate = useMemo(() => {
    const errorFeedback = new SparkScanBarcodeErrorFeedback(
      'Wrong barcode',
      60,
      Color.fromHex('#FF0000'),
      new Brush(Color.fromHex('#FF0000'), Color.fromHex('#FF0000'), 1),
      null,
    );
    const successFeedback = new SparkScanBarcodeSuccessFeedback();

    return {
      feedbackForBarcode: (barcode: Barcode) => {
        if (isValidBarcode(barcode)) {
          return successFeedback;
        }
        return errorFeedback;
      },
    };
  }, [isValidBarcode]);

  const handleClearButtonClick = () => {
    setCodes([]);
  };

  return (
    <SparkScanView
      style={styles.container}
      context={dataCaptureContext}
      sparkScan={sparkScanMode.current}
      sparkScanViewSettings={new SparkScanViewSettings()}
      ref={view => {
        if (view) {
          view.feedbackDelegate = sparkScanFeedbackDelegate;
        }
        sparkScanViewRef.current = view;
      }}>
      <View style={styles.contentContainer}>
        <Text style={styles.scanCount}>
          {codes.length}{' '}
          {codes.length === 0 || codes.length > 1 ? 'items' : 'item'}
        </Text>
        <ScrollView style={styles.splitViewResults} nestedScrollEnabled={true}>
          {codes.map((result, index) => (
            <View key={index} style={styles.splitViewResult}>
              <View style={styles.splitViewImage} />
              <View key={index} style={styles.splitViewResultBarcodeData}>
                <Text style={styles.splitViewResultData}>{result.data}</Text>
                <Text style={styles.splitViewResultSymbology}>
                  {result.symbology}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <Pressable 
          style={styles.clearButton} 
          onPress={handleClearButtonClick}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Text style={styles.clearButtonText}>CLEAR LIST</Text>
        </Pressable>
      </View>
    </SparkScanView>
  );
};
