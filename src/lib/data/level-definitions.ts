import type { GameState } from '../types'
import { generatedActions } from './action-definitions'

export const initialLevelDefinitions: GameState['levels'] = {
  amoeba: {
    name: 'amoeba',
    unlocked: true,
    initialResources: {
      food: 0,
      energy: 0,
      nutrients: 0,
      waste: 0,
      divisions: 0,
    },
    resources: {
      food: 0,
      energy: 0,
      nutrients: 0,
      waste: 0,
      divisions: 0,
    },
    resourceOutputs: {
      energy: 0,
      divisions: 0,
    },
    actions: generatedActions.amoeba,
    goals: [
      {
        requiredAmount: 5,
        resourceName: 'food',
        onComplete: (gs) => {
          gs.levels.amoeba.actions['Absorb food'].displayed = true
          return gs
        },
      },
      {
        requiredAmount: 4,
        resourceName: 'nutrients',
        onComplete: (gs) => {
          gs.levels.amoeba.actions['Generate energy'].displayed = true
          return gs
        },
      },
      {
        requiredAmount: 4,
        resourceName: 'energy',
        onComplete: (gs) => {
          gs.levels.amoeba.actions['Filter waste'].displayed = true
          return gs
        },
      },
      {
        requiredAmount: 12,
        resourceName: 'energy',
        onComplete: (gs) => {
          gs.levels.amoeba.actions['Divide cell'].displayed = true
          return gs
        },
      },
      { requiredAmount: 3, resourceName: 'divisions', onComplete: (gs) => gs }, // TODO: Unlock next stage
    ],
  },
}
