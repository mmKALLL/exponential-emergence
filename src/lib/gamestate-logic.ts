import { synergyDefinitions } from './data/synergy-definitions'
import { initialGameState } from './gamestate-utils'
import { MAX_LIFESPAN, TICK_LENGTH, type Action, type LevelName, type Resources } from './types'
import { maxTime, typedObjectEntries } from './utils'

const gs = { ...initialGameState }

function handleGameOver() {
  gs.currentScreen = 'rebirth'
  gs.lifespanLeft = 0
  gs.runStarted = false
  gs.currentActionName = null
  gs.unlockedDisplaySections.speeds = true
  gs.unlockedDisplaySections.valueHistory = true
  gs.unlockedDisplaySections.bestValue = true

  updateResourceRecords()
}

function updateResourceRecords() {
  const currentLevel = Game.currentLevel
  Object.entries(Game.resourceRecords)
    .map(([resourceName, amount]) => {
      const newAmount = Math.max(amount, currentLevel.resources[resourceName as keyof Resources[LevelName]] || 0)
      return { name: resourceName, amount: newAmount }
    })
    .forEach(({ name, amount }) => {
      // @ts-expect-error TypeScript doesn't know that name is a key of Resources[LevelName]
      currentLevel.resourceRecords[name] = amount
    })
}

function resetAction(action: Action) {
  const didImproveBest = action.currentValue > action.bestValue
  action.bestValue = didImproveBest ? action.currentValue : action.bestValue
  action.bestValueHistory = didImproveBest ? action.valueHistory : action.bestValueHistory

  action.progress = 0
  action.currentSpeed = 1
  action.currentValue = 0
  action.valueHistory = []
}

function handleGoalCompletion() {
  const currentGoal = Game.currentLevel.goals[0]
  if (!currentGoal) return // All goals already achieved

  const currentAmount = Game.currentGoalAmount

  if (currentAmount !== null && currentAmount >= currentGoal.requiredAmount) {
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

export function canApplyAction(action: Action) {
  if (!action.enabledCondition) return true // No condition means the action is always allowed
  return action.enabledCondition(Game.currentLevel.resources)
}

function completeAction(action: Action) {
  if (!canApplyAction(action)) return

  action.effect(Game.currentLevel.resources)
  action.progress = 0
  action.currentValue += 1
  action.currentSpeed = Math.min(action.currentSpeed + 0.2, 4)
  action.permanentSpeed = Math.min(action.permanentSpeed + 0.04, 3)
  // If action is no longer allowed after the effect, toggle it off
  if (!canApplyAction(action)) {
    gs.currentActionName = null
  }
}

let lastUpdate = Date.now()

export const Game = {
  get state() {
    return gs
  },

  get currentLevel() {
    return gs.levels[gs.currentLevel]
  },

  get unlockedLevels(): LevelName[] {
    return typedObjectEntries(gs.levels)
      .filter(([_, level]) => level.unlocked)
      .map(([name, _]) => name)
  },

  get resources() {
    return Object.entries(Game.currentLevel.resources).map(([name, amount]) => ({ name, amount }))
  },

  // Synergies that affect the current level, group by basedOn.level
  get synergies() {
    return synergyDefinitions
      .filter((synergy) => synergy.affectedLevel === gs.currentLevel && gs.levels[synergy.basedOn.level].unlocked)
      .map((synergy) => ({
        ...synergy,
        record:
          (gs.levels[synergy.basedOn.level].resourceRecords[synergy.basedOn.resourceName as keyof Resources[LevelName]] as number) || 0,
        description: synergy.description(
          (gs.levels[synergy.basedOn.level].resourceRecords[synergy.basedOn.resourceName as keyof Resources[LevelName]] as number) || 0
        ),
      }))
      .reduce(
        (acc, synergy) => {
          const s = acc.find((s) => s.basedOnLevel === synergy.basedOn.level)
          if (s) {
            s.synergyList.push({
              basedOnResourceName: synergy.basedOn.resourceName,
              record: synergy.record,
              description: synergy.description,
            })
          } else {
            acc.push({
              basedOnLevel: synergy.basedOn.level,
              synergyList: [
                {
                  basedOnResourceName: synergy.basedOn.resourceName,
                  record: synergy.record,
                  description: synergy.description,
                },
              ],
            })
          }
          return acc
        },
        [] as {
          basedOnLevel: string
          synergyList: {
            basedOnResourceName: string
            record: number
            description: string
          }[]
        }[]
      )
  },

  // Synergies that affect other levels based on the current level,
  // group by basedOn.level and basedOn.resourceName
  get outBoundSynergies() {
    return synergyDefinitions
      .filter((synergy) => synergy.basedOn.level === gs.currentLevel && gs.levels[synergy.affectedLevel].unlocked)
      .map((synergy) => ({
        ...synergy,
        record: gs.levels[synergy.basedOn.level].resourceRecords[synergy.basedOn.resourceName as keyof Resources[LevelName]] || 0,
        description: synergy.description(
          gs.levels[synergy.basedOn.level].resourceRecords[synergy.basedOn.resourceName as keyof Resources[LevelName]] || 0
        ),
      }))
      .reduce(
        (acc, synergy) => {
          const s = acc.find((s) => s.basedOn.level === synergy.basedOn.level && s.basedOn.resourceName === synergy.basedOn.resourceName)
          if (s) {
            s.synergyList.push({ description: synergy.description, affectedLevel: synergy.affectedLevel })
          } else {
            acc.push({
              basedOn: synergy.basedOn,
              record: synergy.record,
              synergyList: [{ description: synergy.description, affectedLevel: synergy.affectedLevel }],
            })
          }
          return acc
        },
        [] as {
          basedOn: { level: string; resourceName: string }
          record: number
          synergyList: { description: string; affectedLevel: LevelName }[]
        }[]
      )
  },

  get resourceRecords() {
    return Game.currentLevel.resourceRecords
  },

  get currentGoal() {
    return Game.currentLevel.goals[0] || null
  },

  get currentGoalAmount() {
    return Game.currentGoal ? (Game.currentLevel.resources[Game.currentGoal.resourceName as keyof Resources[LevelName]] as number) : null
  },

  get currentGoalMaximum() {
    return Game.currentGoal?.requiredAmount ?? 0
  },

  get currentSunlight() {
    const currentSec = MAX_LIFESPAN - Game.state.lifespanLeft

    // Off-centered sinusoidal function that oscillates between 0 and 100 twice, with peaks starting at 8 and 53 seconds
    const functionValue = (Math.sin((currentSec / 60) * 5 * Math.PI - 0.5) + 0.48) * 100
    return Math.max(0, Math.min(100, functionValue))
  },

  get sunlightMaximum() {
    return 100
  },

  get actionCards() {
    return Object.values(Game.currentLevel.actions)
  },

  get visibleActionCards() {
    return Game.actionCards.filter((action) => action.displayed)
  },

  startGame() {
    gs.currentScreen = 'in-game'
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

    // Apply synergies for the new level
    synergyDefinitions
      .filter((synergy) => synergy.affectedLevel === newLevelName)
      .forEach((synergy) => {
        synergy.onLevelStart?.(
          gs,
          gs.levels[synergy.basedOn.level].resourceRecords[synergy.basedOn.resourceName as keyof Resources[LevelName]] || 0
        )
      })
  },

  toggleAction(action: Action) {
    gs.runStarted = true

    // Only toggle if the action can be applied and is not already active
    if (!canApplyAction(action)) {
      return
    }

    gs.currentActionName = gs.currentActionName !== action.name ? action.name : null
  },

  gameTick: () => {
    const now = Date.now()
    const diff = (now - lastUpdate) / 1000 // Convert milliseconds to seconds
    lastUpdate = now
    if (gs.currentScreen !== 'in-game' || !gs.runStarted) {
      return
    }

    if (gs.currentActionName === null) {
      return // No action is currently active
    }

    gs.lifespanLeft -= diff // Decrease lifespan by the time elapsed since the last tick
    if (gs.lifespanLeft <= 0) {
      return handleGameOver()
    }

    const action = Game.currentLevel.actions[gs.currentActionName]
    if (action) {
      action.progress += diff
      if (action.progress >= maxTime(action)) {
        completeAction(action)
      }
    }

    handleGoalCompletion()
    updateActionHistories()
    updateResourceRecords()
  },

  start: () => {
    setInterval(() => {
      Game.gameTick()
    }, TICK_LENGTH * 1000) // Convert TICK_LENGTH to milliseconds
  },
}
