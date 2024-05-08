import React, { useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Search } from './Search';
import { Find } from './Find';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DataCaptureContext } from 'scandit-react-native-datacapture-core';
import { DCC } from './Context';
import { Barcode } from 'scandit-react-native-datacapture-barcode';

export type RootStackParamList = {
  Search: undefined;
  Find: { itemToFind: Barcode };
};

const Stack = createStackNavigator<RootStackParamList>();

export function App() {
  // Create data capture context using your license key.
  const dataCaptureContext = useMemo(() => {
    // There is a Scandit sample license key set below here.
    // This license key is enabled for sample evaluation only.
    // If you want to build your own application, get your license key
    // by signing up for a trial at https://ssl.scandit.com/dashboard/sign-up?p=test
    return DataCaptureContext.forLicenseKey(
      'AZ707AsCLmJWHbYO4RjqcVAEgAxmNGYcF3Ytg4RiKa/lWTQ3IXkfVZhSSi0yOzuabn9STRdnzTLybIiJVkVZU2QK5jeqbn1HGCGXQ+9lqsN8VUaTw1IeuHJo+9mYVdv3I1DhedtSy89aKA4QugKI5d9ykKaXGohXjlI+PB5ju8Tyc80FPAC3WP9D8oKBcWyemTLQjoUu0Nl3T7mVyFIXMPshQeYddkjMQ1sVV9Jcuf1CbI9riUJWzbNUb4NcB4MoV0BHuyALUPtuM2+cBkX3bPN0AxjD9WC7KflL2UrsZeenvl/aDx2yU4t5vsa2BImNTyEqdVs+rmrGUzRdbYvSUFzKBeiBncLAASqnexTuSzh9KfEm/cKrVlWekP+zOkrilICkn3KVNY6g9RQd8FrsHTBI9OBbMpC79BTwuzHcnlFUG5S3ru/viJ2+f9JEEejxDbdJ7u4JohfBuUYBSEBQ/XzEPMdpqWcmxHGWF4j7jQy83B9Wlgrhd8xNWKjgAViI0bcebjnB7o6yuKacXICH/lo787RhnXSjqjQhJBCbEvwxHQZiEfWPdVKtY7EM+x8HFr6j3orKllKOMJ9asZ5bJYz9aIHlOWeRGm90guQn0KWiPwuKbUOQIMxFAOem2zcSTt4OfqS6Ci0Y6lk7FIrgpbaz8L1PW64kkjrZB6FtQ8OppmsyZ/QTvrHYFQFTH7MpamDviRjEKMyiD2ID6ypl+Meeme6cZYRJVujr6b4tweQCsfNEYhuDiMJaWQ57R0n2XdF0zkepLVc0yA2Q3wWhxSIASLnv6GTCYYVnDJnkrr6VaTv8RVUOp8h8U34wGDanamQ+39+rESMD59E288OKgFvZZWN9Ltu/VQCcjYCYT1RTDcA9co3Y18aGpDxvtLVEGJ8QDPv1E//IYAYEhXqu8r9xbsx/hTwZmLpNKyXGPRr9+hpufTAcAj908f2kuQ=='
    );
  }, []);

  return (
    <SafeAreaProvider>
      <DCC.Provider value={dataCaptureContext}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName='Search'>
              <Stack.Screen
                name='Search'
                component={Search}
                options={{
                  title: 'SEARCH & FIND',
                  headerTitleAlign: 'center',
                  headerStyle: {
                    backgroundColor: 'black',
                  },
                  headerTintColor: 'white',
                  headerShadowVisible: false,
                }}
              />
              <Stack.Screen
                name='Find'
                component={Find}
                options={{
                  title: 'SEARCH & FIND',
                  headerTitleAlign: 'center',
                  headerStyle: {
                    backgroundColor: 'black',
                  },
                  headerTintColor: 'white',
                  headerShadowVisible: false,
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
      </DCC.Provider>
    </SafeAreaProvider>
  );
}
