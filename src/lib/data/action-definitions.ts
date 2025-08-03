import { Game } from '../gamestate-logic'
import type { Action, ActionConfig, LevelName, Resources } from '../types'
import { formatNumber } from '../utils'

// TODO: Add typing; not as easy as it looks
export const actionDefinitions: { [T in LevelName]: ActionConfig<T>[] } = {
  amoeba: [
    {
      name: 'Catch food',
      baseTime: 4,
      effect: (res: Resources['amoeba']) => {
        res.food += 1
        return res
      },
      gives: ['+1 food'],
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
      gives: ['+1 nutrient'],
      takes: ['-1 food'],
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
      gives: ['+1 energy'],
      takes: ['-1 nutrient'],
    },
    {
      name: 'Divide cell',
      baseTime: 4,
      effect: (res: Resources['amoeba']) => {
        res.energy -= 5
        res.divisions += 1
        return res
      },
      enabledCondition: (res: Resources['amoeba']) => res.energy >= 5,
      gives: ['+1 division'],
      takes: ['-5 energy'],
    },
  ],

  multicellular: [
    {
      name: 'Catch food',
      baseTime: 5,
      effect: (res: Resources['multicellular']) => {
        res.food += 20 * res['food multiplier']
        return res
      },
      description: 'Affected by food multiplier',
      gives: [(gs: Resources['multicellular']) => `+${formatNumber(20 * gs['food multiplier'])} food`],
      defaultDisplayed: true,
    },
    {
      name: 'Process food',
      baseTime: 4,
      effect: (res: Resources['multicellular']) => {
        res.food -= res.cells
        res.nutrients += res.cells
        return res
      },
      enabledCondition: (res: Resources['multicellular']) => res.food >= res.cells,
      description: 'Affected by cell count',
      gives: [(gs: Resources['multicellular']) => `+${formatNumber(gs.cells)} nutrients`],
      takes: [(gs: Resources['multicellular']) => `-${formatNumber(gs.cells)} food`],
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
      description: 'Affected by cell count',
      gives: [(gs: Resources['multicellular']) => `+${formatNumber(gs.cells)} energy`],
      takes: [(gs: Resources['multicellular']) => `-${formatNumber(gs.cells)} nutrients`],
      defaultDisplayed: true,
    },
    {
      name: 'Filter waste',
      baseTime: 4,
      effect: (res: Resources['multicellular']) => {
        res['food multiplier'] += 1
        return res
      },
      gives: ['+1 food multiplier'],
    },
    {
      name: 'Multiply',
      baseTime: 3,
      effect: (res: Resources['multicellular']) => {
        res.energy -= Math.max(1, 5 - res.efficiency) * res.cells
        res.cells *= 2
        return res
      },
      enabledCondition: (res: Resources['multicellular']) => res.energy >= Math.max(1, 5 - res.efficiency) * res.cells,
      gives: ['x2 cells'],
      takes: [(gs: Resources['multicellular']) => `-${Math.max(1, 5 - gs.efficiency) * gs.cells} energy`],
    },
    {
      name: 'Specialize',
      baseTime: 2,
      effect: (res: Resources['multicellular']) => {
        res.energy -= 20
        res.efficiency += 1
        return res
      },
      enabledCondition: (res: Resources['multicellular']) => res.energy >= 20,
      description: 'Makes Multiply cheaper',
      gives: ['+1 efficiency'],
      takes: ['-20 energy'],
    },
  ],

  // Branching in algae: add +1 multiplier to chlorophyll, but divide current hardness by 2
  // Algae has two passive actions: sunlight goes up and down twice per life, and chlorophyll absorbs it into energy
  // Sunlight: 0s 0, 10s 100, 20s 100, 30s 0, 40s 0, 50s 100, 60s 100
  algae: [
    {
      name: 'Sunbathe',
      baseTime: 4,
      description: 'Based on sunlight, chlorophyll',
      gives: [(gs: Resources['algae']) => `+${formatNumber((gs.chlorophyll * Game.currentSunlight) / 100, 2)} energy`],
      effect: (res: Resources['algae']) => {
        res.energy += res.chlorophyll * (Game.currentSunlight / 100)
        return res
      },
      defaultDisplayed: true,
    },
    {
      name: 'Harden',
      baseTime: 3,
      gives: ['+20 hardness'],
      effect: (res: Resources['algae']) => {
        res.hardness += 20
        return res
      },
      defaultDisplayed: true,
    },
    {
      name: 'Rapid harden',
      baseTime: 2,
      gives: ['+100 hardness'],
      takes: ['-100 energy'],
      effect: (res: Resources['algae']) => {
        res.energy -= 100
        res.hardness += 100
        return res
      },
      enabledCondition: (res: Resources['algae']) => res.energy >= 100,
      defaultDisplayed: true,
    },
    {
      name: 'Grow longer',
      baseTime: 4,
      description: '+1 millimeter per branch',
      gives: [(gs: Resources['algae']) => `+${formatNumber(gs.branches)} millimeters`],
      takes: ['-100 hardness'],
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
      gives: ['+1 branch'],
      takes: ['-10 millimeters'],
      effect: (res: Resources['algae']) => {
        res.millimeters -= 10
        res.branches += 1
        return res
      },
      enabledCondition: (res: Resources['algae']) => res.millimeters >= 10,
    },
    {
      name: 'Grow chlorophyll',
      baseTime: 5,
      description: 'Affected by millimeters',
      gives: [(gs: Resources['algae']) => `+${gs.millimeters} chlorophyll`],
      takes: [(gs: Resources['algae']) => `-${5 * gs.millimeters} energy`],
      effect: (res: Resources['algae']) => {
        res.energy -= 5 * res.millimeters
        res.chlorophyll += res.millimeters
        return res
      },
      enabledCondition: (res: Resources['algae']) => res.energy >= 5 * res.millimeters,
    },
  ],

  insect: [
    {
      name: 'Scavenge food',
      baseTime: 2,
      description: 'Food affected by speed',
      gives: [(gs: Resources['insect']) => `+${formatNumber(gs.speed)} food`],
      takes: ['-20 energy'],
      effect: (res: Resources['insect']) => {
        res.energy -= 20
        res.food += res.speed
        return res
      },
      enabledCondition: (res: Resources['insect']) => res.energy >= 20,
      defaultDisplayed: true,
    },
    {
      name: 'Digest food',
      baseTime: 5,
      description: 'Affected by digestion',
      gives: [(gs: Resources['insect']) => `+${formatNumber(gs.digestion)} energy`],
      takes: [(gs: Resources['insect']) => `-${formatNumber(gs.digestion)} food`],
      effect: (res: Resources['insect']) => {
        res.food -= res.digestion
        res.energy += res.digestion
        return res
      },
      enabledCondition: (res: Resources['insect']) => res.food >= res.digestion,
      defaultDisplayed: true,
    },
    {
      name: 'Improve perception',
      baseTime: 4,
      gives: ['+5 perception'],
      takes: ['-50 energy'],
      effect: (res: Resources['insect']) => {
        res.energy -= 50
        res.perception += 5
        return res
      },
      enabledCondition: (res: Resources['insect']) => res.energy >= 50,
      defaultDisplayed: true,
    },
    {
      name: 'Generate pheromones',
      baseTime: 5,
      gives: ['+1 pheromone'],
      takes: ['-20 energy'],
      effect: (res: Resources['insect']) => {
        res.energy -= 20
        res.pheromones += 1
        return res
      },
      enabledCondition: (res: Resources['insect']) => res.energy >= 20,
      defaultDisplayed: true,
    },
    {
      name: 'Find mates',
      baseTime: 2,
      description: 'Mates affected by perception',
      gives: [(gs: Resources['insect']) => `+${formatNumber(gs.perception)} mates`],
      takes: ['-1 pheromone'],
      effect: (res: Resources['insect']) => {
        res.pheromones -= 1
        res.mates += res.perception
        return res
      },
      enabledCondition: (res: Resources['insect']) => res.pheromones >= 1,
      defaultDisplayed: true,
    },
    {
      name: 'Lay eggs',
      baseTime: 3,
      description: 'Eggs affected by mates',
      gives: [(gs: Resources['insect']) => `+${formatNumber(gs.mates)} eggs`],
      takes: ['-100 energy'],
      effect: (res: Resources['insect']) => {
        res.energy -= 100
        res.eggs += res.mates
        return res
      },
      enabledCondition: (res: Resources['insect']) => res.energy >= 100,
      defaultDisplayed: true,
    },
  ],

  crustacean: [
    {
      name: 'Find prey',
      baseTime: 6,
      description: 'Affected by intelligence',
      gives: [(gs: Resources['crustacean']) => `+${formatNumber(gs.intelligence)} targets`],
      effect: (res: Resources['crustacean']) => {
        res.targets += res.intelligence
        return res
      },
      defaultDisplayed: true,
    },
    {
      name: 'Fight prey',
      baseTime: 10,
      description: 'Vitality affected by dexterity, food affected by strength',
      takes: ['-100 targets', (gs: Resources['crustacean']) => `-${Math.max(0, 100 - gs.dexterity)} vitality`],
      gives: [(gs: Resources['crustacean']) => `+${formatNumber(gs.strength)} food`],
      effect: (res: Resources['crustacean']) => {
        res.targets -= 100
        res.vitality -= Math.max(0, 100 - res.dexterity)
        res.food += res.strength
        return res
      },
      enabledCondition: (res: Resources['crustacean']) => res.targets >= 100 && res.vitality >= 100 - res.dexterity,
      defaultDisplayed: true,
    },
    {
      name: 'Process food',
      baseTime: 4,
      description: 'Affected by mass',
      takes: [(gs: Resources['crustacean']) => `-${formatNumber(gs.mass)} food`],
      gives: [(gs: Resources['crustacean']) => `+${formatNumber(gs.mass)} energy`],
      effect: (res: Resources['crustacean']) => {
        res.food -= res.mass
        res.energy += res.mass
        return res
      },
      enabledCondition: (res: Resources['crustacean']) => res.food >= res.mass,
      defaultDisplayed: true,
    },
    {
      name: 'Recover',
      baseTime: 3,
      gives: ['+4 vitality'],
      takes: ['-100 energy'],
      effect: (res: Resources['crustacean']) => {
        res.energy -= 100
        res.vitality += 4
        return res
      },
      enabledCondition: (res: Resources['crustacean']) => res.energy >= 100,
      defaultDisplayed: true,
    },
    {
      name: 'Bulk up',
      baseTime: 3,
      gives: ['+1 strength', '+5 mass'],
      takes: ['-100 energy'],
      effect: (res: Resources['crustacean']) => {
        res.energy -= 100
        res.strength += 1
        res.mass += 5
        return res
      },
      enabledCondition: (res: Resources['crustacean']) => res.energy >= 100,
      defaultDisplayed: true,
    },
    {
      name: 'Smarten up',
      baseTime: 3,
      gives: ['+1 dexterity', '+1 intelligence'],
      takes: ['-100 energy'],
      effect: (res: Resources['crustacean']) => {
        res.energy -= 100
        res.dexterity += 1
        res.intelligence += 1
        return res
      },
      enabledCondition: (res: Resources['crustacean']) => res.energy >= 100,
      defaultDisplayed: true,
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
