export const Strings = {
  itemNumber: (index: number) => (
    `ITEM${index}`
  ),
  barcode: "UPC",
  unitPrice: "UNIT PRICE",
  totalPrice: "PRICE",
  weight: "WEIGHT",
  useBy: "EXPIRY",
  pkg: "PKG",
  itemsScanned: (number: number) => (
    `${number} Items scanned`
  ),
  notAvailable: "N/A",
  clear: "Clear list",
  confirmationAlertTitle: "Clear list",
  confirmationAlertMsg: "All items on this list will be removed",
  confirmationAlertCancel: "Cancel",
  confirmationAlertClear: "Clear",
  homeHeaderTitle: "LABEL SCAN",
  homePopupScanning: "Point at a label to scan",
  homePopupScannedItem: "Item has scanned successfully!",
  homePopupScannedDuplicateItem: "Item has already been scanned!",
  homeBottomSheetEnterItemWeight: "Enter item weight",
  enterWeightManuallyButtonText: "ENTER WEIGHT MANUALLY",
  submitButtonText: "SUBMIT",
  itemListScreenTitle: "Item List",
  openItemListButtonText: "GO TO ITEM LIST",
  continueButtonText: "CONTINUE SCANNING",
  emptyListViewTopText: "0 items scanned",
  emptyListViewText: "Scan labels to build list",
  emptyListViewButtonText: "CONTINUE SCANNING"
}
