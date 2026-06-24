# Animation / Visual-Feedback Layer — Design

**Date:** 2026-06-24
**Status:** Approved (brainstorming complete, ready for implementation plan)
**Scope:** Add a visual-feedback ("juice") layer so the game stops feeling like "text and numbers." Visual-only this pass, architected so audio can attach later with no rework.

---

## 1. Motivation

Playtester feedback (KanbanFlow "Random ideas" column) shows one theme raised by **multiple distinct people** — the game is too text/number-heavy and needs visual feedback:

- **-E:** "feels like text and numbers, visual feedback for rewards would be great"; "very text-heavy"; Tamagotchi-style idea.
- **-M:** "would be nice if it was more obvious what was happening, instead of having to read everything; more visual"; "color coding could work."
- **itch user (adjacent):** "a lot of initial information thrown on screen."

Several related complaints are addressed as a side effect: "goal achievement should pop up something," "sad to die, always a surprise," and "starting resources / synergies went unnoticed."

This pass deliberately does **not** tackle the guided onboarding/tutorial system, the organism visualization (likely handed to Claude Design), or an information-density redesign. Those remain separate future efforts.

## 2. Goals / Non-goals

**Goals**
- Make four moments feel alive: action completes, resource value changes, goal met / action unlocked, run end & evolution.
- Purely additive — no change to game balance, logic, save format, or determinism.
- Reuse what's already in the project (`sonner`, `tw-animate-css`, the 30fps loop); add the minimum new surface.
- Architect the event source so audio is a later drop-in (a second subscriber), not a rewrite.
- Ship "tasteful defaults" that are fully playable now and restyleable by Claude Design through the same hooks.

**Non-goals (this pass)**
- Sound (visual-only now; design must stay audio-ready).
- Onboarding/tutorial, hint system, organism visualization, info-density redesign.
- Per-frame event buffering / coalescing (event rate is modest; can be added later at the subscriber seam if floaters feel noisy).
- Automated tests (manual verification via `/verify`).

## 3. Architecture

Three layers, strictly one-directional dependency, so the game never depends on the visuals:

```
gamestate-logic.ts ──emit()──▶  animation-bus  ◀──subscribe()── animation-overlay (React)
(publisher)                     (pure TS, the seam)             (the only renderer)
                                               ◀──subscribe()── AudioManager (future, no overlay change)
```

- `gamestate-logic.ts` imports only `emit` + the event types.
- `lib/animation/` imports **nothing** from game logic or React — it is the inert seam.
- UI and (later) audio are interchangeable subscribers.

The animation bus is a **separate layer from game state**. `gs` is persistent, serializable, save-able truth; the bus is ephemeral "what just happened," fire-and-forget, never serialized.

### Two channels by nature of the data
- **Bus-driven (semantic moments):** floating `+N` numbers from `actionComplete`, `sonner` banners for `goalMet`/`levelUp`/`victory`, the `runEnd` telegraph, and `synergyApplied` carryover highlights at `runStart`.
- **View-diff-driven (generic):** a resource-number flash on any change, via `use-value-pulse`. Deliberately *not* on the bus, so it also catches passive changes (lifespan ticking, algae sunlight cycling) that the logic never emits for.

## 4. Module layout

New files only; nothing existing moves.

```
src/lib/config.ts                  general app config (persisted, separate localStorage key)
src/lib/animation/
  animation-bus.ts                 emit(event) / subscribe(fn)→unsub; module-level listener set; `enabled` flag
  events.ts                        AnimationEvent discriminated union (stateChange | gameplay)
src/components/animation/
  animation-overlay.tsx            mounted once at app root (if intensity > 0); subscribes; owns active floaters; renders via portal
  floating-number.tsx              the one new primitive: a CSS-keyframe floater, self-removes on animationend
  anchor-registry.ts               register(id, el) / rectFor(id); Map of stable id → DOM element
  use-anchor.ts                    ref-callback hook; cards/rows self-register their position
src/hooks/use-value-pulse.ts       view-diff flash for any resource number (green up / red down)
```

## 5. Event catalogue (`events.ts`)

```ts
type ResourceDelta = { resource: string; amount: number }

export type AnimationEvent =
  // gameplay — happens mid-run
  | { kind: 'gameplay';    type: 'actionComplete'; actionId: string; deltas: ResourceDelta[] }
  | { kind: 'gameplay';    type: 'goalMet';        goalId: string; label: string }
  | { kind: 'gameplay';    type: 'actionUnlocked'; actionId: string }
  | { kind: 'gameplay';    type: 'synergyApplied'; resource: string; amount: number }
  // stateChange — the run/game changes phase
  | { kind: 'stateChange'; type: 'runStart'; level: LevelId; generation: number }
  | { kind: 'stateChange'; type: 'runEnd';   reason: 'lifespan' | 'victory' }
  | { kind: 'stateChange'; type: 'levelUp';  from: LevelId; to: LevelId }
  | { kind: 'stateChange'; type: 'victory' }
  | { kind: 'stateChange'; type: 'pause' }
  | { kind: 'stateChange'; type: 'resume' }
```

**Delta source:** `actionComplete.deltas` are computed by snapshotting resources around the existing `effect()` call, not by parsing the dynamic `gives`/`takes` display strings — so the floater shows the true number even for multiply/efficiency-scaled effects:

```ts
const before = { ...res }
action.effect(res)                              // existing line
emit actionComplete with diff(before, res)      // new — additive
```

## 6. Emit points & suppression

Each emit sits on a branch `Game.tick()` (and the pause handler) already evaluates — purely additive.

| Event | Where |
|-------|-------|
| `actionComplete` | action-completion branch (progress ≥ baseTime), right after `effect()` |
| `goalMet` | goal-completion check, when a goal flips to done |
| `actionUnlocked` | when a goal sets an action `displayed = true` |
| `levelUp` / `victory` | when a goal triggers the next level / the final mass goal |
| `runStart` + `synergyApplied`×N | generation reset, after synergies seed initial resources |
| `runEnd` | lifespan hits 0 (or victory ends the run) |
| `pause` / `resume` | the pause toggle |

**Suppression (#1).** `animationBus.enabled` (default `true`); `emit()` early-returns when `false`. The save-load / hydration path and any batch / fast-forward tick wraps itself:

```ts
animationBus.enabled = false
// …restore or replay ticks…
animationBus.enabled = true
```

Effects therefore fire **only from live, user-visible ticks** — restoring a save never erupts with a backlog of floaters, and the initial `runStart` on load won't spray synergy numbers. This flag is runtime-only and never persisted (it lives on the bus, not in config).

## 7. Overlay, anchor registry & portal

`animation-overlay.tsx` mounts once at the app root (in `App.tsx`), only when intensity > 0. It subscribes on mount, holds a list of active visual instances, and renders them through a **single portal** to an `#animation-root` div — so nothing is clipped by card `overflow:hidden` or stacking contexts.

```ts
// anchor-registry.ts — module-level Map<string, HTMLElement>
register(id, el) · unregister(id) · rectFor(id): DOMRect | null

// use-anchor.ts — ref-callback hook
const ref = useAnchor('action:divide')   // action cards
const ref = useAnchor('res:food')        // resource rows
```

Floaters are `position: fixed` and read `rectFor(id)`; `getBoundingClientRect()` is already viewport coords, so they line up with zero math. A missing id returns `null` and the effect is silently skipped.

## 8. How each moment renders

| Moment | Source | Default rendering |
|--------|--------|-------------------|
| **Action completes** | `actionComplete.deltas` | `+N` / `−N` floater per delta at the action-card anchor, drifting up + fading; green gains, red costs; number via existing antimatter-notation formatter. (Claude Design could later arc it toward the resource row.) |
| **Resource changes** | `use-value-pulse` (view-diff) | The resource number flashes green (up) / red (down) for one beat. Catches passive changes too. |
| **Goal met / unlocked** | `goalMet`, `actionUnlocked` | `goalMet` → `sonner` toast ("Goal reached: …", lucide check). `actionUnlocked` → one-shot **glow ring** in the portal over the new card's rect (card stays dumb). |
| **Run end & evolution** | loop-read + `runEnd`/`levelUp`/`victory`/`synergyApplied` | Continuous **telegraph**: a component reads lifespan each frame and pulses the timer/screen-edge in the final ~5s. `levelUp` → prominent `sonner` banner with the new stage name. `victory` → reuses existing victory screen. At `runStart`, each `synergyApplied` spawns a "+N (carried over)" floater on that resource row. |

## 9. The one new primitive

`floating-number.tsx` — a `fixed`-positioned span animated by a `tw-animate-css` keyframe (drift + fade). It self-removes by calling back to the overlay on `onAnimationEnd`. No timers to leak, no animation library.

## 10. General config (`src/lib/config.ts`)

Top-level in `lib/` (sibling to `saving.ts`), app-wide and meant to grow. Stored under its **own localStorage key, separate from the `'gameState'` save** — so resetting a save never wipes preferences.

```ts
type AppConfig = {
  animation: { intensity: number }   // 0 = off · 1 = default · tweakable upward
  // future: audio: { volume; muted }, ui: { density }, …
}

const CONFIG_KEY = 'config'

const defaultConfig: AppConfig = {
  animation: { intensity: prefersReducedMotion() ? 0.3 : 1 },
}

export function getConfig(): AppConfig
export function updateConfig(patch: DeepPartial<AppConfig>): void   // deep-merge + persist + notify
export function subscribeConfig(fn): () => void                     // tiny pub/sub so UI reacts live
```

- **Namespaced to grow** — `config.audio.*`, `config.ui.*` slot in with no churn.
- **Forward-compatible load** — deep-merge stored JSON over defaults, so older configs gain defaults for new fields; additive growth needs no migrations.
- **Persisted vs runtime is a clean line** — everything in `AppConfig` is persisted preference; runtime-only flags (e.g. `animationBus.enabled`) stay out of it.
- **Reactive** — the overlay reads `getConfig().animation.intensity` and `subscribeConfig(...)` to mount/unmount and update CSS vars live.

## 11. Intensity multiplier math

`config.animation.intensity` (default `1.0`, seeded to `0.3` under `prefers-reduced-motion`).

- **`0`** → overlay isn't mounted and `use-value-pulse` no-ops. Zero cost.
- **`> 0`** → the overlay writes CSS custom properties on the portal root; every keyframe reads them:

```css
--fx-distance: calc(var(--fx-base-distance) * var(--fx-intensity));
--fx-opacity:  min(1, calc(var(--fx-base-opacity) * var(--fx-intensity)));
--fx-scale:    calc(1 + (var(--fx-base-scale) - 1) * var(--fx-intensity));
```

Duration stays fixed (higher intensity = bolder, not slower). Because effects are CSS-var-driven, tuning intensity later is just changing the number — no code touched. `sonner` banners are informational and show at any intensity > 0 rather than being scaled.

## 12. Robustness

Fire-and-forget throughout: a missing anchor skips gracefully; floaters are guaranteed to clean up on `animationEnd`; the overlay keeps a hard cap (~40 concurrent floaters, drop-oldest) as a safety valve against pathological buildup (a ceiling, not coalescing).

## 13. Verification

Manual, since automated tests are out of scope this pass: play a run and confirm each moment fires — action floaters, resource pulses, the goal toast + unlock glow, the run-end telegraph, level-up banner, and synergy carryover floaters at run start. The `/verify` skill can drive this once built.

## 14. Reuse summary

The entire feature is: **one bus, one overlay, one new primitive (the floater), `src/lib/config.ts`, and ~6 additive `emit` calls.** Everything else reuses `sonner` (banners), `tw-animate-css` (keyframes), and the existing 30fps `useUpdate` loop. No new dependencies.

## 15. Future / handoff

- **Audio** — a second bus subscriber; `config.audio` is already the planned home for volume/mute.
- **Claude Design** — can restyle every effect through the same anchors/CSS vars without touching logic; may also own the larger organism-visualization idea.
- **Onboarding/tutorial & info-density redesign** — separate future efforts informed by the same feedback.
