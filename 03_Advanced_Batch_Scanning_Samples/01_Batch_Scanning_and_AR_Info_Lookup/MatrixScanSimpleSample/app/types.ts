import { Symbology } from 'scandit-react-native-datacapture-barcode';

// Define navigation types
export type RootStackParamList = {
  home: undefined;
  scan: undefined;
  results: {
    results: Record<string, { data: string; symbology: Symbology }>;
  };
};
