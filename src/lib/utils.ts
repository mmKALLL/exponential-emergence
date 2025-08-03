import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { LevelName } from './types'
// @ts-expect-error This doesn't have type declarations
import { StandardNotation } from '@antimatter-dimensions/notations'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function assertNever(x: never): never {
  throw new Error(`Unexpected object: ${x}`)
}

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export const levelLabel = (level: LevelName): string => capitalize(level)
export const levelLabelPrefixed = (level: LevelName): string => {
  return ['a', 'i', 'u', 'e', 'o'].includes(level[0]) ? `an ${capitalize(level)}` : `a ${capitalize(level)}`
}

export const maxTime = ({
  baseTime,
  currentSpeed,
  permanentSpeed,
}: {
  baseTime: number
  currentSpeed: number
  permanentSpeed: number
}): number => {
  return baseTime / (currentSpeed * permanentSpeed)
}

export const typedObjectKeys = Object.keys as <T>(o: T) => Extract<keyof T, string>[]
export const typedObjectValues = Object.values as <T>(o: Record<PropertyKey, T>) => T[]
export const typedObjectEntries = Object.entries as <T>(o: T) => [keyof T, T[keyof T]][]

export function mapObject<Value, Mapped, Key extends string>(
  object: Record<Key, Value>,
  mapFn: (val: Value, key: Key, index: number) => Mapped
): Record<Key, Mapped> {
  return typedObjectKeys(object).reduce(
    (result, key: Key, index: number) => {
      const mapped = mapFn(object[key], key, index)
      result[key] = mapped
      return result
    },
    {} as Record<Key, Mapped>
  )
}

const formatter = new StandardNotation()
export function formatNumber(value: number | undefined | null, placesUnder1000 = 0): string {
  if (value === undefined || value === null) {
    return ''
  }
  return value <= 1000 ? value.toFixed(0) : formatter.format(value, 2, placesUnder1000)
}
