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

  buttonContainer: {
    backgroundColor: 'transparent',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12,
    display: 'flex',
    alignItems: 'center',
    alignSelf: 'stretch'
  },

  button: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    height: 42,
    width: '90%',
    maxHeight: 42,
    backgroundColor: '#2EC1CE',
    borderColor: 'transparent',
    borderRadius: 5,
    bottom: 24,
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
