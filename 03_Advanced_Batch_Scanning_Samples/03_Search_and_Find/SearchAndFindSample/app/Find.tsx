import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  BarcodeFind,
  BarcodeFindItem,
  BarcodeFindItemContent,
  BarcodeFindItemSearchOptions,
  BarcodeFindSettings,
  BarcodeFindView,
  BarcodeFindViewUiListener,
} from 'scandit-react-native-datacapture-barcode';
import { StackScreenProps } from '@react-navigation/stack';

import { RootStackParamList } from './App';
import { BackHandler } from 'react-native';
import dataCaptureContext from './CaptureContext';
import { useFocusEffect } from '@react-navigation/native';

type Props = StackScreenProps<RootStackParamList, 'Find'>;

export const Find = ({ route, navigation }: Props) => {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
    });
  }, [navigation]);

  const viewRef = useRef<BarcodeFindView | null>(null);
  const barcodeFindViewUiListenerRef = useRef<BarcodeFindViewUiListener | null>(
    null
  );

  const barcodeFindMode = useRef<BarcodeFind>(null!);
  if (!barcodeFindMode.current) {
    barcodeFindMode.current = setupScanning();
  }

  const [isViewVisible, setIsViewVisible] = useState<boolean>(true);

  useFocusEffect(
    useCallback(() => {
      if (!barcodeFindMode.current) {
        barcodeFindMode.current = setupScanning();
      }
      return () => {
        dataCaptureContext.removeMode(barcodeFindMode.current);
      }
    }, [])
  );

  useEffect(() => {
    dataCaptureContext.removeAllModes();
    barcodeFindMode.current = setupScanning();

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      navigateBack
    );

    return () => backHandler.remove();
  }, []);

  function setupScanning(): BarcodeFind {
    // The barcode find process is configured through barcode find settings
    // and are then applied to the barcode find instance that manages barcode find.
    let settings = new BarcodeFindSettings();

    // This time, we enable only the symbology of the item to find, limiting our search space.
    settings.enableSymbology(route.params.itemToFind.symbology, true);

    // Create new barcode capture mode with the settings from above.
    const barcodeFind = new BarcodeFind(settings);

    // This method is called when the user presses the finish button.
    // The foundItems parameter contains the list of items found in the entire session.
    barcodeFindViewUiListenerRef.current = {
      didTapFinishButton: (_: BarcodeFindItem[]) => {
        navigateBack();
      },
    };

    // Set the list of items to find.
    const itemList = [
      new BarcodeFindItem(
        new BarcodeFindItemSearchOptions(route.params.itemToFind.data!)
      ),
    ];
    barcodeFind.setItemList(itemList);

    // Set the barcode find mode to the data capture context.
    dataCaptureContext.setMode(barcodeFind);

    return barcodeFind;
  }

  const navigateBack = () => {
    setIsViewVisible(false);
    // Workaround to give some time to the navigator to properly pop up the native view from the stack
    setTimeout(() => {
      navigation.goBack();
    }, 500);
    return true;
  };

  return (
    barcodeFindMode.current &&
    isViewVisible && (
      <BarcodeFindView
        style={{ flex: 1 }}
        context={dataCaptureContext}
        barcodeFind={barcodeFindMode.current}
        ref={(view) => {
          if (view) {
            view.barcodeFindViewUiListener =
              barcodeFindViewUiListenerRef.current;
            view.startSearching();
            viewRef.current = view;
          }
        }}
      />
    )
  );
};
