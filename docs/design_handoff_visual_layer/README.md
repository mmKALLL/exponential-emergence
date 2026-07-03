# Handoff: Visual Layer — Pixel Companion, Juice & Responsive Layout

## Overview
This package specifies a **visual layer** for *Exponential Emergence*, an incremental "time loop" game about evolution, life, and AI. The goal is to make the game more appealing to visually-inclined players by adding:

1. A **living pixel-art "tamagotchi" companion** that sits on-screen, breathes/wanders, plays the current action, and visualizes resource flow (in/out).
2. **"Juice"** — animations for the moments that matter: resource count-ups with floating particles, a contained regular-goal celebration, a big (but dark-safe) evolution transition, and the death→rebirth loop.
3. **Responsive layouts** — a chosen desktop arrangement (1920×1080, up to 10 actions, no scroll) and two mobile arrangements (a dense portrait "Life" screen with a tabbed IA, and a single-screen landscape).
4. A **creature set** — procedural pixel-art for every level in the game's progression, animating on black, ready to drop into the companion tank.

The four HTML files in this bundle are the canonical references. This README is self-sufficient: a developer who wasn't in the design conversation can implement everything from it, using the HTML files to verify exact motion and proportion.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing intended look and behavior, **not production code to copy directly**. They are authored as "Design Components" (`*.dc.html`) that rely on a bundled runtime (`support.js`); that runtime is a *prototyping* harness, **not** part of your app and should not be shipped.

Your task is to **recreate these designs in the game's existing codebase** — the repo is a **React + TypeScript + Vite + Tailwind** app (shadcn-style UI primitives under `src/components/ui`, game logic under `src/lib`). Reuse its established patterns: the `useUpdate` hook, the `Game`/`GameState` singletons in `src/lib/gamestate-logic.ts` and `src/lib/types.tsx`, the existing `Card`, `Button`, and `Progress` primitives, and the level/action/resource data in `src/lib/data`. The creatures should be recreated as a self-contained `<canvas>` React component (see "Creature rendering" below) — that logic ports over almost verbatim; only the mount/animation-frame plumbing needs to become idiomatic React.

Where a value below is marked "illustrative," it is sample data in the prototype (the mock isn't wired to real balance) — pull the real value from game state instead.

## Fidelity
**High-fidelity.** Colors, typography, spacing, sizes, motion timing, and easing are all final and intentional. Recreate the UI to match, using the codebase's existing Tailwind theme and UI primitives. The one area with deliberate latitude is exact pixel-art shapes of creatures — those are procedural and defined by the reference code; reproduce them by porting the draw functions rather than tracing pixels by hand.

---

## Design Tokens

### Color
The game's existing surface is a near-black dark theme. These are the values the visual layer introduces/relies on:

| Token | Hex | Use |
|---|---|---|
| `bg/app` | `#050506` – `#08080a` | App background (near-black) |
| `card` | `#161618` | Card fill |
| `card/border` | `#2a2a2e` | Card border (1px) |
| `track/empty` | `#3a3a3e` | Progress track background |
| `track/fill` | `#f4f4f5` | Default progress fill (goal, action) |
| `text/primary` | `#ffffff` / `#e7e7ea` | Headings / body |
| `text/secondary` | `#cfcfd6` | Sub-labels |
| `text/muted` | `#8a8a92` / `#6b6b72` | Captions, hints |
| `accent/blue` | `#3b82f6` | Primary accent, amoeba body, charts |
| `accent/cyan` | `#22d3ee` | Energy, lifespan fill, evolution |
| `accent/blue-light` | `#93c5fd` / `#bfdbfe` | Glow, membrane highlights |
| `resource/food` | `#fbbf24` | Food flow + values |
| `resource/nutrients` | `#34d399` / `#86efac` | Nutrients / positive deltas |
| `resource/energy` | `#22d3ee` | Energy |
| `secondary-bar/sunlight` | `#fbbf24` | Optional stage bar (amber) |
| `negative` | `#fca5a5` | Resource cost / negative deltas |
| `goal/success` | `#34d399` / `#6ee7b7` | Goal-reached ring + chip |
| `warn` | `#fbbf24` | Lifespan < 24s |
| `danger` | `#ef4444` | Lifespan < 12s |

### Typography
- **Display / pixel labels:** `'Press Start 2P'` (Google Fonts). Used for the "COMPANION" label, level/stage badges, evolution banner, tab micro-labels, section headings. Sizes 6–22px, `letter-spacing: 1–2px`, `text-transform: uppercase`.
- **UI / numbers:** system UI stack (`system-ui, -apple-system, 'Segoe UI', sans-serif`) — the prototypes for layout use this; **if the game already uses a UI font, keep the game's font** and reserve Press Start 2P for the pixel/label accents only. Resource values use `font-variant-numeric: tabular-nums`.
- The Companion Juice Video uses `'IBM Plex Mono'` in places; that's a prototype choice — prefer the game's existing font for body text.

### Spacing / Radius / Shadow
- Card radius: **14–16px** (desktop), 34px inner screen on mobile device frame.
- Card padding: 16–32px depending on density.
- Grid gaps: 16–24px desktop, 9–14px mobile.
- Progress track height: 9–12px (status bars), 4–8px (inline/action bars); radius = half height (pill).
- Card shadow: `0 8px 30px rgba(0,0,0,.5)` (and up to `0 14px 50px rgba(0,0,0,.55)` for elevated screens).
- Tank glow: `box-shadow: inset 0 0 22–30px rgba(59,130,246,.16)` + `inset 0 0 0 3px rgba(59,130,246,.12)`; canvas `filter: drop-shadow(0 0 6px rgba(59,130,246,.55))`.

---

## Screens / Views

### 1. Desktop A — Companion in a left rail  *(chosen desktop layout)*
Reference: **Layout Explorations.dc.html**, frame labeled "Desktop A".

- **Purpose:** Main play screen. The companion has a permanent home column so it's always visible and never covers a card.
- **Canvas:** 1920×1080, no scrolling.
- **Layout:** CSS grid, three columns: `grid-template-columns: 230px 1fr 340px; gap: 24px; padding: 28px`.
  - **Left column (230px) — Companion rail**, flex column:
    - "COMPANION" label (Press Start 2P, 9px, `#5f6168`).
    - **Companion tank**: 174×174, `.tank` styling (radial dark-blue bg, inset glow), centered `<canvas>` with blue drop-shadow. See "Creature rendering."
    - Row: creature name + generation (`Amoeba` / `Gen 1`, 14px, `#cfcfd6` / `#6b6b72`).
    - **Flow indicators**: two mini columns — `FOOD ↓` (amber, animated dots falling) and `↑ ENRG` (cyan, dots rising). Dots are 5×5px, `border-radius:1px`, animated with `flowDown`/`flowUp` (see Interactions). These encode "resource in / resource out."
    - Bottom (margin-top:auto): "Permanent: +0.5× avg speed" caption (illustrative).
  - **Center column (1fr) — status + actions**, flex column, `gap: 24px`:
    - **Status card** (`.gcard`, padding 20–28px): centered "Generation 1 - Amoeba" (15px, `#cfcfd6`), then a vertical stack (`gap: 12px`) of **three equal bars**:
      1. **Next goal** — label row (`Next goal` bold white / `3 / 4 nutrients` secondary), then a 12px track filled to the goal %.
      2. **Lifespan** — `Lifespan` / `41.0s`, 12px track, **cyan** fill (`#22d3ee`).
      3. **Secondary/stage bar (optional)** — e.g. **Sunlight** in the algae stage: amber label `#fbbf24`, `6 / 10`, amber fill. This slot is stage-dependent — render it only when the current level defines a secondary resource bar; when absent, the goal+lifespan stack simply has two rows.
    - **Action grid** (`flex: 1`): `display:grid; grid-template-columns: repeat(5,1fr); grid-template-rows: 1fr 1fr; gap: 16px`. **5×2 = up to 10 action cards.** With fewer actions, cells simply fill from the top-left. Each action card (`.gcard`, padding 14px, flex column, gap 10px):
      - Progress track (`.track`) with fill (action cooldown/progress).
      - Delta row: `-cost` (`#fca5a5`) + `+gain` (`#86efac`), 11px, centered, `min-height:13px`.
      - **Button** (`.btn`): `Name (time)` e.g. "Catch food (0.5)". `#1c1c20` bg, `#34343a` border, radius 9px, padding 10px, 14px weight-600.
      - Mini sparkline `<canvas>` 240×52 at bottom (production over time), blue line + faint blue area fill, green baseline.
  - **Right column (340px) — Resources** (`.gcard`, padding 24–26px), flex column:
    - "Resources" heading (20px, bold, white).
    - Resource rows (`gap: 14px`, 18px, `#e7e7ea`): label left, value right — Food, Energy, Nutrients, Divisions.
    - "SYNERGIES" sub-label (13px, `#7f7f87`, uppercase, `letter-spacing:1px`) + short description (14px, `#9a9aa2`).
    - Footer (margin-top:auto): "Reset life · Delete save" (12px, `#6b6b72`).

### 2. Mobile A2 — Portrait, dense "Life" tab  *(chosen mobile primary)*
Reference: **Layout Explorations.dc.html**, frame labeled "Mobile A2 · dense Life".

- **Purpose:** Primary mobile play screen. Packs companion, goal, lifespan, resources, and all actions onto one screen with **no scrolling and no horizontal paging**.
- **Device frame:** 412×868 outer (radius 46px, `#1a1a1c`), inner screen 34px radius `#08080a`. Notch: 120×26 pill, centered top. (The device bezel is presentation only — don't ship it.)
- **Layout:** flex column, content padding `46px 14px 10px`, `gap: 12px`, with a fixed bottom tab bar.
  - **Top row** (`display:flex; gap:12px`): **companion tank 118×118** (shrinks to share the row) on the left; right side flex column centered:
    - `Amoeba` / `Gen 1` (12px).
    - `Goal: 3/4 nutrients` (15px, bold white).
    - Goal track (8px).
    - Lifespan: inline `Life 41s` (10px) + cyan track (5px).
  - **Resources card** (`.gcard`, padding 11–13px): **2-column grid** `grid-template-columns: 1fr 1fr; gap: 7px 18px`, 13px. Each cell: label (`#9a9aa2`) left, value (`#e7e7ea`) right — Food, Nutrients, Energy, Divisions.
  - "ACTIONS" sub-label (11px, uppercase).
  - **Actions grid** (`flex:1`): **2 columns** `grid-template-columns: 1fr 1fr; gap: 9px; align-content: start`. Each compact action card (`.gcard`, padding 9–10px, flex column, gap 6px):
    - Top row: action name (12px, weight-600, truncates with ellipsis) + time `{t}s` (10px, `#9a9aa2`).
    - Delta line (9px): `-cost` (`#fca5a5`) `+gain` (`#86efac`), `min-height:11px`.
    - Progress track (4px).
    - **Speeds row** (9px, `#6f7078`): `cur 1.20×` (value in `#cfcfd6`) and `perm 0.85×` (value in `#93c5fd`). **This is the key addition for mobile: each action shows its current and permanent speed multiplier.**
  - **Bottom tab bar** (`display:flex; border-top:1px solid #1f1f23; background:#0c0c0e`): three tabs — **Life ●** (active, `#93c5fd`), **Stats ■**, **Evolve ✦**. Inactive `#6b6b72`. Each tab: icon (16px) over label (11px), `padding:10px 0`.
- The other two portrait tabs exist in the file (Mobile B "Stats" — resources/charts/synergies; Mobile C "Evolve" — rebirth) as the IA split. Recreate them as the Stats and Evolve routes; they're lower priority than the dense Life screen but define the information architecture.

### 3. Mobile D — Landscape, single screen
Reference: **Layout Explorations.dc.html**, frame labeled "Mobile D · Landscape".

- **Purpose:** Landscape alternative — everything on one screen, no scroll. Mirrors the desktop three-column split.
- **Device frame:** 892×440 outer (radius 42px), inner 30px radius.
- **Layout:** flex row, `gap: 14px; padding: 16px`.
  - **Left (210px):** companion tank (100%×150) over a compact goal card — `Goal: 3/4 nutrients` (12px) + 7px track, then inline `41s` + cyan 5px track.
  - **Center (flex:1):** actions as a **2-column grid, auto rows** (`grid-template-columns: 1fr 1fr; gap: 9px`) holding up to 8. Each row card: name (12px, truncates) + 4px track + small time button (11px).
  - **Right (118px):** "RES" sub-label + four resource rows (13px): Food, Enrg, Nutr, Div.
- **Recommendation captured in the design:** portrait-with-tabs (Mobile A2) is the primary mobile mode (most phones held in portrait, larger touch targets); landscape is a bonus. Touch targets in landscape are small — enforce a **44px minimum hit area** even if the visual chip is smaller.

### 4. Creature board (reference / asset catalog)
Reference: **Creature Animations.dc.html**.

- **Purpose:** The full set of level creatures, each animating and moving on pure black — the art to drop into the companion tank at each level. Not a game screen; it's the sprite catalog.
- **Layout:** four labeled sections, each a wrapping row of 240×240 tiles (creature `<canvas>` + Press Start 2P name label).
  - **I · Single-cell & invertebrate:** amoeba, multicellular, algae, insect, crustacean.
  - **II · Vertebrates:** fish, amphibian, reptile, mammal, primate.
  - **III · Human ages:** stone (lone figure), then **isometric settlements** — agricultural (farm plot + huts), iron (forge village + furnace/chimney), medieval (walled castle + keep + flag), industrial (factories + smokestacks + gear), modern (skyscrapers + lit windows). Tiny villagers roam each settlement.
  - **IV · Intelligence & cosmos:** planet, general intelligence (chip), self-improvement (recursive squares), human subjugation (robot eye + scan beam over figures), solar system, galaxy, universe, reality (glitching wireframe cube).
- Each creature has an **idle** behavior and an **action pulse** (~every 4.6s, 1.4s long) — e.g. amoeba extends a pseudopod and catches a food speck; insect carries food; algae emits sunlight motes. Wandering creatures **flip to face travel direction**.

### 5. Visual Layer board (direction reference)
Reference: **Visual Layer Board.dc.html**.

- **Purpose:** The original exploration board establishing the **three pixel-style directions** and the juice vocabulary. Use it to understand intent; it is not a screen to ship.
  - **Pixel style — chosen: "Modern neon"** (pixel art + soft glow + faint scanlines on near-black). The other two shown (Game Boy DMG, NES palette) were rejected for not fitting the dark theme.
  - Corner-companion treatment across amoeba/algae/insect with resource-flow arrows.
  - Juice moments: resource count-up + particles, evolve/goal transition, death & rebirth loop.

---

## Interactions & Behavior

### Companion (the tamagotchi)
- **Idle:** continuous breathing (body radius oscillates ~`sin(t*1.6)`), plus a slow wander within its tank (`sin`-based x/y drift). Directional creatures mirror horizontally when moving left.
- **Action playback:** when the player triggers an action, the companion plays a matching beat — reach + catch (amoeba), carry food (insect), pulse/grow (multicellular), tail-flick dart (crustacean), sway + sunlight motes (algae). In the prototype this is on an auto-loop (~4.6s period, 1.4s active); **in-game, drive it from the actual action that's running** (start the pulse when an action fires; intensity can track progress).
- **Resource flow:** the in/out dot streams encode the dominant resource entering vs. leaving. Color per resource (see tokens). Keyframes:
  - `flowDown`: translateY(-8→40px), opacity 0→1→1→0 over 1.4s linear infinite (two dots, 0.7s offset).
  - `flowUp`: translateY(8→-40px), same timing.
- **Lifespan:** the companion's tank/label reflect the 60s life; the `lifeDrain` keyframe (prototype) drains a bar cyan→amber→red then resets — in-game bind to real lifespan (`MAX_LIFESPAN = 60`, see `src/lib/types.tsx`).

### Resource count-up juice
- On any resource gain/loss: the value **pops** (`popN`: scale 1→1.4→1 over .45s, briefly white) and a **floating delta** (`+N`/`-N`) rises off the row (`floatUp`: translateY 0→-52px, scale .9→1.05, opacity 0→1→0 over 1s) colored `#86efac` (gain) / `#fca5a5` (loss). Numbers use tabular-nums so they don't jitter.
- Implementation note: on value change, spawn an absolutely-positioned span in the row (`position:relative` parent), animate, remove after 1s.

### Regular-goal celebration (contained — NOT full-screen)
Reference: Companion Juice Video, "regular goal" beats; Layout goal card.
- When a **non-final** goal is met (e.g. "3/4 nutrients" → "4/4"): a **contained** green treatment on the goal card only — a green ring (`#34d399`) fades/scales in around the card (`opacity` to ~0.9, `scale` 1→1.04, `box-shadow` bloom up to `0 0 26px rgba(52,211,153,.5)`), plus a small "Goal reached ✓" chip slides down from the card's top-right. **No screen flash.** Duration ~1.5–2s, ease-out.
- **Rationale (important):** the screen is very dark; a full-screen white flash would blind the player. Keep regular-goal feedback localized to the card.

### Evolution transition (final goal only — the big payoff)
Reference: Companion Juice Video (evolution beat), Visual Layer Board (evolve tile).
- **Trigger:** only when the **last goal of a level** completes (most goals are ordinary milestones — 2/5 food, gather 10 energy, create 1000 cells, etc. — and do **not** evolve; only after the final one does the creature evolve to the next life form).
- **Sequence (~2–3s):**
  1. **Bloom** localized to the companion: a radial cyan/blue gradient (`radial-gradient(circle, rgba(34,211,238,.9), rgba(59,130,246,.35) 45%, transparent 70%)`) scales `0.2→~2.8` and fades.
  2. **Light rays** (conic `repeating-conic-gradient` masked to a disc) rotate and fade in behind the companion.
  3. **Particle burst:** ~14 pixel sparks fly outward (cyan `#22d3ee` / `#bfdbfe`), 1s ease-out.
  4. **Companion morph:** current creature **cross-fades** into the next life form over ~2.8s (e.g. amoeba → multicellular cluster).
  5. **Soft inward vignette** on the whole screen — `box-shadow: inset 0 0 220px 40px rgba(34,130,246,.45)` — capped at **~0.5 opacity**. This is the ONLY screen-wide effect and it is **colored (blue/cyan), never white**, and never fully opaque. Keep it dark-safe.
  6. **Banner:** "✦ EVOLVED" + "AMOEBA → MULTICELLULAR" (Press Start 2P, `#bfdbfe` / `#7fd0e8`) fades in top-center, then out.
  7. Post-transition, UI swaps: generation +1, level name, companion label, and any renamed resources (e.g. "Divisions" → "Cells").
- **Lifespan resets** at evolution (new life).

### Death & rebirth loop
Reference: Visual Layer Board (rebirth tile), Companion Juice Video.
- Lifespan drains over 60s (cyan→amber→red). At death: creature **fades/desaturates and tips over**, brief pause, then **snaps back reborn** (green halo `rbHalo` expands and fades) with a "✦ REBORN" text beat.
- **Permanent bonus display — use an AGGREGATE, not a list.** Each action has its own permanent speed buff and there can be **up to 8 actions**, so **do not enumerate per-action buffs** (that could be 8+ rows). Show one aggregate line — e.g. **"+0.1× to 8 actions"** — optionally with a quick shimmer sweeping across the action cards (each card briefly pulses its own gain). This scales to any action count and reads in a second.

### Responsive behavior
- **Desktop:** fixed 1920×1080 composition, scaled to fit; no scroll. Action grid is 5×2 (≤10 actions).
- **Mobile portrait:** tabbed IA (Life / Stats / Evolve). Life screen fits without scroll at 412×868; actions in 2 columns. Never require horizontal scrolling.
- **Mobile landscape:** three-column single screen; enforce 44px min touch targets.

---

## State Management
Bind the visual layer to the existing game state (`Game` / `GameState` in `src/lib/gamestate-logic.ts`, `src/lib/types.tsx`; `useUpdate` hook to re-render on tick). Needed inputs:

- **Current level** (`LevelName`) → selects which creature to render and any renamed resources / secondary bar.
- **Generation** number → companion label / status card.
- **Resources** map (food, nutrients, energy, divisions/cells, …) → resource panel + count-up juice (diff previous vs current each tick to trigger pops/floats).
- **Active action(s)** + progress → action-card fills, companion action pulse, sparklines.
- **Per-action current & permanent speed** multipliers → mobile action cards (`cur` / `perm`).
- **Current goal** (label, current, target, and whether it's the level's final goal) → goal bar; final-goal flag gates the evolution sequence vs. the contained celebration.
- **Optional secondary resource bar** per level (e.g. Sunlight for algae) → third status bar (render only when present).
- **Lifespan** (0–60s, `MAX_LIFESPAN`, `TICK_LENGTH = 1/30`) → lifespan bar + death/rebirth trigger.
- **Aggregate permanent bonus** (multiplier + count of affected actions) → rebirth screen.

Transient/local UI state: companion animation clock (rAF), in-flight float/particle nodes, celebration/evolution timers, active mobile tab.

---

## Creature rendering (implementation guide)
All creatures are **procedural pixel art drawn on `<canvas>`** — no image assets. The reference implementation lives in **Creature Animations.dc.html** (and the companion variants in the other files). Port it as follows:

- Build a **`<PixelCreature kind={LevelName} size={n} />`** React component. Internally: create a canvas sized `G*S*dpr` (grid units × pixel scale × devicePixelRatio, `imageSmoothingEnabled=false`, `image-rendering: pixelated`), run a `requestAnimationFrame` loop from `useEffect`, and on each frame clear + dispatch to a per-kind draw function. Cancel the rAF on unmount.
- The draw functions use a tiny primitive set you can copy verbatim: `px` (draw one pixel-cell), `disc`, `ring`, `ell` (filled ellipse with optional top-shade color), `rect`, `line` (Bresenham), plus `pxa` (alpha), and for settlements `iso`/`fillPoly`/`isoBox`/`roofGable`/`winFace`/`villagers`. Coordinates are centre-origin grid units; a `drawAt(cx, cy, faceLeft, fn)` helper translates + optionally mirrors.
- **Palette per creature** is defined inline in each draw function (see tokens for the amoeba/companion blues). The **companion in-game uses the "Modern neon" style**: creature on transparent/near-black with a blue `drop-shadow` glow and faint scanline overlay on the tank.
- **Motion:** driven by a single time value `t` (seconds). Idle = continuous; the **action pulse** is `act ∈ [0,1]` (a raised sine over the active window). In the catalog it auto-loops; in-game pass `act` from the real running action.
- **Level → creature map** (current `LevelName` union): `amoeba, multicellular, algae, insect, crustacean, fish, amphibian, reptile, mammal, primate` and the human ages `stone, agricultural(farm), iron, medieval, industrial, modern`, plus later tiers `planet, agi (general intelligence), selfimprove (self improvement), subjugation (human subjugation), solar (solar system), galaxy, universe, reality`. The commented-out `tribe/town/clan/nation` tiers were folded into the six human-age settlements — reconcile with your final level list.

### Recent creature art notes (already applied in the reference)
- **Insect:** redrawn cuter — plump round body, one big friendly eye + smile, bouncy bulb-tipped antennae; legs sweep **backward while planted** so it reads as walking forward (earlier version looked like it moonwalked). Brighter amber/tan palette so it reads on black.
- **Amphibian:** eyes are full domes with complete irises (tops included) + pupil + shine.
- **Mammal:** tail arcs up off the back then droops under gravity with a soft flowing sway.
- **Primate:** face is a round inset patch framed evenly by fur (no dark-into-light bleed).
- **Human ages (agricultural → modern):** isometric pixel settlements that grow in complexity, with tiny people running around, instead of a single figure. Stone age stays a lone figure as the transition into civilization.

---

## Assets
- **Fonts:** `Press Start 2P` and (in prototypes) `IBM Plex Mono` via Google Fonts. In-game, keep the game's existing UI font for body; use Press Start 2P only for pixel/label accents.
- **Images/icons:** none. All creatures and effects are procedural (`<canvas>` + CSS). No sprite sheets to import.
- **`support.js`:** the DC prototype runtime — **reference only, do not ship.** It's included so the `.dc.html` files open and animate locally for you to inspect motion/timing.

## Files
In this bundle (open any `.dc.html` in a browser to see it animate; they load `support.js` from the same folder):
- `Layout Explorations.dc.html` — **Desktop A**, **Mobile A2 (dense Life)**, **Mobile D (landscape)**, plus the other desktop options and portrait tabs (Stats/Evolve) that define the IA.
- `Creature Animations.dc.html` — the full creature catalog (all levels), animating on black.
- `Companion Juice Video.dc.html` — a timeline walkthrough of the companion on the game screen with all the juice (count-up, contained goal celebration, dark-safe evolution, rebirth). Best reference for **motion timing and the evolution/rebirth sequences**. Has a scrubber + play/pause.
- `Visual Layer Board.dc.html` — the pixel-style direction board (Modern neon chosen) + juice vocabulary.

In the game repo, the relevant existing files to integrate with:
- `src/lib/types.tsx` (`LevelName`, `MAX_LIFESPAN`, `TICK_LENGTH`, effect/resource types)
- `src/lib/gamestate-logic.ts` (`Game`, `GameState`)
- `src/lib/data/level-definitions.ts`, `src/lib/data/action-definitions.ts`
- `src/components/game/*` (`level-info-card`, `resource-display`, `action-card`, `screens/game-screen`) and `src/components/ui/*` (`card`, `button`, `progress`)
- `src/hooks/use-update.ts`
