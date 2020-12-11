import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  listContainer: {
    flex: 1,
    alignSelf: 'stretch',
    marginBottom: 68,
  },

  button: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    height: 42,
    maxHeight: 42,
    backgroundColor: '#2EC1CE',
    borderColor: 'transparent',
    borderRadius: 5,
    position: 'absolute',
    bottom: 75,
    left: 24,
    right: 24,
  },

  buttonText: {
    fontSize: 14,
    lineHeight: 42,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: 'white',
    textAlign: 'center',
  },

  result: {
    alignSelf: 'stretch',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderColor: 'transparent',
    borderBottomColor: 'lightgrey',
    borderWidth: 1,
    borderStyle: 'solid',
  },

  resultData: {
    fontSize: 16,
  },

  resultSymbology: {
    color: '#2EC1CE',
    fontSize: 12,
  }
});
