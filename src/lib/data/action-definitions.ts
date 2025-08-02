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
      baseTime: 6,
      effect: (res: Resources['multicellular']) => {
        res.food += 20 * res['food multiplier']
        return res
      },
      description: '+20 food * food multiplier', // TODO: Dynamic description
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
      description: 'Each cell:\n-1 food => +1 nutrient',
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
      name: 'Multiply',
      baseTime: 4,
      effect: (res: Resources['multicellular']) => {
        res.energy -= Math.max(0, 5 - res.efficiency) * res.cells
        res.cells *= 2
        return res
      },
      enabledCondition: (res: Resources['multicellular']) => res.energy >= (5 - res.efficiency) * res.cells,
      description: '5 energy per cell => x2 cells\n(Cost per cell reduced by efficiency)',
    },
    {
      name: 'Specialize',
      baseTime: 3,
      effect: (res: Resources['multicellular']) => {
        res.energy -= 20
        res.efficiency + 1
        return res
      },
      enabledCondition: (res: Resources['multicellular']) => res.energy >= 20,
      description: '-20 energy => Reduce multiply base cost by 1',
    },
    {
      name: 'Filter waste',
      baseTime: 2,
      effect: (res: Resources['multicellular']) => {
        res.energy -= 20
        res['food multiplier'] += 1
        return res
      },
      enabledCondition: (res: Resources['multicellular']) => res.energy >= 20,
      description: '-20 energy => +1 food multiplier',
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
      name: 'Grow longer',
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
      description: '-10 millimeters => +1 branch',
      effect: (res: Resources['algae']) => {
        res.millimeters -= 10
        res.branches += 1
        return res
      },
      enabledCondition: (res: Resources['algae']) => res.millimeters >= 10,
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
      description: 'Each millimeter:\n-5 energy => +1 chlorophyll',
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
      description: '-20 energy => +1 food per speed',
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
      description: '-1 food per digestion => +1 energy per digestion',
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
      description: '-50 energy => +5 perception',
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
      description: '-20 energy => +1 pheromone',
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
      description: '-1 pheromone => +1 mate per perception',
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
      description: '-100 energy => +1 egg per mate',
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
      description: '+1 target per intelligence',
      effect: (res: Resources['crustacean']) => {
        res.targets += res.intelligence
        return res
      },
      defaultDisplayed: true,
    },
    {
      name: 'Fight prey',
      baseTime: 10,
      description: '-100 targets, -(100 - dex) vitality => +1 food per strength',
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
      description: '-1 food per mass => +1 energy per mass',
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
      description: '-100 energy => +4 vitality',
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
      description: '-100 energy => +1 strength, +5 mass',
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
      description: '-100 energy => +1 dexterity, +1 intelligence',
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
