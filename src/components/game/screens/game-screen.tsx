import { ActionCard } from '../action-card'
import type { Action } from '@/lib/types'
import { capitalize, levelLabel } from '@/lib/utils'
import { useGameState, useUpdate } from '@/hooks/use-update'
import { Game } from '@/lib/gamestate-logic'

export function GameScreen() {
  const currentGoal = useUpdate(() => Game.currentGoal)
  const currentGoalAmount = useUpdate(() => Game.currentGoalAmount)
  const currentGoalMaximum = useUpdate(() => Game.currentGoalMaximum)
  const resources = useUpdate(() => Game.resources)
  const visibleActionCards = useUpdate(() => Game.visibleActionCards)
  const { currentLevel, lifespanLeft, generation } = useGameState()

  return (
    <>
      <p className="">
        Generation {generation} - {levelLabel(currentLevel)}
      </p>
      <h1 className="text-2xl font-bold">
        {currentGoal ? (
          <>
            Next goal: {currentGoalAmount}/{currentGoalMaximum} {currentGoal.resourceName}
          </>
        ) : (
          <span className="text-green-500">All {levelLabel(currentLevel)} goals completed!</span>
        )}
      </h1>
      <h1 className="text-1.5xl">Lifespan: {lifespanLeft.toFixed(1)}s</h1>
      <p className="text-md">
        {resources.map(({ name, amount }) => (
          <span key={name} className="px-2">
            {capitalize(name)}: {amount}
          </span>
        ))}
      </p>
      <div className="flex gap-4 flex-wrap justify-start">
        {visibleActionCards.map((action: Action) => (
          <ActionCard key={action.name} action={action} />
        ))}
      </div>
      {/* <ThemeModeToggle /> */}
    </>
  )
}
