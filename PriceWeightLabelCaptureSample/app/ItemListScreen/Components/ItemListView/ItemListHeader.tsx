import React from "react"
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native"
import { Colors } from "../../../Resources/Colors"
import { Strings } from "../../../Resources/Strings"

type Props = {
  readonly style?: StyleProp<ViewStyle>
  readonly children: string
  readonly onClearPress: () => void
}

export const ItemListHeader = (props: Props) => {
  const {style, children, onClearPress} = props
  return (
    <View style={[style, styles.container]}>
      <Text style={styles.itemsScannedText}>
        {children}
      </Text>
      <TouchableOpacity
        onPress={onClearPress}
      >
        <Text style={styles.clearText}>
          {Strings.clear}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginLeft: 24,
    marginRight: 24
  },
  itemsScannedText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.black900
  },
  clearText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.red
  }
})
