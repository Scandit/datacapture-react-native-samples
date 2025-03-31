import { Brush } from "scandit-react-native-datacapture-core"
import { BulletTextProps } from "../../ItemListScreen/Components/ItemListView/BulletText"
import { CapturedLabel, LabelField } from "scandit-react-native-datacapture-label"
import { ItemFromError, ItemFromResult } from "./ItemFrom"
import { Symbology } from "scandit-react-native-datacapture-barcode"
import { Colors } from "../../Resources/Colors"
import { Strings } from "../../Resources/Strings"


enum LabelFieldName {
  BARCODE = "Barcode",
  UNIT_PRICE = "value:unit_price",
  TOTAL_PRICE = "value:total_price",
  WEIGHT = "value:weight",
  USE_BY = "value:use_by",
  PKG = "value:pkg"
}


export class BrushBuilder {
  private readonly _labelField: LabelField

  constructor(labelField: LabelField) {
    this._labelField = labelField
  }

  get brush(): Brush {
    // NOTE: Since just BARCODE, UNIT_PRICE and WEIGHT have omit_in_captured_label
    // to false in configuration file, only brush for BARCODE, UNIT_PRICE and WEIGHT
    // will be used, unless you modify fresh_product_barcode_semantics_scenario
    // json file.
    switch (Item.getLabelFieldName(this._labelField)) {
      case LabelFieldName.BARCODE:
        return new Brush(
          Colors.barcodeColor,
          Colors.barcodeColor,
          0)
      case LabelFieldName.UNIT_PRICE:
        return new Brush(
          Colors.unitPriceColor,
          Colors.unitPriceColor,
          0)
      case LabelFieldName.TOTAL_PRICE:
        return new Brush(
          Colors.totalPriceColor,
          Colors.totalPriceColor,
          0)
      case LabelFieldName.WEIGHT:
        return new Brush(
          Colors.weightColor,
          Colors.weightColor,
          0)
      case LabelFieldName.USE_BY:
        return new Brush(
          Colors.useByColor,
          Colors.useByColor,
          0)
      case LabelFieldName.PKG:
        return new Brush(
          Colors.pkgColor,
          Colors.pkgColor,
          0)
      default:
        return new Brush(
          Colors.transparentColor,
          Colors.transparentColor,
          0)
    }
  }
}

export class Item {
  private readonly _barcode: string
  private readonly _unitPrice: string | null
  private readonly _totalPrice: string | null
  private readonly _weight: string | null
  private readonly _useBy: string | null
  private readonly _pkg: string | null
  private readonly _timestamp: Date

  // Only called from inside this file.
  static getLabelFieldName(labelField: LabelField): LabelFieldName | null {
    switch (labelField.name) {
      case LabelFieldName.BARCODE:
        return LabelFieldName.BARCODE
      case LabelFieldName.UNIT_PRICE:
        return LabelFieldName.UNIT_PRICE
      case LabelFieldName.TOTAL_PRICE:
        return LabelFieldName.TOTAL_PRICE
      case LabelFieldName.WEIGHT:
        return LabelFieldName.WEIGHT
      case LabelFieldName.USE_BY:
        return LabelFieldName.USE_BY
      case LabelFieldName.PKG:
        return LabelFieldName.PKG
      default:
        return null
    }
  }

  // Public static method to create a fresh new object.
  static from(capturedLabel: CapturedLabel): ItemFromResult {
    const barcodeLabelField = capturedLabel
      .fields
      .find(field => (
        Item.getLabelFieldName(field) === LabelFieldName.BARCODE))
    const unitPriceLabelField = capturedLabel
      .fields
      .find(field => (
        Item.getLabelFieldName(field) === LabelFieldName.UNIT_PRICE))
    const totalPriceLabelField = capturedLabel
      .fields
      .find(field => (
        Item.getLabelFieldName(field) === LabelFieldName.TOTAL_PRICE))
    const weightLabelField = capturedLabel
      .fields
      .find(field => (
        Item.getLabelFieldName(field) === LabelFieldName.WEIGHT))
    const useByLabelField = capturedLabel
      .fields
      .find(field => (
        Item.getLabelFieldName(field) === LabelFieldName.USE_BY))
    const pkgLabelField = capturedLabel
      .fields
      .find(field => (
        Item.getLabelFieldName(field) === LabelFieldName.PKG))

    const barcodeData = barcodeLabelField?.barcode?.data
    const barcodeSymbology = barcodeLabelField?.barcode?.symbology
    const weightText = weightLabelField?.text
    if (!barcodeData || !barcodeSymbology) {
      return [null, ItemFromError.MANDATORY_FIELDS_NULL]
    }

    const item = new Item({
      barcode: barcodeData,
      unitPrice: unitPriceLabelField?.text || null,
      totalPrice: totalPriceLabelField?.text || null,
      weight: weightText || null,
      useBy: useByLabelField?.text || null,
      pkg: pkgLabelField?.text || null
    })
    const shouldContainWeight = barcodeSymbology === Symbology.Code128 ||
      barcodeData.startsWith("2") ||
      barcodeData.startsWith("02")

    // If I just have partial item, returns with error.
    if (shouldContainWeight && !weightText) {
      return [item, ItemFromError.PARTIAL_ITEM]
    }

    return [item, ItemFromError.NO_ERROR]
  }

  static fromPartial(partialItem: Item, text: string): Item | null {
    return new Item({
      barcode: partialItem._barcode,
      unitPrice: partialItem._unitPrice,
      totalPrice: partialItem._totalPrice,
      weight: text,
      useBy: partialItem._useBy,
      pkg: partialItem._pkg
    })
  }

  private constructor(
    props: {
      barcode: string,
      unitPrice: string | null,
      totalPrice: string | null,
      weight: string | null,
      useBy: string | null,
      pkg: string | null
    }) {
    this._barcode = props.barcode
    this._unitPrice = props.unitPrice
    this._totalPrice = props.totalPrice
    this._weight = props.weight
    this._useBy = props.useBy
    this._pkg = props.pkg
    this._timestamp = new Date()
  }

  get bulletTextPropsArray(): readonly BulletTextProps[] {
    return [
      {
        color: Colors.barcode,
        keyText: Strings.barcode,
        valueText: this._barcode
      },
      {
        color: Colors.weight,
        keyText: Strings.weight,
        valueText: this._weight || "N/A"
      },
      {
        color: Colors.unitPrice,
        keyText: Strings.unitPrice,
        valueText: this._unitPrice || "N/A"
      }
    ]
  }

  get timestamp(): Date {
    return this._timestamp
  }

  readonly isEqualTo = (item: Item): boolean => {
    if (!(item instanceof Item)) {
      return false
    }

    return this._barcode === item._barcode
  }
}

