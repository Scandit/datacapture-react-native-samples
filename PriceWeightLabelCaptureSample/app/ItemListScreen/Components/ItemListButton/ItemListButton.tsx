import React from "react"
import { StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { Colors } from "../../../Resources/Colors"

type Props = {
  readonly style?: StyleProp<ViewStyle>
  readonly textStyle?: StyleProp<TextStyle>
  readonly children: string
  readonly isOpaque: boolean
  readonly onPress: () => void
}

export const ItemListButton = (props: Props) => {
  const { style, textStyle, children, isOpaque, onPress } = props

  const getFontColor = () => (
    isOpaque ? Colors.white : Colors.black900
  )

  const getBackgroundColor = () => (
    isOpaque ? Colors.black900 : Colors.white
  )

  return (
    <View style={style}>
      <TouchableOpacity
        style={[
          styles.touchableOpacity,
          { backgroundColor: getBackgroundColor() }
        ]}
        onPress={onPress}
      >
        <Text
          style={[
            styles.text,
            { color: getFontColor() },
            textStyle
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
    backgroundColor: "yellow",
    padding: 16
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center"
  }
})
