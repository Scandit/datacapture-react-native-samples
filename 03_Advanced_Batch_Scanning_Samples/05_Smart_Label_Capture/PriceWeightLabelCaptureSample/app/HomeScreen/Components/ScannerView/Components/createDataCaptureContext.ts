import { DataCaptureContext } from "scandit-react-native-datacapture-core"

/**
 * Create dataCaptureContext with license key.
 */
export const createDataCaptureContext = () => {
  return DataCaptureContext
    .forLicenseKey("-- ENTER YOUR SCANDIT LICENSE KEY HERE --")
}
