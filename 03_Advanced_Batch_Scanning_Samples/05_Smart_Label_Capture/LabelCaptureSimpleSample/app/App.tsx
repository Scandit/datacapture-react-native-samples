import React, { useEffect, useMemo, useRef } from 'react';
import { Alert, AppState, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  Brush,
  Camera,
  Color,
  DataCaptureContext,
  DataCaptureView,
  FrameSourceState,
  TorchSwitchControl,
} from 'scandit-react-native-datacapture-core';
import {
  CustomBarcode,
  LabelCaptureSettings,
  LabelDefinition,
  UnitPriceText,
  WeightText,
  ExpiryDateText,
  LabelDateFormat,
  LabelDateComponentFormat,
  LabelCapture,
  LabelCaptureBasicOverlay,
  LabelCaptureBasicOverlayListener,
  LabelCaptureValidationFlowListener,
  LabelField,
} from 'scandit-react-native-datacapture-label';
import { requestCameraPermissionsIfNeeded } from './cameraPermissionHandler';
import { Symbology } from 'scandit-react-native-datacapture-barcode';
import { LabelCaptureValidationFlowOverlay } from 'scandit-react-native-datacapture-label';

// Enter your Scandit License key here.
// Your Scandit License key is available via your Scandit SDK web account.
const dataCaptureContext = DataCaptureContext.forLicenseKey('-- ENTER YOUR SCANDIT LICENSE KEY HERE --');

export default function App() {
  const dataCaptureViewRef = useRef<DataCaptureView | null>(null);
  const basicOverlayRef = useRef<LabelCaptureBasicOverlay | null>(null);
  const validationFlowRef = useRef<LabelCaptureValidationFlowOverlay | null>(null);
  const wasCameraOnBeforeBackground = useRef<boolean>(false);

  const cameraRef = useRef<Camera>(null!);
  if (!cameraRef.current) {
    const camera = Camera.withSettings(LabelCapture.createRecommendedCameraSettings());

    if (!camera) {
      throw new Error('No camera available');
    }

    dataCaptureContext.setFrameSource(camera);
    cameraRef.current = camera;
  }

  const labelCaptureRef = useRef<LabelCapture>(null!);
  if (!labelCaptureRef.current) {
    labelCaptureRef.current = setupLabelCapture();
  }

  useEffect(() => {
    async function requestPermissions() {
      await requestCameraPermissionsIfNeeded();
      await startScanning();
    }
    requestPermissions();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async nextAppState => {
      if (nextAppState === 'inactive' || nextAppState === 'background') {
        wasCameraOnBeforeBackground.current = (await cameraRef.current.getCurrentState()) === FrameSourceState.On;
      } else if (nextAppState === 'active') {
        if (wasCameraOnBeforeBackground.current) {
          await startScanning();
        }
      }
    });
    return () => {
      subscription.remove();
    };
  }, []);

  const basicOverlayListener = useMemo<LabelCaptureBasicOverlayListener>(
    () => ({
      brushForFieldOfLabel: (_, field) => {
        return getBrushForField(field);
      },
      brushForLabel() {
        const transparentColor = Color.fromRGBA(0, 0, 0, 0);
        return new Brush(transparentColor, transparentColor, 0);
      },
    }),
    [],
  );

  const validationFlowListener = useMemo<LabelCaptureValidationFlowListener>(
    () => ({
      didCaptureLabelWithFields(labelFields) {
        const formattedMessage = formatLabelFields(labelFields);

        Alert.alert('Label Captured', formattedMessage || 'No data captured', [
          {
            text: 'Continue Scanning',
            onPress: () => {
              cameraRef.current.switchToDesiredState(FrameSourceState.On);
              labelCaptureRef.current.isEnabled = true;
            },
          },
        ]);
      },
    }),
    [],
  );

  const startScanning = async () => {
    await cameraRef.current.switchToDesiredState(FrameSourceState.On);
    labelCaptureRef.current.isEnabled = true;
  };

  const stopScanning = async () => {
    await cameraRef.current.switchToDesiredState(FrameSourceState.Off);
    labelCaptureRef.current.isEnabled = false;
  };

  useEffect(() => {
    if (!basicOverlayRef.current) return;

    const basicOverlay = basicOverlayRef.current!;
    basicOverlay.listener = basicOverlayListener;

    return () => {
      basicOverlay.listener = null;
    };
  }, [basicOverlayListener]);

  useEffect(() => {
    if (!validationFlowRef.current) return;

    const validationFlow = validationFlowRef.current!;
    validationFlow.listener = validationFlowListener;

    return () => {
      validationFlow.listener = null;
    };
  }, [validationFlowListener]);

  return (
    <SafeAreaProvider>
      <SafeAreaView mode={'margin'} style={styles.safeAreaView}>
        <View style={styles.container}>
          <DataCaptureView
            style={styles.dataCaptureView}
            context={dataCaptureContext}
            ref={newView => {
              if (dataCaptureViewRef.current || newView === null) return;

              dataCaptureViewRef.current = newView;

              const basicOverlay = new LabelCaptureBasicOverlay(labelCaptureRef.current);

              basicOverlay.listener = basicOverlayListener;
              basicOverlayRef.current = basicOverlay;
              newView.addOverlay(basicOverlay);

              const validationFlow = new LabelCaptureValidationFlowOverlay(labelCaptureRef.current);
              validationFlow.listener = validationFlowListener;
              validationFlowRef.current = validationFlow;

              newView.addOverlay(validationFlow);

              const torchControl = new TorchSwitchControl();
              newView.addControl(torchControl);
            }}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeAreaView: {
    flex: 1,
  },
  dataCaptureView: {
    flex: 1,
  },
});

function setupLabelCapture() {
  const customBarcode = CustomBarcode.initWithNameAndSymbologies('barcode', [
    Symbology.EAN13UPCA,
    Symbology.GS1DatabarLimited,
    Symbology.Code128,
  ]);
  customBarcode.optional = false;

  const expiryDateText = new ExpiryDateText('value:expiry_date');
  expiryDateText.labelDateFormat = new LabelDateFormat(LabelDateComponentFormat.MDY, false);
  expiryDateText.optional = true;

  const unitPriceText = new UnitPriceText('value:unit_price');
  unitPriceText.optional = true;

  const weightText = new WeightText('value:weight');
  weightText.optional = true;

  const label = new LabelDefinition('weighted_item');
  label.fields = [customBarcode, expiryDateText, unitPriceText, weightText];

  // You can customize the label definition to adapt it to your use-case.
  // For example, you can use the following label definition for Smart Devices box Scanning.
  //
  // const customBarcode = CustomBarcode.initWithNameAndSymbologies('custom_barcode', [
  //   Symbology.EAN13UPCA,
  //   Symbology.Code128,
  //   Symbology.Code39,
  //   Symbology.InterleavedTwoOfFive,
  // ]);
  // customBarcode.optional = false;
  //
  // const imeiOne = ImeiOneBarcode.initWithNameAndSymbologies('imei_one', []);
  // imeiOne.optional = true;
  //
  // const imeiTwo = ImeiOneBarcode.initWithNameAndSymbologies('imei_two', []);
  // imeiTwo.optional = true;
  //
  // const serial = CustomBarcode.initWithNameAndSymbologies('serial', []);
  // serial.optional = true;
  //
  // const labelDefinition = new LabelDefinition('imei_label');
  // labelDefinition.fields = [customBarcode2, imeiOne, imeiTwo, serial];
  //
  // const settings = LabelCaptureSettings.settingsFromLabelDefinitions([labelDefinition], {})!;

  const settings = LabelCaptureSettings.settingsFromLabelDefinitions([label], {});

  const labelCapture = new LabelCapture(settings);

  dataCaptureContext.setMode(labelCapture);

  return labelCapture;
}

function capitalize(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatLabelFields(labelFields: LabelField[]): string {
  return labelFields
    .map(field => {
      if (field.type === 'barcode') {
        const barcodeData = field.barcode?.data || field.text || 'N/A';
        return `${capitalize(field.name)}: ${barcodeData}`;
      }
      if (field.type === 'text') {
        const date = field.asDate();
        if (date) {
          return `Expiry Date: ${date.day?.toString()} - ${date.month?.toString()} - ${date.year?.toString()}`;
        }
        let fieldName = field.name;
        if (fieldName === 'value:unit_price') {
          fieldName = 'Unit Price';
        } else if (fieldName === 'value:weight') {
          fieldName = 'Weight';
        }
        return `${capitalize(fieldName)}: ${field.text}`;
      }
      return `${field.name}: ${field.text || 'N/A'}`;
    })
    .filter(item => item !== undefined)
    .join('\n');
}

const upcBrushColor = Color.fromHex('#FF2EC1CE');
const expiryDateBrushColor = Color.fromHex('#FFFA4446');
const weightBrushColor = Color.fromHex('#FFFBC02C');
const unitPriceBrushColor = Color.fromHex('#FF0A3390');
const upcBrush = new Brush(upcBrushColor.withAlpha(128), upcBrushColor, 1);
const expiryDateBrush = new Brush(expiryDateBrushColor.withAlpha(128), expiryDateBrushColor, 1);
const weightBrush = new Brush(weightBrushColor.withAlpha(128), weightBrushColor, 1);
const unitPriceBrush = new Brush(unitPriceBrushColor.withAlpha(128), unitPriceBrushColor, 1);

function getBrushForField(field: LabelField): Brush {
  if (field.name === 'value:unit_price') {
    return unitPriceBrush;
  }
  if (field.name === 'value:weight') {
    return weightBrush;
  }
  if (field.name === 'value:expiry_date') {
    return expiryDateBrush;
  }
  return upcBrush;
}
