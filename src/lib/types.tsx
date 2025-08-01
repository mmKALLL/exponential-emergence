export const TICK_LENGTH = 0.033 // seconds
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
  readonly amoeba: { food: number; energy: number; nutrients: number; waste: number; divisions: number }
  readonly multicellular: { cells: number; stone: number }
  readonly algae: { branches: number; sunlight: number }
  readonly insect: { strength: number; speed: number }
}

export type Goal<T extends LevelName = LevelName> = {
  requiredAmount: number
  resourceName: keyof Resources[T]
  onComplete: (gs: GameState) => GameState // Be careful to make this idempotent, since reducers may be called more than once with the same parameters
}

export type LevelName = 'amoeba'
// | 'multicellular'
// | 'algae'
// | 'insect'
// | 'crustacean'
// | 'mammal'
// | 'human'
// | 'clan'
// | 'nation'
// | 'planet'
// | 'solar system'
// | 'galaxy'
// | 'universe'
// | 'reality'

export const levelNameOrder: LevelName[] = [
  'amoeba',
  // 'multicellular',
  // 'algae',
] as const

export type Level<T extends LevelName = LevelName> = {
  name: T
  unlocked: boolean
  actions: Record<string, Action>
  goals: Goal[]
  initialResources: Record<keyof Resources[T], number>
  resources: Resources[T]
  resourceOutputs: Partial<Record<keyof Resources[T], number>> // List of best scores for resources that can be used as synergies in later stages
}

export type GameState = {
  generation: number
  currentScreen: 'main-menu' | 'in-game' | 'rebirth'
  currentLevel: LevelName
  currentActionName: string | null
  lifespanLeft: number
  runStarted: boolean
  levels: Record<LevelName, Level>
  unlockedDisplaySections: UnlockedDisplaySections
}
