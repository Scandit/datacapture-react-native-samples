import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CameraPosition, ScanditProvider } from 'scandit-react-native-datacapture-core';
import {
  CapturedId,
  DateResult,
  DriverLicense,
  FullDocumentScanner,
  IdCaptureAioView,
  IdCaptureRegion,
  IdCaptureScanner,
  IdCaptureSettings,
  IdCard,
  Passport,
  RejectionReason,
} from 'scandit-react-native-datacapture-id';

// The Id capturing process is configured through id capture settings, which the view applies to the
// id capture mode it manages internally.
const idCaptureSettings = setupIdCaptureSettings();

export const ScanPage = () => {
  const navigation = useNavigation();
  // Scanning pauses while a result dialog is shown, as no further frames should be processed until the
  // user dismissed it.
  const [isShowingResult, setIsShowingResult] = useState(false);
  const [cameraPosition, setCameraPosition] = useState(CameraPosition.WorldFacing);

  const showResult = (title: string, message: string) => {
    setIsShowingResult(true);
    Alert.alert(title, message, [{ text: 'OK', onPress: () => setIsShowingResult(false) }], { cancelable: false });
  };

  const switchCamera = () => {
    setCameraPosition(position =>
      position === CameraPosition.WorldFacing ? CameraPosition.UserFacing : CameraPosition.WorldFacing
    );
  };

  return (
    // A nested provider re-applies camera-wide props to the camera the root provider owns. Switching the
    // position recreates the camera; the view keeps scanning without any further handling.
    <ScanditProvider cameraPosition={cameraPosition}>
      <View style={styles.container}>
        <IdCaptureAioView
          style={styles.container}
          // Passing the navigation lets the view pause while this screen is not focused and resume on focus.
          navigation={navigation}
          idCaptureSettings={idCaptureSettings}
          disabled={isShowingResult}
          didCaptureId={capturedId => showResult('Result', descriptionForCapturedId(capturedId))}
          didRejectId={(rejectedId, reason) => showResult('Error', getRejectionReasonMessage(rejectedId, reason))}
        />
        <TouchableOpacity style={styles.switchCameraButton} onPress={switchCamera}>
          <Text style={styles.switchCameraText}>Switch camera</Text>
        </TouchableOpacity>
      </View>
    </ScanditProvider>
  );
};

function setupIdCaptureSettings(): IdCaptureSettings {
  const settings = new IdCaptureSettings();

  // Recognize national ID cards, driver's licenses and passports.
  settings.acceptedDocuments.push(
    new IdCard(IdCaptureRegion.Any),
    new DriverLicense(IdCaptureRegion.Any),
    new Passport(IdCaptureRegion.Any)
  );
  settings.scanner = new IdCaptureScanner(new FullDocumentScanner());

  // Expired documents are captured like any other unless this is set. Rejecting them routes
  // them to didRejectId, where an identity check can tell the holder why the document failed.
  settings.rejectExpiredIds = true;

  return settings;
}

const descriptionForCapturedId = (result: CapturedId) => {
  return `
    Full Name: ${result.fullName}
    Date of Birth: ${getDateAsString(result.dateOfBirth)}
    Date of Expiry: ${getDateAsString(result.dateOfExpiry)}
    Document Number: ${result.documentNumber || 'empty'}
    Nationality: ${result.nationality || 'empty'}`;
};

const getRejectionReasonMessage = (rejectedId: CapturedId | null, reason: RejectionReason) => {
  switch (reason) {
    case RejectionReason.NotAcceptedDocumentType:
      return 'Document not supported. Try scanning another document.';
    case RejectionReason.DocumentExpired:
      // A rejected document still carries the data that was read from it.
      return rejectedId?.dateOfExpiry
        ? `Document expired on ${getDateAsString(rejectedId.dateOfExpiry)}.`
        : 'Document has expired.';
    case RejectionReason.InvalidFormat:
      return 'Document format is not supported. Try scanning another document.';
    case RejectionReason.Timeout:
      return 'Document capture failed. Make sure the document is well lit and free of glare. Alternatively, try scanning another document';
    default:
      return `Document capture was rejected. Reason=${reason}`;
  }
};

const getDateAsString = (dateObject: DateResult | null) => {
  return dateObject
    ? new Date(Date.UTC(dateObject.year, dateObject.month - 1, dateObject.day)).toLocaleDateString('en-GB', {
        timeZone: 'UTC',
      })
    : 'empty';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  switchCameraButton: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: '#16191C',
    borderRadius: 8,
  },
  switchCameraText: {
    color: '#FFFFFF',
    fontFamily: 'Roboto',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.5,
  },
});
