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
      className={`animate-float-up absolute whitespace-nowrap text-center text-sm font-semibold drop-shadow ${toneClass[floater.tone]}`}
      style={{ left: floater.x, top: floater.y }}
      onAnimationEnd={() => onDone(floater.id)}
    >
      {floater.text}
    </div>
  )
}
