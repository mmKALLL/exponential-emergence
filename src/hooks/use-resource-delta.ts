import { useEffect, useRef, useState } from 'react'
import { subscribe } from '@/lib/animation/animation-bus'
import { getConfig } from '@/lib/config'

// A discrete gain/loss for a single resource, with a nonce so the consumer can
// re-key the element and replay its animation on each change.
export type DeltaPing = { amount: number; nonce: number }

// Bus-driven (not view-diff): reports the discrete delta a resource received from
// an action completion or synergy carryover. Passive per-tick changes never emit
// events, so they don't produce noisy badges.
export function useResourceDelta(resourceName: string): DeltaPing | null {
  const [ping, setPing] = useState<DeltaPing | null>(null)
  const nonce = useRef(0)

  useEffect(() => {
    return subscribe((event) => {
      if (getConfig().animation.intensity <= 0) return
      let amount = 0
      if (event.type === 'actionComplete') {
        amount = event.deltas.find((d) => d.resource === resourceName)?.amount ?? 0
      } else if (event.type === 'synergyApplied' && event.resource === resourceName) {
        amount = event.amount
      }
      if (amount !== 0) {
        nonce.current += 1
        setPing({ amount, nonce: nonce.current })
      }
    })
  }, [resourceName])

  return ping
}
