# Animation / Visual-Feedback Layer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an additive visual-feedback ("juice") layer — floating numbers, resource pulses, goal/level banners, and a run-end telegraph — so the game stops feeling like "text and numbers."

**Architecture:** A pure-TS event bus (`lib/animation/`) that `gamestate-logic.ts` emits into and a single React overlay subscribes to. One-directional dependency (logic → bus → overlay); the bus is never serialized and lives outside game state. Resource-number pulses use a separate view-diff hook so they also catch passive changes. Visual-only this pass, but the bus is audio-ready (a second subscriber later).

**Tech Stack:** React 19, TypeScript ~5.8 (`tsc -b`), Vite 7, Tailwind 4, Biome (lint), `sonner` (toasts), `tw-animate-css` / CSS keyframes. No new dependencies.

**Design doc:** `docs/plans/2026-06-24-animation-feedback-layer-design.md`

---

## Conventions for every task

- **Tests are out of scope this pass** (explicit design decision). The verification step for each task is: **typecheck + lint + (where applicable) manual observation in the running app.** There are no unit tests to write.
- **Typecheck:** `npx tsc -b` → Expected: no errors.
- **Lint:** `npx biome lint <changed paths>` → Expected: no errors. If Biome flags `noExplicitAny` on the generic deep-merge or CSS-var casts, add a scoped `// biome-ignore lint/suspicious/noExplicitAny: <reason>` on that line rather than restructuring.
- **Manual app run:** `npm run dev` → open `http://localhost:5178`. To exercise mechanics fast: play the amoeba level (click "Catch food", then unlocked actions) until a goal completes.
- **Reset between manual tests when needed:** in DevTools console, `localStorage.removeItem('gameState'); location.reload()` (the in-game "clear save" also works). Note the new config lives under a **separate** key `'config'`.
- Commit after each task with the exact message given.

---

## Task 1: Event bus + event catalogue (pure TS core)

**Files:**
- Create: `src/lib/animation/events.ts`
- Create: `src/lib/animation/animation-bus.ts`

**Step 1: Create the event catalogue**

`src/lib/animation/events.ts`:
```ts
import type { LevelName } from '@/lib/types'

export type ResourceDelta = { resource: string; amount: number }

export type AnimationEvent =
  // gameplay — happens mid-run
  | { kind: 'gameplay'; type: 'actionComplete'; actionId: string; deltas: ResourceDelta[] }
  | { kind: 'gameplay'; type: 'goalMet'; goalId: string; label: string }
  | { kind: 'gameplay'; type: 'actionUnlocked'; actionId: string }
  | { kind: 'gameplay'; type: 'synergyApplied'; resource: string; amount: number }
  // stateChange — the run/game changes phase
  | { kind: 'stateChange'; type: 'runStart'; level: LevelName; generation: number }
  | { kind: 'stateChange'; type: 'runEnd'; reason: 'lifespan' | 'victory' }
  | { kind: 'stateChange'; type: 'levelUp'; from: LevelName; to: LevelName }
  | { kind: 'stateChange'; type: 'victory' }
  | { kind: 'stateChange'; type: 'pause' }
  | { kind: 'stateChange'; type: 'resume' }
```

**Step 2: Create the bus**

`src/lib/animation/animation-bus.ts`:
```ts
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
```

**Step 3: Typecheck + lint**

Run: `npx tsc -b && npx biome lint src/lib/animation`
Expected: no errors.

**Step 4: Commit**
```bash
git add src/lib/animation/events.ts src/lib/animation/animation-bus.ts
git commit -m "feat(animation): add event bus and event catalogue"
```

---

## Task 2: General app config (`src/lib/config.ts`)

**Files:**
- Create: `src/lib/config.ts`

**Step 1: Create config module**

`src/lib/config.ts`:
```ts
export type AppConfig = {
  animation: {
    intensity: number // 0 = off, 1 = default, tweakable upward
  }
}

const CONFIG_KEY = 'config' // separate from the 'gameState' save key

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

const defaultConfig: AppConfig = {
  animation: { intensity: prefersReducedMotion() ? 0.3 : 1 },
}

type DeepPartial<T> = { [K in keyof T]?: DeepPartial<T[K]> }

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function deepMerge<T>(base: T, patch: DeepPartial<T>): T {
  const result = { ...base }
  for (const key in patch) {
    const pv = patch[key]
    const bv = base[key]
    if (isObject(pv) && isObject(bv)) {
      result[key] = deepMerge(bv, pv as DeepPartial<typeof bv>)
    } else if (pv !== undefined) {
      result[key] = pv as T[Extract<keyof T, string>]
    }
  }
  return result
}

let config: AppConfig = loadConfig()
const listeners = new Set<() => void>()

function loadConfig(): AppConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    return raw ? deepMerge(defaultConfig, JSON.parse(raw)) : defaultConfig
  } catch {
    return defaultConfig
  }
}

export function getConfig(): AppConfig {
  return config
}

export function updateConfig(patch: DeepPartial<AppConfig>): void {
  config = deepMerge(config, patch)
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
  } catch {
    // ignore persistence failures (e.g. private mode)
  }
  for (const l of listeners) l()
}

export function subscribeConfig(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
```

**Step 2: Typecheck + lint**

Run: `npx tsc -b && npx biome lint src/lib/config.ts`
Expected: no errors. (If `deepMerge` generics fight Biome/TS, the `as` casts above are the intended escape hatches.)

**Step 3: Manual sanity check**

Run `npm run dev`, open the app, and in DevTools console:
```js
localStorage.getItem('config')        // null until first updateConfig — OK
```
Expected: app still loads normally; no console errors from importing config (nothing imports it yet — this just confirms it compiles into the bundle in later tasks).

**Step 4: Commit**
```bash
git add src/lib/config.ts
git commit -m "feat(config): add general app config with separate localStorage entry"
```

---

## Task 3: Anchor registry + `useAnchor` hook

**Files:**
- Create: `src/components/animation/anchor-registry.ts`
- Create: `src/components/animation/use-anchor.ts`

**Step 1: Create the registry**

`src/components/animation/anchor-registry.ts`:
```ts
const registry = new Map<string, HTMLElement>()

export function registerAnchor(id: string, el: HTMLElement): void {
  registry.set(id, el)
}

export function unregisterAnchor(id: string): void {
  registry.delete(id)
}

export function rectFor(id: string): DOMRect | null {
  const el = registry.get(id)
  return el ? el.getBoundingClientRect() : null
}
```

**Step 2: Create the hook**

`src/components/animation/use-anchor.ts`:
```ts
import { useCallback } from 'react'
import { registerAnchor, unregisterAnchor } from './anchor-registry'

// Returns a ref callback. Attach to the element you want to anchor effects to:
//   const setAnchor = useAnchor(`action:${actionName}`)
//   <Card ref={setAnchor} />
export function useAnchor(id: string) {
  return useCallback(
    (el: HTMLElement | null) => {
      if (el) registerAnchor(id, el)
      else unregisterAnchor(id)
    },
    [id]
  )
}
```

**Step 3: Typecheck + lint**

Run: `npx tsc -b && npx biome lint src/components/animation`
Expected: no errors.

**Step 4: Commit**
```bash
git add src/components/animation/anchor-registry.ts src/components/animation/use-anchor.ts
git commit -m "feat(animation): add anchor registry and useAnchor hook"
```

---

## Task 4: Floating-number primitive + keyframes

**Files:**
- Create: `src/components/animation/floating-number.tsx`
- Modify: `src/App.css` (append keyframes at end of file)

**Step 1: Create the primitive**

`src/components/animation/floating-number.tsx`:
```tsx
import { useEffect, type JSX } from 'react'

export type Floater = {
  id: number
  x: number
  y: number
  text: string
  tone: 'gain' | 'cost' | 'carry'
}

const toneClass: Record<Floater['tone'], string> = {
  gain: 'text-green-300',
  cost: 'text-red-300',
  carry: 'text-sky-300',
}

export function FloatingNumber({ floater, onDone }: { floater: Floater; onDone: (id: number) => void }): JSX.Element {
  // Safety net: guarantee cleanup even if animationend never fires.
  useEffect(() => {
    const t = setTimeout(() => onDone(floater.id), 2000)
    return () => clearTimeout(t)
  }, [floater.id, onDone])

  return (
    <div
      className={`animate-float-up absolute -translate-x-1/2 whitespace-nowrap text-sm font-semibold drop-shadow ${toneClass[floater.tone]}`}
      style={{ left: floater.x, top: floater.y }}
      onAnimationEnd={() => onDone(floater.id)}
    >
      {floater.text}
    </div>
  )
}
```

**Step 2: Append keyframes to `src/App.css`** (at the very end of the file)

```css
/* --- Animation feedback layer --- */
/* Effect prominence is driven by --fx-intensity, set on the overlay root. */
@keyframes float-up {
  0% {
    opacity: var(--fx-opacity, 1);
    transform: translate(-50%, 0) scale(var(--fx-scale, 1));
  }
  100% {
    opacity: 0;
    transform: translate(-50%, calc(-1 * var(--fx-distance, 48px))) scale(var(--fx-scale, 1));
  }
}
.animate-float-up {
  animation: float-up 1.4s ease-out forwards;
}

@keyframes pulse-gain {
  0% {
    color: #86efac;
  }
  100% {
    color: inherit;
  }
}
.pulse-gain {
  animation: pulse-gain 0.45s ease-out;
}

@keyframes pulse-cost {
  0% {
    color: #fca5a5;
  }
  100% {
    color: inherit;
  }
}
.pulse-cost {
  animation: pulse-cost 0.45s ease-out;
}

@keyframes unlock-ring {
  0% {
    opacity: var(--fx-opacity, 1);
    box-shadow: 0 0 0 0 rgba(134, 239, 172, 0.7);
  }
  100% {
    opacity: 0;
    box-shadow: 0 0 0 12px rgba(134, 239, 172, 0);
  }
}
.animate-unlock-ring {
  animation: unlock-ring 0.9s ease-out forwards;
}
```

**Step 3: Typecheck + lint**

Run: `npx tsc -b && npx biome lint src/components/animation/floating-number.tsx`
Expected: no errors.

**Step 4: Commit**
```bash
git add src/components/animation/floating-number.tsx src/App.css
git commit -m "feat(animation): add floating-number primitive and effect keyframes"
```

---

## Task 5: Animation overlay shell + mount in App + Toaster

This task makes the overlay subscribe and render (floaters list + run-end telegraph), mounts it and the sonner `<Toaster/>` at the app root. No emits exist yet, so nothing visible fires — the goal is "mounts cleanly, no errors."

**Files:**
- Create: `src/components/animation/animation-overlay.tsx`
- Modify: `src/App.tsx`

**Step 1: Create the overlay**

`src/components/animation/animation-overlay.tsx`:
```tsx
import { useEffect, useState, type JSX } from 'react'
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

export function AnimationOverlay(): JSX.Element | null {
  const [intensity, setIntensity] = useState(getConfig().animation.intensity)
  const [floaters, setFloaters] = useState<Floater[]>([])

  useEffect(() => subscribeConfig(() => setIntensity(getConfig().animation.intensity)), [])

  useEffect(() => {
    if (intensity <= 0) return
    const addFloater = (f: Omit<Floater, 'id'>) =>
      setFloaters((prev) => {
        const next = [...prev, { ...f, id: nextId++ }]
        return next.length > MAX_FLOATERS ? next.slice(next.length - MAX_FLOATERS) : next
      })
    return subscribe((event) => handleEvent(event, addFloater))
  }, [intensity])

  if (intensity <= 0) return null

  const removeFloater = (id: number) => setFloaters((prev) => prev.filter((f) => f.id !== id))

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
      <RunEndTelegraph />
    </div>,
    document.body
  )
}

function RunEndTelegraph(): JSX.Element | null {
  const lifespanLeft = useUpdate(() => Game.state.lifespanLeft)
  const active = useUpdate(() => Game.state.currentScreen === 'in-game' && Game.state.runStarted)
  if (!active || lifespanLeft > 5 || lifespanLeft <= 0) return null
  return <div className="animate-pulse absolute inset-0 ring-4 ring-inset ring-red-500/30" />
}

function handleEvent(event: AnimationEvent, addFloater: (f: Omit<Floater, 'id'>) => void): void {
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
    case 'actionUnlocked':
      // Glow ring added in Task 8.
      return
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
```

> Note on `handleEvent` being module-scoped: it only calls the `addFloater` passed in (which uses functional `setState`), so stale closures are not a concern.

**Step 2: Mount overlay + Toaster in `src/App.tsx`**

Replace the file contents with:
```tsx
import './App.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { AnimationOverlay } from '@/components/animation/animation-overlay'
import { ScreenWrapper } from './components/game/screens/screen-wrapper'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ScreenWrapper />
      <AnimationOverlay />
      <Toaster position="top-center" />
    </ThemeProvider>
  )
}

export default App
```

**Step 3: Typecheck + lint**

Run: `npx tsc -b && npx biome lint src/components/animation/animation-overlay.tsx src/App.tsx`
Expected: no errors.

**Step 4: Manual verification**

Run `npm run dev`, open the app, play a few actions. Expected:
- App loads and plays exactly as before (no regressions).
- No console errors.
- Nothing new renders yet (no emits wired) — correct.

**Step 5: Commit**
```bash
git add src/components/animation/animation-overlay.tsx src/App.tsx
git commit -m "feat(animation): mount overlay + sonner Toaster at app root"
```

---

## Task 6: Wire `actionComplete` → first visible slice (floating numbers)

**Files:**
- Modify: `src/lib/gamestate-logic.ts` (imports; `completeAction` at lines 113–125; add `resourceDeltas` helper)
- Modify: `src/components/game/action-card.tsx` (anchor the Card)

**Step 1: Add imports to `src/lib/gamestate-logic.ts`** (top, after existing imports)
```ts
import { emit } from './animation/animation-bus'
import type { ResourceDelta } from './animation/events'
```

**Step 2: Add a delta helper** (place it just above `completeAction`, ~line 112)
```ts
function resourceDeltas(before: Record<string, number>, after: Record<string, number>): ResourceDelta[] {
  const deltas: ResourceDelta[] = []
  for (const key in after) {
    const amount = (after[key] ?? 0) - (before[key] ?? 0)
    if (amount !== 0) deltas.push({ resource: key, amount })
  }
  return deltas
}
```

**Step 3: Emit from `completeAction`** — replace the body's effect line (line 116) region:
```ts
function completeAction(action: Action) {
  if (!canApplyAction(action)) return

  const before = { ...Game.currentLevel.resources } as Record<string, number>
  action.effect(Game.currentLevel.resources)
  emit({
    kind: 'gameplay',
    type: 'actionComplete',
    actionId: action.name,
    deltas: resourceDeltas(before, Game.currentLevel.resources as unknown as Record<string, number>),
  })

  action.progress = 0
  action.currentValue += 1
  action.currentSpeed = Math.min(action.currentSpeed + 0.2, 4)
  action.permanentSpeed = Math.min(action.permanentSpeed + 0.04, 3)
  if (!canApplyAction(action)) {
    gs.currentActionName = null
  }
}
```

**Step 4: Anchor the action card** in `src/components/game/action-card.tsx`
- Add import: `import { useAnchor } from '@/components/animation/use-anchor'`
- Inside the component, before `return`: `const setAnchor = useAnchor(\`action:${actionName}\`)`
- On the outer `<Card ...>` element, add `ref={setAnchor}`:
```tsx
  return (
    <Card ref={setAnchor} className="flex flex-col items-center justify-center p-4 pb-2 gap-4 w-52">
```

**Step 5: Typecheck + lint**

Run: `npx tsc -b && npx biome lint src/lib/gamestate-logic.ts src/components/game/action-card.tsx`
Expected: no errors.

**Step 6: Manual verification (first real juice!)**

Run `npm run dev`, start a run, click "Catch food" and let it complete a few cycles. Expected:
- A green `+1 food` floats up from the action card and fades on each completion.
- Actions with a cost (e.g. "Absorb food": −1 food, +1 nutrients) show both a red `−1 food` and a green `+1 nutrients`.
- Numbers match the resource panel changes.

**Step 7: Commit**
```bash
git add src/lib/gamestate-logic.ts src/components/game/action-card.tsx
git commit -m "feat(animation): floating numbers on action completion"
```

---

## Task 7: Resource-number pulse (view-diff)

**Files:**
- Create: `src/hooks/use-value-pulse.ts`
- Modify: `src/components/game/resource-display.tsx` (extract a `ResourceRow` so hooks are top-level, add anchor + pulse)

**Step 1: Create the pulse hook**

`src/hooks/use-value-pulse.ts`:
```ts
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
```

**Step 2: Refactor `src/components/game/resource-display.tsx`**
- Add imports:
```tsx
import { useAnchor } from '@/components/animation/use-anchor'
import { useValuePulse } from '@/hooks/use-value-pulse'
```
- Extract a row component (add above `ResourceDisplay`):
```tsx
function ResourceRow({ name, amount }: { name: string; amount: number }): JSX.Element {
  const setAnchor = useAnchor(`res:${name}`)
  const pulse = useValuePulse(amount)
  return (
    <div ref={setAnchor} className="flex flex-row justify-between gap-8 w-full">
      <span>{name === 'health' ? 'Health (HP)' : capitalize(name)}:</span>
      <span className={pulse}>{formatNumber(amount)}</span>
    </div>
  )
}
```
- Replace the inline `.map(...)` (lines 15–19) with:
```tsx
          {resources.map(({ name, amount }) => (
            <ResourceRow key={name} name={name} amount={amount} />
          ))}
```

**Step 3: Typecheck + lint**

Run: `npx tsc -b && npx biome lint src/hooks/use-value-pulse.ts src/components/game/resource-display.tsx`
Expected: no errors.

**Step 4: Manual verification**

Run `npm run dev`, play actions. Expected:
- Resource numbers in the right panel briefly flash green when they go up, red when they go down.
- Passive changes also flash (e.g. on the insect level, `food` rises passively from workers).

**Step 5: Commit**
```bash
git add src/hooks/use-value-pulse.ts src/components/game/resource-display.tsx
git commit -m "feat(animation): pulse resource numbers on change"
```

---

## Task 8: Goal met / action unlocked / level up

**Files:**
- Modify: `src/lib/gamestate-logic.ts` (`handleGoalCompletion`, lines 86–97)
- Modify: `src/components/animation/animation-overlay.tsx` (add unlock-ring rendering)

**Step 1: Emit goal/unlock/levelUp from `handleGoalCompletion`**

Replace `handleGoalCompletion` (lines 86–97) with:
```ts
function handleGoalCompletion() {
  if (!Game.currentGoal) return // All goals already achieved

  const currentAmount = Game.currentGoalAmount
  const currentGoal = Game.currentGoal

  if (currentAmount !== null && currentAmount >= currentGoal.requiredAmount) {
    const displayedBefore = new Set(
      Object.values(Game.currentLevel.actions)
        .filter((a) => a.displayed)
        .map((a) => a.name)
    )
    const levelsBefore = new Set(Game.unlockedLevels)
    const levelBefore = gs.currentLevel

    currentGoal.onComplete(gs)
    invalidateActionCardCache()
    gs.levels[gs.currentLevel].goals[Game.currentGoalIdx].completed = true

    emit({
      kind: 'gameplay',
      type: 'goalMet',
      goalId: `${gs.currentLevel}:${currentGoal.resourceName}:${currentGoal.requiredAmount}`,
      label: `Goal reached: ${currentGoal.requiredAmount} ${currentGoal.resourceName}`,
    })

    for (const a of Object.values(Game.currentLevel.actions)) {
      if (a.displayed && !displayedBefore.has(a.name)) {
        emit({ kind: 'gameplay', type: 'actionUnlocked', actionId: a.name })
      }
    }

    const newLevels = Game.unlockedLevels.filter((l) => !levelsBefore.has(l))
    if (newLevels.length > 0) {
      emit({ kind: 'stateChange', type: 'levelUp', from: levelBefore, to: newLevels[newLevels.length - 1] })
    }
  }
}
```

**Step 2: Render the unlock glow ring in the overlay**

In `src/components/animation/animation-overlay.tsx`:
- Add a ring state + type near the floater state:
```tsx
type Ring = { id: number; x: number; y: number; w: number; h: number }
```
- In `AnimationOverlay`, add: `const [rings, setRings] = useState<Ring[]>([])`
- Update the subscribe effect to also handle rings. Change the `subscribe(...)` call to pass an `addRing` callback and broaden `handleEvent`:
```tsx
    const addRing = (r: Omit<Ring, 'id'>) => setRings((prev) => [...prev.slice(-10), { ...r, id: nextId++ }])
    return subscribe((event) => handleEvent(event, addFloater, addRing))
```
- Add `const removeRing = (id: number) => setRings((prev) => prev.filter((r) => r.id !== id))`
- Render rings inside the portal div (after the floaters map):
```tsx
      {rings.map((r) => (
        <div
          key={r.id}
          className="animate-unlock-ring absolute rounded-xl"
          style={{ left: r.x, top: r.y, width: r.w, height: r.h }}
          onAnimationEnd={() => removeRing(r.id)}
        />
      ))}
```
- Extend `handleEvent`'s signature and the `actionUnlocked` case:
```tsx
function handleEvent(
  event: AnimationEvent,
  addFloater: (f: Omit<Floater, 'id'>) => void,
  addRing: (r: Omit<Ring, 'id'>) => void
): void {
  // ...
    case 'actionUnlocked': {
      const rect = rectFor(`action:${event.actionId}`)
      if (rect) addRing({ x: rect.left, y: rect.top, w: rect.width, h: rect.height })
      return
    }
  // ...
}
```

**Step 3: Typecheck + lint**

Run: `npx tsc -b && npx biome lint src/lib/gamestate-logic.ts src/components/animation/animation-overlay.tsx`
Expected: no errors.

**Step 4: Manual verification**

Run `npm run dev`. On the amoeba level, complete the first goal (reach 5 food → "Absorb food" unlocks; keep going to 3 divisions). Expected:
- A toast "Goal reached: 5 food" (or similar) appears top-center on each goal.
- A green glow ring briefly pulses around each newly unlocked action card.
- Reaching the multicellular-unlock goal shows an "Evolved: amoeba → multicellular!" toast.

**Step 5: Commit**
```bash
git add src/lib/gamestate-logic.ts src/components/animation/animation-overlay.tsx
git commit -m "feat(animation): goal toasts, unlock glow ring, level-up banner"
```

---

## Task 9: Run start / synergy carryover / run end / victory

**Files:**
- Modify: `src/lib/gamestate-logic.ts` (`rebirth` lines 307–338; `handleGameOver` lines 37–58)

**Step 1: Emit `runEnd` / `victory` from `handleGameOver`**

At the top of `handleGameOver`, capture victory before it is cleared, and emit at the end:
```ts
function handleGameOver() {
  const isVictory = gs.triggerVictoryScreen
  gs.currentScreen = isVictory ? 'victory' : 'rebirth'
  gs.triggerVictoryScreen = false
  // ...unchanged body through updateResourceRecords()...
  updateResourceRecords()

  emit({ kind: 'stateChange', type: 'runEnd', reason: isVictory ? 'victory' : 'lifespan' })
  if (isVictory) emit({ kind: 'stateChange', type: 'victory' })
}
```
(Replace the existing first two lines that referenced `gs.triggerVictoryScreen` directly.)

**Step 2: Emit `runStart` + `synergyApplied` from `rebirth`**

At the end of `rebirth`, wrap the existing synergy `forEach` with a before/after snapshot and emit. The synergy floaters are deferred so resource rows have mounted (the screen switches to in-game in the same synchronous call):
```ts
    // Apply synergies for the new level
    const beforeSynergy = { ...Game.currentLevel.resources } as Record<string, number>
    synergyDefinitions
      .filter((synergy) => synergy.affectedLevel === newLevelName)
      .forEach((synergy) => {
        synergy.onLevelStart?.(
          gs,
          gs.levels[synergy.basedOn.level].resourceRecords[synergy.basedOn.resourceName as keyof Resources[LevelName]] || 0
        )
      })

    emit({ kind: 'stateChange', type: 'runStart', level: newLevelName, generation: gs.generation })

    // Defer carryover floaters one paint so the new screen's resource rows are mounted/anchored.
    const afterSynergy = { ...Game.currentLevel.resources } as Record<string, number>
    setTimeout(() => {
      for (const key in afterSynergy) {
        const amount = (afterSynergy[key] ?? 0) - (beforeSynergy[key] ?? 0)
        if (amount > 0) emit({ kind: 'gameplay', type: 'synergyApplied', resource: key, amount })
      }
    }, 80)
```

**Step 3: Typecheck + lint**

Run: `npx tsc -b && npx biome lint src/lib/gamestate-logic.ts`
Expected: no errors.

**Step 4: Manual verification**

Run `npm run dev`.
- **Run end telegraph:** start a run, let the 60s lifespan tick down (or in console: `Game.state.lifespanLeft = 4`). In the final ~5s a red inset ring pulses around the screen.
- **Synergy carryover:** progress to multicellular (which seeds starting cells from amoeba divisions), and at the start of the multicellular run a sky-blue "+N (carried)" floater appears over the seeded resource row(s).
- **Victory:** reaching the final crustacean mass goal shows the victory screen and a "Victory!" toast.

**Step 5: Commit**
```bash
git add src/lib/gamestate-logic.ts
git commit -m "feat(animation): run-start/synergy-carryover/run-end/victory events"
```

---

## Task 10: Suppression flag + intensity multiplier verification (+ optional pause/resume)

**Files:**
- Modify: `src/lib/gamestate-logic.ts` (`start()` lines 398–414; optional `toggleAction` lines 340–353)

**Step 1: Import the bus object and guard save hydration**

Add to the bus import: `import { animationBus, emit } from './animation/animation-bus'` (merge with the import from Task 6).

In `Game.start`, wrap the save-key copy so a future replay/catch-up path can never flood the bus:
```ts
  start: () => {
    const loadedSave = load()
    if (loadedSave) {
      animationBus.enabled = false
      for (const stateKey in loadedSave) {
        // @ts-expect-error TypeScript doesn't know that stateKey is a key of GameState
        gs[stateKey] = loadedSave[stateKey]
      }
      animationBus.enabled = true
    }
    setInterval(() => {
      Game.gameTick()
    }, TICK_LENGTH * 1000)

    setInterval(() => {
      save(Game.state)
    }, 1000 * 10)
  },
```
(Remove the old `console.log('Loaded save:', loadedSave)` line.)

**Step 2 (optional): pause/resume emits in `toggleAction`**

```ts
  toggleAction(action: Action) {
    if (gs.currentScreen !== 'in-game') return
    gs.runStarted = true
    if (!canApplyAction(action)) return

    const wasActive = gs.currentActionName !== null
    gs.currentActionName = gs.currentActionName !== action.name ? action.name : null
    invalidateActionCardCache()

    if (gs.currentActionName === null) emit({ kind: 'stateChange', type: 'pause' })
    else if (!wasActive) emit({ kind: 'stateChange', type: 'resume' })
  },
```
(These events have no visual in this pass; wire only if trivial. They make a later "paused" indicator / audio cue free.)

**Step 3: Typecheck + lint**

Run: `npx tsc -b && npx biome lint src/lib/gamestate-logic.ts`
Expected: no errors.

**Step 4: Manual verification of the intensity multiplier**

Run `npm run dev`. In DevTools console (config persists under the `'config'` key; the overlay reacts live via `subscribeConfig`):
```js
// Requires importing in app code; instead just exercise persisted values:
localStorage.setItem('config', JSON.stringify({ animation: { intensity: 0 } })); location.reload()
```
Expected with `intensity: 0`: no floaters, no pulses, no rings (overlay returns null; pulses no-op). Toasts: the design treats banners as informational; with the overlay unmounted they will not fire — acceptable for "off".
```js
localStorage.setItem('config', JSON.stringify({ animation: { intensity: 2 } })); location.reload()
```
Expected with `intensity: 2`: floaters travel further, larger, fully opaque.
```js
localStorage.removeItem('config'); location.reload()  // back to default 1
```

**Step 5: Commit**
```bash
git add src/lib/gamestate-logic.ts
git commit -m "feat(animation): guard bus during save hydration; pause/resume events"
```

---

## Task 11: Full verification pass + mark design complete

**Files:**
- Modify: `docs/plans/2026-06-24-animation-feedback-layer-design.md` (status line)

**Step 1: Full typecheck, lint, and build**

Run:
```bash
npx tsc -b && npx biome lint src && npm run build
```
Expected: all pass, production build succeeds.

**Step 2: End-to-end manual playthrough**

Run `npm run dev` with default intensity. Confirm each moment:
- [ ] Action completion floaters (gains green, costs red), numbers match the panel
- [ ] Resource numbers pulse green/red on change (including passive insect food)
- [ ] Goal toast on each goal
- [ ] Glow ring on newly unlocked actions
- [ ] Level-up toast on each evolution
- [ ] Run-end red telegraph in the final ~5s
- [ ] Synergy "+N (carried)" floaters at the start of a level with carryover
- [ ] Victory toast + screen at the end
- [ ] No regressions to existing gameplay, saving, or hotkeys; no console errors

**Step 3: Mark the design doc status complete**

Change the design doc's status line to:
```markdown
**Status:** Implemented (2026-06-24)
```

**Step 4: Commit**
```bash
git add docs/plans/2026-06-24-animation-feedback-layer-design.md
git commit -m "docs: mark animation feedback layer design as implemented"
```

---

## Notes & known rough edges (for a later polish / Claude Design pass)

- **Synergy floaters use an 80ms `setTimeout`** to wait for the new screen's resource rows to mount. If a level ever renders slower, raise it or replace with an anchor-ready retry. Low risk (fires once per run start).
- **Floater coalescing was intentionally dropped** (design #2). At very high speed, same-resource gains can overlap. If it reads as noisy, add per-frame buffering + `+N` coalescing at the overlay subscriber — the bus is the seam, so it's localized.
- **Intensity = 0 suppresses informational toasts** too (overlay unmounted). If toasts should survive "effects off", split a `bannersEnabled` from `intensity` later.
- **Audio** attaches as a second `subscribe(...)` consumer + a `config.audio` section — no changes to logic or overlay.
- **Restyling** (timings, easings, motion, arc-toward-resource floaters) is all CSS/overlay-local; Claude Design can iterate via the anchors and `--fx-*` vars without touching `gamestate-logic.ts`.
```
