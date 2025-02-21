import React from "react"
import { ColorValue, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native"
import { Colors } from "../../../Resources/Colors"
import { Strings } from "../../../Resources/Strings"

export type BulletTextProps = {
  readonly color: ColorValue
  readonly keyText: string
  readonly valueText: string
}

interface Props extends BulletTextProps {
  readonly style?: StyleProp<ViewStyle>
}

export const BulletText = (props: Props) => {
  const { style, color, keyText, valueText } = props

  return (
    <View style={[styles.container, style]}>
      <View style={[
        styles.bullet,
        { backgroundColor: color }
      ]} />
      <View style={styles.textContainer}>
        <Text style={styles.keyText}>
          {keyText}
        </Text>
        <Text style={styles.valueText}>
          {valueText || Strings.notAvailable}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center"
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginEnd: 8
  },
  textContainer: {
    flexDirection: "row"
  },
  keyText: {
    color: Colors.grey500,
    fontSize: 14,
    width: "30%"
  },
  valueText: {
    color: Colors.grey500,
    fontSize: 14,
    width: "70%"
  }
})
