import React from "react"
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native"
import { Colors } from "../../../Resources/Colors"

type Props = {
  readonly style?: StyleProp<ViewStyle>
  readonly children: string
  readonly isOpaque: boolean
  readonly onPress: () => void
}

export const HomeButton = (props: Props) => {
  const { style, children, isOpaque, onPress } = props

  const getFontColor = () => (
    isOpaque ? Colors.white : Colors.black900
  )

  const getBackgroundColor = () => (
    isOpaque ? Colors.black900 : Colors.grey200
  )

  return (
    <View style={style}>
      <TouchableOpacity
        style={[
          styles.touchableOpacity,
          { backgroundColor: getBackgroundColor() }
        ]}
        onPress={onPress}>
        <Text
          style={[
            styles.text,
            { color: getFontColor() }
          ]}
        >
          {children}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  touchableOpacity: {
    borderRadius: 13,
    padding: 18
  },
  text: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600"
  }
})
