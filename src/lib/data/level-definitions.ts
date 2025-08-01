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
      energy: 20, // TODO: Revert after implementing synergies
      efficiency: 0,
      cells: 3,
    },
    resources: {
      food: 0,
      nutrients: 0,
      waste: 0,
      energy: 20,
      efficiency: 0,
      cells: 3,
    },
    resourceInputs: [
      {
        level: 'amoeba',
        resourceName: 'divisions',
        description: 'You start with this many cells.',
      },
      {
        level: 'amoeba',
        resourceName: 'energy',
        description: 'You start with this much energy.',
      },
    ],
    resourceOutputs: {
      efficiency: 0,
      nutrients: 0,
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
          // TODO: add algae unlock once multicellular is finished
          // gs.levels.algae.unlocked = true
          return gs
        },
      },
    ],
  },

  algae: {
    name: 'algae',
    unlocked: false,
    initialResources: {
      micrometers: 0,
      branches: 0,
      sunlight: 0,
      chlorophyll: 0,
      energy: 0,
      hardness: 0,
    },
    resources: {
      micrometers: 0,
      branches: 0,
      sunlight: 0,
      chlorophyll: 0,
      energy: 0,
      hardness: 0,
    },
    // TODO: Make sure all of these are in the outputs
    resourceInputs: [
      { level: 'multicellular', resourceName: 'cells', description: 'You start with this many micrometers.' },
      { level: 'multicellular', resourceName: 'nutrients', description: 'You start with this much chlorophyll.' },
      { level: 'multicellular', resourceName: 'efficiency', description: 'You start with this much energy and sunlight.' },
    ],
    resourceOutputs: {
      hardness: 0,
      micrometers: 0,
    },
    actions: generatedActions.algae,
    goals: [],
  },

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
    // TODO: Make sure all of these are in the outputs
    resourceInputs: [
      { level: 'multicellular', resourceName: 'food', description: 'Improves movement speed (1/10).' },
      { level: 'algae', resourceName: 'chlorophyll', description: 'Improves digestion rank (1/100).' },
    ],
    resourceOutputs: {
      speed: 0,
      perception: 0,
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
    // TODO: Make sure all of these are in the outputs
    resourceInputs: [
      { level: 'amoeba', resourceName: 'energy', description: 'Start with this much strength.' },
      { level: 'insect', resourceName: 'speed', description: 'Start with this much dexterity.' },
      { level: 'algae', resourceName: 'hardness', description: 'Start with this much vitality.' },
      { level: 'insect', resourceName: 'perception', description: 'Start with this much intelligence.' },
      { level: 'multicellular', resourceName: 'cells', description: 'Start with this much mass.' },
    ],
    resourceOutputs: {
      strength: 0,
      dexterity: 0,
    },
    actions: generatedActions.crustacean,
    goals: [],
  },
}
