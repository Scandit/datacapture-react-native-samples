import React, { memo } from "react"
import { Phase } from "../../../Models/state"
import { Colors } from "../../../Resources/Colors"
import { Images } from "../../../Resources/Images"
import { Strings } from "../../../Resources/Strings"
import { AnimatedPopup } from "../../../Components/Popup/AnimatedPopup"

type Props = {
  readonly phase: Phase
}

const _HomeAnimatedPopup = (props: Props) => {
  const { phase } = props

  const getBackgroundColor = () => {
    switch (phase) {
      case Phase.SCANNING:
      case Phase.ACCURATE_SCANNING:
        return Colors.blackTransparent
      case Phase.SCANNED_ITEM:
        return Colors.greenTransparent
      case Phase.SCANNED_DUPLICATE_ITEM:
        return Colors.redTransparent
      case Phase.OPENED_ITEM_LIST:
        // Don't care.
        return undefined
    }
  }

  const getImageSource = () => {
    switch (phase) {
      case Phase.SCANNING:
      case Phase.ACCURATE_SCANNING:
        return undefined
      case Phase.SCANNED_ITEM:
        return Images.success
      case Phase.SCANNED_DUPLICATE_ITEM:
        return Images.warning
      case Phase.OPENED_ITEM_LIST:
        // Don't care.
        return undefined
    }
  }

  const getText = () => {
    switch (phase) {
      case Phase.SCANNING:
      case Phase.ACCURATE_SCANNING:
        return Strings.homePopupScanning
      case Phase.SCANNED_ITEM:
        return Strings.homePopupScannedItem
      case Phase.SCANNED_DUPLICATE_ITEM:
        return Strings.homePopupScannedDuplicateItem
      case Phase.OPENED_ITEM_LIST:
        // Don't care.
        return ""
    }
  }
  return (
    <AnimatedPopup
      backgroundColor={getBackgroundColor()}
      imageSource={getImageSource()}>
      {getText()}
    </AnimatedPopup>
  )
}

export const HomeAnimatedPopup = memo(_HomeAnimatedPopup)
