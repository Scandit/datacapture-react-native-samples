import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AppState, AppStateStatus, StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import {
  Brush,
  DataCaptureView,
  FrameSourceState,
  TorchSwitchControl
} from "scandit-react-native-datacapture-core"
import { useCamera } from "./Components/useCamera"
import { useLabelCapture } from "./Components/useLabelCapture"
import { createDataCaptureContext } from "./Components/createDataCaptureContext"
import {
  CapturedLabel,
  LabelCaptureBasicOverlayListener,
  LabelCaptureListener
} from "scandit-react-native-datacapture-label"
import { Colors } from "../../../Resources/Colors"
import { useBasicOverlay } from "./Components/useBasicOverlay"
import { BrushBuilder } from "../../../Models/Item/Item"

type Props = {
  readonly style?: StyleProp<ViewStyle>
  readonly isScanning: boolean
  readonly onCapturedLabel: (capturedLabel: CapturedLabel) => void
}

export const ScannerView = (props: Props) => {
  const { style, isScanning, onCapturedLabel: onCapturedLabel } = props

  const dataCaptureViewRef = useRef<DataCaptureView>(null)
  const [dataCaptureContext] = useState(createDataCaptureContext)
  const camera = useCamera(dataCaptureContext)
  const labelCapture = useLabelCapture(dataCaptureContext)
  const basicOverlay = useBasicOverlay(labelCapture)

  const labelCaptureListener = useMemo<LabelCaptureListener>(() => ({
    didUpdateSession(_, session) {
      const capturedLabel = session.capturedLabels[0]
      if (!capturedLabel) {
        return
      }
      onCapturedLabel(capturedLabel)
    }
  }), [onCapturedLabel])

  const basicOverlayListener = useMemo<LabelCaptureBasicOverlayListener>(() => ({
    brushForFieldOfLabel: (_, field) => {
      return new BrushBuilder(field).brush
    },
    brushForLabel() {
      return new Brush(Colors.transparentColor, Colors.transparentColor, 0)
    }
  }), [])

  const startScanning = useCallback(() => {
    camera
      .switchToDesiredState(FrameSourceState.On)
      .then(() => {})
    labelCapture.isEnabled = true
  }, [camera, labelCapture])

  const stopScanning = useCallback(() => {
    labelCapture.isEnabled = false
    camera
      .switchToDesiredState(FrameSourceState.Off)
      .then(() => {})
  }, [camera, labelCapture])

  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (nextAppState.match(/inactive|background/)) {
      stopScanning()
    } else {
      if (!isScanning) {
        return
      }
      startScanning()
    }
  }, [isScanning, startScanning, stopScanning])

  // Add listeners and controls.
  useEffect(() => {
    // We need useEffect here, since at first run
    // we don't have dataCaptureViewRef.current
    basicOverlay.listener = basicOverlayListener
    const dataCaptureView = dataCaptureViewRef.current
    dataCaptureView?.addOverlay(basicOverlay)
    const torchControl = new TorchSwitchControl()
    dataCaptureView?.addControl(torchControl)
    return () => {
      basicOverlay.listener = null
      dataCaptureView?.removeOverlay(basicOverlay)
      dataCaptureView?.removeControl(torchControl)
    }
  }, [basicOverlay, basicOverlayListener])
  useEffect(() => {
    labelCapture.addListener(labelCaptureListener)
    return () => {
      labelCapture.removeListener(labelCaptureListener)
    }
  }, [labelCapture, labelCaptureListener])

  // Start/stop scanning. Triggered when isScanning changes.
  useEffect(() => {
    if (isScanning) {
      startScanning()
    } else {
      stopScanning()
    }
  }, [isScanning, startScanning, stopScanning])

  // Handle background.
  useEffect(() => {
    const subscription = AppState
      .addEventListener("change", handleAppStateChange)
    return () => {
      subscription.remove()
    }
  }, [handleAppStateChange])

  return (
    <View style={[
      styles.container,
      style
    ]}>
      <DataCaptureView
        style={styles.dataCaptureView}
        context={dataCaptureContext}
        ref={dataCaptureViewRef}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  dataCaptureView: {
    flex: 1
  }
})
