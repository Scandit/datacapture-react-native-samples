import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sparkScanView: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  splitViewResults: {
    flex: 1,
    flexDirection: 'column',
  },
  splitViewImage: {
    height: 40,
    width: 40,
    backgroundColor: '#CDCDCD'
  },
  splitViewResult: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
    paddingLeft: 20,
    borderWidth: 0,
    borderBottomWidth: 0.2,
    borderBottomColor: 'f8fafc',
  },
  splitViewResultBarcodeData: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: 20,
  },
  splitViewResultData: {
    flex: 1,
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  splitViewResultSymbology: {
    flex: 1,
    color: '#000',
    fontSize: 11,
    fontStyle: 'italic'
  },
  clearButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 0,
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 2,
    marginStart: 30,
    marginEnd: 30,
    marginBottom: 10,
  },
  clearButtonText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'black',
  },
  scanCount: {
    color: '#000',
    fontSize: 13,
    lineHeight: 21,
    fontWeight: 'bold',
    paddingLeft:15,
  }
});
