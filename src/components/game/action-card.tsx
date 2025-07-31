import { Button } from '../ui/button'
import { ProgressChart } from '../ui/progress-chart'
import { Progress } from '../ui/progress'
import { Card } from '../ui/card'
import { useGameState } from '@/lib/gamestate-hooks'
import { type JSX } from 'react'
import type { Action, UnlockedDisplaySections } from '@/lib/types'
import { TooltipWrapper } from '../ui/tooltip-button'

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
  const { name, description, baseTime, progress, currentSpeed, permanentSpeed, currentValue, bestValue, valueHistory } = action

  return (
    <Card className="flex flex-col items-center justify-center p-4 gap-4">
      <Progress value={(progress / baseTime) * 100} className="w-40" />
      <TooltipWrapper
        component={
          <Button onClick={onToggle} variant="outline">
            {isActive ? `Stop action (${(baseTime - progress).toFixed(1)})` : `${name}`}
          </Button>
        }
        content={description}
      />
      <Button variant="destructive">Buttons</Button>
      <ProgressChart className="w-40" height={30} />
    </Card>
  )
}
