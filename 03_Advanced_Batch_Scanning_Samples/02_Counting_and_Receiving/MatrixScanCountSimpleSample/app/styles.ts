import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  bottomContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  sparkScanView: {
    flex: 1,
  },
  splitViewResults: {
    flex: 1,
    flexDirection: 'column',
  },
  splitViewImage: {
    height: 48,
    width: 48,
    backgroundColor: '#F1F5F8',
  },
  splitViewResult: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    marginBottom: 4,
    backgroundColor: '#FFF',
  },
  splitViewResultBarcodeData: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: 16,
  },
  splitViewResultData: {
    flex: 1,
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  splitViewResultSymbology: {
    flex: 1,
    color: '#8795A1',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  clearButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 51,
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 2,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  blackButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    height: 51,
    backgroundColor: 'black',
    marginBottom: 16,
  },
  blackButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  scanCount: {
    color: '#3D4852',
    fontSize: 12,
    lineHeight: 21,
    paddingStart: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  scanCountContainer: {
    backgroundColor: 'white',
  },
});
