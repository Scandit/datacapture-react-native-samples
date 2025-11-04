import React, { useContext } from 'react';
import { Pressable, ScrollView, Text, View, BackHandler, Image } from 'react-native';
import { styles } from './styles';
import { RootStackParamList } from './App';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AppContext from './AppContext';
import { HeaderBackButton } from '@react-navigation/elements';
import { PRODUCT_MAPPER, productsToPick } from './ScanPage';

const SuccessIcon = require('../assets/success.png');
const WarningIcon = require('../assets/warning.png');

type ResultsPageNavigationProp = StackNavigationProp<RootStackParamList>;

export const ResultsPage = () => {
  const navigation = useNavigation<ResultsPageNavigationProp>();

  const { allCodes, setAllCodes, pickedCodes, setPickedCodes } = useContext(AppContext);

  const handleBackNavigation = React.useCallback(
    (resetCodes?: boolean) => {
      // On finishing the session we want to reset the state of the app.
      if (resetCodes) {
        setAllCodes([]);
        setPickedCodes([]);

        // Reset navigation state to the initial screen.
        navigation.reset({
          index: 0,
          routes: [{ name: 'Scanner' }],
        });
        return;
      }
      navigation.goBack();
    },
    [navigation, setPickedCodes, setAllCodes],
  );

  React.useEffect(() => {
    navigation.setOptions({
      headerLeft: props => <HeaderBackButton {...props} onPress={handleBackNavigation} />,
    });
  }, [navigation, handleBackNavigation]);

  useFocusEffect(
    React.useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        handleBackNavigation();
        return true;
      });
      return () => subscription.remove();
    }, [handleBackNavigation]),
  );

  const handleContinueButtonClicked = () => {
    handleBackNavigation();
  };

  const handleFinishButtonClicked = () => {
    handleBackNavigation(true);
  };

  const inventory = allCodes.filter(c => !pickedCodes.includes(c));

  // Create a map of products to pick with their quantities.
  const productsMap = new Map<string, number>();
  productsToPick.forEach(product => {
    productsMap.set(product.identifier, product.quantityToPick);
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.splitViewResults}>
        {pickedCodes.map((result, index) => {
          const productIdentifier = PRODUCT_MAPPER[result];
          const isInPickList = productsToPick.some(p => p.identifier === productIdentifier);
          const quantityToPick = productIdentifier ? productsMap.get(productIdentifier) : undefined;

          // Only show the success icon if the item is in the pick list and there are items that haven't been picked yet.
          let icon;
          if (quantityToPick && quantityToPick > 0) {
            productsMap.set(productIdentifier!, quantityToPick - 1);
            icon = SuccessIcon;
          }

          return (
            <ListItem
              key={index}
              data={result}
              errorMsg={!isInPickList ? 'Picked item not in pick list' : undefined}
              icon={!isInPickList ? WarningIcon : icon}
            />
          );
        })}
        <View style={styles.scanCountContainer}>
          <Text style={styles.scanCount}>{`Inventory (${inventory.length})`}</Text>
        </View>
        {inventory.map((result, index) => (
          <ListItem key={index} data={result} />
        ))}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <Pressable style={styles.blackButton} onPress={handleContinueButtonClicked}>
          <Text style={styles.blackButtonText}>CONTINUE SCANNING</Text>
        </Pressable>

        <Pressable style={styles.clearButton} onPress={handleFinishButtonClicked}>
          <Text style={styles.clearButtonText}>FINISH</Text>
        </Pressable>
      </View>
    </View>
  );
};

const ListItem = ({ data, errorMsg, icon }: { data: string; errorMsg?: string; icon?: any }) => {
  const item = PRODUCT_MAPPER[data];
  return (
    <View style={styles.splitViewResult}>
      <View style={styles.splitViewImage} />
      <View style={styles.splitViewResultBarcodeData}>
        <Text style={styles.splitViewResultData}>{item ? item : 'Unknown'}</Text>
        <Text style={styles.splitViewResultSymbology}>{`GTIN: ${data}`}</Text>
        {errorMsg && <Text style={styles.splitViewResultError}>{errorMsg}</Text>}
      </View>
      {icon && <Image style={styles.splitViewIcon} source={icon} />}
    </View>
  );
};
