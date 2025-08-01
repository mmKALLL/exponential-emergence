import { useGameState, useUpdate } from '@/hooks/use-update'
import { Game } from '@/lib/gamestate-logic'
import { capitalize, levelLabel } from '@/lib/utils'
import { Card } from '../ui/card'
import { ProgressItem } from './progress-item'

export function LevelInfoCard() {
  const currentGoal = useUpdate(() => Game.currentGoal)
  const currentGoalAmount = useUpdate(() => Game.currentGoalAmount)
  const currentGoalMaximum = useUpdate(() => Game.currentGoalMaximum)
  const resources = useUpdate(() => Game.resources)
  const { currentLevel, lifespanLeft, generation } = useGameState()
  console.log(currentGoalAmount, currentGoalMaximum, currentGoal)

  return (
    <Card className="flex flex-col gap-2 p-4 items-center">
      <p className="">
        Generation {generation} - {levelLabel(currentLevel)}
      </p>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">
          {currentGoal ? (
            <ProgressItem value={currentGoalAmount || 0} max={currentGoalMaximum}>
              Next goal: {currentGoalAmount}/{currentGoalMaximum} {currentGoal.resourceName}
            </ProgressItem>
          ) : (
            <span className="text-green-500">All {levelLabel(currentLevel)} goals completed!</span>
          )}
        </h1>
      </div>
      <h1 className="text-1.5xl">Lifespan: {lifespanLeft.toFixed(1)}s</h1>
      <p className="text-md">
        {resources.map(({ name, amount }) => (
          <span key={name} className="px-2">
            {capitalize(name)}: {amount}
          </span>
        ))}
      </p>
    </Card>
  )
}
