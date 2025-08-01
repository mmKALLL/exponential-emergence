import type { Action, LevelName, Resources } from '../types'

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
      description: '-1 food => +1 nutrients',
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
      description: '-1 nutrients => +1 energy',
    },
    // {
    //   name: 'Filter waste',
    //   baseTime: 2,
    //   effect: (res: Resources['amoeba']) => {
    //     res.waste -= 1
    //     return res
    //   },
    //   enabledCondition: (res: Resources['amoeba']) => res.waste >= 1,
    //   description: '-1 waste',
    // },
    {
      name: 'Divide cell',
      baseTime: 4,
      effect: (res: Resources['amoeba']) => {
        res.energy -= 6
        res.divisions += 1
        return res
      },
      description: '-6 energy => +1 division',
      enabledCondition: (res: Resources['amoeba']) => res.energy >= 6,
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
