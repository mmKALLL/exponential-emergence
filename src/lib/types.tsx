export const TICK_LENGTH = 0.1 // seconds

export type Effect = (gs: GameState) => GameState

export type Action = {
  name: string
  description: string | undefined
  baseTime: number // in seconds
  progress: number
  currentSpeed: number
  permanentSpeed: number
  currentValue: number // number of completions for the action
  valueHistory: number[] // current value, recorded for each action on each tick
  bestValue: number // best number of completions across all runs
  bestValueHistory: number[]
  displayed: boolean
  displayCondition?: (gs: GameState) => boolean
  enabledCondition?: (gs: GameState) => boolean
  effect: Effect
}

export type UnlockedDisplaySections = {
  speeds: boolean
  bestValue: boolean
  valueHistory: boolean
}

export type Resources = {
  readonly amoeba: { food: number; energy: number }
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
  actionCards: Record<string, Action>
  goals: Goal[]
  initialResources: Record<keyof Resources[T], number>
  resources: Resources[T]
  resourceOutputs: Partial<Record<keyof Resources[T], number>>
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
