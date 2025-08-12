import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  BarcodePickSettings,
  BarcodePick,
  BarcodePickProduct,
  BarcodePickView,
  Symbology,
  BarcodePickViewSettings,
  BarcodePickActionCallback,
  BarcodePickAsyncMapperProductProvider,
  BarcodePickProductProviderCallbackItem,
  BarcodePickActionListener,
} from 'scandit-react-native-datacapture-barcode';
import { DataCaptureContext } from 'scandit-react-native-datacapture-core';
import { requestCameraPermissionsIfNeeded } from './camera-permission-handler';
import { RootStackParamList } from './App';
import { StackNavigationProp } from '@react-navigation/stack';
import { Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AppContext from './AppContext';

type ScanPageNavigationProp = StackNavigationProp<RootStackParamList>;

// Map product identifiers to product names.
// In a real application, this mapping would likely come from a backend service or database.
export const PRODUCT_MAPPER: Record<string, string | undefined> = {
  '8414792869912': 'Item A',
  '3714711193285': 'Item A',
  '4951107312342': 'Item A',
  '1520070879331': 'Item A',
  '1318890267144': 'Item B',
  '9866064348233': 'Item B',
  '4782150677788': 'Item B',
  '2371266523793': 'Item B',
  '5984430889778': 'Item C',
  '7611879254123': 'Item C',
};

// Define the products that should be picked.
// Same as above, in a real application this would likely come from a backend service or database.
export const productsToPick = [
  new BarcodePickProduct('Item A', 1),
  new BarcodePickProduct('Item B', 1),
  new BarcodePickProduct('Item C', 1),
];

export const ScanPage = () => {
  const navigation = useNavigation<ScanPageNavigationProp>();

  // We need to keep a reference to the old listeners so we can remove them
  // when the component re-renders and new functions are created.
  const listenerRef = useRef<BarcodePickActionListener | null>(null);

  const [dataCaptureContext, setDataCaptureContext] = useState<DataCaptureContext | null>(null);
  const [hasCameraPermissions, setHasCameraPermissions] = useState<boolean>(false);
  const [barcodePickView, setBarcodePickView] = useState<BarcodePickView | null>(null);

  const context = useContext(AppContext);
  const { pickedCodes, setPickedCodes, setAllCodes } = context;

  // When removed from the navigation stack, dispose the data capture context.
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      setDataCaptureContext(null);
    });
    return unsubscribe;
  }, [navigation, dataCaptureContext]);

  useEffect(() => {
    // Enter your Scandit License key here.
    // Your Scandit License key is available via your Scandit SDK web account.
    const ctx = DataCaptureContext.forLicenseKey('-- ENTER YOUR SCANDIT LICENSE KEY HERE --');
    setDataCaptureContext(ctx);
    () => {
      ctx.dispose();
      setDataCaptureContext(null);
    };
  }, [dataCaptureContext]);

  useEffect(() => {
    // Request camera permissions if not already granted.
    requestCameraPermissionsIfNeeded()
      .then(() => setHasCameraPermissions(true))
      .catch(() =>
        Alert.alert('Camera Permission Denied', 'Please enable camera permissions in your device settings.'),
      );
  }, [setHasCameraPermissions]);

  // Start and stop the barcode pick view when the component is focused or unfocused.
  useFocusEffect(
    useCallback(() => {
      if (hasCameraPermissions) {
        barcodePickView?.resume();
      }
      return () => {
        barcodePickView?.pause();
      };
    }, [barcodePickView, hasCameraPermissions]),
  );

  const handleFinishButtonClicked = (_view: BarcodePickView) => {
    navigation.navigate('Results');
  };

  const handlePicked = (data: string, callback: BarcodePickActionCallback) => {
    // Simulate a delay
    setTimeout(() => {
      setPickedCodes([...pickedCodes, data]);
      callback.onFinish(true);
    }, 500);
  };

  const handleUnpicked = (data: string, callback: BarcodePickActionCallback) => {
    setPickedCodes(pickedCodes.filter(c => c !== data));
    callback.onFinish(true);
  };

  // Remove the old listeners from the view if they exist.
  if (listenerRef.current && barcodePickView) {
    barcodePickView.removeActionListener(listenerRef.current);
    listenerRef.current = null;
  }

  // Create the new listeners and assign them to the ref.
  if (!listenerRef.current) {
    listenerRef.current = {
      didPickItem: handlePicked,
      didUnpickItem: handleUnpicked,
    };
  }

  const provider = new BarcodePickAsyncMapperProductProvider(productsToPick, {
    productIdentifierForItems: (itemData, callback) => {
      const result = itemData.map(item => {
        if (PRODUCT_MAPPER[item] !== undefined) {
          return new BarcodePickProductProviderCallbackItem(item, PRODUCT_MAPPER[item]!);
        }
        return new BarcodePickProductProviderCallbackItem(item, null);
      });
      callback.onData(result);
      // Remove duplicates and update the allCodes state.
      setAllCodes(prev => Array.from(new Set([...prev, ...itemData])));
    },
  });

  if (!dataCaptureContext || !hasCameraPermissions) {
    return null; // Ensure the context is ready and we have camera permissions before rendering the view
  }

  // The barcode capturing process is configured through barcode pick settings
  // and are then applied to the barcode pick instance that manages barcode recognition.
  const settings = new BarcodePickSettings();

  // The settings instance initially has all types of barcodes (symbologies) disabled. For the purpose of this
  // sample we enable a very generous set of symbologies. In your own app ensure that you only enable the
  // symbologies that your app requires as every additional enabled symbology has an impact on processing times.
  settings.enableSymbologies([
    Symbology.EAN13UPCA,
    Symbology.EAN8,
    Symbology.UPCE,
    Symbology.Code39,
    Symbology.Code128,
  ]);

  const barcodePick = new BarcodePick(dataCaptureContext, settings, provider);
  const viewSettings = new BarcodePickViewSettings();
  const cameraSettings = BarcodePick.recommendedCameraSettings;

  return (
    <BarcodePickView
      style={{ flex: 1 }}
      context={dataCaptureContext}
      barcodePick={barcodePick}
      cameraSettings={cameraSettings}
      settings={viewSettings}
      ref={view => {
        if (view) {
          // Set the listeners on the barcode pick view.
          if (!barcodePickView) {
            setBarcodePickView(view);
            view.start();
          }
          view.uiListener = {
            didTapFinishButton: handleFinishButtonClicked,
          };
          view.addActionListener(listenerRef.current!);
        }
      }}
    />
  );
};
