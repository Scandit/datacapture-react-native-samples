import { createContext, Dispatch, SetStateAction } from 'react';

export interface AppContextProps {
  pickedCodes: string[];
  setPickedCodes: Dispatch<SetStateAction<string[]>>;
  allCodes: string[];
  setAllCodes: Dispatch<SetStateAction<string[]>>;
}

const AppContext = createContext<AppContextProps>({
  pickedCodes: [],
  setPickedCodes: () => {},
  allCodes: [],
  setAllCodes: () => {},
});

export default AppContext;
