import { initialLevelDefinitions } from './data/level-definitions'
import type { GameState, Goal, LevelName } from './types'

const fromGameStateToSave = (gameState: GameState) => {
  const deepCopy = JSON.parse(JSON.stringify(gameState))
  Object.keys(deepCopy.levels).forEach((level) => {
    const levelData = deepCopy.levels[level]
    levelData.goals = levelData.goals.map((goal: Goal) => goal.completed)

    for (const action in levelData.actions) {
      delete levelData.actions[action].effect // Remove function for serialization
      delete levelData.actions[action].enabledCondition // Remove function for serialization
      delete levelData.actions[action].displayCondition // Remove function for serialization
      delete levelData.actions[action].gives // Remove function for serialization
      delete levelData.actions[action].takes // Remove function for serialization
      delete levelData.actions[action].description // Remove description for serialization
      delete levelData.actions[action].defaultDisplayed // Remove defaultDisplayed for serialization
      delete levelData.actions[action].name // Remove name for serialization
      levelData.actions[action].valueHistory = levelData.actions[action].valueHistory.slice(-100) // Limit history length
    }
  })

  return deepCopy
}

const fromSaveToGameState = (save: string): GameState => {
  const parsed = JSON.parse(save)
  // Re-add removed properties and functions
  Object.keys(parsed.levels).forEach((level) => {
    const levelData = {
      ...initialLevelDefinitions[level as LevelName],
      ...parsed.levels[level],
      goals: initialLevelDefinitions[level as LevelName].goals.map((goal, index) => ({
        ...goal,
        completed: parsed.levels[level].goals[index] || false,
      })),
    }
    for (const action in levelData.actions) {
      levelData.actions[action] = {
        ...initialLevelDefinitions[level as LevelName].actions[action],
        ...levelData.actions[action],
      }
    }
    parsed.levels[level] = levelData
  })

  return parsed
}

export const save = (gameState: GameState): void => {
  const serializedState = JSON.stringify(fromGameStateToSave(gameState))
  localStorage.setItem('gameState', serializedState)
}

export const load = (): GameState | null => {
  const serializedState = localStorage.getItem('gameState')
  if (!serializedState) return null
  return fromSaveToGameState(serializedState)
}

export const clearSave = (): void => {
  localStorage.removeItem('gameState')
  window.location.reload() // Reload to reset the game state
}
