import { Game } from '../gamestate-logic'
import type { Action, LevelName, Resources } from '../types'

// TODO: Add typing; not as easy as it looks
export const actionDefinitions = {
  amoeba: [
    {
      name: 'Catch food',
      baseTime: 4,
      effect: (res: Resources['amoeba']) => {
        res.food += 1
        return res
      },
      description: '+1 food',
      defaultDisplayed: true,
    },
    {
      name: 'Absorb food',
      baseTime: 6,
      effect: (res: Resources['amoeba']) => {
        res.food -= 1
        res.nutrients += 1
        return res
      },
      enabledCondition: (res: Resources['amoeba']) => res.food >= 1,
      description: '-1 food => +1 nutrient',
    },
    {
      name: 'Generate energy',
      baseTime: 2,
      effect: (res: Resources['amoeba']) => {
        res.nutrients -= 1
        res.energy += 1
        return res
      },
      enabledCondition: (res: Resources['amoeba']) => res.nutrients >= 1,
      description: '-1 nutrient => +1 energy',
    },
    {
      name: 'Divide cell',
      baseTime: 4,
      effect: (res: Resources['amoeba']) => {
        res.energy -= 5
        res.divisions += 1
        return res
      },
      description: '-5 energy => +1 division',
      enabledCondition: (res: Resources['amoeba']) => res.energy >= 5,
    },
  ],

  multicellular: [
    {
      name: 'Catch food',
      baseTime: 8,
      effect: (res: Resources['multicellular']) => {
        res.food += 20
        return res
      },
      description: '+20 food',
      defaultDisplayed: true,
    },
    {
      name: 'Process food',
      baseTime: 4,
      effect: (res: Resources['multicellular']) => {
        res.food -= res.cells
        res.nutrients += res.cells
        res.waste += res.cells
        return res
      },
      enabledCondition: (res: Resources['multicellular']) => res.food >= res.cells,
      description: 'Each cell:\n-1 food => +1 nutrient, +1 waste',
      defaultDisplayed: true,
    },
    {
      name: 'Generate energy',
      baseTime: 2,
      effect: (res: Resources['multicellular']) => {
        res.nutrients -= res.cells
        res.energy += res.cells
        return res
      },
      enabledCondition: (res: Resources['multicellular']) => res.nutrients >= res.cells,
      description: 'Each cell:\n-1 nutrient => +1 energy',
    },
    {
      name: 'Filter waste',
      baseTime: 2,
      effect: (res: Resources['multicellular']) => {
        res.waste = Math.max(res.waste - 10, 0)
        return res
      },
      enabledCondition: (res: Resources['multicellular']) => res.waste >= 1,
      description: '-10 waste', // TODO: Dynamic description
    },
    {
      name: 'Multiply',
      baseTime: 4,
      effect: (res: Resources['multicellular']) => {
        res.energy -= (5 - res.efficiency) * res.cells
        res.cells *= 2
        return res
      },
      enabledCondition: (res: Resources['multicellular']) => res.waste <= 0 && res.energy >= (5 - res.efficiency) * res.cells,
      description: '5 energy per cell => x2 cells\n‼️ Requires 0 waste',
    },
    {
      name: 'Specialize',
      baseTime: 4,
      effect: (res: Resources['multicellular']) => {
        res.energy -= 20
        res.efficiency += 10
        return res
      },
      enabledCondition: (res: Resources['multicellular']) => res.energy >= 20,
      description: '-20 energy => Improve food gain and waste filtering by 10',
    },
  ],

  // Branching in algae: add +1 multiplier to chlorophyll, but divide current hardness by 2
  // Algae has two passive actions: sunlight goes up and down twice per life, and chlorophyll absorbs it into energy
  // Sunlight: 0s 0, 10s 100, 20s 100, 30s 0, 40s 0, 50s 100, 60s 100
  algae: [
    {
      name: 'Harden',
      baseTime: 4,
      description: '+20 hardness',
      effect: (res: Resources['algae']) => {
        res.hardness += 20
        return res
      },
      defaultDisplayed: true,
    },
    {
      name: 'Rapid harden',
      baseTime: 3,
      description: '-100 energy => +100 hardness',
      effect: (res: Resources['algae']) => {
        res.energy -= 100
        res.hardness += 100
        return res
      },
      enabledCondition: (res: Resources['algae']) => res.energy >= 100,
      defaultDisplayed: true,
    },
    {
      name: 'Grow length',
      baseTime: 4,
      description: '-100 hardness => +1 millimeter per branch',
      effect: (res: Resources['algae']) => {
        res.hardness -= 100
        res.millimeters += res.branches
        return res
      },
      enabledCondition: (res: Resources['algae']) => res.hardness >= 100,
    },
    {
      name: 'Branch out',
      baseTime: 6,
      description: '-10 millimeters, -100 energy => +1 branch',
      effect: (res: Resources['algae']) => {
        res.millimeters -= 10
        res.energy -= 100
        res.branches += 1
        return res
      },
    },
    {
      name: 'Sunbathe',
      baseTime: 4,
      description: '+1 energy per chlorophyll * sunlight',
      effect: (res: Resources['algae']) => {
        res.energy += res.chlorophyll * (Game.currentSunlight / 100)
        return res
      },
    },
    {
      name: 'Grow chlorophyll',
      baseTime: 5,
      description: 'Each millimeter:\n-10 energy => +1 chlorophyll',
      effect: (res: Resources['algae']) => {
        res.energy -= 10 * res.millimeters
        res.chlorophyll += res.millimeters
        return res
      },
      enabledCondition: (res: Resources['algae']) => res.energy >= 10 * res.millimeters,
    },
  ],
}

export const defaultActionGameState = () => ({
  progress: 0,
  currentSpeed: 1,
  permanentSpeed: 1,
  currentValue: 0,
  valueHistory: [],
  bestValue: 0,
  bestValueHistory: [],
})

export const generatedActions = Object.entries(actionDefinitions).reduce(
  (acc, [level, actions]) => {
    acc[level as LevelName] = actions.reduce(
      (levelAcc, action) => {
        levelAcc[action.name] = {
          ...action,
          ...defaultActionGameState(),
          displayed: action.defaultDisplayed ?? false,
        } as Action // TODO: This type assertion shouldn't be necessary, but it seems a bit tricky to get around
        return levelAcc
      },
      {} as Record<string, Action>
    )
    return acc
  },
  {} as { [level in LevelName]: Record<string, Action> }
)
