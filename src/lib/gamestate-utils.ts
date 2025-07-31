import { generateAction } from './type-utils'
import type { Action, GameState } from './types'

export const initialGameState: GameState = {
  generation: 1,
  currentScreen: 'in-game',
  currentLevel: 'amoeba',
  lifespanLeft: 60,
  currentActionName: null,
  levels: {
    amoeba: {
      name: 'amoeba',
      actionCards: [
        generateAction(
          'Catch food',
          10,
          (gs) => {
            gs.levels[gs.currentLevel].resources.food += 1
            return gs
          },
          true
        ),
        generateAction(
          'Generate energy',
          6,
          (gs) => {
            gs.levels[gs.currentLevel].resources.food -= 1
            gs.levels[gs.currentLevel].resources.energy += 1
            return gs
          },
          true
        ),
      ],
      goals: [
        { requiredAmount: 10, resourceName: 'food' },
        { requiredAmount: 10, resourceName: 'energy' },
      ],
      initialResources: {
        food: 0,
        energy: 0,
      },
      resources: {
        food: 0,
        energy: 0,
      },
      resourceOutputs: {
        food: 0,
      },
    },
  },
  unlockedDisplaySections: { speeds: false, bestValue: false, valueHistory: false },
}
