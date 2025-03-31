import { createContext, Dispatch, useContext } from "react"
import { State } from "./state"
import { initialState } from "./reducer"
import { Action } from "./actions"


export const AppStateContext = createContext<State>(initialState)
export const AppDispatchContext = createContext<Dispatch<Action>>(() => {})

export const useAppReducer = (): [State, Dispatch<Action>] => {
  const state = useContext(AppStateContext)
  const dispatch = useContext(AppDispatchContext)

  return [
    state,
    dispatch
  ]
}
