import React from "react"
import { ColorValue, Image, ImageSourcePropType, StyleSheet, Text, View } from "react-native"
import { Colors } from "../../Resources/Colors"

export type Props = {
  readonly backgroundColor?: ColorValue
  readonly imageSource?: ImageSourcePropType
  readonly children: string
}

export const Popup = (props: Props) => {
  const {
    backgroundColor = Colors.blackTransparent,
    imageSource,
    children } = props

  return (
    <View style={[
      styles.container,
      { backgroundColor }
    ]}>
      {imageSource !== undefined && (
        <Image
          style={styles.image}
          source={imageSource}
        />)}
      <Text
        style={styles.text}
      >
        {children}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.blackTransparent,
    flexDirection: "row",
    justifyContent: "center",
    padding: 12
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white
  },
  image: {
    marginEnd: 12
  }
})
