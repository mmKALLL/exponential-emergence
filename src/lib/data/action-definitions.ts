import { Game } from '../gamestate-logic'
import { MAX_LIFESPAN, type Action, type ActionConfig, type LevelName, type Resources } from '../types'
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
      description: 'Based on food multiplier',
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
      description: 'Based on cell count',
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
      description: 'Based on cell count',
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
      baseTime: 4,
      gives: ['+50 hardness'],
      effect: (res: Resources['algae']) => {
        res.hardness += 50
        return res
      },
      defaultDisplayed: true,
    },
    {
      name: 'Rapid harden',
      baseTime: 2,
      gives: ['+200 hardness'],
      takes: ['-200 energy'],
      effect: (res: Resources['algae']) => {
        res.energy -= 200
        res.hardness += 200
        return res
      },
      enabledCondition: (res: Resources['algae']) => res.energy >= 200,
    },
    {
      name: 'Grow longer',
      baseTime: 4,
      description: '+1 millimeter per branch',
      gives: [(gs: Resources['algae']) => `+${formatNumber(gs.branches)} mm`],
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
      baseTime: 3,
      gives: ['+2 branches'],
      takes: ['-10 millimeters'],
      effect: (res: Resources['algae']) => {
        res.millimeters -= 10
        res.branches += 2
        return res
      },
      enabledCondition: (res: Resources['algae']) => res.millimeters >= 10,
    },
    {
      name: 'Grow chlorophyll',
      baseTime: 4,
      description: 'Based on millimeters',
      gives: [(gs: Resources['algae']) => `+${gs.millimeters} chlorophyll`],
      effect: (res: Resources['algae']) => {
        res.chlorophyll += res.millimeters
        return res
      },
    },
  ],

  insect: [
    {
      name: 'Scavenge food',
      baseTime: 2,
      description: 'Food based on speed',
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
      description: 'Based on digestion',
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
      name: 'Attract',
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
      description: 'Mates based on perception',
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
      description: 'Eggs based on mates',
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
      baseTime: 5,
      description: '+1 target per intelligence',
      gives: [(gs: Resources['crustacean']) => `+${formatNumber(gs.intelligence)} targets`],
      takes: ['-5 energy'],
      effect: (res: Resources['crustacean']) => {
        res.targets += res.intelligence
        res.energy -= 5
        return res
      },
      enabledCondition: (res: Resources['crustacean']) => res.energy >= 5,
      defaultDisplayed: true,
    },
    {
      name: 'Fight prey',
      baseTime: 8,
      description: 'DEX reduces damage,\n STR increases food',
      takes: [
        '-50 targets',
        (gs: Resources['crustacean']) => (gs.dexterity < 100 ? `-${Math.max(0, Math.ceil(5 - gs.dexterity / 20))} health` : ''),
      ],
      gives: [(gs: Resources['crustacean']) => `+${formatNumber(gs.strength)} food`],
      effect: (res: Resources['crustacean']) => {
        res.targets -= 50
        res.health -= Math.max(0, Math.ceil(5 - res.dexterity / 20))
        res.food += res.strength
        return res
      },
      enabledCondition: (res: Resources['crustacean']) => res.targets >= 50 && res.health >= Math.ceil(5 - res.dexterity / 20),
      defaultDisplayed: true,
    },
    {
      name: 'Consume food',
      baseTime: 4,
      description: 'Based on mass',
      takes: [(gs: Resources['crustacean']) => `-${formatNumber(gs.mass)} food`],
      gives: [(gs: Resources['crustacean']) => `+${formatNumber(gs.mass)} energy`],
      effect: (res: Resources['crustacean']) => {
        res.food -= res.mass
        res.energy += res.mass
        return res
      },
      enabledCondition: (res: Resources['crustacean']) => res.food >= res.mass,
    },
    {
      name: 'Rest',
      baseTime: 3,
      gives: ['+10 health'],
      takes: ['-10 energy'],
      effect: (res: Resources['crustacean']) => {
        res.energy -= 10
        res.health += 10
        return res
      },
      // Make sure the player has enough energy to find enough prey to get energy back.
      enabledCondition: (res: Resources['crustacean']) => res.energy >= 10 + 5 * Math.ceil(50 / res.intelligence),
    },
    {
      name: 'Molt exoskeleton',
      baseTime: 10,
      gives: [() => `+${(5 * 0.95 ** Game.state.timesExtendedLifespan).toFixed(2)}s lifespan`],
      takes: ['-5 health'],
      effect: (res: Resources['crustacean']) => {
        res.health -= 5
        Game.state.lifespanLeft += 5 * 0.95 ** Game.state.timesExtendedLifespan
        Game.state.timesExtendedLifespan += 1
        return res
      },
      enabledCondition: (res: Resources['crustacean']) =>
        // Prevent molting if lowering health would lock the player out of fighting, or if it would extend lifespan beyond the maximum.
        res.health >= 5 + Math.max(0, Math.ceil(5 - res.dexterity / 20)) &&
        Game.state.lifespanLeft + 5 * 0.95 ** Game.state.timesExtendedLifespan < MAX_LIFESPAN,
    },
    {
      name: 'Bulk up',
      baseTime: 3,
      gives: ['+3 strength', '+5 mass'],
      takes: ['-50 food'],
      effect: (res: Resources['crustacean']) => {
        res.food -= 50
        res.strength += 3
        res.mass += 5
        return res
      },
      // Prevent bulk up if the player doesn't have enough food to get energy back.
      enabledCondition: (res: Resources['crustacean']) => res.food >= 50 + res.mass + 5,
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
