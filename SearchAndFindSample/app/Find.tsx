import { useContext, useEffect, useRef, useState } from 'react';
import {
  Barcode,
  BarcodeFind,
  BarcodeFindItem,
  BarcodeFindItemContent,
  BarcodeFindItemSearchOptions,
  BarcodeFindSettings,
  BarcodeFindView,
  BarcodeFindViewSettings,
  BarcodeFindViewUiListener,
  Symbology
} from 'scandit-react-native-datacapture-barcode';
import {
  Color,
  VideoResolution,
} from 'scandit-react-native-datacapture-core';
import { StackScreenProps } from '@react-navigation/stack';

import { DCC } from './Context';
import { RootStackParamList } from './App';

type Props = StackScreenProps<RootStackParamList, 'Find'>;

export const Find = ({ route, navigation }: Props) => {
  const viewRef = useRef<BarcodeFindView | null>(null);
  const barcodeFindViewUiListenerRef = useRef<BarcodeFindViewUiListener | null>(null);

  const dataCaptureContext = useContext(DCC)!;

  const [barcodeFindMode, setBarcodeFindMode] = useState<BarcodeFind | null>(null);
  const { itemToFind } = route.params;

  useEffect(() => {
    dataCaptureContext.removeAllModes();
    setupScanning();
  }, []);

  const setupScanning = () => {
    // Use the world-facing (back) camera and set it as the frame source of the context. The camera is off by
    // default and must be turned on to start streaming frames to the data capture context for recognition.
    const cameraSettings = BarcodeFind.recommendedCameraSettings;
    cameraSettings.preferredResolution = VideoResolution.FullHD;

    // The barcode find process is configured through barcode find settings
    // and are then applied to the barcode find instance that manages barcode find.
    let settings = new BarcodeFindSettings();

    // This time, we enable only the symbology of the item to find, limiting our search space.
    settings.enableSymbology(itemToFind.symbology, true)

    // Create new barcode capture mode with the settings from above.
    const barcodeFind = BarcodeFind.forContext(dataCaptureContext, settings);

    // This method is called when the user presses the finish button.
    // The foundItems parameter contains the list of items found in the entire session.
    barcodeFindViewUiListenerRef.current = {
      didTapFinishButton: (_: BarcodeFindItem[]) => {
        navigation.goBack();
      },
    }

    // Set the list of items to find.
    const itemList = [new BarcodeFindItem(
      new BarcodeFindItemSearchOptions(itemToFind.data!),
      new BarcodeFindItemContent('Example item')
    )];
    barcodeFind.setItemList(itemList);

    setBarcodeFindMode(barcodeFind);
  };

  return (
    barcodeFindMode && (
      <BarcodeFindView
        style={{ flex: 1 }}
        context={dataCaptureContext}
        barcodeFind={barcodeFindMode}
        ref={view => {
          if (view) {
            view.barcodeFindViewUiListener = barcodeFindViewUiListenerRef.current;
            view.startSearching();
            viewRef.current = view;
          }
        }}
      />
    )
  );
};
