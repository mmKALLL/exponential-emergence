import { initialLevelDefinitions } from './data/level-definitions'
import type { GameState } from './types'

const baseInitialGameState: GameState = {
  generation: 1,
  currentScreen: 'main-menu',
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

// - @ts-expect-error
const debugInitialGameState: GameState = {
  ...baseInitialGameState,
  currentScreen: 'rebirth',
  currentLevel: 'multicellular',
  levels: {
    amoeba: {
      ...baseInitialGameState.levels.amoeba,
      resourceRecords: {
        food: 20,
        energy: 20,
        nutrients: 20,
        divisions: 3,
      },
      unlocked: true,
    },
    multicellular: {
      ...baseInitialGameState.levels.multicellular,
      resourceRecords: {
        food: 800,
        nutrients: 800,
        energy: 800,
        efficiency: 4,
        'food multiplier': 15,
        cells: 1400,
      },
      unlocked: true,
    },
    algae: {
      ...baseInitialGameState.levels.algae,
      resourceRecords: {
        millimeters: 1000,
        branches: 15,
        chlorophyll: 500,
        energy: 2000,
        hardness: 1000,
      },
      unlocked: true,
    },
    insect: {
      ...baseInitialGameState.levels.insect,
      resourceRecords: {
        food: 500,
        energy: 1000,
        speed: 100,
        perception: 50,
        digestion: 100,
        pheromones: 10,
        mates: 300,
        eggs: 10000,
      },
      unlocked: true,
    },
    crustacean: {
      ...baseInitialGameState.levels.crustacean,
      resourceRecords: {
        energy: 2000,
        targets: 100,
        food: 1000,
        strength: 100,
        dexterity: 80,
        vitality: 200,
        intelligence: 100,
        mass: 1000,
      },
      unlocked: true,
    },
  },
}

export const initialGameState: GameState = debugInitialGameState
