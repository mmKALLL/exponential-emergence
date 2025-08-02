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
      divisions: 0,
    },
    resources: {
      food: 0,
      energy: 0,
      nutrients: 0,
      divisions: 0,
    },
    resourceRecords: {
      food: 0,
      energy: 0,
      nutrients: 0,
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
        requiredAmount: 10,
        resourceName: 'energy',
        onComplete: (gs) => {
          gs.levels.amoeba.actions['Divide cell'].displayed = true
          return gs
        },
      },
      {
        requiredAmount: 3,
        resourceName: 'divisions',
        onComplete: (gs) => {
          gs.levels.multicellular.unlocked = true
          return gs
        },
      },
    ],
  },

  multicellular: {
    name: 'multicellular',
    unlocked: false,
    initialResources: {
      food: 0,
      nutrients: 0,
      waste: 0,
      energy: 0,
      efficiency: 0,
      cells: 0,
    },
    resources: {
      food: 0,
      nutrients: 0,
      waste: 0,
      energy: 0,
      efficiency: 0,
      cells: 0,
    },
    resourceRecords: {
      food: 0,
      nutrients: 0,
      waste: 0,
      energy: 0,
      efficiency: 0,
      cells: 0,
    },
    actions: generatedActions.multicellular,
    goals: [
      {
        requiredAmount: 20,
        resourceName: 'nutrients',
        onComplete: (gs) => {
          gs.levels.multicellular.actions['Generate energy'].displayed = true
          return gs
        },
      },
      {
        requiredAmount: 20,
        resourceName: 'energy',
        onComplete: (gs) => {
          gs.levels.multicellular.actions['Filter waste'].displayed = true
          return gs
        },
      },
      {
        requiredAmount: 50,
        resourceName: 'energy',
        onComplete: (gs) => {
          gs.levels.multicellular.actions['Multiply'].displayed = true
          return gs
        },
      },
      {
        requiredAmount: 20,
        resourceName: 'cells',
        onComplete: (gs) => {
          gs.levels.multicellular.actions['Specialize'].displayed = true
          return gs
        },
      },
      {
        requiredAmount: 1000,
        resourceName: 'cells',
        onComplete: (gs) => {
          gs.levels.algae.unlocked = true
          return gs
        },
      },
    ],
  },

  algae: {
    name: 'algae',
    unlocked: false,
    initialResources: {
      millimeters: 0,
      branches: 0,
      sunlight: 0,
      chlorophyll: 0,
      energy: 0,
      hardness: 0,
    },
    resources: {
      millimeters: 0,
      branches: 0,
      sunlight: 0,
      chlorophyll: 0,
      energy: 0,
      hardness: 0,
    },
    resourceRecords: {
      millimeters: 0,
      branches: 0,
      sunlight: 0,
      chlorophyll: 0,
      energy: 0,
      hardness: 0,
    },
    actions: generatedActions.algae,
    goals: [],
  },

  // Auto-generates its own energy based on digestion level
  insect: {
    name: 'insect',
    unlocked: false,
    initialResources: {
      speed: 0,
      perception: 0,
      digestion: 0,
      pheromones: 0,
      eggs: 0,
    },
    resources: {
      speed: 0,
      perception: 0,
      digestion: 0,
      pheromones: 0,
      eggs: 0,
    },
    resourceRecords: {
      speed: 0,
      perception: 0,
      digestion: 0,
      pheromones: 0,
      eggs: 0,
    },
    actions: generatedActions.insect,
    goals: [],
  },

  crustacean: {
    name: 'crustacean',
    unlocked: false,
    initialResources: {
      strength: 0,
      dexterity: 0,
      vitality: 0,
      intelligence: 0,
      mass: 0,
    },
    resources: {
      strength: 0,
      dexterity: 0,
      vitality: 0,
      intelligence: 0,
      mass: 0,
    },
    resourceRecords: {
      strength: 0,
      dexterity: 0,
      vitality: 0,
      intelligence: 0,
      mass: 0,
    },
    actions: generatedActions.crustacean,
    goals: [],
  },
}
