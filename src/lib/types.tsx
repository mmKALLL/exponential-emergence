export const TICK_LENGTH = 1 / 30 // seconds
export const MAX_LIFESPAN = 60 // seconds

export type Effect<T extends LevelName = LevelName> = (res: Resources[T]) => Resources[T]

export type ActionConfig = {
  name: string
  description?: string
  baseTime: number // in seconds
  effect: Effect
  enabledCondition?: <T extends LevelName = LevelName>(res: Resources[T]) => boolean
  displayCondition?: (gs: GameState) => boolean
  defaultDisplayed?: boolean
}

export type Action = ActionConfig & {
  progress: number
  currentSpeed: number
  permanentSpeed: number
  currentValue: number // number of completions for the action
  valueHistory: number[] // current value, recorded for each action on each tick
  bestValue: number // best number of completions across all runs
  bestValueHistory: number[]
  displayed: boolean
}

export type UnlockedDisplaySections = {
  speeds: boolean
  bestValue: boolean
  valueHistory: boolean
}

export type Resources = {
  readonly amoeba: { food: number; energy: number; nutrients: number; divisions: number }
  readonly multicellular: {
    food: number
    nutrients: number
    waste: number
    energy: number
    energyEfficiency: number
    cells: number
  }
  readonly algae: { size: number; branches: number; sunlight: number; chlorophyll: number; energy: number; hardness: number }
  readonly insect: { speed: number; perception: number; digestion: number; pheromones: number; eggs: number }
  readonly crustacean: { strength: number; dexterity: number; vitality: number; intelligence: number; mass: number }
}

export type Goal = {
  requiredAmount: number
  resourceName: string
  onComplete: (gs: GameState) => GameState // Be careful to make this idempotent, since reducers may be called more than once with the same parameters
}

export type LevelName = 'amoeba' | 'multicellular' | 'algae' | 'insect' | 'crustacean'
// | 'mammal'
// | 'human'
// | 'clan'
// | 'nation'
// | 'planet'
// | 'solar system'
// | 'galaxy'
// | 'universe'
// | 'reality'

export const levelNameOrder: LevelName[] = ['amoeba', 'multicellular', 'algae', 'insect', 'crustacean'] as const

export type Level<T extends LevelName> = {
  name: T
  playerAdvice?: string
  unlocked: boolean
  actions: Record<string, Action>
  goals: Goal[]
  initialResources: Record<keyof Resources[T], number>
  resources: Resources[T]
  resourceInputs?: {
    level: LevelName
    resourceName:
      | keyof Resources['amoeba']
      | keyof Resources['multicellular']
      | keyof Resources['algae']
      | keyof Resources['insect']
      | keyof Resources['crustacean']
    description: string
  }[] // List of resources that synergize from previous levels
  resourceOutputs: Partial<Record<keyof Resources[T], number>> // List of best scores for resources that can be used as synergies in later stages
}

export type GameState = {
  generation: number
  currentScreen: 'main-menu' | 'in-game' | 'rebirth'
  currentLevel: LevelName
  currentActionName: string | null
  lifespanLeft: number
  runStarted: boolean
  levels: {
    amoeba: Level<'amoeba'>
    multicellular: Level<'multicellular'>
    algae: Level<'algae'>
    insect: Level<'insect'>
    crustacean: Level<'crustacean'>
  }
  unlockedDisplaySections: UnlockedDisplaySections
}
