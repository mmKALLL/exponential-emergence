import { useCallback, useEffect, useRef, useState, type JSX } from 'react'
import { createPortal } from 'react-dom'
import { subscribe } from '@/lib/animation/animation-bus'
import { tutorialMessages, type TutorialMessage } from '@/lib/data/tutorial-definitions'
import { Game } from '@/lib/gamestate-logic'
import { useUpdate } from '@/hooks/use-update'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Never show more than this many popups back-to-back in a single burst.
const MAX_BURST = 2

export function TutorialOverlay(): JSX.Element | null {
  // The queue of messages to show; queue[0] is the popup currently on screen.
  const [queue, setQueue] = useState<TutorialMessage[]>([])
  // Tracks whether we have an outstanding suspendForTutorial() that still needs a resume.
  const burstActiveRef = useRef(false)
  // Ids we've already marked seen this mount, to avoid re-marking on re-render.
  const markedRef = useRef(new Set<string>())

  // Enqueue a message unless it's already seen, already queued/shown, or the burst is full.
  // Pure updater: suspend/resume side effects are driven by the queue-length effect below
  // (React double-invokes updaters under StrictMode, so they must not have side effects).
  const enqueue = useCallback((message: TutorialMessage) => {
    setQueue((prev) => {
      if (prev.length >= MAX_BURST) return prev
      if (prev.some((m) => m.id === message.id)) return prev
      if (Game.hasSeenTutorial(message.id)) return prev
      return [...prev, message]
    })
  }, [])

  // Single source of truth for suspend/resume: suspend once when the queue becomes
  // non-empty, resume once when it drains. Runs after commit, so it's StrictMode-safe.
  useEffect(() => {
    if (queue.length > 0 && !burstActiveRef.current) {
      burstActiveRef.current = true
      Game.suspendForTutorial()
    } else if (queue.length === 0 && burstActiveRef.current) {
      burstActiveRef.current = false
      Game.resumeAfterTutorial()
    }
  }, [queue.length])

  // Safety net: if the overlay unmounts mid-burst, resume so the run can't get stuck paused.
  useEffect(() => {
    return () => {
      if (burstActiveRef.current) {
        burstActiveRef.current = false
        Game.resumeAfterTutorial()
      }
    }
  }, [])

  // actionUnlocked trigger: enqueue on the matching bus event.
  useEffect(() => {
    return subscribe((event) => {
      if (event.kind !== 'gameplay' || event.type !== 'actionUnlocked') return
      const message = tutorialMessages.find(
        (m) => m.trigger.type === 'actionUnlocked' && m.trigger.actionName === event.actionName && !Game.hasSeenTutorial(m.id)
      )
      if (message) enqueue(message)
    })
  }, [enqueue])

  // levelStart trigger: watch the current level + in-game screen. Covers the initial
  // amoeba, which has no unlock event to fire from.
  const levelKey = useUpdate(() => (Game.state.currentScreen === 'in-game' ? Game.currentLevelName : null))
  useEffect(() => {
    if (levelKey === null) return
    const message = tutorialMessages.find(
      (m) => m.trigger.type === 'levelStart' && m.trigger.level === levelKey && !Game.hasSeenTutorial(m.id)
    )
    if (message) enqueue(message)
  }, [levelKey, enqueue])

  // Mark the shown message as seen the first time it reaches the front of the queue.
  const current = queue[0] ?? null
  useEffect(() => {
    if (current && !markedRef.current.has(current.id)) {
      markedRef.current.add(current.id)
      Game.markTutorialSeen(current.id)
    }
  }, [current])

  const handleClose = useCallback(() => {
    setQueue((prev) => prev.slice(1))
  }, [])

  if (!current) return null

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
      <Card className="mx-4 w-full max-w-md">
        <CardHeader>
          <CardTitle>{current.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">{current.body}</p>
          <div className="flex justify-end">
            <Button onClick={handleClose}>Close</Button>
          </div>
        </CardContent>
      </Card>
    </div>,
    document.body
  )
}
