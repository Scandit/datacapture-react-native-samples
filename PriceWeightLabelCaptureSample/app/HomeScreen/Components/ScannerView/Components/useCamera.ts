import { useMemo } from "react"
import { Camera, DataCaptureContext, FrameSourceState } from "scandit-react-native-datacapture-core"
import { LabelCapture } from "scandit-react-native-datacapture-label"
import { requestCameraPermissionsIfNeeded } from "./cameraPermissionHandler"
import { BackHandler } from "react-native"

/**
 * Returns the cameraRef, asks permissions and turns it on.
 */
export  const useCamera = (dataCaptureContext: DataCaptureContext) => {
  return useMemo(
    () => {
      const camera = Camera.default!
      camera
        .applySettings(LabelCapture.recommendedCameraSettings)
        .then(() => {})
      dataCaptureContext
        .setFrameSource(camera)
        .then(() => {})
      requestCameraPermissionsIfNeeded()
        .then(() => camera.switchToDesiredState(FrameSourceState.On))
        .catch(() => BackHandler.exitApp())
      return camera
    },
    [dataCaptureContext]
  )
}
