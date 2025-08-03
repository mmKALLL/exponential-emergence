import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Card } from '../ui/card'
import { useEffect, type JSX } from 'react'
import { cn, maxTime } from '@/lib/utils'
import { ActionMiniChart } from './action-mini-chart'
import { useUpdate } from '@/hooks/use-update'
import { canApplyAction, Game } from '@/lib/gamestate-logic'
import { useForceRefresh } from '@/hooks/use-force-refresh'

export function ActionCard({ actionName, index }: { actionName: string; index: number }): JSX.Element {
  // The reason we do this so much is due to performance reasons.
  // 1. We don't want to list the full objects in the parent component to cause all Actions to re-render.
  // 2. useUpdate checks if a value has changed, but doesn't work well with objects.
  //    so we use it only for primitive values. It also handles arrays of primitives well.
  // 3. Game.getActionCard gets called a lot, but it just uses a map lookup,
  //    The map itself is built based on visibleActionCards, which in turn
  //    has caching built in, so it only recomputes every 33ms (max).
  // With this approach, pretty much only cards that re-render is the current one active.
  // TLDR; We do this so there's less re-rendering of cards.
  const name = useUpdate(() => Game.getActionCard(actionName).name)
  const description = useUpdate(() => Game.getActionCard(actionName).description)
  const progress = useUpdate(() => Game.getActionCard(actionName).progress)
  const currentSpeed = useUpdate(() => Game.getActionCard(actionName).currentSpeed)
  const permanentSpeed = useUpdate(() => Game.getActionCard(actionName).permanentSpeed)
  const maxActionTime = useUpdate(() => maxTime(Game.getActionCard(actionName)))
  const gives = useUpdate(() => Game.getActionCard(actionName).gives)
  const takes = useUpdate(() => Game.getActionCard(actionName).takes)
  const valueHistory = useUpdate(() => Game.getActionCard(actionName).valueHistory)
  const bestValueHistory = useUpdate(() => Game.getActionCard(actionName).bestValueHistory)

  const speedsUnlocked = useUpdate(() => Game.state.unlockedDisplaySections.speeds)
  const bestValueUnlocked = useUpdate(() => Game.state.unlockedDisplaySections.bestValue)
  const canToggle = useUpdate(() => canApplyAction(Game.getActionCard(actionName)))

  // Force refresh cards every second so the charts update for inactive actions
  useForceRefresh(1500)

  useEffect(() => {
    Game.addHotkey(actionName, index)
  }, [index, actionName])

  return (
    <Card className="flex flex-col items-center justify-center p-4 pb-2 gap-4 w-52">
      <Progress value={(progress / maxActionTime) * 100} />
      <div className={cn('text-xs flex justify-center flex-wrap gap-2', description && '-mt-2')}>
        {takes?.map((t) => (
          <div key={t} className="text-red-300">
            {t}
          </div>
        ))}
        {gives?.map((g) => (
          <div key={g} className="text-green-300">
            {g}
          </div>
        ))}
      </div>
      <div className="text-xs -mb-2 -mt-3 text-center">{description}</div>
      <Button
        onClick={() => Game.toggleAction(Game.getActionCard(actionName))}
        variant="outline"
        className={cn('w-44', !canToggle && '!bg-red-900 opacity-30')}
      >
        {name} ({(maxActionTime - progress).toFixed(1)})
      </Button>
      {speedsUnlocked && (
        <div className="flex flex-col items-center gap-1">
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
        showLegend={bestValueUnlocked}
        index={index}
      />
    </Card>
  )
}
