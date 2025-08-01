import { generatedActions } from './data/action-definitions'
import { initialGameState } from './gamestate-utils'
import { TICK_LENGTH, type Action, type GameStateAction, type LevelName } from './types'
import { maxTime } from './utils'

const gs = { ...initialGameState }

function handleGameOver() {
  gs.currentScreen = 'rebirth'
  gs.lifespanLeft = 0
  gs.runStarted = false
  gs.currentActionName = null
  gs.unlockedDisplaySections.speeds = true
  gs.unlockedDisplaySections.valueHistory = true
  gs.unlockedDisplaySections.bestValue = true
}

function resetAction(action: GameStateAction) {
  const didImproveBest = action.currentValue > action.bestValue

  action.progress = 0
  action.currentSpeed = 1
  action.currentValue = 0
  action.valueHistory = []
  action.bestValue = didImproveBest ? action.currentValue : action.bestValue
  action.bestValueHistory = didImproveBest ? action.valueHistory : action.bestValueHistory
}

function handleGoalCompletion() {
  const currentGoal = gs.levels[gs.currentLevel].goals[0]
  if (!currentGoal) return // All goals already achieved

  const currentAmount = gs.levels[gs.currentLevel].resources[currentGoal.resourceName]

  if (currentAmount >= currentGoal.requiredAmount) {
    currentGoal.onComplete(gs)
    gs.levels[gs.currentLevel].goals.shift() // Remove the completed goal
  }
}

function updateActionHistories() {
  Object.values(gs.levels[gs.currentLevel].actions).forEach((action) => {
    const updatedAction = {
      ...action,
      valueHistory: [...action.valueHistory, action.currentValue],
    }
    gs.levels[gs.currentLevel].actions[action.name] = updatedAction
  })
}

function canApplyAction(_action: Action) {
  // TODO: Check action.enabledCondition against gs; or try applying the action and see if all resources are non-negative?
  return true
}

function completeAction(action: Action) {
  if (!canApplyAction(action)) return

  action.effect(gs.levels[gs.currentLevel].resources)
  action.progress = 0
  action.currentValue += 1
  action.currentSpeed = Math.min(action.currentSpeed + 0.2, 4)
  action.permanentSpeed = Math.min(action.permanentSpeed + 0.02, 2.5)
}

export const Game = {
  get state() {
    return gs
  },

  get resources() {
    return Object.entries(gs.levels[gs.currentLevel].resources).map(([name, amount]) => ({ name, amount }))
  },

  get currentGoal() {
    return gs.levels[gs.currentLevel].goals[0] || null
  },

  get currentGoalAmount() {
    return Game.currentGoal ? gs.levels[gs.currentLevel].resources[Game.currentGoal.resourceName] : null
  },

  get currentGoalMaximum() {
    return Game.currentGoal?.requiredAmount ?? 0
  },

  get actionCards() {
    return Object.entries(gs.levels[gs.currentLevel].actions).map(([name, action]) => ({
      ...action,
      ...generatedActions[gs.currentLevel][name].data,
    })) as Action[]
  },

  get visibleActionCards() {
    return Game.actionCards.filter((action) => action.displayed)
  },

  rebirth(newLevelName: LevelName) {
    // Reset all actions, do this before changing the level
    for (const action of Game.actionCards) {
      resetAction(action)
    }

    // Reset all resources, do this before changing the level
    gs.levels[gs.currentLevel].resources = {
      ...gs.levels[gs.currentLevel].initialResources,
    }

    gs.currentLevel = newLevelName
    gs.lifespanLeft = 60
    gs.currentActionName = null
    gs.generation += 1
    gs.currentScreen = 'in-game'
  },

  toggleAction(action: Action) {
    gs.runStarted = true

    // Only toggle if the action can be applied and is not already active
    if (!canApplyAction(action) || (action.enabledCondition?.(gs) ?? false)) {
      return
    }

    gs.currentActionName = gs.currentActionName !== action.name ? action.name : null
  },

  gameTick: () => {
    if (gs.currentScreen !== 'in-game' || !gs.runStarted) {
      return
    }

    gs.lifespanLeft -= TICK_LENGTH // Decrease lifespan by 0.1 seconds each tick
    if (gs.lifespanLeft <= 0) {
      return handleGameOver()
    }

    if (gs.currentActionName) {
      const actionState = gs.levels[gs.currentLevel].actions[gs.currentActionName]
      const actionData = generatedActions[gs.currentLevel][gs.currentActionName].data
      const action: Action = {
        ...actionState,
        ...actionData,
      }

      if (actionState && actionData) {
        actionState.progress += TICK_LENGTH
        console.log(actionState)
        if (actionState.progress >= maxTime(action)) {
          completeAction(action)
        }
      }
    }

    handleGoalCompletion()
    updateActionHistories()
  },

  start: () => {
    setInterval(() => {
      Game.gameTick()
    }, TICK_LENGTH * 1000) // Convert TICK_LENGTH to milliseconds
  },
}
