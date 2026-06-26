# Claude Design Handoff — Animation / Visual-Feedback Layer

**For:** a design-focused pass to art-direct the visual-feedback effects.
**Branch:** `feat/animation-feedback-layer` (implemented; builds & passes typecheck/lint).
**Background docs:** `docs/plans/2026-06-24-animation-feedback-layer-design.md` (architecture), `docs/plans/2026-06-24-animation-feedback-layer.md` (build plan). Current UI screenshots in `screenshots/`.

## The goal
Playtesters' #1 multi-person complaint is the game "feels like text and numbers." A visual-feedback ("juice") layer was added with **tasteful placeholder defaults**. Your job is to make those effects look and feel great. The plumbing is done and is intentionally restyle-friendly: **you change presentation only; the game logic and event firing stay untouched.**

## What you own (restyle freely)
1. **Keyframes & motion** — `src/App.css`, the appended block: `@keyframes float-up`, `pulse-gain`, `pulse-cost`, `unlock-ring`, and their `.animate-*` classes. Timings, easings, transforms, colors are all yours.
2. **Intensity scaling** — the overlay root sets CSS variables consumed by the keyframes: `--fx-intensity` (the user's 0..N multiplier) and the derived `--fx-distance`, `--fx-opacity`, `--fx-scale` (in `src/components/animation/animation-overlay.tsx`). Re-map these however reads best (e.g. add `--fx-rotate`, change the curves).
3. **The floating number** — `src/components/animation/floating-number.tsx`. Tones are `gain` / `cost` / `carry` (currently green / red / sky). Restyle typography, color, shadow, motion; you may also change how the overlay positions them (e.g. arc toward the resource panel instead of straight up).
4. **The unlock glow ring** and **run-end telegraph** — both rendered in `animation-overlay.tsx` (`.animate-unlock-ring` ring over a card; a pulsing inset ring in the final ~5s).
5. **Banners/toasts** — fired via `sonner` (`toast.success(...)`) for `goalMet`, `levelUp`, `victory`. The `<Toaster/>` is mounted in `src/App.tsx` (position/theme/styling adjustable). Consider whether these should be richer custom banners instead of plain toasts.
6. **Resource pulse** — the `.pulse-gain` / `.pulse-cost` flash on changing numbers (`src/hooks/use-value-pulse.ts` applies the class; the look lives in `App.css`).

## What you must NOT touch (the contract you build on)
- `src/lib/gamestate-logic.ts` emit points and all game logic/balance.
- `src/lib/animation/animation-bus.ts` and `events.ts` (the event vocabulary).
- `src/lib/config.ts` (the persisted `config.animation.intensity` API).
These already fire correctly — rely on them.

## The events you're styling (vocabulary, fired by the game)
| Event | When | Current default |
|-------|------|-----------------|
| `actionComplete { actionName, deltas[] }` | an action finishes a cycle | `+N`/`−N` floaters off the action card |
| `goalMet { label }` | a goal's amount is reached | sonner success toast |
| `actionUnlocked { actionName }` | a goal reveals a new action | green glow ring over the card |
| `levelUp { from, to }` | next stage unlocked | sonner toast "Evolved: X → Y!" |
| `runStart` / `synergyApplied { resource, amount }` | new life begins / carryover seeded | "+N (carried)" floaters on resource rows |
| `runEnd { reason }` / `victory` | the 60s life ends / final goal | red screen-edge telegraph / "Victory!" toast |
| `pause` / `resume` | active action toggled off / on | **no visual yet** — open canvas for you |

## Positioning seam
Effects anchor to on-screen elements via a registry keyed by stable ids: **`action:<actionName>`** (action cards) and **`res:<resourceName>`** (resource rows). `rectFor(id)` returns the element's viewport rect, or `null` if not mounted (effect is skipped). Use these to place anything new.

## Open design decisions (worth your opinion)
- **Banners vs toasts** for goal/level-up/victory — toasts are a placeholder; a more celebratory custom banner for *evolution* especially may land better.
- **Intensity 0 currently silences informational toasts too** (the whole overlay unmounts). If goal/level confirmations should survive "effects off," we'd split a `bannersEnabled` from the intensity multiplier — flag if you want that.
- **`pause`/`resume`** have no visual — a subtle "paused" affordance could help (testers found pause-by-re-press undiscoverable).
- **Bigger swing:** the other top idea from feedback was a Tamagotchi-style **organism visualization** showing resources flowing ("color-code what's touching what"). Out of scope for this layer but a natural next design exploration.

## Try it
`npm run dev` → http://localhost:5178. Tune intensity live in console:
`localStorage.setItem('config', JSON.stringify({animation:{intensity:2}})); location.reload()` (0 = off, 1 = default).
