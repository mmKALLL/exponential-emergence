import { useGameState, useUpdate } from '@/hooks/use-update'
import { Game } from '@/lib/gamestate-logic'
import { capitalize, levelLabel } from '@/lib/utils'
import { Card } from '../ui/card'
import { ProgressItem } from './progress-item'
import { MAX_LIFESPAN } from '@/lib/types'

export function LevelInfoCard() {
  const currentGoal = useUpdate(() => Game.currentGoal)
  const currentGoalAmount = useUpdate(() => Game.currentGoalAmount)
  const currentGoalMaximum = useUpdate(() => Game.currentGoalMaximum)
  const resources = useUpdate(() => Game.resources)
  const { currentLevel, lifespanLeft, generation } = useGameState()
  console.log(currentGoalAmount, currentGoalMaximum, currentGoal)

  return (
    <Card className="flex flex-col gap-4 p-4 items-center">
      <p className="">
        Generation {generation} - {levelLabel(currentLevel)}
      </p>
      <div className="w-full">
        {currentGoal ? (
          <ProgressItem value={currentGoalAmount || 0} max={currentGoalMaximum}>
            <h1 className="text-2xl font-bold">
              {' '}
              Next goal: {currentGoalAmount}/{currentGoalMaximum} {currentGoal.resourceName}
            </h1>
          </ProgressItem>
        ) : (
          <h1 className="text-2xl font-bold text-green-500">All {levelLabel(currentLevel)} goals completed!</h1>
        )}
      </div>

      <ProgressItem value={lifespanLeft} max={MAX_LIFESPAN} className="w-full">
        <div className="flex justify-between w-28">
          <span>Lifespan: </span>
          <span>{lifespanLeft.toFixed(1)}s</span>
        </div>
      </ProgressItem>

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
