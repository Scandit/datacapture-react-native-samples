import { useMemo } from "react"
import { Symbology } from "scandit-react-native-datacapture-barcode"
import { DataCaptureContext } from "scandit-react-native-datacapture-core"
import {
  CustomBarcode,
  LabelCapture,
  LabelCaptureSettings,
  LabelDefinition,
  UnitPriceText,
  WeightText
} from "scandit-react-native-datacapture-label"

export const useLabelCapture = (dataCaptureContext: DataCaptureContext) => {
  return useMemo(
    () => {
      // label_regular_item
      //
      let barcodeRegularFieldDef = CustomBarcode.initWithNameAndSymbologies("Barcode", [
        Symbology.EAN13UPCA,
        Symbology.Code39,
        Symbology.InterleavedTwoOfFive,
        Symbology.EAN8,
        Symbology.UPCE
      ])
      barcodeRegularFieldDef.optional = false
      barcodeRegularFieldDef.symbologySettings
        .find(e => e.symbology === Symbology.EAN13UPCA)
        ?.setExtensionEnabled("remove_leading_upca_zero", true)

      let barcodeLabelDef = new LabelDefinition("label_regular_item")
      barcodeLabelDef.fields = [barcodeRegularFieldDef]

      // label_weighted_item
      //
      let barcodeWeightedFieldDef = CustomBarcode.initWithNameAndSymbologies("Barcode", [
        Symbology.EAN13UPCA,
        Symbology.Code128,
        Symbology.Code39,
        Symbology.InterleavedTwoOfFive,
        Symbology.EAN8,
        Symbology.UPCE
      ])
      barcodeWeightedFieldDef.patterns = [
        "^2.*",
        "^02.*"
      ]
      barcodeWeightedFieldDef.symbologySettings
        .find(e => e.symbology === Symbology.EAN13UPCA)
        ?.setExtensionEnabled("remove_leading_upca_zero", true)

      let unitPriceFieldDef = new UnitPriceText("value:unit_price")
      unitPriceFieldDef.optional = true

      let weightFieldDef = new WeightText("value:weight")
      weightFieldDef.optional = true

      let weightedItemLabelDef = new LabelDefinition("label_weighted_item")
      weightedItemLabelDef.fields = [
        barcodeWeightedFieldDef,
        unitPriceFieldDef,
        weightFieldDef
      ]

      const settings = LabelCaptureSettings
        .settingsFromLabelDefinitions([barcodeLabelDef, weightedItemLabelDef], {})!

      return LabelCapture.forContext(
        dataCaptureContext,
        settings
      )
    },
    [dataCaptureContext])
}
