import { PermissionsAndroid, Platform } from 'react-native';

const isAndroidMarshmallowOrNewer = Platform.OS === 'android' && Platform.Version >= 23;

export const checkCameraPermissions = async () => {
  if (isAndroidMarshmallowOrNewer) {
    return await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
  } else {
    return true;
  }
};

export const requestCameraPermissions = async () => {
  if (isAndroidMarshmallowOrNewer) {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return;
    } else {
      throw new Error('Android Camera Permission has been denied.');
    }
  } else {
    return;
  }
};

export const requestCameraPermissionsIfNeeded = async () => {
  const hasPermissions = await checkCameraPermissions();
  if (!hasPermissions) {
    return requestCameraPermissions();
  } else {
    return;
  }
};
