import { Game } from '@/lib/gamestate-logic'
import { useEffect, useState } from 'react'

type Callback = () => void
const subscribers = new Set<Callback>()

let gameUILoopStarted = false
let animationFrameId: number | null = null

// Use requestAnimationFrame for smoother updates, but only update when needed
let lastUpdateTime = 0
const TARGET_FPS = 30
const FRAME_TIME = 1000 / TARGET_FPS

const gameUILoop = () => {
  const now = performance.now()

  // Only update if there are actual changes and enough time has passed
  if (now - lastUpdateTime >= FRAME_TIME) {
    subscribers.forEach((fn) => fn())
    lastUpdateTime = now
  }

  animationFrameId = requestAnimationFrame(gameUILoop)
}

const ensureLoopStarted = () => {
  if (!gameUILoopStarted) {
    gameUILoopStarted = true
    gameUILoop()
  }
}

// Stop the loop when no subscribers remain
const stopLoopIfEmpty = () => {
  if (subscribers.size === 0 && animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    gameUILoopStarted = false
    animationFrameId = null
  }
}

export function useUpdate<T>(callback: () => T) {
  const [value, setValue] = useState<T>(() => callback())

  useEffect(() => {
    ensureLoopStarted()

    const update = () => {
      setValue((prev) => {
        const next = callback()
        if (Array.isArray(prev)) {
          if (prev.length === 0 && (next as unknown[]).length === 0) {
            return prev // No change for empty arrays
          }
          if (typeof prev[0] === 'string' || typeof prev[0] === 'number') {
            // For arrays of strings or numbers, we can use a simple equality check
            return prev.join(',') === (next as unknown[]).join(',') ? prev : next
          }
        }
        return Object.is(prev, next) ? prev : next
      })
    }
    subscribers.add(update)
    return () => {
      subscribers.delete(update)
      stopLoopIfEmpty()
    }
  }, [callback])

  return value
}

export function useGameState() {
  return useUpdate(() => Game.state)
}
