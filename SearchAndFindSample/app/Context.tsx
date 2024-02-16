import React from 'react';
import { DataCaptureContext } from 'scandit-react-native-datacapture-core';

export const DCC = React.createContext<DataCaptureContext | null>(null);
