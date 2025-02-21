import { Item } from "./Item/Item"

export enum ActionType {
  DID_SCAN_ITEM = "DID_SCAN_ITEM",
  DID_SCAN_PARTIAL_ITEM = "DID_SCAN_PARTIAL_ITEM",
  DID_OPEN_ITEM_LIST = "DID_OPEN_ITEM_LIST",
  DID_CLOSE_ITEM_LIST = "DID_CLOSE_ITEM_LIST",
  DID_FIRE_ACCURATE_TIMER = "DID_FIRE_ACCURATE_TIMER",
  DID_FIRE_ITEM_TIMER = "DID_FIRE_ITEM_TIMER",
  DID_CLEAR_ITEM_LIST = "DID_CLEAR_ITEM_LIST"
}

type BaseAction<T> = {
  readonly type: T
}

type BaseActionWithType<T, P> = {
  readonly type: T
  readonly payload: P
}

type DidScanItemAction = BaseActionWithType<ActionType.DID_SCAN_ITEM, { item: Item }>
type DidScanPartialItemAction = BaseActionWithType<ActionType.DID_SCAN_PARTIAL_ITEM, { item: Item }>
type DidOpenItemListAction = BaseAction<ActionType.DID_OPEN_ITEM_LIST>
type DidCloseItemListAction = BaseAction<ActionType.DID_CLOSE_ITEM_LIST>
type DidFireAccurateTimerAction = BaseAction<ActionType.DID_FIRE_ACCURATE_TIMER>
type DidFireItemTimerAction = BaseAction<ActionType.DID_FIRE_ITEM_TIMER>
type DidClearItemListAction = BaseAction<ActionType.DID_CLEAR_ITEM_LIST>

export type Action =
  DidScanItemAction |
  DidScanPartialItemAction |
  DidOpenItemListAction |
  DidCloseItemListAction |
  DidFireAccurateTimerAction |
  DidFireItemTimerAction |
  DidClearItemListAction
