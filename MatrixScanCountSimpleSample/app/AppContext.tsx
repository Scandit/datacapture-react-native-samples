import { createContext, Dispatch, SetStateAction } from 'react';

export interface Code {
  data: string | null;
  symbology: string | null;
}

export interface Flag {
  shouldClearBarcodes: boolean;
  shouldResetBarcodeCount: boolean;
}

export interface AppContextProps {
  codes: Code[];
  flags: Flag;
  setCodes: Dispatch<SetStateAction<Code[]>>;
  setFlags: Dispatch<SetStateAction<Flag>>;
}

const AppContext = createContext<AppContextProps>({
  codes: [],
  flags: { shouldClearBarcodes: false, shouldResetBarcodeCount: false },
  setCodes: () => {},
  setFlags: () => {},
});

export default AppContext;
