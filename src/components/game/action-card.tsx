import { Button } from '../ui/button'
import { ProgressChart } from '../ui/progress-chart'
import { Progress } from '../ui/progress'
import { Card } from '../ui/card'
import { type JSX } from 'react'
import type { Action, UnlockedDisplaySections } from '@/lib/types'
import { TooltipWrapper } from '../ui/tooltip-button'
import { maxTime } from '@/lib/utils'

export function ActionCard({
  action,
  isActive,
  unlockedDisplaySections,
  onToggle,
}: {
  action: Action
  isActive: boolean
  unlockedDisplaySections: UnlockedDisplaySections
  onToggle: () => void
}): JSX.Element {
  const { name, description, progress, currentSpeed, permanentSpeed, valueHistory, bestValueHistory } = action

  return (
    <Card className="flex flex-col items-center justify-center p-4 gap-4 w-52">
      <Progress value={(progress / maxTime(action)) * 100} />
      <TooltipWrapper
        component={
          <Button onClick={onToggle} variant="outline" className="w-44">
            {isActive ? `Stop action` : name} ({(maxTime(action) - progress).toFixed(1)})
          </Button>
        }
        content={description}
      />
      {unlockedDisplaySections.speeds && (
        <>
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
        </>
      )}
      <ProgressChart height={30} />
    </Card>
  )
}
