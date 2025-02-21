import { LabelCapture, LabelCaptureBasicOverlay } from "scandit-react-native-datacapture-label"
import { useMemo } from "react"
import {
  MeasureUnit,
  NumberWithUnit,
  RectangularViewfinder,
  RectangularViewfinderStyle,
  SizeWithUnit
} from "scandit-react-native-datacapture-core"

export const useBasicOverlay = (labelCapture: LabelCapture) => {
  return useMemo<LabelCaptureBasicOverlay>(() => {
    const basicOverlay = LabelCaptureBasicOverlay
      .withLabelCapture(labelCapture)
    const viewfinder = new RectangularViewfinder(
      RectangularViewfinderStyle.Square)
    viewfinder.setSize(new SizeWithUnit(
      new NumberWithUnit(0.9, MeasureUnit.Fraction),
      new NumberWithUnit(0.5, MeasureUnit.Fraction)))
    basicOverlay.viewfinder = viewfinder
    return basicOverlay
  }, [labelCapture])
}
