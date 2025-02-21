import { Item } from "./Item/Item"

export enum Phase {
  SCANNING = "SCANNING",
  ACCURATE_SCANNING = "ACCURATE_SCANNING",
  SCANNED_ITEM = "SCANNED_ITEM",
  SCANNED_DUPLICATE_ITEM = "SCANNED_DUPLICATE_ITEM",
  OPENED_ITEM_LIST = "OPENED_ITEM_LIST"
}

export type State = {
  readonly phase: Phase
  readonly items: ReadonlyArray<Item>
  readonly partialItem: Item | null
}
