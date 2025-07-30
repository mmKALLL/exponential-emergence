import { initialGameState, type Action, type GameState } from '@/types'
import { createContext, useContext, useReducer, type JSX } from 'react'

export const GameStateContext = createContext(initialGameState)
export const DispatchContext = createContext((_action: Action) => {})

export function GameStateProvider({ children }: { children: JSX.Element }) {
  const [gs, dispatch] = useReducer<GameState, [Action]>(reduceAction, initialGameState)
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

export function reduceAction(gs: GameState, action: Action): GameState {
  if (!canApplyAction(gs, action)) {
    return gs // Return early if action is not applicable
  }

  let updatedGs: GameState = { ...gs }

  updatedGs = action.effect(updatedGs)

  // Handle frame advancement
  updatedGs = progressFrame(updatedGs)

  return updatedGs
}

function canApplyAction(gs: GameState, action: Action): boolean {
  // Implement your logic to determine if the action can be applied to the game state
  return true
}

function progressFrame(gs: GameState): GameState {
  // Implement your logic to progress the game state by one frame
  return gs
}
