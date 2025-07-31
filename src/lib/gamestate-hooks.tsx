import { type Action, type GameState, type LevelName } from '@/lib/types'
import { createContext, useContext, useReducer, type JSX } from 'react'
import { assertNever } from './utils'
import { initialGameState } from './gamestate-utils'

type PlayerEvent =
  | {
      type: 'action-toggle'
      payload: Action
    }
  | {
      type: 'rebirth-select'
      payload: LevelName
    }

export const GameStateContext = createContext(initialGameState)
export const DispatchContext = createContext((event: PlayerEvent) => {})

export function GameStateProvider({ children }: { children: JSX.Element }) {
  const [gs, dispatch] = useReducer<GameState, [PlayerEvent]>(reduceEvent, initialGameState)
  return (
    <GameStateContext.Provider value={gs}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </GameStateContext.Provider>
  )
}

export function useGameState() {
  const gs = useContext(GameStateContext)
  const dispatch = useContext(DispatchContext)
  return { gs, dispatch }
}

export function reduceEvent(gs: GameState, event: PlayerEvent): GameState {
  switch (event.type) {
    case 'action-toggle': {
      const action = event.payload
      return reduceAction(gs, action)
    }
    case 'rebirth-select': {
      const newLevel = event.payload
      return { ...gs, currentLevel: newLevel, generation: gs.generation + 1 }
    }
    default:
      assertNever(event)
  }
}

export function reduceAction(gs: GameState, action: Action): GameState {
  let updatedGs: GameState = { ...gs }

  if (!canApplyAction(gs, action)) {
    return gs // Return early if action is not applicable
  }

  // Handle action
  updatedGs = action.effect(updatedGs)

  // Handle frame advancement
  updatedGs = progressFrame(updatedGs)

  return updatedGs
}

function canApplyAction(gs: GameState, action: Action): boolean {
  // Implement your logic to determine if the action can be applied to the game state
  // TODO: Check action.enabledCondition against gs
  return true
}

function progressFrame(gs: GameState): GameState {
  // Implement your logic to progress the game state by one frame
  return gs
}

function resetAction(action: Action): Action {
  return {
    ...action,
    progress: 0,
    currentSpeed: 1,
    currentValue: 0,
    valueHistory: [],
  }
}
