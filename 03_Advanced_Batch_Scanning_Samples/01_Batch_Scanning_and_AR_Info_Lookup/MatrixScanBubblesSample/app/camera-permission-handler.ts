import { PermissionsAndroid, Platform } from 'react-native';


export const checkCameraPermissions = async () => {
  return await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
}

export const requestCameraPermissions = async () => {
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
}

export const requestCameraPermissionsIfNeeded = async () => {
  const hasPermissions = await checkCameraPermissions();
  if (!hasPermissions) {
    return requestCameraPermissions();
  } else {
    return Promise.resolve();;
  }
}
