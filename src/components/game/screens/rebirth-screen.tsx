import { Button } from '@/components/ui/button'
import { useUpdate } from '@/hooks/use-update'
import { Game } from '@/lib/gamestate-logic'
import type { LevelName } from '@/lib/types'
import { levelLabelPrefixed, typedObjectEntries } from '@/lib/utils'
import type { JSX } from 'react'

export function RebirthScreen(): JSX.Element {
  const currentLevel = useUpdate(() => Game.state.currentLevel)
  const unlockedLevels = useUpdate(() => Game.unlockedLevels)
  const lockedTexts: Record<LevelName, string> = {
    amoeba: 'Esa fucked up',
    multicellular: 'Reach 3 divisions to unlock',
    algae: 'Reach 1000 cells to unlock',
    insect: 'Reach 1ml volume to unlock',
    crustacean: 'Reach 10k eggs to unlock',
  }

  return (
    <div className="main-container flex flex-col items-center pt-16 p-4 gap-4">
      <h1 className="text-3xl font-bold font-serif">YOU DIED</h1>
      <div className="text-lg mb-8 mt-7">
        Such is the cycle of life. However, don't fret!
        <br />
        Your achievements as {levelLabelPrefixed(currentLevel)} will provide bonuses to all your future lives.
        <div className="text-xs mt-4">The game doesn't have support for saving yet... Sorry about that...</div>
      </div>
      {typedObjectEntries(lockedTexts).map(([name, lockedText]) =>
        unlockedLevels.includes(name) ? (
          <Button key={name} variant="outline" className="w-80 select-none" onClick={() => Game.rebirth(name)}>
            Rebirth as {name}
          </Button>
        ) : (
          <Button key={name} disabled variant="outline" className="w-80 select-none" onClick={() => {}}>
            {lockedText}
          </Button>
        )
      )}
    </div>
  )
}
