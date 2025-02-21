import { Phase, State } from "./state"
import { Action, ActionType } from "./actions"

export const initialState: State = {
  phase: Phase.SCANNING,
  items: [],
  partialItem: null
}

export const reducer = (state: State, action: Action): State => {
  const { type } = action

  switch (type) {
    case ActionType.DID_SCAN_ITEM: {
      const { payload } = action
      if (state.phase !== Phase.SCANNING &&
        state.phase !== Phase.ACCURATE_SCANNING) {
        return state
      }

      if (state.items.find(payload.item.isEqualTo)) {
        return {
          ...state,
          phase: Phase.SCANNED_DUPLICATE_ITEM,
          partialItem: null
        }
      } else {
        return {
          ...state,
          items: [
            payload.item,
            ...state.items
          ],
          phase: Phase.SCANNED_ITEM,
          partialItem: null
        }
      }
    }
    case ActionType.DID_SCAN_PARTIAL_ITEM: {
      const { payload } = action
      if (state.phase !== Phase.SCANNING &&
        state.phase !== Phase.ACCURATE_SCANNING) {
        return state
      }

      return {
        ...state,
        partialItem: payload.item
      }
    }
    case ActionType.DID_OPEN_ITEM_LIST: {
      return {
        ...state,
        phase: Phase.OPENED_ITEM_LIST,
        partialItem: null
      }
    }
    case ActionType.DID_CLOSE_ITEM_LIST: {
      return {
        ...state,
        phase: Phase.SCANNING,
        partialItem: null
      }
    }
    case ActionType.DID_FIRE_ACCURATE_TIMER: {
      if (state.phase !== Phase.SCANNING) {
        return state
      }

      return {
        ...state,
        phase: Phase.ACCURATE_SCANNING
      }
    }
    case ActionType.DID_FIRE_ITEM_TIMER: {
      if (state.phase !== Phase.SCANNED_ITEM &&
        state.phase !== Phase.SCANNED_DUPLICATE_ITEM &&
        state.phase !== Phase.ACCURATE_SCANNING) {
        return state
      }

      return {
        ...state,
        phase: Phase.SCANNING,
        partialItem: null
      }
    }
    case ActionType.DID_CLEAR_ITEM_LIST: {
      return {
        ...state,
        items: [],
        partialItem: null
      }
    }
  }
}
