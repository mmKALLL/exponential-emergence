import { useEffect, useRef, useState } from 'react'
import { getConfig } from '@/lib/config'

// Returns a CSS class to flash a number green (increase) or red (decrease).
// View-diff based, so it also catches passive changes (lifespan, sunlight cycle).
export function useValuePulse(value: number): string {
  const prev = useRef(value)
  const [cls, setCls] = useState('')

  useEffect(() => {
    const before = prev.current
    prev.current = value
    if (value === before || getConfig().animation.intensity <= 0) return
    setCls(value > before ? 'pulse-gain' : 'pulse-cost')
    const t = setTimeout(() => setCls(''), 450)
    return () => clearTimeout(t)
  }, [value])

  return cls
}
