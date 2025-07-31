import { TICK_LENGTH, type Action, type GameState, type LevelName } from '@/lib/types'
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
  | { type: 'frame-advance' }

export const GameStateContext = createContext(initialGameState)
export const DispatchContext = createContext((_event: PlayerEvent) => {})

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
      return reduceActionToggle(gs, action)
    }
    case 'rebirth-select': {
      const newLevel = event.payload
      return rebirth(gs, newLevel)
    }
    case 'frame-advance': {
      // Handle frame advancement logic
      return progressFrame(gs)
    }
    default:
      assertNever(event)
  }
}

export function reduceActionToggle(gs: GameState, action: Action): GameState {
  let updatedGs: GameState = { ...gs }

  // Start action if possible, or set to null if current action is already the active one
  updatedGs.currentActionName = canApplyAction(gs, action) && (action.enabledCondition?.(updatedGs) ?? true) && gs.currentActionName !== action.name ? action.name : null

  return updatedGs
}

export function reduceAction(gs: GameState, action: Action): GameState {
  if (!canApplyAction(gs, action)) {
    return gs // Return early if action is not applicable
  }

  return action.effect({ ...gs })
}

function canApplyAction(gs: GameState, action: Action): boolean {
  // Implement your logic to determine if the action can be applied to the game state
  // TODO: Check action.enabledCondition against gs
  return true
}

function progressFrame(gs: GameState): GameState {
  if (gs.currentScreen !== 'in-game') {
    return gs // No frame advancement if not in-game
  }

  let updatedGs = { ...gs }
  updatedGs.lifespanLeft -= 0.1
  if (updatedGs.lifespanLeft <= 0) {
    return handleGameOver(updatedGs)
  }

  // Update action progress if an action is active
  if (updatedGs.currentActionName) {
    const updatedAction = updatedGs.levels[updatedGs.currentLevel].actionCards[updatedGs.currentActionName]
    if (updatedAction) {
      updatedAction.progress += updatedAction.currentSpeed * updatedAction.permanentSpeed * TICK_LENGTH
      if (updatedAction.progress >= updatedAction.baseTime) {
        updatedGs = reduceAction(updatedGs, updatedAction)
      }
      updatedGs.levels[updatedGs.currentLevel].actionCards[updatedAction.name] = updatedAction
    }
  }
  return updatedGs
}

function handleGameOver(gs: GameState): GameState {
  return {
    ...gs,
    currentScreen: 'rebirth',
    lifespanLeft: 0,
    currentActionName: null,
  }
}

function rebirth(gs: GameState, newLevelName: LevelName): GameState {
  let updatedGs = { ...gs }
  const currentLevelName = gs.currentLevel

  updatedGs = {
    ...updatedGs,
    currentScreen: 'in-game',
    currentLevel: newLevelName,
    generation: gs.generation + 1,
    lifespanLeft: 60,
    currentActionName: null,
  }

  // Reset all actions
  for (const actionName in updatedGs.levels[currentLevelName].actionCards) {
    const action = updatedGs.levels[currentLevelName].actionCards[actionName]
    updatedGs.levels[currentLevelName].actionCards[actionName] = resetAction(action)
  }

  return updatedGs
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
