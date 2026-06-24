import type { AnimationEvent } from './events'

type Listener = (event: AnimationEvent) => void

const listeners = new Set<Listener>()

export const animationBus = {
  // When false, emit() is a no-op. Used to silence non-interactive ticks
  // (save load / fast-forward catch-up) so effects only fire from live play.
  enabled: true,
}

export function emit(event: AnimationEvent): void {
  if (!animationBus.enabled) return
  for (const listener of listeners) listener(event)
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
