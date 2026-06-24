import type { LevelName } from '@/lib/types'

export type ResourceDelta = { resource: string; amount: number }

export type AnimationEvent =
  // gameplay — happens mid-run
  | { kind: 'gameplay'; type: 'actionComplete'; actionName: string; deltas: ResourceDelta[] }
  | { kind: 'gameplay'; type: 'goalMet'; goalId: string; label: string }
  | { kind: 'gameplay'; type: 'actionUnlocked'; actionName: string }
  | { kind: 'gameplay'; type: 'synergyApplied'; resource: string; amount: number }
  // stateChange — the run/game changes phase
  | { kind: 'stateChange'; type: 'runStart'; level: LevelName; generation: number }
  | { kind: 'stateChange'; type: 'runEnd'; reason: 'lifespan' | 'victory' }
  | { kind: 'stateChange'; type: 'levelUp'; from: LevelName; to: LevelName }
  | { kind: 'stateChange'; type: 'victory' }
  | { kind: 'stateChange'; type: 'pause' }
  | { kind: 'stateChange'; type: 'resume' }
