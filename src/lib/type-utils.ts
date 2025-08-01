import type { Action, Effect } from './types'

export function generateAction(
  name: string,
  baseTime: number,
  effect: Effect,
  description: string | undefined = undefined,
  displayed: boolean = false
): Action {
  return {
    name,
    description,
    baseTime,
    progress: 0,
    currentSpeed: 1,
    permanentSpeed: 1,
    currentValue: 0,
    bestValue: 0,
    valueHistory: [],
    bestValueHistory: [],
    displayed,
    effect,
  }
}
