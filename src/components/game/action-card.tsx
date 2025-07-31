import { Button } from '../ui/button'
import { ProgressChart } from '../ui/progress-chart'
import { Progress } from '../ui/progress'
import { Card } from '../ui/card'
import { useGameState } from '@/lib/gamestate-hooks'
import { useEffect, useState, type JSX } from 'react'
import type { Action, UnlockedDisplaySections } from '@/lib/types'

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
  const { name, baseTime, progress, currentSpeed, permanentSpeed, currentValue, bestValue, valueHistory } = action
  const { gs } = useGameState()

  return (
    <Card className="flex flex-col items-center justify-center p-4 gap-4">
      <Progress value={progress} className="w-40" />
      <Button onClick={onToggle} variant="outline">
        {isActive ? `Stop action (${baseTime - progress})` : `${name} (${baseTime})`}
      </Button>
      <Button variant="destructive">Buttons</Button>
      <ProgressChart className="w-40" height={30} />
    </Card>
  )
}
