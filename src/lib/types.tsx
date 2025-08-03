export const TICK_LENGTH = 1 / 30 // seconds
export const MAX_LIFESPAN = 60 // seconds

export type Effect<T extends LevelName = LevelName> = (res: Resources[T]) => Resources[T]

export type ActionConfig<T extends LevelName = LevelName> = {
  name: string
  description?: string
  gives?: Array<string | ((gs: Resources[T]) => string)>
  takes?: Array<string | ((gs: Resources[T]) => string)>
  baseTime: number // in seconds
  effect: Effect<T>
  enabledCondition?: (res: Resources[T]) => boolean
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

export type SynergyConfig<T extends LevelName> = {
  basedOn: {
    level: T
    resourceName: keyof Resources[T]
  }

  description: (value: number) => string

  affectedLevel: LevelName
  // Apply the synergy effect on the start of the level
  // Not required as we could also use it some other way
  onLevelStart?: (gs: GameState, value: number) => void
}

export type UnlockedDisplaySections = {
  speeds: boolean
  bestValue: boolean
  valueHistory: boolean
  synergyHelpText: boolean
  synergyHelpTextAddition: boolean
}

export type Resources = {
  readonly amoeba: { food: number; nutrients: number; energy: number; divisions: number }
  readonly multicellular: {
    energy: number
    efficiency: number
    food: number
    'food multiplier': number
    nutrients: number
    cells: number
  }
  readonly algae: {
    millimeters: number
    energy: number
    chlorophyll: number
    branches: number
    hardness: number
  }
  readonly insect: {
    food: number
    energy: number
    workers: number
    perception: number
    digestion: number
    pheromones: number
    mates: number
    eggs: number
  }
  readonly crustacean: {
    energy: number
    targets: number
    food: number
    strength: number
    health: number
    intelligence: number
    mass: number
  }
}

export type Goal = {
  requiredAmount: number
  resourceName: string
  onComplete: (gs: GameState) => GameState // Be careful to make this idempotent, since reducers may be called more than once with the same parameters
  completed?: boolean
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
  resourceRecords: Resources[T]
}

export type GameState = {
  generation: number
  currentScreen: 'main-menu' | 'in-game' | 'rebirth' | 'victory'
  currentLevel: LevelName
  currentActionName: string | null
  lifespanLeft: number
  timesExtendedLifespan: number
  triggerVictoryScreen: boolean
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
