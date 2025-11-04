import { DataCaptureContext } from "scandit-react-native-datacapture-core";

// Enter your Scandit License key here.
// Your Scandit License key is available via your Scandit SDK web account.
DataCaptureContext.initialize("-- ENTER YOUR SCANDIT LICENSE KEY HERE --");

export default DataCaptureContext.sharedInstance;
