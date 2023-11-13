import { StatusBar, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },

  header: {
    fontSize: 14,
    textTransform: 'uppercase',
    marginTop: 30,
    marginBottom: 10,
    marginHorizontal: 16,
    color: 'darkgrey',
  },

  item: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomColor: 'lightgrey',
    borderBottomWidth: 1,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  }
});
