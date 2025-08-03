import type { JSX } from 'react'
import { useUpdate } from '@/hooks/use-update'
import { Game } from '@/lib/gamestate-logic'
import { assertNever, capitalize, formatNumber } from '@/lib/utils'

export function ResourceDisplay(): JSX.Element {
  const resources = useUpdate(() => Game.resources)
  const currentLevelName = useUpdate(() => Game.currentLevelName)

  return (
    <div className="flex flex-col h-full justify-end">
      <div>
        <h2 className="text-lg font-bold mb-2">Resources</h2>
        <div className="flex flex-col gap-2 w-full px-4">
          {resources.map(({ name, amount }) => (
            <div key={name} className="flex flex-row justify-between gap-8 w-full">
              <span>{name === 'health' ? 'Health (HP)' : capitalize(name)}:</span> <span>{formatNumber(amount)}</span>
            </div>
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
            Insects form colonies whose efficiency is dependent on their numbers. Synergies from earlier stages significantly help support
            your growth.
          </span>
        ) : currentLevelName === 'crustacean' ? (
          <span className="text-sm text-gray-500">
            Crustaceans are hardened organisms capable of navigating a hostile world.
            <br /> Use everything available to overcome the final challenge!
          </span>
        ) : (
          assertNever(currentLevelName)
        )}
      </div>
    </div>
  )
}
