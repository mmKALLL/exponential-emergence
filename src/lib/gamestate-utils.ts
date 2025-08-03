import { initialLevelDefinitions } from './data/level-definitions'
import type { GameState } from './types'
import { mapObject } from './utils'

const baseInitialGameState: GameState = {
  generation: 1,
  currentScreen: 'main-menu',
  currentLevel: 'amoeba',
  lifespanLeft: 60,
  runStarted: false,
  currentActionName: null,
  levels: initialLevelDefinitions,
  timesExtendedLifespan: 0,
  triggerVictoryScreen: false,
  unlockedDisplaySections: {
    speeds: false,
    bestValue: false,
    valueHistory: true,
    synergyHelpText: false,
    synergyHelpTextAddition: false,
  },
}

// - @ts-expect-error
const debugInitialGameState: GameState = {
  ...baseInitialGameState,
  currentScreen: 'rebirth',
  currentLevel: 'multicellular',
  unlockedDisplaySections: {
    speeds: true,
    bestValue: true,
    valueHistory: true,
    synergyHelpText: true,
    synergyHelpTextAddition: true,
  },
  levels: {
    amoeba: {
      ...baseInitialGameState.levels.amoeba,
      resourceRecords: {
        food: 20,
        energy: 40,
        nutrients: 20,
        divisions: 3,
      },
      actions: {
        ...mapObject(baseInitialGameState.levels.amoeba.actions, (a) => ({
          ...a,
          permanentSpeed: 2,
        })),
      },
      unlocked: true,
    },
    multicellular: {
      ...baseInitialGameState.levels.multicellular,
      resourceRecords: {
        food: 800,
        nutrients: 1000,
        energy: 800,
        efficiency: 4,
        'food multiplier': 15,
        cells: 1400,
      },
      unlocked: true,
      actions: {
        ...mapObject(baseInitialGameState.levels.multicellular.actions, (a) => ({
          ...a,
          permanentSpeed: 2,
        })),
      },
    },
    algae: {
      ...baseInitialGameState.levels.algae,
      resourceRecords: {
        millimeters: 1000,
        branches: 15,
        chlorophyll: 5000,
        energy: 2000,
        hardness: 1000,
      },
      unlocked: true,
      actions: {
        ...mapObject(baseInitialGameState.levels.algae.actions, (a) => ({
          ...a,
          permanentSpeed: 2,
        })),
      },
    },
    insect: {
      ...baseInitialGameState.levels.insect,
      resourceRecords: {
        food: 2000,
        energy: 1000,
        workers: 200,
        perception: 80,
        digestion: 150,
        pheromones: 100,
        mates: 500,
        eggs: 10000,
      },
      unlocked: true,
      actions: {
        ...mapObject(baseInitialGameState.levels.insect.actions, (a) => ({
          ...a,
          permanentSpeed: 2,
        })),
      },
    },
    crustacean: {
      ...baseInitialGameState.levels.crustacean,
      resourceRecords: {
        energy: 2000,
        targets: 100,
        food: 1000,
        strength: 100,
        health: 200,
        intelligence: 100,
        mass: 1000,
      },
      unlocked: true,
    },
  },
}

export const initialGameState: GameState = debugInitialGameState
