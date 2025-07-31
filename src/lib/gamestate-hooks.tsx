import { TICK_LENGTH, type Action, type GameState, type Goal, type LevelName } from '@/lib/types'
import { createContext, useContext, useReducer, type JSX } from 'react'
import { maxTime, assertNever } from './utils'
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
  updatedGs.runStarted = true

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

function canApplyAction(_gs: GameState, _action: Action): boolean {
  // TODO: Check action.enabledCondition against gs; or try applying the action and see if all resources are non-negative?
  return true
}

function progressFrame(gs: GameState): GameState {
  if (gs.currentScreen !== 'in-game' || !gs.runStarted) {
    return gs // No frame advancement if not in-game
  }

  let updatedGs = { ...gs }
  updatedGs.lifespanLeft -= 0.1
  if (updatedGs.lifespanLeft <= 0) {
    return handleGameOver(updatedGs)
  }

  // Update action progress if an action is active
  if (updatedGs.currentActionName) {
    const updatedAction = { ...updatedGs.levels[updatedGs.currentLevel].actionCards[updatedGs.currentActionName] }
    if (updatedAction) {
      updatedAction.progress += TICK_LENGTH
      if (updatedAction.progress >= maxTime(updatedAction) && canApplyAction(updatedGs, updatedAction)) {
        updatedGs = reduceAction(updatedGs, updatedAction)
        updatedAction.progress = 0
        updatedAction.currentValue += 1
        updatedAction.currentSpeed = Math.min(updatedAction.currentSpeed + 0.2, 4)
        updatedAction.permanentSpeed = Math.min(updatedAction.permanentSpeed + 0.02, 2.5)
      }

      updatedGs = actionLens(updatedGs, updatedAction)
    }
  }

  // Update action and goal data
  updatedGs = updateActionHistories(updatedGs)
  updatedGs = handleGoalCompletion(updatedGs)

  return updatedGs
}

function actionLens(gs: GameState, updatedAction: Action): GameState {
  return {
    ...gs,
    levels: { ...gs.levels, [gs.currentLevel]: { ...gs.levels[gs.currentLevel], actionCards: { ...gs.levels[gs.currentLevel].actionCards, [updatedAction.name]: updatedAction } } },
  }
}

function goalLens(gs: GameState, updatedGoal: Goal): GameState {
  return {
    ...gs,
    levels: {
      ...gs.levels,
      [gs.currentLevel]: {
        ...gs.levels[gs.currentLevel],
        goals: [updatedGoal, ...gs.levels[gs.currentLevel].goals.slice(1)],
      },
    },
  }
}

function handleGoalCompletion(gs: GameState): GameState {
  let updatedGs = { ...gs }
  const updatedGoal = { ...gs.levels[gs.currentLevel].goals[0] }
  const currentAmount = gs.levels[gs.currentLevel].resources[updatedGoal.resourceName]
  if (currentAmount >= updatedGoal.requiredAmount) {
    updatedGs = updatedGoal.onComplete(updatedGs)
    updatedGs.levels[updatedGs.currentLevel].goals = updatedGs.levels[updatedGs.currentLevel].goals.slice(1)
  }
  return goalLens(updatedGs, updatedGoal)
}

function updateActionHistories(gs: GameState): GameState {
  let updatedGs = { ...gs }
  Object.values(updatedGs.levels[updatedGs.currentLevel].actionCards).forEach((action) => {
    const updatedAction = {
      ...action,
      valueHistory: [...action.valueHistory, action.currentValue],
    }
    updatedGs = actionLens(updatedGs, updatedAction)
  })
  return updatedGs
}

function handleGameOver(gs: GameState): GameState {
  return {
    ...gs,
    unlockedDisplaySections: { ...gs.unlockedDisplaySections, speeds: true, valueHistory: true, bestValue: true },
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

  // Reset all resources
  updatedGs.levels[currentLevelName].resources = { ...updatedGs.levels[currentLevelName].initialResources }

  // Goals are not reset

  return updatedGs
}

function resetAction(action: Action): Action {
  const didImproveBest = action.currentValue > action.bestValue

  return {
    ...action,
    progress: 0,
    currentSpeed: 1,
    currentValue: 0,
    valueHistory: [],
    bestValue: didImproveBest ? action.currentValue : action.bestValue,
    bestValueHistory: didImproveBest ? action.valueHistory : action.bestValueHistory,
  }
}
