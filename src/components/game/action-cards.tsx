import { useUpdate } from '@/hooks/use-update'
import { Game } from '@/lib/gamestate-logic'
import { ActionCard } from './action-card'

export function ActionCards() {
  const visibleActionCardNames = useUpdate(() => Game.visibleActionCardNames)

  return (
    <div className="flex gap-4 flex-wrap justify-start">
      {visibleActionCardNames.map((actionName) => (
        <ActionCard key={actionName} actionName={actionName} />
      ))}
    </div>
  )
}
