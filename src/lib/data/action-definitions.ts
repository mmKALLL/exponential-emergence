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
      description: '-10 waste',
    },
    {
      name: 'Multiply',
      baseTime: 4,
      effect: (res: Resources['multicellular']) => {
        res.energy -= (10 - res.efficiency) * res.cells
        res.cells *= 2
        return res
      },
      enabledCondition: (res: Resources['multicellular']) => res.waste <= 0 && res.energy >= (10 - res.efficiency) * res.cells,
      description: '10 energy per cell => x2 cells\n‼️ Requires 0 waste', // TODO: Dynamic description
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
