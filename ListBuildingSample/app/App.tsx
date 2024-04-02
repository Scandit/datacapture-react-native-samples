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
      'Aa2k0xbKMtvDJWNgLU02Cr8aLxUjNtOuqXCjHUxVAUf/d66Y5Tm74sJ+8L0rGQUZ20e52VlMY9I7YW4W13kWbvp36R8jbqQy6yZUGS50G5n4fRItJD6525RcbTYZQjoIGHQqle9jj08ra19ZUy9RliVlOn3hHz4WrGO8vORyATmFXJpULzk0I5RpiT84ckXhG2Ri8jtIzoISX3zsoiLtXVRGjjrkbuGZzGbKA180JKEpdfSQwVyupLti5yNYHAeKihS6IOklCTz8CM1BfRC4zBdIDjbVEJPFgAsLvMU0rTyJhHkB5Ds4wfHbKNFhW0T2XkYLKkvZ7X/HnEVD5oz9Kl4T4rtRkepJfsXUWHUgVugjLO5vqwhMcHNV5XpK2Pk/SLrzGF1PDRu8f4ZhBLrWKknWq+5TSK8GWi4wmGpVvbxqHhLljzOzplYs8I5TtphZ3otJNLs10lhk1YN9cmdaxpdUuF4k0WDU1Qfco75p5G+MBlsAVVFrs0xMF9fSMJkQ+4UU+G+py5781HPkpw4kaGwmJhGrzA/Lbhf4tL+XfynseLw42oygpfVabYEYRHSQx+1j5RpFSR6V9t4jlKsJu2xgYz0A96I82gIHItRRxZkT2oEsZCgYlgCiQsFcsFdo9N9bzDL9mVR5Nj0RPIVvKc01AVtKvXLx86g2rNPv45eBaJFrdsWmv97V8+Pv6M9d+Wr1qcTeT1BY8fvWUEDmU1HF6eCJ1A6cDAM+Nq4sAP9D2lH7D6rHwK+x07F56bMZibLeDoGKanE8PhhamhxBVemE/ByCoMoItBtSbpeBubHVsSHlGF3/AAKi6flY6j0htptgPOM8eOwGXx6YvVxu3KOMF+2RBIQai8LP0YEuhVJ0ST7WX5seeVSu5RMKUx/euHoQB6qID+ydzkXGzYZLTPPskmJSWqrboJQPIjZ/ruCtJepZ/+Lr7g5nCyb01w==',
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
