import React, { useEffect } from "react"
import { SafeAreaView, StyleSheet, View } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { Screens, StackParams } from "../Navigation/navigation"
import { useAppReducer } from "../Models/appContext"
import { ActionType } from "../Models/actions"
import { ItemListView } from "./Components/ItemListView/ItemListView"
import { Colors } from "../Resources/Colors"
import { ConfirmationAlert } from "./Components/ConfirmationAlert/ConfirmationAlert"
import { Strings } from "../Resources/Strings"
import { EmptyListView } from "./Components/EmptyListView/EmptyListView"
import { ItemListButton } from "./Components/ItemListButton/ItemListButton"

type Props = StackScreenProps<StackParams, Screens.ITEM_LIST>
export const ItemListScreen = (props: Props) => {
  const { navigation } = props
  const [state, dispatch] = useAppReducer()

  useEffect(() => {
      return () => {
        dispatch({
          type: ActionType.DID_CLOSE_ITEM_LIST
        })
      }
    }, [dispatch])

  const onClearPress = () => {
    ConfirmationAlert.ask({
      onConfirm: () => {
        dispatch({
          type: ActionType.DID_CLEAR_ITEM_LIST
        })
      }
    })
  }

  const onBackPress = () => {
    navigation.goBack()
  }

  if (state.items.length === 0) {
    return (
      <EmptyListView
        onGoBackToCameraPress={onBackPress}
      />
    )
  }

  return (
    <View style={styles.container}>
      <ItemListView
        items={state.items}
        onClearPress={onClearPress}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.buttonsContainer}>
          <ItemListButton
            style={styles.marginBottom}
            isOpaque={true}
            onPress={onBackPress}>
            {Strings.continueButtonText}
          </ItemListButton>
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white
  },
  safeArea: {
    backgroundColor: Colors.white,
    shadowColor: Colors.black900,
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  buttonsContainer: {
    marginTop: 32,
    marginLeft: 24,
    marginRight: 24,
    marginBottom: 8
  },
  marginBottom: {
    marginBottom: 16
  }
})
