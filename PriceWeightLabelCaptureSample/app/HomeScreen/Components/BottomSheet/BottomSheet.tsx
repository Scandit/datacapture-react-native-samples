import React, { useCallback, useEffect, useRef, useState } from "react"
import { Animated, Keyboard, Platform, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from "react-native"
import { Colors } from "../../../Resources/Colors"
import { Strings } from "../../../Resources/Strings"
import { HomeButton } from "../HomeButton/HomeButton"

type Props = {
  readonly onDismiss: () => void
  readonly onSubmit: (text: string) => void
}

export  const BottomSheet = (props: Props) => {
  const { onDismiss, onSubmit } = props
  const [text, setText] = useState("")
  const animatedValueRef = useRef(new Animated.Value(0))

  const startAnimation = useCallback((value: number) => {
    animatedValueRef.current.setValue(0)
    Animated.timing(animatedValueRef.current, {
      toValue: -value,
      duration: 100,
      useNativeDriver: true
    }).start()
  }, [animatedValueRef])

  useEffect(() => {
    const didShowSubscription = Keyboard.addListener("keyboardDidShow", (event) => {
      if (Platform.OS === "android") {
        startAnimation(0)
      } else {
        startAnimation(event.endCoordinates.height)
      }
    })
    const didHideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      startAnimation(0)
    })
    return () => {
      didShowSubscription.remove()
      didHideSubscription.remove()
    }
  }, [startAnimation])

  return (
    <TouchableWithoutFeedback onPress={onDismiss}>
      <View style={styles.container}>
        <TouchableWithoutFeedback>
          <Animated.View style={[
            styles.content,
            {
              transform: [{
                translateY: animatedValueRef.current
              }]}
          ]}>
            <Text
              style={styles.text}>
              {Strings.homeBottomSheetEnterItemWeight}
            </Text>
            <View
              style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                keyboardType={"decimal-pad"}
                autoFocus={true}
                onChangeText={setText}
              />
              <Text
                style={styles.lb}>
                lb</Text>
            </View>
            <HomeButton
              isOpaque={true}
              onPress={() => onSubmit(text)}>
              {Strings.submitButtonText}
            </HomeButton>
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>

  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    backgroundColor: Colors.blackTransparent,
    justifyContent: "flex-end"
  },
  content: {
    borderTopStartRadius: 13,
    borderTopEndRadius: 13,
    backgroundColor: Colors.white,
    padding: 16
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.black900,
    paddingBottom: 16
  },
  textInputContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: 16
  },
  textInput: {
    borderWidth: 1,
    borderBottomColor: Colors.grey300,
    width: 100,
    fontSize: 18,
    fontWeight: "400",
    textAlign: "center",
    color: Colors.black900,
    borderColor: Colors.transparent
  },
  lb: {
    fontSize: 24,
    fontWeight: "400",
    color: Colors.black900
  }
})
