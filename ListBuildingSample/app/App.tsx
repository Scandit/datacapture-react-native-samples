import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  ScrollView,
  Text,
  Pressable,
  AppState,
  BackHandler,
  SafeAreaView,
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
    // There is a Scandit sample license key set below here.
    // This license key is enabled for sample evaluation only.
    // If you want to build your own application, get your license key by signing up for a trial at https://ssl.scandit.com/dashboard/sign-up?p=test
    return DataCaptureContext.forLicenseKey(
      'AbvELRLKNvXhGsHO0zMIIg85n3IiQdKMA2p5yeVDSOSZSZg/BhX401FXc+2UHPun8Rp2LRpw26tYdgnIJlXiLAtmXfjDZNQzZmrZY2R0QaJaXJC34UtcQE12hEpIYhu+AmjA5cROhJN3CHPoHDns+ho12ibrRAoFrAocoBIwCVzuTRHr0U6pmCKoa/Mn3sNPdINHh97m1X9Al9xjh3VOTNimP6ZjrHLVWEJSOdp2QYOnqn5izP1329PVcZhn8gqlGCRh+LJytbKJYI/KIRbMy3bNOyq5kNnr2IlOqaoXRgYdz2IU+jIWw8Cby9XoSB1zkphiYMmlCUqrDzxLUmTAXF4rSWobiM+OxnoImDqISpunJBQz0a5DSeT5Zf0lwwvXQLX4ghkgXozyYYfYvIKsqxJLZoza8g1BFsJ1i3fb0JYP2Ju209OMN2NTJifAu9ZJjQKGWS76Rmr/jre13jCqGgx5SX9F2lA2ZpF2AEb6rmYYmMtL9CPwWvstM+W295WvscH+gCBccZ9q3rxfIsak6cV2T50/2uBWfJJka6kL9UOjMOG3BOGKx+O+KWT/twwvOC+GcvC8s1qMwGNNM6G+/m7fG5Xtl5wtp3QhpzPJbBHSmlkYbxXQx0SpuWBmvxygyKOi3lUzz3gRzOdykWRXzrhiMAp5bb1y6n6g4O2v2TVgzWWF8vwZ6F60ehYDUq7pbusgT4Fl3fV7fYPgLxMMvXKduMmUlWyGv3CWL9LfvoY/hLl7RxoyUryTMmSfRVBcsKs+MWYJGh1iIvWk1UhOChb9IGI2PzUsHz7+OikuYMjKhR8LZZYalXpPiEVfT66yy75M5DODcjXRoFZU',
    );
  }, []);

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
  }, []);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (!nextAppState.match(/inactive|background/)) {
      if (sparkScanViewRef.current) {
        sparkScanViewRef.current.stopScanning();
      }
    } else {
      checkCameraPermissions();
    }
  };

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
      didScan: (_: any, session: SparkScanSession) => {
        const barcode = session.newlyRecognizedBarcodes[0];

        if (isValidBarcode(barcode)) {
          console.info(`New barcode scanned = ${barcode.data}`);
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
          'This code should not have been scanned',
          60 * 1000,
          Color.fromHex('#FF0000'),
          new Brush(Color.fromHex('#FF0000'), Color.fromHex('#FF0000'), 1),
        );
      }
    },
  };

  const handleClearButtonClick = () => {
    setCodes([]);
  };

  return (
    // @ts-ignore
    cameraPermissions &&
    sparkScanMode && (
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
        <SafeAreaView style={styles.container}>
          <Text style={styles.scanCount}>
            {codes.length}{' '}
            {codes.length === 0 || codes.length > 1 ? 'items' : 'item'}
          </Text>
          <ScrollView style={styles.splitViewResults}>
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
            onPress={handleClearButtonClick}>
            <Text style={styles.clearButtonText}>CLEAR LIST</Text>
          </Pressable>
        </SafeAreaView>
      </SparkScanView>
    )
  );
};
