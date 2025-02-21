import { Alert } from "react-native"
import { Strings } from "../../../Resources/Strings"

export class ConfirmationAlert {
  static readonly ask = (params: { onConfirm: () => void }) => {
    const { onConfirm } = params
    Alert.alert(
      Strings.confirmationAlertTitle,
      Strings.confirmationAlertMsg,
      [
        {
          text: Strings.confirmationAlertCancel,
          onPress: () => {},
          style: "cancel"
        },
        {
          text: Strings.confirmationAlertClear,
          onPress: onConfirm,
          style: "destructive"
        }
      ]
    )
  }
}
