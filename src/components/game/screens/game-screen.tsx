import { useGameState } from '@/lib/gamestate-hooks'
import { ActionCard } from '../action-card'
import type { Action } from '@/lib/types'
import { useEffect } from 'react'
import { levelLabel } from '@/lib/utils'

export function GameScreen() {
  const { gs, dispatch } = useGameState()

  // Core game loop: update gs each frame
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'frame-advance' })
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <p className="">
        Generation {gs.generation} - {levelLabel(gs.currentLevel)}
      </p>
      <h1 className="text-2xl font-bold">Next goal: 0/10 food</h1>
      <h1 className="text-1.5xl font-bold">Lifespan: {gs.lifespanLeft.toFixed(1)}s</h1>
      <div className="flex gap-4 flex-wrap justify-start">
        {Object.values(gs.levels[gs.currentLevel]?.actionCards)
          .filter((action: Action) => action.displayed)
          .map((action: Action) => (
            <ActionCard
              key={action.name}
              action={action}
              isActive={gs.currentActionName === action.name}
              unlockedDisplaySections={gs.unlockedDisplaySections}
              onToggle={() => dispatch({ type: 'action-toggle', payload: action })}
            />
          ))}
      </div>
      {/* <ThemeModeToggle /> */}
    </>
  )
}
