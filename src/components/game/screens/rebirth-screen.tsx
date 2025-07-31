import { Button } from '@/components/ui/button'
import { useGameState } from '@/lib/gamestate-hooks'
import { levelLabelPrefixed } from '@/lib/utils'
import type { JSX } from 'react'

export function RebirthScreen(): JSX.Element {
  const { gs, dispatch } = useGameState()

  return (
    <div className="main-container flex flex-col items-center pt-16 p-4 gap-4">
      <h1 className="text-3xl font-bold font-serif">YOU DIED</h1>
      <p className="text-lg mb-8 mt-7">
        Such is the cycle of life. However, don't fret!
        <br />
        Your achievements as {levelLabelPrefixed(gs.currentLevel)} will provide bonuses to all your future lives.
        <p className="text-xs mt-4">Evolution beyond Amoeba is still work in progress... Sorry about that...</p>
      </p>
      <Button variant="outline" className="w-80 select-none" onClick={() => dispatch({ type: 'rebirth-select', payload: 'amoeba' })}>
        Rebirth as Amoeba
      </Button>
      <Button disabled variant="outline" className="w-80 select-none" onClick={() => {}}>
        Reach 3 divisions to unlock
      </Button>
      <Button disabled variant="outline" className="w-80 select-none" onClick={() => {}}>
        Reach 1000 cells to unlock
      </Button>
      <Button disabled variant="outline" className="w-80 select-none" onClick={() => {}}>
        Reach 1ml volume to unlock
      </Button>
      <Button disabled variant="outline" className="w-80 select-none" onClick={() => {}}>
        Reach 10k eggs to unlock
      </Button>
    </div>
  )
}
