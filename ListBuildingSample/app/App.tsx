import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, ScrollView, Text, Pressable, AppState, BackHandler, SafeAreaView, AppStateStatus
} from 'react-native';

import { DataCaptureContext } from 'scandit-react-native-datacapture-core';
import {
  SparkScan,
  SparkScanSettings,
  SparkScanView,
  SparkScanViewSettings,
  SparkScanViewSuccessFeedback,
  SparkScanViewErrorFeedback,
  Symbology,
  SymbologyDescription,
  SparkScanSession,
  Barcode
} from 'scandit-react-native-datacapture-barcode';

import { styles } from './styles';
import { requestCameraPermissionsIfNeeded } from './camera-permission-handler';

export const App = () => {
  const [codes, setCodes] = useState<{ data: string | null; symbology: string }[]>([]);
  const [cameraPermissions, setCameraPermissions] = useState(false);

  const dataCaptureContext = useMemo(() => {
      // There is a Scandit sample license key set below here.
	    // This license key is enabled for sample evaluation only.
	    // If you want to build your own application, get your license key by signing up for a trial at https://ssl.scandit.com/dashboard/sign-up?p=test
    return DataCaptureContext.forLicenseKey('AfUkdmKlRiP5FdlOFQnOhu4V3j5LFKttPGTWXFd7CkuRaTAstDqq78RrBm2ZG9LRu1T8CNgP6oLScGrUoEwfmP1TUXonIGCl2g9Fo5NYtmK/aEV8FX/YcdRKfWS5bJrTcWGDHdcsJxT6Me5C3RMdWZkdqeR5GEjDzT6dO4ZPWOBbNLjpkgZ0/MjtYQPKqSV+bSZC7+ekFaXovSKWfXV89BXtta/6sZHFJOMKxyvzh6zw5yA+NDR67OXoWKCrrNq4AOuBlt1ZelIHCqjQgTy/SZG110eJr5e4pth38Bx0fXE8FGX92BoxwJr1EG+P5CEJF8EFMy2zf87aJQYuzHmg0nM7czcNqLUd9F23uxntZYjKlwgWmmSzev/ozaumEvbW9RVW1bUQmV8pQ1SWILBuzQPeAw8iWOWgnTH18tH7cT+fUJumvM2rn7LWx9JYLAKBKRuwe2sDh3l5eqobZKdarIRsKVgXa4pw+gkYKuplzTo+Bzh70rbmtgq3IJ8hSpdoZITzfUQSwXkrgdQa5Cmrpxz9gXManBRt01h3eFXG7znZU9w0+uzzV/b5e6MQcPncODrCQOq0kfEBYgRoLAwVCOKnxyWQkqRbUpsTN2wy2MTg10flYhR/zf1eXdiUjgPUhWj8LtmgxJELYky7uMu46abfCkAw73e+12iJmlf9/tmTFk34La9ZQiF/BYps5h327ZW8qobay+Esx1i9dsaFKYt/nCN8jZdUYD/df+/vApyK4PMbph9EPRe5u0alg8BqpEExnkQsy1W7r85yngO/rxSXsY6rTMoTXb/87ul8uQnsrD41ZLtFdzo0OlbNTeNOI1mJz/E6/SOLbRRK');
  }, []);

  const [sparkScanMode, setSparkScanMode] = useState<SparkScan | null>(null);
  const sparkScanViewRef = useRef<SparkScanView | null>(null);

  useEffect(() => {
    const handleAppStateChangeSubscription = AppState.addEventListener('change', handleAppStateChange);
    checkCameraPermissions();
    setupScanning();

    return () => {
      handleAppStateChangeSubscription.remove();
      dataCaptureContext.dispose();
    }
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
  }

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
    const symbologySettings =
      sparkScanSettings.settingsForSymbology(Symbology.Code39);

    symbologySettings.activeSymbolCounts = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

    // Create the spark scan instance.
    // Spark scan will automatically apply and maintain the optimal camera settings.
    const sparkScan = SparkScan.forSettings(sparkScanSettings);

    // Register a listener to get informed whenever a new barcode is scanned.
    const sparkScanListener = {
      didScan: (_: any, session: SparkScanSession) => {
        const barcode = session.newlyRecognizedBarcodes[0];

        if (isValidBarcode(barcode)) {
          // Emit success feedback
          sparkScanViewRef.current?.emitFeedback(new SparkScanViewSuccessFeedback(null));

          const symbology = new SymbologyDescription(barcode.symbology);

          setCodes((prevCodes) => [
            ...prevCodes,
            {
              data: barcode.data,
              symbology: symbology.readableName,
            }
          ]);
        } else {
          // Show an error feedback and automatically resume scanning after 60 seconds
          sparkScanViewRef.current?.emitFeedback(new SparkScanViewErrorFeedback('This code should not have been scanned', 60 * 1000, null, null));
        }
      }
    };

    // Add the listener to the spark scan mode.
    sparkScan.addListener(sparkScanListener);

    setSparkScanMode(sparkScan);
  };

  const isValidBarcode = (barcode: Barcode) => {
    return barcode.data != null && barcode.data !== '123456789';
  };

  const handleClearButtonClick = () => {
    setCodes([]);
  };

  return (
    // @ts-ignore
    (cameraPermissions && sparkScanMode) && <SparkScanView
      style={styles.sparkScanView}
      context={dataCaptureContext}
      sparkScan={sparkScanMode!}
      sparkScanViewSettings={new SparkScanViewSettings()}
      ref={view => {
        sparkScanViewRef.current = view;
      // @ts-ignore
      }} >

      <SafeAreaView style={styles.container}>

        <Text style={styles.scanCount}>{codes.length} {codes.length === 0 || codes.length > 1 ? 'items' : 'item'}</Text>
        <ScrollView style={styles.splitViewResults} >
          {
            codes.map((result, index) =>
              <View key={index} style={styles.splitViewResult}>
                <View style={styles.splitViewImage} />
                <View key={index} style={styles.splitViewResultBarcodeData}>
                  <Text style={styles.splitViewResultData}>{result.data}</Text>
                  <Text style={styles.splitViewResultSymbology}>{result.symbology}</Text>
                </View>

              </View>)
          }
        </ScrollView>

        <Pressable style={styles.clearButton} onPress={handleClearButtonClick}>
          <Text style={styles.clearButtonText}>CLEAR LIST</Text>
        </Pressable>

      </SafeAreaView>
    </SparkScanView>
  );
}
