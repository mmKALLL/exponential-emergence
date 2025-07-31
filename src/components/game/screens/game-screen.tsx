import { useGameState } from '@/lib/gamestate-hooks'
import { ActionCard } from '../action-card'
import type { Action } from '@/lib/types'
import { useEffect } from 'react'
import { capitalize, levelLabel } from '@/lib/utils'

export function GameScreen() {
  const { gs, dispatch } = useGameState()

  // Core game loop: update gs each frame
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'frame-advance' })
    }, 100)

    return () => clearInterval(interval)
  }, [])

  const currentGoal = gs.levels[gs.currentLevel].goals[0]
  const currentGoalAmount = gs.levels[gs.currentLevel].resources[currentGoal.resourceName] || 0
  const currentGoalMaximum = currentGoal.requiredAmount

  return (
    <>
      <p className="">
        Generation {gs.generation} - {levelLabel(gs.currentLevel)}
      </p>
      <h1 className="text-2xl font-bold">
        {currentGoal ? (
          <>
            Next goal: {currentGoalAmount}/{currentGoalMaximum} {currentGoal.resourceName}
          </>
        ) : (
          <>All {levelLabel(gs.currentLevel)} goals completed!</>
        )}
      </h1>
      <h1 className="text-1.5xl">Lifespan: {gs.lifespanLeft.toFixed(1)}s</h1>
      <p className="text-md">
        {Object.entries(gs.levels[gs.currentLevel].resources).map(([name, amount]) => (
          <span key={name} className="px-2">
            {capitalize(name)}: {amount}
          </span>
        ))}
      </p>
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
