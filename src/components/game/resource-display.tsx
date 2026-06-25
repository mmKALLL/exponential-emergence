import type { JSX } from 'react'
import { useAnchor } from '@/components/animation/use-anchor'
import { useUpdate } from '@/hooks/use-update'
import { useValuePulse } from '@/hooks/use-value-pulse'
import { useResourceDelta } from '@/hooks/use-resource-delta'
import { Game } from '@/lib/gamestate-logic'
import { assertNever, capitalize, formatNumber } from '@/lib/utils'

function ResourceRow({ name, amount }: { name: string; amount: number }): JSX.Element {
  const setAnchor = useAnchor(`res:${name}`)
  const pulse = useValuePulse(amount)
  const delta = useResourceDelta(name)
  return (
    <div ref={setAnchor} className="flex flex-row justify-between gap-8 w-full">
      <span>{name === 'health' ? 'Health (HP)' : capitalize(name)}:</span>
      <span className="relative">
        <span className={pulse}>{formatNumber(amount)}</span>
        {delta && (
          <span
            key={delta.nonce}
            className={`animate-delta-fade pointer-events-none absolute left-full top-1/2 ml-1 whitespace-nowrap text-xs font-semibold ${
              delta.amount > 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {delta.amount > 0 ? '+' : ''}
            {formatNumber(delta.amount)}
          </span>
        )}
      </span>
    </div>
  )
}

export function ResourceDisplay(): JSX.Element {
  const resources = useUpdate(() => Game.resources)
  const currentLevelName = useUpdate(() => Game.currentLevelName)

  return (
    <div className="flex flex-col h-full justify-end">
      <div>
        <h2 className="text-lg font-bold mb-2">Resources</h2>
        <div className="flex flex-col gap-2 w-full px-4">
          {resources.map(({ name, amount }) => (
            <ResourceRow key={name} name={name} amount={amount} />
          ))}
        </div>
      </div>
      {/* Empty divider that takes space, so that the help text is pushed to the bottom of the container */}
      <div className="flex-grow-1"></div>
      <div className="help-text mt-4 self-end justify-end">
        {currentLevelName === 'amoeba' ? (
          <span className="text-sm text-gray-500">
            Being an amoeba is all about converting food into energy. With enough experience, you will be able to evolve.
          </span>
        ) : currentLevelName === 'multicellular' ? (
          <span className="text-sm text-gray-500">
            As a multicellular organism, your production is tied to the number of cells you have. Focus on using your lifespan and energy
            effectively.
          </span>
        ) : currentLevelName === 'algae' ? (
          <span className="text-sm text-gray-500">
            Algae are simple marine plants. Despite being underwater, their energy production is based on the available sunlight. <br />
            Cell synergies can also help.
          </span>
        ) : currentLevelName === 'insect' ? (
          <span className="text-sm text-gray-500">
            Insects form colonies whose efficiency is dependent on their numbers. Your job is to convert food into eggs. Synergies help the
            colony grow much faster.
          </span>
        ) : currentLevelName === 'crustacean' ? (
          <span className="text-sm text-gray-500">
            Crustaceans are hardened organisms, fully capable of navigating a hostile world.
            <br /> Use everything available to overcome the final challenge!
          </span>
        ) : (
          assertNever(currentLevelName)
        )}
      </div>
    </div>
  )
}
