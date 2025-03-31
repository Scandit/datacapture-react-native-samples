import { createStackNavigator } from "@react-navigation/stack"

export enum Screens {
  HOME = "HOME",
  ITEM_LIST = "ITEM_LIST"
}

export type StackParams = {
  [Screens.HOME]: undefined
  [Screens.ITEM_LIST]: undefined
}

export const createStack = () => (
  createStackNavigator<StackParams>()
)
