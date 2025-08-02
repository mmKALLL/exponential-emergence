import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Card } from '../ui/card'
import type { JSX } from 'react'
import type { Action } from '@/lib/types'
import { TooltipWrapper } from '../ui/tooltip-button'
import { cn, maxTime } from '@/lib/utils'
import { ActionMiniChart } from './action-mini-chart'
import { useUpdate } from '@/hooks/use-update'
import { canApplyAction, Game } from '@/lib/gamestate-logic'

export function ActionCard({ action }: { action: Action }): JSX.Element {
  const { name, description, progress, currentSpeed, permanentSpeed, valueHistory, bestValueHistory } = action

  const { unlockedDisplaySections } = useUpdate(() => Game.state)
  const canToggle = useUpdate(() => canApplyAction(action))

  return (
    <Card className="flex flex-col items-center justify-center p-4 gap-4 w-52">
      <Progress value={(progress / maxTime(action)) * 100} />
      <TooltipWrapper
        component={
          <Button
            onClick={() => Game.toggleAction(action)}
            variant="outline"
            className={cn('w-44', !canToggle && '!bg-red-900 opacity-30')}
          >
            {name} ({(maxTime(action) - progress).toFixed(1)})
          </Button>
        }
        content={description}
      />
      {unlockedDisplaySections.speeds && (
        <div className="flex flex-col items-center gap-2">
          <div className="flex place-content-between w-42">
            <div className="text-sm">Current life speed:</div>
            <div className="text-sm">{currentSpeed.toFixed(2)}x</div>
          </div>
          <div className="flex place-content-between w-42">
            <div className="text-sm">Permanent speed:</div>
            <div className="text-sm">{permanentSpeed.toFixed(2)}x</div>
          </div>
        </div>
      )}
      <ActionMiniChart
        height={30}
        valueHistory={valueHistory}
        bestValueHistory={bestValueHistory}
        showLegend={unlockedDisplaySections.bestValue}
      />
    </Card>
  )
}
