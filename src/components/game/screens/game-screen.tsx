import { useGameState } from '@/lib/gamestate-hooks'
import { ActionCard } from '../action-card'
import type { Action } from '@/lib/types'

export function GameScreen() {
  const { gs, dispatch } = useGameState()
  console.log('GameScreen rendered', gs)

  return (
    <>
      <p className="">
        Generation {gs.generation} - {gs.currentLevel}
      </p>
      <h1 className="text-2xl font-bold">Next goal: 0/10 food</h1>
      <div className="flex gap-4 flex-wrap justify-start">
        {gs.levels[gs.currentLevel]?.actionCards.map((action: Action) => (
          <ActionCard
            key={action.name}
            action={action}
            unlockedDisplaySections={gs.unlockedDisplaySections}
            onToggle={() => dispatch({ type: 'action-toggle', payload: action })}
          />
        ))}
      </div>
      {/* <ThemeModeToggle /> */}
    </>
  )
}
