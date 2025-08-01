import { initialLevelDefinitions } from './data/level-definitions'
import type { GameState } from './types'

export const initialGameState: GameState = {
  generation: 1,
  currentScreen: 'in-game',
  currentLevel: 'amoeba',
  lifespanLeft: 60,
  runStarted: false,
  currentActionName: null,
  levels: initialLevelDefinitions,
  unlockedDisplaySections: {
    speeds: false,
    bestValue: false,
    valueHistory: true,
  },
}
