import React, {useEffect, useMemo, useRef, useState} from 'react';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {
  View,
  ScrollView,
  Text,
  Pressable,
  AppState,
  BackHandler,
  AppStateStatus,
} from 'react-native';

import {
  DataCaptureContext,
  Color,
  Brush,
} from 'scandit-react-native-datacapture-core';
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
import {requestCameraPermissionsIfNeeded} from './camera-permission-handler';

export const App = () => {
  const [codes, setCodes] = useState<
    {data: string | null; symbology: string}[]
  >([]);
  const [cameraPermissions, setCameraPermissions] = useState(false);

  const dataCaptureContext = useMemo(() => {
    // Enter your Scandit License key here.
    // Your Scandit License key is available via your Scandit SDK web account.
    return DataCaptureContext.forLicenseKey(
      '-- ENTER YOUR SCANDIT LICENSE KEY HERE --',
    );
  }, []);

  const [appStateVisible, setAppStateVisible] = useState(AppState.currentState);

  const [sparkScanMode, setSparkScanMode] = useState<SparkScan | null>(null);
  const sparkScanViewRef = useRef<SparkScanView | null>(null);

  useEffect(() => {
    const handleAppStateChangeSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    checkCameraPermissions();
    setupScanning();

    return () => {
      handleAppStateChangeSubscription.remove();
      dataCaptureContext.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    setAppStateVisible(nextAppState);
  };

  useEffect(() => {
    if (!appStateVisible.match(/inactive|background/)) {
      if (sparkScanViewRef.current) {
        sparkScanViewRef.current.stopScanning();
      }
    } else {
      checkCameraPermissions();
    }
  }, [appStateVisible]);

  const checkCameraPermissions = () => {
    requestCameraPermissionsIfNeeded()
      .then(() => {
        setCameraPermissions(true);
      })
      .catch(() => BackHandler.exitApp());
  };

  const setupScanning = () => {
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
    const sparkScan = SparkScan.forSettings(sparkScanSettings);

    // Register a listener to get informed whenever a new barcode is scanned.
    const sparkScanListener = {
      didScan: async (_: any, session: SparkScanSession) => {
        const barcode = session.newlyRecognizedBarcode;
        if (barcode == null) {
          return;
        }

        if (isValidBarcode(barcode)) {
          const symbology = new SymbologyDescription(barcode.symbology);

          setCodes(prevCodes => [
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

    setSparkScanMode(sparkScan);
  };

  const isValidBarcode = (barcode: Barcode) => {
    return barcode.data != null && barcode.data !== '123456789';
  };

  // Setup the feedback delegate in order to emit different feedback based on the scanned barcode
  const sparkScanFeedbackDelegate = {
    feedbackForBarcode: (barcode: Barcode) => {
      if (isValidBarcode(barcode)) {
        // return a success feedback
        return new SparkScanBarcodeSuccessFeedback();
      } else {
        // customize and return an error feedback
        return new SparkScanBarcodeErrorFeedback(
          'Wrong barcode',
          60,
          Color.fromHex('#FF0000'),
          new Brush(Color.fromHex('#FF0000'), Color.fromHex('#FF0000'), 1),
          null,
        );
      }
    },
  };

  const handleClearButtonClick = () => {
    setCodes([]);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {cameraPermissions && sparkScanMode && (
          <SparkScanView
            style={styles.sparkScanView}
            context={dataCaptureContext}
            sparkScan={sparkScanMode!}
            sparkScanViewSettings={new SparkScanViewSettings()}
            ref={view => {
              if (view) {
                view.feedbackDelegate = sparkScanFeedbackDelegate;
              }
              sparkScanViewRef.current = view;
              // @ts-ignore
            }}>
            <Text style={styles.scanCount}>
              {codes.length}{' '}
              {codes.length === 0 || codes.length > 1 ? 'items' : 'item'}
            </Text>
            <ScrollView style={styles.splitViewResults}>
              {codes.map((result, index) => (
                <View key={index} style={styles.splitViewResult}>
                  <View style={styles.splitViewImage} />
                  <View key={index} style={styles.splitViewResultBarcodeData}>
                    <Text style={styles.splitViewResultData}>
                      {result.data}
                    </Text>
                    <Text style={styles.splitViewResultSymbology}>
                      {result.symbology}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <Pressable
              style={styles.clearButton}
              onPress={handleClearButtonClick}>
              <Text style={styles.clearButtonText}>CLEAR LIST</Text>
            </Pressable>
          </SparkScanView>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};
