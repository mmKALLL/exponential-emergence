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
      unlocked: true,
      actionCards: {
        'Catch food': generateAction(
          'Catch food',
          8,
          (gs) => {
            gs.levels[gs.currentLevel].resources.food += 1
            return gs
          },
          '8 sec => +1 food',
          true
        ),
        'Generate energy': generateAction(
          'Generate energy',
          6,
          (gs) => {
            gs.levels[gs.currentLevel].resources.food -= 1
            gs.levels[gs.currentLevel].resources.energy += 1
            return gs
          },
          '6 sec, -1 food => +1 energy',
          true
        ),
      },
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
