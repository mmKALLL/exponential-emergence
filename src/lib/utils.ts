import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { LevelName } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function assertNever(x: never): never {
  throw new Error('Unexpected object: ' + x)
}

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export const levelLabel = (level: LevelName): string => capitalize(level)
export const levelLabelPrefixed = (level: LevelName): string => {
  return ['a', 'i', 'u', 'e', 'o'].includes(level[0]) ? `an ${capitalize(level)}` : `a ${capitalize(level)}`
}

export const maxTime = ({ baseTime, currentSpeed, permanentSpeed }: { baseTime: number; currentSpeed: number; permanentSpeed: number }): number => {
  return baseTime / (currentSpeed * permanentSpeed)
}
