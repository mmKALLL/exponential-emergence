import { generateAction } from '../type-utils'
import type { GameState } from '../types'

export const initialLevelDefinitions: GameState['levels'] = {
  amoeba: {
    name: 'amoeba',
    unlocked: true,
    initialResources: {
      food: 0,
      energy: 3,
      nutrients: 0,
      waste: 0,
      divisions: 0,
    },
    resources: {
      food: 0,
      energy: 3,
      nutrients: 0,
      waste: 0,
      divisions: 0,
    },
    resourceOutputs: {
      energy: 0,
      divisions: 0,
    },
    actionCards: {
      'Catch food': generateAction(
        'Catch food',
        8,
        (res) => {
          res.food += 2
          res.energy -= 1
          return res
        },
        '8 sec, -1 energy => +2 food',
        true
      ),
      'Absorb food': generateAction(
        'Absorb food',
        6,
        (res) => {
          res.food -= 1
          res.nutrients += 1
          res.waste += 1
          return res
        },
        '7 sec, -1 food => +1 nutrients, +1 waste'
      ),
      'Generate energy': generateAction(
        'Generate energy',
        5,
        (res) => {
          res.nutrients -= 1
          res.energy += 1
          return res
        },
        '5 sec, -1 nutrients => +1 energy'
      ),
      'Filter waste': generateAction(
        'Filter waste',
        4,
        (res) => {
          res.waste -= 1
          return res
        },
        '4 sec, -1 waste'
      ),
      'Divide cell': generateAction(
        'Divide cell',
        8,
        // TODO: Make this action require 0 waste
        (res) => {
          res.energy -= 6
          res.divisions += 1
          return res
        },
        '8 sec, -6 energy => +1 division\n‼️ Requires 0 waste'
      ),
    },
    goals: [
      {
        requiredAmount: 5,
        resourceName: 'food',
        onComplete: (gs) => {
          gs.levels.amoeba.actionCards['Absorb food'].displayed = true
          return gs
        },
      },
      {
        requiredAmount: 5,
        resourceName: 'nutrients',
        onComplete: (gs) => {
          gs.levels.amoeba.actionCards['Generate energy'].displayed = true
          return gs
        },
      },
      {
        requiredAmount: 4,
        resourceName: 'energy',
        onComplete: (gs) => {
          gs.levels.amoeba.actionCards['Filter waste'].displayed = true
          return gs
        },
      },
      {
        requiredAmount: 10,
        resourceName: 'energy',
        onComplete: (gs) => {
          gs.levels.amoeba.actionCards['Divide cell'].displayed = true
          return gs
        },
      },
      { requiredAmount: 3, resourceName: 'divisions', onComplete: (gs) => gs }, // TODO: Unlock next stage
    ],
  },
}
