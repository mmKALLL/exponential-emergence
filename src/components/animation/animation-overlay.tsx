import { useCallback, useEffect, useState, type JSX } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import { subscribe } from '@/lib/animation/animation-bus'
import type { AnimationEvent } from '@/lib/animation/events'
import { getConfig, subscribeConfig } from '@/lib/config'
import { formatNumber } from '@/lib/utils'
import { rectFor } from './anchor-registry'
import { FloatingNumber, type Floater, type FloaterPart } from './floating-number'

let nextId = 0
const MAX_FLOATERS = 40

// A one-shot glow ring that pulses around a newly-unlocked action card (the actionUnlocked event).
type UnlockRing = { id: number; x: number; y: number; w: number; h: number }

export function AnimationOverlay(): JSX.Element | null {
  const [intensity, setIntensity] = useState(getConfig().animation.intensity)
  const [floaters, setFloaters] = useState<Floater[]>([])
  const [unlockRings, setUnlockRings] = useState<UnlockRing[]>([])

  useEffect(() => subscribeConfig(() => setIntensity(getConfig().animation.intensity)), [])

  useEffect(() => {
    if (intensity <= 0) return
    const addFloater = (f: Omit<Floater, 'id'>) =>
      setFloaters((prev) => {
        const next = [...prev, { ...f, id: nextId++ }]
        return next.length > MAX_FLOATERS ? next.slice(next.length - MAX_FLOATERS) : next
      })
    const addUnlockRing = (r: Omit<UnlockRing, 'id'>) => setUnlockRings((prev) => [...prev.slice(-10), { ...r, id: nextId++ }])
    return subscribe((event) => handleEvent(event, addFloater, addUnlockRing))
  }, [intensity])

  const removeFloater = useCallback((id: number) => setFloaters((prev) => prev.filter((f) => f.id !== id)), [])
  const removeUnlockRing = useCallback((id: number) => setUnlockRings((prev) => prev.filter((r) => r.id !== id)), [])

  if (intensity <= 0) return null

  return createPortal(
    <div
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
      style={
        {
          '--fx-intensity': intensity,
          '--fx-distance': 'calc(48px * var(--fx-intensity))',
          '--fx-opacity': 'min(1, var(--fx-intensity))',
          '--fx-scale': 'calc(0.9 + 0.3 * var(--fx-intensity))',
        } as React.CSSProperties
      }
    >
      {floaters.map((f) => (
        <FloatingNumber key={f.id} floater={f} onDone={removeFloater} />
      ))}
      {unlockRings.map((ring) => (
        <div
          key={ring.id}
          className="animate-unlock-ring absolute rounded-xl"
          style={{ left: ring.x, top: ring.y, width: ring.w, height: ring.h }}
          onAnimationEnd={() => removeUnlockRing(ring.id)}
        />
      ))}
    </div>,
    document.body
  )
}

function handleEvent(
  event: AnimationEvent,
  addFloater: (f: Omit<Floater, 'id'>) => void,
  addUnlockRing: (r: Omit<UnlockRing, 'id'>) => void
): void {
  switch (event.type) {
    case 'actionComplete': {
      const rect = rectFor(`action:${event.actionName}`)
      if (!rect) return
      // One centered line per action: gains (green) first, then losses (red).
      const nonZero = event.deltas.filter((d) => d.amount !== 0)
      // const ordered = [...nonZero.filter((d) => d.amount > 0), ...nonZero.filter((d) => d.amount < 0)]
      const parts: FloaterPart[] = nonZero.map((d) => ({
        text: `${d.amount > 0 ? '+' : ''}${formatNumber(d.amount)} ${d.resource}`,
        tone: d.amount > 0 ? 'gain' : 'cost',
      }))
      if (parts.length === 0) return
      addFloater({ x: rect.left + rect.width / 2, y: rect.top - 8, parts })
      return
    }
    case 'goalMet':
      return
    case 'actionUnlocked': {
      const rect = rectFor(`action:${event.actionName}`)
      if (rect) addUnlockRing({ x: rect.left, y: rect.top, w: rect.width, h: rect.height })
      return
    }
    case 'levelUp':
      return
    case 'victory':
      toast.success('Victory!')
      return
    default:
      // pause / resume / runStart / runEnd — no visual in this pass
      return
  }
}
