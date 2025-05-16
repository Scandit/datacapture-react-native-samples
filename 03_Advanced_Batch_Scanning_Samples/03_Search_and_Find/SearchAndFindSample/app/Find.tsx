import { useContext, useEffect, useRef, useState } from 'react';
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
import { DataCaptureContext } from 'scandit-react-native-datacapture-core';

type Props = StackScreenProps<RootStackParamList, 'Find'>;

export const Find = ({ route, navigation }: Props) => {
  const viewRef = useRef<BarcodeFindView | null>(null);
  const barcodeFindViewUiListenerRef = useRef<BarcodeFindViewUiListener | null>(
    null
  );

  const [barcodeFindMode, setBarcodeFindMode] = useState<BarcodeFind | null>(
    null
  );
  const { itemToFind } = route.params;
  const [isViewVisible, setIsViewVisible] = useState<boolean>(true);

  useEffect(() => {
    DataCaptureContext.sharedInstance.removeAllModes();
    setupScanning();

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      navigateBack
    );

    return () => backHandler.remove();
  }, []);

  const setupScanning = () => {
    // The barcode find process is configured through barcode find settings
    // and are then applied to the barcode find instance that manages barcode find.
    let settings = new BarcodeFindSettings();

    // This time, we enable only the symbology of the item to find, limiting our search space.
    settings.enableSymbology(itemToFind.symbology, true);

    // Create new barcode capture mode with the settings from above.
    const barcodeFind = BarcodeFind.forContext(DataCaptureContext.sharedInstance, settings);

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
        new BarcodeFindItemSearchOptions(itemToFind.data!),
        new BarcodeFindItemContent('Example item')
      ),
    ];
    barcodeFind.setItemList(itemList);

    setBarcodeFindMode(barcodeFind);
  };

  const navigateBack = () => {
    setIsViewVisible(false);
    // Workaround to give some time to the navigator to properly pop up the native view from the stack
    setTimeout(() => {
      navigation.goBack();
    }, 500);
    return true;
  };

  return (
    barcodeFindMode &&
    isViewVisible && (
      <BarcodeFindView
        style={{ flex: 1 }}
        context={DataCaptureContext.sharedInstance}
        barcodeFind={barcodeFindMode}
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
