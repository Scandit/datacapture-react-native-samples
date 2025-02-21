import React from "react"
import { StyleSheet, Text, View } from "react-native"
import { Strings } from "../../../Resources/Strings"
import { BulletText } from "./BulletText"
import { Colors } from "../../../Resources/Colors"
import { Item } from "../../../Models/Item/Item"

type Props = {
  readonly number: number
  readonly item: Item
}

export const ItemCell = (props: Props) => {
  const { number, item } = props

  return (
    <View
      style={styles.marginHorizontal}
    >
      <Text
        style={[
          styles.bigMarginTop,
          styles.smallMarginBottom,
          styles.itemNumberText]}>
        {Strings.itemNumber(number)}
      </Text>
      {
        item.bulletTextPropsArray.map((bulletTextProps, index) => (
          <BulletText
            key={`bullet_text_${index}`}
            style={index === item.bulletTextPropsArray.length - 1
              ? styles.bigMarginBottom
              : styles.smallMarginBottom}
            color={bulletTextProps.color}
            keyText={bulletTextProps.keyText}
            valueText={bulletTextProps.valueText}
          />
        ))
      }
      <View style={styles.separator} />
    </View>
  )
}

const styles = StyleSheet.create({
  itemNumberText: {
    fontSize: 16,
    fontWeight: "600"
  },
  marginHorizontal: {
    marginLeft: 24,
    marginRight: 24
  },
  bigMarginTop: {
    marginTop: 16
  },
  smallMarginBottom: {
    marginBottom: 4
  },
  bigMarginBottom: {
    marginBottom: 22
  },
  separator: {
    height: 1,
    backgroundColor: Colors.grey300
  }
})
