import { useUpdate } from '@/hooks/use-update'
import { Game } from '@/lib/gamestate-logic'
import { ActionCard } from './action-card'

export function ActionCards() {
  const visibleActionCardNames = useUpdate(() => Game.visibleActionCardNames)

  // Cap cards per row so wide/fullscreen layouts don't form an awkward 4+1:
  // max 3/row for <=6 actions, max 4/row for <=8. Width = cards (w-52 = 208px)
  // plus gaps (gap-4 = 16px); the flex container wraps once it hits the cap.
  const maxCols = visibleActionCardNames.length <= 6 ? 3 : 4
  const maxWidth = maxCols * 208 + (maxCols - 1) * 16

  return (
    <div className="flex gap-4 flex-wrap justify-start mx-auto" style={{ maxWidth }}>
      {visibleActionCardNames.map((actionName, index) => (
        <ActionCard key={actionName} actionName={actionName} index={index + 1} />
      ))}
    </div>
  )
}
