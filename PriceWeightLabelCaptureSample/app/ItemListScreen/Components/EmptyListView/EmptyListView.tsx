import React from "react"
import { Image, StyleSheet, Text, View } from "react-native"
import { Popup } from "../../../Components/Popup/Popup"
import { Images } from "../../../Resources/Images"
import { Strings } from "../../../Resources/Strings"
import { Colors } from "../../../Resources/Colors"
import { ItemListButton } from "../ItemListButton/ItemListButton"

type Props = {
  readonly onGoBackToCameraPress: () => void
}

export const EmptyListView = (props: Props) => {
  const { onGoBackToCameraPress } = props

  return (
    <View style={styles.container}>
      <Text style={styles.secondaryText}>
        {Strings.emptyListViewTopText}
      </Text>
      <View style={styles.content}>
        <Image
          style={styles.imageViewBottomMargin}
          source={Images.empty}
        />
        <View style={styles.buttonsContainer}>
          <ItemListButton
            style={styles.standardButton}
            isOpaque={true}
            onPress={onGoBackToCameraPress}>
            {Strings.emptyListViewButtonText}
          </ItemListButton>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  buttonsContainer: {
    marginTop: 32,
    marginLeft: 24,
    marginRight: 24,
    marginBottom: 8
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: Colors.white
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  imageViewBottomMargin: {
    marginBottom: 28,
    width: 267,
    height: 194,
  },
  secondaryText: {
    fontWeight: "700",
    color: Colors.black900
  },
  standardButton: {
    marginBottom: 16
  }
})
