import React, { useCallback, useEffect, useRef } from "react"
import { Popup, Props as PopupProps } from "./Popup"
import { Animated } from "react-native"

const TRANSLATION_VALUE = 100

interface Props extends PopupProps {
}

export const AnimatedPopup = (props: Props) => {
  const { backgroundColor, imageSource, children } = props
  const animatedValueRef = useRef(new Animated.Value(0))

  const startAnimation = useCallback(() => {
    animatedValueRef.current.setValue(0)
    Animated.timing(animatedValueRef.current, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true
    }).start()
  }, [animatedValueRef])

  useEffect(() => {
    startAnimation()
  })

  return (
    <Animated.View
      style={
        {
          marginTop: -TRANSLATION_VALUE,
          opacity: animatedValueRef.current,
          transform: [{
            translateY: animatedValueRef.current.interpolate({
              inputRange: [0, 1],
              outputRange: [0, TRANSLATION_VALUE]
            })
          }]
        }
      }
    >
      <Popup
        backgroundColor={backgroundColor}
        imageSource={imageSource}>
        {children}
      </Popup>
    </Animated.View>
  )
}
