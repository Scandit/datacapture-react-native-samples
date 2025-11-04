import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';

export const Button = (props: { disabled: boolean; styles: any; textStyles: any; title: string; onPress: () => void }) => {
  const Container = props.disabled ? View : TouchableOpacity;
  const styles = { ...props.styles, ...(props.disabled ? { backgroundColor: 'grey' } : {}) };

  return (
    <Container style={styles} onPress={props.onPress}>
      <Text style={props.textStyles}>{props.title}</Text>
    </Container>
  )
}
