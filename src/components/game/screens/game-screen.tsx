import { ActionCard } from '../action-card'
import type { Action } from '@/lib/types'
import { useUpdate } from '@/hooks/use-update'
import { Game } from '@/lib/gamestate-logic'
import { LevelInfoCard } from '../level-info-card'
import { SidePanel } from '../side-panel'

export function GameScreen() {
  const visibleActionCards = useUpdate(() => Game.visibleActionCards)

  return (
    <>
      <div className="grid grid-cols-[3fr_1fr]">
        <div className="flex flex-col items-center p-4 gap-4">
          <LevelInfoCard />
          <div className="flex gap-4 flex-wrap justify-start">
            {visibleActionCards.map((action: Action) => (
              <ActionCard key={action.name} action={action} />
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center p-4 gap-4">
          <SidePanel />
        </div>
      </div>
      {/* <ThemeModeToggle /> */}
    </>
  )
}
