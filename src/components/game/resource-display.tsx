import type { JSX } from 'react'
import { Card } from '../ui/card'
import { useUpdate } from '@/hooks/use-update'
import { Game } from '@/lib/gamestate-logic'
import { capitalize } from '@/lib/utils'
import { Separator } from '../ui/separator'

export function ResourceDisplay(): JSX.Element {
  const resources = useUpdate(() => Game.resources)
  const synergies = useUpdate(() => Game.synergies || [])

  return (
    <Card className="flex flex-col items-center p-4 gap-4 w-52 h-full">
      <h2 className="text-lg font-bold">Resources</h2>
      <div className="flex flex-col gap-2 w-full px-4">
        {resources.map(({ name, amount }) => (
          <div key={name} className="flex flex-row justify-between gap-8 w-full">
            <span>{capitalize(name)}:</span> <span>{amount}</span>
          </div>
        ))}
      </div>

      {synergies.length > 0 && (
        <>
          <Separator />
          <h2 className="text-lg font-bold">Synergies</h2>
          <div className="text-xs">Based on your best scores.</div>
          {synergies.map(({ description, basedOn, record }) => (
            <div key={basedOn.resourceName} className="flex flex-col gap-1 w-full">
              <span>
                {capitalize(basedOn.level)} - {record} {basedOn.resourceName}
              </span>
              <span className="text-xs">{description}</span>
            </div>
          ))}
        </>
      )}
    </Card>
  )
}
