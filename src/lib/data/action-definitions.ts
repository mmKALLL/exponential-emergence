import type { Action, ActionConfig, LevelName } from '../types'

export const actionDefinitions: { [level in LevelName]: ActionConfig[] } = {
  amoeba: [
    {
      name: 'Catch food',
      baseTime: 8,
      effect: (res) => {
        res.food += 2
        res.energy -= 1
        return res
      },
      description: '8 sec, -1 energy => +2 food',
      defaultDisplayed: true,
    },
    {
      name: 'Absorb food',
      baseTime: 6,
      effect: (res) => {
        res.food -= 1
        res.nutrients += 1
        res.waste += 1
        return res
      },
      description: '7 sec, -1 food => +1 nutrients, +1 waste',
    },
    {
      name: 'Generate energy',
      baseTime: 5,
      effect: (res) => {
        res.nutrients -= 1
        res.energy += 1
        return res
      },
      description: '5 sec, -1 nutrients => +1 energy',
    },
    {
      name: 'Filter waste',
      baseTime: 4,
      effect: (res) => {
        res.waste -= 1
        return res
      },
      description: '4 sec, -1 waste => no waste',
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
        }
        return levelAcc
      },
      {} as Record<string, Action>
    )
    return acc
  },
  {} as { [level in LevelName]: Record<string, Action> }
)
