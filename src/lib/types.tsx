import { generateAction } from './type-utils'

export type Effect = (gs: GameState) => GameState

export type Action = {
  name: string
  baseTime: number
  progress: number
  currentSpeed: number
  permanentSpeed: number
  currentValue: number
  bestValue: number
  valueHistory: number[]
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
  allowsEvolution?: boolean
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

export type Level<T extends LevelName = LevelName> = {
  name: T
  actionCards: Action[]
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
  levels: Record<LevelName, Level>
  unlockedDisplaySections: UnlockedDisplaySections
}
