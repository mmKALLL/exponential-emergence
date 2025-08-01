import { initialGameState } from './gamestate-utils'
import { TICK_LENGTH, type Action, type LevelName } from './types'
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

function resetAction(action: Action) {
  const didImproveBest = action.currentValue > action.bestValue

  action.progress = 0
  action.currentSpeed = 1
  action.currentValue = 0
  action.valueHistory = []
  action.bestValue = didImproveBest ? action.currentValue : action.bestValue
  action.bestValueHistory = didImproveBest ? action.valueHistory : action.bestValueHistory
}

function handleGoalCompletion() {
  const currentGoal = Game.currentLevel.goals[0]
  if (!currentGoal) return // All goals already achieved

  const currentAmount = Game.currentLevel.resources[currentGoal.resourceName]

  if (currentAmount >= currentGoal.requiredAmount) {
    currentGoal.onComplete(gs)
    Game.currentLevel.goals.shift() // Remove the completed goal
  }
}

function updateActionHistories() {
  Object.values(Game.currentLevel.actions).forEach((action) => {
    const updatedAction = {
      ...action,
      valueHistory: [...action.valueHistory, action.currentValue],
    }
    Game.currentLevel.actions[action.name] = updatedAction
  })
}

function canApplyAction(_action: Action) {
  // TODO: Check action.enabledCondition against gs; or try applying the action and see if all resources are non-negative?
  return true
}

function actionAllowed(action: Action) {
  if (!action.enabledCondition) return true // No condition means the action is always allowed
  return action.enabledCondition(Game.currentLevel.resources)
}

function completeAction(action: Action) {
  if (!canApplyAction(action)) return

  action.effect(Game.currentLevel.resources)
  action.progress = 0
  action.currentValue += 1
  action.currentSpeed = Math.min(action.currentSpeed + 0.2, 4)
  action.permanentSpeed = Math.min(action.permanentSpeed + 0.02, 2.5)
  // If action is no longer allowed after the effect, toggle it off
  if (!actionAllowed(action)) {
    gs.currentActionName = null
  }
}

export const Game = {
  get state() {
    return gs
  },

  get currentLevel() {
    return gs.levels[gs.currentLevel]
  },

  get resources() {
    return Object.entries(Game.currentLevel.resources).map(([name, amount]) => ({ name, amount }))
  },

  get currentGoal() {
    return Game.currentLevel.goals[0] || null
  },

  get currentGoalAmount() {
    return Game.currentGoal ? Game.currentLevel.resources[Game.currentGoal.resourceName] : null
  },

  get currentGoalMaximum() {
    return Game.currentGoal?.requiredAmount ?? 0
  },

  get actionCards() {
    return Object.values(Game.currentLevel.actions)
  },

  get visibleActionCards() {
    return Game.actionCards.filter((action) => action.displayed)
  },

  rebirth(newLevelName: LevelName) {
    // Reset all actions, do this before changing the level
    for (const actionName in Game.currentLevel.actions) {
      const action = Game.currentLevel.actions[actionName]
      resetAction(action)
    }

    // Reset all resources, do this before changing the level
    Game.currentLevel.resources = {
      ...Game.currentLevel.initialResources,
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
    if (!canApplyAction(action) || !actionAllowed(action)) {
      return
    }

    gs.currentActionName = gs.currentActionName !== action.name ? action.name : null
  },

  gameTick: () => {
    if (gs.currentScreen !== 'in-game' || !gs.runStarted) {
      return
    }

    if (gs.currentActionName) {
      gs.lifespanLeft -= TICK_LENGTH // Decrease lifespan by 0.1 seconds each tick
      if (gs.lifespanLeft <= 0) {
        return handleGameOver()
      }

      const action = Game.currentLevel.actions[gs.currentActionName]
      if (action) {
        action.progress += TICK_LENGTH
        if (action.progress >= maxTime(action)) {
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
