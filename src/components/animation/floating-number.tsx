import { useEffect, type JSX } from 'react'

export type FloaterTone = 'gain' | 'cost' | 'carry'
export type FloaterPart = { text: string; tone: FloaterTone }

export type Floater = {
  id: number
  x: number
  y: number
  parts: FloaterPart[]
}

const toneClass: Record<FloaterTone, string> = {
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
      className="animate-float-up pointer-events-none absolute flex items-center gap-2 whitespace-nowrap text-sm font-semibold drop-shadow"
      style={{ left: floater.x, top: floater.y }}
      onAnimationEnd={() => onDone(floater.id)}
    >
      {floater.parts.map((part, i) => (
        <span key={`${i}-${part.text}`} className={toneClass[part.tone]}>
          {part.text}
        </span>
      ))}
    </div>
  )
}
