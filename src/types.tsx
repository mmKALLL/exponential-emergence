export type EventId = 'recurring-action' | 'end-loop'

export type Action = {
  eventId: EventId
  enabledCondition?: (gs: GameState) => boolean
  effect: (gs: GameState) => GameState
}

export type GameState = { count: number }

export const initialGameState: GameState = { count: 2 }
