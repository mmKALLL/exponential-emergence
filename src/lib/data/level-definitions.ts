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
      energy: 0,
      efficiency: 0,
      'food multiplier': 1,
      cells: 0,
    },
    resources: {
      food: 0,
      nutrients: 0,
      energy: 0,
      efficiency: 0,
      'food multiplier': 1,
      cells: 0,
    },
    resourceRecords: {
      food: 0,
      nutrients: 0,
      energy: 0,
      efficiency: 0,
      'food multiplier': 1,
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
        requiredAmount: 30,
        resourceName: 'energy',
        onComplete: (gs) => {
          gs.levels.multicellular.actions['Filter waste'].displayed = true
          return gs
        },
      },
      {
        requiredAmount: 60,
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
        requiredAmount: 4,
        resourceName: 'efficiency',
        onComplete: (gs) => gs,
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
      branches: 2,
      chlorophyll: 10,
      energy: 0,
      hardness: 0,
    },
    resources: {
      millimeters: 0,
      branches: 2,
      chlorophyll: 10,
      energy: 0,
      hardness: 0,
    },
    resourceRecords: {
      millimeters: 0,
      branches: 0,
      chlorophyll: 0,
      energy: 0,
      hardness: 0,
    },
    actions: generatedActions.algae,
    goals: [
      {
        requiredAmount: 500,
        resourceName: 'energy',
        onComplete: (gs) => {
          gs.levels.algae.actions['Rapid harden'].displayed = true
          return gs
        },
      },
      {
        requiredAmount: 1500,
        resourceName: 'hardness',
        onComplete: (gs) => {
          gs.levels.algae.actions['Grow longer'].displayed = true
          return gs
        },
      },
      {
        requiredAmount: 25,
        resourceName: 'millimeters',
        onComplete: (gs) => {
          gs.levels.algae.actions['Branch out'].displayed = true
          return gs
        },
      },
      {
        requiredAmount: 20,
        resourceName: 'branches',
        onComplete: (gs) => {
          gs.levels.algae.actions['Grow chlorophyll'].displayed = true
          return gs
        },
      },
      {
        requiredAmount: 1000,
        resourceName: 'millimeters',
        onComplete: (gs) => {
          gs.levels.insect.unlocked = true
          return gs
        },
      },
    ],
  },

  // Auto-generates its own energy based on digestion level
  insect: {
    name: 'insect',
    unlocked: false,
    initialResources: {
      food: 0,
      energy: 200,
      speed: 0, // typical: 40-50 (multicellular food / 10)
      perception: 20,
      digestion: 0, // typical: 20-100 (chlorophyll / 100)
      pheromones: 0, // typical: 4-10 (multicellular efficiency)
      mates: 0,
      eggs: 0, // target: 10k
    },
    resources: {
      food: 0,
      energy: 200,
      speed: 0,
      perception: 20,
      digestion: 0,
      pheromones: 0,
      mates: 0,
      eggs: 0,
    },
    resourceRecords: {
      food: 0,
      energy: 0,
      speed: 0,
      perception: 0,
      digestion: 0,
      pheromones: 0,
      mates: 0,
      eggs: 0,
    },
    actions: generatedActions.insect,
    goals: [
      {
        requiredAmount: 10000,
        resourceName: 'eggs',
        onComplete: (gs) => {
          gs.levels.crustacean.unlocked = true
          return gs
        },
      },
    ],
  },

  crustacean: {
    name: 'crustacean',
    unlocked: false,
    initialResources: {
      energy: 50,
      targets: 0,
      food: 0,
      strength: 0,
      dexterity: 0,
      health: 0,
      intelligence: 0,
      mass: 0,
    },
    resources: {
      energy: 50,
      targets: 0,
      food: 0,
      strength: 0,
      dexterity: 0,
      health: 0,
      intelligence: 0,
      mass: 0,
    },
    resourceRecords: {
      energy: 0,
      targets: 0,
      food: 0,
      strength: 0,
      dexterity: 0,
      health: 0,
      intelligence: 0,
      mass: 0,
    },
    actions: generatedActions.crustacean,
    goals: [
      {
        requiredAmount: 50,
        resourceName: 'food',
        onComplete: (gs) => {
          gs.levels.crustacean.actions['Consume food'].displayed = true
          return gs
        },
      },
      {
        requiredAmount: 100,
        resourceName: 'energy',
        onComplete: (gs) => {
          gs.levels.crustacean.actions['Rest'].displayed = true
          return gs
        },
      },
      {
        requiredAmount: 100,
        resourceName: 'health',
        onComplete: (gs) => {
          gs.levels.crustacean.actions['Molt exoskeleton'].displayed = true
          return gs
        },
      },
      {
        requiredAmount: 150,
        resourceName: 'food',
        onComplete: (gs) => {
          gs.levels.crustacean.actions['Bulk up'].displayed = true
          return gs
        },
      },
    ],
  },
}
