import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  Camera,
  Color,
  DataCaptureContext,
  DataCaptureView,
  FrameSourceState,
} from 'scandit-react-native-datacapture-core';
import {
  CustomBarcode,
  LabelCaptureSettings,
  LabelDefinition,
  TotalPriceText,
  ExpiryDateText,
  LabelDateFormat,
  LabelDateComponentFormat,
  LabelCapture,
  LabelCaptureBasicOverlay,
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

  const [isResultModalVisible, setIsResultModalVisible] = useState(false);
  const [capturedLabelData, setCapturedLabelData] = useState<string>('');

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

  const validationFlowListener = useMemo<LabelCaptureValidationFlowListener>(
    () => ({
      didCaptureLabelWithFields(labelFields) {
        const formattedMessage = formatLabelFields(labelFields);
        setCapturedLabelData(formattedMessage || 'No data captured');
        setIsResultModalVisible(true);
      },
    }),
    [],
  );

  const handleContinueScanning = async () => {
    setIsResultModalVisible(false);
    await cameraRef.current.switchToDesiredState(FrameSourceState.On);
    labelCaptureRef.current.isEnabled = true;
  };

  const startScanning = async () => {
    await cameraRef.current.switchToDesiredState(FrameSourceState.On);
    labelCaptureRef.current.isEnabled = true;
  };

  useEffect(() => {
    if (!validationFlowRef.current) return;

    const validationFlow = validationFlowRef.current;
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
              basicOverlayRef.current = basicOverlay;
              newView.addOverlay(basicOverlay);

              const validationFlow = new LabelCaptureValidationFlowOverlay(labelCaptureRef.current);
              validationFlow.listener = validationFlowListener;
              validationFlowRef.current = validationFlow;

              newView.addOverlay(validationFlow);
            }}
          />

          <Modal
            animationType="fade"
            transparent={true}
            visible={isResultModalVisible}
            onRequestClose={() => setIsResultModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>LABEL CAPTURED</Text>
                <Text style={styles.modalMessage}>{capturedLabelData}</Text>
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={handleContinueScanning}>
                  <Text style={styles.continueButtonText}>CONTINUE SCANNING</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'left',
    width: '100%',
  },
  continueButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 4,
    width: '100%',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

function setupLabelCapture() {
  const customBarcode = CustomBarcode.initWithNameAndSymbologies('Barcode', [
    Symbology.EAN13UPCA,
    Symbology.GS1DatabarExpanded,
    Symbology.Code128,
  ]);
  customBarcode.optional = false;

  const expiryDateText = new ExpiryDateText('Expiry Date');
  expiryDateText.labelDateFormat = new LabelDateFormat(LabelDateComponentFormat.MDY, false);
  expiryDateText.optional = false;

  const totalPriceText = new TotalPriceText('Total Price');
  totalPriceText.optional = true;

  const label = new LabelDefinition('Retail Item');
  label.fields = [customBarcode, expiryDateText, totalPriceText];

  // You can customize the label definition to adapt it to your use-case.
  // For example, you can use the following label definition for Smart Devices box Scanning.
  //
  // const customBarcode = CustomBarcode.initWithNameAndSymbologies('Barcode', [
  //   Symbology.EAN13UPCA,
  //   Symbology.Code128,
  //   Symbology.Code39,
  //   Symbology.InterleavedTwoOfFive,
  // ]);
  // customBarcode.optional = false;
  //
  // const imeiOne = ImeiOneBarcode.initWithNameAndSymbologies('IMEI1', []);
  // imeiOne.optional = false;
  //
  // const imeiTwo = ImeiTwoBarcode.initWithNameAndSymbologies('IMEI2', []);
  // imeiTwo.optional = true;
  //
  // const serial = SerialNumberBarcode.initWithNameAndSymbologies('Serial Number', []);
  // serial.optional = true;
  //
  // const labelDefinition = new LabelDefinition('Smart Device');
  // labelDefinition.fields = [customBarcode, imeiOne, imeiTwo, serial];
  //
  // const settings = LabelCaptureSettings.settingsFromLabelDefinitions([labelDefinition], {});

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
        return `${field.name}: ${barcodeData}`;
      }
      if (field.type === 'text') {
        const date = field.asDate();
        if (date) {
          return `${field.name}: ${date.day?.toString()} - ${date.month?.toString()} - ${date.year?.toString()}`;
        }
        return `${field.name}: ${field.text}`;
      }
      return `${field.name}: ${field.text || 'N/A'}`;
    })
    .filter(item => item !== undefined)
    .join('\n');
}
