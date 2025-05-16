import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { StyleSheet, View, SafeAreaView } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { Screens, StackParams } from "../Navigation/navigation"
import { ScannerView } from "./Components/ScannerView/ScannerView"
import { Phase } from "../Models/state"
import { ActionType } from "../Models/actions"
import { useAppReducer } from "../Models/appContext"
import { Timer, TimerListener } from "./Components/Timer/Timer"
import { HomeAnimatedPopup } from "./Components/HomePopup/HomeAnimatedPopup"
import { Feedback, Sound, Vibration } from "scandit-react-native-datacapture-core"
import { CapturedLabel } from "scandit-react-native-datacapture-label"
import { ItemFromError } from "../Models/Item/ItemFrom"
import { Strings } from "../Resources/Strings"
import { HomeButton } from "./Components/HomeButton/HomeButton"
import { BottomSheet } from "./Components/BottomSheet/BottomSheet"
import { Item } from "../Models/Item/Item"

type Props = StackScreenProps<StackParams, Screens.HOME>

export const HomeScreen = (props: Props) => {
  const { navigation } = props
  const [state, dispatch] = useAppReducer()
  const accurateTimer = useRef(Timer.accurateTimer())
  const itemTimer = useRef(Timer.itemTimer())
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false)
  const isScanning = !isBottomSheetVisible && state.phase !== Phase.OPENED_ITEM_LIST
  const isAccurateScanning = state.phase === Phase.ACCURATE_SCANNING

  accurateTimer.current.listener = useMemo<TimerListener>(() => ({
    didFireTimer: () => {
      dispatch({
        type: ActionType.DID_FIRE_ACCURATE_TIMER
      })
    }
  }), [dispatch])

  itemTimer.current.listener = useMemo<TimerListener>(() => ({
    didFireTimer: () => {
      dispatch({
        type: ActionType.DID_FIRE_ITEM_TIMER
      })
    }
  }), [dispatch])

  const onSubmit = useCallback((text: string) => {
    if (!state.partialItem) {
      return
    }

    const item = Item.fromPartial(state.partialItem, text)
    if (!item) {
      return
    }

    dispatch({
      type: ActionType.DID_SCAN_ITEM,
      payload: { item }
    })
    itemTimer.current.start()
  }, [dispatch, state.partialItem])

  const showItemList = useCallback(() => {
    dispatch({
      type: ActionType.DID_OPEN_ITEM_LIST
    })
    navigation.navigate(Screens.ITEM_LIST)
  }, [dispatch, navigation])

  useEffect(() => {
    if (state.phase === Phase.SCANNING) {
      accurateTimer.current.stop()
      itemTimer.current.stop()
    }

    if (state.phase !== Phase.ACCURATE_SCANNING) {
      setBottomSheetVisible(false)
    }

    if (state.phase === Phase.SCANNED_ITEM) {
      showItemList()
    }
  }, [navigation, showItemList, state.phase])

  const onCapturedLabel = useCallback((capturedLabel: CapturedLabel) => {
    if (state.phase !== Phase.SCANNING &&
      state.phase !== Phase.ACCURATE_SCANNING) {
      return
    }

    const [item, itemFromError] = Item.from(capturedLabel)
    switch (itemFromError) {
      case ItemFromError.NO_ERROR:
        dispatch({
          type: ActionType.DID_SCAN_ITEM,
          payload: { item }
        })
        const feedback = new Feedback(
          Vibration.successHapticFeedback,
          Sound.defaultSound)
        feedback.emit()
        itemTimer.current.start()
        break
      case ItemFromError.MANDATORY_FIELDS_NULL:
        break
      case ItemFromError.PARTIAL_ITEM:
        if (!isAccurateScanning) {
          accurateTimer.current.startOrContinue()
        }
        dispatch({
          type: ActionType.DID_SCAN_PARTIAL_ITEM,
          payload: { item }
        })
        break
    }
  }, [dispatch, isAccurateScanning, state.phase])

  return (
    <View style={styles.container}>
      <ScannerView
        style={styles.scannerView}
        isScanning={isScanning}
        onCapturedLabel={onCapturedLabel}
      />
      <SafeAreaView mode={"margin"} style={styles.safeAreaView}>
        <View style={styles.content}>
          <HomeAnimatedPopup phase={state.phase} />
          <View>
            {isAccurateScanning && (
              <HomeButton
                style={styles.marginBottom}
                isOpaque={true}
                onPress={() => setBottomSheetVisible(true)}>
                {Strings.enterWeightManuallyButtonText}
              </HomeButton>)}
            {state.items.length > 0 && (
              <HomeButton
                isOpaque={false}
                onPress={showItemList}>
                {Strings.openItemListButtonText}
              </HomeButton>)}
          </View>
        </View>
      </SafeAreaView>
      {isBottomSheetVisible && (
        <BottomSheet
          onDismiss={() => setBottomSheetVisible(false)}
          onSubmit={onSubmit} />)}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  safeAreaView: {
    flex: 1,
    // Leave enough space for the torchControl.
    // The safeArea is in mode={"margin"} so it's aware of notch.
    marginTop: 64
  },
  scannerView: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  content: {
    flex: 1,
    paddingBottom: 4,
    justifyContent: "space-between",
    marginLeft: 24,
    marginRight: 24
  },
  marginBottom: {
    marginBottom: 16
  }
})
