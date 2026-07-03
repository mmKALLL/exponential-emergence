import { useEffect, useRef } from 'react'
import { Game } from '@/lib/gamestate-logic'
import type { LevelName } from '@/lib/types'
import { maxTime } from '@/lib/utils'

// Grid units per side and pixel-cell scale. Ported verbatim from the reference
// (Creature Animations.dc.html: this.G = 40; this.S = 6).
const G = 40
const S = 6

type Ctx = CanvasRenderingContext2D

// Per-creature config: motion mode + neon glow color. Ported from the
// reference `cfg` map (only the five implemented invertebrates).
const CFG: Record<LevelName, { mode: 'wander' | 'rooted'; glow: string }> = {
  amoeba: { mode: 'wander', glow: 'rgba(59,130,246,.55)' },
  multicellular: { mode: 'wander', glow: 'rgba(34,211,238,.5)' },
  algae: { mode: 'rooted', glow: 'rgba(52,211,153,.5)' },
  insect: { mode: 'wander', glow: 'rgba(232,192,116,.55)' },
  crustacean: { mode: 'wander', glow: 'rgba(249,115,22,.5)' },
}

// ---- primitives (centre-origin grid units) ----
// Ported from the reference primitive set (px, disc, ring, ell, rect, line,
// pxa, drawAt). Only those used by the five invertebrate draws are kept here;
// the alpha/ring/rect variants come back when later creatures are ported.
function px(ctx: Ctx, x: number, y: number, c: string) {
  ctx.fillStyle = c
  ctx.fillRect(Math.round(x) * S, Math.round(y) * S, S, S)
}
function disc(ctx: Ctx, cx: number, cy: number, r: number, c: string) {
  for (let y = Math.floor(cy - r); y <= cy + r; y++)
    for (let x = Math.floor(cx - r); x <= cx + r; x++) {
      const dx = x - cx
      const dy = y - cy
      if (dx * dx + dy * dy <= r * r) px(ctx, x, y, c)
    }
}
function ell(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, c: string, topC?: string) {
  for (let y = Math.floor(cy - ry); y <= cy + ry; y++)
    for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
      const nx = (x - cx) / rx
      const ny = (y - cy) / ry
      if (nx * nx + ny * ny <= 1) px(ctx, x, y, topC && y < cy - ry * 0.3 ? topC : c)
    }
}
function line(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, c: string) {
  x0 = Math.round(x0)
  y0 = Math.round(y0)
  x1 = Math.round(x1)
  y1 = Math.round(y1)
  const dx = Math.abs(x1 - x0)
  const dy = Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx - dy
  for (let n = 0; n < 90; n++) {
    px(ctx, x0, y0, c)
    if (x0 === x1 && y0 === y1) break
    const e2 = 2 * err
    if (e2 > -dy) {
      err -= dy
      x0 += sx
    }
    if (e2 < dx) {
      err += dx
      y0 += sy
    }
  }
}

// drawAt: translate to centre-origin, optionally mirror to face left.
function drawAt(ctx: Ctx, gx: number, gy: number, faceLeft: boolean, fn: () => void) {
  ctx.save()
  ctx.translate(gx * S, gy * S)
  if (faceLeft) ctx.scale(-1, 1)
  fn()
  ctx.restore()
}

// ================= INVERTEBRATES =================
function drawAmoeba(ctx: Ctx, t: number, act: number) {
  const R = 7
  const breathe = Math.sin(t * 1.6) * 0.9
  const reach = -0.35
  const body = ['#3b82f6', '#1e3a8a']
  const mem = '#93c5fd'
  const nuc = '#22d3ee'
  const vac = '#bfdbfe'
  const food = '#fbbf24'
  const ad = (a: number, b: number) => {
    let d = a - b
    while (d > Math.PI) d -= 2 * Math.PI
    while (d < -Math.PI) d += 2 * Math.PI
    return d
  }
  for (let y = -15; y <= 15; y++)
    for (let x = -15; x <= 15; x++) {
      const d = Math.hypot(x, y)
      const ang = Math.atan2(y, x)
      const wob = Math.sin(ang * 3 + t * 1.8) * 1.1 + Math.cos(ang * 2 - t * 1.3) * 0.8
      const bump = act * 3.8 * Math.exp(-(ad(ang, reach) ** 2) / 0.22)
      const edge = R + breathe + wob + bump
      if (d <= edge) px(ctx, x, y, d > edge - 1.5 ? mem : d < edge * 0.5 ? body[1] : body[0])
    }
  disc(ctx, -3 + Math.sin(t * 0.9) * 0.6, 2, 1.7, vac)
  disc(ctx, 3 + Math.cos(t * 1.1) * 0.5, 3, 1.3, vac)
  disc(ctx, 1.5 + Math.sin(t * 0.7) * 0.5, -1 + Math.cos(t * 0.8) * 0.5, 2.6, nuc)
  if (act > 0.05) {
    const fr = (R + 7) * (1 - act)
    disc(ctx, Math.cos(reach) * fr, Math.sin(reach) * fr, 1.3, food)
  }
}
function drawCluster(ctx: Ctx, t: number, act: number) {
  const body = ['#3b82f6', '#1e3a8a']
  const mem = '#7dd3fc'
  const nuc = '#22d3ee'
  const grow = 1 + act * 0.16
  const cells = [
    [0, 0],
    [-4.4, -1.9],
    [4.2, -2.3],
    [-2.5, 3.6],
    [3.4, 3.4],
    [0, -4.6],
    [-5.1, 2.1],
    [5, 1],
    [1.3, 5.7],
  ]
  cells.forEach((o, i) => {
    const ox = (o[0] + Math.sin(t * 1.4 + i) * 0.6) * grow
    const oy = (o[1] + Math.cos(t * 1.5 + i) * 0.6) * grow
    const r = (3.2 + Math.sin(t * 2 + i) * 0.4) * grow
    disc(ctx, ox, oy, r, mem)
    disc(ctx, ox, oy, r - 1.1, body[0])
    disc(ctx, ox, oy, r - 2.4, body[1])
    px(ctx, ox, oy, nuc)
  })
}
function drawAlgae(ctx: Ctx, t: number, act: number) {
  const gA = '#256e3c'
  const gB = '#3f9d5b'
  const chl = '#bbf7d0'
  const H = 30
  const topY = -(H - Math.round(act * 3))
  for (let y = 0; y >= topY; y--) {
    const frac = y / topY
    const sway = Math.sin(frac * 3 + t * 1.4) * frac * 4.6
    const thick = 2.8 - frac * 1.9
    for (let x = Math.floor(sway - thick); x <= sway + thick; x++) px(ctx, x, y, Math.abs(x - sway) > thick - 1 ? gA : gB)
    if (y % 5 === 0) px(ctx, sway + (y % 2 ? 1 : -1), y, chl)
  }
  ;[0.42, 0.7].forEach((bf, k) => {
    const by = Math.round(topY * bf)
    const sway = Math.sin(bf * 3 + t * 1.4) * bf * 4.6
    const dir = k % 2 ? 1 : -1
    for (let s = 1; s <= 5; s++) {
      const wob = Math.sin(t * 1.6 + s) * 0.6
      px(ctx, sway + dir * s, by - s * 0.8 + wob, s > 3 ? gA : gB)
      if (s === 5) px(ctx, sway + dir * s, by - s * 0.8 + wob - 1, chl)
    }
  })
  for (let x = -3; x <= 3; x++) px(ctx, x, 1, '#6b4423')
  px(ctx, -4, 0, '#6b4423')
  px(ctx, 4, 0, '#6b4423')
  if (act > 0.05) for (let i = 0; i < 3; i++) px(ctx, -7 + i * 6, topY + ((t * 8 + i * 9) % Math.abs(topY)), '#fde047')
}
function drawInsect(ctx: Ctx, t: number, _act: number) {
  const body = '#c8862f'
  const hi = '#f3d28a'
  const head = '#b5772f'
  const out = '#e0a85a'
  const eye = '#1c1917'
  const white = '#fdf6e3'
  const spot = '#86521d'
  const leg = '#cda05a'
  const bob = Math.abs(Math.sin(t * 7)) * 0.5
  // 3 visible legs that sweep BACKWARD while planted (propels body forward)
  for (let i = 0; i < 3; i++) {
    const hx = -3.4 + i * 2.6
    const phase = t * 7 + i * 2.094
    const lift = Math.max(0, Math.sin(phase)) * 1.8
    const fx = hx - Math.cos(phase) * 1.7
    const fy = 4.4 - lift
    const kx = (hx + fx) / 2 - 0.6
    const ky = 2.6
    line(ctx, hx, 1.6 - bob, kx, ky - bob, leg)
    line(ctx, kx, ky - bob, fx, fy - bob, leg)
  }
  // plump round body + head (cute)
  ell(ctx, -3, -bob, 5.4, 4.4, body, hi)
  disc(ctx, -2.6, -bob - 0.4, 0.9, spot)
  disc(ctx, -4.4, -bob + 0.6, 0.7, spot)
  disc(ctx, 3.4, -bob, 3.3, head)
  // one big friendly eye + highlight
  disc(ctx, 4.4, -bob - 0.5, 1.7, white)
  disc(ctx, 4.9, -bob - 0.3, 1.0, eye)
  px(ctx, 4.4, -bob - 1, white)
  // little smile
  px(ctx, 3.4, -bob + 2.4, spot)
  line(ctx, 4, -bob + 2.7, 5.4, -bob + 2.4, spot)
  // bouncy antennae with bulb tips
  const aw = Math.sin(t * 5) * 1.3
  line(ctx, 4.4, -bob - 2.8, 6.4, -bob - 5.2 + aw, out)
  disc(ctx, 6.4, -bob - 5.2 + aw, 1, '#fde047')
  line(ctx, 2.8, -bob - 3, 3.2, -bob - 5.6 + aw, out)
  disc(ctx, 3.2, -bob - 5.6 + aw, 1, '#fde047')
}
function drawCrustacean(ctx: Ctx, t: number, act: number) {
  const shell = '#f97316'
  const dark = '#c2410c'
  const hi = '#fdba74'
  const eye = '#22d3ee'
  const fan = '#fb923c'
  const flick = act
  const seg: [number, number, number][] = []
  for (let i = 0; i <= 9; i++) {
    const s = i / 9
    const bx = 8 - i * 1.9
    const by = Math.sin(i * 0.55 - t * 5) * (1 + s * 1.6) + s * s * (3.5 - flick * 4.5)
    seg.push([bx, by, 3.2 - i * 0.27])
  }
  for (let i = 2; i < 9; i++) {
    const [bx, by] = seg[i]
    const paddle = Math.sin(t * 7 - i * 0.9) * 1.5
    line(ctx, bx, by + 1, bx - 0.6, by + 3 + paddle, dark)
  }
  for (let i = seg.length - 1; i >= 0; i--) {
    const [bx, by, r] = seg[i]
    disc(ctx, bx, by, r, dark)
    disc(ctx, bx, by, r - 1, shell)
    if (i < 6) px(ctx, bx, by - r + 1, hi)
  }
  const [tx, ty] = seg[seg.length - 1]
  const spread = 2.3 + flick * 1.6
  for (let a = -1; a <= 1; a++) {
    line(ctx, tx, ty, tx - 2.4, ty + a * spread, fan)
    px(ctx, tx - 2.4, ty + a * spread, hi)
  }
  const [hx, hy] = seg[0]
  disc(ctx, hx, hy, 1.3, eye)
  px(ctx, hx + 0.6, hy - 0.6, '#e0fbff')
  line(ctx, hx + 2, hy - 1, hx + 5, hy - 2.4, dark)
  for (let l = 0; l < 3; l++) {
    const lx = hx - 1 - l * 1.5
    const lp = Math.sin(t * 6 - l) * 1
    line(ctx, lx, hy + 2, lx - 0.5, hy + 4 + lp, dark)
  }
  const aw = Math.sin(t * 3) * 1.9
  line(ctx, hx + 1, hy, hx + 6, hy + 4 + aw, hi)
  line(ctx, hx + 1, hy + 1, hx + 7, hy + 7 + aw, dark)
}

const DRAW: Record<LevelName, (ctx: Ctx, t: number, act: number) => void> = {
  amoeba: drawAmoeba,
  multicellular: drawCluster,
  algae: drawAlgae,
  insect: drawInsect,
  crustacean: drawCrustacean,
}

// Read the real running action's progress toward completion, mapped to [0,1].
// Returns 0 when no action is active (idle).
function actionProgress(): number {
  const name = Game.state.currentActionName
  if (!name) return 0
  const action = Game.currentLevel.actions[name]
  if (!action) return 0
  const total = maxTime(action)
  if (!(total > 0)) return 0
  return Math.max(0, Math.min(1, action.progress / total))
}

type PixelCreatureProps = {
  kind: LevelName
  size: number
}

export function PixelCreature({ kind, size }: PixelCreatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Keep the latest kind in a ref so the rAF loop always dispatches the current
  // creature without restarting the loop.
  const kindRef = useRef(kind)
  kindRef.current = kind

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = G * S * dpr
    canvas.height = G * S * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.imageSmoothingEnabled = false

    const start = performance.now()
    let raf = 0
    // Eased action pulse; ramps up while an action runs, decays toward 0 when idle.
    let act = 0

    const loop = () => {
      const t = (performance.now() - start) / 1000
      // Drive the pulse from the real running action's progress. A raised sine
      // over progress gives a visible "reach + catch" beat that resets each
      // completion; ease toward 0 when idle.
      const target = Math.sin(actionProgress() * Math.PI)
      act += (target - act) * 0.15

      const k = kindRef.current
      const cfg = CFG[k]
      ctx.clearRect(0, 0, G * S, G * S)

      if (cfg.mode === 'rooted') {
        drawAt(ctx, G / 2, G - 4, false, () => DRAW[k](ctx, t, act))
      } else {
        // wander: slow sin drift; mirror horizontally when moving left.
        const ax = 9
        const ay = 6
        const fx = 0.32
        const fy = 0.47
        const ox = ax * Math.sin(t * fx)
        const oy = ay * Math.sin(t * fy + 1.3)
        const vx = Math.cos(t * fx)
        const cy = k === 'insect' ? G / 2 + 3 : G / 2
        drawAt(ctx, G / 2 + ox, cy + oy, vx < 0, () => DRAW[k](ctx, t, act))
      }

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => cancelAnimationFrame(raf)
  }, [])

  const glow = CFG[kind]?.glow ?? 'rgba(59,130,246,.55)'

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: size,
        height: size,
        imageRendering: 'pixelated',
        filter: `drop-shadow(0 0 6px ${glow})`,
      }}
    />
  )
}
