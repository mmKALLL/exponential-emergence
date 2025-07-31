import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function assertNever(x: never): never {
  throw new Error('Unexpected object: ' + x)
}

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
