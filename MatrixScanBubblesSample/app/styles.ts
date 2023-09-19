import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  dataCaptureView: {
    flex: 1,
  },
  toggleContainer: {
    backgroundColor: 'transparent',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12,
    display: 'flex',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  arBubbleContainer: {
    width: 200,
    height: 50,
    backgroundColor: '#FFFE',
    borderRadius: 25,
    flexDirection: 'row',
  },
  arBubbleContent: {
    width: 150,
    height: 50,
    justifyContent: 'center',
    paddingLeft: 10,
  },
  arBubbleHeader: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  arBubbleInfo: {
    fontSize: 12,
  },
  arBubbleImageContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#52C2B6',
    borderRadius: 25,
  },
  arBubbleImage: {
    width: 50,
    height: 50,
  },
});
