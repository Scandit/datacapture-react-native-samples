import { Item } from "./Item"

export enum ItemFromError {
  /// No error.
  NO_ERROR = "NO_ERROR",
  /// One or more mandatory fields are null.
  MANDATORY_FIELDS_NULL = "MANDATORY_FIELDS_NULL",
  /// We don't have all required fields, and we are returning partial results.
  PARTIAL_ITEM = "PARTIAL_ITEM"
}

export type ItemFromResult = [Item, ItemFromError.NO_ERROR] |
  [null, ItemFromError.MANDATORY_FIELDS_NULL] |
  [Item, ItemFromError.PARTIAL_ITEM]
