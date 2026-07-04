import { Button } from '@/components/ui/button'
import { useUpdate } from '@/hooks/use-update'
import { Game } from '@/lib/gamestate-logic'
import { exportSave, importSave } from '@/lib/saving'
import { shareGame } from '@/lib/share'
import type { LevelName } from '@/lib/types'
import { levelLabelPrefixed, typedObjectEntries } from '@/lib/utils'
import type { JSX } from 'react'
import { toast } from 'sonner'

export function RebirthScreen(): JSX.Element {
  const currentLevel = useUpdate(() => Game.state.currentLevel)
  const algaePlays = useUpdate(() => Game.state.algaePlays)
  const unlockedLevels = useUpdate(() => Game.unlockedLevels)
  const synergyTextUnlocked = useUpdate(() => Game.state.unlockedDisplaySections.synergyHelpText)
  const additionalHelpTextUnlocked = useUpdate(() => Game.state.unlockedDisplaySections.synergyHelpTextAddition)

  const lockedTexts: Record<LevelName, string> = {
    amoeba: 'Esa fucked up, email the devs',
    multicellular: 'Reach 3 divisions to unlock',
    algae: 'Reach 1000 cells to unlock',
    insect: 'Reach 1 meter length to unlock',
    crustacean: 'Reach 10k eggs to unlock',
  }

  const handleExport = async () => {
    const code = exportSave(Game.state)
    try {
      await navigator.clipboard.writeText(code)
      toast.success('Save copied to clipboard')
    } catch {
      // Clipboard unavailable (e.g. insecure context) — fall back to a manual-copy prompt
      window.prompt('Copy your save string:', code)
    }
  }

  const handleImport = () => {
    const code = window.prompt('Paste a save string to import:')
    if (!code) return
    if (importSave(code)) {
      window.location.reload()
    } else {
      toast.error('Invalid save string')
    }
  }

  return (
    <div className="main-container flex flex-col items-center pt-16 p-4 gap-4">
      <h1 className="text-3xl font-bold font-serif">YOU DIED</h1>
      <div className="text-lg mb-8 mt-7">
        Such is the cycle of life. However, don't fret!
        <br />
        Your actions provide permanent bonuses to all of your future lives.
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
      <div className="mt-4 flex gap-4">
        <Button variant="outline" className="select-none" onClick={handleExport}>
          Export save
        </Button>
        <Button variant="outline" className="select-none" onClick={handleImport}>
          Import save
        </Button>
        {algaePlays >= 3 && (
          <Button variant="outline" className="select-none" onClick={() => shareGame()}>
            Share with a friend
          </Button>
        )}
      </div>
      {synergyTextUnlocked && (
        <div className="text-lg mb-8 mt-7">
          You can now get synergy bonuses based on previous stages. <br />
          Check them in the resource display's Synergies tab!
          {additionalHelpTextUnlocked && (
            <>
              <br />
              <br />
              If you struggle in a later stage, try improving your synergies.
            </>
          )}
        </div>
      )}
    </div>
  )
}
