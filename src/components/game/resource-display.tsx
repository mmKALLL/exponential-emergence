import type { JSX } from 'react'
import { useUpdate } from '@/hooks/use-update'
import { Game } from '@/lib/gamestate-logic'
import { capitalize } from '@/lib/utils'

export function ResourceDisplay(): JSX.Element {
  const resources = useUpdate(() => Game.resources)

  return (
    <>
      <h2 className="text-lg font-bold">Resources</h2>
      <div className="flex flex-col gap-2 w-full px-4">
        {resources.map(({ name, amount }) => (
          <div key={name} className="flex flex-row justify-between gap-8 w-full">
            <span>{capitalize(name)}:</span> <span>{amount}</span>
          </div>
        ))}
      </div>
    </>
  )
}
