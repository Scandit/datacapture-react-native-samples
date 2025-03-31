import React, { useReducer } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { HomeScreen } from "./HomeScreen/HomeScreen"
import { ItemListScreen } from "./ItemListScreen/ItemListScreen"
import { createStack, Screens } from "./Navigation/navigation"
import { initialState, reducer } from "./Models/reducer"
import { AppDispatchContext, AppStateContext } from "./Models/appContext"
import { Strings } from "./Resources/Strings"
import { Colors } from "./Resources/Colors"
import { StatusBar } from "react-native"
import { Values } from "./Resources/Values"

const Stack = createStack()

function App() {
  StatusBar.setBarStyle("light-content", true)
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: Colors.black900
              },
              headerTintColor: Colors.white
            }}
          >
            <Stack.Screen
              name={Screens.HOME}
              component={HomeScreen}
              options={{
                headerTitle: Strings.homeHeaderTitle,
                headerTransparent: true,
                headerTitleAlign: "center",
                headerStatusBarHeight: Values.headerPaddingTop,
              }}
            />
            <Stack.Screen
              name={Screens.ITEM_LIST}
              component={ItemListScreen}
              options={{
                headerTitle: Strings.itemListScreenTitle
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  )
}

export default App
