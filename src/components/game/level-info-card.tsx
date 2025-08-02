import { useUpdate } from '@/hooks/use-update'
import { Game } from '@/lib/gamestate-logic'
import { formatNumber, levelLabel } from '@/lib/utils'
import { Card } from '../ui/card'
import { ProgressItem } from './progress-item'
import { MAX_LIFESPAN } from '@/lib/types'

export function LevelInfoCard() {
  const currentGoal = useUpdate(() => Game.currentGoal)
  const currentGoalAmount = useUpdate(() => Game.currentGoalAmount)
  const currentGoalMaximum = useUpdate(() => Game.currentGoalMaximum)
  const currentSunlight = useUpdate(() => Game.currentSunlight)
  const currentSunlightMaximum = useUpdate(() => Game.sunlightMaximum)
  const currentLevelName = useUpdate(() => Game.currentLevel.name)
  const generation = useUpdate(() => Game.state.generation)
  const lifespanLeft = useUpdate(() => Game.state.lifespanLeft)

  return (
    <Card className="flex flex-col gap-4 p-4 items-center w-108">
      <p>
        Generation {generation} - {levelLabel(currentLevelName)}
      </p>
      <div className="w-full">
        {currentGoal ? (
          <ProgressItem value={currentGoalAmount || 0} max={currentGoalMaximum}>
            <div className="text-2xl font-bold">
              Next goal: {formatNumber(currentGoalAmount)}/{formatNumber(currentGoalMaximum)} {currentGoal.resourceName}
            </div>
          </ProgressItem>
        ) : (
          <h1 className="text-2xl font-bold text-green-500 justify-self-center">All {levelLabel(currentLevelName)} goals completed!</h1>
        )}
      </div>

      <ProgressItem value={lifespanLeft} max={MAX_LIFESPAN} className="w-full">
        <div className="flex justify-between w-28">
          <span>Lifespan: </span>
          <span>{lifespanLeft.toFixed(1)}s</span>
        </div>
      </ProgressItem>

      {currentLevelName === 'algae' && (
        <ProgressItem value={currentSunlight} max={currentSunlightMaximum} className="w-full">
          <div className="flex justify-between w-28">
            <span>Sunlight: </span>
            <span>{currentSunlight.toFixed(0)}%</span>
          </div>
        </ProgressItem>
      )}
    </Card>
  )
}
