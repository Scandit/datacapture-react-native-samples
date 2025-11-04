import { DataCaptureContext } from "scandit-react-native-datacapture-core";

// Enter your Scandit License key here.
// Your Scandit License key is available via your Scandit SDK web account.
const licenseKey = "-- ENTER YOUR SCANDIT LICENSE KEY HERE --";

DataCaptureContext.initialize(licenseKey);

export default DataCaptureContext.sharedInstance;
