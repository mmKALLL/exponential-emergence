import { useCallback, useEffect, useState, type JSX } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import { subscribe } from '@/lib/animation/animation-bus'
import type { AnimationEvent } from '@/lib/animation/events'
import { getConfig, subscribeConfig } from '@/lib/config'
import { Game } from '@/lib/gamestate-logic'
import { formatNumber } from '@/lib/utils'
import { useUpdate } from '@/hooks/use-update'
import { rectFor } from './anchor-registry'
import { FloatingNumber, type Floater } from './floating-number'

let nextId = 0
const MAX_FLOATERS = 40

type Ring = { id: number; x: number; y: number; w: number; h: number }

export function AnimationOverlay(): JSX.Element | null {
  const [intensity, setIntensity] = useState(getConfig().animation.intensity)
  const [floaters, setFloaters] = useState<Floater[]>([])
  const [rings, setRings] = useState<Ring[]>([])

  useEffect(() => subscribeConfig(() => setIntensity(getConfig().animation.intensity)), [])

  useEffect(() => {
    if (intensity <= 0) return
    const addFloater = (f: Omit<Floater, 'id'>) =>
      setFloaters((prev) => {
        const next = [...prev, { ...f, id: nextId++ }]
        return next.length > MAX_FLOATERS ? next.slice(next.length - MAX_FLOATERS) : next
      })
    const addRing = (r: Omit<Ring, 'id'>) => setRings((prev) => [...prev.slice(-10), { ...r, id: nextId++ }])
    return subscribe((event) => handleEvent(event, addFloater, addRing))
  }, [intensity])

  const removeFloater = useCallback((id: number) => setFloaters((prev) => prev.filter((f) => f.id !== id)), [])
  const removeRing = useCallback((id: number) => setRings((prev) => prev.filter((r) => r.id !== id)), [])

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
      {rings.map((r) => (
        <div
          key={r.id}
          className="animate-unlock-ring absolute rounded-xl"
          style={{ left: r.x, top: r.y, width: r.w, height: r.h }}
          onAnimationEnd={() => removeRing(r.id)}
        />
      ))}
      <RunEndTelegraph />
    </div>,
    document.body,
  )
}

function RunEndTelegraph(): JSX.Element | null {
  const lifespanLeft = useUpdate(() => Game.state.lifespanLeft)
  const active = useUpdate(() => Game.state.currentScreen === 'in-game' && Game.state.runStarted)
  if (!active || lifespanLeft > 5 || lifespanLeft <= 0) return null
  return <div className="animate-pulse absolute inset-0 ring-4 ring-inset ring-red-500/30" />
}

function handleEvent(
  event: AnimationEvent,
  addFloater: (f: Omit<Floater, 'id'>) => void,
  addRing: (r: Omit<Ring, 'id'>) => void
): void {
  switch (event.type) {
    case 'actionComplete': {
      const rect = rectFor(`action:${event.actionId}`)
      if (!rect) return
      let row = 0
      for (const d of event.deltas) {
        if (d.amount === 0) continue
        addFloater({
          x: rect.left + rect.width / 2,
          y: rect.top + row * 18,
          text: `${d.amount > 0 ? '+' : ''}${formatNumber(d.amount)} ${d.resource}`,
          tone: d.amount > 0 ? 'gain' : 'cost',
        })
        row++
      }
      return
    }
    case 'synergyApplied': {
      const rect = rectFor(`res:${event.resource}`)
      if (!rect) return
      addFloater({
        x: rect.left + rect.width / 2,
        y: rect.top,
        text: `+${formatNumber(event.amount)} (carried)`,
        tone: 'carry',
      })
      return
    }
    case 'goalMet':
      toast.success(event.label)
      return
    case 'actionUnlocked': {
      const rect = rectFor(`action:${event.actionId}`)
      if (rect) addRing({ x: rect.left, y: rect.top, w: rect.width, h: rect.height })
      return
    }
    case 'levelUp':
      toast.success(`Evolved: ${event.from} → ${event.to}!`)
      return
    case 'victory':
      toast.success('Victory!')
      return
    default:
      // pause / resume / runStart / runEnd — no visual in this pass
      return
  }
}
