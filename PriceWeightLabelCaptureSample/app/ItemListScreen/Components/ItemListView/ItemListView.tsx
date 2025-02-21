import React from "react"
import { FlatList, ListRenderItem, StyleSheet, View } from "react-native"
import { useCallback } from "react"
import { ItemCell } from "./ItemCell"
import { ItemListHeader } from "./ItemListHeader"
import { Strings } from "../../../Resources/Strings"
import { Item } from "../../../Models/Item/Item"

type Props = {
  readonly items: ReadonlyArray<Item>
  readonly onClearPress: () => void
}

export const ItemListView = (props: Props) => {
  const { items, onClearPress } = props

  const renderItem = useCallback<ListRenderItem<Item>>(({ item, index }) => {
    return (
      <ItemCell number={items.length - index} item={item} />
    )
  }, [items])

  const keyExtractor = useCallback((item: Item) => {
    return item.bulletTextPropsArray.reduce((acc, bulletTextProps) => (
      `${acc}_${bulletTextProps.valueText}`
    ), "")
  }, [])

  return (
    <View style={styles.container}>
      <ItemListHeader
        style={styles.itemListHeader}
        onClearPress={onClearPress}>
        {Strings.itemsScanned(items.length)}
      </ItemListHeader>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  itemListHeader: {
    marginTop: 16
  }
})
