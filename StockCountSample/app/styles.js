import { StyleSheet } from 'react-native';

export const values = {
  // The card's minimum height.
  cardMinHeight: 125,
  // The header's height.
  headerHeight: 20,
  // Margins for card content - should match cardCornerRadius.
  marginInCard: 22,
  // Radius for the card's top corners.
  cardCornerRadius: 22,
  // Diameter for the <+> button which adds scanned codes to the list.
  barcodesButtonDiameter: 60,
  // Barcode result container height.
  barcodeResultContainerHeight: 56,
}

export const styles = StyleSheet.create({
  scanContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
    height: values.headerHeight,
    margin: values.marginInCard,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  clearButton: {
    fontSize: 20,
    fontWeight: "100",
    color: '#707070',
  },
  addBarcodesButton: {
    position: 'absolute',
    right: values.marginInCard,
    bottom: values.marginInCard,
    justifyContent: 'center',
    alignContent: 'center',
    borderRadius: 30,
    zIndex: 6,
    width: values.barcodesButtonDiameter,
    height: values.barcodesButtonDiameter,
  },
  addBarcodesButtonImage: {
    width: values.barcodesButtonDiameter,
    height: values.barcodesButtonDiameter,
  },
  cardStyle: {
    flex: 1,
    flexDirection: 'column',
    position: 'absolute',
    left: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 5,
    width: '100%',
    height: 250,
    minHeight: values.cardMinHeight,
    borderTopRightRadius: values.marginInCard,
    borderTopLeftRadius: values.marginInCard,
  },
  overlayStyle: {
    position: 'absolute',
    zIndex: 4,
    flex: 1,
    width: '100%',
    height: '100%',
    bottom: 0,
    left: 0,
  },
  containerStyle: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '100%',
    width: '100%',
    zIndex: 3,
  },
  resultsContainer: {
    overflow: 'scroll',
    height: 'auto'
  },
  result: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: values.marginInCard,
    marginTop: values.marginInCard,
    marginBottom: values.marginInCard,
    height: values.barcodeResultContainerHeight
  },
  resultImage: {
    width: values.barcodeResultContainerHeight,
    height: values.barcodeResultContainerHeight,
  },
  resultDataContainer: {
    marginLeft: 20,
    flexDirection: 'column',
  },
  resultData: {
    fontSize: 14,
    fontWeight: "200",
    color: '#707070',
  },
  resultSymbology: {
    fontSize: 16,
    lineHeight: 16,
    fontWeight: "600",
  },
  resultStockContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: 10,
    alignItems: 'center',
    flexDirection: 'row',
    color: '#707070',
  },
  resultStockCount: {
    fontSize: 14,
    lineHeight: 14,
    fontWeight: "200",
    color: '#707070',
    marginRight: 15,
  },
  resultStockCircle: {
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    width: 20,
    height: 20,
    marginRight: 15,
    borderRadius: 10,
    borderColor: '#707070',
    borderWidth: 1,
  },
  resultStockCircleText: {
    color: '#707070',
    fontSize: 12,
    lineHeight: 12,
    textAlign: 'center',
  }
});