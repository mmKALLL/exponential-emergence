import { ActionCard } from '../action-card'
import type { Action } from '@/lib/types'
import { useUpdate } from '@/hooks/use-update'
import { Game } from '@/lib/gamestate-logic'
import { LevelInfoCard } from '../level-info-card'

export function GameScreen() {
  const visibleActionCards = useUpdate(() => Game.visibleActionCards)

  return (
    <>
      <LevelInfoCard />
      <div className="flex gap-4 flex-wrap justify-start">
        {visibleActionCards.map((action: Action) => (
          <ActionCard key={action.name} action={action} />
        ))}
      </div>
      {/* <ThemeModeToggle /> */}
    </>
  )
}
