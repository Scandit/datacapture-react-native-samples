import { PermissionsAndroid, Platform } from 'react-native';

const isAndroidMarshmallowOrNewer = Platform.OS === 'android' && Platform.Version >= 23

export const checkCameraPermissions = async () => {
  if (isAndroidMarshmallowOrNewer) {
    return await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
  } else {
    return true;
  }
}

export const requestCameraPermissions = async () => {
  if (isAndroidMarshmallowOrNewer) {
    try {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Android Camera Permission has been granted.");
        return Promise.resolve();
      } else {
        console.log("Android Camera Permission has been denied.");
        return Promise.reject()
      }
    } catch (err) {
      return Promise.reject(err)
    }
  } else {
    return Promise.resolve()
  }
}

export const requestCameraPermissionsIfNeeded = async () => {
  const hasPermissions = await checkCameraPermissions();
  if (!hasPermissions) {
    return requestCameraPermissions();
  } else {
    return Promise.resolve();;
  }
}
