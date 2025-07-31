import type { Action, Effect } from './types'

export function generateAction(name: string, baseTime: number, effect: Effect, displayed: boolean = false): Action {
  return {
    name,
    baseTime,
    progress: 0,
    currentSpeed: 0,
    permanentSpeed: 0,
    currentValue: 0,
    bestValue: 0,
    valueHistory: [],
    displayed,
    effect,
  }
}
